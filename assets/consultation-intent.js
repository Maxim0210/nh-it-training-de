const enquiryForm = document.querySelector('form[name="lead-beratung"]');
const enquiryIntent = document.querySelector('#consultation-intent');
if (enquiryForm && enquiryIntent) {
  const labels = {
    meeting: 'Kostenloses Gespräch anfragen',
    funding: 'Kostenlosen Fördercheck anfragen',
    team: 'Firmenseminar anfragen'
  };
  const updateIntent = () => {
    const label = labels[enquiryIntent.value] || labels.meeting;
    enquiryForm.querySelector('button[type="submit"]').textContent = label;
    enquiryForm.querySelector('[name="_subject"]').value = label + ' über nh-it-training.de';
  };
  enquiryIntent.addEventListener('change', updateIntent);
  document.querySelectorAll('[data-consultation]').forEach(link => {
    link.addEventListener('click', () => {
      enquiryIntent.value = link.dataset.consultation;
      updateIntent();
    });
  });
  updateIntent();
}
