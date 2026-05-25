function getFieldMessage(input) {
  const value = input.value.trim();
  const label = input.closest('.form__field');
  const fieldName = label ? label.firstChild.textContent.trim() : 'Поле';

  if (!value) {
    return `${fieldName}: заполните поле`;
  }

  if (input.name === 'email' && (!value.includes('@') || !value.includes('.'))) {
    return 'Email: укажите корректный адрес';
  }

  if (input.name === 'phone' && value.replace(/\D/g, '').length < 10) {
    return 'Телефон: укажите не менее 10 цифр';
  }

  return '';
}

function clearFieldError(input) {
  const field = input.closest('.form__field');
  if (!field) return;
  field.classList.remove('field--error');
  const error = field.querySelector('.error-message');
  if (error) {
    error.remove();
  }
}

function showFieldError(input, message) {
  const field = input.closest('.form__field');
  if (!field) return;
  clearFieldError(input);
  field.classList.add('field--error');
  const error = document.createElement('span');
  error.className = 'error-message';
  error.textContent = message;
  field.append(error);
}

function validateForm(form) {
  const fields = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;
  fields.forEach((input) => {
    const message = getFieldMessage(input);
    if (message) {
      showFieldError(input, message);
      isValid = false;
    }
  });
  return isValid;
}

function handleFormSuccess(form) {
  const modalWindow = form.closest('.modal__window');
  if (modalWindow) {
    const success = modalWindow.querySelector('.form-success');
    form.hidden = true;
    if (success) {
      success.hidden = false;
    }
    window.setTimeout(() => {
      const modal = form.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
      form.reset();
      form.hidden = false;
      if (success) {
        success.hidden = true;
      }
    }, 2200);
    return;
  }

  form.reset();
  showToast('Спасибо! Заявка принята.');
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked');
}

function initModal() {
  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-modal]');
    if (opener) {
      openModal(opener.dataset.modal);
    }

    const closer = event.target.closest('[data-modal-close]');
    if (closer) {
      const modal = closer.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal.is-open').forEach((modal) => closeModal(modal.id));
    }
  });
}

function initFormValidation() {
  document.querySelectorAll('.js-validate-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (validateForm(form)) {
        handleFormSuccess(form);
      }
    });

    form.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('focus', () => clearFieldError(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initFormValidation();
});
