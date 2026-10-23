/**
 * Xestus OmniTools - Digital E-Signature & Stamp Studio
 * 100% In-Browser, Zero-Knowledge Signature Drawing & Transparent PNG Export
 */

export function initSignaturePad() {
  const canvas = document.getElementById('sig-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const clearBtn = document.getElementById('sig-clear-btn');
  const undoBtn = document.getElementById('sig-undo-btn');
  const downloadBtn = document.getElementById('sig-download-btn');
  const copyBtn = document.getElementById('sig-copy-btn');
  const colorBtns = document.querySelectorAll('.sig-color-swatch');
  const widthSlider = document.getElementById('sig-width-slider');
  const widthValEl = document.getElementById('sig-width-val');

  // Type signature mode elements
  const tabDrawBtn = document.getElementById('sig-tab-draw');
  const tabTypeBtn = document.getElementById('sig-tab-type');
  const drawArea = document.getElementById('sig-draw-area');
  const typeArea = document.getElementById('sig-type-area');
  const typeInput = document.getElementById('sig-type-input');
  const typePreviewList = document.getElementById('sig-type-previews');

  let isDrawing = false;
  let strokeColor = '#1e3a8a'; // Default royal blue ink
  let strokeWidth = 3;
  let points = [];
  let history = []; // Array of ImageData snapshots for undo

  // Setup HiDPI Canvas
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Save existing content before resize if any
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Restore content
    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }

  // Initial sizing after layout
  setTimeout(resizeCanvas, 100);
  window.addEventListener('resize', debounce(resizeCanvas, 200));

  // Save state for undo
  function saveState() {
    if (history.length >= 15) history.shift();
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  // Mouse & Touch Coordinates
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    if (e.type === 'touchstart') e.preventDefault();
    isDrawing = true;
    saveState();
    points = [getPos(e)];
    drawPoints();
  }

  function moveDrawing(e) {
    if (!isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    points.push(getPos(e));
    drawPoints();
  }

  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    points = [];
  }

  function drawPoints() {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const c = (points[i].x + points[i + 1].x) / 2;
      const d = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
    }

    ctx.stroke();
  }

  // Event Listeners for Canvas
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', moveDrawing);
  window.addEventListener('mouseup', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', moveDrawing, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  // Clear Canvas
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      saveState();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.XestusApp?.showToast('Canvas cleared', 'info');
    });
  }

  // Undo
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (history.length > 0) {
        const previous = history.pop();
        ctx.putImageData(previous, 0, 0);
        window.XestusApp?.showToast('Undid last stroke', 'info');
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.XestusApp?.showToast('No more actions to undo', 'warning');
      }
    });
  }

  // Color selection
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      strokeColor = btn.dataset.color;
      ctx.strokeStyle = strokeColor;
      updateTypePreviews();
    });
  });

  // Stroke width slider
  if (widthSlider) {
    widthSlider.addEventListener('input', (e) => {
      strokeWidth = parseInt(e.target.value, 10);
      if (widthValEl) widthValEl.textContent = `${strokeWidth}px`;
      ctx.lineWidth = strokeWidth;
    });
  }

  // Crop Transparent Bounding Box
  function getCroppedCanvas(sourceCanvas) {
    const sCtx = sourceCanvas.getContext('2d');
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const imgData = sCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    if (!found) return null;

    // Add safe padding around cropped signature
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width, maxX + padding);
    maxY = Math.min(height, maxY + padding);

    const croppedWidth = maxX - minX;
    const croppedHeight = maxY - minY;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = croppedWidth;
    outCanvas.height = croppedHeight;
    const outCtx = outCanvas.getContext('2d');
    outCtx.drawImage(sourceCanvas, minX, minY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
    return outCanvas;
  }

  // Download Transparent PNG
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const cropped = getCroppedCanvas(canvas);
      if (!cropped) {
        window.XestusApp?.showToast('Please draw or create your signature first.', 'warning');
        return;
      }

      cropped.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xestus-signature-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);

        window.XestusApp?.triggerConfetti();
        window.XestusApp?.showToast('Transparent e-Signature downloaded!', 'success');
      }, 'image/png');
    });
  }

  // Copy to Clipboard as Image
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const cropped = getCroppedCanvas(canvas);
      if (!cropped) {
        window.XestusApp?.showToast('Please draw your signature first.', 'warning');
        return;
      }

      try {
        cropped.toBlob(async (blob) => {
          if (!blob) return;
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            window.XestusApp?.showToast('Signature copied to clipboard! Ready to paste into documents.', 'success');
          } else {
            window.XestusApp?.showToast('Clipboard image copy not supported in this browser.', 'warning');
          }
        }, 'image/png');
      } catch (err) {
        window.XestusApp?.showToast('Could not copy signature image to clipboard.', 'warning');
      }
    });
  }

  // Mode Tabs (Draw vs Type)
  if (tabDrawBtn && tabTypeBtn) {
    tabDrawBtn.addEventListener('click', () => {
      tabDrawBtn.classList.add('active');
      tabTypeBtn.classList.remove('active');
      if (drawArea) drawArea.style.display = 'block';
      if (typeArea) typeArea.style.display = 'none';
      resizeCanvas();
    });

    tabTypeBtn.addEventListener('click', () => {
      tabTypeBtn.classList.add('active');
      tabDrawBtn.classList.remove('active');
      if (drawArea) drawArea.style.display = 'none';
      if (typeArea) typeArea.style.display = 'block';
      updateTypePreviews();
    });
  }

  // Type Signature Previews
  const FONTS = [
    { name: 'Cursive Flow', style: 'italic 44px "Brush Script MT", cursive, sans-serif' },
    { name: 'Executive Script', style: 'italic 40px "Segoe Script", cursive, serif' },
    { name: 'Modern Calligraphy', style: 'italic 38px "Snell Roundhand", cursive, serif' },
    { name: 'Classic Serif', style: 'italic 36px "Georgia", serif' }
  ];

  function updateTypePreviews() {
    if (!typePreviewList) return;
    const text = (typeInput?.value || 'Your Signature').trim() || 'Your Signature';
    typePreviewList.innerHTML = '';

    FONTS.forEach((font, idx) => {
      const card = document.createElement('div');
      card.className = 'sig-type-card';

      // Create a canvas preview for each font
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 600;
      pCanvas.height = 120;
      const pCtx = pCanvas.getContext('2d');
      pCtx.clearRect(0, 0, 600, 120);
      pCtx.font = font.style;
      pCtx.fillStyle = strokeColor;
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      pCtx.fillText(text, 300, 60);

      card.innerHTML = `
        <div class="sig-type-card-header">
          <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">${font.name}</span>
          <button class="btn-primary btn-sm sig-use-typed-btn" data-font-idx="${idx}">Use This Style &rarr;</button>
        </div>
      `;
      card.appendChild(pCanvas);
      typePreviewList.appendChild(card);
    });

    // Handle "Use This Style" click: Render onto main canvas
    typePreviewList.querySelectorAll('.sig-use-typed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fontIdx = parseInt(btn.dataset.fontIdx, 10);
        const font = FONTS[fontIdx];
        const text = (typeInput?.value || 'Your Signature').trim();

        // Switch to draw tab and render onto main canvas
        tabDrawBtn.click();
        saveState();

        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = font.style;
        ctx.fillStyle = strokeColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, rect.width / 2, rect.height / 2);

        window.XestusApp?.showToast(`Applied '${font.name}' to signature canvas!`, 'success');
      });
    });
  }

  if (typeInput) {
    typeInput.addEventListener('input', debounce(updateTypePreviews, 200));
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }
}
