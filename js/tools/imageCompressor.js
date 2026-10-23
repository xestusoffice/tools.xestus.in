/**
 * Xestus OmniTools - Image Compressor & Converter
 * 100% Client-Side In-Browser Image Optimization
 */

export function initImageCompressor() {
  const fileInput = document.getElementById('compressor-file-input');
  const dropzone = document.getElementById('compressor-dropzone');
  const qualitySlider = document.getElementById('compressor-quality');
  const qualityVal = document.getElementById('compressor-quality-val');
  const formatSelect = document.getElementById('compressor-format');
  const resizeSelect = document.getElementById('compressor-resize');
  const targetKbInput = document.getElementById('compressor-target-kb');
  const applyTargetBtn = document.getElementById('compressor-apply-target');
  
  const resultCard = document.getElementById('compressor-result-card');
  const originalSizeEl = document.getElementById('compressor-orig-size');
  const compressedSizeEl = document.getElementById('compressor-new-size');
  const savedPercentEl = document.getElementById('compressor-saved-pct');
  const downloadBtn = document.getElementById('compressor-download-btn');
  
  const imgBefore = document.getElementById('compressor-img-before');
  const imgAfter = document.getElementById('compressor-img-after');
  const splitContainer = document.getElementById('compressor-split-container');
  const splitLine = document.getElementById('compressor-split-line');
  const splitHandle = document.getElementById('compressor-split-handle');

  let currentFile = null;
  let originalImage = new Image();
  let compressedBlob = null;
  let isDraggingSplit = false;

  // Drag and drop events
  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageFile(e.target.files[0]);
      }
    });
  }

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      window.XestusApp.showToast('Please upload a valid image file (JPEG, PNG, WebP).', 'warning');
      return;
    }
    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      originalImage = new Image();
      originalImage.onload = () => {
        imgBefore.src = e.target.result;
        resultCard.style.display = 'block';
        processCompression();
        window.XestusApp.showToast(`Loaded ${file.name} (${formatBytes(file.size)})`, 'success');
      };
      originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Quality slider event
  if (qualitySlider) {
    qualitySlider.addEventListener('input', () => {
      qualityVal.textContent = `${qualitySlider.value}%`;
      processCompression();
    });
  }

  if (formatSelect) formatSelect.addEventListener('change', processCompression);
  if (resizeSelect) resizeSelect.addEventListener('change', processCompression);

  // Target KB auto-optimizer
  if (applyTargetBtn && targetKbInput) {
    applyTargetBtn.addEventListener('click', async () => {
      const targetKb = parseFloat(targetKbInput.value);
      if (!targetKb || targetKb <= 0) {
        window.XestusApp.showToast('Enter a valid target size in KB', 'warning');
        return;
      }
      if (!currentFile) {
        window.XestusApp.showToast('Please upload an image first', 'warning');
        return;
      }

      window.XestusApp.showToast(`Optimizing image for target ${targetKb} KB...`, 'info');

      // Binary search for optimal quality
      let low = 5;
      let high = 100;
      let bestQuality = 75;
      let iterations = 7;

      for (let i = 0; i < iterations; i++) {
        let mid = Math.round((low + high) / 2);
        const blob = await compressToBlob(mid / 100);
        const sizeKb = blob.size / 1024;
        
        bestQuality = mid;
        if (Math.abs(sizeKb - targetKb) < 3) {
          break;
        }
        if (sizeKb > targetKb) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      qualitySlider.value = bestQuality;
      qualityVal.textContent = `${bestQuality}%`;
      processCompression();
      window.XestusApp.showToast(`Matched closest quality: ${bestQuality}%`, 'success');
    });
  }

  function compressToBlob(quality) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = parseFloat(resizeSelect ? resizeSelect.value : 1);
      
      canvas.width = Math.max(1, Math.round(originalImage.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(originalImage.naturalHeight * scale));

      // Draw background if transparent PNG converted to JPEG
      const format = formatSelect ? formatSelect.value : 'image/jpeg';
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), format, quality);
    });
  }

  async function processCompression() {
    if (!originalImage.src || !currentFile) return;

    const quality = parseFloat(qualitySlider.value) / 100;
    const blob = await compressToBlob(quality);
    compressedBlob = blob;

    const compressedUrl = URL.createObjectURL(blob);
    imgAfter.src = compressedUrl;

    // Update stats
    originalSizeEl.textContent = formatBytes(currentFile.size);
    compressedSizeEl.textContent = formatBytes(blob.size);

    const saved = ((currentFile.size - blob.size) / currentFile.size) * 100;
    if (saved >= 0) {
      savedPercentEl.textContent = `-${saved.toFixed(1)}%`;
      savedPercentEl.parentElement.classList.add('saved');
    } else {
      savedPercentEl.textContent = `+${Math.abs(saved).toFixed(1)}%`;
      savedPercentEl.parentElement.classList.remove('saved');
    }
  }

  // Download Action
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!compressedBlob) return;
      const format = formatSelect ? formatSelect.value : 'image/jpeg';
      const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
      const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "image";
      const filename = `${baseName}-xestus-compressed.${ext}`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(compressedBlob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.XestusApp.triggerConfetti();
      window.XestusApp.showToast(`Downloaded ${filename}!`, 'success');
    });
  }

  // Split-slider interaction
  if (splitContainer) {
    const moveSlider = (clientX) => {
      const rect = splitContainer.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      const pct = (pos * 100).toFixed(1);
      
      imgAfter.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
      splitLine.style.left = `${pct}%`;
      splitHandle.style.left = `${pct}%`;
    };

    splitContainer.addEventListener('mousedown', (e) => {
      isDraggingSplit = true;
      moveSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingSplit) moveSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDraggingSplit = false;
    });

    // Touch support
    splitContainer.addEventListener('touchstart', (e) => {
      isDraggingSplit = true;
      if (e.touches[0]) moveSlider(e.touches[0].clientX);
    });
    window.addEventListener('touchmove', (e) => {
      if (isDraggingSplit && e.touches[0]) moveSlider(e.touches[0].clientX);
    });
    window.addEventListener('touchend', () => isDraggingSplit = false);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
