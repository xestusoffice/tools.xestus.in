/**
 * Xestus OmniTools - Main Application Architecture & Router
 * Engineered for Xestus Technologies
 */

import { initImageCompressor } from './tools/imageCompressor.js';
import { initQrGenerator } from './tools/qrGenerator.js';
import { initPdfTools } from './tools/pdfTools.js';
import { initJsonTools } from './tools/jsonTools.js';
import { initPasswordGen } from './tools/passwordGen.js';
import { initFinanceCalc } from './tools/financeCalc.js';
import { initTextAnalyzer } from './tools/textAnalyzer.js';
import { initColorStudio } from './tools/colorStudio.js';
import { initBase64Tool } from './tools/base64Tool.js';
import { initUnitConverter } from './tools/unitConverter.js';
import { initMarkdownStudio } from './tools/markdownStudio.js';
import { initAgeCalculator } from './tools/ageCalculator.js';
import { initDiffChecker } from './tools/diffChecker.js';
import { initExifScrubber } from './tools/exifScrubber.js';
import { initSignaturePad } from './tools/signaturePad.js';
import { soundFx } from './soundEffects.js';
import { triggerConfetti } from './confetti.js';

// Central Tools Registry
export const TOOLS = [
  {
    id: 'image-compressor',
    title: 'Smart Image Compressor & Resizer',
    desc: 'Compress JPG, PNG, and WebP images to exact target KB with zero upload delay and interactive split-view comparison.',
    category: 'media',
    badge: 'popular',
    badgeText: 'Most Popular',
    icon: '🖼️',
    tags: ['compress', 'image', 'photo', 'resize', 'kb', 'jpg', 'png', 'webp', 'reduce size']
  },
  {
    id: 'qr-generator',
    title: 'Custom QR Code Studio',
    desc: 'Generate scannable vector & raster QR codes for URLs, WiFi networks, text, and vCards with custom color schemes.',
    category: 'utility',
    badge: 'popular',
    badgeText: 'Essential',
    icon: '📱',
    tags: ['qr', 'code', 'wifi', 'vcard', 'barcode', 'generator', 'scan']
  },
  {
    id: 'pdf-tools',
    title: 'PDF Power Studio (iLovePDF Alternative)',
    desc: 'Merge, split, convert JPG to PDF, extract PDF to images, rotate, watermark, and add page numbers 100% locally with zero server uploads.',
    category: 'document',
    badge: 'popular',
    badgeText: 'iLovePDF Suite',
    icon: '📑',
    tags: ['ilovepdf', 'smallpdf', 'pdf', 'merge', 'split', 'jpg to pdf', 'images to pdf', 'pdf to jpg', 'pdf to image', 'rotate pdf', 'watermark pdf', 'page numbers', 'document', 'convert', 'extract']
  },
  {
    id: 'json-tools',
    title: 'Universal JSON Formatter & Inspector',
    desc: 'Prettify, minify, validate, and inspect complex JSON data structures with visual collapsible tree navigation.',
    category: 'developer',
    badge: 'new',
    badgeText: 'Dev Favorite',
    icon: '💻',
    tags: ['json', 'format', 'prettify', 'minify', 'tree', 'validate', 'api', 'syntax']
  },
  {
    id: 'password-gen',
    title: 'Cryptographic Password Generator',
    desc: 'Generate mathematically unbreakable passwords or memorable Diceware passphrases with entropy calculations.',
    category: 'utility',
    badge: 'security',
    badgeText: 'Zero-Knowledge',
    icon: '🔐',
    tags: ['password', 'passphrase', 'security', 'generator', 'diceware', 'entropy', 'random']
  },
  {
    id: 'finance-calc',
    title: 'Financial EMI & Loan Planner',
    desc: 'Calculate monthly loan EMI, amortization schedules, and principal vs interest visual charts for home & car loans.',
    category: 'finance',
    badge: 'popular',
    badgeText: 'Finance Pro',
    icon: '🧮',
    tags: ['loan', 'emi', 'mortgage', 'finance', 'calculator', 'interest', 'amortization']
  },
  {
    id: 'text-analyzer',
    title: 'Text Inspector & Case Converter',
    desc: 'Live word and character counter, estimated reading & speaking times, Title Case, camelCase, and whitespace cleaner.',
    category: 'utility',
    badge: 'new',
    badgeText: 'Updated',
    icon: '📝',
    tags: ['text', 'words', 'characters', 'case', 'titlecase', 'slugify', 'counter', 'read time']
  },
  {
    id: 'color-studio',
    title: 'Color Studio & WCAG Contrast Checker',
    desc: 'Inspect HEX/RGB/HSL values, generate harmonious palettes, and test accessibility contrast ratios for WCAG compliance.',
    category: 'developer',
    badge: 'security',
    badgeText: 'WCAG AAA',
    icon: '🎨',
    tags: ['color', 'contrast', 'wcag', 'hex', 'rgb', 'hsl', 'palette', 'accessibility']
  },
  {
    id: 'base64-tool',
    title: 'Base64 & URL Transformer',
    desc: 'Encode and decode text or files to Base64 data URIs, and parse URL queries with structured parameter breakdown tables.',
    category: 'developer',
    badge: 'new',
    badgeText: 'Fast Utility',
    icon: '🔄',
    tags: ['base64', 'url', 'encode', 'decode', 'uri', 'params', 'query']
  },
  {
    id: 'unit-converter',
    title: 'Universal Multi-Unit Converter',
    desc: 'Instant two-way conversion for length, mass, data storage (KB/MB/GB), speed, and temperature metrics.',
    category: 'utility',
    badge: 'popular',
    badgeText: 'Daily Tool',
    icon: '📐',
    tags: ['unit', 'converter', 'length', 'weight', 'storage', 'temperature', 'speed']
  },
  {
    id: 'markdown-studio',
    title: 'Markdown Live Studio',
    desc: 'Split-view live markdown writing and documentation editor with real-time HTML preview and one-click code export.',
    category: 'developer',
    badge: 'new',
    badgeText: 'Productivity',
    icon: '✍️',
    tags: ['markdown', 'editor', 'preview', 'html', 'readme', 'docs', 'live']
  },
  {
    id: 'age-calculator',
    title: 'Precision Chronometer & Age Calculator',
    desc: 'Calculate exact years, months, days, minutes lived, countdown to your next birthday, and astrological signs.',
    category: 'utility',
    badge: 'new',
    badgeText: 'Interactive',
    icon: '⏳',
    tags: ['age', 'birthday', 'zodiac', 'time', 'chronometer', 'calculator', 'days lived']
  },
  {
    id: 'diff-checker',
    title: 'Visual Text Diff & Document Comparison',
    desc: 'Compare contracts, code snippets, and essays side-by-side with LCS line and word-level addition/deletion highlights.',
    category: 'developer',
    badge: 'new',
    badgeText: 'Smart Compare',
    icon: '🔍',
    tags: ['diff', 'compare', 'text diff', 'code diff', 'difference', 'merge', 'changes', 'revisions']
  },
  {
    id: 'exif-scrubber',
    title: 'Privacy EXIF Metadata Inspector & Cleaner',
    desc: 'Inspect hidden camera settings, device model, and GPS coordinates embedded in photos, and permanently strip them for safety.',
    category: 'media',
    badge: 'security',
    badgeText: '100% Private',
    icon: '🛡️',
    tags: ['exif', 'metadata', 'gps', 'privacy', 'cleaner', 'scrub', 'remove location', 'photo privacy', 'camera info']
  },
  {
    id: 'signature-pad',
    title: 'Digital E-Signature & Stamp Studio',
    desc: 'Draw with touch or mouse, or generate elegant calligraphy cursive signatures with instant transparent PNG export.',
    category: 'document',
    badge: 'popular',
    badgeText: 'E-Sign Pro',
    icon: '✍️',
    tags: ['signature', 'esign', 'sign pdf', 'stamp', 'transparent signature', 'sign document', 'calligraphy', 'pen']
  }
];

