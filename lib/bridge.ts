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

import type {
  Boxed,
  BoxedCondition,
  BoxedElement,
  BoxedText,
  Properties,
  UnwrappedInput,
} from "./types";

export class ViewScriptBridgeError extends Error {}

export function condition(value: boolean): BoxedCondition {
  const name = window.crypto.randomUUID();

  return {
    _field: { kind: "field", name, model: "Condition", value },
    disable: output("disable", { kind: "reference", name: [name, "disable"] }),
    enable: output("enable", { kind: "reference", name: [name, "enable"] }),
    toggle: output("toggle", { kind: "reference", name: [name, "toggle"] }),
  };
}

export function elementField(value: Element): BoxedElement {
  const name = window.crypto.randomUUID();

  return {
    _field: { kind: "field", name, model: "Element", value },
  };
}

export function text(value: string): BoxedText {
  const name = window.crypto.randomUUID();

  return {
    _field: { kind: "field", name, model: "Text", value },
  };
}

export function boxed(value: boolean | string | Element): Boxed {
  if (typeof value === "boolean") {
    return condition(value);
  }

  if (typeof value === "string") {
    return text(value);
  }

  if (isElement(value)) {
    return elementField(value);
  }

  throw new ViewScriptBridgeError(`Cannot make field from value: ${value}`);
}

export function conditional(
  condition: BoxedCondition,
  positive: boolean | string,
  negative: boolean | string
): Conditional {
  return {
    kind: "conditional",
    condition: { kind: "reference", name: condition._field.name },
    positive: boxed(positive)._field,
    negative: boxed(negative)._field,
  };
}

export function input(name: string, value: UnwrappedInput): Input {
  if (
    typeof value === "boolean" ||
    typeof value === "string" ||
    isElement(value)
  ) {
    return { kind: "input", name, value: boxed(value)._field };
  }

  return { kind: "input", name, value };
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
        argument: boxed(value)._field,
      }),
  },
};

export function view(...body: Array<Boxed | Element>): View {
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
