// src/scenes/gameover.js - Game over scene
import k from "../kaplayCtx";

export default function gameover(isWin, finalScore) {
  const title = isWin ? "YOU WON!" : "GAME OVER";
  const titleColor = isWin ? [0, 255, 0] : [255, 0, 0];

  k.add([
    k.text(title, {
      size: 48,
    }),
    k.pos(k.center().x, 200),
    k.anchor("center"),
    k.color(titleColor[0], titleColor[1], titleColor[2]),
  ]);

  k.add([
    k.text(`Final Score: ${finalScore}`, {
      size: 32,
    }),
    k.pos(k.center().x, 280),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  const playAgainButton = k.add([
    k.rect(200, 60),
    k.pos(k.center().x, 380),
    k.anchor("center"),
    k.area(),
    k.color(0, 100, 200),
    "button",
  ]);

  k.add([
    k.text("PLAY AGAIN", {
      size: 20,
    }),
    k.pos(k.center().x, 380),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  playAgainButton.onClick(() => {
    k.go("menu");
  });

  const menuButton = k.add([
    k.rect(200, 60),
    k.pos(k.center().x, 460),
    k.anchor("center"),
    k.area(),
    k.color(100, 100, 100),
    "button",
  ]);

  k.add([
    k.text("MAIN MENU", {
      size: 20,
    }),
    k.pos(k.center().x, 460),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  menuButton.onClick(() => {
    k.go("menu");
  });

  k.onButtonPress("click", () => {
    k.go("menu");
  });
}
