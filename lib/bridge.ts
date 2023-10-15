import { Abstract, RunningApp } from "viewscript-runtime";

import {
  ArrayField,
  BooleanField,
  ElementField,
  Field,
  NumberField,
  Stream,
  StringField,
  StructureField,
  ViewProperties,
  ViewReducer,
} from "./types";

class ViewScriptBridgeError extends Error {}

const branches: Record<string, Abstract.View | Abstract.Model> = {};

function uniqueValue(): string {
  return window.crypto.randomUUID();
}

function replaceValue(object: any, oldValue: string, newValue: string): void {
  Object.keys(object).forEach((key) => {
    if (object[key] === oldValue) {
      object[key] = newValue;
    } else if (typeof object[key] === "object" && object[key] !== null) {
      replaceValue(object[key], oldValue, newValue);
    }
  });
}

function actionReference(
  key: string,
  actionKey: string,
  argument?: Abstract.DataSource
): Abstract.ActionReference {
  return {
    kind: "actionReference",
    pathToActionKey: [key, actionKey],
    argument,
  };
}

function methodReference(
  key: string,
  methodKey: string,
  argument?: Abstract.DataSource
): Abstract.MethodReference {
  return {
    kind: "methodReference",
    pathToMethodKey: [key, methodKey],
    argument,
  };
}

export function boolean(initialValue?: boolean) {
  const key = uniqueValue();

  const field: BooleanField = () => ({
    kind: "fieldReference",
    pathToFieldKey: [key],
  });

  field.kind = "field";
  field.key = key;
  field.modelKey = "Boolean";
  field.initialValue = initialValue;
  field.reset = actionReference(key, "reset");
  field.setTo = (argument: Abstract.DataSource) =>
    actionReference(key, "setTo", argument);
  field.disable = actionReference(key, "disable");
  field.enable = actionReference(key, "enable");
  field.toggle = actionReference(key, "toggle");

  return field;
}

export function number(initialValue?: number) {
  const key = uniqueValue();

  const field: NumberField = () => ({
    kind: "fieldReference",
    pathToFieldKey: [key],
  });

  field.kind = "field";
  field.key = key;
  field.modelKey = "Number";
  field.initialValue = initialValue;
  field.reset = actionReference(key, "reset");
  field.setTo = (argument: Abstract.DataSource) =>
    actionReference(key, "setTo", argument);
  field.add = (argument: Abstract.DataSource) =>
    actionReference(key, "add", argument);
  field.multiplyBy = (argument: Abstract.DataSource) =>
    actionReference(key, "multiplyBy", argument);
  field.isAtLeast = (argument: Abstract.DataSource) =>
    methodReference(key, "isAtLeast", argument);

  return field;
}

export function string(initialValue?: string) {
  const key = uniqueValue();

  const field: StringField = () => ({
    kind: "fieldReference",
    pathToFieldKey: [key],
  });

  field.kind = "field";
  field.key = key;
  field.modelKey = "String";
  field.initialValue = initialValue;
  field.reset = actionReference(key, "reset");
  field.setTo = (argument: Abstract.DataSource) =>
    actionReference(key, "setTo", argument);

  return field;
}

export function structure(initialValue?: Abstract.Structure) {
  const key = uniqueValue();

  const field: StructureField = () => ({
    kind: "fieldReference",
    pathToFieldKey: [key],
  });

  field.kind = "field";
  field.key = key;
  field.modelKey = "Structure";
  field.initialValue = initialValue;
  field.reset = actionReference(key, "reset");
  field.setTo = (argument: Abstract.DataSource) =>
    actionReference(key, "setTo", argument);

  return field;
}

export function elementField(initialValue?: Abstract.Element) {
  const key = uniqueValue();

  const field: ElementField = () => ({
    kind: "fieldReference",
    pathToFieldKey: [key],
  });

  field.kind = "field";
  field.key = key;
  field.modelKey = "Element";
  field.initialValue = initialValue;
  field.reset = actionReference(key, "reset");
  field.setTo = (argument: Abstract.DataSource) =>
    actionReference(key, "setTo", argument);

  return field;
}

