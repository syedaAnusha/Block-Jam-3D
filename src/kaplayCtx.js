import kaplay from "kaplay";

// Safe browser environment check for SSR compatibility
const isBrowser = typeof window !== "undefined";
const isMobile =
  isBrowser && (window.innerWidth < 768 || "ontouchstart" in window);
const gameWidth = isMobile ? Math.min(window.innerWidth, 480) : 800;
const gameHeight = isMobile ? Math.min(window.innerHeight, 640) : 600;

const k = kaplay({
  width: gameWidth,
  height: gameHeight,
  letterbox: true,
  background: [135, 206, 235], // Sky blue
  global: false,
  buttons: {
    click: {
      mouse: "left",
    },
  },
  touchToMouse: true,
  crisp: true, // Better pixel rendering on mobile
  debug: false,
});

export default k;
