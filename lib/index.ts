import {
  App,
  Condition,
  Conditional,
  Element,
  Field,
  Input,
  Output,
  Reference,
  Text,
  View,
  isOutput,
  run,
} from "viewscript-runtime";

export type InputPropertyValue = boolean | string | Reference | Conditional;

export type PropertyValue = InputPropertyValue | Output;

export type Properties = Record<string, PropertyValue>;

export type Boxed<T extends Field = Field> = {
  field: T;
};

export type BoxedCondition = {
  field: Condition;
  disable: () => Output;
  enable: () => Output;
  toggle: () => Output;
};

export type BoxedText = {
  field: Text;
};

export class ViewScriptBridgeError extends Error {}

export function render(...body: App["B"]): void {
  const app: App = {
    K: "ViewScript v0.0.0 App",
    B: body,
  };

  run(app);
}

export function isViewElement(
  statement: Boxed | Element
): statement is Element {
  return "K" in statement && statement.K === "e";
}

export function view(...body: Array<Boxed | Element>): View {
  return {
    K: "v",
    N: window.crypto.randomUUID(),
    B: body.map((statement) =>
      isViewElement(statement) ? statement : statement.field
    ),
  };
}

export function input(name: string, value: InputPropertyValue): Input {
  if (typeof value === "boolean") {
    return {
      K: "i",
      N: name,
      V: condition(value).field,
    };
  }
  if (typeof value === "string") {
    return {
      K: "i",
      N: name,
      V: text(value).field,
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

export const browser = {
  console: {
    log: (value: any): Reference => ({
      K: "r",
      N: "window.console.log",
      A: text(value).field,
    }),
  },
};
