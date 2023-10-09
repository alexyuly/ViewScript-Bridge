import { Abstract } from "viewscript-runtime";

export type Faucet = {
  _output: Abstract.Stream | Abstract.Output;
};

export type BaseDrain<T extends Abstract.Field = Abstract.Field> = {
  _input: T;
  reset: Faucet;
  setTo: (nextValue: NonNullable<T["value"]>) => Faucet;
};

export type ConditionDrain = BaseDrain<Abstract.Condition> & {
  disable: Faucet;
  enable: Faucet;
  toggle: Faucet;
};

export type CountDrain = BaseDrain<Abstract.Count> & {
  add: (amount: number) => Faucet;
  multiplyBy: (amount: number) => Faucet;
};

export type TextDrain = BaseDrain<Abstract.Text>;

export type ElementDrain = BaseDrain<Abstract.ElementField>;

export type StructureDrain = BaseDrain<Abstract.StructureField>;

export type CollectionDrain = BaseDrain<Abstract.Collection> & {
  push: (item: Abstract.Data) => Faucet;
};

export type Drain =
  | ConditionDrain
  | CountDrain
  | TextDrain
  | ElementDrain
  | StructureDrain
  | CollectionDrain;

export type Sink = Abstract.Data | Drain | Abstract.Conditional;

export type Properties = Record<string, Sink | Faucet>;

export function isDrain(node: unknown): node is Drain {
  return typeof node === "object" && node !== null && "_input" in node;
}

export function isFaucet(node: unknown): node is Faucet {
  return typeof node === "object" && node !== null && "_output" in node;
}
