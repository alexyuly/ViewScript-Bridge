import { Abstract } from "viewscript-runtime";

export type BaseHandle<T extends Abstract.Field = Abstract.Field> = {
  _field: T;
  reset: Abstract.Outlet;
  setTo: (nextValue: NonNullable<T["value"]>) => Abstract.Outlet;
};

export type ConditionHandle = BaseHandle<Abstract.Condition> & {
  disable: Abstract.Outlet;
  enable: Abstract.Outlet;
  toggle: Abstract.Outlet;
};

export type CountHandle = BaseHandle<Abstract.Count> & {
  add: (amount: number) => Abstract.Outlet;
  multiplyBy: (amount: number) => Abstract.Outlet;
};

export type TextHandle = BaseHandle<Abstract.Text>;

export type ElementHandle = BaseHandle<Abstract.ElementField>;

export type StructureHandle = BaseHandle<Abstract.StructureField>;

export type CollectionHandle = BaseHandle<Abstract.Collection> & {
  push: (item: Abstract.Data) => Abstract.Outlet;
};

export type Handle =
  | ConditionHandle
  | CountHandle
  | TextHandle
  | ElementHandle
  | StructureHandle
  | CollectionHandle;

export type InletValue = Abstract.Data | Handle | Abstract.Conditional;

export type Properties = Record<string, InletValue | Abstract.Outlet>;

export function isHandle(node: unknown): node is Handle {
  return typeof node === "object" && node !== null && "_field" in node;
}
