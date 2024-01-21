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

export const ViewTemplate = (
  innerProps: Abstract.ViewTemplate["innerProps"],
  ...stage: Abstract.ViewTemplate["stage"]
): Abstract.ViewTemplate => ({
  kind: "viewTemplate",
  innerProps,
  stage,
});

export const ModelTemplate = (
  innerProps: Abstract.ModelTemplate["innerProps"]
): Abstract.ModelTemplate => ({
  kind: "modelTemplate",
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

export const View = (
  viewTemplate: Abstract.View["viewTemplate"],
  outerProps: Abstract.View["outerProps"] = {}
): Abstract.View => ({
  kind: "view",
  viewTemplate,
  outerProps,
});

export const Model = (
  modelTemplate: Abstract.Model["modelTemplate"],
  outerProps: Abstract.Model["outerProps"] = {}
): Abstract.Model => ({
  kind: "model",
  modelTemplate,
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
