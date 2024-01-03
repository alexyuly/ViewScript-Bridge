import { Abstract, App as RuntimeApp } from "viewscript-runtime";

/**
 * Foundation:
 */

export const App = (
  innerProps: Abstract.App["innerProps"],
  ...stage: Abstract.App["stage"]
): RuntimeApp =>
  new RuntimeApp({
    kind: "app",
    innerProps,
    stage,
  });

export const View = (
  innerProps: Abstract.View["innerProps"],
  ...stage: Abstract.View["stage"]
): Abstract.View => ({
  kind: "view",
  innerProps,
  stage,
});

export const Model = (
  innerProps: Abstract.Model["innerProps"]
): Abstract.Model => ({
  kind: "model",
  innerProps,
});

export const Method = (
  params: Abstract.Method["params"],
  result: Abstract.Method["result"]
): Abstract.Method => ({
  kind: "method",
  params,
  result,
});

/**
 * Fields:
 */

export const Field = (
  content: Abstract.Field["content"],
  fallback?: Abstract.Field["fallback"]
): Abstract.Field => ({
  kind: "field",
  content,
  fallback: fallback ?? undefined,
});

export const Expectation = (
  path: Abstract.Expectation["path"]
): Abstract.Expectation => ({
  kind: "expectation",
  path,
});

export const Atom = (
  tagName: Abstract.Atom["tagName"],
  outerProps: Abstract.Atom["outerProps"] = {}
): Abstract.Atom => ({
  kind: "atom",
  tagName,
  outerProps,
});

export const ViewInstance = (
  view: Abstract.ViewInstance["view"],
  outerProps: Abstract.ViewInstance["outerProps"] = {}
): Abstract.ViewInstance => ({
  kind: "viewInstance",
  view,
  outerProps,
});

export const ModelInstance = (
  model: Abstract.ModelInstance["model"],
  outerProps: Abstract.ModelInstance["outerProps"] = {}
): Abstract.ModelInstance => ({
  kind: "modelInstance",
  model,
  outerProps,
});

export const RawValue = (
  value: Abstract.RawValue["value"]
): Abstract.RawValue => ({
  kind: "rawValue",
  value,
});

export const Reference = (
  scope: Abstract.Reference["scope"] | null,
  fieldName: Abstract.Reference["fieldName"]
): Abstract.Reference => ({
  kind: "reference",
  scope: scope ?? undefined,
  fieldName,
});

export const Expression = (
  scope: Abstract.Expression["scope"] | null,
  methodName: Abstract.Expression["methodName"],
  ...args: Abstract.Expression["args"]
): Abstract.Expression => ({
  kind: "expression",
  scope: scope ?? undefined,
  methodName,
  args,
});

export const ConditionalField = (
  condition: Abstract.ConditionalField["condition"],
  consequence: Abstract.ConditionalField["consequence"],
  alternative?: Abstract.ConditionalField["alternative"]
): Abstract.ConditionalField => ({
  kind: "conditionalField",
  condition,
  consequence,
  alternative: alternative ?? undefined,
});

/**
 * Actions:
 */

export const Action = (target: Abstract.Action["target"]): Abstract.Action => ({
  kind: "action",
  target,
});

export const Procedure = (
  params: Abstract.Procedure["params"],
  ...steps: Abstract.Procedure["steps"]
): Abstract.Procedure => ({
  kind: "procedure",
  params,
  steps,
});

export const Call = (
  scope: Abstract.Call["scope"] | null,
  actionName: Abstract.Call["actionName"],
  ...args: Required<Abstract.Call>["args"]
): Abstract.Call => ({
  kind: "call",
  scope: scope ?? undefined,
  actionName,
  args: args.length > 0 ? args : undefined,
});

export const Invocation = (
  prerequisite: Abstract.Invocation["prerequisite"],
  procedure?: Abstract.Invocation["procedure"]
): Abstract.Invocation => ({
  kind: "invocation",
  prerequisite,
  procedure: procedure ?? undefined,
});

export const ConditionalAction = (
  condition: Abstract.ConditionalAction["condition"],
  consequence: Abstract.ConditionalAction["consequence"],
  alternative?: Abstract.ConditionalAction["alternative"]
): Abstract.ConditionalAction => ({
  kind: "conditionalAction",
  condition,
  consequence,
  alternative: alternative ?? undefined,
});
