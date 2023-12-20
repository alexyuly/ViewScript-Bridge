import { Abstract, App } from "viewscript-runtime";

const propsStack: Array<Record<string, FieldProp>> = [];

export function imply(condition: FieldProp) {
  const implyFirstPart = {
    then: (consequence: string) => {
      const implication = {
        _implication: {
          kind: "implication",
          condition: {
            kind: "field",
            content: {
              kind: "reference",
              fieldName: condition._fieldName,
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

type FieldProp = {
  _fieldName: string;
  _field: Abstract.Field;
  set: (value: unknown) => Abstract.Action;
};

type BooleanProp = FieldProp & {
  toggle: Abstract.Action;
};

type ListProp = FieldProp & {
  push: (value: unknown) => Abstract.Action;
};

type StringProp = FieldProp;

function baseProp(content: Abstract.Field["content"]): FieldProp {
  const boxedField: FieldProp = {
    _fieldName: window.crypto.randomUUID(),
    _field: {
      kind: "field",
      content,
    },
    set: (argument: unknown) => {
      const action: Abstract.Action = {
        kind: "action",
        target: {
          kind: "call",
          scope: {
            kind: "field",
            content: {
              kind: "reference",
              fieldName: boxedField._fieldName,
            },
          },
          actionName: "set",
          argument: {
            kind: "field",
            content: {
              kind: "rawValue",
              value: argument,
            },
          },
        },
      };
      return action;
    },
  };
  return boxedField;
}

function booleanProp(content: Abstract.Field["content"]): BooleanProp {
  const baseField = baseProp(content);
  const boxedField: BooleanProp = {
    ...baseField,
    toggle: {
      kind: "action",
      target: {
        kind: "call",
        scope: {
          kind: "field",
          content: {
            kind: "reference",
            fieldName: baseField._fieldName,
          },
        },
        actionName: "toggle",
      },
    },
  };
  return boxedField;
}

export function boolean(value: boolean): BooleanProp {
  const boxedField: BooleanProp = booleanProp({
    kind: "rawValue",
    value,
  });
  if (propsStack.length > 0) {
    propsStack[propsStack.length - 1][boxedField._fieldName] = boxedField;
  }
  return boxedField;
}

function listProp(content: Abstract.Field["content"]): ListProp {
  const baseField = baseProp(content);
  const boxedField: ListProp = {
    ...baseField,
    push: (argument: unknown) => {
      const isArgumentRenderable =
        Abstract.isComponent(argument) &&
        (argument.kind === "atom" || argument.kind === "viewInstance");
      const action: Abstract.Action = {
        kind: "action",
        target: {
          kind: "call",
          scope: {
            kind: "field",
            content: {
              kind: "reference",
              fieldName: boxedField._fieldName,
            },
          },
          actionName: "push",
          argument: {
            kind: "field",
            content: isArgumentRenderable
              ? (argument as Abstract.Atom | Abstract.ViewInstance)
              : {
                  kind: "rawValue",
                  value: argument,
                },
          },
        },
      };
      return action;
    },
  };
  return boxedField;
}

export function list(value: Array<unknown> = []): ListProp {
  const boxedField: ListProp = listProp({
    kind: "rawValue",
    value,
  });
  if (propsStack.length > 0) {
    propsStack[propsStack.length - 1][boxedField._fieldName] = boxedField;
  }
  return boxedField;
}

function stringProp(content: Abstract.Field["content"]): StringProp {
  const baseField = baseProp(content);
  return baseField;
}

export function string(value: string): StringProp {
  const boxedField: StringProp = stringProp({
    kind: "rawValue",
    value,
  });
  if (propsStack.length > 0) {
    propsStack[propsStack.length - 1][boxedField._fieldName] = boxedField;
  }
  return boxedField;
}

export function render(atom: Abstract.Atom | (() => Abstract.Atom)) {
  const innerProps: Record<string, FieldProp> = {};
  propsStack.push(innerProps);
  const renderedAtom = typeof atom === "function" ? atom() : atom;
  propsStack.pop();
  const app: Abstract.App = {
    kind: "app",
    innerProps: Object.values(innerProps).reduce(
      (acc, prop) => {
        acc[prop._fieldName] = prop._field;
        return acc;
      },
      {} as Record<string, Abstract.Field>
    ),
    stage: [renderedAtom],
  };
  new App(app);
}

type Data =
  | string
  | Abstract.Atom
  | Array<Abstract.Atom>
  | Omit<ReturnType<ReturnType<typeof imply>["then"]>, "else"> // implication
  | FieldProp; // reference

type Props = Record<
  string,
  Data | Abstract.Action | (() => Abstract.Action | Array<Abstract.Action>)
>;

export function tag(name: string, props: Props) {
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
        } else if (Abstract.isComponent(value) && value.kind === "atom") {
          acc[key] = {
            kind: "field",
            content: value,
          };
        } else if (value instanceof Array) {
          acc[key] = {
            kind: "field",
            content: {
              kind: "rawValue",
              value: value.map((item) => {
                if (typeof item === "string") {
                  return {
                    kind: "field",
                    content: {
                      kind: "rawValue",
                      value: item,
                    },
                  };
                }
                if (Abstract.isComponent(item) && item.kind === "atom") {
                  return {
                    kind: "field",
                    content: item,
                  };
                }
                throw new Error(
                  `Tag ${name} has invalid prop ${key}: ${JSON.stringify(
                    value
                  )}`
                );
              }),
            },
          };
        } else if (Abstract.isRawObject(value) && "_implication" in value) {
          acc[key] = {
            kind: "field",
            content: value._implication,
          };
        } else if (Abstract.isRawObject(value) && "_fieldName" in value) {
          acc[key] = {
            kind: "field",
            content: {
              kind: "reference",
              fieldName: value._fieldName,
            },
          };
        } else if (Abstract.isComponent(value) && value.kind === "action") {
          acc[key] = value;
        } else if (typeof value === "function") {
          const steps = value();
          acc[key] = {
            kind: "action",
            target: {
              kind: "procedure",
              steps: steps instanceof Array ? steps : [steps],
              parameterName: "it",
            },
          };
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

// TODO Don't duplicate the view for every single instance
export function view<ViewProps>(
  renderer: (outerProps: Props) => Abstract.Atom
) {
  const viewInstantiator = (outerProps: Props) => {
    const innerProps: Record<string, FieldProp> = {};
    propsStack.push(innerProps);
    const atom = renderer(outerProps);
    propsStack.pop();
    const viewInstance: Abstract.ViewInstance = {
      kind: "viewInstance",
      view: {
        kind: "view",
        innerProps: Object.values(innerProps).reduce(
          (acc, prop) => {
            acc[prop._fieldName] = prop._field;
            return acc;
          },
          {} as Record<string, Abstract.Field>
        ),
        stage: [atom],
      },
      outerProps: Object.entries(outerProps).reduce(
        (acc, [key, value]) => {
          if (typeof value === "string") {
            acc[key] = {
              kind: "field",
              content: {
                kind: "rawValue",
                value,
              },
            };
          } else if (Abstract.isComponent(value) && value.kind === "atom") {
            acc[key] = {
              kind: "field",
              content: value,
            };
          } else if (value instanceof Array) {
            acc[key] = {
              kind: "field",
              content: {
                kind: "rawValue",
                value: value.map((item) => {
                  if (typeof item === "string") {
                    return {
                      kind: "field",
                      content: {
                        kind: "rawValue",
                        value: item,
                      },
                    };
                  }
                  if (Abstract.isComponent(item) && item.kind === "atom") {
                    return {
                      kind: "field",
                      content: item,
                    };
                  }
                  throw new Error(
                    `Tag ${name} has invalid prop ${key}: ${JSON.stringify(
                      value
                    )}`
                  );
                }),
              },
            };
          } else if (Abstract.isRawObject(value) && "_implication" in value) {
            acc[key] = {
              kind: "field",
              content: value._implication,
            };
          } else if (Abstract.isRawObject(value) && "_fieldName" in value) {
            acc[value._fieldName] = value._field;
          } else if (Abstract.isComponent(value) && value.kind === "action") {
            acc[key] = value;
          } else if (typeof value === "function") {
            const steps = value();
            acc[key] = {
              kind: "action",
              target: {
                kind: "procedure",
                steps: steps instanceof Array ? steps : [steps],
                parameterName: "it",
              },
            };
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
    return viewInstance;
  };
  viewInstantiator.list = list;
  return viewInstantiator;
}

export const Event = {
  preventDefault: {
    kind: "action",
    target: {
      kind: "call",
      scope: {
        kind: "field",
        content: {
          kind: "reference",
          fieldName: "it",
        },
      },
      actionName: "preventDefault",
    },
  } as Abstract.Action,
  target: baseProp({
    kind: "reference",
    scope: {
      kind: "field",
      content: {
        kind: "reference",
        fieldName: "it",
      },
    },
    fieldName: "target",
  }),
};

export const Window = {
  FormData: (form: FieldProp) => ({
    get: (key: string) =>
      stringProp({
        kind: "invocation",
        scope: {
          kind: "field",
          content: {
            kind: "invocation",
            scope: {
              kind: "field",
              content: {
                kind: "reference",
                fieldName: "window",
              },
            },
            methodName: "FormData",
            argument: form._field,
          },
        },
        methodName: "get",
        argument: {
          kind: "field",
          content: {
            kind: "rawValue",
            value: key,
          },
        },
      }),
  }),
};
