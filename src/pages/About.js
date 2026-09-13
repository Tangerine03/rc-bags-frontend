import React from 'react';
const featuredReviews = [
  // Replace these with your real customer quotes.
  // Add or remove entries anytime — the layout updates automatically.
  { text: "Write your first real customer review here", name: "Customer Name" },
];
function About() {
  return (
    <div className="about-page">
      {/* Banner */}
      <div className="about-banner">
        <img src="/images/about-hero.jpeg" alt="Our story" />
        <div className="about-banner-label">Our story</div>
      </div>

      {/* Story + photo split */}
      <div className="about-story">
        <div className="about-story-text">
          <p className="about-eyebrow">HOW IT STARTED</p>
          <p className="about-quote">
            Every bag we make starts with one question — will this survive someone's actual day?
          </p>
        </div>
        <div className="about-story-photo">
          <img src="/images/about-story.jpeg" alt="Our workshop" />
        </div>
      </div>

      {/* Guarantees */}
      <div className="about-guarantees">
        <p className="about-eyebrow">WHY PEOPLE STAY</p>
        <div className="guarantee-grid">
          <div className="guarantee-item">
            <i className="guarantee-icon">✓</i>
            <p>Quality checked</p>
          </div>
          <div className="guarantee-item">
            <i className="guarantee-icon">↺</i>
            <p>Easy replacement</p>
          </div>
          <div className="guarantee-item">
            <i className="guarantee-icon">⚡</i>
            <p>Fast dispatch</p>
          </div>
        </div>
      </div>

      <div className="about-divider"></div>

      {/* Reviews */}
      {/* Reviews */}
<div className="about-reviews">
  <p className="about-eyebrow">WHAT CUSTOMERS SAY</p>
  <div className="review-strip">
    {featuredReviews.map((review, index) => (
      <div
        className={`review-note ${index % 2 === 0 ? 'rotate-left' : 'rotate-right'}`}
        key={index}
      >
        <p>"{review.text}"</p>
        <span>— {review.name}</span>
      </div>
    ))}
  </div>
</div>

      {/* Contact strip */}
      <div className="about-contact">
        <span>📞 +8610549927</span>
        <span>✉️ rcbags33@gmail.com</span>
        <span>📍 Chennai, India</span>
      </div>
    </div>
  );
}

export default About;