async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
      throw new Error('Не удалось загрузить товары');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    showToast('Товары временно недоступны');
    return [];
  }
}
