import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div className="hero">
        <img src="/images/hero-bags.jpeg" alt="Bags for every occasion" className="hero-bg" />
       <img src="/images/hero-feature-bag.jpeg" alt="Featured bag" className="hero-feature-image" /> 
        <div className="hero-overlay">
          <p className="hero-label">MADE FOR THE DAILY CARRY</p>
          <h1>A bag for every chapter.</h1>
          <Link to="/shop">
            <button className="shop-now-btn">Shop Now</button>
          </Link>
        </div>
      </div>

      <div className="category-strip">
        <Link to="/shop" className="category-item">
          <img src="/images/cat-school.jpg" alt="School bags" />
          <span>School</span>
        </Link>
        <Link to="/shop" className="category-item">
          <img src="/images/cat-college.jpg" alt="College bags" />
          <span>College</span>
        </Link>
        <Link to="/shop" className="category-item">
          <img src="/images/cat-handbag.png" alt="Handbags" />
          <span>Handbag</span>
        </Link>
        <Link to="/shop" className="category-item">
          <img src="/images/cat-lunch.jpg" alt="Lunch bags" />
          <span>Lunch bag</span>
        </Link>
        <Link to="/shop" className="category-item">
          <img src="/images/cat-travel.jpg" alt="Travel bags" />
          <span>Travel</span>
        </Link>
      </div>

      <div className="about-preview">
        <h2>About Us</h2>
        <p>We design and sell quality bags for school, college, work, travel, and everyday use.</p>
      </div>
    </div>
  );
}

export default Home;