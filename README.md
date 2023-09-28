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
import { view, element, ref } from "viewscript-bridge";

view("Log when button clicked", [
  element("button", {
    content: "Click me!",
    click: ref("window.console.log", "You clicked the button."),
  }),
]);
```

### Update section while hovered

```ts
import { view, element, ref, condition, conditional } from "viewscript-bridge";

view("Update section while hovered", [
  condition("hovered", false),
  element("section", {
    background: conditional(ref("hovered"), "black", "white"),
    color: conditional(ref("hovered"), "white", "black"),
    content: conditional(ref("hovered"), "I am hovered.", "Hover me!"),
    font: "24px serif bold",
    padding: "24px",
    pointerleave: ref("hovered.disable"),
    pointerover: ref("hovered.enable"),
  }),
]);
```
