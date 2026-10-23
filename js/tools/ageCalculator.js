/**
 * Xestus OmniTools - Precision Age & Milestone Chronometer
 */

export function initAgeCalculator() {
  const dobInput = document.getElementById('age-dob-input');
  const calculateBtn = document.getElementById('age-calc-btn');
  const resultsCard = document.getElementById('age-results-container');

  const mainAgeYears = document.getElementById('age-years-val');
  const mainAgeMonths = document.getElementById('age-months-val');
  const mainAgeDays = document.getElementById('age-days-val');

  const nextBdayDays = document.getElementById('age-next-bday-days');
  const totalDaysEl = document.getElementById('age-total-days');
  const totalHoursEl = document.getElementById('age-total-hours');
  const totalHeartbeatsEl = document.getElementById('age-heartbeats');
  const zodiacSignEl = document.getElementById('age-zodiac-sign');
  const chineseZodiacEl = document.getElementById('age-chinese-zodiac');

  let tickInterval = null;

  // Set default to 2000-01-01
  if (dobInput && !dobInput.value) {
    dobInput.value = '2000-01-01';
  }

  if (calculateBtn) {
    calculateBtn.addEventListener('click', () => runCalculation(true));
  }

  if (dobInput) {
    dobInput.addEventListener('change', () => runCalculation(true));
  }

  function runCalculation(showNotification = true) {
    if (!dobInput.value) {
      if (showNotification && window.XestusApp?.showToast) {
        window.XestusApp.showToast('Please pick your date of birth.', 'warning');
      }
      return;
    }

    const birthDate = new Date(dobInput.value);
    const now = new Date();

    if (birthDate > now) {
      if (showNotification && window.XestusApp?.showToast) {
        window.XestusApp.showToast('Date of birth cannot be in the future!', 'danger');
      }
      return;
    }

    if (resultsCard) resultsCard.style.display = 'block';

    if (tickInterval) clearInterval(tickInterval);
    updateCalculations(birthDate);
    tickInterval = setInterval(() => updateCalculations(birthDate), 1000);

    if (showNotification && window.XestusApp?.showToast) {
      window.XestusApp.showToast('Chronological timeline computed!', 'success');
    }
  }

  function updateCalculations(birthDate) {
    const now = new Date();
    
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (mainAgeYears) mainAgeYears.textContent = years;
    if (mainAgeMonths) mainAgeMonths.textContent = months;
    if (mainAgeDays) mainAgeDays.textContent = days;

    // Next Birthday calculation
    const currentYear = now.getFullYear();
    let nextBday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    if (nextBday < now) {
      nextBday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    const diffTime = nextBday - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (nextBdayDays) nextBdayDays.textContent = `${diffDays} days`;

    // Milestones
    const totalDiffMs = now - birthDate;
    const totalDays = Math.floor(totalDiffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(totalDiffMs / (1000 * 60 * 60));
    const estimatedHeartbeats = Math.floor(totalDays * 24 * 60 * 75); // ~75 bpm average

    if (totalDaysEl) totalDaysEl.textContent = totalDays.toLocaleString();
    if (totalHoursEl) totalHoursEl.textContent = totalHours.toLocaleString();
    if (totalHeartbeatsEl) totalHeartbeatsEl.textContent = `~${(estimatedHeartbeats / 1000000).toFixed(1)} Million`;

    // Zodiac
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    if (zodiacSignEl) zodiacSignEl.textContent = getWesternZodiac(day, month);
    if (chineseZodiacEl) chineseZodiacEl.textContent = getChineseZodiac(birthDate.getFullYear());
  }

  function getWesternZodiac(day, month) {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '♈ Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '♉ Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '♊ Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '♋ Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '♌ Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '♍ Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '♎ Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏ Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐ Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '♑ Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '♒ Aquarius';
    return '♓ Pisces';
  }

  function getChineseZodiac(year) {
    const animals = ['🐀 Rat', '🐂 Ox', '🐅 Tiger', '🐇 Rabbit', '🐉 Dragon', '🐍 Snake', '🐎 Horse', '🐐 Goat', '🐒 Monkey', '🐓 Rooster', '🐕 Dog', '🐖 Pig'];
    return animals[(year - 4) % 12];
  }

  // Initial run without popup toast
  runCalculation(false);
}
