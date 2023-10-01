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
  ConditionHandle,
  CountHandle,
  ElementHandle,
  Handle,
  Properties,
  TextHandle,
  UnwrappedInput,
  isHandle,
} from "./types";

export class ViewScriptBridgeError extends Error {}

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
    add: (amount: number) =>
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

export function handle(value: boolean | number | string | Element): Handle {
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

  throw new ViewScriptBridgeError(`Cannot make field from value: ${value}`);
}

export function reference(handle: Handle): Reference {
  return { kind: "reference", name: handle._field.name };
}

export function conditional(
  condition: ConditionHandle,
  positive: boolean | number | string,
  negative: boolean | number | string
): Conditional {
  return {
    kind: "conditional",
    condition: reference(condition),
    positive: handle(positive)._field,
    negative: handle(negative)._field,
  };
}

export function input(name: string, value: UnwrappedInput): Input {
  if (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    isElement(value)
  ) {
    return { kind: "input", name, value: handle(value)._field };
  }

  return {
    kind: "input",
    name,
    value: isHandle(value) ? reference(value) : value,
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
  const app: App = { kind: "ViewScript v0.0.4 App", body: [view] };
  window.console.log(`[VSB] 🍏 This app is compiled:`, JSON.stringify(app));

  new RunningApp(app);
}
