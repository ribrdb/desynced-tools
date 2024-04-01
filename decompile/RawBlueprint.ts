import { RawBehavior } from "./RawBehavior";

export interface RawBlueprint {
  frame: string;
  name?: string;
  powered_down?: boolean;
  disconnected?: boolean;
  logistics?: {
    carrier?: boolean;
    supplier?: boolean;
    requester?: boolean;
    high_priority?: boolean;
    crane_only?: boolean;
    can_construction?: boolean;
    transport_route?: boolean;
    channel_1?: boolean;
    channel_2?: boolean;
    channel_3?: boolean;
    channel_4?: boolean;
  };
  regs?: Record<
    number,
    { id?: string; num?: number; coord?: { x: number; y: number } }
  >;
  locks?: (string | boolean)[];
  links?: [number, number][];
  components?: [type: string, slot: number, code?: RawBehavior][];
}
