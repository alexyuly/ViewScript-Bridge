import {
  App,
  Conditional,
  Element,
  Field,
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

export function condition(value: boolean): ConditionHandle {
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

export function count(value: number): CountHandle {
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

export function text(value: string): TextHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Text", value },
  };
}

export function elementField(value: Element): ElementHandle {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Element", value },
  };
}

export function collection(value: Array<unknown>): CollectionHandle {
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

export function handle(value: Primitive): Handle {
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
    positive: handle(positive)._field,
    negative: handle(negative)._field,
  };
}

export function input(value: InputValue): Input {
  if (isPrimitive(value)) {
    return { kind: "input", dataBinding: handle(value)._field };
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

export function element(tagName: string, properties: Properties): Element {
  return {
    kind: "element",
    viewKey: `<${tagName}>`,
    properties: Object.entries(properties).reduce(
      (result, [propertyKey, property]) => {
        result[propertyKey] = isOutput(property)
          ? output(property.dataBinding)
          : input(property);
        return result;
      },
      {} as Element["properties"]
    ),
  };
}

export const browser = {
  console: {
    log: (value: any): Output =>
      output({
        kind: "reference",
        keyPath: ["browser", "console", "log"],
        argumentBinding: handle(value)._field,
      }),
  },
};

export function view({
  fields,
  element,
}: {
  fields?: Record<string, Handle>;
  element: Element;
}): View {
  return {
    kind: "view",
    element,
    fields:
      fields &&
      Object.entries(fields).reduce(
        (result, [name, handle]) => {
          result[handle._field.fieldKey] = {
            ...handle._field,
            name,
          };
          return result;
        },
        {} as Record<string, Field>
      ),
  };
}

export function app(view: View): void {
  const app: App = { kind: "ViewScript v0.2.0 App", view };
  window.console.log(`[VSB] 🌎 Build app:`, app);

  new RunningApp(app);
}
