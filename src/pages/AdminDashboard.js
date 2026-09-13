import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import AdminNav from '../components/AdminNav';
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/stats`;
const COLORS = ['#450C3F', '#8A5568', '#D9C4EC', '#A64B3D'];

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [signupData, setSignupData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/summary`).then((r) => r.json()),
      fetch(`${API_URL}/sales-by-day`).then((r) => r.json()),
      fetch(`${API_URL}/signups-by-day`).then((r) => r.json()),
      fetch(`${API_URL}/top-products`).then((r) => r.json()),
      fetch(`${API_URL}/status-breakdown`).then((r) => r.json()),
      fetch(`${API_URL}/low-stock`).then((r) => r.json()),
    ])
      .then(([summaryData, sales, signups, top, status, low]) => {
        setSummary(summaryData);
        setSalesData(sales.map((s) => ({ date: s._id.slice(5), revenue: s.revenue, orders: s.orders })));
        setSignupData(signups.map((s) => ({ date: s._id.slice(5), count: s.count })));
        setTopProducts(top);
        setStatusBreakdown(status.map((s) => ({ name: s._id, value: s.count })));
        setLowStock(low);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (localStorage.getItem('isAdmin') !== 'true') {
    return <div className="admin-page"><p>Access denied. Please log in as admin.</p></div>;
  }

  if (loading) return <div className="admin-page"><p>Loading dashboard...</p></div>;

  return (
    <div className="admin-page dashboard-page">
      <AdminNav />
      <h2>Dashboard</h2>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <p className="dashboard-card-label">Total Customers</p>
          <p className="dashboard-card-value">{summary.totalUsers}</p>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-card-label">Total Orders</p>
          <p className="dashboard-card-value">{summary.totalOrders}</p>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-card-label">Total Revenue</p>
          <p className="dashboard-card-value">₹{summary.totalRevenue}</p>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-card-label">Today's Sales</p>
          <p className="dashboard-card-value">₹{summary.todayRevenue}</p>
          <p className="dashboard-card-sub">{summary.todayOrders} orders</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Sales Growth (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D9C4EC" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#450C3F" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-section">
        <h3>New Signups (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={signupData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D9C4EC" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8A5568" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section dashboard-half">
          <h3>Top Selling Bags</h3>
          {topProducts.length === 0 ? (
            <p>No sales yet.</p>
          ) : (
            topProducts.map((p, i) => (
              <div className="dashboard-list-row" key={i}>
                <span>{p._id}</span>
                <span>{p.totalSold} sold · ₹{p.revenue}</span>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-section dashboard-half">
          <h3>Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {statusBreakdown.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Low Stock Alert</h3>
        {lowStock.length === 0 ? (
          <p>No bags running low right now.</p>
        ) : (
          lowStock.map((p) => (
            <div className="dashboard-list-row" key={p._id}>
              <span>{p.name}</span>
              <span className="low-stock-count">{p.stock} left</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;