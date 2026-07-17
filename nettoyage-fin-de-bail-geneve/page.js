// Nettoyage fin de bail — comportements propres à cette page
// (header/burger déjà gérés par ../script.js)

document.addEventListener('DOMContentLoaded', () => {

  // 1. FAQ accordéon
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-question').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        document.getElementById(b.getAttribute('aria-controls')).hidden = true;
      });
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
      }
    });
  });

  // 2. Smooth scroll sur ancres internes
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 3. Animation d'apparition au scroll (respecte prefers-reduced-motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.situation-card, .faq-item, .nfb-step').forEach((el) => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }
});
