import { Abstract } from "viewscript-runtime";

export type Field<T extends Abstract.Field = Abstract.Field> = T & {
  (): Abstract.FieldReference;
  reset: Abstract.ActionReference;
  setTo: (argument: Abstract.DataSource) => Abstract.ActionReference;
};

export type BooleanField = Field<Abstract.BooleanField> & {
  disable: Abstract.ActionReference;
  enable: Abstract.ActionReference;
  toggle: Abstract.ActionReference;
};

export type NumberField = Field<Abstract.NumberField> & {
  add: (argument: Abstract.DataSource) => Abstract.ActionReference;
  isAtLeast: (argument: Abstract.DataSource) => Abstract.MethodReference;
  multiplyBy: (argument: Abstract.DataSource) => Abstract.ActionReference;
};

export type StringField = Field<Abstract.StringField>;

export type StructureField = Field<Abstract.StructureField>;

export type ElementField = Field<Abstract.ElementField>;

export type ArrayField = Field<Abstract.ArrayField> & {
  push: (argument: Abstract.DataSource) => Abstract.ActionReference;
};

export type Stream = Abstract.Stream & {
  (): Abstract.StreamReference;
};

export type ViewTerrain = Record<string, Abstract.Field | Abstract.Stream>;

export type ViewProperties<Features extends ViewTerrain = ViewTerrain> = {
  [Key in keyof Features]: Features[Key] extends Abstract.Stream
    ? Abstract.SideEffect
    : Abstract.DataSource;
};

export type ViewReducer<T extends ViewTerrain = ViewTerrain> = (
  props?: ViewProperties<T>
) => Abstract.Element;
