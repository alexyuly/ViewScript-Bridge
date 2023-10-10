import { Abstract, RunningApp } from "viewscript-runtime";

import {
  CollectionDrain,
  ConditionDrain,
  CountDrain,
  ElementDrain,
  ElementProps,
  Faucet,
  IndexedView,
  Sink,
  StructureDrain,
  TextDrain,
  ViewTerrain,
  isDrain,
  isFaucet,
  isIndexedView,
} from "./types";

class ViewScriptBridgeError extends Error {}

const viewCache: Record<string, IndexedView> = {};

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
    connection: {
      kind: "input",
      modelKey: sink._field.modelKey,
      keyPath: [sink._field.fieldKey],
    },
  };
}

function outlet(connection: Abstract.Output): Abstract.Outlet {
  return { kind: "outlet", connection };
}

export function condition(value?: boolean): ConditionDrain {
  const fieldKey = key();

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
  const fieldKey = key();

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
  const fieldKey = key();

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

export function collection(value?: Array<Abstract.Data>): CollectionDrain {
  const fieldKey = key();

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

  if (value instanceof Array && value.every(Abstract.isData)) {
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
    condition: {
      kind: "input",
      modelKey: condition._field.modelKey,
      keyPath: [condition._field.fieldKey],
    },
    positive: field(positive)._field,
    negative: field(negative)._field,
  };
}

export function stream(): Faucet {
  return { _stream: { kind: "stream", streamKey: key() } };
}

export function element<T extends string | IndexedView>(
  tag: T,
  properties?: ElementProps<T>
): Abstract.Element {
  const isAbstractView = isIndexedView(tag);

  if (isAbstractView) {
    viewCache[tag._view.viewKey] = tag;
  }

  return {
    kind: "element",
    viewKey: isAbstractView ? tag._view.viewKey : `<${tag}>`,
    properties: Object.entries(properties ?? {}).reduce<
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

export function view(element: Abstract.Element): IndexedView;
export function view<T extends ViewTerrain>(
  terrain: T,
  elementMaker: (terrain: T) => Abstract.Element
): IndexedView;
export function view<T extends ViewTerrain>(
  argument0: Abstract.Element | T,
  argument1?: (terrain: T) => Abstract.Element
): IndexedView {
  if (Abstract.isElement(argument0)) {
    return {
      _view: {
        kind: "view",
        viewKey: key(),
        element: argument0,
        terrain: {},
      },
      _viewTerrain: {},
    };
  }

  if (argument1 === undefined) {
    throw new ViewScriptBridgeError(
      `The second argument passed to view is invalid: ${argument1}`
    );
  }

  const { terrain, _viewTerrain } = Object.entries(argument0).reduce<{
    terrain: NonNullable<Abstract.View["terrain"]>;
    _viewTerrain: Abstract.ViewTerrain;
  }>(
    (result, [name, feature]) => {
      if (isDrain(feature)) {
        const fieldKey = feature._field.fieldKey;
        const field = {
          ...feature._field,
          name,
        };
        result.terrain[fieldKey] = field;
        result._viewTerrain[fieldKey] = field;
      } else {
        const streamKey = feature._stream.streamKey;
        const stream = {
          ...feature._stream,
          name,
        };
        result.terrain[streamKey] = stream;
        result._viewTerrain[streamKey] = stream;
      }
      return result;
    },
    { terrain: {}, _viewTerrain: {} }
  );

  return {
    _view: {
      kind: "view",
      viewKey: key(),
      element: argument1(argument0),
      terrain,
    },
    _viewTerrain,
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
export function render(root: IndexedView): void;
export function render(argument: Abstract.Element | IndexedView): void {
  const app: Abstract.App = {
    kind: "ViewScript v0.3.1 App",
    root: Abstract.isElement(argument) ? view(argument)._view : argument._view,
    views: Object.entries(viewCache).reduce<Abstract.App["views"]>(
      (result, [viewKey, cacheEntry]) => {
        result[viewKey] = cacheEntry._view;
        return result;
      },
      {}
    ),
  };

  window.console.log(`[VSB] 🌎 Build app:`, app);

  new RunningApp(app);
}
