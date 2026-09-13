import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { API_URL } from '../config';

const countryCodes = [
  { code: '+91', country: 'India', digits: 10 },
  { code: '+1', country: 'USA/Canada', digits: 10 },
  { code: '+44', country: 'UK', digits: 10 },
  { code: '+971', country: 'UAE', digits: 9 },
  { code: '+65', country: 'Singapore', digits: 8 },
  { code: '+61', country: 'Australia', digits: 9 },
];

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [payment, setPayment] = useState('upi');

  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setFullName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone.replace(/^\+\d{1,3}/, ''));
        if (data.address) setAddress(data.address);
        if (data.pincode) setPincode(data.pincode);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function validate() {
    const newErrors = {};
    const selectedCountry = countryCodes.find((c) => c.code === countryCode);

    if (!fullName.trim() || fullName.trim().length < 2) newErrors.fullName = 'Enter your full name.';
    if (!/^\d+$/.test(phone) || phone.length !== selectedCountry.digits) {
      newErrors.phone = `Enter a valid ${selectedCountry.digits}-digit number for ${selectedCountry.country}.`;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address.';
    if (!address.trim() || address.trim().length < 5) newErrors.address = 'Enter your full delivery address.';
    if (!/^\d{6}$/.test(pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function finalizeOrder(paymentResponse) {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item._id || item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            image: item.images ? item.images[0] : item.image,
          })),
          address: {
            fullName,
            phone: `${countryCode}${phone}`,
            email,
            addressLine: address,
            pincode,
          },
          payment,
          total,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            'Payment succeeded, but saving your order failed. Please contact us with your payment ID: ' +
              paymentResponse.razorpay_payment_id
        );
        setSubmitting(false);
        return;
      }

      fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: fullName, phone: `${countryCode}${phone}`, address, pincode }),
      }).catch(console.error);

      clearCart();
      alert(`Payment successful! Order placed. Tracking ID: ${data.trackingId}`);
      navigate('/orders');
    } catch (err) {
      alert(
        'Payment succeeded, but something went wrong saving your order. Please contact us with payment ID: ' +
          paymentResponse.razorpay_payment_id
      );
    }
    setSubmitting(false);
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: total }),
      });
      const razorpayOrder = await orderRes.json();

      if (!orderRes.ok) {
        alert('Could not start payment. Please try again.');
        setSubmitting(false);
        return;
      }

      const keyRes = await fetch(`${API_URL}/api/payment/key`);
      const { key } = await keyRes.json();

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'RC Bags',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          await finalizeOrder(response);
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#450C3F',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Something went wrong starting payment. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="checkout-page">
        <h2>Checkout</h2>
        <p>Please log in to complete your order — this lets you track it and view it later in Order History.</p>
        <Link to="/login" state={{ from: '/checkout' }}><button className="place-order-btn">Login to Continue</button></Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <div className="checkout-page"><h2>Checkout</h2><p>Your cart is empty.</p></div>;
  }

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-summary">
        {cartItems.map((item) => (
          <div className="checkout-line" key={item._id || item.id}>
            <span>{item.name} x {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
        <div className="checkout-line checkout-total">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} noValidate>
        <h3>Delivery Address</h3>

        <div className="form-group">
          <label>Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          {errors.fullName && <p className="field-error">{errors.fullName}</p>}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <div className="phone-input">
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
              ))}
            </select>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Number without country code"
            />
          </div>
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          {errors.address && <p className="field-error">{errors.address}</p>}
        </div>

        <div className="form-group">
          <label>Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            maxLength="6"
          />
          {errors.pincode && <p className="field-error">{errors.pincode}</p>}
        </div>

        <h3>Payment Method</h3>
        <div className="payment-options">
          <label className="radio-option">
            <input type="radio" name="payment" value="upi" checked={payment === 'upi'} onChange={() => setPayment('upi')} />
            UPI
          </label>
          <label className="radio-option">
            <input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')} />
            Credit / Debit Card
          </label>
          <label className="radio-option">
            <input type="radio" name="payment" value="netbanking" checked={payment === 'netbanking'} onChange={() => setPayment('netbanking')} />
            Netbanking
          </label>
        </div>

        <button type="submit" className="place-order-btn" disabled={submitting}>
          {submitting ? 'Processing...' : `Pay ₹${total}`}
        </button>
      </form>
    </div>
  );
}

export default Checkout;