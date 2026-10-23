/**
 * Xestus OmniTools - Custom QR Code Studio
 * Generates vector & high-res raster QR codes 100% offline
 */

export function initQrGenerator() {
  const typeTabs = document.querySelectorAll('.qr-type-btn');
  const qrContainer = document.getElementById('qrcode-canvas-container');
  const fgColorInput = document.getElementById('qr-fg-color');
  const bgColorInput = document.getElementById('qr-bg-color');
  const qrSizeSelect = document.getElementById('qr-size');
  const qrEccSelect = document.getElementById('qr-ecc');

  const downloadPngBtn = document.getElementById('qr-download-png');
  const downloadSvgBtn = document.getElementById('qr-download-svg');
  const copyQrBtn = document.getElementById('qr-copy-btn');

  // Input fields for different types
  const urlInput = document.getElementById('qr-input-url');
  const textInput = document.getElementById('qr-input-text');
  const wifiSsid = document.getElementById('qr-wifi-ssid');
  const wifiPass = document.getElementById('qr-wifi-pass');
  const wifiEnc = document.getElementById('qr-wifi-enc');
  
  const vcardName = document.getElementById('qr-vcard-name');
  const vcardPhone = document.getElementById('qr-vcard-phone');
  const vcardEmail = document.getElementById('qr-vcard-email');
  const vcardOrg = document.getElementById('qr-vcard-org');

  let currentType = 'url';
  let qrCodeInstance = null;

  typeTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      typeTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;

      // Show matching input group
      document.querySelectorAll('.qr-input-group').forEach(group => {
        group.style.display = group.id === `qr-group-${currentType}` ? 'block' : 'none';
      });

      renderQrCode();
    });
  });

  // Event listeners for inputs
  const allInputs = [
    urlInput, textInput, wifiSsid, wifiPass, wifiEnc,
    vcardName, vcardPhone, vcardEmail, vcardOrg,
    fgColorInput, bgColorInput, qrSizeSelect, qrEccSelect
  ];

  allInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', debounce(renderQrCode, 200));
      input.addEventListener('change', renderQrCode);
    }
  });

  function getQrPayload() {
    switch (currentType) {
      case 'url':
        return urlInput.value.trim() || 'https://xestus.in';
      case 'text':
        return textInput.value.trim() || 'Xestus OmniTools - Empowering Every Day';
      case 'wifi': {
        const ssid = wifiSsid.value.trim() || 'MyWiFi';
        const pass = wifiPass.value.trim();
        const enc = wifiEnc.value;
        return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
      }
      case 'vcard': {
        const name = vcardName.value.trim() || 'John Doe';
        const phone = vcardPhone.value.trim();
        const email = vcardEmail.value.trim();
        const org = vcardOrg.value.trim();
        return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
      }
      default:
        return 'https://xestus.in';
    }
  }

  function renderQrCode() {
    if (typeof QRCode === 'undefined') {
      qrContainer.innerHTML = '<div style="padding: 2rem; color: var(--text-muted); text-align: center;">Loading QR Engine...</div>';
      setTimeout(renderQrCode, 400);
      return;
    }

    const payload = getQrPayload();
    const size = parseInt(qrSizeSelect ? qrSizeSelect.value : 256, 10);
    const fgColor = fgColorInput ? fgColorInput.value : '#000000';
    const bgColor = bgColorInput ? bgColorInput.value : '#ffffff';
    const eccMap = {
      'L': QRCode.CorrectLevel ? QRCode.CorrectLevel.L : 1,
      'M': QRCode.CorrectLevel ? QRCode.CorrectLevel.M : 0,
      'Q': QRCode.CorrectLevel ? QRCode.CorrectLevel.Q : 3,
      'H': QRCode.CorrectLevel ? QRCode.CorrectLevel.H : 2,
    };
    const correctLevel = eccMap[qrEccSelect ? qrEccSelect.value : 'H'] || (QRCode.CorrectLevel ? QRCode.CorrectLevel.H : 2);

    try {
      qrCodeInstance = new QRCode(qrContainer, {
        text: payload,
        width: size,
        height: size,
        colorDark: fgColor,
        colorLight: bgColor,
        correctLevel: correctLevel
      });
    } catch (e) {
      console.error('QR code generation error:', e);
    }
  }

  // Download PNG
  if (downloadPngBtn) {
    downloadPngBtn.addEventListener('click', () => {
      const canvas = qrContainer.querySelector('canvas');
      const img = qrContainer.querySelector('img');
      let dataUrl = '';

      if (canvas) {
        dataUrl = canvas.toDataURL('image/png');
      } else if (img && img.src) {
        dataUrl = img.src;
      }

      if (!dataUrl) {
        window.XestusApp.showToast('No QR code generated yet.', 'warning');
        return;
      }

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `xestus-qr-${Date.now()}.png`;
      link.click();
      window.XestusApp.triggerConfetti();
      window.XestusApp.showToast('QR Code downloaded as PNG!', 'success');
    });
  }

  // Copy to clipboard
  if (copyQrBtn) {
    copyQrBtn.addEventListener('click', async () => {
      const canvas = qrContainer.querySelector('canvas');
      if (!canvas) {
        window.XestusApp.showToast('Unable to copy QR image.', 'warning');
        return;
      }

      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          window.XestusApp.showToast('QR Code copied to clipboard!', 'success');
        } catch (err) {
          window.XestusApp.showToast('Clipboard copy not supported on this browser.', 'warning');
        }
      });
    });
  }

  // Debounce helper
  function debounce(fn, ms) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Initial render
  setTimeout(renderQrCode, 100);
}
