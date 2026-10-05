// Nettoyage canapé — configurateur interactif + envoi de la commande
// (header/burger déjà gérés par ../script.js)
// Envoi du formulaire via Web3Forms (même service que contact.html).

document.addEventListener('DOMContentLoaded', () => {
  // ----- FAQ accordéon -----
  document.querySelectorAll('.nc-acc-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const content = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      content.hidden = expanded;
    });
  });

  // ----- Carrousel tarifs (mobile/tablette) -----
  const pricingGrid = document.getElementById('nc-pricing-grid');
  const pricingPrev = document.getElementById('nc-pricing-prev');
  const pricingNext = document.getElementById('nc-pricing-next');
  const featuredCard = document.querySelector('.nc-price-card--featured');

  if (pricingGrid && pricingPrev && pricingNext) {
    const isCarouselMode = () => window.matchMedia('(max-width: 1024px)').matches;

    const scrollByCard = (direction) => {
      const card = pricingGrid.querySelector('.nc-price-card');
      const gap = parseFloat(getComputedStyle(pricingGrid).gap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      pricingGrid.scrollBy({ left: direction * step, behavior: 'smooth' });
    };

    pricingPrev.addEventListener('click', () => scrollByCard(-1));
    pricingNext.addEventListener('click', () => scrollByCard(1));

    if (isCarouselMode() && featuredCard) {
      featuredCard.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  // ----- Bannière offre de bienvenue (annonce, code à saisir dans le formulaire) -----
  const promoBar = document.getElementById('ncPromoBar');
  if (promoBar) promoBar.hidden = false;

  const promoNote = document.getElementById('ncPromoNote');
  if (promoNote) promoNote.hidden = false;

  const form = document.getElementById('nc-form');
  if (!form) return;

  const WEB3FORMS_ACCESS_KEY = '1033b124-f3fc-49d5-b1d1-64ad5f9e429b';

  // Codes promo valides pour cette page
  const PROMO_CODES = {
    BIENVENUE10: { discount: 0.10, label: 'BIENVENUE10' },
  };

  // ----- Configurateur -----
  const formatInputs = document.querySelectorAll('input[name="format"]');
  const vapeurCheckbox = document.getElementById('nc-vapeur');
  const totalEl = document.getElementById('nc-total');
  const normalTotalEl = document.getElementById('nc-normal-total');
  const savingsRow = document.getElementById('nc-savings-row');
  const promoBadge = document.getElementById('nc-promo-badge');
  const promoInput = document.getElementById('nc-promo-input');
  const promoApplyBtn = document.getElementById('nc-promo-apply');
  const promoFeedback = document.getElementById('nc-promo-feedback');

  let appliedPromo = null;

  function recalculate() {
    const selected = document.querySelector('input[name="format"]:checked');
    if (!selected) return;

    let normalTotal = Number(selected.value);
    if (vapeurCheckbox.checked) normalTotal += 30;

    if (appliedPromo) {
      const discountedTotal = Math.round(normalTotal * (1 - appliedPromo.discount));
      normalTotalEl.textContent = `${normalTotal} CHF`;
      totalEl.textContent = `${discountedTotal} CHF`;
      savingsRow.hidden = false;
      promoBadge.textContent = `-${Math.round(appliedPromo.discount * 100)}% ${appliedPromo.label}`;
      promoBadge.hidden = false;
    } else {
      totalEl.textContent = `${normalTotal} CHF`;
      savingsRow.hidden = true;
      promoBadge.hidden = true;
    }
  }

  function showPromoFeedback(message, isSuccess) {
    promoFeedback.textContent = message;
    promoFeedback.hidden = false;
    promoFeedback.classList.toggle('nc-promo-feedback--success', isSuccess);
    promoFeedback.classList.toggle('nc-promo-feedback--error', !isSuccess);
  }

  if (promoApplyBtn) {
    promoApplyBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) {
        showPromoFeedback('Entrez un code promo.', false);
        return;
      }
      const match = PROMO_CODES[code];
      if (match) {
        appliedPromo = match;
        showPromoFeedback(`✓ Code ${match.label} appliqué : -${Math.round(match.discount * 100)}%`, true);
      } else {
        appliedPromo = null;
        showPromoFeedback('Code promo invalide.', false);
      }
      recalculate();
    });

    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        promoApplyBtn.click();
      }
    });
  }

  formatInputs.forEach((input) => input.addEventListener('change', recalculate));
  vapeurCheckbox.addEventListener('change', recalculate);
  recalculate();

  // Date min = aujourd'hui
  const dateInput = document.getElementById('nc-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  // ----- Soumission -----
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    let valid = true;
    this.querySelectorAll('[required]').forEach((f) => {
      if (!f.value.trim()) {
        f.style.borderColor = '#e05252';
        valid = false;
      } else {
        f.style.borderColor = '#e2e2e2';
      }
    });
    if (!valid) return;

    const selectedFormat = document.querySelector('input[name="format"]:checked');
    const nom = document.getElementById('nc-nom').value;
    const tel = document.getElementById('nc-tel').value;
    const email = document.getElementById('nc-email').value;
    const adresse = document.getElementById('nc-adresse').value;
    const npa = document.getElementById('nc-npa').value;
    const ville = document.getElementById('nc-ville').value;
    const date = document.getElementById('nc-date').value;
    const creneau = document.getElementById('nc-creneau').value;
    const message = document.getElementById('nc-message').value;

    let cartDetail = `Format du canapé : ${selectedFormat.dataset.label} (${selectedFormat.value} CHF)\n`;
    cartDetail += `Désinfection vapeur : ${vapeurCheckbox.checked ? 'Oui (+30 CHF)' : 'Non'}\n`;
    if (appliedPromo) {
      cartDetail += `Prix normal : ${normalTotalEl.textContent}\n`;
      cartDetail += `Code promo appliqué : ${appliedPromo.label} (-${Math.round(appliedPromo.discount * 100)}%)\n`;
    } else {
      cartDetail += `Code promo : aucun\n`;
    }
    cartDetail += `Total : ${totalEl.textContent}`;

    const body = `NOUVELLE DEMANDE — NETTOYAGE CANAPÉ\n`
      + `=================================\n\n`
      + `Nom : ${nom}\n`
      + `Téléphone : ${tel}\n`
      + `Email : ${email || 'non renseigné'}\n`
      + `Adresse : ${adresse}\n`
      + `NPA / Ville : ${npa} ${ville}\n`
      + `Date souhaitée : ${date || 'non précisée'}\n`
      + `Créneau : ${creneau}\n`
      + `Commentaire : ${message || '—'}\n\n`
      + `PANIER :\n${cartDetail}\n\n`
      + `---\nEnvoyé depuis happymove-ge.ch/nettoyage-canape-geneve/`;

    const submitButton = this.querySelector('.btn-submit');
    const originalButtonText = submitButton ? submitButton.textContent : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours...';
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Nouvelle demande — Nettoyage canapé — depuis le site web',
          from_name: nom,
          email: email || undefined,
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
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', { content_name: 'Nettoyage canapé' });
      }

      this.innerHTML = `
      <div style="text-align:center;padding:32px 0;">
        <div style="font-size:40px;margin-bottom:16px;">✓</div>
        <p style="color:#5F5E5A;font-weight:700;font-size:18px;margin-bottom:8px;">Merci !</p>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          Nous vous contactons par téléphone<br>pour confirmer votre créneau.
        </p>
      </div>`;
    } catch (error) {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
      alert('Une erreur est survenue pendant l\'envoi. Merci de réessayer ou de nous contacter au 078 212 82 52.');
    }
  });
});
