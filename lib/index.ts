import {
  App,
  Conditional,
  Element,
  Input,
  Output,
  Reference,
  View,
  isElement,
  isOutput,
  run,
} from "viewscript-runtime";

import type {
  Boxed,
  BoxedCondition,
  BoxedText,
  InputPropertyValue,
  Properties,
} from "./types";

export class ViewScriptBridgeError extends Error {}

export function condition(value: boolean): BoxedCondition {
  const name = window.crypto.randomUUID();

  return {
    field: {
      K: "f",
      N: name,
      C: "Condition",
      V: value,
    },
    disable: () =>
      output("disable", {
        K: "r",
        N: [name, "disable"],
      }),
    enable: () =>
      output("enable", {
        K: "r",
        N: [name, "enable"],
      }),
    toggle: () =>
      output("toggle", {
        K: "r",
        N: [name, "toggle"],
      }),
  };
}

export function text(value: string): BoxedText {
  return {
    field: {
      K: "f",
      N: window.crypto.randomUUID(),
      C: "Text",
      V: value,
    },
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
    Q: {
      K: "r",
      N: condition.field.N,
    },
    Y: boxed(yes).field,
    Z: boxed(zag).field,
  };
}

export function input(name: string, value: InputPropertyValue): Input {
  if (typeof value === "boolean" || typeof value === "string") {
    return {
      K: "i",
      N: name,
      V: boxed(value).field,
    };
  }
  return {
    K: "i",
    N: name,
    V: value,
  };
}

export function output(name: string, value: Reference): Output {
  return {
    K: "o",
    N: name,
    V: value,
  };
}

export function element(
  className: Element["C"],
  properties: Properties
): Element {
  return {
    K: "e",
    C: className,
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
        N: "window.console.log",
        A: text(value).field,
      }),
  },
};

export function view(...body: Array<Boxed | Element>): View {
  return {
    K: "v",
    N: window.crypto.randomUUID(),
    B: body.map((statement) =>
      isElement(statement) ? statement : statement.field
    ),
  };
}

export function render(...body: App["B"]): void {
  const app: App = {
    K: "ViewScript v0.0.0 App",
    B: body,
  };

  run(app);
}
