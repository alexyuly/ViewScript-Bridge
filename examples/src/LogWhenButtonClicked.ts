import { render, view, element, browser } from "../../lib";

render(
  view(
    element("button", {
      content: "Click me!",
      click: browser.console.log("You clicked the button."),
    })
  )
);
