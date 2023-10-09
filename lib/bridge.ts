import { Abstract, RunningApp } from "viewscript-runtime";

import {
  CollectionDrain,
  ConditionDrain,
  CountDrain,
  Drain,
  ElementDrain,
  Faucet,
  Properties,
  Sink,
  StructureDrain,
  TextDrain,
  isDrain,
  isFaucet,
} from "./types";

class ViewScriptBridgeError extends Error {}

export function condition(value?: boolean): ConditionDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Condition",
      value,
    },
    reset: outlet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._field,
      }),
    disable: outlet({ kind: "output", keyPath: [fieldKey, "disable"] }),
    enable: outlet({ kind: "output", keyPath: [fieldKey, "enable"] }),
    toggle: outlet({ kind: "output", keyPath: [fieldKey, "toggle"] }),
  };
}

export function count(value?: number): CountDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Count", value },
    reset: outlet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._field,
      }),
    add: (amount) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "add"],
        argument: field(amount)._field,
      }),
    multiplyBy: (amount) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "add"],
        argument: field(amount)._field,
      }),
  };
}

export function text(value?: string): TextDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Text", value },
    reset: outlet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._field,
      }),
  };
}

export function structure(value?: Abstract.Structure): StructureDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Structure",
      value,
    },
    reset: outlet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._field,
      }),
  };
}

export function elementField(value?: Abstract.Element): ElementDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Element", value },
    reset: outlet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._field,
      }),
  };
}

export function collection(value?: Array<Abstract.Data>): CollectionDrain {
  const fieldKey = window.crypto.randomUUID();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Collection",
      value,
    },
    reset: outlet({ kind: "output", keyPath: [fieldKey, "reset"] }),
    setTo: (nextValue) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "setTo"],
        argument: field(nextValue)._field,
      }),
    push: (item) =>
      outlet({
        kind: "output",
        keyPath: [fieldKey, "add"],
        argument: field(item)._field,
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

  if (Abstract.isStructure(value)) {
    return structure(value);
  }

  if (Abstract.isElement(value)) {
    return elementField(value);
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
    condition: { kind: "input", keyPath: [condition._field.fieldKey] },
    positive: field(positive)._field,
    negative: field(negative)._field,
  };
}

export function stream(): Faucet {
  return { _stream: { kind: "stream", streamKey: window.crypto.randomUUID() } };
}

export function inlet(sink: Sink): Abstract.Inlet {
  if (Abstract.isData(sink)) {
    return { kind: "inlet", connection: field(sink)._field };
  }

  if (isDrain(sink)) {
    return {
      kind: "inlet",
      connection: { kind: "input", keyPath: [sink._field.fieldKey] },
    };
  }

  return { kind: "inlet", connection: sink };
}

export function outlet(connection: Abstract.Output): Abstract.Outlet {
  return {
    kind: "outlet",
    connection,
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
        result[propertyKey] = Abstract.isOutlet(property)
          ? property
          : isFaucet(property)
          ? outlet({
              kind: "output",
              keyPath: [property._stream.streamKey],
            })
          : inlet(property);
        return result;
      }, {}),
  };
}

export const browser = {
  console: {
    log: (value: any): Abstract.Outlet =>
      outlet({
        kind: "output",
        keyPath: ["browser", "console", "log"],
        argument: field(value)._field,
      }),
  },
};

export function view(
  element: Abstract.Element,
  terrain?: Record<string, Drain | Faucet>
): Abstract.View {
  return {
    kind: "view",
    viewKey: window.crypto.randomUUID(),
    element,
    terrain:
      terrain &&
      Object.entries(terrain).reduce<NonNullable<Abstract.View["terrain"]>>(
        (result, [name, feature]) => {
          if (isDrain(feature)) {
            result[feature._field.fieldKey] = {
              ...feature._field,
              name,
            };
          } else {
            result[feature._stream.streamKey] = {
              ...feature._stream,
              name,
            };
          }
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
    kind: "ViewScript v0.3.0 App",
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
