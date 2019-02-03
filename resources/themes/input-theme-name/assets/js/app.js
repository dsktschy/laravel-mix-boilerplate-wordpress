import Sample from "./sample";

const sample = new Sample({
  elements: [...document.querySelectorAll(".js-target")],
  classNameActive: "is-active"
});
sample.activate();
