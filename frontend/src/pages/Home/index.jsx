import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { categories } from '../../data/categories';
import {
  BookOpen,
  Bike,
  Laptop,
  Bed,
  FlaskConical,
  Shirt,
  Dumbbell,
  UtensilsCrossed,
  Luggage,
  Palette,
  Lamp,
  Package,
  Boxes,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import './Home.css';

const ICON_MAP = {
  BookOpen,
  Bike,
  Laptop,
  Bed,
  FlaskConical,
  Shirt,
  Dumbbell,
  UtensilsCrossed,
  Luggage,
  Palette,
  Lamp,
  Package,
  Boxes
};

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Campus marketplace, <span className="highlight">reimagined.</span></h1>
            <p className="hero-subtitle">Buy, sell, and rent books, electronics, and hostel essentials — all within your university. Secure, local, and built by students, for students.</p>
            <div className="hero-cta">
              <Link to="/marketplace"><Button variant="primary" className="hero-btn">Start Exploring</Button></Link>
              <Link to="/sell"><Button variant="outline" className="hero-btn bg-white">Sell an Item</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="categories container">
        <div className="section-header">
          <div className="section-badge">
            <Sparkles size={14} className="badge-sparkle" />
            <span>Campus Catalog</span>
          </div>
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">
            Find everything you need for college life, organized across 13 specialized campus categories
          </p>
        </div>

        <div className="category-grid">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Boxes;
            return (
              <Link
                to={`/marketplace?cat=${encodeURIComponent(cat.name)}`}
                key={cat.id}
                className="category-link"
              >
                <div
                  className="category-card"
                  style={{
                    '--cat-color': cat.color,
                    '--cat-bg': cat.bgGradient
                  }}
                >
                  <div className="category-card-top">
                    <div className="category-icon-wrapper">
                      <Icon size={24} className="category-icon" />
                    </div>
                    <span className="category-tag">{cat.tag}</span>
                  </div>

                  <div className="category-content">
                    <h3 className="category-name">{cat.name}</h3>
                    <p className="category-desc">{cat.description}</p>
                  </div>

                  <div className="category-footer">
                    <span className="category-action">
                      Explore category <ArrowRight size={14} className="arrow-icon" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}