// Nettoyage canapé — comportements propres à cette page
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

  const form = document.getElementById('nc-form');
  if (!form) return;

  const WEB3FORMS_ACCESS_KEY = '1033b124-f3fc-49d5-b1d1-64ad5f9e429b';

  // Date min = aujourd'hui
  const dateInput = document.getElementById('nc-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

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

    const nom = document.getElementById('nc-nom').value;
    const tel = document.getElementById('nc-tel').value;
    const email = document.getElementById('nc-email').value;
    const format = document.getElementById('nc-format').value;
    const date = document.getElementById('nc-date').value;
    const message = document.getElementById('nc-message').value;

    const body = `NOUVELLE DEMANDE — NETTOYAGE CANAPÉ\n`
      + `=================================\n\n`
      + `Nom : ${nom}\n`
      + `Téléphone : ${tel}\n`
      + `Email : ${email || 'non renseigné'}\n`
      + `Format du canapé : ${format}\n`
      + `Date souhaitée : ${date || 'non précisée'}\n`
      + `Message : ${message || '—'}\n\n`
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
