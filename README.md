# ViewScript-Bridge

_Source code for the ViewScript Bridge_

## Start

You can add ViewScript-Bridge to an existing project.

```
npm install viewscript-bridge
```

If you're just getting started, we recommend using the global ViewScript CLI to create a new project:

```
npm install viewscript --global
&&
viewscript bridge YourProjectName
&&
cd YourProjectName
&&
npm start
```

```ts
import { view, element } from "viewscript-bridge";

view("Hello, world!", [
  element("p", {
    content: "Hello, world!",
  }),
]);
```
