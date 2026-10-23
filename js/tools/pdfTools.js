/**
 * Xestus OmniTools - PDF Power Studio (The Complete iLovePDF Alternative)
 * 100% In-Browser & Zero Cloud Uploads
 * Includes: Merge, Split, Images to PDF, PDF to Images, Rotate, Watermark, Page Numbers
 */

export function initPdfTools() {
  const modeTabs = document.querySelectorAll('.pdf-mode-btn');
  const submodeContainers = document.querySelectorAll('.pdf-submode-container');

  // Tab switching
  modeTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      modeTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      
      submodeContainers.forEach(c => c.style.display = 'none');
      const targetContainer = document.getElementById(`pdf-${mode}-container`);
      if (targetContainer) targetContainer.style.display = 'block';
    });
  });

  // Initialize individual sub-modules
  initMergeSubmode();
  initSplitSubmode();
  initImg2PdfSubmode();
  initPdf2ImgSubmode();
  initRotateSubmode();
  initWatermarkSubmode();
  initPageNumSubmode();
}

// Helper: Ensure PDFLib is ready
function checkPDFLib() {
  if (typeof PDFLib === 'undefined') {
    if (window.XestusApp?.showToast) {
      window.XestusApp.showToast('PDF engine is initializing, please try again in a second.', 'warning');
    }
    return false;
  }
  return true;
}

// Helper: File Download
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Helper: Format bytes
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/* ==========================================================================
   1. MERGE PDF SUBMODE
   ========================================================================== */
function initMergeSubmode() {
  const fileInput = document.getElementById('pdf-merge-input');
  const dropzone = document.getElementById('pdf-merge-dropzone');
  const fileListEl = document.getElementById('pdf-file-list');
  const executeBtn = document.getElementById('pdf-execute-merge');

  let pdfList = [];

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files) handleFiles(Array.from(e.target.files));
    });
  }

  async function handleFiles(files) {
    const valid = files.filter(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');
    if (valid.length === 0) {
      window.XestusApp?.showToast('Please select valid PDF documents.', 'warning');
      return;
    }
    if (!checkPDFLib()) return;

    for (const file of valid) {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(buffer);
        pdfList.push({ file, buffer, pages: doc.getPageCount() });
      } catch (err) {
        window.XestusApp?.showToast(`Could not read "${file.name}". Is it password protected?`, 'danger');
      }
    }
    renderList();
  }

  function renderList() {
    if (!fileListEl) return;
    fileListEl.innerHTML = '';

    if (pdfList.length === 0) {
      fileListEl.innerHTML = '<p class="text-muted" style="text-align: center; padding: 1rem;">No PDFs added yet.</p>';
      if (executeBtn) executeBtn.disabled = true;
      return;
    }

    if (executeBtn) executeBtn.disabled = pdfList.length < 2;

    pdfList.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'pdf-file-item';
      el.innerHTML = `
        <div class="pdf-file-name">
          <span>📄</span>
          <span>${item.file.name}</span>
          <span class="pdf-file-size">(${item.pages} pages &bull; ${formatBytes(item.file.size)})</span>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button class="btn-sm btn-secondary" title="Remove" style="padding: 0.25rem 0.6rem; color: var(--danger);">✕</button>
        </div>
      `;
      el.querySelector('button').addEventListener('click', () => {
        pdfList.splice(idx, 1);
        renderList();
      });
      fileListEl.appendChild(el);
    });
  }

  if (executeBtn) {
    executeBtn.addEventListener('click', async () => {
      if (pdfList.length < 2) return;
      if (!checkPDFLib()) return;

      try {
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<span>⏳</span> Merging Documents...';
        window.XestusApp?.showToast('Merging PDFs locally in your browser...', 'info');

        const mergedDoc = await PDFLib.PDFDocument.create();

        for (const item of pdfList) {
          const doc = await PDFLib.PDFDocument.load(item.buffer);
          const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
          copiedPages.forEach(p => mergedDoc.addPage(p));
        }

        const mergedBytes = await mergedDoc.save();
        const blob = new Blob([mergedBytes], { type: 'application/pdf' });
        triggerDownload(blob, `xestus-merged-${Date.now()}.pdf`);

        window.XestusApp?.triggerConfetti();
        window.XestusApp?.showToast('PDFs merged and downloaded successfully!', 'success');
      } catch (err) {
        console.error(err);
        window.XestusApp?.showToast('Error occurred while merging PDFs.', 'danger');
      } finally {
        executeBtn.disabled = false;
        executeBtn.innerHTML = '<span>⚡</span> Merge &amp; Download Combined PDF';
      }
    });
  }
}

