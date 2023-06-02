import { Construct } from 'constructs';
import { CfnRoute, CfnRouteTable } from './ec2.generated';
import { IRouteTable, IVpc } from './vpc';
import { Resource } from '../../core';
import { CidrBlock } from './network-util';
import { AddressFamily } from './prefix-list';
import { GatewayVpcEndpoint } from './vpc-endpoint';

export interface IRoute {
  bind(options: RouterOptions): RouteConfig;
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

interface RouteConfig extends RouterConfiguration, DestinationConfiguration {
}

export class Route implements IRoute {
  public static to(entry: RouteEntry): IRoute {
    return new Route(entry.destination, entry.target);
  }

  public static toGatewayEndpoint(endpoint: GatewayVpcEndpoint): IRoute {
    const target = new class implements IRouter {
      bind(_: RouterOptions): RouterConfiguration {
        return { vpcEndpointId: endpoint.vpcEndpointId };
      }
    };

    return new Route(entry.destination, target);
  }

  constructor(public readonly destination: string, public target: IRouter) {}

  public bind(options: RouterOptions): RouteConfig {
    const addressFamily = CidrBlock.addressFamily(this.destination);

    const destination: DestinationConfiguration = addressFamily === AddressFamily.IP_V4
      ? { destinationCidrBlock: this.destination }
      : { destinationIpv6CidrBlock: this.destination };

    return {
      ...destination,
      ...this.target.bind(options),
    };
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

    props.routes.map(route => route.bind({
      routeTable: this,
      vpc: this.vpc,
    })).map((config, idx) => new CfnRoute(this, `route${idx}`, {
      routeTableId: resource.ref,
      ...config,
    }));
  }
}

