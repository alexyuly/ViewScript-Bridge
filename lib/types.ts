import { Abstract } from "viewscript-runtime";

export type Field<T extends Abstract.Field = Abstract.Field> = T & {
  (): Abstract.FieldReference;
  // actions:
  reset: Abstract.ActionReference;
  setTo: (argument: Abstract.DataSource) => Abstract.ActionReference;
};

export type BooleanField = Field<Abstract.BooleanField> & {
  // actions:
  disable: Abstract.ActionReference;
  enable: Abstract.ActionReference;
  toggle: Abstract.ActionReference;
  // methods:
  and: (argument: Abstract.DataSource) => Abstract.MethodReference;
  not: Abstract.MethodReference;
};

export type NumberField = Field<Abstract.NumberField> & {
  // actions:
  add: (argument: Abstract.DataSource) => Abstract.ActionReference;
  multiplyBy: (argument: Abstract.DataSource) => Abstract.ActionReference;
  // methods:
  isAtLeast: (argument: Abstract.DataSource) => Abstract.MethodReference;
  isExactly: (argument: Abstract.DataSource) => Abstract.MethodReference;
};

export type StringField = Field<Abstract.StringField>;

export type StructureField = Field<Abstract.StructureField>;

export type ElementField = Field<Abstract.ElementField>;

export type ArrayField = Field<Abstract.ArrayField> & {
  // actions:
  push: (argument: Abstract.DataSource) => Abstract.ActionReference;
};

export type Stream = Abstract.Stream & {
  (): Abstract.StreamReference;
};

export type ViewTerrain = Record<string, Abstract.Field | Abstract.Stream>;

export type ViewProperties<Features extends ViewTerrain = ViewTerrain> = {
  [Key in keyof Features]?: Features[Key] extends Abstract.Stream
    ? Abstract.SideEffect
    : Abstract.DataSource;
};

export type ViewReducer<T extends ViewTerrain = ViewTerrain> = (
  props?: ViewProperties<T>
) => Abstract.Element;
