const STORAGE_KEY = 'cart';

function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart:updated'));
  }
}

function addItem(item, quantity = 1) {
  if (!item || !item.id) return;
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    cart[idx].quantity = (cart[idx].quantity || 1) + quantity;
  } else {
    cart.push({ ...item, quantity });
  }
  saveCart(cart);
}

function removeItem(id) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function setQuantity(id, quantity) {
  const q = Math.max(1, Number(quantity) || 1);
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === id);
  if (idx >= 0) {
    cart[idx].quantity = q;
    saveCart(cart);
  }
}

function getCount() {
  return getCart().reduce((sum, i) => sum + (i.quantity || 1), 0);
}

function getTotal() {
  return getCart().reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 1), 0);
}

export const cart = {
  getCart,
  saveCart,
  addItem,
  removeItem,
  clearCart,
  setQuantity,
  getCount,
  getTotal,
};