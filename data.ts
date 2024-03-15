import data from "./scripts/dumped-game-data.json";

const allById: Record<string, GameData> = {};

type Source = { name?: string };
type Element = Source & { id: string };

function load<S extends Source>(
  data: Record<string, S>,
): Record<string, S & Element> {
  const loaded: Record<string, S & Element> = {};

  for (const id in data) {
    const item = {
      ...data[id],
      id,
    };

    loaded[id] = item;

    if (item.id in allById) {
      throw new Error("Duplicate item id: " + item.id);
    }

    allById[item.id] = item;
  }

  return loaded;
}

const components = load<{
  name?: string
  attachment_size?: string;
}>(data["components"]);

export type Component = NonNullable<(typeof components)[number]>;

const frames = load<{
  name?: string;
  type?: string;
  flags?: string;
  size?: string;
  visual?: string;
  slots?: Record<string, number>
}>(data["frames"]);

export type Frame = NonNullable<(typeof frames)[number]>;

const items = load<{
  name?: string;
  visual?: string;
  slot_type?: string;
  tag?: string;
  stack_size?: number;
}>(data["items"]);

export type Item = NonNullable<(typeof items)[number]>;

const values = load<{
  name?: string;
  tag?: string;
}>(data["values"]);

const instructions = data["instructions"];

export type GameValue = NonNullable<(typeof values)[number]>;

export type GameData = Component | Frame | Item | GameValue;

export const gameData = {
  components,
  frames,
  items,
  values,
  instructions
}

export function getDataById(id: string): GameData {
  return allById[id];
}
