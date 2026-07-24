// Happy Move Sàrl — comportements du header et de la navigation

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  const burger = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');

  // Ombre du header sticky au scroll
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll);

  // Menu burger mobile
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  // Fermer le menu mobile après clic sur un lien
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Suivi de conversion Google Ads : clic téléphone / WhatsApp (délégation, couvre toutes les pages)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || typeof gtag !== 'function') return;

    if (link.href.startsWith('tel:')) {
      gtag('event', 'conversion', { send_to: 'AW-10792863914/eq9QCPu2h9YcEKqRuJoo' });
    } else if (link.href.includes('wa.me')) {
      gtag('event', 'conversion', { send_to: 'AW-10792863914/6zW9CKOIi9YcEKqRuJoo' });
    }
  });
});
