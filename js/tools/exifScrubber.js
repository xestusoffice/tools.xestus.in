/**
 * Xestus OmniTools - Privacy EXIF Metadata Inspector & Scrubber
 * 100% In-Browser Inspection and Clean-Strip of GPS & Camera Data
 */

export function initExifScrubber() {
  const fileInput = document.getElementById('exif-file-input');
  const dropzone = document.getElementById('exif-dropzone');
  const resultCard = document.getElementById('exif-result-card');
  const previewImg = document.getElementById('exif-preview-img');

  const riskBadge = document.getElementById('exif-risk-badge');
  const tableBody = document.getElementById('exif-table-body');
  const scrubBtn = document.getElementById('exif-scrub-btn');
  const copyStatsBtn = document.getElementById('exif-copy-stats-btn');

  let currentFile = null;
  let parsedMetadata = [];
  let hasGps = false;

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleImage(e.dataTransfer.files[0]);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleImage(e.target.files[0]);
    });
  }

  async function handleImage(file) {
    if (!file.type.startsWith('image/')) {
      window.XestusApp?.showToast('Please select a valid image file (JPEG, PNG, WebP).', 'warning');
      return;
    }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = async (e) => {
      previewImg.src = e.target.result;
      resultCard.style.display = 'block';

      // Read buffer to inspect EXIF tags
      const buffer = await file.arrayBuffer();
      inspectMetadata(buffer, file);
    };
    reader.readAsDataURL(file);
  }

  // Parse JPEG EXIF segments
  function inspectMetadata(buffer, file) {
    parsedMetadata = [];
    hasGps = false;

    // Always include file-level meta
    parsedMetadata.push({ category: 'File System', tag: 'File Name', val: file.name });
    parsedMetadata.push({ category: 'File System', tag: 'File Size', val: formatBytes(file.size) });
    parsedMetadata.push({ category: 'File System', tag: 'MIME Type', val: file.type });
    parsedMetadata.push({ category: 'File System', tag: 'Last Modified', val: new Date(file.lastModified).toLocaleString() });

    const view = new DataView(buffer);

    // Check for JPEG SOI marker (0xFFD8)
    if (view.getUint16(0, false) === 0xFFD8) {
      let offset = 2;
      const length = view.byteLength;

      while (offset < length) {
        if (view.getUint8(offset) !== 0xFF) break;
        const marker = view.getUint8(offset + 1);

        // APP1 marker (0xFFE1) contains EXIF
        if (marker === 0xE1) {
          parseApp1Exif(view, offset + 4);
          break;
        } else {
          // Move to next marker
          const markerLength = view.getUint16(offset + 2, false);
          offset += 2 + markerLength;
        }
      }
    }

    renderMetadataTable();
  }

  function parseApp1Exif(view, startOffset) {
    // Check 'Exif\0\0'
    const exifHeader = String.fromCharCode(
      view.getUint8(startOffset),
      view.getUint8(startOffset + 1),
      view.getUint8(startOffset + 2),
      view.getUint8(startOffset + 3)
    );

    if (exifHeader !== 'Exif') return;

    const tiffOffset = startOffset + 6;
    const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;

    // Get First IFD
    const ifdOffset = tiffOffset + view.getUint32(tiffOffset + 4, littleEndian);
    parseIFD(view, tiffOffset, ifdOffset, littleEndian, 'Camera Device');
  }

  function parseIFD(view, tiffOffset, ifdOffset, littleEndian, category) {
    try {
      const numEntries = view.getUint16(ifdOffset, littleEndian);
      for (let i = 0; i < numEntries; i++) {
        const entryOffset = ifdOffset + 2 + (i * 12);
        const tag = view.getUint16(entryOffset, littleEndian);

        // Common EXIF Tags
        switch (tag) {
          case 0x010F: // Make
            parsedMetadata.push({ category, tag: 'Device Make', val: readString(view, tiffOffset, entryOffset, littleEndian) });
            break;
          case 0x0110: // Model
            parsedMetadata.push({ category, tag: 'Camera Model', val: readString(view, tiffOffset, entryOffset, littleEndian) });
            break;
          case 0x0131: // Software
            parsedMetadata.push({ category, tag: 'Software / OS', val: readString(view, tiffOffset, entryOffset, littleEndian) });
            break;
          case 0x0132: // DateTime
            parsedMetadata.push({ category, tag: 'Date/Time Original', val: readString(view, tiffOffset, entryOffset, littleEndian) });
            break;
          case 0x8769: { // Exif IFD Pointer
            const subIfd = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
            parseIFD(view, tiffOffset, subIfd, littleEndian, 'Exposure & Lens');
            break;
          }
          case 0x8825: { // GPS Info IFD Pointer
            hasGps = true;
            parsedMetadata.push({ category: 'Geolocation (GPS)', tag: 'GPS Location Coordinates', val: '⚠️ Precise Latitude & Longitude Embedded!' });
            break;
          }
        }
      }
    } catch (e) {
      // End of valid tag stream
    }
  }

  function readString(view, tiffOffset, entryOffset, littleEndian) {
    const numChars = view.getUint32(entryOffset + 4, littleEndian);
    const valOffset = numChars <= 4 ? entryOffset + 8 : tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
    let str = '';
    for (let i = 0; i < numChars; i++) {
      const code = view.getUint8(valOffset + i);
      if (code === 0) break;
      str += String.fromCharCode(code);
    }
    return str.trim();
  }

  function renderMetadataTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const hasCameraMeta = parsedMetadata.some(m => m.category === 'Camera Device' || m.category === 'Exposure & Lens');

    if (hasGps) {
      riskBadge.className = 'tool-badge-pill danger';
      riskBadge.textContent = '⚠️ High Risk: GPS Coordinates Exposed';
    } else if (hasCameraMeta) {
      riskBadge.className = 'tool-badge-pill warning';
      riskBadge.textContent = '⚠️ Moderate: Device & Camera Info Embedded';
    } else {
      riskBadge.className = 'tool-badge-pill popular';
      riskBadge.textContent = '✅ Safe: No Sensitive EXIF Found';
    }

    parsedMetadata.forEach(item => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 0.65rem 0.75rem; font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">${item.category}</td>
        <td style="padding: 0.65rem 0.75rem; font-weight: 500;">${item.tag}</td>
        <td style="padding: 0.65rem 0.75rem; font-family: monospace; color: ${item.val.includes('⚠️') ? 'var(--danger)' : 'var(--text-primary)'};">${item.val}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Scrub and Download Clean Image
  if (scrubBtn) {
    scrubBtn.addEventListener('click', () => {
      if (!currentFile) return;

      const img = new Image();
      img.onload = () => {
        // Redraw through canvas strips 100% of EXIF, GPS, and metadata chunks
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const ext = currentFile.type === 'image/png' ? 'png' : 'jpg';
          a.href = url;
          a.download = `xestus-clean-${currentFile.name.replace(/\.[^/.]+$/, '')}.${ext}`;
          a.click();
          URL.revokeObjectURL(url);

          window.XestusApp?.triggerConfetti();
          window.XestusApp?.showToast('All EXIF & GPS Metadata permanently removed!', 'success');
        }, currentFile.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.95);
      };
      img.src = previewImg.src;
    });
  }

  if (copyStatsBtn) {
    copyStatsBtn.addEventListener('click', () => {
      if (parsedMetadata.length === 0) return;
      const text = parsedMetadata.map(m => `[${m.category}] ${m.tag}: ${m.val}`).join('\n');
      navigator.clipboard.writeText(text);
      window.XestusApp?.showToast('Metadata report copied to clipboard!', 'success');
    });
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
