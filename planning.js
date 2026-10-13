// Règle de planning + calendrier coloré (vert = disponible, rouge = indisponible)
// Partagé par les pages nettoyage canapé et nettoyage matelas.
// Règle : on se considère booké les 2 jours qui suivent la date du jour (1er créneau : J+3),
// interventions uniquement mardi, mercredi, jeudi et samedi, et pas les 13-15 / 29-31 de chaque mois.

(function () {
  const RULES = {
    minLeadDays: 3,
    openWeekdays: [2, 3, 4, 6], // 0 = dimanche … 6 = samedi
    blockedDaysOfMonth: [13, 14, 15, 29, 30, 31],
  };

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const toISO = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const fromISO = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const formatDay = (d) =>
    d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });

  const earliest = (now) => addDays(startOfDay(now || new Date()), RULES.minLeadDays);
  const isOpenDay = (d) =>
    RULES.openWeekdays.includes(d.getDay()) && !RULES.blockedDaysOfMonth.includes(d.getDate());
  const isAvailable = (d, now) => d >= earliest(now) && isOpenDay(d);

  function nextAvailable(now) {
    let d = earliest(now);
    while (!isOpenDay(d)) d = addDays(d, 1);
    return d;
  }

  // Texte du refus ('' si la date est acceptée)
  function reason(d, now) {
    if (d < earliest(now)) return `Nous planifions avec ${RULES.minLeadDays} jours d'avance minimum.`;
    if (!RULES.openWeekdays.includes(d.getDay())) {
      return 'Nous intervenons uniquement les mardi, mercredi, jeudi et samedi.';
    }
    if (RULES.blockedDaysOfMonth.includes(d.getDate())) return 'Nous sommes complets à cette date.';
    return '';
  }

  // ----- Calendrier -----
  const MAX_MONTHS_AHEAD = 6;
  const WEEKDAY_LABELS = ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'];

  function mountCalendar(input, container) {
    if (!input || !container) return;

    const today = startOfDay(new Date());
    const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() + MAX_MONTHS_AHEAD, 1);
    let viewMonth = new Date(nextAvailable().getFullYear(), nextAvailable().getMonth(), 1);

    container.classList.add('hm-cal');
    container.innerHTML = `
      <div class="hm-cal-head">
        <button type="button" class="hm-cal-nav" data-dir="-1" aria-label="Mois précédent">‹</button>
        <span class="hm-cal-title" aria-live="polite"></span>
        <button type="button" class="hm-cal-nav" data-dir="1" aria-label="Mois suivant">›</button>
      </div>
      <div class="hm-cal-weekdays">${WEEKDAY_LABELS.map((w) => `<span>${w}</span>`).join('')}</div>
      <div class="hm-cal-grid"></div>
      <div class="hm-cal-legend">
        <span><i class="hm-cal-dot hm-cal-dot--free"></i>Disponible</span>
        <span><i class="hm-cal-dot hm-cal-dot--busy"></i>Indisponible</span>
      </div>`;

    const titleEl = container.querySelector('.hm-cal-title');
    const gridEl = container.querySelector('.hm-cal-grid');
    const prevBtn = container.querySelector('[data-dir="-1"]');
    const nextBtn = container.querySelector('[data-dir="1"]');

    function render() {
      const year = viewMonth.getFullYear();
      const month = viewMonth.getMonth();
      titleEl.textContent = viewMonth.toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });
      prevBtn.disabled = viewMonth <= firstMonth;
      nextBtn.disabled = viewMonth >= lastMonth;

      const selected = input.value;
      const offset = (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let html = '';
      for (let i = 0; i < offset; i++) html += '<span class="hm-cal-empty"></span>';

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const iso = toISO(date);
        let cls = 'hm-cal-day';
        let attrs = '';
        if (date < today) {
          cls += ' hm-cal-day--past';
          attrs = ' disabled aria-disabled="true"';
        } else if (isAvailable(date)) {
          cls += ' hm-cal-day--free';
          if (iso === selected) cls += ' hm-cal-day--selected';
          attrs = ` data-date="${iso}" aria-pressed="${iso === selected}"`;
        } else {
          cls += ' hm-cal-day--busy';
          attrs = ' disabled aria-disabled="true" title="Indisponible"';
        }
        if (date.getTime() === today.getTime()) cls += ' hm-cal-day--today';
        html += `<button type="button" class="${cls}"${attrs} aria-label="${formatDay(date)}">${day}</button>`;
      }
      gridEl.innerHTML = html;
    }

    container.addEventListener('click', (e) => {
      const nav = e.target.closest('.hm-cal-nav');
      if (nav) {
        viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + Number(nav.dataset.dir), 1);
        render();
        return;
      }
      const dayBtn = e.target.closest('.hm-cal-day--free');
      if (!dayBtn) return;
      // Re-cliquer sur le jour choisi le désélectionne (la date reste optionnelle)
      input.value = input.value === dayBtn.dataset.date ? '' : dayBtn.dataset.date;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      render();
    });

    input.addEventListener('change', render);
    input.addEventListener('hm-sync', render);

    // Le calendrier remplace le sélecteur natif (qui reste la source de la valeur)
    input.hidden = true;
    render();
  }

  window.HMPlanning = {
    RULES,
    toISO,
    fromISO,
    earliest,
    isAvailable,
    nextAvailable,
    reason,
    formatDay,
    mountCalendar,
  };
})();