/* ==========================================================================
   2. SPLIT & EXTRACT SUBMODE
   ========================================================================== */
function initSplitSubmode() {
  const fileInput = document.getElementById('pdf-split-input');
  const dropzone = document.getElementById('pdf-split-dropzone');
  const infoEl = document.getElementById('pdf-split-file-info');
  const rangeInput = document.getElementById('pdf-split-range');
  const executeBtn = document.getElementById('pdf-execute-split');

  let currentSplit = null;

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  async function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      window.XestusApp?.showToast('Please select a valid PDF file.', 'warning');
      return;
    }
    if (!checkPDFLib()) return;

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFLib.PDFDocument.load(buffer);
      currentSplit = { file, buffer, pageCount: doc.getPageCount() };

      infoEl.style.display = 'block';
      infoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${currentSplit.pageCount} total pages, ${formatBytes(file.size)})`;
      executeBtn.disabled = false;
      window.XestusApp?.showToast(`Loaded "${file.name}" with ${currentSplit.pageCount} pages.`, 'success');
    } catch (e) {
      window.XestusApp?.showToast('Failed to load PDF. Check if it is password encrypted.', 'danger');
    }
  }

  function parsePageRanges(str, total) {
    const pages = new Set();
    const parts = str.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= total) pages.add(i - 1);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= total) pages.add(p - 1);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  if (executeBtn) {
    executeBtn.addEventListener('click', async () => {
      if (!currentSplit || !checkPDFLib()) return;
      const rangeStr = rangeInput.value.trim();
      if (!rangeStr) {
        window.XestusApp?.showToast('Please specify page numbers to extract (e.g., 1-3, 5).', 'warning');
        return;
      }

      const indices = parsePageRanges(rangeStr, currentSplit.pageCount);
      if (indices.length === 0) {
        window.XestusApp?.showToast(`Invalid page numbers. Total pages in PDF: ${currentSplit.pageCount}`, 'warning');
        return;
      }

      try {
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<span>⏳</span> Extracting Pages...';

        const srcDoc = await PDFLib.PDFDocument.load(currentSplit.buffer);
        const newDoc = await PDFLib.PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, indices);
        pages.forEach(p => newDoc.addPage(p));

        const bytes = await newDoc.save();
        triggerDownload(new Blob([bytes], { type: 'application/pdf' }), `xestus-extracted-pages-${Date.now()}.pdf`);

        window.XestusApp?.triggerConfetti();
        window.XestusApp?.showToast(`Extracted ${indices.length} page(s) successfully!`, 'success');
      } catch (err) {
        console.error(err);
        window.XestusApp?.showToast('Failed to extract pages.', 'danger');
      } finally {
        executeBtn.disabled = false;
        executeBtn.innerHTML = '<span>✂️</span> Extract Pages &amp; Download PDF';
      }
    });
  }
}

/* ==========================================================================
   3. IMAGES TO PDF (JPG/PNG TO PDF) SUBMODE
   ========================================================================== */
function initImg2PdfSubmode() {
  const fileInput = document.getElementById('pdf-img2pdf-input');
  const dropzone = document.getElementById('pdf-img2pdf-dropzone');
  const controls = document.getElementById('pdf-img2pdf-controls');
  const previewList = document.getElementById('pdf-img2pdf-preview-list');
  const formatSelect = document.getElementById('pdf-img2pdf-format');
  const orientSelect = document.getElementById('pdf-img2pdf-orientation');
  const marginSelect = document.getElementById('pdf-img2pdf-margin');
  const executeBtn = document.getElementById('pdf-execute-img2pdf');

  let imgFiles = [];

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files) handleImages(Array.from(e.dataTransfer.files));
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files) handleImages(Array.from(e.target.files));
    });
  }

  function handleImages(files) {
    const valid = files.filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) {
      window.XestusApp?.showToast('Please select valid image files (JPG, PNG, WebP).', 'warning');
      return;
    }

    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgFiles.push({ file, dataUrl: e.target.result });
        renderPreview();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPreview() {
    if (!previewList) return;
    previewList.innerHTML = '';

    if (imgFiles.length === 0) {
      controls.style.display = 'none';
      return;
    }

    controls.style.display = 'block';

    imgFiles.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'pdf-img-thumb-item';
      card.innerHTML = `
        <button class="pdf-img-thumb-remove" title="Remove image">✕</button>
        <img src="${item.dataUrl}" alt="${item.file.name}">
        <span class="pdf-img-thumb-label">${item.file.name}</span>
      `;
      card.querySelector('.pdf-img-thumb-remove').addEventListener('click', () => {
        imgFiles.splice(idx, 1);
        renderPreview();
      });
      previewList.appendChild(card);
    });
  }

  if (executeBtn) {
    executeBtn.addEventListener('click', async () => {
      if (imgFiles.length === 0 || !checkPDFLib()) return;

      try {
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<span>⏳</span> Compiling PDF Document...';
        window.XestusApp?.showToast(`Converting ${imgFiles.length} images to PDF...`, 'info');

        const pdfDoc = await PDFLib.PDFDocument.create();
        const format = formatSelect.value;
        const orientation = orientSelect.value;
        const marginChoice = marginSelect.value;

        const margin = marginChoice === 'none' ? 0 : (marginChoice === 'small' ? 15 : 30);

        for (const item of imgFiles) {
          // Convert dataURL to standard PNG/JPEG buffer via canvas for 100% format compatibility
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = item.dataUrl;
          });

          // Draw on canvas to get clean PNG bytes
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const pngDataUrl = canvas.toDataURL('image/png');
          const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
          const embeddedImg = await pdfDoc.embedPng(pngBytes);

          let pageWidth, pageHeight;

          if (format === 'fit') {
            pageWidth = embeddedImg.width + (margin * 2);
            pageHeight = embeddedImg.height + (margin * 2);
          } else {
            // A4 or Letter
            let w = format === 'letter' ? 612 : 595.28;
            let h = format === 'letter' ? 792 : 841.89;
            if (orientation === 'landscape') {
              pageWidth = Math.max(w, h);
              pageHeight = Math.min(w, h);
            } else {
              pageWidth = Math.min(w, h);
              pageHeight = Math.max(w, h);
            }
          }

          const page = pdfDoc.addPage([pageWidth, pageHeight]);

          const availWidth = pageWidth - (margin * 2);
          const availHeight = pageHeight - (margin * 2);

          const imgRatio = embeddedImg.width / embeddedImg.height;
          const availRatio = availWidth / availHeight;

          let drawWidth, drawHeight;
          if (imgRatio > availRatio) {
            drawWidth = availWidth;
            drawHeight = availWidth / imgRatio;
          } else {
            drawHeight = availHeight;
            drawWidth = availHeight * imgRatio;
          }

          const x = margin + (availWidth - drawWidth) / 2;
          const y = margin + (availHeight - drawHeight) / 2;

          page.drawImage(embeddedImg, { x, y, width: drawWidth, height: drawHeight });
        }

        const pdfBytes = await pdfDoc.save();
        triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), `xestus-converted-doc-${Date.now()}.pdf`);

        window.XestusApp?.triggerConfetti();
        window.XestusApp?.showToast('Images converted to PDF successfully!', 'success');
      } catch (err) {
        console.error(err);
        window.XestusApp?.showToast('Error converting images to PDF.', 'danger');
      } finally {
        executeBtn.disabled = false;
        executeBtn.innerHTML = '<span>📄</span> Convert Images to PDF Document';
      }
    });
  }
}

/* ==========================================================================
   4. PDF TO IMAGES (EXTRACT HIGH-RES PNG) SUBMODE
   ========================================================================== */
function initPdf2ImgSubmode() {
  const fileInput = document.getElementById('pdf-pdf2img-input');
  const dropzone = document.getElementById('pdf-pdf2img-dropzone');
  const controls = document.getElementById('pdf-pdf2img-controls');
  const statusEl = document.getElementById('pdf-pdf2img-status');
  const renderGrid = document.getElementById('pdf-pages-render-grid');
  const dlAllBtn = document.getElementById('pdf-pdf2img-dl-all');

  let renderedPages = [];

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handlePdf(e.dataTransfer.files[0]);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handlePdf(e.target.files[0]);
    });
  }

  async function handlePdf(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      window.XestusApp?.showToast('Please select a valid PDF file.', 'warning');
      return;
    }

    if (typeof pdfjsLib === 'undefined') {
      window.XestusApp?.showToast('Rendering engine is initializing, please try again.', 'warning');
      return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    try {
      controls.style.display = 'block';
      renderGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading document pages...</div>';
      statusEl.textContent = `Reading ${file.name}...`;

      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;

      renderGrid.innerHTML = '';
      renderedPages = [];
      statusEl.textContent = `Rendered ${pdf.numPages} total pages:`;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/png');
        renderedPages.push({ pageNum, dataUrl, canvas });

        const card = document.createElement('div');
        card.className = 'pdf-page-card';
        card.innerHTML = `
          <div style="font-weight: 700; font-size: 0.9rem;">Page ${pageNum}</div>
          <img src="${dataUrl}" style="max-width: 100%; border-radius: var(--radius-xs); border: 1px solid var(--border-color);" alt="Page ${pageNum}">
          <div class="pdf-page-card-footer">
            <span>${canvas.width} x ${canvas.height} px</span>
            <button class="btn-sm btn-primary">⬇️ Download PNG</button>
          </div>
        `;
        card.querySelector('button').addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${file.name.replace('.pdf', '')}-page-${pageNum}.png`;
          a.click();
        });

        renderGrid.appendChild(card);
      }

      window.XestusApp?.showToast(`All ${pdf.numPages} pages rendered successfully!`, 'success');
    } catch (err) {
      console.error(err);
      window.XestusApp?.showToast('Error rendering PDF pages into images.', 'danger');
      renderGrid.innerHTML = '<div style="color: var(--danger); text-align: center; padding: 2rem;">Failed to render pages. PDF may be corrupted or encrypted.</div>';
    }
  }

  if (dlAllBtn) {
    dlAllBtn.addEventListener('click', () => {
      if (renderedPages.length === 0) return;
      renderedPages.forEach((p, idx) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = p.dataUrl;
          a.download = `page-${p.pageNum}.png`;
          a.click();
        }, idx * 250);
      });
      window.XestusApp?.showToast(`Downloading all ${renderedPages.length} images...`, 'info');
    });
  }
}

