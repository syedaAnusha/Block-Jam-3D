// src/FruitSortingGame.jsx - 3D Fruit Basket Sorting Game
import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import "./app.css";

// FRUIT TYPES AND COLORS
const FRUIT_TYPES = [
  { id: "mango", hex: "#FFD700", name: "Mango", color: "yellow" },
  { id: "orange", hex: "#FFA500", name: "Orange", color: "orange" },
];

const BASKET_COLORS = [
  { id: "yellow", hex: "#FFD700", name: "Yellow Basket" },
  { id: "orange", hex: "#FFA500", name: "Orange Basket" },
];

const TUNNEL_CAPACITY = 10; // Each tunnel starts with 10 fruits
const BASKET_CAPACITY = 3; // Need 3 fruits to win
const GAME_DURATION = 30; // 30 seconds

function makeId() {
  return `fruit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function FruitSortingGame() {
  const [gameState, setGameState] = useState("ready"); // ready, playing, won, lost
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [tunnelCounts, setTunnelCounts] = useState(
    Array(5).fill(TUNNEL_CAPACITY)
  );
  const [baskets, setBaskets] = useState([
    {
      id: "yellow",
      color: "yellow",
      fruits: [],
      position: [-3, 0, 8],
      hex: "#FFD700",
    },
    {
      id: "orange",
      color: "orange",
      fruits: [],
      position: [3, 0, 8],
      hex: "#FFA500",
    },
  ]);
  const [fallingFruit, setFallingFruit] = useState(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Click START to begin fruit sorting!");

  // Game timer
  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("lost");
            setMessage("Time's up! Sorting failed!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Check win condition
  useEffect(() => {
    const fullBasket = baskets.find(
      (basket) => basket.fruits.length >= BASKET_CAPACITY
    );
    if (fullBasket && gameState === "playing") {
      setGameState("won");
      setMessage(`Success! ${fullBasket.color.toUpperCase()} basket is full!`);
      setScore((prev) => prev + 1000 + timeLeft * 10); // Bonus for remaining time
    }
  }, [baskets, gameState, timeLeft]);

  function startGame() {
    setGameState("playing");
    setTimeLeft(GAME_DURATION);
    setTunnelCounts(Array(5).fill(TUNNEL_CAPACITY));
    setBaskets([
      {
        id: "yellow",
        color: "yellow",
        fruits: [],
        position: [-3, 0, 8],
        hex: "#FFD700",
      },
      {
        id: "orange",
        color: "orange",
        fruits: [],
        position: [3, 0, 8],
        hex: "#FFA500",
      },
    ]);
    setScore(0);
    setMessage("Sort fruits to matching colored baskets!");
  }

  function resetGame() {
    setGameState("ready");
    setTimeLeft(GAME_DURATION);
    setFallingFruit(null);
    setMessage("Click START to begin fruit sorting!");
  }

  function handleTunnelClick(tunnelIndex) {
    if (gameState !== "playing" || tunnelCounts[tunnelIndex] <= 0) return;

    // Randomly select mango or orange
    const selectedFruit = FRUIT_TYPES[Math.floor(Math.random() * 2)];

    // Decrease tunnel count
    setTunnelCounts((prev) => {
      const newCounts = [...prev];
      newCounts[tunnelIndex] = Math.max(0, newCounts[tunnelIndex] - 1);
      return newCounts;
    });

    // Create falling fruit
    setFallingFruit({
      id: makeId(),
      type: selectedFruit.id,
      color: selectedFruit.color,
      fromTunnel: tunnelIndex,
      targetBasket: selectedFruit.color,
    });

    setMessage(`Dropping ${selectedFruit.name}...`);
  }

  function onFruitLanded(fruit) {
    setFallingFruit(null);

    // Add fruit to the correct basket
    setBaskets((prev) =>
      prev.map((basket) => {
        if (
          basket.color === fruit.targetBasket &&
          basket.fruits.length < BASKET_CAPACITY
        ) {
          return {
            ...basket,
            fruits: [...basket.fruits, fruit],
          };
        }
        return basket;
      })
    );

    setScore((prev) => prev + 10);
    setMessage("Fruit sorted successfully!");
  }

  return (
    <div
      className="jam-root"
      style={{
        background:
          "linear-gradient(180deg, #87CEEB 0%, #98FB98 50%, #F0E68C 100%)",
      }}
    >
      {/* Header */}
      <div className="top-bar">
        <div
          className="timer"
          style={{
            background: timeLeft <= 5 ? "#FF6B6B" : "#FFE4B5",
            color: timeLeft <= 5 ? "white" : "black",
          }}
        >
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>
        <div className="title">🥭 Fruit Sorting Challenge</div>
        <div className="score">Score: {score}</div>
      </div>

      {/* 3D Game Scene */}
      <div className="stage">
        <div style={{ width: "100%", height: "600px", position: "relative" }}>
          <Canvas
            camera={{ position: [0, 8, 15], fov: 50 }}
            dpr={1}
            performance={{ min: 0.5 }}
            gl={{ antialias: false, alpha: false }}
          >
            <Suspense fallback={<Html center>Loading fruits...</Html>}>
              {/* Optimized Lighting */}
              <ambientLight intensity={0.5} />
              <directionalLight position={[8, 8, 5]} intensity={0.8} />

              {/* Camera Controls */}
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={10}
                maxDistance={20}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.5}
                dampingFactor={0.05}
                enableDamping={true}
              />

              {/* Ground */}
              <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[30, 20]} />
                <meshLambertMaterial color="#90EE90" />
              </mesh>

              {/* Fruit Tunnels */}
              {Array.from({ length: 5 }).map((_, index) => (
                <FruitTunnel3D
                  key={index}
                  position={[index * 4 - 8, 0, -6]}
                  count={tunnelCounts[index]}
                  onClick={() => handleTunnelClick(index)}
                  isActive={gameState === "playing" && tunnelCounts[index] > 0}
                />
              ))}

              {/* Fruit Baskets */}
              {baskets.map((basket) => (
                <FruitBasket3D
                  key={basket.id}
                  position={basket.position}
                  color={basket.hex}
                  fruits={basket.fruits}
                  isFull={basket.fruits.length >= BASKET_CAPACITY}
                  basketType={basket.color}
                />
              ))}

              {/* Falling Fruit */}
              {fallingFruit && (
                <FallingFruit3D fruit={fallingFruit} onLanded={onFruitLanded} />
              )}

              {/* Game State Display */}
              <Text
                position={[0, 6, 0]}
                fontSize={1.5}
                color={
                  gameState === "won"
                    ? "#32CD32"
                    : gameState === "lost"
                    ? "#FF4500"
                    : "#4169E1"
                }
                anchorX="center"
                anchorY="middle"
              >
                {gameState === "won"
                  ? "🎉 SORTING SUCCESS!"
                  : gameState === "lost"
                  ? "💥 TIME'S UP!"
                  : gameState === "playing"
                  ? "🥭 SORT THE FRUITS!"
                  : "🍊 FRUIT SORTING"}
              </Text>
            </Suspense>
          </Canvas>
        </div>

        {/* Message and Controls */}
        <div className="center-message">
          <div
            className="msg"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        {gameState === "ready" && (
          <button
            onClick={startGame}
            className="btn"
            style={{
              background: "#32CD32",
              color: "white",
            }}
          >
            🚀 START SORTING
          </button>
        )}
        {(gameState === "won" || gameState === "lost") && (
          <button
            onClick={resetGame}
            className="btn"
            style={{
              background: "#4169E1",
              color: "white",
            }}
          >
            🔄 NEW GAME
          </button>
        )}
        <div className="msg">
          {gameState === "playing"
            ? "Click tunnels to drop fruits into matching colored baskets!"
            : gameState === "ready"
            ? "Fill any basket with 3 matching fruits to win!"
            : ""}
        </div>
      </div>
    </div>
  );
}

// 3D Fruit Tunnel Component
function FruitTunnel3D({ position, count, onClick, isActive }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime()) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Tunnel Structure */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered && isActive ? 1.05 : 1}
      >
        <cylinderGeometry args={[1, 1, 2.5, 8]} />
        <meshLambertMaterial color={isActive ? "#8B4513" : "#A0522D"} />
      </mesh>

      {/* Fruit indicators on top */}
      <mesh position={[-0.4, 1.8, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      <mesh position={[0.4, 1.8, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshLambertMaterial color="#FFA500" />
      </mesh>

      {/* Count display */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.6}
        color={count > 0 ? "#000000" : "#FF0000"}
        anchorX="center"
        anchorY="middle"
      >
        {count}
      </Text>
    </group>
  );
}

// 3D Fruit Basket Component
function FruitBasket3D({ position, color, fruits, isFull, basketType }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && isFull) {
      meshRef.current.position.y =
        Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      {/* Basket Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1, 0.8, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>

      {/* Basket Rim */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[1.2, 0.1, 6, 8]} />
        <meshLambertMaterial color={darken(color, 20)} />
      </mesh>

      {/* Fruits in basket */}
      {fruits.map((fruit, index) => (
        <Fruit3D
          key={fruit.id}
          position={[
            ((index % 2) - 0.5) * 0.6,
            0.5 + Math.floor(index / 2) * 0.3,
            ((Math.floor(index / 2) % 2) - 0.5) * 0.4,
          ]}
          type={fruit.type}
        />
      ))}

      {/* Basket Label */}
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {basketType.toUpperCase()}
      </Text>

      {/* Full basket effect */}
      {isFull && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.8}
          color="#32CD32"
          anchorX="center"
          anchorY="middle"
        >
          ✅ FULL!
        </Text>
      )}
    </group>
  );
}

// 3D Fruit Component
function Fruit3D({ position, type }) {
  const fruitRef = useRef();

  useFrame((state) => {
    if (fruitRef.current) {
      fruitRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  const isOrange = type === "orange";

  return (
    <group position={position} ref={fruitRef}>
      {/* Fruit Body */}
      <mesh>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshLambertMaterial color={isOrange ? "#FFA500" : "#FFD700"} />
      </mesh>

      {/* Small stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

// Falling Fruit Animation Component
function FallingFruit3D({ fruit, onLanded }) {
  const fruitRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    if (fruitRef.current && progress < 1) {
      const newProgress = Math.min(progress + delta * 1.5, 1);
      setProgress(newProgress);

      // Calculate positions
      const startX = fruit.fromTunnel * 4 - 8;
      const endX = fruit.targetBasket === "yellow" ? -3 : 3;
      const startZ = -6;
      const endZ = 8;

      // Smooth easing
      const easeProgress = 1 - Math.pow(1 - newProgress, 2);

      const currentX = startX + (endX - startX) * easeProgress;
      const currentZ = startZ + (endZ - startZ) * easeProgress;
      const currentY = Math.sin(easeProgress * Math.PI) * 2;

      fruitRef.current.position.set(currentX, currentY, currentZ);
      fruitRef.current.rotation.y = easeProgress * Math.PI * 2;
      fruitRef.current.rotation.z = easeProgress * Math.PI;

      if (newProgress >= 1) {
        onLanded(fruit);
      }
    }
  });

  return (
    <group ref={fruitRef}>
      <Fruit3D position={[0, 0, 0]} type={fruit.type} />
    </group>
  );
}

// Utility function
function darken(hex, pct) {
  const f = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (f >> 16) - Math.round(2.55 * pct));
  const g = Math.max(0, ((f >> 8) & 0x00ff) - Math.round(2.55 * pct));
  const b = Math.max(0, (f & 0x0000ff) - Math.round(2.55 * pct));
  return `rgb(${r},${g},${b})`;
}
