import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import TrackOrder from './pages/TrackOrder';
import Admin from './pages/Admin';
import AdminOrders from './pages/AdminOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminDelivery from './pages/AdminDelivery';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/delivery" element={<AdminDelivery />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;