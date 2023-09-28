# ViewScript-Bridge

_ViewScript's TypeScript developer interface_

## Start

**✓ If you're just getting started, then please use the global ViewScript CLI to create a new project.**

This is the recommended way, supported by documentation and examples.

```
npm install viewscript --global
&&
viewscript bridge YourProjectName
&&
cd YourProjectName
&&
npm start
```

**⚠️ Or, you can add ViewScript-Bridge to an existing project.**

This is not recommended, but you are welcome to experiment as you wish.

```
npm install viewscript-bridge
```

## Examples

### HelloWorld

```ts
import { render, view, element } from "../../lib";

render([
  view("HelloWorld", [
    element("p", {
      content: "Hello, world!",
    }),
  ]),
]);
```

### Log when button clicked

```ts
import { render, view, element, set } from "viewscript-bridge";

render([
  view("Log when button clicked", [
    element("button", {
      content: "Click me!",
      click: set("window.console.log", "You clicked the button."),
    }),
  ]),
]);
```

### Update section while hovered

```ts
import {
  render,
  view,
  condition,
  element,
  conditional,
  get,
  set,
} from "viewscript-bridge";

render([
  view("Update section while hovered", [
    condition("hovered", false),
    element("section", {
      background: conditional(get("hovered"), "black", "white"),
      color: conditional(get("hovered"), "white", "black"),
      content: conditional(get("hovered"), "I am hovered.", "Hover me!"),
      font: "24px serif bold",
      padding: "24px",
      pointerleave: set("hovered.disable"),
      pointerover: set("hovered.enable"),
    }),
  ]),
]);
```
