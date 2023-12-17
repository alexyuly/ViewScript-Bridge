import { Abstract, App } from "viewscript-runtime";
// import type { BoxedField, BoxedAction } from "./types";

export function tag(name: string, props: Record<string, string>) {
  const atom: Abstract.Atom = {
    kind: "atom",
    tagName: name,
    outerProps: Object.entries(props).reduce(
      (acc, [key, value]) => {
        acc[key] = {
          kind: "field",
          content: {
            kind: "rawValue",
            value,
          },
        };
        return acc;
      },
      {} as Abstract.Atom["outerProps"]
    ),
  };
  return atom;
}

export function render(atom: Abstract.Atom) {
  const app: Abstract.App = {
    kind: "app",
    innerProps: {},
    stage: [atom],
  };
  console.log("app", app);
  new App(app);
}
