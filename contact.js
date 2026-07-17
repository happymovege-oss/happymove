// ============================================================
// PAGE CONTACT — logique du formulaire de devis
// (header/burger déjà gérés par script.js)
// ============================================================

(function () {

  // --- 1. SÉLECTEUR DE SERVICE ---
  const serviceInputs = document.querySelectorAll('input[name="service"]');
  const serviceFields = document.querySelectorAll('.service-fields');
  const btnSubmit = document.getElementById('btn-submit');

  const serviceColors = {
    ems: { main: '#2D6B50', light: '#EAF3DE', shadow: 'rgba(45,107,80,0.25)' },
    debarras: { main: '#C1765A', light: '#FAECE7', shadow: 'rgba(193,118,90,0.25)' },
    nfb: { main: '#185FA5', light: '#E6F1FB', shadow: 'rgba(24,95,165,0.25)' },
    entreprise: { main: '#5F5E5A', light: '#F5F5F3', shadow: 'rgba(95,94,90,0.25)' },
  };

  const serviceNames = {
    ems: 'un départ en EMS / appartement senior',
    debarras: 'un débarras',
    nfb: 'un nettoyage fin de bail',
    entreprise: 'un nettoyage de locaux professionnels',
  };

  serviceInputs.forEach((input) => {
    input.addEventListener('change', () => {
      const val = input.value;
      const colors = serviceColors[val];

      // Masquer tous les blocs spécifiques
      // (les champs "required" qu'ils contiennent restent tels quels dans le
      // HTML — la validation au submit ignore explicitement tout champ situé
      // dans un bloc .service-fields actuellement caché, voir plus bas)
      serviceFields.forEach((field) => {
        field.hidden = true;
      });

      // Réinitialiser l'apparence de toutes les cartes service
      document.querySelectorAll('.service-card-inner').forEach((inner) => {
        inner.style.borderColor = '';
        inner.style.background = '';
      });

      // Afficher le bloc du service sélectionné
      const target = document.getElementById('fields-' + val);
      if (target) {
        target.hidden = false;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReduced) {
          target.style.opacity = '0';
          target.style.transform = 'translateY(10px)';
          requestAnimationFrame(() => {
            target.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            target.style.opacity = '1';
            target.style.transform = 'translateY(0)';
          });
        }
      }

      // Activer le bouton submit
      btnSubmit.disabled = false;
      btnSubmit.removeAttribute('aria-disabled');

      // Couleur dynamique du bouton
      btnSubmit.setAttribute('data-service', val);
      btnSubmit.style.background = colors.main;
      btnSubmit.style.boxShadow = `0 4px 16px ${colors.shadow}`;

      // Couleur de la carte cochée
      const checkedInner = input.nextElementSibling;
      if (checkedInner) {
        checkedInner.style.borderColor = colors.main;
        checkedInner.style.background = colors.light;
      }

      // Scroll doux vers les champs spécifiques
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  });

  // --- 2. DATE MIN = aujourd'hui ---
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach((input) => {
    input.min = today;
  });

  // --- 3. VALIDATION ET ENVOI ---
  const form = document.getElementById('contact-form');
  const submitError = document.getElementById('submit-error');
  const WEB3FORMS_ACCESS_KEY = '1033b124-f3fc-49d5-b1d1-64ad5f9e429b';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    submitError.hidden = true;

    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach((field) => {
      // Ignore les champs cachés dans un bloc service non affiché
      if (field.closest('.service-fields[hidden]')) return;

      const group = field.closest('.form-group');
      const existing = group && group.querySelector('.error-msg');
      if (existing) existing.remove();

      if (!field.value.trim()) {
        isValid = false;
        field.setAttribute('aria-invalid', 'true');
        if (group) {
          const err = document.createElement('span');
          err.className = 'error-msg';
          err.setAttribute('role', 'alert');
          err.textContent = '⚠ Ce champ est obligatoire';
          group.appendChild(err);
        }
      } else {
        field.removeAttribute('aria-invalid');
      }
    });

    if (!isValid) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // --- Préparation des données ---
    const service = document.querySelector('input[name="service"]:checked')?.value;
    const serviceName = serviceNames[service] || 'votre service';

    const subject = encodeURIComponent(`Nouvelle demande — ${serviceName} — depuis le site web`);
    const prenom = document.getElementById('prenom').value;
    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const tel = document.getElementById('tel').value;

    let body = `NOUVELLE DEMANDE — HAPPY MOVE\n`;
    body += `=================================\n\n`;
    body += `SERVICE : ${serviceName.toUpperCase()}\n\n`;
    body += `CONTACT :\n`;
    body += `Prénom : ${prenom}\n`;
    body += `Nom : ${nom}\n`;
    body += `Email : ${email}\n`;
    body += `Téléphone : ${tel}\n\n`;

    if (service === 'ems') {
      body += `DÉPART EN EMS :\n`;
      body += `Adresse logement : ${document.getElementById('ems-adresse').value}\n`;
      body += `Étage : ${document.getElementById('ems-etage').value}\n`;
      body += `Taille : ${document.getElementById('ems-taille').value}\n`;
      body += `Date souhaitée : ${document.getElementById('ems-date').value}\n`;
      body += `Destination EMS : ${document.getElementById('ems-destination').value}\n`;
      const services = [...document.querySelectorAll('input[name="ems_services[]"]:checked')].map((i) => i.value).join(', ');
      body += `Services : ${services}\n`;
      body += `Description : ${document.getElementById('ems-description').value}\n`;
    } else if (service === 'debarras') {
      body += `DÉBARRAS :\n`;
      body += `Type : ${document.querySelector('input[name="debarras_type"]:checked')?.value || ''}\n`;
      body += `Adresse : ${document.getElementById('deb-adresse').value}\n`;
      body += `Étage : ${document.getElementById('deb-etage').value}\n`;
      body += `Accès : ${document.getElementById('deb-acces').value}\n`;
      body += `Date souhaitée : ${document.getElementById('deb-date').value}\n`;
      body += `Description : ${document.getElementById('deb-description').value}\n`;
    } else if (service === 'nfb') {
      body += `NETTOYAGE FIN DE BAIL :\n`;
      body += `Adresse : ${document.getElementById('nfb-adresse').value}\n`;
      body += `Surface : ${document.getElementById('nfb-m2').value}\n`;
      body += `Date fin de bail : ${document.getElementById('nfb-date-bail').value}\n`;
      body += `Date intervention souhaitée : ${document.getElementById('nfb-date-inter').value}\n`;
      body += `État : ${document.querySelector('input[name="nfb_etat"]:checked')?.value || ''}\n`;
      body += `État des lieux préliminaire : ${document.querySelector('input[name="nfb_edlp"]:checked')?.value || ''}\n`;
      const prestations = [...document.querySelectorAll('input[name="nfb_prestations[]"]:checked')].map((i) => i.value).join(', ');
      body += `Prestations : ${prestations}\n`;
      body += `Garantie régie : ${document.querySelector('input[name="nfb_garantie"]')?.checked ? 'Oui' : 'Non'}\n`;
      body += `Notes : ${document.getElementById('nfb-notes').value}\n`;
    } else if (service === 'entreprise') {
      body += `NETTOYAGE ENTREPRISE :\n`;
      body += `Adresse : ${document.getElementById('ent-adresse').value}\n`;
      body += `Surface : ${document.getElementById('ent-m2').value}\n`;
      body += `Type locaux : ${document.getElementById('ent-type').value}\n`;
      body += `Fréquence : ${document.getElementById('ent-frequence').value}\n`;
      body += `Horaire : ${document.querySelector('input[name="ent_horaire"]:checked')?.value || ''}\n`;
      body += `Description : ${document.getElementById('ent-description').value}\n`;
    }

    body += `\n---\nEnvoyé depuis happymove-ge.ch/contact.html`;

    // --- Envoi via Web3Forms (envoi direct, silencieux, sans ouvrir de
    // client mail). NOTE : les fichiers joints (photos) ne sont PAS envoyés
    // par ce biais — l'offre gratuite de Web3Forms ne couvre pas les pièces
    // jointes. Les visiteurs qui veulent envoyer des photos continuent de
    // passer par WhatsApp, déjà mis en avant partout ailleurs sur le site.
    const btnTextEl = btnSubmit.querySelector('.btn-submit-text');
    const originalBtnText = btnTextEl.textContent;
    btnSubmit.disabled = true;
    btnTextEl.textContent = 'Envoi en cours...';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Nouvelle demande — ${serviceName} — depuis le site web`,
          from_name: `${prenom} ${nom}`,
          email: email,
          telephone: tel,
          message: body,
        }),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Échec de l\'envoi');
      }

      showPopup(serviceName);

      form.reset();
      serviceFields.forEach((f) => {
        f.hidden = true;
      });
      document.querySelectorAll('.service-card-inner').forEach((inner) => {
        inner.style.borderColor = '';
        inner.style.background = '';
      });
      btnSubmit.setAttribute('aria-disabled', 'true');
      btnSubmit.style.background = '';
      btnSubmit.style.boxShadow = '';
      btnSubmit.removeAttribute('data-service');
    } catch (err) {
      submitError.textContent = '⚠ Une erreur est survenue lors de l\'envoi. Réessayez, ou contactez-nous directement par téléphone ou WhatsApp.';
      submitError.hidden = false;
      btnSubmit.disabled = false;
      btnSubmit.removeAttribute('aria-disabled');
    } finally {
      btnTextEl.textContent = originalBtnText;
    }
  });

  // --- 5. POPUP ---
  function showPopup(serviceName) {
    const popup = document.getElementById('success-popup');
    const nameEl = document.getElementById('popup-service-name');
    if (nameEl) nameEl.textContent = serviceName;
    popup.hidden = false;
    popup.querySelector('.popup-close').focus();

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  window.closePopup = function () {
    const popup = document.getElementById('success-popup');
    popup.hidden = true;
    btnSubmit.focus();
  };

  document.getElementById('success-popup').addEventListener('click', function (e) {
    if (e.target === this) closePopup();
  });

  // --- 6. SMOOTH SCROLL sur ancres internes ---
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
