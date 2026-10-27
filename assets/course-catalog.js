(() => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  document.querySelectorAll('[data-course-start]').forEach(row => {
    if (row.dataset.courseStart <= today) row.remove();
  });
  document.querySelectorAll('.verified-starts').forEach(list => {
    if (!list.children.length) {
      const message = document.createElement('p');
      message.textContent = 'Weitere Termine und Preise auf Anfrage.';
      list.replaceWith(message);
    }
  });
  const query = document.querySelector('#catalog-query');
  if (!query) return;
  const format = document.querySelector('#catalog-format');
  const topic = document.querySelector('#catalog-topic');
  const cards = [...document.querySelectorAll('[data-catalog-course]')];
  const params = new URLSearchParams(location.search);
  query.value = params.get('q') || '';
  if (['online', 'venue', 'request'].includes(params.get('format'))) format.value = params.get('format');
  if (topic && [...topic.options].some(option => option.value === params.get('topic'))) topic.value = params.get('topic');
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function filter() {
    const terms = normalize(query.value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const matches = terms.every(term => normalize(card.dataset.title).includes(term));
      const matchesFormat = !format.value || card.dataset.formats.split(' ').includes(format.value);
      card.hidden = !matches || !matchesFormat || Boolean(topic?.value && card.dataset.topic !== topic.value);
      if (!card.hidden) count++;
    });
    document.querySelector('#catalog-count').textContent = count ? `${count} Kurse gefunden` : 'Keine passenden Termine gefunden. Ändern Sie die Auswahl oder fragen Sie uns nach Ihrem Wunschkurs.';
    const url = new URL(location.href);
    query.value.trim() ? url.searchParams.set('q', query.value.trim()) : url.searchParams.delete('q');
    format.value ? url.searchParams.set('format', format.value) : url.searchParams.delete('format');
    topic?.value ? url.searchParams.set('topic', topic.value) : url.searchParams.delete('topic');
    history.replaceState(null, '', url);
  }
  query.form.addEventListener('submit', event => { event.preventDefault(); filter(); });
  query.addEventListener('input', filter);
  format.addEventListener('change', filter);
  topic?.addEventListener('change', filter);
  filter();
})();
