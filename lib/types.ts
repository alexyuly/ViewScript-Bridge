import * as Abstract from "viewscript-runtime";

export type Handle<T extends Abstract.Field = Abstract.Field> = {
  _field: T;
};

export type ConditionHandle = Handle<Abstract.Condition> & {
  disable: Abstract.Output;
  enable: Abstract.Output;
  toggle: Abstract.Output;
};

export type CountHandle = Handle<Abstract.Count> & {
  add: (amount: number) => Abstract.Output;
};

export type TextHandle = Handle<Abstract.Text>;

export type ElementHandle = Handle<Abstract.ElementField>;

export type CollectionHandle = Handle<Abstract.Collection>;

export type Primitive = boolean | number | string | Element | Array<unknown>;

export type InputValue = Primitive | Handle | Abstract.Conditional;

export type Properties = Record<string, InputValue | Abstract.Output>;

export function isHandle(node: unknown): node is Handle {
  return typeof node === "object" && node !== null && "_field" in node;
}

export function isPrimitive(value: InputValue): value is Primitive {
  return (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    Abstract.isElement(value) ||
    value instanceof Array
  );
}
