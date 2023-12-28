import { Abstract, App } from "viewscript-runtime";

type OuterProps = Record<
  string,
  | Abstract.Atom
  | boolean
  | string
  | Array<string | Abstract.Atom>
  | BaseProp // reference
  | Omit<ReturnType<ReturnType<typeof _if>["then"]>, "else"> // implication
  | Abstract.Action
  | (() => Array<Abstract.Action>) // procedure
>;

type BaseProp = {
  _fieldName: string;
  _field: Abstract.Field;
  set: (value: unknown) => Abstract.Action;
};

type BooleanProp = BaseProp & {
  toggle: Abstract.Action;
};

type StringProp = BaseProp;

type ListProp = BaseProp & {
  push: (value: unknown) => Abstract.Action;
};

type HtmlFormElementProp = BaseProp & {
  reset: Abstract.Action;
};

const propsStack: Array<Record<string, Abstract.View | BaseProp>> = [];

export function render(renderer: Abstract.Atom | (() => Abstract.Atom)) {
  const innerProps: Record<string, Abstract.View | BaseProp> = {};
  propsStack.push(innerProps);
  const atom = typeof renderer === "function" ? renderer() : renderer;
  propsStack.pop();
  const app: Abstract.App = {
    kind: "app",
    innerProps: Object.entries(innerProps).reduce(
      (acc, [key, prop]) => {
        if ("_fieldName" in prop) {
          acc[key] = prop._field;
        } else if (Abstract.isComponent(prop) && prop.kind === "view") {
          acc[key] = prop;
        }
        return acc;
      },
      {} as Record<string, Abstract.Field | Abstract.View>
    ),
    stage: [atom],
  };
  console.log("raw app", app);
  console.log("hydrated app", new App(app));
}

export function view(
  viewName: string,
  renderer: (outerProps: OuterProps) => Abstract.Atom
) {
  const innerProps: Record<string, BaseProp> = {};
  propsStack.push(innerProps);
  const atom = renderer({});
  propsStack.pop();
  const view: Abstract.View = {
    kind: "view",
    innerProps: Object.values(innerProps).reduce(
      (acc, prop) => {
        acc[prop._fieldName] = prop._field;
        return acc;
      },
      {} as Record<string, Abstract.Field>
    ),
    stage: [atom],
  };
  propsStack[propsStack.length - 1][viewName] = view;
  const viewInstantiator = (outerProps: OuterProps) => {
    const viewInstance: Abstract.ViewInstance = {
      kind: "viewInstance",
      view: viewName,
      outerProps: Object.entries(outerProps).reduce(
        (acc, [key, value]) => {
          if (typeof value === "boolean" || typeof value === "string") {
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
                    `Invalid prop ${key}: ${JSON.stringify(value)}`
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
            acc[key] = value._field;
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
            throw new Error(`Invalid prop ${key}: ${JSON.stringify(value)}`);
          }
          return acc;
        },
        {} as Abstract.Atom["outerProps"]
      ),
    };
    return viewInstance;
  };
  return viewInstantiator;
}

export function tag(name: string, outerProps: OuterProps) {
  const atom: Abstract.Atom = {
    kind: "atom",
    tagName: name,
    outerProps: Object.entries(outerProps).reduce(
      (acc, [key, value]) => {
        if (typeof value === "boolean" || typeof value === "string") {
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
          acc[key] = {
            kind: "action",
            target: {
              kind: "procedure",
              steps: value(),
              parameterName: "it",
            },
          };
        } else if (value === undefined) {
          acc[key] = {
            kind: "field",
            content: {
              kind: "reference",
              fieldName: key,
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

export function _if(condition: BaseProp) {
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

export function boolean(_fieldName: string, value: boolean): BooleanProp {
  const boxedField: BooleanProp = booleanProp(_fieldName, {
    kind: "rawValue",
    value,
  });
  if (propsStack.length > 0) {
    propsStack[propsStack.length - 1][boxedField._fieldName] = boxedField;
  }
  return boxedField;
}

export function string(_fieldName: string, value: string): StringProp {
  const boxedField: StringProp = stringProp(_fieldName, {
    kind: "rawValue",
    value,
  });
  if (propsStack.length > 0) {
    propsStack[propsStack.length - 1][boxedField._fieldName] = boxedField;
  }
  return boxedField;
}

export function list(_fieldName: string, value: Array<unknown> = []): ListProp {
  const boxedField: ListProp = listProp(_fieldName, {
    kind: "rawValue",
    value,
  });
  if (propsStack.length > 0) {
    propsStack[propsStack.length - 1][boxedField._fieldName] = boxedField;
  }
  return boxedField;
}

function baseProp(
  _fieldName: string,
  content: Abstract.Field["content"]
): BaseProp {
  const boxedField: BaseProp = {
    _fieldName,
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
          arguments: [
            {
              kind: "field",
              content: {
                kind: "rawValue",
                value: argument,
              },
            },
          ],
        },
      };
      return action;
    },
  };
  return boxedField;
}

function booleanProp(
  _fieldName: string,
  content: Abstract.Field["content"]
): BooleanProp {
  const baseField = baseProp(_fieldName, content);
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
        arguments: [],
      },
    },
  };
  return boxedField;
}

function stringProp(
  _fieldName: string,
  content: Abstract.Field["content"]
): StringProp {
  const baseField = baseProp(_fieldName, content);
  return baseField;
}

function listProp(
  _fieldName: string,
  content: Abstract.Field["content"]
): ListProp {
  const baseField = baseProp(_fieldName, content);
  const boxedField: ListProp = {
    ...baseField,
    push: (argument: unknown) => {
      // TODO: Strengthen the type of argument to always be a RawValue.
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
          arguments: [
            {
              kind: "field",
              content: isArgumentRenderable
                ? (argument as Abstract.Atom | Abstract.ViewInstance)
                : {
                    kind: "rawValue",
                    value: argument,
                  },
            },
          ],
        },
      };
      return action;
    },
  };
  return boxedField;
}

function htmlFormElementProp(
  content: Abstract.Field["content"],
  _fieldName: string
): HtmlFormElementProp {
  const baseField = baseProp(_fieldName, content);
  const boxedField: HtmlFormElementProp = {
    ...baseField,
    reset: {
      kind: "action",
      target: {
        kind: "call",
        scope: {
          kind: "field",
          content,
        },
        actionName: "reset",
        arguments: [],
      },
    },
  };
  return boxedField;
}

export const SubmitEvent = {
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
      arguments: [],
    },
  } as Abstract.Action,
  target: htmlFormElementProp(
    {
      kind: "reference",
      scope: {
        kind: "field",
        content: {
          kind: "reference",
          fieldName: "it",
        },
      },
      fieldName: "target",
    },
    "target"
  ),
};

export const FormData = (form: BaseProp) => ({
  get: (key: string) =>
    stringProp(crypto.randomUUID(), {
      kind: "expression",
      scope: {
        kind: "field",
        content: {
          kind: "expression",
          methodName: "FormData",
          arguments: [form._field],
        },
      },
      methodName: "get",
      arguments: [
        {
          kind: "field",
          content: {
            kind: "rawValue",
            value: key,
          },
        },
      ],
    }),
});
