import { Construct } from 'constructs';
import { CfnRoute, CfnRouteTable, CfnVPCEndpoint } from './ec2.generated';
import { IRouteTable, IVpc } from './vpc';
import { Lazy, Resource } from '../../core';
import { CidrBlock } from './network-util';
import { AddressFamily } from './prefix-list';
import { IGatewayVpcEndpointService, VpcEndpointType } from './vpc-endpoint';

export interface IRoute {
  bind(scope: Construct, id: string, options: RouterOptions): void;
}

interface RouterOptions {
  readonly routeTable: IRouteTable;
  readonly vpc: IVpc;
}

export interface IRouter {
  bind(options: RouterOptions): RouterConfiguration;
}

export abstract class Router {
  public static INTERNET_GATEWAY = new class implements IRouter {
    bind(_options: RouterOptions): RouterConfiguration {
      // TODO Add an internetGatewayId to IVpc, so that we can do:
      //  return { gatewayId: options.vpc.internetGatewayId };
      return {
        gatewayId: 'TODO',
      };
    }
  }
}

export interface RouteEntry {
  destination: string;

  target: IRouter;
}

interface DestinationConfiguration {
  /**
   * The IPv4 CIDR block used for the destination match.
   */
  readonly destinationCidrBlock?: string;

  /**
   * The IPv6 CIDR block used for the destination match.
   */
  readonly destinationIpv6CidrBlock?: string;
}

interface RouterConfiguration {
  /**
   * The ID of the carrier gateway.
   */
  readonly carrierGatewayId?: string;

  /**
   * The ID of the egress-only internet gateway.
   */
  readonly egressOnlyInternetGatewayId?: string;

  /**
   * The ID of an internet gateway or virtual private gateway attached to your VPC.
   */
  readonly gatewayId?: string;

  /**
   * The ID of a NAT instance in your VPC.
   */
  readonly instanceId?: string;

  /**
   * The ID of the local gateway.
   */
  readonly localGatewayId?: string;

  /**
   * The ID of a NAT gateway.
   */
  readonly natGatewayId?: string;

  /**
   * The ID of the network interface.
   */
  readonly networkInterfaceId?: string;

  /**
   * The ID of a transit gateway.
   */
  readonly transitGatewayId?: string;

  /**
   * The ID of a VPC endpoint. Supported for Gateway Load Balancer endpoints only.
   */
  readonly vpcEndpointId?: string;

  /**
   * The ID of a VPC peering connection.
   */
  readonly vpcPeeringConnectionId?: string;
}

export abstract class Route implements IRoute {
  public static to(entry: RouteEntry): IRoute {
    return new GenericRoute(entry.destination, entry.target);
  }

  public static toGatewayEndpoint(service: IGatewayVpcEndpointService): IRoute {
    return new VpcEndpointRoute(service);
  }

  public abstract bind(scope: Construct, id: string, options: RouterOptions): void;
}

class VpcEndpointRoute extends Route {
  constructor(private readonly service: IGatewayVpcEndpointService) {
    super();
  }

  public bind(scope: Construct, id: string, options: RouterOptions) {
    // TODO Probably a good idea to have a cache here to make sure the construct
    //  is instantiated at most once per id.
    new CfnVPCEndpoint(scope, id, {
      policyDocument: Lazy.any({ produce: () => undefined }),
      routeTableIds: [options.routeTable.routeTableId],
      serviceName: this.service.name,
      vpcEndpointType: VpcEndpointType.GATEWAY,
      vpcId: options.vpc.vpcId,
    });
  }
}

class GenericRoute extends Route {
  constructor(private readonly destination: string, private readonly target: IRouter) {
    super();
  }

  public bind(scope: Construct, id: string, options: RouterOptions) {
    const addressFamily = CidrBlock.addressFamily(this.destination);

    const destination: DestinationConfiguration = addressFamily === AddressFamily.IP_V4
      ? { destinationCidrBlock: this.destination }
      : { destinationIpv6CidrBlock: this.destination };

    new CfnRoute(scope, id, {
      routeTableId: options.routeTable.routeTableId,
      ...destination,
      ...this.target.bind(options),
    });
  }

}

export interface RouteConfiguration {
  readonly routeTable: IRouteTable;
  readonly vpc: IVpc;
}

// TODO Maybe move this class to private/
export interface RouteTableProps {
  readonly vpc: IVpc;
  readonly routes: IRoute[];
}

export interface RouteTableOptions {
  readonly routes: IRoute[];
}

export class RouteTable extends Resource implements IRouteTable {
  public readonly routeTableId: string;
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string, props: RouteTableProps) {
    super(scope, id);
    this.vpc = props.vpc;

    const resource = new CfnRouteTable(this, 'Resource', {
      vpcId: props.vpc.vpcId,
    });
    this.routeTableId = resource.ref;

    props.routes.forEach((route, idx) => route.bind(this, `route${idx}`, {
      routeTable: this,
      vpc: this.vpc,
    }));
  }
}

