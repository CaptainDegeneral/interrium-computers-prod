// Main JS - common functionality for all pages

document.addEventListener('DOMContentLoaded', () => {
  // Update cart badge on all pages
  updateCartBadge();

  // Initialize modal functionality
  initModal();

  // Initialize header scroll effect
  initHeaderScroll();
});

// Cart badge update
function updateCartBadge() {
  const cartCountEl = document.querySelector('.header__cart-count');
  if (!cartCountEl) return;

  const savedCart = localStorage.getItem('cart');
  const cart = savedCart ? JSON.parse(savedCart) : [];
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalItems > 0 ? totalItems : '';
}

// Header scroll effect
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = 'var(--shadow-lg)';
    } else {
      header.style.boxShadow = 'var(--shadow-md)';
    }
  });
}

// Modal initialization
function initModal() {
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalCloseBtn = document.querySelector('.modal__close');
  const modalForm = document.querySelector('.modal .form');
  const openButtons = document.querySelectorAll('[data-modal="requestModal"]');

  if (!modalOverlay) return;

  // Open modal
  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      openModal(modalOverlay);
    });
  });

  // Close modal with button
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      closeModal(modalOverlay);
    });
  }

  // Close modal with overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal(modalOverlay);
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('modal-overlay--open')) {
      closeModal(modalOverlay);
    }
  });

  // Form validation and submit
  if (modalForm) {
    modalForm.addEventListener('submit', handleFormSubmit);
  }
}

function openModal(modalOverlay) {
  modalOverlay.classList.add('modal-overlay--open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalOverlay) {
  modalOverlay.classList.remove('modal-overlay--open');
  document.body.style.overflow = '';
  
  // Reset form state
  const form = modalOverlay.querySelector('.form');
  const successMessage = modalOverlay.querySelector('.form__success');
  if (form && successMessage) {
    form.style.display = 'flex';
    successMessage.style.display = 'none';
    form.reset();
    clearFormErrors(form);
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  let isValid = true;
  clearFormErrors(form);

  // Validate name
  if (!data.name || !data.name.trim()) {
    showFieldError(form, 'name', 'Введите имя');
    isValid = false;
  }

  // Validate organization
  if (!data.organization || !data.organization.trim()) {
    showFieldError(form, 'organization', 'Введите название организации');
    isValid = false;
  }

  // Validate phone (min 10 chars)
  if (!data.phone || data.phone.trim().length < 10) {
    showFieldError(form, 'phone', 'Введите корректный номер телефона (минимум 10 символов)');
    isValid = false;
  }

  // Validate email
  if (!data.email || !data.email.includes('@') || !data.email.includes('.')) {
    showFieldError(form, 'email', 'Введите корректный email');
    isValid = false;
  }

  if (!isValid) return;

  // Success - hide form, show success message
  const successMessage = form.nextElementSibling;
  if (successMessage && successMessage.classList.contains('form__success')) {
    form.style.display = 'none';
    successMessage.style.display = 'block';

    // Auto close after 2 seconds
    setTimeout(() => {
      const modalOverlay = form.closest('.modal-overlay');
      if (modalOverlay) {
        closeModal(modalOverlay);
      }
    }, 2000);
  }
}

function showFieldError(form, fieldName, message) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (!field) return;

  field.classList.add('form__input--error');
  
  let errorEl = field.parentElement.querySelector('.form__error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'form__error';
    field.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;

  // Remove error on focus
  field.addEventListener('focus', () => {
    field.classList.remove('form__input--error');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }, { once: true });
}

function clearFormErrors(form) {
  const errorFields = form.querySelectorAll('.form__input--error, .form__textarea--error');
  errorFields.forEach(field => {
    field.classList.remove('form__input--error');
    field.classList.remove('form__textarea--error');
  });

  const errorMessages = form.querySelectorAll('.form__error');
  errorMessages.forEach(msg => msg.remove());
}