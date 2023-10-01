import type {
  Condition,
  Conditional,
  Count,
  Element,
  ElementField,
  Field,
  Output,
  Reference,
  Text,
} from "viewscript-runtime";

export type Boxed<T extends Field = Field> = {
  _field: T;
};

export type BoxedCondition = Boxed<Condition> & {
  disable: Output;
  enable: Output;
  toggle: Output;
};

export type BoxedCount = Boxed<Count> & {
  add: (amount: number) => Output;
};

export type BoxedText = Boxed<Text>;

export type BoxedElement = Boxed<ElementField>;

export type UnwrappedInput =
  | boolean
  | number
  | string
  | Element
  | Boxed
  | Conditional;

export type Properties = Record<string, UnwrappedInput | Output>;
