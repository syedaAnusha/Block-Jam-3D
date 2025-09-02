// src/scenes/game.js - Main game scene
import k from "../kaplayCtx";

export default function game() {
  // Game constants
  const FRUIT_TYPES = [
    { type: "mango", color: [255, 215, 0] },
    { type: "orange", color: [255, 165, 0] },
  ];
  const BASKET_CAPACITY = 3;
  const GAME_DURATION = 30;

  // Game state
  let score = 0;
  let timeLeft = GAME_DURATION;
  let baskets = [];
  let spawnTimer = 0;

  // Load sprites using simple rectangles
  k.loadSprite(
    "mango",
    "data:image/svg+xml," +
      encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
        <text x="20" y="26" text-anchor="middle" font-size="12" fill="#FF8C00">M</text>
      </svg>
    `)
  );

  k.loadSprite(
    "orange",
    "data:image/svg+xml," +
      encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#FFA500" stroke="#FF6347" stroke-width="2"/>
        <text x="20" y="26" text-anchor="middle" font-size="12" fill="#8B0000">O</text>
      </svg>
    `)
  );

  // Create baskets
  baskets = [
    {
      pos: k.vec2(150, 500),
      color: [255, 215, 0],
      type: "mango",
      fruits: [],
      capacity: BASKET_CAPACITY,
    },
    {
      pos: k.vec2(650, 500),
      color: [255, 165, 0],
      type: "orange",
      fruits: [],
      capacity: BASKET_CAPACITY,
    },
  ];

  // UI elements
  const scoreText = k.add([
    k.text(`Score: ${score}`, {
      size: 24,
    }),
    k.pos(20, 30),
    k.color(255, 255, 255),
  ]);

  const timeText = k.add([
    k.text(`Time: ${timeLeft}`, {
      size: 24,
    }),
    k.pos(k.width() - 20, 30),
    k.anchor("topright"),
    k.color(255, 255, 255),
  ]);

  // Draw baskets
  baskets.forEach((basket) => {
    k.add([
      k.rect(120, 80),
      k.pos(basket.pos.x - 60, basket.pos.y - 40),
      k.color(basket.color[0], basket.color[1], basket.color[2]),
      k.outline(4, [0, 0, 0]),
    ]);

    k.add([
      k.text(basket.type.toUpperCase(), {
        size: 16,
      }),
      k.pos(basket.pos.x, basket.pos.y - 10),
      k.anchor("center"),
      k.color(0, 0, 0),
    ]);

    k.add([
      k.text(`${basket.fruits.length}/${basket.capacity}`, {
        size: 14,
      }),
      k.pos(basket.pos.x, basket.pos.y + 10),
      k.anchor("center"),
      k.color(0, 0, 0),
    ]);
  });

  // Spawn falling fruit
  function spawnFruit() {
    const fruitType = k.choose(FRUIT_TYPES);
    const fruit = k.add([
      k.sprite(fruitType.type),
      k.pos(k.rand(50, k.width() - 50), -50),
      k.area(),
      k.body(),
      "fruit",
      {
        type: fruitType.type,
        collected: false,
      },
    ]);

    fruit.gravityScale = 0.3;
  }

  // Check fruit collection
  function checkFruitCollection(fruit) {
    baskets.forEach((basket) => {
      const distance = fruit.pos.dist(basket.pos);
      if (distance < 80 && !fruit.collected) {
        if (fruit.type === basket.type) {
          // Correct basket
          basket.fruits.push(fruit);
          score += 10;
          fruit.collected = true;
          k.destroy(fruit);

          // Check win condition
          if (basket.fruits.length >= basket.capacity) {
            k.go("gameover", true, score);
          }
        } else {
          // Wrong basket - penalty
          score = Math.max(0, score - 5);
          fruit.collected = true;
          k.destroy(fruit);
        }
      }
    });
  }

  // Game timer
  const timer = k.add([k.timer()]);

  timer.loop(1, () => {
    timeLeft--;
    timeText.text = `Time: ${timeLeft}`;

    if (timeLeft <= 0) {
      k.go("gameover", false, score);
    }
  });

  // Game loop
  k.onUpdate(() => {
    spawnTimer += k.dt();

    if (spawnTimer > 1.5) {
      spawnFruit();
      spawnTimer = 0;
    }

    // Update score display
    scoreText.text = `Score: ${score}`;

    // Check fruit collections and remove fruits that fall off screen
    k.get("fruit").forEach((fruit) => {
      if (!fruit.collected) {
        checkFruitCollection(fruit);

        // Remove fruits that fall off screen
        if (fruit.pos.y > k.height() + 50) {
          k.destroy(fruit);
        }
      }
    });

    // Check win condition
    if (baskets.some((basket) => basket.fruits.length >= basket.capacity)) {
      k.go("gameover", true, score);
    }
  });
}
