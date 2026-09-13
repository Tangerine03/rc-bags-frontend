import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/products`;

function Shop() {
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [categories, setCategories] = useState(["All", "School Bag", "College Bag", "Handbag", "Lunch Bag", "Travel Bag"]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setBags(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    fetch(`${BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((cats) => {
        const fetched = cats.map((c) => c.name);
        setCategories(["All", ...new Set(["School Bag", "College Bag", "Handbag", "Lunch Bag", "Travel Bag", ...fetched])]);
      })
      .catch(() => {});
  }, []);

  const colors = ["All", ...new Set(bags.map((b) => b.color).filter(Boolean))];

  let filteredBags = bags.filter((bag) => {
    const matchesCategory = selectedCategory === "All" || bag.category === selectedCategory;
    const matchesColor = selectedColor === "All" || bag.color === selectedColor;
    const matchesMin = minPrice === '' || bag.price >= Number(minPrice);
    const matchesMax = maxPrice === '' || bag.price <= Number(maxPrice);
    return matchesCategory && matchesColor && matchesMin && matchesMax;
  });

  if (sortOrder === 'low-high') {
    filteredBags = [...filteredBags].sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'high-low') {
    filteredBags = [...filteredBags].sort((a, b) => b.price - a.price);
  }

  return (
    <div className="shop-page">
      <h2>Our Bags</h2>

      <div className="category-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? "active-category" : ""}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Color</label>
          <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
            {colors.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Min Price</label>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="₹0" />
        </div>

        <div className="filter-group">
          <label>Max Price</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" />
        </div>

        <div className="filter-group">
          <label>Sort</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="none">Default</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading bags...</p>
      ) : filteredBags.length === 0 ? (
        <p>No bags match these filters.</p>
      ) : (
        <div className="products">
          {filteredBags.map((bag) =>
            bag.stock > 0 ? (
              <Link to={`/product/${bag._id}`} key={bag._id} className="product-link">
                <div className="product-card">
                  <img src={`${BASE_URL}${bag.images[0]}`} alt={bag.name} />
                  <h3>{bag.name}</h3>
                  <p>₹{bag.price}</p>
                </div>
              </Link>
            ) : (
              <div className="product-card out-of-stock" key={bag._id}>
                <img src={`${BASE_URL}${bag.images[0]}`} alt={bag.name} />
                <h3>{bag.name}</h3>
                <p className="out-of-stock-text">Out of Stock</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Shop;