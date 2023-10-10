import { Abstract } from "viewscript-runtime";

export type BaseDrain<T extends Abstract.Field = Abstract.Field> = {
  _field: T;
  reset: Abstract.Outlet;
  setTo: (nextValue: NonNullable<T["value"]>) => Abstract.Outlet;
};

export type ConditionDrain = BaseDrain<Abstract.Condition> & {
  disable: Abstract.Outlet;
  enable: Abstract.Outlet;
  toggle: Abstract.Outlet;
};

export type CountDrain = BaseDrain<Abstract.Count> & {
  add: (amount: number) => Abstract.Outlet;
  multiplyBy: (amount: number) => Abstract.Outlet;
};

export type TextDrain = BaseDrain<Abstract.Text>;

export type StructureDrain = BaseDrain<Abstract.StructureField>;

export type ElementDrain = BaseDrain<Abstract.ElementField>;

export type CollectionDrain = BaseDrain<Abstract.Collection> & {
  push: (item: Abstract.Data) => Abstract.Outlet;
};

export type Drain =
  | ConditionDrain
  | CountDrain
  | TextDrain
  | StructureDrain
  | ElementDrain
  | CollectionDrain;

export type DrainByKey<ModelKey extends string = string> =
  ModelKey extends "Condition"
    ? ConditionDrain
    : ModelKey extends "Count"
    ? CountDrain
    : ModelKey extends "Text"
    ? TextDrain
    : ModelKey extends "Structure"
    ? StructureDrain
    : ModelKey extends "Element"
    ? ElementDrain
    : ModelKey extends "Collection"
    ? CollectionDrain
    : Drain;

type DataByKey<ModelKey extends string = string> = ModelKey extends "Condition"
  ? boolean
  : ModelKey extends "Count"
  ? number
  : ModelKey extends "Text"
  ? string
  : ModelKey extends "Structure"
  ? Abstract.Structure
  : ModelKey extends "Element"
  ? Abstract.Element
  : ModelKey extends "Collection"
  ? Array<Abstract.Data>
  : Abstract.Data;

export type Sink<ModelKey extends string = string> =
  | DataByKey<ModelKey>
  | Abstract.Conditional<ModelKey>
  | DrainByKey<ModelKey>;

export type Faucet<T extends Abstract.Stream = Abstract.Stream> = {
  _stream: T;
};

export type Source = Faucet | Abstract.Outlet;

export type ElementProperties<T extends string | Abstract.View> =
  T extends string
    ? Record<string, Sink | Source> // TODO improve this type
    : T extends Abstract.View
    ? Record<string, Sink | Source> // TODO improve this type
    : never;

export type ViewTerrain = Record<string, Drain | Faucet>;

export function isDrain(node: unknown): node is Drain {
  return typeof node === "object" && node !== null && "_field" in node;
}

export function isFaucet(node: unknown): node is Faucet {
  return typeof node === "object" && node !== null && "_stream" in node;
}
