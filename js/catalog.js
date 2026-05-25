// Catalog page functionality

let allProducts = [];
const filters = {
  search: '',
  sort: 'default',
  category: [],
  brand: [],
  maxPrice: Infinity
};

document.addEventListener('DOMContentLoaded', () => {
  loadProducts().then(products => {
    allProducts = products;
    renderProducts(allProducts);
    initFilters();
  });
});

function createProductCard(product) {
  const stockBadge = product.stock 
    ? '<span class="product-card__badge product-card__badge--in-stock">В наличии</span>'
    : '<span class="product-card__badge product-card__badge--out-of-stock">Под заказ</span>';

  return `
    <article class="product-card fade-in" data-id="${product.id}">
      <div class="product-card__image-wrapper">
        <img src="${product.image}" alt="${product.title}" class="product-card__image" loading="lazy">
        ${stockBadge}
      </div>
      <div class="product-card__content">
        <span class="product-card__brand">${product.brand}</span>
        <h3 class="product-card__title">${product.title}</h3>
        <p class="product-card__price">${product.price.toLocaleString('ru-RU')} ₽</p>
        <div class="product-card__actions">
          <a href="product.html?id=${product.id}" class="btn btn--outline">Подробнее</a>
          <button type="button" class="btn btn--primary add-to-cart-btn" data-product-id="${product.id}">В корзину</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts(products) {
  const container = document.querySelector('.catalog__grid');
  const countEl = document.querySelector('.catalog__count');
  
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<p class="catalog__empty">Товары не найдены</p>';
    if (countEl) countEl.textContent = 'Найдено: 0 товаров';
    return;
  }

  container.innerHTML = products.map(createProductCard).join('');
  
  if (countEl) {
    countEl.textContent = `Найдено: ${products.length} товаров`;
  }

  // Add event listeners to "Add to cart" buttons
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = parseInt(btn.dataset.productId);
      addToCart(productId);
    });
  });
}

function applyFilters() {
  let result = [...allProducts];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(product => 
      product.title.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower)
    );
  }

  // Category filter
  if (filters.category.length > 0) {
    result = result.filter(product => filters.category.includes(product.category));
  }

  // Brand filter
  if (filters.brand.length > 0) {
    result = result.filter(product => filters.brand.includes(product.brand));
  }

  // Price filter
  result = result.filter(product => product.price <= filters.maxPrice);

  // Sorting
  if (filters.sort === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (filters.sort === 'title-asc') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }

  renderProducts(result);
}

function initFilters() {
  // Search input
  const searchInput = document.querySelector('.catalog__search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filters.search = e.target.value;
      applyFilters();
    });
  }

  // Sort select
  const sortSelect = document.querySelector('.catalog__sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filters.sort = e.target.value;
      applyFilters();
    });
  }

  // Category checkboxes
  const categoryContainer = document.querySelector('.catalog-filters__category');
  if (categoryContainer) {
    categoryContainer.addEventListener('change', () => {
      const checked = Array.from(categoryContainer.querySelectorAll('input[type="checkbox"]:checked'))
        .map(el => el.value);
      filters.category = checked;
      applyFilters();
    });
  }

  // Brand checkboxes
  const brandContainer = document.querySelector('.catalog-filters__brand');
  if (brandContainer) {
    brandContainer.addEventListener('change', () => {
      const checked = Array.from(brandContainer.querySelectorAll('input[type="checkbox"]:checked'))
        .map(el => el.value);
      filters.brand = checked;
      applyFilters();
    });
  }

  // Price range
  const priceRange = document.querySelector('.catalog-filters__price-range');
  const priceOutput = document.querySelector('.catalog-filters__price-value');
  if (priceRange && priceOutput) {
    priceRange.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      filters.maxPrice = value;
      priceOutput.textContent = value.toLocaleString('ru-RU');
      applyFilters();
    });
  }

  // Reset button
  const resetBtn = document.querySelector('.catalog-filters__reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filters.search = '';
      filters.sort = 'default';
      filters.category = [];
      filters.brand = [];
      filters.maxPrice = Infinity;

      // Reset UI
      const searchInput = document.querySelector('.catalog__search');
      if (searchInput) searchInput.value = '';

      const sortSelect = document.querySelector('.catalog__sort');
      if (sortSelect) sortSelect.value = 'default';

      const checkboxes = document.querySelectorAll('.catalog-filters input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = false);

      const priceRange = document.querySelector('.catalog-filters__price-range');
      const priceOutput = document.querySelector('.catalog-filters__price-value');
      if (priceRange) priceRange.value = priceRange.max;
      if (priceOutput) priceOutput.textContent = '1 000 000';

      applyFilters();
    });
  }
}

// Cart functions (shared with main.js)
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const savedCart = localStorage.getItem('cart');
  let cart = savedCart ? JSON.parse(savedCart) : [];

  const existingItem = cart.find(item => item.id === productId);
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

  // Visual feedback
  alert('Товар добавлен в корзину');
}