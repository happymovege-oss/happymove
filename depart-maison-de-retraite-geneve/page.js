// Départ en EMS — comportements propres à cette page
// (header/burger déjà gérés par ../script.js)

document.addEventListener('DOMContentLoaded', () => {

  // Accordéon services : un seul ouvert à la fois, scroll smooth vers l'item ouvert
  document.querySelectorAll('.acc-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.acc-question').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        document.getElementById(b.getAttribute('aria-controls')).hidden = true;
      });

      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        const content = document.getElementById(btn.getAttribute('aria-controls'));
        content.hidden = false;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        btn.closest('.acc-item').scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }
    });
  });

  // Smooth scroll sur ancres internes
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