export function array(initialValue?: Array<Abstract.DataSource>) {
  const key = uniqueValue();

  const field: ArrayField = () => ({
    kind: "fieldReference",
    pathToFieldKey: [key],
  });

  field.kind = "field";
  field.key = key;
  field.modelKey = "Array";
  field.initialValue = initialValue;
  field.reset = actionReference(key, "reset");
  field.setTo = (argument: Abstract.DataSource) =>
    actionReference(key, "setTo", argument);
  field.push = (argument: Abstract.DataSource) =>
    actionReference(key, "push", argument);

  return field;
}

export function field(value: Abstract.Value) {
  if (typeof value === "boolean") {
    return boolean(value);
  }

  if (typeof value === "number") {
    return number(value);
  }

  if (typeof value === "string") {
    return string(value);
  }

  if (Abstract.isStructure(value)) {
    return structure(value);
  }

  if (Abstract.isElement(value)) {
    return elementField(value);
  }

  if (value instanceof Array && value.every(Abstract.isValue)) {
    return array(value);
  }

  throw new ViewScriptBridgeError(
    `The argument passed to field is invalid: ${value}`
  );
}

export function when(
  condition: Abstract.DataSource,
  positive: Abstract.DataSource,
  negative?: Abstract.DataSource
): Abstract.ConditionalData {
  return {
    kind: "conditionalData",
    when: condition,
    then: positive,
    else: negative,
  };
}

export function stream() {
  const key = uniqueValue();

  const stream: Stream = (argument?: Abstract.DataSource) => ({
    kind: "streamReference",
    streamKey: key,
    argument,
  });

  stream.kind = "stream";
  stream.key = key;

  return stream;
}

export function element(
  view: string | Abstract.View,
  properties: Abstract.Element["properties"] | ViewProperties = {}
): Abstract.Element {
  const isAbstractView = Abstract.isView(view);

  if (isAbstractView) {
    branches[view.key] = view;
  }

  return {
    kind: "element",
    viewKey: isAbstractView ? view.key : `<${view}>`,
    properties,
  };
}

export function view(element: Abstract.Element): ViewReducer;
export function view<T extends Abstract.View["terrain"]>(
  terrain: T,
  elementMaker: (terrain: T) => Abstract.Element
): ViewReducer<T>;
export function view<T extends Abstract.View["terrain"]>(
  argument0: Abstract.Element | T,
  argument1?: (terrain: T) => Abstract.Element
): ViewReducer<T> {
  if (Abstract.isElement(argument0)) {
    const element = argument0;
    return () => element;
  }

  const terrain = argument0;
  const elementMaker = argument1;

  if (elementMaker === undefined) {
    throw new ViewScriptBridgeError(
      `The second argument passed to view must not be undefined.`
    );
  }

  const viewElement = elementMaker(terrain);

  Object.entries(terrain).forEach(([featureName, feature]) => {
    replaceValue(viewElement, feature.key, featureName);
    replaceValue(feature, feature.key, featureName);
  });

  const abstractView: Abstract.View = {
    kind: "view",
    key: uniqueValue(),
    element: viewElement,
    terrain,
  };

  return (props?: ViewProperties<T>) => element(abstractView, props);
}

export const browser = {
  console: {
    log: (argument: Abstract.DataSource): Abstract.ActionReference => ({
      kind: "actionReference",
      pathToActionKey: ["browser", "console", "log"],
      argument,
    }),
  },
};

export function render(rootElement: Abstract.Element): void;
export function render(root: Abstract.View): void;
export function render(argument: Abstract.Element | Abstract.View): void {
  const app: Abstract.App = {
    kind: "app",
    version: "ViewScript v0.3.4",
    root: Abstract.isElement(argument)
      ? {
          kind: "view",
          key: "root",
          element: argument,
          terrain: {},
        }
      : argument,
    branches,
  };

  window.console.log(`[VSB] 🌎 Build app:`, app);

  new RunningApp(app);
}
