/**
 * Xestus OmniTools - Visual Text Diff & Document Comparison Studio
 * 100% In-Browser Side-by-Side Line & Word Comparison
 */

export function initDiffChecker() {
  const origTextEl = document.getElementById('diff-orig-text');
  const modTextEl = document.getElementById('diff-mod-text');
  const compareBtn = document.getElementById('diff-compare-btn');
  const swapBtn = document.getElementById('diff-swap-btn');
  const clearBtn = document.getElementById('diff-clear-btn');
  const sampleBtn = document.getElementById('diff-sample-btn');

  const modeSplitBtn = document.getElementById('diff-mode-split');
  const modeUnifiedBtn = document.getElementById('diff-mode-unified');

  const resultsContainer = document.getElementById('diff-results-container');
  const splitViewEl = document.getElementById('diff-split-view');
  const unifiedViewEl = document.getElementById('diff-unified-view');

  const statSimilarity = document.getElementById('diff-stat-similarity');
  const statAdded = document.getElementById('diff-stat-added');
  const statRemoved = document.getElementById('diff-stat-removed');
  const statUnchanged = document.getElementById('diff-stat-unchanged');

  let currentMode = 'split'; // 'split' or 'unified'

  // Swap texts
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = origTextEl.value;
      origTextEl.value = modTextEl.value;
      modTextEl.value = temp;
      runDiff();
      window.XestusApp?.showToast('Swapped Original and Modified text', 'info');
    });
  }

  // Clear texts
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      origTextEl.value = '';
      modTextEl.value = '';
      resultsContainer.style.display = 'none';
      window.XestusApp?.showToast('Cleared comparison inputs', 'info');
    });
  }

  // Load sample text
  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      origTextEl.value = `// Xestus Service Level Agreement (v1.0)
Clause 1: Service Commitment
Xestus OmniTools guarantees 99.9% uptime for client-side web utilities.
All data processing shall be executed on third-party cloud servers.
Users can process up to 10 PDF documents per calendar day.
Refunds will be provided within 14 business days.`;

      modTextEl.value = `// Xestus Service Level Agreement (v2.0)
Clause 1: Service Commitment
Xestus OmniTools guarantees 100% uptime for client-side web utilities.
All data processing shall be executed 100% in-browser on the user's local device.
Users can process unlimited PDF documents without any daily limits or paywalls.
Refunds are unnecessary as all tools are 100% free forever.`;

      runDiff();
      window.XestusApp?.showToast('Sample document revision loaded!', 'success');
    });
  }

  // Toggle View Modes
  if (modeSplitBtn && modeUnifiedBtn) {
    modeSplitBtn.addEventListener('click', () => {
      currentMode = 'split';
      modeSplitBtn.classList.add('active');
      modeUnifiedBtn.classList.remove('active');
      splitViewEl.style.display = 'grid';
      unifiedViewEl.style.display = 'none';
    });

    modeUnifiedBtn.addEventListener('click', () => {
      currentMode = 'unified';
      modeUnifiedBtn.classList.add('active');
      modeSplitBtn.classList.remove('active');
      splitViewEl.style.display = 'none';
      unifiedViewEl.style.display = 'block';
    });
  }

  if (compareBtn) {
    compareBtn.addEventListener('click', runDiff);
  }

  // Real-time comparison on input change
  if (origTextEl && modTextEl) {
    origTextEl.addEventListener('input', debounce(runDiff, 300));
    modTextEl.addEventListener('input', debounce(runDiff, 300));
  }

  function runDiff() {
    const t1 = origTextEl.value;
    const t2 = modTextEl.value;

    if (!t1 && !t2) {
      resultsContainer.style.display = 'none';
      return;
    }

    resultsContainer.style.display = 'block';

    const lines1 = t1.split(/\r?\n/);
    const lines2 = t2.split(/\r?\n/);

    const diff = computeLCS(lines1, lines2);

    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    diff.forEach(item => {
      if (item.type === 'add') additions++;
      else if (item.type === 'del') deletions++;
      else unchanged++;
    });

    const totalLines = additions + deletions + unchanged;
    const similarity = totalLines > 0 ? Math.round((unchanged / (unchanged + Math.max(additions, deletions))) * 100) : 100;

    if (statSimilarity) statSimilarity.textContent = `${similarity}%`;
    if (statAdded) statAdded.textContent = `+${additions}`;
    if (statRemoved) statRemoved.textContent = `-${deletions}`;
    if (statUnchanged) statUnchanged.textContent = `${unchanged}`;

    renderSplitView(lines1, lines2, diff);
    renderUnifiedView(diff);
  }

  // Longest Common Subsequence (LCS) Diff Matrix
  function computeLCS(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find diff
    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
        result.unshift({ type: 'same', val: arr1[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'add', val: arr2[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        result.unshift({ type: 'del', val: arr1[i - 1] });
        i--;
      }
    }
    return result;
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSplitView(lines1, lines2, diff) {
    if (!splitViewEl) return;

    let leftHtml = '';
    let rightHtml = '';

    let lNum = 1;
    let rNum = 1;

    diff.forEach(item => {
      if (item.type === 'same') {
        leftHtml += `<div class="diff-line same"><span class="diff-num">${lNum++}</span><span class="diff-text">${escapeHtml(item.val)}</span></div>`;
        rightHtml += `<div class="diff-line same"><span class="diff-num">${rNum++}</span><span class="diff-text">${escapeHtml(item.val)}</span></div>`;
      } else if (item.type === 'del') {
        leftHtml += `<div class="diff-line del"><span class="diff-num">${lNum++}</span><span class="diff-text">- ${escapeHtml(item.val)}</span></div>`;
        rightHtml += `<div class="diff-line empty"><span class="diff-num">&nbsp;</span><span class="diff-text">&nbsp;</span></div>`;
      } else if (item.type === 'add') {
        leftHtml += `<div class="diff-line empty"><span class="diff-num">&nbsp;</span><span class="diff-text">&nbsp;</span></div>`;
        rightHtml += `<div class="diff-line add"><span class="diff-num">${rNum++}</span><span class="diff-text">+ ${escapeHtml(item.val)}</span></div>`;
      }
    });

    splitViewEl.innerHTML = `
      <div class="diff-col">
        <div class="diff-col-header">Original Document</div>
        <div class="diff-content-box">${leftHtml || '<div class="diff-empty-msg">No original content</div>'}</div>
      </div>
      <div class="diff-col">
        <div class="diff-col-header">Modified Document</div>
        <div class="diff-content-box">${rightHtml || '<div class="diff-empty-msg">No modified content</div>'}</div>
      </div>
    `;
  }

  function renderUnifiedView(diff) {
    if (!unifiedViewEl) return;

    let html = '';
    diff.forEach(item => {
      const cls = item.type === 'add' ? 'add' : (item.type === 'del' ? 'del' : 'same');
      const prefix = item.type === 'add' ? '+ ' : (item.type === 'del' ? '- ' : '  ');
      html += `<div class="diff-line ${cls}"><span class="diff-text">${prefix}${escapeHtml(item.val)}</span></div>`;
    });

    unifiedViewEl.innerHTML = `
      <div class="diff-col-header">Unified Inline Diff</div>
      <div class="diff-content-box">${html}</div>
    `;
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Run initial sample comparison
  if (origTextEl && !origTextEl.value) {
    origTextEl.value = `First line of text.\nSecond line needs review.\nEnd of document.`;
    modTextEl.value = `First line of text.\nSecond line is completely updated!\nThird newly added line.\nEnd of document.`;
    runDiff();
  }
}
