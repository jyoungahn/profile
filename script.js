const header = document.querySelector(".site-header");
const canvas = document.querySelector("#deployment-map");
const context = canvas.getContext("2d");

const palette = ["#175ddc", "#087a77", "#bc3f33", "#4f7d3a", "#b68120"];
let nodes = [];
let width = 0;
let height = 0;
let animationFrame = 0;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(34, Math.floor((width * height) / 28000));
  nodes = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    radius: index % 9 === 0 ? 4.4 : 2.6,
    color: palette[index % palette.length],
  }));
}

function drawDeploymentMap() {
  context.clearRect(0, 0, width, height);

  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < -20) node.x = width + 20;
    if (node.x > width + 20) node.x = -20;
    if (node.y < -20) node.y = height + 20;
    if (node.y > height + 20) node.y = -20;
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const first = nodes[i];
      const second = nodes[j];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);

      if (distance < 178) {
        const alpha = (1 - distance / 178) * 0.22;
        context.strokeStyle = `rgba(23, 32, 42, ${alpha})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      }
    }
  }

  nodes.forEach((node) => {
    context.fillStyle = node.color;
    context.globalAlpha = 0.72;
    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    context.fill();
  });

  context.globalAlpha = 1;
  animationFrame = requestAnimationFrame(drawDeploymentMap);
}

function updateHeader() {
  header.dataset.elevated = window.scrollY > 8 ? "true" : "false";
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateHeader, { passive: true });

resizeCanvas();
drawDeploymentMap();
updateHeader();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    return;
  }

  drawDeploymentMap();
});
