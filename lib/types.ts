import * as Abstract from "viewscript-runtime";

export type BaseHandle<T extends Abstract.Field = Abstract.Field> = {
  _field: T;
  reset: Abstract.Output;
  setTo: (nextValue: NonNullable<T["value"]>) => Abstract.Output;
};

export type ConditionHandle = BaseHandle<Abstract.Condition> & {
  disable: Abstract.Output;
  enable: Abstract.Output;
  toggle: Abstract.Output;
};

export type CountHandle = BaseHandle<Abstract.Count> & {
  add: (amount: number) => Abstract.Output;
  multiplyBy: (amount: number) => Abstract.Output;
};

export type TextHandle = BaseHandle<Abstract.Text>;

export type ElementHandle = BaseHandle<Abstract.ElementField>;

export type StructureHandle = BaseHandle<Abstract.StructureField>;

export type CollectionHandle = BaseHandle<Abstract.Collection> & {
  push: (item: Abstract.Data) => Abstract.Output;
};

export type Handle =
  | ConditionHandle
  | CountHandle
  | TextHandle
  | ElementHandle
  | StructureHandle
  | CollectionHandle;

export type InputValue = Abstract.Data | Handle | Abstract.Conditional;

export type Properties = Record<string, InputValue | Abstract.Output>;

export function isHandle(node: unknown): node is Handle {
  return typeof node === "object" && node !== null && "_field" in node;
}
