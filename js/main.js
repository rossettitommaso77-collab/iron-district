// Menu mobile: stato esposto alle tecnologie assistive e chiusura con Escape.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  navigation.classList.toggle('is-open', open);
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});

// Rivela le sezioni entrando nell'area visibile. Se l'API manca, tutto resta visibile.
document.documentElement.classList.add('js');
const revealTargets = document.querySelectorAll('.section-heading, .facility-grid figure, .training-card, .coach-card, .plan-card, .gallery-grid figure');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealTargets.forEach((element) => element.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((element) => revealObserver.observe(element));
}

// Mantiene il layout intenzionale anche se un servizio immagini non risponde.
document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => {
    image.parentElement.classList.add('image-failed');
    image.hidden = true;
  }, { once: true });
});

// La richiesta è solo una dimostrazione: la validazione avviene localmente.
const form = document.querySelector('#trial-form');
const successMessage = document.querySelector('#form-success');
const validators = {
  name: (value) => value.trim().length >= 2 ? '' : 'Inserisci almeno 2 caratteri.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Inserisci un indirizzo email valido.',
  phone: (value) => value.replace(/\D/g, '').length >= 7 ? '' : 'Inserisci un numero di telefono valido.'
};

function showError(field, message) {
  const input = form.elements[field];
  input.setAttribute('aria-invalid', String(Boolean(message)));
  document.querySelector(`#${field}-error`).textContent = message;
  return !message;
}

Object.keys(validators).forEach((field) => {
  form.elements[field].addEventListener('blur', (event) => {
    showError(field, validators[field](event.currentTarget.value));
  });
  form.elements[field].addEventListener('input', (event) => {
    if (event.currentTarget.hasAttribute('aria-invalid')) {
      showError(field, validators[field](event.currentTarget.value));
    }
  });
});

function validateConsent() {
  const consentInput = form.elements.consent;
  const message = consentInput.checked ? '' : 'Conferma di aver compreso che si tratta di una simulazione.';
  consentInput.setAttribute('aria-invalid', String(Boolean(message)));
  document.querySelector('#consent-error').textContent = message;
  return !message;
}

form.elements.consent.addEventListener('change', validateConsent);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  successMessage.hidden = true;
  const valid = Object.entries(validators).map(([field, validate]) => showError(field, validate(form.elements[field].value))).every(Boolean);
  const consentValid = validateConsent();
  if (!valid || !consentValid) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]') || form.elements.consent;
    firstInvalid.focus();
    return;
  }
  successMessage.hidden = false;
  successMessage.focus();
  form.reset();
  Object.keys(validators).forEach((field) => form.elements[field].removeAttribute('aria-invalid'));
  form.elements.consent.removeAttribute('aria-invalid');
});
