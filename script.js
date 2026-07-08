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
});
