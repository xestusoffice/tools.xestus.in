/**
 * Xestus OmniTools - Financial EMI & Loan Planner
 */

export function initFinanceCalc() {
  const amountInput = document.getElementById('calc-amount');
  const amountSlider = document.getElementById('calc-amount-slider');
  
  const rateInput = document.getElementById('calc-rate');
  const rateSlider = document.getElementById('calc-rate-slider');
  
  const tenureInput = document.getElementById('calc-tenure');
  const tenureSlider = document.getElementById('calc-tenure-slider');
  const tenureUnitSelect = document.getElementById('calc-tenure-unit');

  const emiValEl = document.getElementById('calc-emi-val');
  const totalInterestEl = document.getElementById('calc-total-interest');
  const totalAmountEl = document.getElementById('calc-total-amount');
  const donutSvg = document.getElementById('calc-donut-svg');
  const tableBody = document.getElementById('calc-amort-tbody');

  // Sync inputs with range sliders
  function syncInputSlider(input, slider, isFloat = false) {
    if (!input || !slider) return;
    slider.addEventListener('input', () => {
      input.value = slider.value;
      calculate();
    });
    input.addEventListener('input', () => {
      slider.value = input.value;
      calculate();
    });
  }

  syncInputSlider(amountInput, amountSlider);
  syncInputSlider(rateInput, rateSlider, true);
  syncInputSlider(tenureInput, tenureSlider);

  if (tenureUnitSelect) tenureUnitSelect.addEventListener('change', calculate);

  function calculate() {
    const P = parseFloat(amountInput.value) || 0;
    const annualRate = parseFloat(rateInput.value) || 0;
    let tenure = parseFloat(tenureInput.value) || 0;

    if (tenureUnitSelect && tenureUnitSelect.value === 'years') {
      tenure = tenure * 12; // convert to months
    }

    if (P <= 0 || annualRate <= 0 || tenure <= 0) {
      if (emiValEl) emiValEl.textContent = '$0';
      if (totalInterestEl) totalInterestEl.textContent = '$0';
      if (totalAmountEl) totalAmountEl.textContent = '$0';
      return;
    }

    const r = (annualRate / 12) / 100;
    const emi = (P * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - P;

    if (emiValEl) emiValEl.textContent = formatCurrency(emi);
    if (totalInterestEl) totalInterestEl.textContent = formatCurrency(totalInterest);
    if (totalAmountEl) totalAmountEl.textContent = formatCurrency(totalPayment);

    renderDonutChart(P, totalInterest);
    renderAmortization(P, r, tenure, emi);
  }

  function renderDonutChart(principal, interest) {
    if (!donutSvg) return;
    const total = principal + interest;
    const pPct = total > 0 ? (principal / total) * 100 : 50;
    const iPct = 100 - pPct;

    // Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.3
    const circumference = 251.3;
    const pDash = (pPct / 100) * circumference;
    const iDash = (iPct / 100) * circumference;

    donutSvg.innerHTML = `
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--bg-surface-elevated)" stroke-width="14" />
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" stroke-width="14"
        stroke-dasharray="${pDash} ${circumference}"
        stroke-dashoffset="0"
        transform="rotate(-90 50 50)" style="transition: stroke-dasharray 0.5s ease;" />
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#06b6d4" stroke-width="14"
        stroke-dasharray="${iDash} ${circumference}"
        stroke-dashoffset="-${pDash}"
        transform="rotate(-90 50 50)" style="transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;" />
    `;
  }

  function renderAmortization(P, r, n, emi) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    let balance = P;
    const totalYears = Math.ceil(n / 12);
    let yearlyRows = [];

    for (let year = 1; year <= totalYears; year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestM = balance * r;
        const principalM = emi - interestM;
        yearlyInterest += interestM;
        yearlyPrincipal += principalM;
        balance -= principalM;
      }

      yearlyRows.push({
        year,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: Math.max(0, balance)
      });
    }

    // Render first 10 years or all
    yearlyRows.slice(0, 15).forEach(row => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 0.65rem 0.5rem; font-weight: 600;">Year ${row.year}</td>
        <td style="padding: 0.65rem 0.5rem; font-family: monospace;">${formatCurrency(row.principal)}</td>
        <td style="padding: 0.65rem 0.5rem; font-family: monospace;">${formatCurrency(row.interest)}</td>
        <td style="padding: 0.65rem 0.5rem; font-family: monospace;">${formatCurrency(row.balance)}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function formatCurrency(val) {
    return '$' + Math.round(val).toLocaleString();
  }

  // Run calculation initially
  calculate();
}
