import type {
  Condition,
  Conditional,
  Field,
  Output,
  Reference,
  Text,
} from "viewscript-runtime";

export type Boxed<T extends Field = Field> = {
  field: T;
};

export type BoxedCondition = {
  field: Condition;
  disable: () => Output;
  enable: () => Output;
  toggle: () => Output;
};

export type BoxedText = {
  field: Text;
};

export type InputPropertyValue = boolean | string | Reference | Conditional;

export type PropertyValue = InputPropertyValue | Output;

export type Properties = Record<string, PropertyValue>;
