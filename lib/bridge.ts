import { Abstract, App } from "viewscript-runtime";

const propsStack: Array<Record<string, ReturnType<typeof prop>>> = [];

export function imply(condition: ReturnType<typeof prop>) {
  const implyFirstPart = {
    then: (consequence: string) => {
      const implication = {
        _kind: "BoxedImplication",
        _implication: {
          kind: "implication",
          condition: {
            kind: "field",
            content: {
              kind: "reference",
              fieldName: condition._name,
            },
          },
          consequence: {
            kind: "field",
            content: {
              kind: "rawValue",
              value: consequence,
            },
          },
        } as Abstract.Implication,
        else: (alternative: string) => {
          const implicationWithElse = {
            _kind: "BoxedImplication",
            _implication: {
              ...implication._implication,
              alternative: {
                kind: "field",
                content: {
                  kind: "rawValue",
                  value: alternative,
                },
              },
            } as Abstract.Implication,
          } as const;
          return implicationWithElse;
        },
      } as const;
      return implication;
    },
  };
  return implyFirstPart;
}

type BoxedField = {
  _kind: "BoxedField";
  _name: string;
  _field: Abstract.Field;
  set: (value: unknown) => Abstract.Action;
};

export function prop(value: unknown) {
  const boxedField: BoxedField = {
    _kind: "BoxedField",
    _name: window.crypto.randomUUID(),
    _field: {
      kind: "field",
      content: {
        kind: "rawValue",
        value,
      },
    },
    set: (value: unknown) => {
      const action: Abstract.Action = {
        kind: "action",
        target: {
          kind: "call",
          context: {
            kind: "field",
            content: {
              kind: "reference",
              fieldName: boxedField._name,
            },
          },
          actionName: "set",
          argument: {
            kind: "field",
            content: {
              kind: "rawValue",
              value,
            },
          },
        },
      };
      return action;
    },
  };
  if (propsStack.length > 0) {
    propsStack[propsStack.length - 1][boxedField._name] = boxedField;
  }
  return boxedField;
}

export function render(atom: Abstract.Atom | (() => Abstract.Atom)) {
  const innerProps: Record<string, ReturnType<typeof prop>> = {};
  propsStack.push(innerProps);
  const renderedAtom = typeof atom === "function" ? atom() : atom;
  propsStack.pop();
  const app: Abstract.App = {
    kind: "app",
    innerProps: Object.values(innerProps).reduce(
      (acc, prop) => {
        acc[prop._name] = prop._field;
        return acc;
      },
      {} as Record<string, Abstract.Field>
    ),
    stage: [renderedAtom],
  };
  console.log("app", app);
  new App(app);
}

export function tag(
  name: string,
  props: Record<
    string,
    | string
    | Omit<ReturnType<ReturnType<typeof imply>["then"]>, "else">
    | Abstract.Action
  >
) {
  const atom: Abstract.Atom = {
    kind: "atom",
    tagName: name,
    outerProps: Object.entries(props).reduce(
      (acc, [key, value]) => {
        if (typeof value === "string") {
          acc[key] = {
            kind: "field",
            content: {
              kind: "rawValue",
              value,
            },
          };
        } else if (Abstract.isRawObject(value) && "_implication" in value) {
          acc[key] = {
            kind: "field",
            content: value._implication,
          };
        } else if (Abstract.isComponent(value) && value.kind === "action") {
          acc[key] = value;
        } else {
          throw new Error(
            `Tag ${name} has invalid prop ${key}: ${JSON.stringify(value)}`
          );
        }
        return acc;
      },
      {} as Abstract.Atom["outerProps"]
    ),
  };
  return atom;
}

type ViewOuterProps<ViewProps> = {
  [K in keyof ViewProps]: ViewProps[K] extends Function
    ? Abstract.Action
    : BoxedField;
};

export function view<ViewProps>(
  renderer: (outerProps: ViewOuterProps<ViewProps>) => Abstract.Atom
) {
  const viewInstantiator = (outerProps: ViewOuterProps<ViewProps>) => {
    const innerProps: Record<string, ReturnType<typeof prop>> = {};
    propsStack.push(innerProps);
    const atom = renderer(outerProps);
    propsStack.pop();
    const viewInstance: Abstract.ViewInstance = {
      kind: "viewInstance",
      view: {
        kind: "view",
        innerProps: Object.values(innerProps).reduce(
          (acc, prop) => {
            acc[prop._name] = prop._field;
            return acc;
          },
          {} as Record<string, Abstract.Field>
        ),
        stage: [atom],
      },
      outerProps: Object.values(innerProps).reduce(
        (acc, prop) => {
          acc[prop._name] = prop._field;
          return acc;
        },
        {} as Record<string, Abstract.Field>
      ),
    };
    return viewInstance;
  };
  return viewInstantiator;
}
