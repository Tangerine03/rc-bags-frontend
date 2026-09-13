import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/orders`;

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function fetchOrders() {
    setLoading(true);
    fetch(`${API_URL}/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
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

  function handleCancel(orderId) {
    if (!window.confirm('Cancel this order?')) return;

    fetch(`${API_URL}/${orderId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          fetchOrders();
        }
      })
      .catch((err) => alert('Error cancelling order: ' + err.message));
  }

  if (!token) {
    return (
      <div className="orders-page">
        <h2>Order History</h2>
        <p>Please log in to see your orders.</p>
        <Link to="/login"><button className="place-order-btn">Login</button></Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h2>Order History</h2>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-card-top">
              <span className="order-id">{order.trackingId}</span>
              <span className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="admin-order-products">
  {order.items.map((item, i) => (
    <Link to={`/product/${item.productId}`} className="admin-order-product-row admin-order-product-link" key={i}>
      <img src={item.image} alt={item.name} className="admin-order-thumb" />
      <div className="admin-order-product-info">
        <p className="admin-order-product-name">{item.name}</p>
        <p className="admin-order-product-meta">
          Qty: {item.qty} · ₹{item.price} each · Subtotal: ₹{item.price * item.qty}
        </p>
      </div>
    </Link>
  ))}
</div>
            <p className="order-meta">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')} · Total: ₹{order.total}
            </p>

            <div className="order-actions">
              <Link to={`/track?id=${order.trackingId}`}>
                <button className="track-btn">Track Order</button>
              </Link>
              {order.status === 'Placed' && (
                <button className="cancel-btn" onClick={() => handleCancel(order._id)}>
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;