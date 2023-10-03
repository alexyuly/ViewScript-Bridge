import type {
  Collection,
  Condition,
  Conditional,
  Count,
  Element,
  ElementField,
  Field,
  Output,
  Text,
} from "viewscript-runtime";

export type Handle<T extends Field = Field> = {
  _field: T;
};

export type ConditionHandle = Handle<Condition> & {
  disable: Output;
  enable: Output;
  toggle: Output;
};

export type CountHandle = Handle<Count> & {
  add: (amount: number) => Output;
};

export type TextHandle = Handle<Text>;

export type ElementHandle = Handle<ElementField>;

export type CollectionHandle = Handle<Collection>;

export type Primitive = boolean | number | string | Element | Array<unknown>;

export type UnwrappedInput = Primitive | Handle | Conditional;

export type Properties = Record<string, UnwrappedInput | Output>;

export function isHandle(node: unknown): node is Handle {
  return typeof node === "object" && node !== null && "_field" in node;
}
