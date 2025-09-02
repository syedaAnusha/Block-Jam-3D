/* eslint-disable no-unused-vars */
// src/scenes/game.js - Mobile-Responsive Fruit Catcher Game
import k from "../kaplayCtx";

export default function game() {
  // Simple game constants
  const FRUIT_TYPES = [
    { type: "mango", color: [255, 215, 0] }, // Yellow
    { type: "orange", color: [255, 165, 0] }, // Orange
  ];
  const GAME_DURATION = 60;

  // Mobile detection - safe for SSR
  const isMobile =
    k.width() < 768 ||
    (typeof window !== "undefined" && "ontouchstart" in window);

  // Responsive sizes
  const fontSize = isMobile ? 20 : 24;
  const basketSize = isMobile ? 0.8 : 1;
  const fruitSize = isMobile ? 35 : 40;
  const basketSpeed = isMobile ? 250 : 300;

  // Game state
  let score = 0;
  let timeLeft = GAME_DURATION;
  let basketColor = "yellow"; // Current basket color
  let touchStartX = 0;
  let lastTouchTime = 0;

  // Set normal cursor
  k.setCursor("default");

  // Load responsive fruit sprites
  k.loadSprite(
    "mango",
    "data:image/svg+xml," +
      encodeURIComponent(`
      <svg width="${fruitSize}" height="${fruitSize}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${fruitSize / 2}" cy="${fruitSize / 2}" r="${
        fruitSize / 2 - 2
      }" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
      </svg>
    `)
  );

  k.loadSprite(
    "orange",
    "data:image/svg+xml," +
      encodeURIComponent(`
      <svg width="${fruitSize}" height="${fruitSize}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${fruitSize / 2}" cy="${fruitSize / 2}" r="${
        fruitSize / 2 - 2
      }" fill="#FFA500" stroke="#FF6347" stroke-width="2"/>
      </svg>
    `)
  );

  // Mobile-friendly UI layout
  const scoreText = k.add([
    k.text(`Score: ${score}`, { size: fontSize }),
    k.pos(isMobile ? 10 : 20, isMobile ? 10 : 20),
    k.color(255, 255, 255),
  ]);

  const timeText = k.add([
    k.text(`Time: ${timeLeft}`, { size: fontSize }),
    k.pos(k.width() - (isMobile ? 10 : 20), isMobile ? 10 : 20),
    k.anchor("topright"),
    k.color(255, 255, 255),
  ]);

  // Dynamic instruction text based on device
  const instructionText = k.add([
    k.text(
      isMobile
        ? "Tap and drag to move basket"
        : "Use A/D or Arrow Keys to move basket",
      { size: isMobile ? 16 : 18 }
    ),
    k.pos(k.width() / 2, isMobile ? 50 : 60),
    k.anchor("center"),
    k.color(200, 200, 200),
  ]);

  // Mobile control buttons (only show on mobile)
  let leftButton, rightButton;
  if (isMobile) {
    leftButton = k.add([
      k.rect(80, 60),
      k.pos(20, k.height() - 80),
      k.color(100, 100, 100),
      k.opacity(0.7),
      k.outline(2, [200, 200, 200]),
      k.area(),
      "leftButton",
    ]);

    k.add([
      k.text("◀", { size: 30 }),
      k.pos(60, k.height() - 50),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    rightButton = k.add([
      k.rect(80, 60),
      k.pos(k.width() - 100, k.height() - 80),
      k.color(100, 100, 100),
      k.opacity(0.7),
      k.outline(2, [200, 200, 200]),
      k.area(),
      "rightButton",
    ]);

    k.add([
      k.text("▶", { size: 30 }),
      k.pos(k.width() - 60, k.height() - 50),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);
  }

  // Create the moving basket
  const basket = k.add([
    k.sprite("basket"),
    k.pos(k.width() / 2, k.height() - (isMobile ? 120 : 100)),
    k.anchor("center"),
    k.area(),
    k.scale(basketSize),
    "basket",
    {
      speed: basketSpeed,
      targetColor: "yellow", // What color fruit it should catch
    },
  ]);

  // Start with yellow basket
  basket.color = k.rgb(255, 215, 0);

  // Color indicator above basket
  const colorIndicator = k.add([
    k.text("YELLOW", { size: isMobile ? 14 : 16 }),
    k.pos(basket.pos.x, basket.pos.y - (isMobile ? 50 : 60)),
    k.anchor("center"),
    k.color(255, 215, 0),
  ]);

  // Desktop keyboard controls
  k.onKeyDown("left", () => {
    moveBasketLeft();
  });

  k.onKeyDown("right", () => {
    moveBasketRight();
  });

  k.onKeyDown("a", () => {
    moveBasketLeft();
  });

  k.onKeyDown("d", () => {
    moveBasketRight();
  });

  // Movement functions
  function moveBasketLeft() {
    if (basket.pos.x > 60) {
      basket.move(-basket.speed, 0);
      colorIndicator.pos.x = basket.pos.x;
    }
  }

  function moveBasketRight() {
    if (basket.pos.x < k.width() - 60) {
      basket.move(basket.speed, 0);
      colorIndicator.pos.x = basket.pos.x;
    }
  }

  // Mobile touch controls
  if (isMobile) {
    // Touch button controls
    k.onTouchStart((id, pos) => {
      const leftButtonHit = leftButton && leftButton.hasPoint(pos);
      const rightButtonHit = rightButton && rightButton.hasPoint(pos);

      if (leftButtonHit) {
        leftButton.color = k.rgb(150, 150, 150); // Visual feedback
        moveBasketLeft();
      } else if (rightButtonHit) {
        rightButton.color = k.rgb(150, 150, 150); // Visual feedback
        moveBasketRight();
      }
    });

    k.onTouchEnd((id, pos) => {
      // Reset button colors
      if (leftButton) leftButton.color = k.rgb(100, 100, 100);
      if (rightButton) rightButton.color = k.rgb(100, 100, 100);
    });

    // Swipe controls
    k.onTouchStart((id, pos) => {
      touchStartX = pos.x;
      lastTouchTime = k.time();
    });

    k.onTouchEnd((id, pos) => {
      const touchEndX = pos.x;
      const touchDuration = k.time() - lastTouchTime;
      const swipeDistance = touchEndX - touchStartX;

      // Only register as swipe if it's quick and significant
      if (touchDuration < 0.3 && Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
          moveBasketRight(); // Swipe right
        } else {
          moveBasketLeft(); // Swipe left
        }
      }
    });

    // Continuous touch drag
    k.onTouchMove((id, pos) => {
      const dragDistance = pos.x - touchStartX;
      if (Math.abs(dragDistance) > 30) {
        // Minimum drag distance
        const newX =
          basket.pos.x +
          (dragDistance > 0 ? basket.speed * k.dt() : -basket.speed * k.dt());
        if (newX > 60 && newX < k.width() - 60) {
          basket.pos.x = newX;
          colorIndicator.pos.x = basket.pos.x;
        }
        touchStartX = pos.x; // Update for continuous dragging
      }
    });
  }

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

        k.tween(
          successText.pos.y,
          successText.pos.y - 50,
          1,
          (val) => (successText.pos.y = val)
        ).then(() => k.destroy(successText));
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

        k.tween(
          penaltyText.pos.y,
          penaltyText.pos.y - 50,
          1,
          (val) => (penaltyText.pos.y = val)
        ).then(() => k.destroy(penaltyText));
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
