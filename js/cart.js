// Cart page functionality

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  cart = loadCart();
  renderCart();
});

function loadCart() {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

function addToCart(productId) {
  // This function is called from other pages - for cart page we just need load/save
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function updateQuantity(id, delta) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += delta;
  
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
}

function getTotalPrice() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function clearCart() {
  if (confirm('Вы уверены, что хотите очистить корзину?')) {
    cart = [];
    saveCart();
    renderCart();
  }
}

function renderCart() {
  const container = document.querySelector('.cart__container');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart__empty">
        <h2 class="cart__empty-title">Корзина пуста</h2>
        <p class="cart__empty-text">Добавьте товары из каталога</p>
        <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
      </div>
    `;
    return;
  }

  const itemsHTML = cart.map(item => `
    <div class="cart-item fade-in" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}" class="cart-item__image" loading="lazy">
      <div class="cart-item__info">
        <h3 class="cart-item__title">${item.title}</h3>
        <p class="cart-item__price">${item.price.toLocaleString('ru-RU')} ₽</p>
      </div>
      <div class="cart-item__quantity">
        <button type="button" class="cart-item__btn cart-item__btn--minus" data-action="minus" data-id="${item.id}">−</button>
        <span class="cart-item__count">${item.quantity}</span>
        <button type="button" class="cart-item__btn cart-item__btn--plus" data-action="plus" data-id="${item.id}">+</button>
      </div>
      <p class="cart-item__total">${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
      <button type="button" class="cart-item__remove" data-action="remove" data-id="${item.id}">Удалить</button>
    </div>
  `).join('');

  const summary = `
    <div class="cart-summary fade-in">
      <h2 class="cart-summary__title">Итого</h2>
      <div class="cart-summary__row">
        <span>Количество позиций:</span>
        <span>${getCartCount()} шт.</span>
      </div>
      <div class="cart-summary__row cart-summary__row--total">
        <span>Общая сумма:</span>
        <span>${getTotalPrice().toLocaleString('ru-RU')} ₽</span>
      </div>
      <div class="cart-summary__actions">
        <button type="button" class="btn btn--primary" data-modal="requestModal">Оформить заказ</button>
        <a href="catalog.html" class="btn btn--outline">Продолжить покупки</a>
        <button type="button" class="btn btn--outline cart__clear" onclick="clearCart()">Очистить корзину</button>
      </div>
    </div>
  `;

  container.innerHTML = itemsHTML + summary;

  // Add event listeners
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const id = parseInt(e.target.dataset.id);

      if (action === 'minus') {
        updateQuantity(id, -1);
      } else if (action === 'plus') {
        updateQuantity(id, 1);
      } else if (action === 'remove') {
        removeFromCart(id);
      }
    });
  });
}