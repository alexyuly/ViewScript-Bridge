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

function newKey() {
  return window.crypto.randomUUID();
}

export function condition(value?: boolean): ConditionDrain {
  const fieldKey = newKey();

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
  const fieldKey = newKey();

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
        keyPath: [fieldKey, "multiplyBy"],
        argument: field(amount)._field,
      }),
  };
}

export function text(value?: string): TextDrain {
  const fieldKey = newKey();

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
  const fieldKey = newKey();

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
  const fieldKey = newKey();

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
  const fieldKey = newKey();

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
        keyPath: [fieldKey, "push"],
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

  throw new ViewScriptBridgeError(
    `The first argument passed to field is invalid: ${value}`
  );
}

export function when(
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
  return { _stream: { kind: "stream", streamKey: newKey() } };
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

export function view(element: Abstract.Element): Abstract.View;
export function view<T extends Record<string, Drain | Faucet>>(
  terrain: T,
  elementMaker: (terrain: T) => Abstract.Element
): Abstract.View;
export function view<T extends Record<string, Drain | Faucet>>(
  param0: Abstract.Element | T,
  param1?: (terrain: T) => Abstract.Element
): Abstract.View {
  if (Abstract.isElement(param0)) {
    return {
      kind: "view",
      viewKey: newKey(),
      element: param0,
    };
  }

  const terrain = Object.entries(param0).reduce<
    NonNullable<Abstract.View["terrain"]>
  >((result, [name, feature]) => {
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
  }, {});

  if (param1 === undefined) {
    throw new ViewScriptBridgeError(
      `The second argument passed to view is invalid: ${param1}`
    );
  }

  return {
    kind: "view",
    viewKey: newKey(),
    element: param1(param0),
    terrain,
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

export function render(rootElement: Abstract.Element): void;
export function render(root: Abstract.View): void;
export function render(
  views: Record<string, Abstract.View>,
  root: Abstract.View
): void;
export function render(
  param0: Abstract.Element | Abstract.View | Record<string, Abstract.View>,
  param1?: Abstract.View
): void {
  let app: Abstract.App;

  const kind = "ViewScript v0.3.0 App";

  if (Abstract.isElement(param0)) {
    app = {
      kind,
      root: view(param0),
    };
  } else if (Abstract.isView(param0)) {
    app = {
      kind,
      root: param0,
    };
  } else {
    if (param1 === undefined) {
      throw new ViewScriptBridgeError(
        `The second argument passed to render is invalid: ${param1}`
      );
    }

    app = {
      kind,
      root: param1,
      views:
        param0 &&
        Object.entries(param0).reduce<NonNullable<Abstract.App["views"]>>(
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
  }

  window.console.log(`[VSB] 🌎 Build app:`, app);

  new RunningApp(app);
}
