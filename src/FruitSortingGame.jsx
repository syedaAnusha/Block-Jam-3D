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
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            margin: 0,
          }}
        >
          Mobile Fruit Catcher Game
        </h1>
        <p
          style={{
            color: "#ccc",
            textAlign: "center",
            margin: "0.5rem 0 0 0",
          }}
        >
          Catch the falling fruits in the matching colored basket!
        </p>
      </div>
      <div
        ref={gameRef}
        style={{
          border: "2px solid #666",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          maxWidth: "100%",
          maxHeight: "80vh",
        }}
      />
      <div
        style={{
          marginTop: "1rem",
          textAlign: "center",
          color: "#999",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.875rem" }}>
          Desktop: Use A/D or Arrow Keys | Mobile: Touch controls
        </p>
      </div>
    </div>
  );
}
