import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import './Marketplace.css';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);

  const filtered = products.filter(p => 
    (filterType === 'ALL' || p.type === filterType) &&
    (p.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container marketplace">
      <aside className="sidebar desktop-only">
        <h3>Filters</h3>
        <div className="filter-group">
          <label>Search</label>
          <div className="search-box">
             <Search size={16} />
             <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="filter-group">
          <label>Transaction Type</label>
          <div className="filters">
            <Button variant={filterType === 'ALL' ? 'primary' : 'outline'} onClick={() => setFilterType('ALL')}>All</Button>
            <Button variant={filterType === 'SELL' ? 'primary' : 'outline'} onClick={() => setFilterType('SELL')}>Buy</Button>
            <Button variant={filterType === 'RENT' ? 'primary' : 'outline'} onClick={() => setFilterType('RENT')}>Rent</Button>
          </div>
        </div>
      </aside>
      <main className="product-grid">
        {filtered.map(product => (
          <Link to={`/product/${product.id}`} key={product.id}>
            <Card className="product-card">
              <div className="product-image-wrap">
                <img src={product.images[0]} alt={product.title} className="product-image" />
                <Badge type={product.type.toLowerCase()} className="badge-overlay">{product.type}</Badge>
              </div>
              <div className="product-info">
                <h4 className="product-title">{product.title}</h4>
                <p className="product-price">₹{product.price || product.rentalPrice} {product.type === 'RENT' && '/day'}</p>
                <div className="product-meta">
                  <span>{product.campus}</span>
                  <span>{product.postedAt}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </main>
    </div>
  );
}