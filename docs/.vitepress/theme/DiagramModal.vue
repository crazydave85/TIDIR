<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="diagram-modal-overlay"
      @click.self="closeModal"
      tabindex="-1"
      ref="modalRef"
    >
      <!-- Top Action Bar -->
      <div class="diagram-modal-bar">
        <div class="diagram-modal-title">
          <span>📐 Architecture Diagram Inspector</span>
          <span class="diagram-modal-hint">(Pinch / Drag / Scroll to zoom & pan)</span>
        </div>
        <div class="diagram-modal-controls">
          <button class="ctrl-btn action-btn" @click.stop="exportSvg" title="Download standalone SVG">📥 SVG</button>
          <button class="ctrl-btn action-btn" @click.stop="exportPng" title="Download high-resolution PNG (2x)">🖼️ PNG</button>
          <button class="ctrl-btn action-btn" @click.stop="copySvg" title="Copy SVG code to clipboard">
            {{ copied ? "Copied! ✅" : "📋 Copy SVG" }}
          </button>
          <div class="divider"></div>
          <button class="ctrl-btn" @click.stop="zoomIn" title="Zoom In (+)">➕</button>
          <button class="ctrl-btn" @click.stop="zoomOut" title="Zoom Out (-)">➖</button>
          <button class="ctrl-btn" @click.stop="resetTransform" title="Reset View">↺ 100%</button>
          <button class="ctrl-btn close-btn" @click.stop="closeModal" title="Close (Esc)">✕</button>
        </div>
      </div>

      <!-- Interactive Canvas Viewport -->
      <div
        class="diagram-canvas-viewport"
        ref="viewportRef"
        @wheel.prevent="onWheel"
        @mousedown="onMouseDown"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          class="diagram-canvas-content"
          :style="{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transformOrigin: 'center center'
          }"
          v-html="currentSvgHtml"
        ></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";

const isOpen = ref(false);
const currentSvgHtml = ref("");
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const modalRef = ref(null);
const viewportRef = ref(null);
const activeSvgElement = ref(null);
const copied = ref(false);
let copyTimer = null;

let isDragging = false;
let startX = 0;
let startY = 0;

// Touch tracking
let initialPinchDistance = null;
let initialScale = 1;

function getCleanSvgString() {
  if (!activeSvgElement.value) return "";
  const clone = activeSvgElement.value.cloneNode(true);

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  const viewBox = clone.getAttribute("viewBox");
  let width = 1200;
  let height = 800;

  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      width = parts[2];
      height = parts[3];
    }
  }

  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.style.backgroundColor = "#0b0f19";

  // Prepend background rectangle to ensure standalone rendering has dark canvas
  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("width", "100%");
  bgRect.setAttribute("height", "100%");
  bgRect.setAttribute("fill", "#0b0f19");
  clone.insertBefore(bgRect, clone.firstChild);

  // Embed critical normalisation CSS inside SVG
  const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleEl.textContent = `
    .nodeLabel, .label, foreignObject div, foreignObject span, foreignObject p {
      line-height: 1.25 !important;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    foreignObject { overflow: visible !important; }
  `;
  clone.insertBefore(styleEl, bgRect);

  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(clone);
}

