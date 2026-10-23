/**
 * Xestus OmniTools - Base64 & URL Transformer
 */

export function initBase64Tool() {
  const tabs = document.querySelectorAll('.b64-mode-btn');
  const panelText = document.getElementById('b64-panel-text');
  const panelFile = document.getElementById('b64-panel-file');
  const panelUrl = document.getElementById('b64-panel-url');

  // Text panel elements
  const textInput = document.getElementById('b64-text-input');
  const encodeTextBtn = document.getElementById('b64-encode-text-btn');
  const decodeTextBtn = document.getElementById('b64-decode-text-btn');
  const copyTextBtn = document.getElementById('b64-copy-text-btn');

  // File panel elements
  const fileInput = document.getElementById('b64-file-input');
  const fileDropzone = document.getElementById('b64-file-dropzone');
  const fileOutput = document.getElementById('b64-file-output');
  const filePreviewImg = document.getElementById('b64-file-preview-img');
  const copyDataUriBtn = document.getElementById('b64-copy-file-btn');

  // URL panel elements
  const urlInput = document.getElementById('b64-url-input');
  const encodeUrlBtn = document.getElementById('b64-url-encode-btn');
  const decodeUrlBtn = document.getElementById('b64-url-decode-btn');
  const urlParamsList = document.getElementById('b64-url-params-list');

  // Mode switching
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      if (panelText) panelText.style.display = mode === 'text' ? 'block' : 'none';
      if (panelFile) panelFile.style.display = mode === 'file' ? 'block' : 'none';
      if (panelUrl) panelUrl.style.display = mode === 'url' ? 'block' : 'none';
    });
  });

  // Text Base64 Encode / Decode with safe UTF-8 support
  if (encodeTextBtn) {
    encodeTextBtn.addEventListener('click', () => {
      const val = textInput.value;
      if (!val) return;
      try {
        const bytes = new TextEncoder().encode(val);
        const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
        textInput.value = btoa(binString);
        window.XestusApp.showToast('Encoded to Base64!', 'success');
      } catch (err) {
        window.XestusApp.showToast('Encoding error: ' + err.message, 'danger');
      }
    });
  }

  if (decodeTextBtn) {
    decodeTextBtn.addEventListener('click', () => {
      const val = textInput.value.trim();
      if (!val) return;
      try {
        const binString = atob(val);
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
        textInput.value = new TextDecoder().decode(bytes);
        window.XestusApp.showToast('Decoded from Base64!', 'success');
      } catch (err) {
        window.XestusApp.showToast('Invalid Base64 string.', 'danger');
      }
    });
  }

  if (copyTextBtn) {
    copyTextBtn.addEventListener('click', () => {
      if (!textInput.value) return;
      navigator.clipboard.writeText(textInput.value);
      window.XestusApp.showToast('Copied to clipboard!', 'success');
    });
  }

  // File to Base64
  if (fileDropzone) {
    fileDropzone.addEventListener('click', () => fileInput.click());
    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('dragover');
    });
    fileDropzone.addEventListener('dragleave', () => fileDropzone.classList.remove('dragover'));
    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFileToBase64(e.dataTransfer.files[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processFileToBase64(e.target.files[0]);
      }
    });
  }

  function processFileToBase64(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target.result;
      if (fileOutput) fileOutput.value = dataUri;
      if (filePreviewImg) {
        if (file.type.startsWith('image/')) {
          filePreviewImg.src = dataUri;
          filePreviewImg.style.display = 'block';
        } else {
          filePreviewImg.style.display = 'none';
        }
      }
      window.XestusApp.showToast(`Converted "${file.name}" to Base64 Data URI!`, 'success');
    };
    reader.readAsDataURL(file);
  }

  if (copyDataUriBtn) {
    copyDataUriBtn.addEventListener('click', () => {
      if (!fileOutput.value) return;
      navigator.clipboard.writeText(fileOutput.value);
      window.XestusApp.showToast('Data URI copied to clipboard!', 'success');
    });
  }

  // URL Encoder / Decoder & Query Param Breakdown
  if (encodeUrlBtn) {
    encodeUrlBtn.addEventListener('click', () => {
      if (!urlInput.value) return;
      urlInput.value = encodeURIComponent(urlInput.value);
      parseUrlParams();
      window.XestusApp.showToast('URL Encoded!', 'success');
    });
  }

  if (decodeUrlBtn) {
    decodeUrlBtn.addEventListener('click', () => {
      if (!urlInput.value) return;
      try {
        urlInput.value = decodeURIComponent(urlInput.value);
        parseUrlParams();
        window.XestusApp.showToast('URL Decoded!', 'success');
      } catch (e) {
        window.XestusApp.showToast('Malformed URL string.', 'danger');
      }
    });
  }

  if (urlInput) {
    urlInput.addEventListener('input', parseUrlParams);
  }

  function parseUrlParams() {
    if (!urlParamsList) return;
    urlParamsList.innerHTML = '';
    const str = urlInput.value.trim();
    if (!str.includes('?')) return;

    try {
      const queryStr = str.split('?')[1].split('#')[0];
      const params = new URLSearchParams(queryStr);
      
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.marginTop = '1rem';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '0.85rem';

      table.innerHTML = `
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); text-align: left;">
            <th style="padding: 0.5rem; color: var(--text-muted);">Parameter Key</th>
            <th style="padding: 0.5rem; color: var(--text-muted);">Decoded Value</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector('tbody');
      for (const [key, val] of params.entries()) {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border-color)';
        row.innerHTML = `
          <td style="padding: 0.5rem; font-family: monospace; font-weight: 600; color: var(--accent-primary);">${key}</td>
          <td style="padding: 0.5rem; font-family: monospace;">${val}</td>
        `;
        tbody.appendChild(row);
      }
      urlParamsList.appendChild(table);
    } catch (e) {
      // not a valid URL search param string
    }
  }
}
