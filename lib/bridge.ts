import { Abstract, RunningApp } from "viewscript-runtime";

import {
  CollectionHandle,
  ConditionHandle,
  CountHandle,
  ElementHandle,
  Handle,
  InputValue,
  Properties,
  StructureHandle,
  TextHandle,
  isHandle,
} from "./types";

export class ViewScriptBridgeError extends Error {}

export function condition(value?: boolean): ConditionHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Condition",
      value,
    },
    reset: output({ kind: "reference", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "setTo"],
        argumentBinding: field(nextValue)._field,
      }),
    disable: output({ kind: "reference", keyPath: [fieldKey, "disable"] }),
    enable: output({ kind: "reference", keyPath: [fieldKey, "enable"] }),
    toggle: output({ kind: "reference", keyPath: [fieldKey, "toggle"] }),
  };
}

export function count(value?: number): CountHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Count", value },
    reset: output({ kind: "reference", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "setTo"],
        argumentBinding: field(nextValue)._field,
      }),
    add: (amount): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "add"],
        argumentBinding: field(amount)._field,
      }),
    multiplyBy: (amount): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "add"],
        argumentBinding: field(amount)._field,
      }),
  };
}

export function text(value?: string): TextHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Text", value },
    reset: output({ kind: "reference", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "setTo"],
        argumentBinding: field(nextValue)._field,
      }),
  };
}

export function elementField(value?: Abstract.Element): ElementHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Element", value },
    reset: output({ kind: "reference", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "setTo"],
        argumentBinding: field(nextValue)._field,
      }),
  };
}

export function structure(value?: Abstract.Structure): StructureHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Structure",
      value,
    },
    reset: output({ kind: "reference", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "setTo"],
        argumentBinding: field(nextValue)._field,
      }),
  };
}

export function collection(value?: Array<Abstract.Data>): CollectionHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Collection",
      value,
    },
    reset: output({ kind: "reference", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "setTo"],
        argumentBinding: field(nextValue)._field,
      }),
    push: (item): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "add"],
        argumentBinding: field(item)._field,
      }),
  };
}

export function field(value: Abstract.Data) {
  if (typeof value === "boolean") {
    return condition(value);
  }

  if (typeof value === "number") {
    return count(value);
  }

  if (typeof value === "string") {
    return text(value);
  }

  if (Abstract.isElement(value)) {
    return elementField(value);
  }

  if (Abstract.isStructure(value)) {
    return structure(value);
  }

  if (value instanceof Array) {
    return collection(value);
  }

  throw new ViewScriptBridgeError(`Cannot make field from value: ${value}`);
}

export function conditional(
  condition: ConditionHandle,
  positive: Abstract.Data,
  negative: Abstract.Data
): Abstract.Conditional {
  return {
    kind: "conditional",
    condition: { kind: "reference", keyPath: [condition._field.fieldKey] },
    positive: field(positive)._field,
    negative: field(negative)._field,
  };
}

export function input(value: InputValue): Abstract.Input {
  if (Abstract.isData(value)) {
    return { kind: "input", dataBinding: field(value)._field };
  }

  return {
    kind: "input",
    dataBinding: isHandle(value)
      ? { kind: "reference", keyPath: [value._field.fieldKey] }
      : value,
  };
}

export function output(dataBinding: Abstract.Reference): Abstract.Output {
  return { kind: "output", dataBinding };
}

export function element(
  view: string | Abstract.View,
  properties?: Properties
): Abstract.Element {
  return {
    kind: "element",
    viewKey: typeof view === "string" ? `<${view}>` : view.viewKey,
    properties:
      properties &&
      Object.entries(properties).reduce<
        NonNullable<Abstract.Element["properties"]>
      >((result, [propertyKey, property]) => {
        result[propertyKey] = Abstract.isOutput(property)
          ? output(property.dataBinding)
          : input(property);
        return result;
      }, {}),
  };
}

export const browser = {
  console: {
    log: (value: any): Abstract.Output =>
      output({
        kind: "reference",
        keyPath: ["browser", "console", "log"],
        argumentBinding: field(value)._field,
      }),
  },
};

export function view(
  element: Abstract.Element,
  handles?: Record<string, Handle>
): Abstract.View {
  return {
    kind: "view",
    viewKey: window.crypto.randomUUID(),
    element,
    fields:
      handles &&
      Object.entries(handles).reduce<NonNullable<Abstract.View["fields"]>>(
        (result, [name, handle]) => {
          result[handle._field.fieldKey] = {
            ...handle._field,
            name,
          };
          return result;
        },
        {}
      ),
  };
}

export function app(
  root: Abstract.View,
  views?: Record<string, Abstract.View>
): void {
  const app: Abstract.App = {
    kind: "ViewScript v0.2.1 App",
    root,
    views:
      views &&
      Object.entries(views).reduce<NonNullable<Abstract.App["views"]>>(
        (result, [name, view]) => {
          result[view.viewKey] = {
            ...view,
            name,
          };
          return result;
        },
        {}
      ),
  };

  window.console.log(`[VSB] 🌎 Build app:`, app);

  new RunningApp(app);
}
