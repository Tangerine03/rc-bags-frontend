import React, { useState, useEffect } from 'react';
import { API_URL as BASE_URL } from '../config';
const API_URL = `${BASE_URL}/api/orders`;
const steps = ['Placed', 'Shipped', 'Delivered'];

function TrackOrder() {
  const location = useLocation();
  const queryId = new URLSearchParams(location.search).get('id');

  const [trackingId, setTrackingId] = useState(queryId || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (queryId) handleSearch(null, queryId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [queryId]);

  function handleSearch(e, idOverride) {
    if (e) e.preventDefault();
    const idToSearch = idOverride || trackingId.trim();
    if (!idToSearch) return;

    setLoading(true);
    setError('');
    fetch(`${API_URL}/track/${idToSearch}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setResult(null);
        } else {
          setResult(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Something went wrong. Try again.');
        setLoading(false);
      });
  }

  const currentStepIndex = result ? steps.indexOf(result.status) : -1;

  return (
    <div className="track-page">
      <h2>Track Order</h2>

      <form onSubmit={handleSearch} className="track-form">
        <input
          type="text"
          placeholder="Enter tracking ID (e.g. TRK123456)"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />
        <button type="submit">Track</button>
      </form>

      {loading && <p>Searching...</p>}
      {error && <p className="field-error">{error}</p>}

      {result && (
        <div className="track-result">
          <p className="order-items">
            {result.items.map((item) => `${item.name} x${item.qty}`).join(', ')}
          </p>

          {result.status === 'Cancelled' ? (
            <p className="order-status status-cancelled">This order was cancelled.</p>
          ) : (
            <div className="track-timeline">
              {steps.map((step, index) => (
                <div className="track-step" key={step}>
                  <div className={`track-dot ${index <= currentStepIndex ? 'active' : ''}`}></div>
                  <span className={index <= currentStepIndex ? 'active-label' : ''}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TrackOrder;