/* eslint-disable no-unused-vars */
// src/scenes/game.js - Simple Fruit Catcher Game
import k from "../kaplayCtx";

export default function game() {
  // Simple game constants
  const FRUIT_TYPES = [
    { type: "mango", color: [255, 215, 0] }, // Yellow
    { type: "orange", color: [255, 165, 0] }, // Orange
  ];
  const GAME_DURATION = 60;

  // Game state
  let score = 0;
  let timeLeft = GAME_DURATION;
  let basketColor = "yellow"; // Current basket color

  // Set normal cursor
  k.setCursor("default");

  // Load simple fruit sprites
  k.loadSprite(
    "mango",
    "data:image/svg+xml," +
      encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
      </svg>
    `)
  );

  k.loadSprite(
    "orange",
    "data:image/svg+xml," +
      encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#FFA500" stroke="#FF6347" stroke-width="2"/>
      </svg>
    `)
  );

  // Simple UI
  const scoreText = k.add([
    k.text(`Score: ${score}`, { size: 24 }),
    k.pos(20, 20),
    k.color(255, 255, 255),
  ]);

  const timeText = k.add([
    k.text(`Time: ${timeLeft}`, { size: 24 }),
    k.pos(k.width() - 20, 20),
    k.anchor("topright"),
    k.color(255, 255, 255),
  ]);

  const instructionText = k.add([
    k.text("Use A/D or Arrow Keys to move basket", { size: 18 }),
    k.pos(k.width() / 2, 60),
    k.anchor("center"),
    k.color(200, 200, 200),
  ]);

  // Create the moving basket
  const basket = k.add([
    k.sprite("basket"),
    k.pos(k.width() / 2, k.height() - 100),
    k.anchor("center"),
    k.area(),
    k.scale(1),
    "basket",
    {
      speed: 300,
      targetColor: "yellow", // What color fruit it should catch
    },
  ]);

  // Start with yellow basket
  basket.color = k.rgb(255, 215, 0);

  // Color indicator above basket
  const colorIndicator = k.add([
    k.text("YELLOW", { size: 16 }),
    k.pos(basket.pos.x, basket.pos.y - 60),
    k.anchor("center"),
    k.color(255, 215, 0),
  ]);

  // Basket movement controls
  k.onKeyDown("left", () => {
    if (basket.pos.x > 60) {
      basket.move(-basket.speed, 0);
      colorIndicator.pos.x = basket.pos.x;
    }
  });

  k.onKeyDown("right", () => {
    if (basket.pos.x < k.width() - 60) {
      basket.move(basket.speed, 0);
      colorIndicator.pos.x = basket.pos.x;
    }
  });

  k.onKeyDown("a", () => {
    if (basket.pos.x > 60) {
      basket.move(-basket.speed, 0);
      colorIndicator.pos.x = basket.pos.x;
    }
  });

  k.onKeyDown("d", () => {
    if (basket.pos.x < k.width() - 60) {
      basket.move(basket.speed, 0);
      colorIndicator.pos.x = basket.pos.x;
    }
  });

  // Function to change basket color randomly
  function changeBasketColor() {
    const newColor = k.choose(["yellow", "orange"]);
    basket.targetColor = newColor;
    
    if (newColor === "yellow") {
      basket.color = k.rgb(255, 215, 0);
      colorIndicator.color = k.rgb(255, 215, 0);
      colorIndicator.text = "YELLOW";
    } else {
      basket.color = k.rgb(255, 165, 0);
      colorIndicator.color = k.rgb(255, 165, 0);
      colorIndicator.text = "ORANGE";
    }
  }

  // Spawn falling fruits
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

    fruit.gravityScale = 0.5; // Slower falling
  }

  // Check fruit collection
  function checkCollection(fruit) {
    const distance = fruit.pos.dist(basket.pos);
    if (distance < 50 && !fruit.collected) {
      fruit.collected = true;
      
      // Check if correct color
      const fruitColor = fruit.type === "mango" ? "yellow" : "orange";
      if (fruitColor === basket.targetColor) {
        // Correct match!
        score += 10;
        
        // Show success effect
        const successText = k.add([
          k.text("+10", { size: 20 }),
          k.pos(fruit.pos),
          k.color(0, 255, 0),
          k.anchor("center"),
        ]);
        
        k.tween(successText.pos.y, successText.pos.y - 50, 1, (val) => successText.pos.y = val)
          .then(() => k.destroy(successText));
          
      } else {
        // Wrong color - penalty
        score = Math.max(0, score - 5);
        
        // Show penalty effect
        const penaltyText = k.add([
          k.text("-5", { size: 20 }),
          k.pos(fruit.pos),
          k.color(255, 0, 0),
          k.anchor("center"),
        ]);
        
        k.tween(penaltyText.pos.y, penaltyText.pos.y - 50, 1, (val) => penaltyText.pos.y = val)
          .then(() => k.destroy(penaltyText));
      }
      
      k.destroy(fruit);
    }
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

  // Spawn fruits every 1.5 seconds
  timer.loop(1.5, () => {
    spawnFruit();
  });

  // Change basket color every 8 seconds
  timer.loop(8, () => {
    changeBasketColor();
  });

  // Game loop
  k.onUpdate(() => {
    // Update score display
    scoreText.text = `Score: ${score}`;

    // Check collections and cleanup
    k.get("fruit").forEach((fruit) => {
      if (!fruit.collected) {
        checkCollection(fruit);

        // Remove fruits that fall off screen
        if (fruit.pos.y > k.height() + 50) {
          k.destroy(fruit);
        }
      }
    });
  });
}
