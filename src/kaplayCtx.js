import kaplay from "kaplay";

const k = kaplay({
  width: 800,
  height: 600,
  letterbox: true,
  background: [135, 206, 235], // Sky blue
  global: false,
  buttons: {
    click: {
      mouse: "left",
    },
  },
  touchToMouse: true,
  debug: false,
});

export default k;
