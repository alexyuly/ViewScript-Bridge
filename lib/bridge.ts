import {
  App,
  Conditional,
  Element,
  Input,
  Output,
  Reference,
  RunnableApp,
  View,
  isElement,
  isOutput,
} from "viewscript-runtime";

import type {
  Boxed,
  BoxedCondition,
  BoxedText,
  Properties,
  UnwrappedInput,
} from "./types";

export class ViewScriptBridgeError extends Error {}

export function condition(value: boolean): BoxedCondition {
  const name = window.crypto.randomUUID();

  return {
    _field: { K: "f", N: name, C: "Condition", V: value },
    disable: output("disable", { K: "r", N: [name, "disable"] }),
    enable: output("enable", { K: "r", N: [name, "enable"] }),
    toggle: output("toggle", { K: "r", N: [name, "toggle"] }),
  };
}

export function text(value: string): BoxedText {
  const name = window.crypto.randomUUID();

  return {
    _field: { K: "f", N: name, C: "Text", V: value },
  };
}

export function boxed(value: boolean | string): Boxed {
  if (typeof value === "boolean") {
    return condition(value);
  }

  if (typeof value === "string") {
    return text(value);
  }

  throw new ViewScriptBridgeError(`Cannot make field from value: ${value}`);
}

export function conditional(
  condition: BoxedCondition,
  yes: boolean | string,
  zag: boolean | string
): Conditional {
  return {
    K: "c",
    Q: { K: "r", N: condition._field.N },
    Y: boxed(yes)._field,
    Z: boxed(zag)._field,
  };
}

export function input(name: string, value: UnwrappedInput): Input {
  if (typeof value === "boolean" || typeof value === "string") {
    return { K: "i", N: name, V: boxed(value)._field };
  }

  return { K: "i", N: name, V: value };
}

export function output(name: string, value: Reference): Output {
  return { K: "o", N: name, V: value };
}

export function element(tagName: string, properties: Properties): Element {
  return {
    K: "e",
    C: `<${tagName}>`,
    P: Object.entries(properties).map(([name, value]) =>
      isOutput(value) ? { K: "o", N: name, V: value.V } : input(name, value)
    ),
  };
}

export const browser = {
  console: {
    log: (value: any): Output =>
      output("log", {
        K: "r",
        N: ["browser", "console", "log"],
        A: boxed(value)._field,
      }),
  },
};

export function view(...body: Array<Boxed | Element>): View {
  return {
    K: "v",
    N: window.crypto.randomUUID(),
    B: body.map((statement) =>
      isElement(statement) ? statement : statement._field
    ),
  };
}

export function app(view: View): void {
  const app: App = { K: "ViewScript v0.0.4 App", B: [view] };
  window.console.log(`[VSB] 🍏 App compiled:`, JSON.stringify(app));

  new RunnableApp(app);
}