/* ==========================================================================
   5. ROTATE PDF SUBMODE
   ========================================================================== */
function initRotateSubmode() {
  const fileInput = document.getElementById('pdf-rotate-input');
  const dropzone = document.getElementById('pdf-rotate-dropzone');
  const controls = document.getElementById('pdf-rotate-controls');
  const infoEl = document.getElementById('pdf-rotate-info');
  const angleSelect = document.getElementById('pdf-rotate-angle');
  const targetSelect = document.getElementById('pdf-rotate-target');
  const executeBtn = document.getElementById('pdf-execute-rotate');

  let currentFile = null;
  let currentBuffer = null;
  let pageCount = 0;

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  async function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      window.XestusApp?.showToast('Please select a valid PDF file.', 'warning');
      return;
    }
    if (!checkPDFLib()) return;

    try {
      currentFile = file;
      currentBuffer = await file.arrayBuffer();
      const doc = await PDFLib.PDFDocument.load(currentBuffer);
      pageCount = doc.getPageCount();

      controls.style.display = 'block';
      infoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${pageCount} total pages, ${formatBytes(file.size)})`;
      window.XestusApp?.showToast(`Loaded ${file.name}`, 'success');
    } catch (err) {
      window.XestusApp?.showToast('Failed to load PDF file.', 'danger');
    }
  }

  if (executeBtn) {
    executeBtn.addEventListener('click', async () => {
      if (!currentBuffer || !checkPDFLib()) return;

      try {
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<span>⏳</span> Rotating Pages...';

        const pdfDoc = await PDFLib.PDFDocument.load(currentBuffer);
        const addAngle = parseInt(angleSelect.value, 10);
        const target = targetSelect.value;

        const count = pdfDoc.getPageCount();
        for (let i = 0; i < count; i++) {
          const pageNum = i + 1;
          if (target === 'odd' && pageNum % 2 === 0) continue;
          if (target === 'even' && pageNum % 2 !== 0) continue;

          const page = pdfDoc.getPage(i);
          const currentRotation = page.getRotation().angle || 0;
          page.setRotation(PDFLib.degrees((currentRotation + addAngle) % 360));
        }

        const bytes = await pdfDoc.save();
        triggerDownload(new Blob([bytes], { type: 'application/pdf' }), `xestus-rotated-${Date.now()}.pdf`);

        window.XestusApp?.triggerConfetti();
        window.XestusApp?.showToast('PDF rotated and downloaded successfully!', 'success');
      } catch (err) {
        console.error(err);
        window.XestusApp?.showToast('Error rotating PDF.', 'danger');
      } finally {
        executeBtn.disabled = false;
        executeBtn.innerHTML = '<span>🔄</span> Rotate &amp; Download PDF';
      }
    });
  }
}

/* ==========================================================================
   6. WATERMARK PDF SUBMODE
   ========================================================================== */
function initWatermarkSubmode() {
  const fileInput = document.getElementById('pdf-watermark-input');
  const dropzone = document.getElementById('pdf-watermark-dropzone');
  const controls = document.getElementById('pdf-watermark-controls');
  const infoEl = document.getElementById('pdf-watermark-info');
  const textInput = document.getElementById('pdf-watermark-text');
  const colorSelect = document.getElementById('pdf-watermark-color');
  const angleSelect = document.getElementById('pdf-watermark-angle');
  const opacitySlider = document.getElementById('pdf-watermark-opacity');
  const opacityVal = document.getElementById('pdf-wm-opacity-val');
  const executeBtn = document.getElementById('pdf-execute-watermark');

  let currentBuffer = null;
  let currentFile = null;

  if (opacitySlider && opacityVal) {
    opacitySlider.addEventListener('input', () => {
      opacityVal.textContent = `${opacitySlider.value}%`;
    });
  }

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  async function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      window.XestusApp?.showToast('Please select a valid PDF file.', 'warning');
      return;
    }
    if (!checkPDFLib()) return;

    try {
      currentFile = file;
      currentBuffer = await file.arrayBuffer();
      const doc = await PDFLib.PDFDocument.load(currentBuffer);

      controls.style.display = 'block';
      infoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${doc.getPageCount()} pages)`;
      window.XestusApp?.showToast(`Loaded ${file.name}`, 'success');
    } catch (err) {
      window.XestusApp?.showToast('Failed to load PDF file.', 'danger');
    }
  }

  if (executeBtn) {
    executeBtn.addEventListener('click', async () => {
      if (!currentBuffer || !checkPDFLib()) return;

      try {
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<span>⏳</span> Stamping Watermark...';

        const pdfDoc = await PDFLib.PDFDocument.load(currentBuffer);
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        const wmText = textInput.value.trim() || 'CONFIDENTIAL';

        const colorChoice = colorSelect.value;
        let color = PDFLib.rgb(0.5, 0.5, 0.5);
        if (colorChoice === 'red') color = PDFLib.rgb(0.85, 0.15, 0.15);
        if (colorChoice === 'indigo') color = PDFLib.rgb(0.39, 0.40, 0.94);

        const opacity = parseFloat(opacitySlider.value) / 100;
        const angle = parseInt(angleSelect.value, 10);

        const pages = pdfDoc.getPages();
        for (const page of pages) {
          const { width, height } = page.getSize();
          const fontSize = Math.max(28, Math.min(width, height) / 10);
          const textWidth = font.widthOfTextAtSize(wmText, fontSize);
          const textHeight = font.heightAtSize(fontSize);

          page.drawText(wmText, {
            x: width / 2 - textWidth / 2,
            y: height / 2 - textHeight / 2,
            size: fontSize,
            font,
            color,
            opacity,
            rotate: PDFLib.degrees(angle)
          });
        }

        const bytes = await pdfDoc.save();
        triggerDownload(new Blob([bytes], { type: 'application/pdf' }), `xestus-watermarked-${Date.now()}.pdf`);

        window.XestusApp?.triggerConfetti();
        window.XestusApp?.showToast('Watermark stamped successfully!', 'success');
      } catch (err) {
        console.error(err);
        window.XestusApp?.showToast('Error applying watermark.', 'danger');
      } finally {
        executeBtn.disabled = false;
        executeBtn.innerHTML = '<span>💧</span> Apply Watermark &amp; Download PDF';
      }
    });
  }
}

