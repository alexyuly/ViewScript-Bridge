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
  fallback,
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

export const Expectation = (
  means: Abstract.Expectation["means"]
): Abstract.Expectation => ({
  kind: "expectation",
  means,
});

export const Emitter = (
  ...steps: Abstract.Emitter["steps"]
): Abstract.Emitter => ({
  kind: "emitter",
  steps,
});

/**
 * Actions:
 */

export const Action = (
  params: Abstract.Action["params"],
  handler: Abstract.Action["handler"]
): Abstract.Action => ({
  kind: "action",
  params,
  handler,
});

export const Procedure = (
  steps: Abstract.Procedure["steps"],
  fallback?: Abstract.Field["fallback"]
): Abstract.Procedure => ({
  kind: "procedure",
  steps,
  fallback,
});

export const Call = (
  scope: Abstract.Call["scope"] | null,
  actionName: Abstract.Call["actionName"],
  ...args: Abstract.Call["args"]
): Abstract.Call => ({
  kind: "call",
  scope: scope ?? undefined,
  actionName,
  args,
});

export const Decision = (
  condition: Abstract.Decision["condition"],
  consequence: Abstract.Decision["consequence"],
  alternative?: Abstract.Decision["alternative"]
): Abstract.Decision => ({
  kind: "decision",
  condition,
  consequence,
  alternative: alternative ?? undefined,
});

export const Invocation = (
  args: Abstract.Invocation["args"],
  target?: Abstract.Invocation["target"]
): Abstract.Invocation => ({
  kind: "invocation",
  args,
  target,
});
