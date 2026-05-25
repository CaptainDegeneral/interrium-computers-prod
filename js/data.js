// Data loader for products

async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}