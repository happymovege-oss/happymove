// Nettoyage entreprise — comportements propres à cette page
// (header/burger déjà gérés par ../script.js)
// Envoi du formulaire via FormSubmit vers info@happymove-ge.ch.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('devis-form');
  if (!form) return;

  const FORM_ENDPOINT = 'https://formsubmit.co/info@happymove-ge.ch';

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
    if (valid) {
      const formData = new FormData(this);
      formData.append('_subject', 'Nouvelle demande — Nettoyage entreprise');
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');

      const submitButton = this.querySelector('.btn-submit');
      const originalButtonText = submitButton ? submitButton.textContent : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Envoi en cours...';
      }

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Echec envoi formulaire');
        }

        this.innerHTML = `
        <div style="text-align:center;padding:32px 0;">
          <div style="font-size:40px;margin-bottom:16px;">✓</div>
          <p style="color:#5F5E5A;font-weight:700;font-size:18px;margin-bottom:8px;">Merci !</p>
          <p style="color:#555;font-size:15px;line-height:1.6;">
            Nous vous contacterons sous 48h<br>pour organiser une visite gratuite de vos locaux.
          </p>
        </div>`;
      } catch (error) {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
        alert('Une erreur est survenue pendant l\'envoi. Merci de réessayer ou de nous contacter au 078 212 82 52.');
      }
    }
  });
});
