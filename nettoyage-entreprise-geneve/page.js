// Nettoyage entreprise — comportements propres à cette page
// (header/burger déjà gérés par ../script.js)
// NOTE : ce formulaire n'envoie les données vers aucun backend pour l'instant.
// Il affiche un message de succès local uniquement. À connecter à un service
// d'envoi (email, CRM...) avant mise en ligne réelle.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('devis-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
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
      this.innerHTML = `
        <div style="text-align:center;padding:32px 0;">
          <div style="font-size:40px;margin-bottom:16px;">✓</div>
          <p style="color:#5F5E5A;font-weight:700;font-size:18px;margin-bottom:8px;">Merci !</p>
          <p style="color:#555;font-size:15px;line-height:1.6;">
            Nous vous contacterons sous 48h<br>pour organiser une visite gratuite de vos locaux.
          </p>
        </div>`;
    }
  });
});
