import { Abstract, App } from "viewscript-runtime";

let props: Record<string, ReturnType<typeof value>> | undefined;

export function imply(condition: ReturnType<typeof value>) {
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

export function render(atom: Abstract.Atom | (() => Abstract.Atom)) {
  props = {};
  const renderedAtom = typeof atom === "function" ? atom() : atom;
  const app: Abstract.App = {
    kind: "app",
    innerProps: Object.values(props).reduce(
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

export function value(value: unknown) {
  const boxedField = {
    _kind: "BoxedField",
    _name: window.crypto.randomUUID(),
    _field: {
      kind: "field",
      content: {
        kind: "rawValue",
        value,
      },
    } as Abstract.Field,
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
  } as const;
  if (props) {
    props[boxedField._name] = boxedField;
  }
  return boxedField;
}
