(() => {
  const header = document.querySelector('.homepage .site-header');
  if (header) {
    const desktop = matchMedia('(min-width: 761px)');
    const update = () => {
      const focusedControls = header.querySelector('.utility-bar:focus-within, .training-nav:focus-within');
      const compact = desktop.matches && scrollY > (header.classList.contains('is-compact') ? 40 : 240);
      if (!focusedControls || !compact) header.classList.toggle('is-compact', compact);
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    header.addEventListener('focusout', () => requestAnimationFrame(update));
    update();
  }

  const refreshDates = () => {
    document.querySelectorAll('[data-expires]').forEach(item => {
      const expiry = Date.parse(item.dataset.expires);
      item.hidden = !Number.isFinite(expiry) || expiry <= Date.now();
    });
    const webinarEmpty = document.querySelector('[data-webinar-empty]');
    const courseEmpty = document.querySelector('[data-courses-empty]');
    if (webinarEmpty) webinarEmpty.hidden = !!document.querySelector('.webinar-column article:not([hidden])');
    if (courseEmpty) courseEmpty.hidden = !!document.querySelector('.course-start-list li:not([hidden])');
  };
  refreshDates();
  setInterval(refreshDates, 60000);
  document.addEventListener('visibilitychange', refreshDates);
})();
