// Product page functionality

document.addEventListener('DOMContentLoaded', async () => {
  // Get product ID from URL
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));

  if (!productId) {
    window.location.href = 'catalog.html';
    return;
  }

  // Load products and find the one we need
  const products = await loadProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    window.location.href = 'catalog.html';
    return;
  }

  // Update page title
  document.title = `${product.title} — Интерриум`;

  // Render product details
  renderProduct(product);
});

function renderProduct(product) {
  const stockBadge = product.stock
    ? '<span class="product-detail__badge product-detail__badge--in-stock">В наличии</span>'
    : '<span class="product-detail__badge product-detail__badge--out-of-stock">Под заказ</span>';

  const content = `
    <nav class="breadcrumb" aria-label="breadcrumb">
      <ol class="breadcrumb__list">
        <li class="breadcrumb__item"><a href="index.html" class="breadcrumb__link">Главная</a></li>
        <li class="breadcrumb__item"><a href="catalog.html" class="breadcrumb__link">Каталог</a></li>
        <li class="breadcrumb__item breadcrumb__item--active">${product.title}</li>
      </ol>
    </nav>

    <div class="product-detail">
      <div class="product-detail__gallery">
        <img src="${product.image}" alt="${product.title}" class="product-detail__main-image" loading="lazy">
      </div>

      <div class="product-detail__info">
        ${stockBadge}
        <h1 class="product-detail__title">${product.title}</h1>
        <p class="product-detail__brand">${product.brand}</p>
        <p class="product-detail__price">${product.price.toLocaleString('ru-RU')} ₽</p>
        
        <div class="product-detail__actions">
          <button type="button" class="btn btn--primary add-to-cart-btn" data-product-id="${product.id}">В корзину</button>
          <button type="button" class="btn btn--outline" data-modal="requestModal">Оставить заявку</button>
        </div>

        <section class="product-detail__specs">
          <h2 class="product-detail__specs-title">Характеристики</h2>
          <dl class="product-detail__specs-list">
            <dt class="product-detail__specs-dt">Процессор</dt>
            <dd class="product-detail__specs-dd">${product.specs.cpu}</dd>
            
            <dt class="product-detail__specs-dt">Оперативная память</dt>
            <dd class="product-detail__specs-dd">${product.specs.ram}</dd>
            
            <dt class="product-detail__specs-dt">Видеокарта</dt>
            <dd class="product-detail__specs-dd">${product.specs.gpu}</dd>
            
            <dt class="product-detail__specs-dt">Накопитель</dt>
            <dd class="product-detail__specs-dd">${product.specs.storage}</dd>
          </dl>
        </section>

        <section class="product-detail__description">
          <h2 class="product-detail__description-title">Описание</h2>
          <p class="product-detail__description-text">${product.description}</p>
        </section>
      </div>
    </div>
  `;

  const container = document.querySelector('.product-detail__container');
  if (container) {
    container.innerHTML = content;

    // Add event listener to "Add to cart" button
    const addToCartBtn = container.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        addToCart(product);
      });
    }
  }
}

function addToCart(product) {
  const savedCart = localStorage.getItem('cart');
  let cart = savedCart ? JSON.parse(savedCart) : [];

  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart badge
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  alert('Товар добавлен в корзину');
}