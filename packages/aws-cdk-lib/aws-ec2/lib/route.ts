import { Construct } from 'constructs';
import { CfnRoute, CfnRouteTable } from './ec2.generated';
import { IRouteTable, IVpc } from './vpc';
import { Resource } from '../../core';
import { CidrBlock } from './network-util';
import { AddressFamily } from './prefix-list';

export interface IRouteFactory {
  createRoute(routeTable: IRouteTable): IRoute;
}

export interface IRoute {
}

interface RouterOptions {
  readonly routeTable: IRouteTable;
}

export interface IRouter {
  bind(options: RouterOptions): RouterConfiguration;
}

export abstract class Router {

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

interface RouteConfiguration {
  destinationConfig: DestinationConfiguration;
  targetConfig: RouterConfiguration;
}

export abstract class Route {
  public static to(entry: RouteEntry): IRouteFactory {
    return new class implements IRouteFactory {
      createRoute(routeTable: IRouteTable): IRoute {
        return new GenericRoute(routeTable, 'asdas', {
          entry,
          routeTable,
        });
      }
    };
  }

  abstract bind(options: RouteBindingOptions): void;
}

export interface RouteBindingOptions {
  vpc: IVpc;
}

interface GenericRouteProps {
  readonly entry: RouteEntry;
  readonly routeTable: IRouteTable;
}

// TODO Remove the export
export class GenericRoute extends Resource implements IRoute {
  constructor(scope: Construct, id: string, props: GenericRouteProps) {
    super(scope, id);
    const { destination, target } = props.entry;
    const routeTable = props.routeTable;

    const addressFamily = CidrBlock.addressFamily(destination);

    const dest: DestinationConfiguration = addressFamily === AddressFamily.IP_V4
      ? { destinationCidrBlock: destination }
      : { destinationIpv6CidrBlock: destination };

    const routerConfig = target.bind({ routeTable });

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
  readonly routes: Route[];
}

export class RouteTable extends Resource implements IRouteTable {
  public readonly routeTableId: string;

  constructor(scope: Construct, id: string, props: RouteTableProps) {
    super(scope, id);

    const resource = new CfnRouteTable(this, 'Resource', {
      vpcId: props.vpc.vpcId,
    });
    this.routeTableId = resource.ref;

    props.routes.map(route => new CfnRoute(this, 'route', {
      routeTableId: this.routeTableId,
      ...route.bind(),
    }));
  }
}

