/**
 * Xestus OmniTools - JSON Formatter, Validator & Tree Inspector
 */

export function initJsonTools() {
  const editor = document.getElementById('json-editor');
  const indentSelect = document.getElementById('json-indent');
  const formatBtn = document.getElementById('json-format-btn');
  const minifyBtn = document.getElementById('json-minify-btn');
  const validateBtn = document.getElementById('json-validate-btn');
  const sampleBtn = document.getElementById('json-sample-btn');
  const copyBtn = document.getElementById('json-copy-btn');
  const clearBtn = document.getElementById('json-clear-btn');
  const downloadBtn = document.getElementById('json-download-btn');
  
  const statusEl = document.getElementById('json-status');
  const treeContainer = document.getElementById('json-tree-container');
  const toggleTreeBtn = document.getElementById('json-toggle-tree');

  let isTreeVisible = false;

  const sampleData = {
    brand: "Xestus",
    project: "OmniTools Suite",
    version: "2.0.0",
    client_side: true,
    privacy_level: "maximum",
    features: [
      { id: 1, name: "Smart Image Compressor", category: "media", secure: true },
      { id: 2, name: "PDF Local Merger", category: "document", secure: true },
      { id: 3, name: "Universal JSON Inspector", category: "developer", secure: true }
    ],
    stats: {
      daily_users: 125000,
      uptime_pct: 99.99,
      ratings: 4.95
    }
  };

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      editor.value = JSON.stringify(sampleData, null, 2);
      validateJson(false);
      window.XestusApp.showToast('Sample JSON loaded', 'info');
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      editor.value = '';
      statusEl.innerHTML = '<span class="text-muted">Waiting for input...</span>';
      treeContainer.innerHTML = '';
    });
  }

  function getIndent() {
    const val = indentSelect ? indentSelect.value : '2';
    if (val === 'tab') return '\t';
    return parseInt(val, 10);
  }

  if (formatBtn) {
    formatBtn.addEventListener('click', () => {
      const text = editor.value.trim();
      if (!text) {
        window.XestusApp.showToast('Editor is empty.', 'warning');
        return;
      }
      try {
        const parsed = JSON.parse(text);
        editor.value = JSON.stringify(parsed, null, getIndent());
        showStatus(true, 'Valid & Formatted successfully');
        if (isTreeVisible) renderTree(parsed);
      } catch (err) {
        showStatus(false, `Syntax Error: ${err.message}`);
      }
    });
  }

  if (minifyBtn) {
    minifyBtn.addEventListener('click', () => {
      const text = editor.value.trim();
      if (!text) return;
      try {
        const parsed = JSON.parse(text);
        editor.value = JSON.stringify(parsed);
        showStatus(true, 'Minified to 1 line');
      } catch (err) {
        showStatus(false, `Syntax Error: ${err.message}`);
      }
    });
  }

  if (validateBtn) {
    validateBtn.addEventListener('click', () => validateJson(true));
  }

  function validateJson(notify) {
    const text = editor.value.trim();
    if (!text) {
      if (notify) window.XestusApp.showToast('Editor is empty.', 'warning');
      return;
    }
    try {
      const parsed = JSON.parse(text);
      showStatus(true, 'Valid JSON (No syntax errors)');
      if (notify) window.XestusApp.showToast('JSON is 100% valid!', 'success');
      if (isTreeVisible) renderTree(parsed);
    } catch (err) {
      showStatus(false, `Error: ${err.message}`);
      if (notify) window.XestusApp.showToast(`Invalid JSON: ${err.message}`, 'danger');
    }
  }

  function showStatus(isValid, msg) {
    if (!statusEl) return;
    if (isValid) {
      statusEl.innerHTML = `<span style="color: var(--success); font-weight: 600;">✓ ${msg}</span>`;
    } else {
      statusEl.innerHTML = `<span style="color: var(--danger); font-weight: 600;">✕ ${msg}</span>`;
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!editor.value.trim()) return;
      navigator.clipboard.writeText(editor.value);
      window.XestusApp.showToast('JSON copied to clipboard!', 'success');
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!editor.value.trim()) return;
      const blob = new Blob([editor.value], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `xestus-data-${Date.now()}.json`;
      link.click();
      window.XestusApp.showToast('JSON file downloaded!', 'success');
    });
  }

  // Interactive Tree View
  if (toggleTreeBtn) {
    toggleTreeBtn.addEventListener('click', () => {
      isTreeVisible = !isTreeVisible;
      if (isTreeVisible) {
        toggleTreeBtn.textContent = 'Hide Tree';
        treeContainer.style.display = 'block';
        try {
          const parsed = JSON.parse(editor.value);
          renderTree(parsed);
        } catch (e) {
          treeContainer.innerHTML = '<p class="text-muted" style="padding: 1rem;">Fix JSON syntax errors to see tree.</p>';
        }
      } else {
        toggleTreeBtn.textContent = 'View Tree';
        treeContainer.style.display = 'none';
      }
    });
  }

  function renderTree(obj) {
    treeContainer.innerHTML = '';
    const root = createTreeNode('root', obj, true);
    treeContainer.appendChild(root);
  }

  function createTreeNode(key, value, isRoot = false) {
    const container = document.createElement('div');
    container.style.marginLeft = isRoot ? '0' : '1.25rem';
    container.style.fontFamily = "'JetBrains Mono', monospace";
    container.style.fontSize = '0.85rem';
    container.style.lineHeight = '1.7';

    if (value !== null && typeof value === 'object') {
      const isArray = Array.isArray(value);
      const keys = Object.keys(value);
      const header = document.createElement('div');
      header.style.cursor = 'pointer';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.gap = '0.4rem';

      const arrow = document.createElement('span');
      arrow.textContent = '▼';
      arrow.style.fontSize = '0.7rem';
      arrow.style.color = 'var(--text-muted)';
      arrow.style.transition = 'transform 0.15s ease';

      const keyLabel = document.createElement('strong');
      keyLabel.textContent = isRoot ? 'JSON Root' : `${key}:`;
      keyLabel.style.color = 'var(--accent-primary)';

      const countLabel = document.createElement('span');
      countLabel.textContent = isArray ? `[${keys.length} items]` : `{${keys.length} keys}`;
      countLabel.style.color = 'var(--text-muted)';

      header.appendChild(arrow);
      header.appendChild(keyLabel);
      header.appendChild(countLabel);

      const childrenBox = document.createElement('div');
      keys.forEach(k => {
        childrenBox.appendChild(createTreeNode(k, value[k]));
      });

      let expanded = true;
      header.addEventListener('click', () => {
        expanded = !expanded;
        childrenBox.style.display = expanded ? 'block' : 'none';
        arrow.style.transform = expanded ? 'rotate(0deg)' : 'rotate(-90deg)';
      });

      container.appendChild(header);
      container.appendChild(childrenBox);
    } else {
      const row = document.createElement('div');
      const k = document.createElement('span');
      k.textContent = `"${key}": `;
      k.style.color = 'var(--text-secondary)';

      const v = document.createElement('span');
      if (typeof value === 'string') {
        v.textContent = `"${value}"`;
        v.style.color = 'var(--success)';
      } else if (typeof value === 'number') {
        v.textContent = value;
        v.style.color = '#38bdf8';
      } else if (typeof value === 'boolean') {
        v.textContent = value;
        v.style.color = '#f59e0b';
      } else {
        v.textContent = 'null';
        v.style.color = 'var(--text-muted)';
      }

      row.appendChild(k);
      row.appendChild(v);
      container.appendChild(row);
    }
    return container;
  }
}
