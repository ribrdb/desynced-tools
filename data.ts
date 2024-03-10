import data from "./scripts/dumped-game-data.json";
import overrides from "./scripts/game-data-overrides.json";

const allById: Map<string, GameData> = new Map();
const allByJsName: Map<string, GameData> = new Map();

type Element = { id: string, base_id?: string, jsName: string };

function load<S, O>(
  data: Record<string, S>,
  overrides: Record<string, O>,
): Map<string, S & O & Element>
function load<S, T, O>(
    data: Record<string, S>,
    overrides: Record<string, O>,
    mapper: (item: (S & Element)) => (T & Element)
): Map<string, T & O & Element>
function load<S, T, O>(
    data: Record<string, S>,
    overrides: Record<string, O> = {},
    mapper?: (item: (S & Element)) => (T & Element)
): Map<string, T & O & Element>{
  const dataWithId: Map<string, S & { id: string }> = new Map();
  for (const id in data) {
    dataWithId.set(id, {
      ...data[id],
      id
    });
  }

  const loaded: Map<string, Element> = new Map();

  for (const id of dataWithId.keys()) {
    const item = (() => {
      let merged: Partial<Element> = dataWithId.get(id)!;

      while ('base_id' in merged) {
        let {base_id, ...rest} = merged;
        const base = base_id != null ? dataWithId.get(base_id) : undefined;

        merged = {
          ...base,
          ...rest,
          base_id
        }

        if (merged.base_id === merged.id || merged.base_id === base?.id) {
          delete merged.base_id;
        }
      }

      if (!merged.jsName) {
        merged.jsName = merged.id;
      }

      merged = mapper ? mapper(merged as (S & Element)) : merged;

      merged = {
        ...merged,
        ...overrides[id]
      };

      return merged as Element;
    })();

    if (allById.has(item.id)) {
      throw new Error("Duplicate item id: " + item.id);
    }

    allById.set(item.id, item);
    loaded.set(item.id, item);

    if (allByJsName.has(item.jsName)) {
      throw new Error(`Duplicate jsName: ${item.jsName} (${item.id})`);
    }

    allByJsName.set(item.jsName, item);
  }

  return loaded as Map<string, T & O & Element>;
}

function indexBy<T, K extends keyof T & string>(map: Map<string, T>, key: K): Map<T[K], T> {
  const result: Map<T[K], T> = new Map();
  for (const value of map.values()) {
    if (result.has(value[key])) {
      throw new Error(`Duplicate indexBy key ${key}: ${value[key]} (${value['id']}/${result.get(value[key])!['id']})`);
    }

    result.set(value[key], value);
  }

  return result;
}

type MapValue<T> = T extends Map<any, infer K> ? K : never;

export function toJsFunctionName(name: string) {
  return name
      .replace(/^[a-z]_/, '')
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/ +/g, " ")
      .toLowerCase()
      .replace(/[0-9][a-z]/g, s => s.toUpperCase())
      .replace(/([0-9a-z]) ([a-z])/g, (s, a, b) => a + b.toUpperCase())
      .replace(/([A-Z]) ([a-z])/g, "$1$2")
      .replace(/([0-9]) ([0-9])/g, "$1_$2")
      .replace(/[0-9]X[0-9]/g, s => s.toLowerCase())
      .replace(/ ([0-9])/g, "$1")
      .trim()
      .replace(/ /g, '_');
}

const components = load(data["components"] as Record<string, {
  name: string
  attachment_size?: string;
  registers?: Array<{
    type?: string,
    tip?: string,
    read_only?: boolean,
    filter?: string,
  }>
  slots?: Record<string, number>,
}>, overrides["components"], component => ({
  ...component,
  componentJsName: toJsFunctionName(component.name)
}));

export type Component = MapValue<(typeof components)>;

const frames = load(data["frames"] as Record<string, {
  name?: string;
  desc?: string,
  type?: string;
  flags?: string;
  size?: string;
  visual?: string;
  slots?: Record<string, number>,
  start_disconnected?: boolean,
}>, overrides["frames"], frame => ({
  ...frame,
  frameJsName: toJsFunctionName(frame.name ?? frame.jsName)
}));

export type Frame = MapValue<(typeof frames)>;

const items = load(data["items"] as Record<string, {
  name?: string;
  visual?: string;
  slot_type?: string;
  tag?: string;
  stack_size?: number;
}>, overrides["items"]);

export type Item = MapValue<(typeof items)>;

const values = load(data["values"] as Record<string, {
  name?: string;
  tag?: string;
}>, overrides["values"]);

export type GameValue = MapValue<(typeof values)>;

const socketSizes = {
  Internal: 0,
  Small: 1,
  Medium: 2,
  Large: 3,
} as const;

export type SocketSize = keyof typeof socketSizes;

const visuals = load(data["visuals"] as Record<string, {
  name?: string,
  flags?: string,
  tile_size?: number[],
  sockets?: string[][]
}>, overrides["visuals"]);

export type Visual = MapValue<(typeof visuals)>;

export type GameData = Component | Frame | Item | GameValue | Visual;

export const gameData = {
  components,
  componentsByJsName: indexBy(components, "componentJsName"),
  frames,
  framesByJsName: indexBy(frames, "frameJsName"),
  items,
  values,
  visuals,
  socketSizes,
  instructions: data["instructions"],
  get: (id: string) => {
    return allByJsName.get(id) ?? allById.get(id)
  }
}
