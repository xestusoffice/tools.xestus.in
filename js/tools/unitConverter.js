/**
 * Xestus OmniTools - Universal Multi-Unit Converter
 */

export function initUnitConverter() {
  const categorySelect = document.getElementById('unit-category');
  const fromSelect = document.getElementById('unit-from-unit');
  const toSelect = document.getElementById('unit-to-unit');
  const fromInput = document.getElementById('unit-from-val');
  const toInput = document.getElementById('unit-to-val');
  const swapBtn = document.getElementById('unit-swap-btn');
  const formulaEl = document.getElementById('unit-formula-text');

  const unitData = {
    length: {
      units: ['Meters (m)', 'Kilometers (km)', 'Centimeters (cm)', 'Millimeters (mm)', 'Miles (mi)', 'Yards (yd)', 'Feet (ft)', 'Inches (in)'],
      rates: {
        'Meters (m)': 1,
        'Kilometers (km)': 1000,
        'Centimeters (cm)': 0.01,
        'Millimeters (mm)': 0.001,
        'Miles (mi)': 1609.344,
        'Yards (yd)': 0.9144,
        'Feet (ft)': 0.3048,
        'Inches (in)': 0.0254
      }
    },
    weight: {
      units: ['Kilograms (kg)', 'Grams (g)', 'Milligrams (mg)', 'Pounds (lb)', 'Ounces (oz)', 'Metric Tons (t)'],
      rates: {
        'Kilograms (kg)': 1,
        'Grams (g)': 0.001,
        'Milligrams (mg)': 0.000001,
        'Pounds (lb)': 0.45359237,
        'Ounces (oz)': 0.0283495,
        'Metric Tons (t)': 1000
      }
    },
    data: {
      units: ['Bytes (B)', 'Kilobytes (KB)', 'Megabytes (MB)', 'Gigabytes (GB)', 'Terabytes (TB)', 'Petabytes (PB)'],
      rates: {
        'Bytes (B)': 1,
        'Kilobytes (KB)': 1024,
        'Megabytes (MB)': 1024 * 1024,
        'Gigabytes (GB)': 1024 * 1024 * 1024,
        'Terabytes (TB)': Math.pow(1024, 4),
        'Petabytes (PB)': Math.pow(1024, 5)
      }
    },
    speed: {
      units: ['Kilometers/hour (km/h)', 'Miles/hour (mph)', 'Meters/second (m/s)', 'Knots (kn)'],
      rates: {
        'Meters/second (m/s)': 1,
        'Kilometers/hour (km/h)': 0.277778,
        'Miles/hour (mph)': 0.44704,
        'Knots (kn)': 0.514444
      }
    },
    temp: {
      units: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)']
    }
  };

  function populateUnits() {
    const cat = categorySelect ? categorySelect.value : 'length';
    const info = unitData[cat];
    if (!info) return;

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    info.units.forEach((u, idx) => {
      const opt1 = document.createElement('option');
      opt1.value = u;
      opt1.textContent = u;
      fromSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = u;
      opt2.textContent = u;
      toSelect.appendChild(opt2);
    });

    if (info.units.length > 1) {
      toSelect.selectedIndex = 1;
    }

    calculateForward();
  }

  function calculateForward() {
    const cat = categorySelect ? categorySelect.value : 'length';
    const fromUnit = fromSelect.value;
    const toUnit = toSelect.value;
    const val = parseFloat(fromInput.value);

    if (isNaN(val)) {
      toInput.value = '';
      return;
    }

    if (cat === 'temp') {
      let result = 0;
      // Convert from source to Celsius
      let celsius = val;
      if (fromUnit.includes('Fahrenheit')) celsius = (val - 32) * (5 / 9);
      if (fromUnit.includes('Kelvin')) celsius = val - 273.15;

      // Convert Celsius to destination
      if (toUnit.includes('Celsius')) result = celsius;
      if (toUnit.includes('Fahrenheit')) result = (celsius * 9 / 5) + 32;
      if (toUnit.includes('Kelvin')) result = celsius + 273.15;

      toInput.value = parseFloat(result.toFixed(4));
    } else {
      const rates = unitData[cat].rates;
      const baseVal = val * rates[fromUnit];
      const result = baseVal / rates[toUnit];
      toInput.value = parseFloat(result.toPrecision(7));
    }

    if (formulaEl) {
      formulaEl.textContent = `1 ${fromUnit} ≈ ${(convertVal(1, fromUnit, toUnit, cat)).toPrecision(5)} ${toUnit}`;
    }
  }

  function convertVal(v, from, to, cat) {
    if (cat === 'temp') return v;
    const rates = unitData[cat].rates;
    return (v * rates[from]) / rates[to];
  }

  if (categorySelect) categorySelect.addEventListener('change', populateUnits);
  if (fromSelect) fromSelect.addEventListener('change', calculateForward);
  if (toSelect) toSelect.addEventListener('change', calculateForward);
  if (fromInput) fromInput.addEventListener('input', calculateForward);

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const tempIdx = fromSelect.selectedIndex;
      fromSelect.selectedIndex = toSelect.selectedIndex;
      toSelect.selectedIndex = tempIdx;
      calculateForward();
    });
  }

  populateUnits();
}
