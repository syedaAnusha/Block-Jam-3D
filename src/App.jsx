/* eslint-disable no-unused-vars */
// src/App.jsx
import React, { useState, useRef, useEffect } from "react";
import "./app.css"; // small CSS file described below

// COLORS used for dispensers/blocks
const COLORS = [
  { id: "yellow", hex: "#f7dd5b" },
  { id: "orange", hex: "#ff9f43" },
  { id: "green", hex: "#2ecc71" },
  { id: "blue", hex: "#4da6ff" },
  { id: "purple", hex: "#b583ff" },
];

const BASE_CAPACITY = 7;

function makeId() {
  return `b_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const trayRef = useRef(null);
  const [tray, setTray] = useState(Array(BASE_CAPACITY).fill(null)); // {id,color,status}
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Tap a dispenser to drop its block");
  const [falling, setFalling] = useState(null); // {id,color,fromX,fromY,toSlotIndex}
  const [queueSeed, setQueueSeed] = useState(0); // to slightly vary spawn position
  const containerRef = useRef(null);

  // helper: find first free slot index (leftmost)
  function firstFreeSlotIndex() {
    return tray.findIndex((t) => t === null);
  }

  // click a dispenser to spawn falling block into the first free slot
  function handleDispense(colorId, e) {
    const freeIdx = firstFreeSlotIndex();
    if (freeIdx === -1) {
      setMessage("No space left — reset to continue");
      return;
    }
    // compute start position from dispenser element or mouse
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e?.clientX ?? rect.left + rect.width / 2;
    const clickY = e?.clientY ?? rect.top + 40;

    // slight variation using seed so animations don't look identical
    const seed = queueSeed + 1;
    setQueueSeed(seed);

    setFalling({
      id: makeId(),
      color: colorId,
      fromX: clickX - rect.left,
      fromY: 20 + (seed % 6) * 2,
      toSlotIndex: freeIdx,
    });

    setMessage("Dropping...");
  }

  // when falling animation completes, snap into tray and check matches
  function onLanding(block) {
    setFalling(null);
    setTray((prev) => {
      const next = [...prev];
      next[block.toSlotIndex] = {
        id: block.id,
        color: block.color,
        status: "idle",
      };
      return next;
    });
    setScore((s) => s + 5);
    setMessage("Placed.");
    setTimeout(() => detectMatches(), 120); // small delay so block renders then match logic
  }

  // match detection: if any color count >= 3 -> remove earliest 3 of that color
  function detectMatches() {
    const counts = {};
    tray.forEach((it) => {
      if (!it) return;
      counts[it.color] = (counts[it.color] || 0) + 1;
    });

    const toRemove = new Set();
    Object.keys(counts).forEach((color) => {
      if (counts[color] >= 3) {
        // remove earliest 3 occurrences (left to right)
        let removed = 0;
        for (let i = 0; i < tray.length && removed < 3; i++) {
          const it = tray[i];
          if (it && it.color === color) {
            toRemove.add(it.id);
            removed++;
          }
        }
      }
    });

    if (toRemove.size > 0) {
      // mark those items as 'removing' so animation can play
      setTray((prev) =>
        prev.map((it) => {
          if (!it) return null;
          if (toRemove.has(it.id)) return { ...it, status: "removing" };
          return it;
        })
      );
      // award points
      setScore((s) => s + 100);
      setMessage(`Match! Cleared ${toRemove.size} blocks.`);
      // after animation delay, remove them and compact left
      setTimeout(() => {
        setTray((prev) => {
          const remaining = prev.filter((it) => it && it.status !== "removing");
          while (remaining.length < BASE_CAPACITY) remaining.push(null);
          return remaining.slice(0, BASE_CAPACITY);
        });
      }, 420);
    }
  }

  function resetGame() {
    setTray(Array(BASE_CAPACITY).fill(null));
    setScore(0);
    setMessage("Tap a dispenser to drop its block");
    setFalling(null);
  }

  // small effect to clear any outstanding removing flag after rendered (defensive)
  useEffect(() => {
    const t = setTimeout(() => {
      setTray((prev) =>
        prev.map((it) => {
          if (!it) return null;
          if (it.status === "removing") return { ...it, status: "removing" }; // keep until removal handler
          return it;
        })
      );
    }, 100);
    return () => clearTimeout(t);
  }, [tray]);

  return (
    <div ref={containerRef} className="jam-root">
      <div className="top-bar">
        <div className="timer">00:30</div>
        <div className="title">Hurry Up!</div>
        <div className="score">Score: {score}</div>
      </div>

      <div className="stage">
        {/* dispensers row */}
        <div className="dispensers">
          {COLORS.map((c, i) => (
            <div
              key={c.id}
              className="dispenser"
              onClick={(e) => handleDispense(c.id, e)}
              style={{ cursor: "pointer" }}
              aria-label={`dispense ${c.id}`}
            >
              <div className="tube" style={{ background: c.hex }} />
              <div
                className="tube-top"
                style={{ background: darken(c.hex, 14) }}
              >
                <div className="count">99</div>
              </div>
            </div>
          ))}
        </div>

        {/* large message and target preview (simplified) */}
        <div className="center-message">
          <div className="main-text">Tap right color</div>
          <div className="preview-row">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="preview-slot" />
            ))}
          </div>
        </div>

        {/* tray area */}
        <div className="tray-area" ref={trayRef}>
          <div className="tray">
            {tray.map((slot, i) => (
              <div key={i} className="slot">
                {/* if slot has block render with class depending on status */}
                {slot ? (
                  <div
                    className={`block ${
                      slot.status === "removing" ? "removing" : ""
                    }`}
                    style={{ background: slot.color }}
                  />
                ) : (
                  <div className="slot-empty" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* falling block layer (absolutely positioned) */}
        {falling ? (
          <FallingBlock
            key={falling.id}
            data={falling}
            containerRef={containerRef}
            trayRef={trayRef}
            onLand={(b) => onLanding(b)}
          />
        ) : null}
      </div>

      <div className="controls">
        <button onClick={resetGame} className="btn red">
          Reset
        </button>
        <div className="msg">{message}</div>
      </div>
    </div>
  );
}

/* FallingBlock component:
   - positions itself at fromX/fromY (relative to container)
   - computes target slot center using trayRef and toSlotIndex
   - animates top/left via CSS transition to target position
   - on transitionend calls onLand with data
*/
function FallingBlock({ data, containerRef, trayRef, onLand }) {
  const elRef = useRef(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // start position (small offset)
    el.style.left = `${data.fromX - 28}px`;
    el.style.top = `${data.fromY}px`;
    el.style.transform = `translateY(0) scale(1.05)`;

    // compute target slot center
    const trayRect = trayRef.current.getBoundingClientRect();
    const contRect = containerRef.current.getBoundingClientRect();
    const slotElems = Array.from(trayRef.current.querySelectorAll(".slot"));
    const targetSlot = slotElems[data.toSlotIndex];
    const slotRect = targetSlot.getBoundingClientRect();

    // small delay to allow initial paint then animate
    requestAnimationFrame(() => {
      // compute target left/top for block centering
      const targetLeft =
        slotRect.left - contRect.left + slotRect.width / 2 - 28;
      const targetTop = slotRect.top - contRect.top + 6; // a bit above center to simulate drop
      // animate by setting style -> CSS transitions handle movement
      el.style.transition = "all 470ms cubic-bezier(.2,.9,.2,1)";
      el.style.left = `${targetLeft}px`;
      el.style.top = `${targetTop}px`;
      el.style.transform = `translateY(0) scale(1)`;
    });

    function handleEnd(e) {
      // ensure it's the transform/left transition we wait for
      if (
        e.propertyName === "left" ||
        e.propertyName === "top" ||
        e.propertyName === "transform"
      ) {
        onLand(data);
      }
    }
    el.addEventListener("transitionend", handleEnd);
    return () => el.removeEventListener("transitionend", handleEnd);
  }, [data, containerRef, trayRef, onLand]);

  return (
    <div
      ref={elRef}
      className="falling-block"
      style={{
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: 10,
        left: 0,
        top: 0,
        transform: "translateY(0) scale(1.05)",
        zIndex: 40,
        boxShadow: "0 10px 24px rgba(2,6,23,0.14)",
        background: data.color,
      }}
    />
  );
}

// small color utility
function darken(hex, pct) {
  const f = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (f >> 16) - Math.round(2.55 * pct));
  const g = Math.max(0, ((f >> 8) & 0x00ff) - Math.round(2.55 * pct));
  const b = Math.max(0, (f & 0x0000ff) - Math.round(2.55 * pct));
  return `rgb(${r},${g},${b})`;
}
