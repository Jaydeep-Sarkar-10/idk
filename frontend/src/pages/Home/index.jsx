import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import './Home.css';
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
        <h2 className="section-title">Browse by Category</h2>
        <div className="category-grid">
          {['Books', 'Electronics', 'Fashion', 'Cycles', 'Hostel', 'Sports'].map(cat => (
             <Link to={`/marketplace?cat=${cat}`} key={cat}>
               <Card className="category-card"><h3>{cat}</h3></Card>
             </Link>
          ))}
        </div>
      </section>
    </div>
  );
}