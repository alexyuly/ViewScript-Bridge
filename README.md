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

render(
  view(
    element("p", {
      content: "Hello, world!",
    })
  )
);
```

### Log when button clicked

```ts
import { render, view, element, browser } from "../../lib";

render(
  view(
    element("button", {
      content: "Click me!",
      click: browser.console.log("You clicked the button."),
    })
  )
);
```

### Update section while hovered

```ts
import { render, view, condition, element, conditional } from "../../lib";

function UpdateSectionWhileHovered() {
  const hovered = condition(false);

  return view(
    hovered,
    element("section", {
      background: conditional(hovered, "black", "white"),
      color: conditional(hovered, "white", "black"),
      content: conditional(hovered, "I am hovered.", "Hover me!"),
      font: "24px serif bold",
      padding: "24px",
      pointerleave: hovered.disable(),
      pointerover: hovered.enable(),
    })
  );
}

render(UpdateSectionWhileHovered());
```
