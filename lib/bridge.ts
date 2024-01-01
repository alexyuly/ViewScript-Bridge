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
  parameterName: Abstract.Method["parameterName"] | null,
  result: Abstract.Method["result"]
): Abstract.Method => ({
  kind: "method",
  parameterName: parameterName ?? undefined,
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

export const Implication = (
  condition: Abstract.Implication["condition"],
  consequence: Abstract.Implication["consequence"],
  alternative?: Abstract.Implication["alternative"]
): Abstract.Implication => ({
  kind: "implication",
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
  parameterName: Abstract.Procedure["parameterName"] | null,
  ...steps: Abstract.Procedure["steps"]
): Abstract.Procedure => ({
  kind: "procedure",
  parameterName: parameterName ?? undefined,
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

export const Gate = (
  condition: Abstract.Gate["condition"],
  consequence?: Abstract.Gate["consequence"]
): Abstract.Gate => ({
  kind: "gate",
  condition,
  consequence: consequence ?? undefined,
});
