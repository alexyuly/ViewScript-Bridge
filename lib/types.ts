import type {
  Condition,
  Conditional,
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

export type BoxedCondition = {
  _field: Condition;
  disable: Output;
  enable: Output;
  toggle: Output;
};

export type BoxedElement = {
  _field: ElementField;
};

export type BoxedText = {
  _field: Text;
};

export type Properties = Record<string, UnwrappedInput | Output>;

export type UnwrappedInput =
  | boolean
  | string
  | Element
  | Reference
  | Conditional;
