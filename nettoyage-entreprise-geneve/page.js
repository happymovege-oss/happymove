// Nettoyage entreprise — comportements propres à cette page
// (header/burger déjà gérés par ../script.js)
// Envoi du formulaire via Web3Forms (même service que contact.html).

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('devis-form');
  if (!form) return;

  const WEB3FORMS_ACCESS_KEY = '1033b124-f3fc-49d5-b1d1-64ad5f9e429b';

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
      const nom = document.getElementById('nom').value;
      const tel = document.getElementById('tel').value;
      const email = document.getElementById('email').value;
      const surface = document.getElementById('surface').value;

      const message = `NOUVELLE DEMANDE — NETTOYAGE ENTREPRISE\n`
        + `=================================\n\n`
        + `Nom / entreprise : ${nom}\n`
        + `Téléphone : ${tel}\n`
        + `Email : ${email}\n`
        + `Surface : ${surface || 'non précisée'}\n\n`
        + `---\nEnvoyé depuis happymove-ge.ch/nettoyage-entreprise-geneve/`;

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
            subject: 'Nouvelle demande — Nettoyage entreprise — depuis le site web',
            from_name: nom,
            email: email,
            telephone: tel,
            message: message,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Echec envoi formulaire');
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
