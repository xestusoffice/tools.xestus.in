/**
 * Xestus OmniTools - Markdown Live Studio
 */

export function initMarkdownStudio() {
  const editor = document.getElementById('md-editor-input');
  const preview = document.getElementById('md-preview-pane');
  const copyHtmlBtn = document.getElementById('md-copy-html-btn');
  const downloadMdBtn = document.getElementById('md-download-btn');

  // Toolbar action buttons
  const toolBtns = document.querySelectorAll('.md-tool-btn');

  const defaultContent = `# 🚀 Welcome to Xestus Markdown Studio
Write notes, documentation, or blog articles with instant real-time live preview.

## ✨ Key Capabilities
* **100% Client-Side:** Your writing never leaves your browser.
* **Instant Export:** Copy compiled HTML or download as \`.md\` file.
* **GitHub Flavored:** Supports tables, task lists, code blocks and more!

### 📊 Clean Markdown Table Example
| Tool | Category | Status |
| :--- | :--- | :--- |
| Image Studio | Media | Active |
| PDF Merger | Documents | Active |
| QR Designer | Utilities | Active |

> "Simplicity is the soul of efficiency." — Austin Freeman

\`\`\`javascript
// Example Code Block
function greetUser() {
  console.log("Powered by Xestus Technologies");
}
\`\`\`
`;

  if (editor && !editor.value) {
    editor.value = defaultContent;
  }

  function renderMarkdown() {
    if (!editor || !preview) return;
    preview.innerHTML = parseMarkdown(editor.value);
  }

  function parseMarkdown(md) {
    let html = md
      // Escape HTML entities to prevent injection
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```code```
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-sm); overflow-x: auto;"><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code style="background: var(--bg-surface-elevated); padding: 0.2rem 0.4rem; border-radius: 4px;">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 style="margin: 1.2rem 0 0.5rem; font-size: 1.25rem;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="margin: 1.5rem 0 0.6rem; font-size: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3rem;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="margin: 1.8rem 0 0.8rem; font-size: 1.85rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem;">$1</h1>');

    // Blockquote
    html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--accent-primary); padding-left: 1rem; margin: 1rem 0; color: var(--text-secondary); font-style: italic;">$1</blockquote>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links [Text](Url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary); text-decoration: underline;">$1</a>');

    // Simple Tables
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim() !== '');
      if (cells.some(c => c.includes('---'))) {
        return ''; // separator row
      }
      const td = cells.map(c => `<td style="padding: 0.6rem; border: 1px solid var(--border-color);">${c.trim()}</td>`).join('');
      return `<tr>${td}</tr>`;
    });
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table style="width: 100%; border-collapse: collapse; margin: 1.2rem 0;">$1</table>');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.35rem;">$1</li>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || p.startsWith('<table') || p.startsWith('<li')) {
        return p;
      }
      return `<p style="margin-bottom: 0.9rem;">${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
  }

  if (editor) editor.addEventListener('input', renderMarkdown);

  // Toolbar Actions
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      insertFormatting(action);
    });
  });

  function insertFormatting(type) {
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selected = text.substring(start, end);

    let before = '', after = '', defaultTxt = '';

    switch (type) {
      case 'bold': before = '**'; after = '**'; defaultTxt = 'bold text'; break;
      case 'italic': before = '*'; after = '*'; defaultTxt = 'italic text'; break;
      case 'h2': before = '## '; defaultTxt = 'Heading 2'; break;
      case 'code': before = '```\n'; after = '\n```'; defaultTxt = '// code here'; break;
      case 'link': before = '['; after = '](https://example.com)'; defaultTxt = 'link title'; break;
      case 'quote': before = '> '; defaultTxt = 'Quotation'; break;
      case 'list': before = '* '; defaultTxt = 'List item'; break;
    }

    const replacement = before + (selected || defaultTxt) + after;
    editor.value = text.substring(0, start) + replacement + text.substring(end);
    renderMarkdown();
    editor.focus();
    editor.setSelectionRange(start + before.length, start + before.length + (selected || defaultTxt).length);
  }

  // Copy Rendered HTML
  if (copyHtmlBtn) {
    copyHtmlBtn.addEventListener('click', () => {
      if (!preview) return;
      navigator.clipboard.writeText(preview.innerHTML);
      window.XestusApp.showToast('Rendered HTML copied to clipboard!', 'success');
    });
  }

  // Download .md
  if (downloadMdBtn) {
    downloadMdBtn.addEventListener('click', () => {
      if (!editor.value.trim()) return;
      const blob = new Blob([editor.value], { type: 'text/markdown' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `xestus-doc-${Date.now()}.md`;
      link.click();
      window.XestusApp.showToast('Markdown document downloaded!', 'success');
    });
  }

  renderMarkdown();
}
