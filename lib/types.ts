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

export type ElementDrain = BaseDrain<Abstract.ElementField>;

export type StructureDrain = BaseDrain<Abstract.StructureField>;

export type CollectionDrain = BaseDrain<Abstract.Collection> & {
  push: (item: Abstract.Data) => Abstract.Outlet;
};

export type Drain =
  | ConditionDrain
  | CountDrain
  | TextDrain
  | ElementDrain
  | StructureDrain
  | CollectionDrain;

export type Sink = Abstract.Data | Drain | Abstract.Conditional;

export type Faucet = {
  _stream: Abstract.Stream;
};

export type Properties = Record<string, Sink | Faucet | Abstract.Outlet>;

export function isDrain(node: unknown): node is Drain {
  return typeof node === "object" && node !== null && "_field" in node;
}

export function isFaucet(node: unknown): node is Faucet {
  return typeof node === "object" && node !== null && "_stream" in node;
}
