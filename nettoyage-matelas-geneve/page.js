// Nettoyage matelas — configurateur interactif + envoi de la commande
// (header/burger déjà gérés par ../script.js)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('nm-form');
  if (!form) return;

  const WEB3FORMS_ACCESS_KEY = '1033b124-f3fc-49d5-b1d1-64ad5f9e429b';

  // ----- État du configurateur -----
  const state = { m1: 0, m2: 0 };

  const stepperEls = document.querySelectorAll('[data-stepper]');
  const vapeurCheckbox = document.getElementById('nm-vapeur');
  const canapeBlock = document.getElementById('nm-canape-block');
  const canapeToggle = document.getElementById('nm-canape-toggle');
  const canapeDetails = document.getElementById('nm-canape-details');
  const canapeFormatSelect = document.getElementById('nm-canape-format');
  const canapeFauteuil = document.getElementById('nm-canape-fauteuil');
  const canapeVapeur = document.getElementById('nm-canape-vapeur');

  const totalEl = document.getElementById('nm-total');
  const savingsRow = document.getElementById('nm-savings-row');
  const savingsEl = document.getElementById('nm-savings');
  let lastDurationText = '—';

  // Date min = aujourd'hui
  const dateInput = document.getElementById('nm-date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  // ----- Steppers -----
  stepperEls.forEach((stepper) => {
    const key = stepper.dataset.stepper;
    const valueEl = stepper.querySelector('[data-value]');
    stepper.querySelectorAll('.nm-stepper-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'inc') {
          state[key]++;
        } else if (state[key] > 0) {
          state[key]--;
        }
        valueEl.textContent = state[key];
        onChange();
      });
    });
  });

  // ----- Toggles -----
  [vapeurCheckbox, canapeToggle, canapeFauteuil, canapeVapeur].forEach((el) => {
    el.addEventListener('change', onChange);
  });
  canapeFormatSelect.addEventListener('change', onChange);

  canapeToggle.addEventListener('change', () => {
    canapeDetails.hidden = !canapeToggle.checked;
  });

  function onChange() {
    const totalMatelas = state.m1 + state.m2;
    canapeBlock.hidden = totalMatelas === 0;
    if (totalMatelas === 0) {
      canapeToggle.checked = false;
      canapeDetails.hidden = true;
    }
    recalculate();
  }

  // ----- Calcul -----
  function recalculate() {
    const { m1, m2 } = state;
    const totalMatelas = m1 + m2;

    let matelasTotal = 0;
    let matelasFullEquivalent = 0;

    if (totalMatelas > 0) {
      if (m2 > 0) {
        // Le 2 places absorbe le tarif "1er"
        matelasTotal = 119 + (m2 - 1) * 90 + m1 * 70;
        matelasFullEquivalent = 119 + (m2 - 1) * 119 + m1 * 89;
      } else {
        matelasTotal = 89 + (m1 - 1) * 70;
        matelasFullEquivalent = m1 * 89;
      }
    }
    const matelasSavings = matelasFullEquivalent - matelasTotal;

    const vapeurTotal = vapeurCheckbox.checked ? totalMatelas * 25 : 0;

    let canapeTotal = 0;
    let canapeSavings = 0;
    const canapeOption = canapeFormatSelect.selectedOptions[0];
    const canapePrice = Number(canapeFormatSelect.value) || 0;

    if (canapeToggle.checked && canapePrice > 0) {
      canapeTotal = canapePrice;
      const normal = Number(canapeOption.dataset.normal) || 0;
      canapeSavings = normal - canapePrice;
      if (canapeFauteuil.checked) canapeTotal += 30;
      if (canapeVapeur.checked) canapeTotal += 30;
    }

    const total = matelasTotal + vapeurTotal + canapeTotal;
    const savings = matelasSavings + canapeSavings;

    totalEl.textContent = `${total} CHF`;
    if (savings > 0) {
      savingsRow.hidden = false;
      savingsEl.textContent = `${savings} CHF`;
    } else {
      savingsRow.hidden = true;
    }

    // Durée estimée
    let minutes = m1 * 45 + m2 * 75;
    if (vapeurCheckbox.checked) minutes += totalMatelas * 12;
    if (canapeToggle.checked && canapePrice > 0) {
      if (canapePrice === 125) minutes += 75;
      else if (canapePrice === 143) minutes += 98;
      else if (canapePrice === 179) minutes += 135;
      if (canapeFauteuil.checked) minutes += 20;
    }
    if (minutes === 0) {
      lastDurationText = '—';
    } else {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      lastDurationText = h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m}min`;
    }
  }

  recalculate();

  // ----- Soumission -----
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const totalMatelas = state.m1 + state.m2;
    let valid = totalMatelas > 0;

    this.querySelectorAll('[required]').forEach((f) => {
      if (!f.value.trim()) {
        f.style.borderColor = '#e05252';
        valid = false;
      } else {
        f.style.borderColor = '#e2e2e2';
      }
    });

    if (!valid) {
      if (totalMatelas === 0) {
        alert('Ajoutez au moins un matelas avant de réserver.');
      }
      return;
    }

    const prenom = document.getElementById('nm-prenom').value;
    const nom = document.getElementById('nm-nom').value;
    const tel = document.getElementById('nm-tel').value;
    const adresse = document.getElementById('nm-adresse').value;
    const npa = document.getElementById('nm-npa').value;
    const ville = document.getElementById('nm-ville').value;
    const commentaire = document.getElementById('nm-commentaire').value;
    const date = document.getElementById('nm-date').value;
    const creneau = document.getElementById('nm-creneau').value;

    const canapeOption = canapeFormatSelect.selectedOptions[0];
    const canapePrice = Number(canapeFormatSelect.value) || 0;

    let cartDetail = `Matelas 1 place : ${state.m1}\nMatelas 2 places : ${state.m2}\n`;
    cartDetail += `Désinfection vapeur matelas : ${vapeurCheckbox.checked ? 'Oui' : 'Non'}\n`;
    if (canapeToggle.checked && canapePrice > 0) {
      cartDetail += `Canapé (option -10%) : ${canapeOption.textContent.replace(/\s+/g, ' ').trim()}\n`;
      cartDetail += `+ Fauteuil assorti : ${canapeFauteuil.checked ? 'Oui' : 'Non'}\n`;
      cartDetail += `+ Vapeur canapé : ${canapeVapeur.checked ? 'Oui' : 'Non'}\n`;
    } else {
      cartDetail += `Canapé : Non\n`;
    }
    cartDetail += `Total : ${totalEl.textContent}\nDurée estimée : ${lastDurationText}`;

    const body = `NOUVELLE DEMANDE — NETTOYAGE MATELAS\n`
      + `=================================\n\n`
      + `Nom : ${prenom} ${nom}\n`
      + `Téléphone : ${tel}\n`
      + `Adresse : ${adresse}\n`
      + `NPA / Ville : ${npa} ${ville}\n`
      + `Date souhaitée : ${date || 'non précisée'}\n`
      + `Créneau : ${creneau}\n`
      + `Commentaire : ${commentaire || '—'}\n\n`
      + `PANIER :\n${cartDetail}\n\n`
      + `---\nEnvoyé depuis happymove-ge.ch/nettoyage-matelas-geneve/`;

    const submitButton = document.getElementById('nm-submit');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours...';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Nouvelle demande — Nettoyage matelas — depuis le site web',
          from_name: `${prenom} ${nom}`,
          telephone: tel,
          message: body,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Echec envoi formulaire');
      }

      if (typeof gtag === 'function') {
        gtag('event', 'conversion', { send_to: 'AW-10792863914/DoGjCODZhtYcEKqRuJoo' });
      }

      form.innerHTML = `
      <div style="text-align:center;padding:32px 0;">
        <div style="font-size:40px;margin-bottom:16px;">✓</div>
        <p style="color:#5F5E5A;font-weight:700;font-size:18px;margin-bottom:8px;">Merci !</p>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          Nous vous contactons par téléphone<br>pour confirmer votre créneau.
        </p>
      </div>`;
    } catch (error) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      alert('Une erreur est survenue pendant l\'envoi. Merci de réessayer ou de nous contacter au 078 212 82 52.');
    }
  });

  // ----- FAQ accordéon -----
  document.querySelectorAll('.nm-acc-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const content = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      content.hidden = expanded;
    });
  });

  // ----- Bandeau sticky mobile (visible après le hero) -----
  const stickyBar = document.getElementById('nmStickyBar');
  const hero = document.getElementById('hero');
  if (stickyBar && hero) {
    const updateStickyBar = () => {
      const pastHero = window.scrollY > hero.offsetTop + hero.offsetHeight;
      stickyBar.hidden = !pastHero;
    };
    window.addEventListener('scroll', updateStickyBar, { passive: true });
    updateStickyBar();
  }
});
