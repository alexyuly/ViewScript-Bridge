import { Abstract, RunningApp } from "viewscript-runtime";

import {
  CollectionDrain,
  ConditionDrain,
  CountDrain,
  ElementDrain,
  Drain,
  Faucet,
  Properties,
  Sink,
  StructureDrain,
  TextDrain,
  isDrain,
  isFaucet,
} from "./types";

export class ViewScriptBridgeError extends Error {}

export function condition(value?: boolean): ConditionDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _input: {
      kind: "field",
      fieldKey,
      modelKey: "Condition",
      value,
    },
    reset: faucet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._input,
      }),
    disable: faucet({ kind: "output", keyPath: [fieldKey, "disable"] }),
    enable: faucet({ kind: "output", keyPath: [fieldKey, "enable"] }),
    toggle: faucet({ kind: "output", keyPath: [fieldKey, "toggle"] }),
  };
}

export function count(value?: number): CountDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _input: { kind: "field", fieldKey, modelKey: "Count", value },
    reset: faucet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._input,
      }),
    add: (amount) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "add"],
        argument: field(amount)._input,
      }),
    multiplyBy: (amount) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "add"],
        argument: field(amount)._input,
      }),
  };
}

export function text(value?: string): TextDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _input: { kind: "field", fieldKey, modelKey: "Text", value },
    reset: faucet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._input,
      }),
  };
}

export function elementField(value?: Abstract.Element): ElementDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _input: { kind: "field", fieldKey, modelKey: "Element", value },
    reset: faucet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._input,
      }),
  };
}

export function structure(value?: Abstract.Structure): StructureDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _input: {
      kind: "field",
      fieldKey,
      modelKey: "Structure",
      value,
    },
    reset: faucet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._input,
      }),
  };
}

export function collection(value?: Array<Abstract.Data>): CollectionDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _input: {
      kind: "field",
      fieldKey,
      modelKey: "Collection",
      value,
    },
    reset: faucet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._input,
      }),
    push: (item) =>
      faucet({
        kind: "output",
        keyPath: [fieldKey, "add"],
        argument: field(item)._input,
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
  condition: ConditionDrain,
  positive: Abstract.Data,
  negative: Abstract.Data
): Abstract.Conditional {
  return {
    kind: "conditional",
    condition: { kind: "input", keyPath: [condition._input.fieldKey] },
    positive: field(positive)._input,
    negative: field(negative)._input,
  };
}

export function faucet(output: Abstract.Output): Faucet {
  return {
    _output: output,
  };
}

export function inlet(sink: Sink): Abstract.Inlet {
  if (Abstract.isData(sink)) {
    return { kind: "inlet", connection: field(sink)._input };
  }

  if (isDrain(sink)) {
    return {
      kind: "inlet",
      connection: { kind: "input", keyPath: [sink._input.fieldKey] },
    };
  }

  return { kind: "inlet", connection: sink };
}

export function outlet(faucet: Faucet): Abstract.Outlet {
  return {
    kind: "outlet",
    connection: faucet._output,
  };
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
        result[propertyKey] = isFaucet(property)
          ? outlet(property)
          : inlet(property);
        return result;
      }, {}),
  };
}

export const browser = {
  console: {
    log: (value: any): Faucet =>
      faucet({
        kind: "output",
        keyPath: ["browser", "console", "log"],
        argument: field(value)._input,
      }),
  },
};

export function view(
  element: Abstract.Element,
  terrain?: Record<string, Drain>
): Abstract.View {
  return {
    kind: "view",
    viewKey: window.crypto.randomUUID(),
    element,
    terrain:
      terrain &&
      Object.entries(terrain).reduce<NonNullable<Abstract.View["terrain"]>>(
        (result, [name, feature]) => {
          result[feature._input.fieldKey] = {
            ...feature._input,
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
