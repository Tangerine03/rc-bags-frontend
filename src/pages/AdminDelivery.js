import React, { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/delivery-zones`;

function AdminDelivery() {
  const [zones, setZones] = useState([]);
  const [label, setLabel] = useState('');
  const [prefix, setPrefix] = useState('');
  const [days, setDays] = useState('');

  useEffect(() => {
    fetchZones();
  }, []);

  function fetchZones() {
    fetch(API_URL)
      .then((r) => r.json())
      .then(setZones)
      .catch(console.error);
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!label.trim() || !prefix.trim() || !days) return;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, pincodePrefix: prefix, days }),
    })
      .then((r) => r.json())
      .then(() => {
        setLabel('');
        setPrefix('');
        setDays('');
        fetchZones();
      })
      .catch((err) => alert('Error: ' + err.message));
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this delivery zone?')) return;
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => fetchZones())
      .catch(console.error);
  }

  if (localStorage.getItem('isAdmin') !== 'true') {
    return <div className="admin-page"><p>Access denied. Please log in as admin.</p></div>;
  }

  return (
    <div className="admin-page">
      <AdminNav />
      <h2>Delivery Zones</h2>
      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
        Set delivery time by pincode prefix — e.g. "600" covers all Chennai pincodes starting with 600.
      </p>

      <form className="admin-form" onSubmit={handleAdd}>
        <div className="form-group">
          <label>Area / State Name</label>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Chennai" required />
        </div>
        <div className="form-group">
          <label>Pincode Prefix</label>
          <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 600" required />
        </div>
        <div className="form-group">
          <label>Delivery Days</label>
          <input type="number" value={days} onChange={(e) => setDays(e.target.value)} placeholder="e.g. 1" required />
        </div>
        <button type="submit" className="admin-submit-btn">Add Zone</button>
      </form>

      <h3>Current Zones ({zones.length})</h3>
      {zones.length === 0 ? (
        <p>No zones set yet — pincodes will default to 7 days.</p>
      ) : (
        zones.map((z) => (
          <div className="admin-product-card" key={z._id}>
            <div className="admin-product-info">
              <p className="admin-product-name">{z.label} — starts with {z.pincodePrefix}</p>
              <p className="admin-product-meta">{z.days} day(s) delivery</p>
            </div>
            <button onClick={() => handleDelete(z._id)} className="admin-delete-btn">Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDelivery;