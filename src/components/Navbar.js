import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';

function Navbar() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const user = JSON.parse(localStorage.getItem('user'));

  const { resetCartForLogout } = useCart();

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
  resetCartForLogout();
  navigate('/');
}
  return (
    <nav className="navbar">
      <Link to="/" className="logo">RC Bags</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/about">About</Link>
        <Link to="/cart">Cart ({totalItems})</Link>
        <Link to="/orders">Orders</Link>
        {user ? (
          <>
            <span className="nav-username">Hi, {user.name.split(' ')[0]}</span>
            <span className="auth-toggle-link" onClick={handleLogout}>Logout</span>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;