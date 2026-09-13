import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { API_URL } from './config';

const CartContext = createContext();

const CART_API_URL = `${API_URL}/api/cart`;

function loadGuestCart() {
  try {
    const saved = localStorage.getItem('guestCart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [ready, setReady] = useState(false);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const guestItems = loadGuestCart();

      fetch(CART_API_URL, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((serverItems) => {
          let merged = serverItems;

          if (guestItems.length > 0) {
            merged = [...serverItems];
            guestItems.forEach((gItem) => {
              const existing = merged.find((i) => i.id === gItem.id);
              if (existing) {
                existing.qty += gItem.qty;
              } else {
                merged.push(gItem);
              }
            });
            localStorage.removeItem('guestCart');

            fetch(CART_API_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ items: merged }),
            }).catch(console.error);
          }

          setCartItems(merged);
          setReady(true);
          hasLoadedOnce.current = true;
        })
        .catch(() => {
          setCartItems(guestItems);
          setReady(true);
          hasLoadedOnce.current = true;
        });
    } else {
      setCartItems(loadGuestCart());
      setReady(true);
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    if (!ready || !hasLoadedOnce.current) return;

    const token = localStorage.getItem('token');
    if (token) {
      fetch(CART_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: cartItems }),
      }).catch(console.error);
    } else {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
    }
  }, [cartItems, ready]);

  function addToCart(bag) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === bag.id);
      if (existing) {
        return prev.map((item) =>
          item.id === bag.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...bag, qty: 1 }];
    });
  }

  function increaseQty(bagId) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === bagId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  function decreaseQty(bagId) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === bagId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeFromCart(bagId) {
    setCartItems((prev) => prev.filter((item) => item.id !== bagId));
  }

  function clearCart() {
    setCartItems([]);
  }

  function resetCartForLogout() {
    localStorage.removeItem('guestCart');
    setCartItems([]);
  }

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <CartContext.Provider
      value={{
        cartItems, addToCart, removeFromCart, increaseQty, decreaseQty,
        clearCart, resetCartForLogout, isLoggedIn,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}