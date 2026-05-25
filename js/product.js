let currentProduct = null;

function formatProductPrice(price) {
  return `${Number(price).toLocaleString('ru-RU')} ₽`;
}

function fillProduct(product) {
  currentProduct = product;
  document.title = `${product.title} — ООО Интерриум`;

  const image = document.querySelector('.product-detail__image');
  const title = document.querySelector('[data-product-title]');
  const breadcrumb = document.querySelector('[data-product-breadcrumb]');
  const brand = document.querySelector('[data-product-brand]');
  const price = document.querySelector('[data-product-price]');
  const stock = document.querySelector('[data-product-stock]');
  const description = document.querySelector('[data-product-description]');

  if (image) {
    image.src = product.image;
    image.alt = product.title;
  }
  document.querySelectorAll('.product-detail__thumbs img').forEach((thumb) => {
    thumb.src = product.image;
    thumb.alt = `Миниатюра ${product.title}`;
  });
  if (title) title.textContent = product.title;
  if (breadcrumb) breadcrumb.textContent = product.title;
  if (brand) brand.textContent = `Бренд: ${product.brand}`;
  if (price) price.textContent = formatProductPrice(product.price);
  if (description) description.textContent = product.description;
  if (stock) {
    stock.textContent = product.stock ? 'В наличии' : 'Под заказ';
    stock.className = `badge ${product.stock ? 'badge--success' : 'badge--muted'}`;
  }

  const specMap = {
    '[data-spec-cpu]': product.specs.CPU,
    '[data-spec-ram]': product.specs.RAM,
    '[data-spec-gpu]': product.specs.GPU,
    '[data-spec-storage]': product.specs.Storage,
  };
  Object.entries(specMap).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  });
}

async function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  const products = await loadProducts();
  const product = products.find((item) => item.id === id);

  if (!product) {
    window.location.href = 'catalog.html';
    return;
  }

  fillProduct(product);
}

const addButton = document.querySelector('[data-product-add]');
if (addButton) {
  addButton.addEventListener('click', () => {
    if (currentProduct) {
      addToCart(currentProduct);
    }
  });
}

document.addEventListener('DOMContentLoaded', initProductPage);
