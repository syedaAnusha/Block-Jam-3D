// src/main.js - Main game initialization
import k from "./kaplayCtx";
import menu from "./scenes/menu";
import game from "./scenes/game";
import gameover from "./scenes/gameover";

// Load basket sprite
k.loadSprite(
  "basket",
  "data:image/svg+xml," +
    encodeURIComponent(`
    <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 60 Q10 70 20 70 L100 70 Q110 70 110 60 L110 40 Q110 30 100 30 L20 30 Q10 30 10 40 Z" 
            fill="#8B4513" stroke="#654321" stroke-width="2"/>
      <path d="M15 35 L105 35 L100 65 L20 65 Z" fill="#A0522D"/>
      <circle cx="30" cy="45" r="3" fill="#654321"/>
      <circle cx="50" cy="45" r="3" fill="#654321"/>
      <circle cx="70" cy="45" r="3" fill="#654321"/>
      <circle cx="90" cy="45" r="3" fill="#654321"/>
    </svg>
  `)
);

// Set up gravity
k.setGravity(800);

// Register scenes
k.scene("menu", menu);
k.scene("game", game);
k.scene("gameover", gameover);

// Start with menu
k.go("menu");
