import { Abstract } from "viewscript-runtime";

export type BaseDrain<T extends Abstract.Field = Abstract.Field> = {
  _field: T;
  reset: Abstract.Outlet;
  setTo: (nextValue: NonNullable<T["value"]>) => Abstract.Outlet;
};

export type BooleanDrain = BaseDrain<Abstract.BooleanField> & {
  disable: Abstract.Outlet;
  enable: Abstract.Outlet;
  toggle: Abstract.Outlet;
};

export type NumberDrain = BaseDrain<Abstract.NumberField> & {
  add: (amount: number) => Abstract.Outlet;
  multiplyBy: (amount: number) => Abstract.Outlet;
};

export type StringDrain = BaseDrain<Abstract.StringField>;

export type StructureDrain = BaseDrain<Abstract.StructureField>;

export type ElementDrain = BaseDrain<Abstract.ElementField>;

export type ArrayDrain = BaseDrain<Abstract.ArrayField> & {
  push: (item: Abstract.Data) => Abstract.Outlet;
};

export type Drain =
  | BooleanDrain
  | NumberDrain
  | StringDrain
  | StructureDrain
  | ElementDrain
  | ArrayDrain;

export type Sink = Abstract.Data | Abstract.Conditional | Drain;

export type Faucet<T extends Abstract.Stream = Abstract.Stream> = {
  _stream: T;
};

export type Source = Faucet | Abstract.Outlet;

export type ViewTerrain = Record<string, Drain | Faucet>;

export type ElementProperties<Features extends ViewTerrain = ViewTerrain> = {
  [Key in keyof Features]: Features[Key] extends Faucet
    ? Source
    : Source | Abstract.Data | Abstract.Conditional | Features[Key];
};

export type ElementReducer<T extends ViewTerrain = ViewTerrain> = (
  props?: ElementProperties<T>
) => Abstract.Element;

export function isDrain(node: unknown): node is Drain {
  return typeof node === "object" && node !== null && "_field" in node;
}

export function isFaucet(node: unknown): node is Faucet {
  return typeof node === "object" && node !== null && "_stream" in node;
}
