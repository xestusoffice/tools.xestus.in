/**
 * Xestus OmniTools - Cryptographically Secure Password & Passphrase Generator
 */

export function initPasswordGen() {
  const outputInput = document.getElementById('pass-output');
  const copyBtn = document.getElementById('pass-copy-btn');
  const refreshBtn = document.getElementById('pass-refresh-btn');
  const lengthSlider = document.getElementById('pass-length');
  const lengthVal = document.getElementById('pass-length-val');

  const uppercaseCb = document.getElementById('pass-inc-upper');
  const lowercaseCb = document.getElementById('pass-inc-lower');
  const numbersCb = document.getElementById('pass-inc-numbers');
  const symbolsCb = document.getElementById('pass-inc-symbols');
  const avoidAmbiguousCb = document.getElementById('pass-avoid-ambiguous');

  const modePassphraseBtn = document.getElementById('pass-mode-passphrase');
  const modeRandomBtn = document.getElementById('pass-mode-random');
  const wordsCountGroup = document.getElementById('pass-words-count-group');
  const wordsCountSlider = document.getElementById('pass-words-count');
  const wordsCountVal = document.getElementById('pass-words-count-val');

  const strengthBar = document.getElementById('pass-strength-bar');
  const strengthText = document.getElementById('pass-strength-text');
  const entropyText = document.getElementById('pass-entropy-text');

  let mode = 'random'; // 'random' or 'passphrase'

  const wordList = [
    "amber", "anchor", "beacon", "breeze", "canvas", "castle", "cedar", "cinder",
    "clover", "cobalt", "comet", "copper", "coral", "crater", "crystal", "delta",
    "drift", "ember", "falcon", "fable", "flint", "forest", "galaxy", "glacier",
    "granite", "harbor", "haven", "helix", "horizon", "island", "jasper", "jungle",
    "lantern", "matrix", "meadow", "meteor", "nebula", "nexus", "oasis", "orbit",
    "palace", "pebble", "phoenix", "planet", "pulse", "quartz", "radar", "radiant",
    "river", "rover", "shadow", "sierra", "silver", "solar", "spark", "summit",
    "timber", "topaz", "valley", "vessel", "vortex", "voyage", "walnut", "zenith"
  ];

  if (lengthSlider) {
    lengthSlider.addEventListener('input', () => {
      lengthVal.textContent = lengthSlider.value;
      generate();
    });
  }

  if (wordsCountSlider) {
    wordsCountSlider.addEventListener('input', () => {
      wordsCountVal.textContent = wordsCountSlider.value;
      generate();
    });
  }

  [uppercaseCb, lowercaseCb, numbersCb, symbolsCb, avoidAmbiguousCb].forEach(cb => {
    if (cb) cb.addEventListener('change', generate);
  });

  if (modeRandomBtn && modePassphraseBtn) {
    modeRandomBtn.addEventListener('click', () => {
      mode = 'random';
      modeRandomBtn.classList.add('active');
      modePassphraseBtn.classList.remove('active');
      wordsCountGroup.style.display = 'none';
      lengthSlider.closest('.control-group').style.display = 'flex';
      generate();
    });

    modePassphraseBtn.addEventListener('click', () => {
      mode = 'passphrase';
      modePassphraseBtn.classList.add('active');
      modeRandomBtn.classList.remove('active');
      wordsCountGroup.style.display = 'flex';
      lengthSlider.closest('.control-group').style.display = 'none';
      generate();
    });
  }

  if (refreshBtn) refreshBtn.addEventListener('click', generate);

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!outputInput.value) return;
      navigator.clipboard.writeText(outputInput.value);
      window.XestusApp.showToast('Password copied to clipboard!', 'success');
    });
  }

  function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  function generate() {
    if (mode === 'passphrase') {
      generatePassphrase();
    } else {
      generateRandomPassword();
    }
  }

  function generatePassphrase() {
    const count = parseInt(wordsCountSlider ? wordsCountSlider.value : 4, 10);
    const words = [];
    for (let i = 0; i < count; i++) {
      const idx = getSecureRandomInt(wordList.length);
      words.push(wordList[idx]);
    }
    const passphrase = words.join('-');
    outputInput.value = passphrase;
    updateStrength(count * 12); // ~12 bits per word
  }

  function generateRandomPassword() {
    let charset = '';
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (avoidAmbiguousCb && avoidAmbiguousCb.checked) {
      upper = upper.replace(/[IO]/g, '');
      lower = lower.replace(/[lo]/g, '');
      numbers = numbers.replace(/[01]/g, '');
      symbols = symbols.replace(/[|]/g, '');
    }

    if (uppercaseCb && uppercaseCb.checked) charset += upper;
    if (lowercaseCb && lowercaseCb.checked) charset += lower;
    if (numbersCb && numbersCb.checked) charset += numbers;
    if (symbolsCb && symbolsCb.checked) charset += symbols;

    if (!charset) {
      outputInput.value = 'Select at least 1 option';
      return;
    }

    const length = parseInt(lengthSlider ? lengthSlider.value : 16, 10);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset[getSecureRandomInt(charset.length)];
    }

    outputInput.value = result;

    // Calculate Shannon entropy (H = L * log2(R))
    const entropy = Math.round(length * Math.log2(charset.length));
    updateStrength(entropy);
  }

  function updateStrength(entropy) {
    if (!strengthBar || !strengthText || !entropyText) return;

    entropyText.textContent = `${entropy} bits of entropy`;

    let pct = Math.min(100, Math.round((entropy / 100) * 100));
    strengthBar.style.width = `${pct}%`;

    if (entropy < 40) {
      strengthBar.style.backgroundColor = 'var(--danger)';
      strengthText.textContent = 'Weak (Crackable in minutes)';
      strengthText.style.color = 'var(--danger)';
    } else if (entropy < 65) {
      strengthBar.style.backgroundColor = 'var(--warning)';
      strengthText.textContent = 'Moderate (Crackable in months)';
      strengthText.style.color = 'var(--warning)';
    } else if (entropy < 85) {
      strengthBar.style.backgroundColor = 'var(--success)';
      strengthText.textContent = 'Strong (Requires centuries)';
      strengthText.style.color = 'var(--success)';
    } else {
      strengthBar.style.backgroundColor = '#38bdf8';
      strengthText.textContent = 'Very Strong (Unbreakable / Quantum-Resistant)';
      strengthText.style.color = '#38bdf8';
    }
  }

  // Initial generation
  generate();
}
