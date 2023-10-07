import {
  App,
  Conditional,
  Element,
  Input,
  Output,
  Reference,
  RunningApp,
  View,
  isElement,
  isOutput,
} from "viewscript-runtime";

import {
  CollectionHandle,
  ConditionHandle,
  CountHandle,
  ElementHandle,
  Handle,
  InputValue,
  Primitive,
  Properties,
  TextHandle,
  isHandle,
  isPrimitive,
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
    disable: output({ kind: "reference", keyPath: [fieldKey, "disable"] }),
    enable: output({ kind: "reference", keyPath: [fieldKey, "enable"] }),
    toggle: output({ kind: "reference", keyPath: [fieldKey, "toggle"] }),
  };
}

export function count(value?: number): CountHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Count", value },
    add: (amount: number): Output =>
      output({
        kind: "reference",
        keyPath: [fieldKey, "add"],
        argumentBinding: count(amount)._field,
      }),
  };
}

export function text(value?: string): TextHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Text", value },
  };
}

export function elementField(value?: Element): ElementHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Element", value },
  };
}

export function collection(value?: Array<unknown>): CollectionHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Collection",
      value,
    },
  };
}

export function field(value: Primitive) {
  if (typeof value === "boolean") {
    return condition(value);
  }

  if (typeof value === "number") {
    return count(value);
  }

  if (typeof value === "string") {
    return text(value);
  }

  if (isElement(value)) {
    return elementField(value);
  }

  if (value instanceof Array) {
    return collection(value);
  }

  throw new ViewScriptBridgeError(`Cannot make field from value: ${value}`);
}

export function conditional(
  condition: ConditionHandle,
  positive: Primitive,
  negative: Primitive
): Conditional {
  return {
    kind: "conditional",
    condition: { kind: "reference", keyPath: [condition._field.fieldKey] },
    positive: field(positive)._field,
    negative: field(negative)._field,
  };
}

export function input(value: InputValue): Input {
  if (isPrimitive(value)) {
    return { kind: "input", dataBinding: field(value)._field };
  }

  return {
    kind: "input",
    dataBinding: isHandle(value)
      ? { kind: "reference", keyPath: [value._field.fieldKey] }
      : value,
  };
}

export function output(dataBinding: Reference): Output {
  return { kind: "output", dataBinding };
}

// TODO Type check that the given properties conform to the given view.
export function element(view: string | View, properties?: Properties): Element {
  return {
    kind: "element",
    viewKey: typeof view === "string" ? `<${view}>` : view.viewKey,
    properties:
      properties &&
      Object.entries(properties).reduce<NonNullable<Element["properties"]>>(
        (result, [propertyKey, property]) => {
          result[propertyKey] = isOutput(property)
            ? output(property.dataBinding)
            : input(property);
          return result;
        },
        {}
      ),
  };
}

export const browser = {
  console: {
    log: (value: any): Output =>
      output({
        kind: "reference",
        keyPath: ["browser", "console", "log"],
        argumentBinding: field(value)._field,
      }),
  },
};

export function view(element: Element, handles?: Record<string, Handle>): View {
  return {
    kind: "view",
    viewKey: window.crypto.randomUUID(),
    element,
    fields:
      handles &&
      Object.entries(handles).reduce<NonNullable<View["fields"]>>(
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

export function app(root: View, views?: Record<string, View>): void {
  const app: App = {
    kind: "ViewScript v0.2.1 App",
    root,
    views:
      views &&
      Object.entries(views).reduce<NonNullable<App["views"]>>(
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
