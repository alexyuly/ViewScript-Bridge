# ViewScript-Bridge

_ViewScript's TypeScript developer interface_

## Start

If you're just getting started, then please use the global ViewScript CLI to create a new project:

```
npm install viewscript --global
&&
viewscript bridge YourProjectName
&&
cd YourProjectName
&&
npm start
```

Or, you can add ViewScript-Bridge to an existing project:

```
npm install viewscript-bridge
```

## Examples

### HelloWorld

```ts
import { view, element } from "viewscript-bridge";

view("HelloWorld", [
  element("p", {
    content: "Hello, world!",
  }),
]);
```

### Log when button clicked

```ts
import { view, element, $ } from "viewscript-bridge";

view("Log when button clicked", [
  element("button", {
    content: "Click me!",
    click: $("window.console.log", "You clicked the button."),
  }),
]);
```

### Update section while hovered

```ts
import { view, condition, element, conditional, $ } from "viewscript-bridge";

view("Update section while hovered", [
  condition("hovered", false),
  element("section", {
    background: conditional($("hovered"), "black", "white"),
    color: conditional($("hovered"), "white", "black"),
    content: conditional($("hovered"), "I am hovered.", "Hover me!"),
    font: "24px serif bold",
    padding: "24px",
    pointerleave: $("hovered.disable"),
    pointerover: $("hovered.enable"),
  }),
]);
```