class XestusAppController {
  constructor() {
    window.XestusApp = this;
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.favorites = this.loadFavorites();
    this.theme = localStorage.getItem('xestus_theme') || 'dark';

    this.initSecurity();
    this.initTheme();
    this.initSoundToggle();
    this.initGlobalEvents();
    this.initRouter();
    this.initTools();
    this.renderToolsGrid();
    this.initHeroInstantDock();
    this.initCookieBanner();
    this.initBackToTop();
    this.initPWA();
    this.initFeedbackSystem();
    this.initFaqAndSharing();
  }

  // Favorites System
  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('xestus_favs')) || ['image-compressor', 'qr-generator', 'pdf-tools'];
    } catch {
      return ['image-compressor', 'qr-generator', 'pdf-tools'];
    }
  }

  saveFavorites() {
    localStorage.setItem('xestus_favs', JSON.stringify(this.favorites));
  }

  toggleFavorite(toolId, e) {
    if (e) e.stopPropagation();
    const idx = this.favorites.indexOf(toolId);
    if (idx > -1) {
      this.favorites.splice(idx, 1);
      this.showToast('Removed from favorites', 'info');
    } else {
      this.favorites.push(toolId);
      this.showToast('Added to your favorites!', 'success');
    }
    this.saveFavorites();
    this.renderToolsGrid();
  }

  // Theme Handling
  initTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
      themeBtn.addEventListener('click', () => {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('xestus_theme', this.theme);
        themeBtn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
        this.showToast(`Switched to ${this.theme} mode`, 'info');
      });
    }
  }

  // Sound Engine & Micro-interactions
  initSoundToggle() {
    const soundBtn = document.getElementById('sound-toggle');
    if (!soundBtn) return;
    const updateIcon = () => {
      soundBtn.textContent = soundFx.enabled ? '🔊' : '🔇';
      soundBtn.title = soundFx.enabled ? 'Sound Effects Active (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)';
    };
    updateIcon();
    soundBtn.addEventListener('click', () => {
      const active = soundFx.toggle();
      updateIcon();
      this.showToast(active ? 'Sound effects enabled' : 'Sound effects muted', 'info');
    });

    // Global audio feedback for buttons and interactive elements
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .quick-tool-link, .nav-link-btn, .category-tab-btn, .dock-tab-btn, .fav-btn');
      if (btn && btn.id !== 'sound-toggle') {
        soundFx.playClick();
      }
    });
  }

  // Router & View Management
  initRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  handleRoute() {
    const rawHash = window.location.hash.replace('#', '').trim();
    const homeView = document.getElementById('home-view-container');
    const toolViews = document.querySelectorAll('.tool-view-section');

    const pdfAliases = {
      'pdf-tools': 'merge',
      'merge-pdf': 'merge',
      'split-pdf': 'split',
      'jpg-to-pdf': 'img2pdf',
      'images-to-pdf': 'img2pdf',
      'pdf-to-jpg': 'pdf2img',
      'pdf-to-images': 'pdf2img',
      'rotate-pdf': 'rotate',
      'watermark-pdf': 'watermark',
      'pdf-page-numbers': 'pagenum'
    };

    const toolAliases = {
      'password-generator': 'password-gen',
      'password': 'password-gen',
      'qr-code': 'qr-generator',
      'qr-code-generator': 'qr-generator',
      'qrcode': 'qr-generator',
      'json-formatter': 'json-tools',
      'json-validator': 'json-tools',
      'json': 'json-tools',
      'image-resizer': 'image-compressor',
      'compress-image': 'image-compressor',
      'compressor': 'image-compressor',
      'emi-calculator': 'finance-calc',
      'loan-calculator': 'finance-calc',
      'emi': 'finance-calc',
      'age-calc': 'age-calculator',
      'age': 'age-calculator',
      'text-diff': 'diff-checker',
      'diff': 'diff-checker',
      'markdown': 'markdown-studio',
      'signature': 'signature-pad',
      'esign': 'signature-pad',
      'exif': 'exif-scrubber'
    };

    let hash = rawHash;
    let targetSubmode = null;
    if (pdfAliases[rawHash]) {
      hash = 'pdf-tools';
      targetSubmode = pdfAliases[rawHash];
    } else if (toolAliases[rawHash]) {
      hash = toolAliases[rawHash];
    }

    if (!hash || hash === '' || hash === 'home') {
      // Show Home
      if (homeView) homeView.style.display = 'block';
      toolViews.forEach(v => v.classList.remove('active'));
      document.title = 'Xestus OmniTools - The Everyday Web Utility Suite | Free & 100% Private';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Show Specific Tool
      const targetTool = TOOLS.find(t => t.id === hash);
      const targetSection = document.getElementById(`tool-view-${hash}`);

      if (targetTool && targetSection) {
        if (homeView) homeView.style.display = 'none';
        toolViews.forEach(v => v.classList.remove('active'));
        targetSection.classList.add('active');

        // If a specific submode was requested, trigger that tab
        if (targetSubmode) {
          const tabBtn = document.querySelector(`.pdf-mode-btn[data-mode="${targetSubmode}"]`);
          if (tabBtn) tabBtn.click();
        }

        document.title = `${targetTool.title} - Free & In-Browser | Xestus OmniTools`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback to home
        window.location.hash = '';
      }
    }
  }

  navigateToTool(toolId) {
    window.location.hash = toolId;
  }

  // Render Grid
  renderToolsGrid() {
    const gridEl = document.getElementById('tools-grid');
    const countEl = document.getElementById('tools-count');
    if (!gridEl) return;

    let filtered = TOOLS.filter(t => {
      // Category filter
      if (this.currentCategory === 'favorites') {
        if (!this.favorites.includes(t.id)) return false;
      } else if (this.currentCategory !== 'all' && t.category !== this.currentCategory) {
        return false;
      }

      // Search query filter
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesName = t.title.toLowerCase().includes(q);
        const matchesDesc = t.desc.toLowerCase().includes(q);
        const matchesTags = t.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }
      return true;
    });

    if (countEl) countEl.textContent = `${filtered.length} tools available`;

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">No tools found</h3>
          <p class="text-muted">Try adjusting your search terms or selecting another category.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(tool => {
      const isFav = this.favorites.includes(tool.id);
      return `
        <article class="tool-card" data-id="${tool.id}" onclick="window.XestusApp.navigateToTool('${tool.id}')">
          <div class="tool-card-header">
            <div class="tool-icon-box">${tool.icon}</div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="tool-badge-pill ${tool.badge}">${tool.badgeText}</span>
              <button class="fav-btn ${isFav ? 'active' : ''}" 
                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                onclick="window.XestusApp.toggleFavorite('${tool.id}', event)">
                ${isFav ? '★' : '☆'}
              </button>
            </div>
          </div>
          <div class="tool-card-body">
            <h3 class="tool-title">${tool.title}</h3>
            <p class="tool-desc">${tool.desc}</p>
          </div>
          <div class="tool-card-footer">
            <span style="text-transform: capitalize; color: var(--text-muted);">${tool.category}</span>
            <span class="cta-arrow">Launch Tool &rarr;</span>
          </div>
        </article>
      `;
    }).join('');

    // Dynamic Spotlight Cursor Tracking
    gridEl.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
      card.addEventListener('click', () => {
        soundFx.playPop();
      });
    });
  }

  // Global Events & Modals
  initGlobalEvents() {
    // Header search trigger
    const searchTrigger = document.getElementById('header-search-trigger');
    const cmdPalette = document.getElementById('command-palette-modal');
    const cmdInput = document.getElementById('cmd-search-input');
    const cmdResults = document.getElementById('cmd-results-list');
    const cmdCloseBtn = document.getElementById('cmd-close-btn');

    const openCmdPalette = () => {
      if (cmdPalette) {
        cmdPalette.classList.add('open');
        cmdInput.value = '';
        renderCmdResults('');
        setTimeout(() => cmdInput.focus(), 50);
      }
    };

    const closeCmdPalette = () => {
      if (cmdPalette) cmdPalette.classList.remove('open');
    };

    if (searchTrigger) searchTrigger.addEventListener('click', openCmdPalette);
    if (cmdCloseBtn) cmdCloseBtn.addEventListener('click', closeCmdPalette);

    if (cmdPalette) {
      cmdPalette.addEventListener('click', (e) => {
        if (e.target === cmdPalette) closeCmdPalette();
      });
    }

    // Keyboard shortcut Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCmdPalette();
      }
      if (e.key === 'Escape') {
        closeCmdPalette();
        this.closeAllModals();
      }
    });

    const renderCmdResults = (query) => {
      if (!cmdResults) return;
      const q = query.toLowerCase().trim();
      const matched = TOOLS.filter(t => 
        !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q))
      );

      if (matched.length === 0) {
        cmdResults.innerHTML = '<li style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No matching tools found.</li>';
        return;
      }

      cmdResults.innerHTML = matched.map((t, i) => `
        <li class="cmd-item ${i === 0 ? 'selected' : ''}" data-id="${t.id}">
          <span class="cmd-item-icon">${t.icon}</span>
          <span class="cmd-item-title">${t.title}</span>
          <span class="cmd-item-desc">${t.category}</span>
        </li>
      `).join('');

      cmdResults.querySelectorAll('.cmd-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          closeCmdPalette();
          this.navigateToTool(id);
        });
      });
    };

    if (cmdInput) {
      cmdInput.addEventListener('input', (e) => renderCmdResults(e.target.value));
      cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const firstItem = cmdResults ? cmdResults.querySelector('.cmd-item') : null;
          if (firstItem && firstItem.dataset.id) {
            const id = firstItem.dataset.id;
            closeCmdPalette();
            this.navigateToTool(id);
          }
        }
      });
    }

    // Main section search input
    const mainSearchInput = document.getElementById('main-search-input');
    if (mainSearchInput) {
      mainSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderToolsGrid();
      });
    }

    // Category Tabs
    const catTabs = document.querySelectorAll('.category-tab-btn');
    catTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        catTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.renderToolsGrid();
      });
    });

    // Delegated click handler for tool cards in the grid
    const gridEl = document.getElementById('tools-grid');
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.fav-btn');
        if (favBtn) return; // Fav button has its own handler
        const card = e.target.closest('.tool-card');
        if (card && card.dataset.id) {
          this.navigateToTool(card.dataset.id);
        }
      });
    }

    // Modals (About, Contact)
    this.initModalTriggers();
  }

  initModalTriggers() {
    const bindModal = (triggerId, modalId) => {
      const trigger = document.getElementById(triggerId);
      const modal = document.getElementById(modalId);
      if (!trigger || !modal) return;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('open');
      });

      const closeBtn = modal.querySelector('.modal-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    };

    bindModal('btn-open-about', 'modal-about-xestus');
    bindModal('btn-open-contact', 'modal-contact-xestus');
    bindModal('btn-open-privacy', 'modal-privacy-policy');
    bindModal('btn-open-feedback', 'modal-feedback-xestus');
    bindModal('footer-link-about', 'modal-about-xestus');
    bindModal('footer-link-contact', 'modal-contact-xestus');
    bindModal('footer-link-privacy', 'modal-privacy-policy');
    bindModal('footer-link-feedback', 'modal-feedback-xestus');

    // Contact Form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showToast('Thank you! Your message has been sent to Xestus Team.', 'success');
        contactForm.reset();
        document.getElementById('modal-contact-xestus').classList.remove('open');
      });
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  // Security & Anti-Tampering Shield
  initSecurity() {
    try {
      if (Array.isArray(TOOLS)) Object.freeze(TOOLS);
    } catch (_) {}

    // Self-XSS Anti-Tamper Console Warning
    console.log(
      '%c⚠️ XESTUS SECURITY DEFENSE SHIELD ACTIVE ⚠️',
      'color: #ef4444; font-size: 20px; font-weight: 800; background: #0f172a; padding: 6px 12px; border-radius: 6px; border: 1px solid #ef4444;'
    );
    console.log(
      '%cThis browser console is reserved for certified engineers. If someone told you to copy-paste scripts here to modify the site or bypass security, it is a Self-XSS scam. Xestus OmniTools executes 100% in-browser with zero tracking and zero server storage.',
      'color: #fca5a5; font-size: 12px; line-height: 1.5;'
    );
  }

  // Interactive 5-Star Feedback & Complaint Box (Dispatches to xestus.office@gmail.com)
  initFeedbackSystem() {
    const form = document.getElementById('feedback-form');
    const starsContainer = document.getElementById('star-rating-widget');
    const ratingInput = document.getElementById('feedback-rating-val');
    const ratingLabel = document.getElementById('star-rating-label');
    const submitBtn = document.getElementById('feedback-submit-btn');
    const btnText = document.getElementById('feedback-btn-text');
    const btnLoader = document.getElementById('feedback-btn-loader');
    const feedbackModal = document.getElementById('modal-feedback-xestus');

    if (!form || !starsContainer) return;

    const ratingDescriptions = {
      1: '★☆☆☆☆ 1.0 - Poor / Had issues',
      2: '★★☆☆☆ 2.0 - Fair / Needs improvement',
      3: '★★★☆☆ 3.0 - Good / Works fine',
      4: '★★★★☆ 4.0 - Very Good / Satisfied',
      5: '★★★★★ 5.0 - Excellent / Loved it!'
    };

    let selectedRating = 5;

    const updateStarsVisual = (rating, isHover = false) => {
      const starBtns = starsContainer.querySelectorAll('.star-btn');
      starBtns.forEach((btn, idx) => {
        const starVal = idx + 1;
        if (starVal <= rating) {
          btn.classList.add('active');
          if (isHover) btn.classList.add('hover-preview');
        } else {
          btn.classList.remove('active');
          btn.classList.remove('hover-preview');
        }
      });
      if (ratingLabel) {
        ratingLabel.textContent = ratingDescriptions[rating] || `${rating} Stars`;
      }
    };

    // Star Click & Hover events
    starsContainer.querySelectorAll('.star-btn').forEach((btn) => {
      const val = parseInt(btn.dataset.rating, 10);

      btn.addEventListener('mouseenter', () => updateStarsVisual(val, true));
      btn.addEventListener('mouseleave', () => updateStarsVisual(selectedRating, false));

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedRating = val;
        if (ratingInput) ratingInput.value = val;
        updateStarsVisual(selectedRating, false);
      });
    });

    // Handle Form Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Anti-Spam throttle (30 seconds)
      const lastSent = parseInt(localStorage.getItem('xestus_last_feedback_time') || '0', 10);
      const now = Date.now();
      if (now - lastSent < 30000) {
        const waitSec = Math.ceil((30000 - (now - lastSent)) / 1000);
        this.showToast(`Please wait ${waitSec}s before sending another message.`, 'warning');
        return;
      }

      const name = document.getElementById('feedback-name')?.value.trim();
      const email = document.getElementById('feedback-email')?.value.trim();
      const category = document.getElementById('feedback-category')?.value;
      const message = document.getElementById('feedback-message')?.value.trim();
      const rating = ratingInput ? ratingInput.value : selectedRating;

      if (!name || !email || !message) {
        this.showToast('Please fill out all required fields.', 'warning');
        return;
      }

      // UI Loading state
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline';

      try {
        const response = await fetch('https://formsubmit.co/ajax/xestus.office@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            category: category,
            rating: `${rating} / 5 Stars (${ratingDescriptions[rating] || ''})`,
            message: message,
            _subject: `[Xestus OmniTools] ${category} from ${name} (${rating}★)`,
            _replyto: email,
            _captcha: 'false',
            submitted_at: new Date().toISOString()
          })
        });

        if (response.ok) {
          localStorage.setItem('xestus_last_feedback_time', String(Date.now()));
          this.triggerConfetti();
          this.showToast('Thank you! Your feedback has been sent directly to xestus.office@gmail.com.', 'success');
          form.reset();
          selectedRating = 5;
          if (ratingInput) ratingInput.value = 5;
          updateStarsVisual(5, false);
          if (feedbackModal) feedbackModal.classList.remove('open');
        } else {
          throw new Error('Server responded with status ' + response.status);
        }
      } catch (err) {
        console.warn('[Xestus] FormSubmit AJAX notice, opening email fallback:', err);
        // Fallback to mailto so user message is never lost
        const subject = encodeURIComponent(`[Xestus OmniTools] ${category} (${rating} Stars)`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCategory: ${category}\nRating: ${rating}/5 Stars\n\nMessage:\n${message}`);
        window.location.href = `mailto:xestus.office@gmail.com?subject=${subject}&body=${body}`;

        this.showToast('Opening your email client to send to xestus.office@gmail.com...', 'info');
        if (feedbackModal) feedbackModal.classList.remove('open');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
      }
    });
  }

  // Cookie Consent (AdSense / GDPR compliance)
  initCookieBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    const acceptBtn = document.getElementById('cookie-accept-all');
    const declineBtn = document.getElementById('cookie-decline');

    if (!banner) return;

    const consent = localStorage.getItem('xestus_cookie_consent');
    if (!consent) {
      setTimeout(() => banner.classList.add('visible'), 1200);
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('xestus_cookie_consent', 'accepted');
        banner.classList.remove('visible');
        this.showToast('Privacy preferences saved.', 'info');
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('xestus_cookie_consent', 'essential_only');
        banner.classList.remove('visible');
        this.showToast('Essential cookies only enabled.', 'info');
      });
    }
  }

  // Toast System
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    if (type === 'success') {
      soundFx.playSuccess();
    } else {
      soundFx.playClick();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // Interactive Hero Instant Speed Dock
  initHeroInstantDock() {
    const dockTabs = document.querySelectorAll('.dock-tab-btn');
    const dockPanels = document.querySelectorAll('.dock-panel');
    const passInput = document.getElementById('dock-pass-input');
    const passRollBtn = document.getElementById('dock-pass-roll-btn');
    const passCopyBtn = document.getElementById('dock-pass-copy-btn');

    const qrInput = document.getElementById('dock-qr-input');
    const qrGenBtn = document.getElementById('dock-qr-gen-btn');
    const qrBox = document.getElementById('dock-qr-preview-box');

    const textInput = document.getElementById('dock-text-input');
    const wordsEl = document.getElementById('dock-text-words');
    const charsEl = document.getElementById('dock-text-chars');
    const readEl = document.getElementById('dock-text-time');

    // Tab switching
    dockTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        dockTabs.forEach(t => t.classList.remove('active'));
        dockPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.dock;
        const panel = document.getElementById(`dock-panel-${target}`);
        if (panel) panel.classList.add('active');
        soundFx.playClick();
      });
    });

    // Helper: generate quick secure password
    const rollPassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
      const array = new Uint32Array(16);
      window.crypto.getRandomValues(array);
      let pass = '';
      for (let i = 0; i < 16; i++) {
        pass += chars[array[i] % chars.length];
      }
      if (passInput) passInput.value = pass;
    };

    if (passRollBtn) {
      passRollBtn.addEventListener('click', () => {
        rollPassword();
        soundFx.playPop();
      });
    }

    if (passCopyBtn && passInput) {
      passCopyBtn.addEventListener('click', (e) => {
        if (!passInput.value) return;
        navigator.clipboard.writeText(passInput.value);
        this.showToast('Instant password copied!', 'success');
        triggerConfetti(e.clientX, e.clientY);
      });
    }

    // Initialize instant password immediately
    rollPassword();

    // Helper: quick QR
    const renderMiniQr = () => {
      if (!qrBox) return;
      const text = qrInput ? qrInput.value.trim() : 'https://xestus.in';
      if (typeof QRCode !== 'undefined') {
        qrBox.innerHTML = '';
        new QRCode(qrBox, {
          text: text || 'https://xestus.in',
          width: 40,
          height: 40,
          colorDark: '#090d16',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    };

    if (qrGenBtn) {
      qrGenBtn.addEventListener('click', (e) => {
        renderMiniQr();
        this.showToast('Quick QR Code generated!', 'success');
        triggerConfetti(e.clientX, e.clientY);
      });
    }

    if (qrInput) {
      qrInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') renderMiniQr();
      });
    }

    // Try rendering mini QR once QRCode library loads
    const checkQr = setInterval(() => {
      if (typeof QRCode !== 'undefined') {
        renderMiniQr();
        clearInterval(checkQr);
      }
    }, 300);

    // Instant Text counter
    if (textInput && wordsEl && charsEl && readEl) {
      const updateCounts = () => {
        const val = textInput.value;
        const words = val.trim() ? val.trim().split(/\s+/).length : 0;
        const chars = val.length;
        const readTime = Math.max(1, Math.ceil(words / 200));
        wordsEl.textContent = words;
        charsEl.textContent = chars;
        readEl.textContent = `${readTime}s`;
      };
      textInput.addEventListener('input', updateCounts);
      updateCounts();
    }
  }

  // Confetti Animation for user wins
  triggerConfetti(x, y) {
    triggerConfetti(x, y);
  }

  // Initialize tool sub-modules
  initTools() {
    const modules = [
      { name: 'Image Compressor', fn: initImageCompressor },
      { name: 'QR Generator', fn: initQrGenerator },
      { name: 'PDF Tools', fn: initPdfTools },
      { name: 'JSON Tools', fn: initJsonTools },
      { name: 'Password Generator', fn: initPasswordGen },
      { name: 'Finance Calculator', fn: initFinanceCalc },
      { name: 'Text Analyzer', fn: initTextAnalyzer },
      { name: 'Color Studio', fn: initColorStudio },
      { name: 'Base64 Tool', fn: initBase64Tool },
      { name: 'Unit Converter', fn: initUnitConverter },
      { name: 'Markdown Studio', fn: initMarkdownStudio },
      { name: 'Age Calculator', fn: initAgeCalculator },
      { name: 'Diff Checker', fn: initDiffChecker },
      { name: 'EXIF Scrubber', fn: initExifScrubber },
      { name: 'Signature Pad', fn: initSignaturePad }
    ];

    modules.forEach(({ name, fn }) => {
      try {
        fn();
      } catch (err) {
        console.warn(`[Xestus] Module ${name} initialization notice:`, err);
      }
    });
  }

  // Floating Back to Top Button
  initBackToTop() {
    const btn = document.getElementById('back-to-top-btn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Progressive Web App Service Worker & Install Prompt
  initPWA() {
    let deferredPrompt = null;
    const installBtn = document.getElementById('btn-pwa-install');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async (e) => {
        soundFx.playClick();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            this.showToast('Xestus OmniTools App installed successfully!', 'success');
            triggerConfetti(e.clientX, e.clientY);
          }
          deferredPrompt = null;
        } else {
          this.showToast('To install: click the Install icon in your browser URL bar or Add to Home Screen on mobile.', 'info');
        }
      });
    }

    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('[Xestus] PWA Service Worker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.warn('[Xestus] Service Worker registration info:', err);
          });
      });
    }
  }

  // FAQ Accordion & Viral Social Sharing
  initFaqAndSharing() {
    // FAQ Accordion toggling
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      if (questionBtn) {
        questionBtn.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          faqItems.forEach(i => i.classList.remove('open'));
          if (!isOpen) {
            item.classList.add('open');
          }
          soundFx.playClick();
        });
      }
    });

    // Viral Share actions
    const shareUrl = 'https://tools.xestus.in';
    const shareTitle = 'Xestus OmniTools - 100% Free, Private, In-Browser Web Utilities (No Uploads)';

    const btnWa = document.getElementById('share-btn-wa');
    const btnTw = document.getElementById('share-btn-tw');
    const btnLi = document.getElementById('share-btn-li');
    const btnCp = document.getElementById('share-btn-cp');

    if (btnWa) {
      btnWa.addEventListener('click', () => {
        const text = encodeURIComponent(`${shareTitle} - Check this out: ${shareUrl}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      });
    }

    if (btnTw) {
      btnTw.addEventListener('click', () => {
        const text = encodeURIComponent(shareTitle);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      });
    }

    if (btnLi) {
      btnLi.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      });
    }

    if (btnCp) {
      btnCp.addEventListener('click', async (e) => {
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
            this.showToast('Platform link copied to clipboard!', 'success');
            triggerConfetti(e.clientX, e.clientY);
          } else {
            prompt('Copy website link:', shareUrl);
          }
        } catch {
          prompt('Copy website link:', shareUrl);
        }
      });
    }
  }
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  window.XestusApp = new XestusAppController();
});
