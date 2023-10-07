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
};

export type TextHandle = BaseHandle<Abstract.Text>;

export type ElementHandle = BaseHandle<Abstract.ElementField>;

export type CollectionHandle = BaseHandle<Abstract.Collection>;

export type StructureHandle = BaseHandle<Abstract.Structure>;

export type Handle =
  | ConditionHandle
  | CountHandle
  | TextHandle
  | ElementHandle
  | CollectionHandle
  | StructureHandle;

export type BoxedStructure = { _structure: object };

export type Primitive =
  | boolean
  | number
  | string
  | Abstract.Element
  | Array<unknown>
  | BoxedStructure;

export type InputValue = Primitive | Handle | Abstract.Conditional;

export type Properties = Record<string, InputValue | Abstract.Output>;

export function isBoxedStructure(node: unknown): node is BoxedStructure {
  return typeof node === "object" && node !== null && "_structure" in node;
}

export function isHandle(node: unknown): node is Handle {
  return typeof node === "object" && node !== null && "_field" in node;
}

export function isPrimitive(value: InputValue): value is Primitive {
  return (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    Abstract.isElement(value) ||
    value instanceof Array ||
    isBoxedStructure(value)
  );
}
