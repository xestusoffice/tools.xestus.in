/**
 * Xestus OmniTools - Text Analyzer & Inspector
 */

export function initTextAnalyzer() {
  const textarea = document.getElementById('text-input-area');
  const wordsEl = document.getElementById('stat-words');
  const charsEl = document.getElementById('stat-chars');
  const charsNoSpaceEl = document.getElementById('stat-chars-nospace');
  const sentencesEl = document.getElementById('stat-sentences');
  const paragraphsEl = document.getElementById('stat-paragraphs');
  const readTimeEl = document.getElementById('stat-read-time');
  const speakTimeEl = document.getElementById('stat-speak-time');

  const btnUppercase = document.getElementById('btn-case-upper');
  const btnLowercase = document.getElementById('btn-case-lower');
  const btnTitlecase = document.getElementById('btn-case-title');
  const btnSentencecase = document.getElementById('btn-case-sentence');
  const btnCamelcase = document.getElementById('btn-case-camel');
  const btnSlugify = document.getElementById('btn-case-slug');

  const btnRemoveDups = document.getElementById('btn-clean-duplicates');
  const btnCleanSpaces = document.getElementById('btn-clean-spaces');
  const btnStripHtml = document.getElementById('btn-clean-html');
  const btnCopy = document.getElementById('btn-text-copy');
  const btnClear = document.getElementById('btn-text-clear');

  if (textarea) {
    textarea.addEventListener('input', updateStats);
  }

  function updateStats() {
    const text = textarea ? textarea.value : '';

    // Characters
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;

    // Words
    const wordsArr = text.trim().match(/\b\w+\b/g) || [];
    const words = wordsArr.length;

    // Sentences
    const sentencesArr = text.trim().match(/[.!?]+(?:\s+|$)/g) || [];
    const sentences = text.trim() ? Math.max(1, sentencesArr.length) : 0;

    // Paragraphs
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0;

    // Reading & Speaking Time
    const readMin = (words / 200).toFixed(1);
    const speakMin = (words / 130).toFixed(1);

    if (wordsEl) wordsEl.textContent = words.toLocaleString();
    if (charsEl) charsEl.textContent = chars.toLocaleString();
    if (charsNoSpaceEl) charsNoSpaceEl.textContent = charsNoSpace.toLocaleString();
    if (sentencesEl) sentencesEl.textContent = sentences.toLocaleString();
    if (paragraphsEl) paragraphsEl.textContent = paragraphs.toLocaleString();
    if (readTimeEl) readTimeEl.textContent = `${readMin}m`;
    if (speakTimeEl) speakTimeEl.textContent = `${speakMin}m`;
  }

  // Case transforms
  if (btnUppercase) {
    btnUppercase.addEventListener('click', () => {
      textarea.value = textarea.value.toUpperCase();
      updateStats();
    });
  }

  if (btnLowercase) {
    btnLowercase.addEventListener('click', () => {
      textarea.value = textarea.value.toLowerCase();
      updateStats();
    });
  }

  if (btnTitlecase) {
    btnTitlecase.addEventListener('click', () => {
      textarea.value = textarea.value.toLowerCase().replace(/(^|\s)\S/g, (t) => t.toUpperCase());
      updateStats();
    });
  }

  if (btnSentencecase) {
    btnSentencecase.addEventListener('click', () => {
      textarea.value = textarea.value.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
      updateStats();
    });
  }

  if (btnCamelcase) {
    btnCamelcase.addEventListener('click', () => {
      textarea.value = textarea.value
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
      updateStats();
    });
  }

  if (btnSlugify) {
    btnSlugify.addEventListener('click', () => {
      textarea.value = textarea.value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      updateStats();
    });
  }

  // Clean utilities
  if (btnRemoveDups) {
    btnRemoveDups.addEventListener('click', () => {
      const lines = textarea.value.split('\n');
      const unique = Array.from(new Set(lines));
      textarea.value = unique.join('\n');
      updateStats();
      window.XestusApp.showToast(`Removed ${lines.length - unique.length} duplicate lines.`, 'success');
    });
  }

  if (btnCleanSpaces) {
    btnCleanSpaces.addEventListener('click', () => {
      textarea.value = textarea.value.replace(/[ \t]+/g, ' ').replace(/^\s+|\s+$/gm, '');
      updateStats();
      window.XestusApp.showToast('Extra spaces cleaned!', 'success');
    });
  }

  if (btnStripHtml) {
    btnStripHtml.addEventListener('click', () => {
      const doc = new DOMParser().parseFromString(textarea.value, 'text/html');
      textarea.value = doc.body.textContent || '';
      updateStats();
      window.XestusApp.showToast('HTML tags stripped!', 'success');
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (!textarea.value.trim()) return;
      navigator.clipboard.writeText(textarea.value);
      window.XestusApp.showToast('Text copied to clipboard!', 'success');
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      textarea.value = '';
      updateStats();
    });
  }

  // Init
  updateStats();
}
