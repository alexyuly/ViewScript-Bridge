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
import { render, view, element } from "viewscript-bridge";

render(
  view(
    element("p", {
      content: "Hello, world!",
      font: "18px cursive",
      margin: "0 0 24px",
    })
  )
);
```

### Log when button clicked

```ts
import { render, view, element, browser } from "viewscript-bridge";

render(
  view(
    element("button", {
      background: "whitesmoke",
      border: "1px solid gainsboro",
      "border-radius": "4px",
      click: browser.console.log("You clicked the button."),
      content: "Click me!",
      cursor: "pointer",
      "font-size": "18px",
      margin: "0 0 24px",
      padding: "12px",
    })
  )
);
```

### Update section while hovered

```ts
import {
  render,
  view,
  condition,
  element,
  conditional,
} from "viewscript-bridge";

function UpdateSectionWhileHovered() {
  const hovered = condition(false);

  return view(
    hovered,
    element("section", {
      background: conditional(hovered, "black", "white"),
      border: "1px solid black",
      color: conditional(hovered, "white", "black"),
      content: conditional(hovered, "I am hovered.", "Hover me!"),
      font: "bold 24px serif",
      margin: "0 0 24px",
      padding: "24px",
      pointerleave: hovered.disable(),
      pointerover: hovered.enable(),
    })
  );
}

render(UpdateSectionWhileHovered());
```
