import { Construct } from 'constructs';
import { CfnRoute, CfnRouteTable } from './ec2.generated';
import { IRouteTable, IVpc } from './vpc';
import { Resource } from '../../core';
import { CidrBlock } from './network-util';
import { AddressFamily } from './prefix-list';

export interface IRoute {
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

export abstract class Route {
  public static to(entry: RouteEntry): IRouteFactory {
    return new GenericRouteFactory(entry.destination, entry.target);
  }
}

export interface RouteConfiguration {
  readonly routeTable: IRouteTable;
  readonly vpc: IVpc;
}

export interface IRouteFactory {
  bind(scope: Construct, id: string, config: RouteConfiguration): IRoute;
}

class GenericRouteFactory implements IRouteFactory {
  constructor(private readonly destination: string, private readonly target: IRouter) {}

  public bind(scope: Construct, id: string, config: RouteConfiguration): IRoute {
    return new GenericRoute(scope, id, {
      ...config,
      destination: this.destination,
      target: this.target,
      vpc: config.vpc,
    });
  }
}

interface RouteProps extends RouteConfiguration {
  readonly destination: string;
  readonly target: IRouter;
}

// TODO Remove the export
export class GenericRoute extends Resource implements IRoute {
  constructor(scope: Construct, id: string, props: RouteProps) {
    super(scope, id);
    const { destination, target, routeTable, vpc } = props;

    const addressFamily = CidrBlock.addressFamily(destination);

    const dest: DestinationConfiguration = addressFamily === AddressFamily.IP_V4
      ? { destinationCidrBlock: destination }
      : { destinationIpv6CidrBlock: destination };

    const routerConfig = target.bind({ routeTable, vpc });

    new CfnRoute(this, 'Resource', {
      routeTableId: routeTable.routeTableId,
      ...dest,
      ...routerConfig,
    });
  }
}

// TODO Maybe move this class to private/
export interface RouteTableProps {
  readonly vpc: IVpc;
  readonly routes: IRouteFactory[];
}

export interface RouteTableOptions {
  readonly routes: IRouteFactory[];
}

export class RouteTable extends Resource implements IRouteTable {
  public readonly routeTableId: string;
  public readonly routes: IRoute[];
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string, props: RouteTableProps) {
    super(scope, id);
    this.vpc = props.vpc;
    const resource = new CfnRouteTable(this, 'Resource', {
      vpcId: props.vpc.vpcId,
    });
    this.routeTableId = resource.ref;
    this.routes = props.routes.map((route, idx) => route.bind(this, `route${idx}`, {
      routeTable: this,
      vpc: this.vpc,
    }));
  }
}

