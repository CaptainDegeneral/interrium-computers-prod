let cart = loadCart();
const cartContainer = document.querySelector('[data-cart-container]');
const confirmModal = document.getElementById('confirmClear');

function loadCart() {
  const saved = localStorage.getItem('cart');
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

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function removeFromCart(id) {
  cart = cart.filter((item) => Number(item.id) !== Number(id));
  saveCart();
  updateCartBadge();
}

function updateQuantity(id, delta) {
  const item = cart.find((product) => Number(product.id) === Number(id));
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateCartBadge();
}

function getTotalPrice() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartCountLocal() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function formatCartPrice(price) {
  return `${Number(price).toLocaleString('ru-RU')} ₽`;
}

function createCartItem(item) {
  return `<article class="cart-item" data-id="${item.id}">
    <img class="cart-item__image" src="${item.image}" alt="${item.title}" loading="lazy" />
    <div><h2 class="cart-item__title">${item.title}</h2><p class="cart-item__price">${formatCartPrice(item.price)}</p></div>
    <div class="cart-item__qty" aria-label="Количество товара">
      <button type="button" data-action="minus" aria-label="Уменьшить количество">−</button>
      <input type="text" value="${item.quantity}" readonly aria-label="Текущее количество" />
      <button type="button" data-action="plus" aria-label="Увеличить количество">+</button>
    </div>
    <p class="cart-item__sum">${formatCartPrice(item.price * item.quantity)}</p>
    <button class="cart-item__remove" type="button" data-action="remove">Удалить</button>
  </article>`;
}

function renderCart() {
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `<div class="cart__empty"><h2>Корзина пуста</h2><p>Добавьте товары из каталога, чтобы оформить оптовую заявку.</p><a class="btn btn--primary" href="catalog.html">Перейти в каталог</a></div>`;
    return;
  }

  cartContainer.innerHTML = `<div class="cart__content">
    <div class="cart__items">${cart.map(createCartItem).join('')}</div>
    <aside class="cart__summary">
      <h2>Итого</h2>
      <div class="cart__summary-row"><span>Количество позиций</span><strong>${getCartCountLocal()}</strong></div>
      <div class="cart__summary-row cart__summary-total"><span>Сумма</span><strong>${formatCartPrice(getTotalPrice())}</strong></div>
      <button class="btn btn--primary" type="button" data-modal="requestModal">Оформить заказ</button>
      <a class="btn btn--outline" href="catalog.html">Продолжить покупки</a>
      <button class="btn btn--outline" type="button" data-action="clear">Очистить корзину</button>
    </aside>
  </div>`;
}

function openConfirm() {
  if (confirmModal) {
    confirmModal.classList.add('is-open');
    confirmModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  }
}

function closeConfirm() {
  if (confirmModal) {
    confirmModal.classList.remove('is-open');
    confirmModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }
}

if (cartContainer) {
  cartContainer.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const item = button.closest('.cart-item');
    const id = item ? item.dataset.id : null;
    const action = button.dataset.action;

    if (action === 'plus') updateQuantity(id, 1);
    if (action === 'minus') updateQuantity(id, -1);
    if (action === 'remove') removeFromCart(id);
    if (action === 'clear') openConfirm();

    renderCart();
  });
}

if (confirmModal) {
  confirmModal.addEventListener('click', (event) => {
    if (event.target === confirmModal || event.target.closest('[data-confirm-cancel]')) {
      closeConfirm();
    }
    if (event.target.closest('[data-confirm-ok]')) {
      cart = [];
      saveCart();
      updateCartBadge();
      renderCart();
      closeConfirm();
      showToast('Корзина очищена');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeConfirm();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cart = loadCart();
  renderCart();
  updateCartBadge();
});
