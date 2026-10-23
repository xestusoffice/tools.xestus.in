/**
 * Xestus OmniTools - Color Studio & WCAG Contrast Checker
 */

export function initColorStudio() {
  const hexInput = document.getElementById('color-hex-input');
  const colorPicker = document.getElementById('color-picker-input');
  const rgbDisplay = document.getElementById('color-rgb-val');
  const hslDisplay = document.getElementById('color-hsl-val');
  
  const paletteContainer = document.getElementById('color-palette-boxes');
  const randomPaletteBtn = document.getElementById('color-random-palette-btn');

  // Contrast checker elements
  const textColorInput = document.getElementById('contrast-text-color');
  const bgColorInput = document.getElementById('contrast-bg-color');
  const contrastPreview = document.getElementById('contrast-preview-box');
  const contrastRatioEl = document.getElementById('contrast-ratio-val');
  
  const aaNormalBadge = document.getElementById('contrast-aa-normal');
  const aaaNormalBadge = document.getElementById('contrast-aaa-normal');
  const aaLargeBadge = document.getElementById('contrast-aa-large');
  const aaaLargeBadge = document.getElementById('contrast-aaa-large');

  // Sync color inputs
  if (colorPicker && hexInput) {
    colorPicker.addEventListener('input', () => {
      hexInput.value = colorPicker.value.toUpperCase();
      updateColorOutputs(colorPicker.value);
    });

    hexInput.addEventListener('input', () => {
      let val = hexInput.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        colorPicker.value = val;
        updateColorOutputs(val);
      }
    });
  }

  function updateColorOutputs(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (rgbDisplay) rgbDisplay.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    if (hslDisplay) hslDisplay.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    renderHarmonies(hsl);
  }

  function renderHarmonies(hsl) {
    if (!paletteContainer) return;
    paletteContainer.innerHTML = '';

    // Complementary (+180), Analogous (+30, -30), Triadic (+120, +240)
    const angles = [0, 30, 60, 120, 180, 240];
    angles.forEach(deg => {
      const newH = (hsl.h + deg) % 360;
      const rgb = hslToRgb(newH, hsl.s, hsl.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

      const box = document.createElement('div');
      box.style.background = hex;
      box.style.height = '64px';
      box.style.borderRadius = 'var(--radius-md)';
      box.style.display = 'flex';
      box.style.flexDirection = 'column';
      box.style.alignItems = 'center';
      box.style.justifyContent = 'center';
      box.style.cursor = 'pointer';
      box.style.boxShadow = 'var(--shadow-sm)';
      box.title = `Click to copy ${hex}`;

      // choose label color for contrast
      const lum = getLuminance(rgb.r, rgb.g, rgb.b);
      const txtColor = lum > 0.5 ? '#000000' : '#ffffff';

      box.innerHTML = `<span style="color: ${txtColor}; font-weight: 700; font-size: 0.82rem; font-family: monospace;">${hex}</span>`;
      box.addEventListener('click', () => {
        navigator.clipboard.writeText(hex);
        window.XestusApp.showToast(`Copied ${hex} to clipboard!`, 'success');
      });
      paletteContainer.appendChild(box);
    });
  }

  if (randomPaletteBtn) {
    randomPaletteBtn.addEventListener('click', () => {
      const randHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
      hexInput.value = randHex;
      colorPicker.value = randHex;
      updateColorOutputs(randHex);
    });
  }

  // Contrast Checker
  if (textColorInput && bgColorInput) {
    textColorInput.addEventListener('input', updateContrast);
    bgColorInput.addEventListener('input', updateContrast);
  }

  function updateContrast() {
    const textHex = textColorInput.value;
    const bgHex = bgColorInput.value;

    if (contrastPreview) {
      contrastPreview.style.color = textHex;
      contrastPreview.style.backgroundColor = bgHex;
    }

    const rgbText = hexToRgb(textHex);
    const rgbBg = hexToRgb(bgHex);
    if (!rgbText || !rgbBg) return;

    const lumText = getLuminance(rgbText.r, rgbText.g, rgbText.b);
    const lumBg = getLuminance(rgbBg.r, rgbBg.g, rgbBg.b);

    const ratio = (Math.max(lumText, lumBg) + 0.05) / (Math.min(lumText, lumBg) + 0.05);
    const formattedRatio = ratio.toFixed(2) + ':1';

    if (contrastRatioEl) contrastRatioEl.textContent = formattedRatio;

    // WCAG standards
    // AA Normal: >= 4.5
    // AAA Normal: >= 7.0
    // AA Large: >= 3.0
    // AAA Large: >= 4.5
    setBadge(aaNormalBadge, ratio >= 4.5);
    setBadge(aaaNormalBadge, ratio >= 7.0);
    setBadge(aaLargeBadge, ratio >= 3.0);
    setBadge(aaaLargeBadge, ratio >= 4.5);
  }

  function setBadge(el, passes) {
    if (!el) return;
    if (passes) {
      el.className = 'wcag-badge pass';
      el.textContent = 'PASS';
    } else {
      el.className = 'wcag-badge fail';
      el.textContent = 'FAIL';
    }
  }

  // Math Helpers
  function hexToRgb(hex) {
    const m = hex.replace('#', '').match(/.{1,2}/g);
    if (!m || m.length < 3) return null;
    return {
      r: parseInt(m[0], 16),
      g: parseInt(m[1], 16),
      b: parseInt(m[2], 16)
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
  }

  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  // Init
  updateColorOutputs('#6366F1');
  updateContrast();
}