/* ==========================================================================
   7. ADD PAGE NUMBERS SUBMODE
   ========================================================================== */
function initPageNumSubmode() {
  const fileInput = document.getElementById('pdf-pagenum-input');
  const dropzone = document.getElementById('pdf-pagenum-dropzone');
  const controls = document.getElementById('pdf-pagenum-controls');
  const infoEl = document.getElementById('pdf-pagenum-info');
  const formatSelect = document.getElementById('pdf-pagenum-format');
  const posSelect = document.getElementById('pdf-pagenum-pos');
  const executeBtn = document.getElementById('pdf-execute-pagenum');

  let currentBuffer = null;
  let currentFile = null;

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  async function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      window.XestusApp?.showToast('Please select a valid PDF file.', 'warning');
      return;
    }
    if (!checkPDFLib()) return;

    try {
      currentFile = file;
      currentBuffer = await file.arrayBuffer();
      const doc = await PDFLib.PDFDocument.load(currentBuffer);

      controls.style.display = 'block';
      infoEl.innerHTML = `<strong>Selected:</strong> ${file.name} (${doc.getPageCount()} pages)`;
      window.XestusApp?.showToast(`Loaded ${file.name}`, 'success');
    } catch (err) {
      window.XestusApp?.showToast('Failed to load PDF file.', 'danger');
    }
  }

  if (executeBtn) {
    executeBtn.addEventListener('click', async () => {
      if (!currentBuffer || !checkPDFLib()) return;

      try {
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<span>⏳</span> Stamping Page Numbers...';

        const pdfDoc = await PDFLib.PDFDocument.load(currentBuffer);
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        const format = formatSelect.value;
        const position = posSelect.value;

        const total = pdfDoc.getPageCount();
        const fontSize = 10;
        const fontColor = PDFLib.rgb(0.35, 0.35, 0.35);

        for (let i = 0; i < total; i++) {
          const page = pdfDoc.getPage(i);
          const n = i + 1;
          let label = `Page ${n} of ${total}`;
          if (format === 'n_of_total') label = `${n} of ${total}`;
          if (format === 'page_n') label = `Page ${n}`;
          if (format === 'n_only') label = `${n}`;

          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(label, fontSize);

          let x, y;
          if (position === 'bottom_center') {
            x = width / 2 - textWidth / 2;
            y = 25;
          } else if (position === 'bottom_right') {
            x = width - textWidth - 35;
            y = 25;
          } else if (position === 'bottom_left') {
            x = 35;
            y = 25;
          } else if (position === 'top_center') {
            x = width / 2 - textWidth / 2;
            y = height - 30;
          }

          page.drawText(label, { x, y, size: fontSize, font, color: fontColor });
        }

        const bytes = await pdfDoc.save();
        triggerDownload(new Blob([bytes], { type: 'application/pdf' }), `xestus-numbered-${Date.now()}.pdf`);

        window.XestusApp?.triggerConfetti();
        window.XestusApp?.showToast('Page numbers stamped successfully!', 'success');
      } catch (err) {
        console.error(err);
        window.XestusApp?.showToast('Error stamping page numbers.', 'danger');
      } finally {
        executeBtn.disabled = false;
        executeBtn.innerHTML = '<span>🔢</span> Stamp Page Numbers &amp; Download PDF';
      }
    });
  }
}
