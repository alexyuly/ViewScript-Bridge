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

export function collection(value: Array<unknown>): CollectionHandle {
  const name = window.crypto.randomUUID();

  return {
    _field: { kind: "field", name, model: "Collection", value },
  };
}

export function condition(value: boolean): ConditionHandle {
  const name = window.crypto.randomUUID();

  return {
    _field: { kind: "field", name, model: "Condition", value },
    disable: output("disable", { kind: "reference", name: [name, "disable"] }),
    enable: output("enable", { kind: "reference", name: [name, "enable"] }),
    toggle: output("toggle", { kind: "reference", name: [name, "toggle"] }),
  };
}

export function count(value: number): CountHandle {
  const name = window.crypto.randomUUID();

  return {
    _field: { kind: "field", name, model: "Count", value },
    add: (amount: number): Output =>
      output("add", {
        kind: "reference",
        name: [name, "add"],
        argument: count(amount)._field,
      }),
  };
}

export function text(value: string): TextHandle {
  const name = window.crypto.randomUUID();

  return {
    _field: { kind: "field", name, model: "Text", value },
  };
}

export function elementField(value: Element): ElementHandle {
  const name = window.crypto.randomUUID();

  return {
    _field: { kind: "field", name, model: "Element", value },
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
    condition: { kind: "reference", name: condition._field.name },
    positive: handle(positive)._field,
    negative: handle(negative)._field,
  };
}

export function input(name: string, value: InputValue): Input {
  if (isPrimitive(value)) {
    return { kind: "input", name, value: handle(value)._field };
  }

  return {
    kind: "input",
    name,
    value: isHandle(value)
      ? { kind: "reference", name: value._field.name }
      : value,
  };
}

export function output(name: string, value: Reference): Output {
  return { kind: "output", name, value };
}

export function element(tagName: string, properties: Properties): Element {
  return {
    kind: "element",
    view: `<${tagName}>`,
    properties: Object.entries(properties).map(([name, value]) =>
      isOutput(value)
        ? { kind: "output", name, value: value.value }
        : input(name, value)
    ),
  };
}

export const browser = {
  console: {
    log: (value: any): Output =>
      output("log", {
        kind: "reference",
        name: ["browser", "console", "log"],
        argument: handle(value)._field,
      }),
  },
};

export function view(...body: Array<Handle | Element>): View {
  return {
    kind: "view",
    name: window.crypto.randomUUID(),
    body: body.map((statement) =>
      isElement(statement) ? statement : statement._field
    ),
  };
}

export function app(view: View): void {
  const app: App = { kind: "ViewScript v0.1.0 App", body: [view] };
  window.console.log(`[VSB] 🌎 Build app:`, app);

  new RunningApp(app);
}
