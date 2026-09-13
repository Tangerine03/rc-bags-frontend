import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../CartContext';
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/products`;

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [bag, setBag] = useState(null);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [unit, setUnit] = useState('cm');
  const [showToast, setShowToast] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewImageFile, setReviewImageFile] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBag(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (bag && bag._id) {
      fetch(`${BASE_URL}/api/reviews/${bag._id}`)
        .then((res) => res.json())
        .then(setReviews)
        .catch(console.error);
    }
  }, [bag]);

  if (loading) return <p>Loading...</p>;
  if (!bag) return <p>Product not found.</p>;

  function nextImage() {
    setCurrent((prev) => (prev + 1) % bag.images.length);
  }

  function prevImage() {
    setCurrent((prev) => (prev - 1 + bag.images.length) % bag.images.length);
  }

  function handleTouchStart(e) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) nextImage();
    else if (diff < -50) prevImage();
    setTouchStartX(null);
  }

  function toInches(val) {
    return (val / 2.54).toFixed(1);
  }

  function displayDim(val) {
    return unit === 'cm' ? `${val} cm` : `${toInches(val)} in`;
  }

  function handleReviewImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setReviewImageFile(file);
      setReviewImagePreview(URL.createObjectURL(file));
    }
  }

  async function uploadReviewImage(file) {
    const formData = new FormData();
    formData.append('images', file);
    const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed.');
    const data = await res.json();
    return `${BASE_URL}${data.urls[0]}`;
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) return;

    setSubmittingReview(true);
    try {
      let imageUrl = null;
      if (reviewImageFile) {
        imageUrl = await uploadReviewImage(reviewImageFile);
      }

      const res = await fetch(`${BASE_URL}/api/reviews/${bag._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reviewName, text: reviewText, rating: reviewRating, image: imageUrl }),
      });

      if (!res.ok) throw new Error('Failed to submit review.');
      const saved = await res.json();

      setReviews((prev) => [saved, ...prev]);
      setReviewName('');
      setReviewText('');
      setReviewImageFile(null);
      setReviewImagePreview(null);
      setReviewRating(0);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setSubmittingReview(false);
  }

  async function handlePincodeCheck(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryInfo({ error: 'Enter a valid 6-digit pincode.' });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/delivery-zones/check/${pincode}`);
      const data = await res.json();
      const shippingCharge = bag.price >= 999 ? 0 : 49;

      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + data.days);
      const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });

      setDeliveryInfo({ days: data.days, date: formattedDate, shippingCharge, label: data.label });
    } catch (err) {
      setDeliveryInfo({ error: 'Something went wrong. Try again.' });
    }
  }

  function renderStars(rating, interactive = false) {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (interactive ? (hoverRating || reviewRating) : rating) ? 'filled' : ''}`}
            onClick={interactive ? () => setReviewRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="gallery" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <img src={`${BASE_URL}${bag.images[current]}`} alt={bag.name} className="gallery-image" />
        {bag.images.length > 1 && (
          <>
            <button className="gallery-arrow gallery-prev" onClick={prevImage}>‹</button>
            <button className="gallery-arrow gallery-next" onClick={nextImage}>›</button>
          </>
        )}
      </div>

      {bag.images.length > 1 && (
        <div className="gallery-dots">
          {bag.images.map((_, index) => (
            <span key={index} className={`dot ${index === current ? 'active' : ''}`} onClick={() => setCurrent(index)}></span>
          ))}
        </div>
      )}

      <h2>{bag.name}</h2>
      <p>Price: ₹{bag.price}</p>

      <div className="unit-toggle">
        <button className={unit === 'cm' ? 'active-unit' : ''} onClick={() => setUnit('cm')}>cm</button>
        <button className={unit === 'in' ? 'active-unit' : ''} onClick={() => setUnit('in')}>inches</button>
      </div>

      <p>Length: {displayDim(bag.dimensions.length)}</p>
      <p>Width: {displayDim(bag.dimensions.width)}</p>
      <p>Height: {displayDim(bag.dimensions.height)}</p>
      <p>Material: {bag.material}</p>
      <p>Warranty: {bag.warranty}</p>

      <button onClick={() => {
        addToCart({ ...bag, id: bag._id, images: bag.images.map(img => `${BASE_URL}${img}`) });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }}>
        Add to Cart
      </button>

      {showToast && <div className="cart-toast">Added to cart ✓</div>}

      <div className="delivery-check">
        <h3>Check Delivery</h3>
        <form onSubmit={handlePincodeCheck} className="pincode-form">
          <input type="text" placeholder="Enter pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength="6" />
          <button type="submit">Check</button>
        </form>
        {deliveryInfo && deliveryInfo.error && <p className="delivery-error">{deliveryInfo.error}</p>}
        {deliveryInfo && !deliveryInfo.error && (
          <div className="delivery-result">
            <p>{deliveryInfo.label} — delivery by <strong>{deliveryInfo.date}</strong> ({deliveryInfo.days} days)</p>
            <p>Shipping charge: <strong>{deliveryInfo.shippingCharge === 0 ? 'Free' : `₹${deliveryInfo.shippingCharge}`}</strong></p>
          </div>
        )}
      </div>

      <div className="review-section">
        <h3>Customer Reviews</h3>
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <div className="form-group">
            <label>Your Rating</label>
            {renderStars(reviewRating, true)}
          </div>
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Your Review</label>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows="3" required></textarea>
          </div>
          <div className="form-group">
            <label>Attach a Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handleReviewImageChange} />
            {reviewImagePreview && <img src={reviewImagePreview} alt="Preview" className="review-image-preview" />}
          </div>
          <button type="submit" className="submit-review-btn" disabled={submittingReview}>
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet — be the first to review this bag.</p>
          ) : (
            reviews.map((r) => (
              <div className="review-card" key={r._id}>
                {r.image && (
                  <img
                    src={r.image}
                    alt={`${r.name}'s review`}
                    className="review-card-image"
                    onClick={() => setLightboxImage(r.image)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                <div className="review-card-body">
                  <p className="review-card-name">{r.name}</p>
                  {renderStars(r.rating)}
                  <p className="review-card-text">{r.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Full size review" className="lightbox-image" />
        </div>
      )}
    </div>
  );
}

export default ProductDetail;