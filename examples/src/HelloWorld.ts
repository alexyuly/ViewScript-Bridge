import { render, view, element } from "../../lib";

render(
  view(
    element("p", {
      content: "Hello, world!",
    })
  )
);
