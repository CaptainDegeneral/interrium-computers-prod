let allProducts = [];
let currentPage = 1;
const productsPerPage = 9;
const filters = {
  search: '',
  sort: 'default',
  category: [],
  brand: [],
  maxPrice: Infinity,
};

const catalogGrid = document.querySelector('.catalog__grid');
const catalogCount = document.querySelector('.catalog__count');
const searchInput = document.querySelector('.catalog__search input');
const sortSelect = document.querySelector('.catalog__sort');
const priceRange = document.querySelector('.catalog__price');
const priceOutput = document.querySelector('.catalog__price-output');
const resetButton = document.querySelector('.catalog__reset');
const filtersForm = document.querySelector('.filters');
const pagination = document.querySelector('.pagination');
const sidebar = document.querySelector('.catalog__sidebar');
const filterToggle = document.querySelector('.catalog__filter-toggle');
const applyButton = document.querySelector('[data-apply-filters]');

function formatPrice(price) {
  return `${Number(price).toLocaleString('ru-RU')} ₽`;
}

function createProductCard(product) {
  return `<article class="product-card" data-id="${product.id}">
    <img src="${product.image}" alt="${product.title}" loading="lazy" />
    <span class="badge ${product.stock ? 'badge--success' : 'badge--muted'}">${product.stock ? 'В наличии' : 'Под заказ'}</span>
    <h3>${product.title}</h3>
    <p>${product.brand}</p>
    <strong>${formatPrice(product.price)}</strong>
    <div class="product-card__actions">
      <a class="btn btn--outline" href="product.html?id=${product.id}">Подробнее</a>
      <button class="btn btn--primary" type="button" data-add-cart="${product.id}">В корзину</button>
    </div>
  </article>`;
}

function renderPagination(total) {
  if (!pagination) return;
  const pages = Math.ceil(total / productsPerPage);
  if (pages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  const buttons = [];
  for (let page = 1; page <= pages; page += 1) {
    buttons.push(`<button type="button" class="${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`);
  }
  if (currentPage < pages) {
    buttons.push(`<button type="button" data-page="${currentPage + 1}">Следующая</button>`);
  }
  pagination.innerHTML = buttons.join('');
}

function renderProducts(products) {
  if (!catalogGrid) return;
  catalogCount.textContent = `Найдено: ${products.length} товаров`;

  if (products.length === 0) {
    catalogGrid.innerHTML = '<div class="catalog__empty">Товары не найдены</div>';
    renderPagination(0);
    return;
  }

  const start = (currentPage - 1) * productsPerPage;
  const pageProducts = products.slice(start, start + productsPerPage);
  catalogGrid.innerHTML = pageProducts.map(createProductCard).join('');
  renderPagination(products.length);
}

function applyFilters() {
  let result = [...allProducts];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter((product) => product.title.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query));
  }

  if (filters.category.length > 0) {
    result = result.filter((product) => filters.category.includes(product.category));
  }

  if (filters.brand.length > 0) {
    result = result.filter((product) => filters.brand.includes(product.brand));
  }

  result = result.filter((product) => product.price <= filters.maxPrice);

  if (filters.sort === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  }
  if (filters.sort === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  }
  if (filters.sort === 'title-asc') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }

  const pageCount = Math.max(1, Math.ceil(result.length / productsPerPage));
  if (currentPage > pageCount) {
    currentPage = 1;
  }
  renderProducts(result);
}

function updateFilterArrays() {
  filters.category = Array.from(document.querySelectorAll('input[name="category"]:checked')).map((el) => el.value);
  filters.brand = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map((el) => el.value);
}

async function initCatalog() {
  allProducts = await loadProducts();
  if (priceRange && allProducts.length) {
    const max = Math.max(...allProducts.map((product) => product.price));
    priceRange.max = String(max);
    priceRange.value = String(max);
    filters.maxPrice = max;
    priceOutput.textContent = formatPrice(max);
  }
  renderProducts(allProducts);
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    filters.search = searchInput.value.trim();
    currentPage = 1;
    applyFilters();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    filters.sort = sortSelect.value;
    currentPage = 1;
    applyFilters();
  });
}

if (filtersForm) {
  filtersForm.addEventListener('change', (event) => {
    if (event.target.matches('input[type="checkbox"]')) {
      updateFilterArrays();
      currentPage = 1;
      applyFilters();
    }
  });
}

if (priceRange) {
  priceRange.addEventListener('input', () => {
    filters.maxPrice = Number(priceRange.value);
    priceOutput.textContent = formatPrice(filters.maxPrice);
    currentPage = 1;
    applyFilters();
  });
}

if (resetButton) {
  resetButton.addEventListener('click', () => {
    filters.search = '';
    filters.sort = 'default';
    filters.category = [];
    filters.brand = [];
    filters.maxPrice = Number(priceRange.max);
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';
    document.querySelectorAll('.filters input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
    if (priceRange) priceRange.value = String(filters.maxPrice);
    if (priceOutput) priceOutput.textContent = formatPrice(filters.maxPrice);
    currentPage = 1;
    applyFilters();
  });
}

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add-cart]');
  if (addButton) {
    const product = allProducts.find((item) => Number(item.id) === Number(addButton.dataset.addCart));
    if (product) {
      addToCart(product);
    }
  }
});

if (pagination) {
  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    currentPage = Number(button.dataset.page);
    applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (applyButton) {
  applyButton.addEventListener('click', () => {
    updateFilterArrays();
    currentPage = 1;
    applyFilters();
    if (sidebar) {
      sidebar.classList.remove('catalog__sidebar--open');
    }
    if (filterToggle) {
      filterToggle.textContent = 'Показать фильтры';
    }
  });
}

if (filterToggle && sidebar) {
  filterToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('catalog__sidebar--open');
    filterToggle.textContent = isOpen ? 'Скрыть фильтры' : 'Показать фильтры';
  });
}

document.addEventListener('DOMContentLoaded', initCatalog);
