import React from 'react';

function AdminNav() {
  return (
    <div className="admin-nav">
      <a href="/admin/dashboard">Dashboard</a>
      <a href="/admin">Manage Bags</a>
      <a href="/admin/orders">All Orders</a>
      <a href="/admin/delivery">Delivery Zones</a>
    </div>
  );
}

export default AdminNav;