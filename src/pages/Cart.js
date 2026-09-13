import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

function Cart() {
  const { cartItems, removeFromCart, increaseQty, decreaseQty, isLoggedIn } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {!isLoggedIn && (
        <div className="cart-login-banner">
          You're not logged in — <Link to="/login" state={{ from: '/cart' }}>log in</Link> so this cart is saved for next time.
        </div>
      )}

      {cartItems.map((item) => (
        <div className="cart-item" key={item.id}>
          <img src={item.images ? item.images[0] : item.image} alt={item.name} width="80" />
          <h3>{item.name}</h3>

          <div className="qty-control">
            <button onClick={() => decreaseQty(item.id)}>−</button>
            <span>{item.qty}</span>
            <button onClick={() => increaseQty(item.id)}>+</button>
          </div>

          <p>₹{item.price * item.qty}</p>
          <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}

      <div className="cart-summary-box">
        <div className="cart-summary-line">
          <span>Subtotal</span>
          <span>₹{total}</span>
        </div>
        <p className="cart-summary-note">Shipping and any applicable charges calculated at checkout.</p>

        <Link to="/checkout" className="checkout-link">
          <button className="checkout-btn">
            Proceed to Checkout
            <span className="checkout-btn-arrow">→</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Cart;