import React, { useState, useEffect } from 'react';
import { API_URL as BASE_URL } from '../config';
import AdminNav from '../components/AdminNav';
import { Link } from 'react-router-dom';

const API_URL = `${BASE_URL}/api/orders`;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  function fetchOrders() {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  function handleStatusChange(orderId, newStatus) {
    fetch(`${API_URL}/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then(() => fetchOrders())
      .catch((err) => alert('Error updating status: ' + err.message));
  }

  function handleDeleteOrder(orderId) {
    if (!window.confirm('Delete this order permanently? This cannot be undone.')) return;

    fetch(`${API_URL}/${orderId}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          fetchOrders();
        }
      })
      .catch((err) => alert('Error: ' + err.message));
  }

  if (localStorage.getItem('isAdmin') !== 'true') {
    return <div className="admin-page"><p>Access denied. Please log in as admin.</p></div>;
  }

  return (
    <div className="admin-page">
      <AdminNav />
      <h2>All Orders ({orders.length})</h2>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => (
          <div className="admin-order-card" key={order._id}>
            <div className="admin-order-top">
              <span className="order-id">{order.trackingId}</span>
              <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
            </div>

            <p className="admin-order-meta">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')} · Total: ₹{order.total} · Payment: {order.payment.toUpperCase()}
            </p>

            <div className="admin-order-customer">
              <p><strong>{order.address.fullName}</strong></p>
              <p>{order.address.phone} · {order.address.email}</p>
              <p>{order.address.addressLine}, {order.address.pincode}</p>
            </div>

            <div className="admin-order-products">
              {order.items.map((item, i) => (
                <div className="admin-order-product-row" key={i}>
                  <img src={item.image} alt={item.name} className="admin-order-thumb" />
                  <div className="admin-order-product-info">
                    <p className="admin-order-product-name">{item.name}</p>
                    <p className="admin-order-product-meta">
                      Qty: {item.qty} · Price each: ₹{item.price} · Subtotal: ₹{item.price * item.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-order-actions">
              <label>Update Status:</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                disabled={order.status === 'Cancelled'}
              >
                <option value="Placed">Placed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>

              {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                <button className="admin-delete-btn" onClick={() => handleDeleteOrder(order._id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrders;