// src/scenes/menu.js - Menu scene for the fruit sorting game
import k from "../kaplayCtx";

export default function menu() {
  k.add([
    k.text("Fruit Sorting Game", {
      size: 48,
    }),
    k.pos(k.center().x, 150),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  k.add([
    k.text("Sort fruits into matching baskets!", {
      size: 24,
    }),
    k.pos(k.center().x, 220),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  k.add([
    k.text("Watch the boy throw fruits or catch falling ones!", {
      size: 18,
    }),
    k.pos(k.center().x, 250),
    k.anchor("center"),
    k.color(200, 200, 255),
  ]);

  k.add([
    k.text("Mango (M) → Yellow Basket", {
      size: 18,
    }),
    k.pos(k.center().x, 280),
    k.anchor("center"),
    k.color(255, 215, 0),
  ]);

  k.add([
    k.text("Orange (O) → Orange Basket", {
      size: 18,
    }),
    k.pos(k.center().x, 310),
    k.anchor("center"),
    k.color(255, 165, 0),
  ]);

  const startButton = k.add([
    k.rect(200, 60),
    k.pos(k.center().x, 400),
    k.anchor("center"),
    k.area(),
    k.color(0, 150, 0),
    "button",
  ]);

  k.add([
    k.text("START GAME", {
      size: 24,
    }),
    k.pos(k.center().x, 400),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  startButton.onClick(() => {
    k.go("game");
  });

  k.onButtonPress("click", () => {
    k.go("game");
  });
}