function exportSvg() {
  const svgString = getCleanSvgString();
  if (!svgString) return;
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tidir-diagram-${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportPng() {
  const svgString = getCleanSvgString();
  if (!svgString) return;

  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const scaleFactor = 2; // High-DPI 2x Retina rendering
    const canvas = document.createElement("canvas");
    const baseWidth = img.naturalWidth || 1200;
    const baseHeight = img.naturalHeight || 800;
    canvas.width = baseWidth * scaleFactor;
    canvas.height = baseHeight * scaleFactor;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `tidir-diagram-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

async function copySvg() {
  const svgString = getCleanSvgString();
  if (!svgString) return;

  try {
    await navigator.clipboard.writeText(svgString);
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy SVG to clipboard:", err);
  }
}

function openModal(svgElement) {
  if (!svgElement) return;

  activeSvgElement.value = svgElement;

  // Clone SVG so we don't mutate or move the inline diagram
  const clone = svgElement.cloneNode(true);
  
  // Strip constraining inline styles from Mermaid (e.g. max-width: 0px or max-width: 400px)
  clone.removeAttribute("style");
  clone.removeAttribute("height");
  clone.setAttribute("width", "100%");
  
  // Ensure the SVG fills the responsive lightbox container
  clone.style.display = "block";
  clone.style.width = "100%";
  clone.style.height = "auto";
  clone.style.maxHeight = "85vh";

  currentSvgHtml.value = clone.outerHTML;
  const isMobile = window.innerWidth < 768;
  scale.value = isMobile ? 1.8 : 1;
  translateX.value = 0;
  translateY.value = 0;
  isOpen.value = true;

  nextTick(() => {
    modalRef.value?.focus();
  });
}

function closeModal() {
  isOpen.value = false;
  currentSvgHtml.value = "";
  activeSvgElement.value = null;
  copied.value = false;
}

function zoomIn() {
  scale.value = Math.min(scale.value * 1.3, 6);
}

function zoomOut() {
  scale.value = Math.max(scale.value / 1.3, 0.3);
}

function resetTransform() {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
}

function onWheel(e) {
  const delta = e.deltaY < 0 ? 1.15 : 0.85;
  scale.value = Math.min(Math.max(scale.value * delta, 0.3), 6);
}

function onMouseDown(e) {
  if (e.button !== 0) return;
  isDragging = true;
  startX = e.clientX - translateX.value;
  startY = e.clientY - translateY.value;

  const onMouseMove = (moveEvent) => {
    if (!isDragging) return;
    translateX.value = moveEvent.clientX - startX;
    translateY.value = moveEvent.clientY - startY;
  };

  const onMouseUp = () => {
    isDragging = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function onTouchStart(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX - translateX.value;
    startY = e.touches[0].clientY - translateY.value;
  } else if (e.touches.length === 2) {
    isDragging = false;
    initialPinchDistance = getTouchDistance(e.touches);
    initialScale = scale.value;
  }
}

function onTouchMove(e) {
  if (e.touches.length === 1 && isDragging) {
    translateX.value = e.touches[0].clientX - startX;
    translateY.value = e.touches[0].clientY - startY;
  } else if (e.touches.length === 2 && initialPinchDistance) {
    const currentDist = getTouchDistance(e.touches);
    const factor = currentDist / initialPinchDistance;
    scale.value = Math.min(Math.max(initialScale * factor, 0.3), 6);
  }
}

function onTouchEnd(e) {
  if (e.touches.length === 0) {
    isDragging = false;
    initialPinchDistance = null;
  }
}

// Global delegated click handler: captures any click on .mermaid or its children
function handleGlobalClick(e) {
  const container = e.target.closest(".mermaid");
  if (!container) return;

  const svg = container.querySelector("svg");
  if (svg) {
    openModal(svg);
  }
}

function handleKeyDown(e) {
  if (e.key === "Escape" && isOpen.value) {
    closeModal();
  }
}

onMounted(() => {
  document.addEventListener("click", handleGlobalClick);
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleGlobalClick);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.diagram-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(3, 7, 18, 0.96);
  backdrop-filter: blur(10px);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  outline: none;
}

.diagram-modal-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  color: #f8fafc;
  z-index: 10;
}

.diagram-modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #38bdf8;
}

.diagram-modal-hint {
  font-size: 0.8rem;
  font-weight: 400;
  color: #94a3b8;
}

@media (max-width: 640px) {
  .diagram-modal-hint {
    display: none;
  }
}

.diagram-modal-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ctrl-btn {
  background: #1e293b;
  border: 1px solid #334155;
  color: #f8fafc;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.ctrl-btn:hover {
  background: #334155;
  border-color: #38bdf8;
  color: #38bdf8;
}

.action-btn {
  background: #0b1329;
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.action-btn:hover {
  background: #38bdf8;
  border-color: #38bdf8;
  color: #0b0f19;
}

.divider {
  width: 1px;
  height: 22px;
  background: #334155;
  margin: 0 0.25rem;
}

@media (max-width: 768px) {
  .diagram-modal-controls {
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .divider {
    display: none;
  }
  .ctrl-btn {
    padding: 0.3rem 0.55rem;
    font-size: 0.75rem;
  }
}

.close-btn {
  background: #ef4444;
  border-color: #dc2626;
  color: #ffffff;
}

.close-btn:hover {
  background: #dc2626;
  color: #ffffff;
}

.diagram-canvas-viewport {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  touch-action: none;
}

.diagram-canvas-viewport:active {
  cursor: grabbing;
}

.diagram-canvas-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 92vw;
  max-width: 1200px;
  will-change: transform;
  user-select: none;
}

:deep(.diagram-canvas-content svg) {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  max-height: 85vh !important;
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.6));
}

:deep(.diagram-canvas-content foreignObject) {
  overflow: visible !important;
}

:deep(.diagram-canvas-content .nodeLabel),
:deep(.diagram-canvas-content .label),
:deep(.diagram-canvas-content .cluster-label),
:deep(.diagram-canvas-content .edgeLabel),
:deep(.diagram-canvas-content foreignObject div),
:deep(.diagram-canvas-content foreignObject span),
:deep(.diagram-canvas-content foreignObject p) {
  line-height: 1.25 !important;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
