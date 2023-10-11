import { Abstract, RunningApp } from "viewscript-runtime";

import {
  ArrayDrain,
  BooleanDrain,
  ElementDrain,
  ElementProperties,
  ElementReducer,
  Faucet,
  NumberDrain,
  Sink,
  StringDrain,
  StructureDrain,
  ViewTerrain,
  isDrain,
  isFaucet,
} from "./types";

class ViewScriptBridgeError extends Error {}

const viewCache: Record<string, Abstract.View> = {};

function key() {
  return window.crypto.randomUUID();
}

function inlet(sink: Sink): Abstract.Inlet {
  if (Abstract.isData(sink)) {
    return { kind: "inlet", connection: field(sink)._field };
  }

  if (Abstract.isConditional(sink)) {
    return { kind: "inlet", connection: sink };
  }

  return {
    kind: "inlet",
    connection: { kind: "input", keyPath: [sink._field.fieldKey] },
  };
}

function outlet(connection: Abstract.Output): Abstract.Outlet {
  return { kind: "outlet", connection };
}

export function boolean(value?: boolean): BooleanDrain {
  const fieldKey = key();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Boolean",
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

export function number(value?: number): NumberDrain {
  const fieldKey = key();

  return {
    _field: { kind: "field", fieldKey, modelKey: "Number", value },
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

export function string(value?: string): StringDrain {
  const fieldKey = key();

  return {
    _field: { kind: "field", fieldKey, modelKey: "String", value },
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
  const fieldKey = key();

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
  const fieldKey = key();

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

export function array(value?: Array<Abstract.Data>): ArrayDrain {
  const fieldKey = key();

  return {
    _field: {
      kind: "field",
      fieldKey,
      modelKey: "Array",
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
    return boolean(value);
  }

  if (typeof value === "number") {
    return number(value);
  }

  if (typeof value === "string") {
    return string(value);
  }

  if (Abstract.isStructure(value)) {
    return structure(value);
  }

  if (Abstract.isElement(value)) {
    return elementField(value);
  }

  if (value instanceof Array && value.every(Abstract.isData)) {
    return array(value);
  }

  throw new ViewScriptBridgeError(
    `The first argument passed to field is invalid: ${value}`
  );
}

export function when(
  condition: BooleanDrain,
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
  return { _stream: { kind: "stream", streamKey: key() } };
}

export function element(
  view: string | Abstract.View,
  properties: ElementProperties = {}
): Abstract.Element {
  const isAbstractView = Abstract.isView(view);

  if (isAbstractView) {
    viewCache[view.viewKey] = view;
  }

  return {
    kind: "element",
    viewKey: isAbstractView ? view.viewKey : `<${view}>`,
    properties: Object.entries(properties).reduce<
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

export function view(element: Abstract.Element): ElementReducer;
export function view<T extends ViewTerrain>(
  terrain: T,
  elementMaker: (terrain: T) => Abstract.Element
): ElementReducer;
export function view<T extends ViewTerrain>(
  argument0: Abstract.Element | T,
  argument1?: (terrain: T) => Abstract.Element
): ElementReducer {
  if (Abstract.isElement(argument0)) {
    return () => argument0;
  }

  const terrain = Object.entries(argument0).reduce<
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

  if (argument1 === undefined) {
    throw new ViewScriptBridgeError(
      `The second argument passed to view is invalid: ${argument1}`
    );
  }

  const abstractView: Abstract.View = {
    kind: "view",
    viewKey: key(),
    element: argument1(argument0),
    terrain,
  };

  return (props?: ElementProperties) => element(abstractView, props);
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
export function render(argument: Abstract.Element | Abstract.View): void {
  const app: Abstract.App = {
    kind: "ViewScript v0.3.2 App",
    root: Abstract.isElement(argument)
      ? {
          kind: "view",
          viewKey: "root",
          element: argument,
          terrain: {},
        }
      : argument,
    views: viewCache,
  };

  window.console.log(`[VSB] 🌎 Build app:`, app);

  new RunningApp(app);
}
