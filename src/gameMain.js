// src/main.js - Main game initialization
import k from "./kaplayCtx";
import menu from "./scenes/menu";
import game from "./scenes/game";
import gameover from "./scenes/gameover";

// Set up gravity
k.setGravity(800);

// Register scenes
k.scene("menu", menu);
k.scene("game", game);
k.scene("gameover", gameover);

// Start with menu
k.go("menu");
