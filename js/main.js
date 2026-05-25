const CART_STORAGE_KEY = 'cart';

function safeParseCart() {
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (!saved) {
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveCartItems(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return safeParseCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function updateCartBadge() {
  const badge = document.querySelector('.header__cart-count');
  if (badge) {
    badge.textContent = String(getCartCount());
  }
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('toast--show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('toast--show'), 2400);
}

function addToCart(product) {
  const cart = safeParseCart();
  const existing = cart.find((item) => Number(item.id) === Number(product.id));
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }
  saveCartItems(cart);
  updateCartBadge();
  showToast('Товар добавлен в корзину');
}

function initHeader() {
  const header = document.querySelector('.header');
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const navLinks = document.querySelectorAll('.header__nav-link');

  const setScrolled = () => {
    if (header) {
      header.classList.toggle('header--scrolled', window.scrollY > 4);
    }
  };

  const closeMenu = () => {
    if (!burger || !nav) return;
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('header__nav--open');
    document.body.classList.remove('is-locked');
  };

  const toggleMenu = () => {
    if (!burger || !nav) return;
    const isOpen = nav.classList.toggle('header__nav--open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('is-locked', isOpen);
  };

  if (burger) {
    burger.addEventListener('click', toggleMenu);
  }

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('scroll', setScrolled, { passive: true });
  setScrolled();
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  updateCartBadge();
});
