// src/FruitSortingGame.jsx - React wrapper for KAPLAY game
import React, { useEffect, useRef } from "react";
import k from "./kaplayCtx";
import "./gameMain"; // This will initialize the game

export default function FruitSortingGame() {
  const gameRef = useRef(null);
  const gameInitialized = useRef(false);

  useEffect(() => {
    // Ensure we're in a browser environment
    if (
      typeof window === "undefined" ||
      !gameRef.current ||
      gameInitialized.current
    )
      return;

    // Mount KAPLAY to our canvas
    const gameContainer = gameRef.current;
    if (k.canvas) {
      gameContainer.appendChild(k.canvas);
      gameInitialized.current = true;
    }

    // Cleanup function
    return () => {
      if (gameContainer && k.canvas && gameContainer.contains(k.canvas)) {
        gameContainer.removeChild(k.canvas);
      }
      gameInitialized.current = false;
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white text-center">
          KAPLAY Fruit Sorting Game
        </h1>
        <p className="text-gray-300 text-center mt-2">
          Watch the boy throw fruits and help sort them into baskets!
        </p>
      </div>
      <div
        ref={gameRef}
        className="border-2 border-gray-600 rounded-lg shadow-lg"
        style={{ width: "800px", height: "600px" }}
      />
      <div className="mt-4 text-center text-gray-400">
        <p>
          The boy will throw fruits - help sort them into the right baskets!
        </p>
        <p>Get 3 fruits in any basket to win!</p>
      </div>
    </div>
  );
}
