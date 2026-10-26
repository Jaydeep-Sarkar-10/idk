import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { categories } from '../../data/categories';
import './Marketplace.css';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('cat') || 'ALL';

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);

  const handleCategorySelect = (catName) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catName === 'ALL') {
      nextParams.delete('cat');
    } else {
      nextParams.set('cat', catName);
    }
    setSearchParams(nextParams);
  };

  const filtered = products.filter(p => {
    const matchesType = filterType === 'ALL' || p.type === filterType;
    const matchesCategory = activeCategory === 'ALL' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
    
    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div className="container marketplace">
      {/* Mobile Category Quick Filter Bar */}
      <div className="mobile-category-bar">
        <button
          type="button"
          className={`mobile-cat-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => handleCategorySelect('ALL')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`mobile-cat-pill ${activeCategory.toLowerCase() === c.name.toLowerCase() ? 'active' : ''}`}
            onClick={() => handleCategorySelect(c.name)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <aside className="sidebar desktop-only">
        <div className="sidebar-header">
          <div className="sidebar-title-wrap">
            <SlidersHorizontal size={18} />
            <h3>Filters</h3>
          </div>
          {(activeCategory !== 'ALL' || filterType !== 'ALL' || search) && (
            <button 
              type="button" 
              className="reset-filters-btn"
              onClick={() => {
                setFilterType('ALL');
                setSearch('');
                handleCategorySelect('ALL');
              }}
            >
              Reset
            </button>
          )}
        </div>

        <div className="filter-group">
          <label>Search Listings</label>
          <div className="search-box">
             <Search size={16} />
             <input 
               type="text" 
               placeholder="Search by title, keyword..." 
               value={search} 
               onChange={e => setSearch(e.target.value)} 
             />
             {search && (
               <button type="button" onClick={() => setSearch('')} className="clear-search-btn">
                 <X size={14} />
               </button>
             )}
          </div>
        </div>

        <div className="filter-group">
          <label>Transaction Type</label>
          <div className="filters">
            <Button 
              variant={filterType === 'ALL' ? 'primary' : 'outline'} 
              onClick={() => setFilterType('ALL')}
              className="type-btn"
            >
              All
            </Button>
            <Button 
              variant={filterType === 'SELL' ? 'primary' : 'outline'} 
              onClick={() => setFilterType('SELL')}
              className="type-btn"
            >
              Buy
            </Button>
            <Button 
              variant={filterType === 'RENT' ? 'primary' : 'outline'} 
              onClick={() => setFilterType('RENT')}
              className="type-btn"
            >
              Rent
            </Button>
          </div>
        </div>

        <div className="filter-group">
          <label>Categories ({categories.length})</label>
          <div className="category-filter-list">
            <button
              type="button"
              className={`cat-sidebar-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('ALL')}
            >
              <span>All Categories</span>
              <span className="cat-count">{products.length}</span>
            </button>
            {categories.map((c) => {
              const count = products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
              const isSelected = activeCategory.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`cat-sidebar-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(c.name)}
                >
                  <span className="cat-sidebar-name">{c.name}</span>
                  {count > 0 && <span className="cat-count">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="marketplace-main">
        {/* Active Filters Bar */}
        {activeCategory !== 'ALL' && (
          <div className="active-filter-banner">
            <span className="active-filter-label">Filtered by category:</span>
            <span className="active-filter-chip">
              {activeCategory}
              <button 
                type="button" 
                onClick={() => handleCategorySelect('ALL')} 
                className="chip-remove-btn"
                title="Remove filter"
              >
                <X size={14} />
              </button>
            </span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-marketplace">
            <div className="empty-icon-box">
              <Sparkles size={32} />
            </div>
            <h3>No items found</h3>
            <p>
              {activeCategory !== 'ALL' 
                ? `No listings currently posted under "${activeCategory}".` 
                : 'No products match your current filters.'}
            </p>
            <div className="empty-actions">
              <Link to="/sell">
                <Button variant="primary">Be First to Post in this Category</Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  handleCategorySelect('ALL');
                  setFilterType('ALL');
                  setSearch('');
                }}
              >
                View All Categories
              </Button>
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                <Card className="product-card">
                  <div className="product-image-wrap">
                    <img src={product.images[0]} alt={product.title} className="product-image" loading="lazy" />
                    <Badge type={product.type.toLowerCase()} className="badge-overlay">{product.type}</Badge>
                    <span className="product-cat-tag">{product.category}</span>
                  </div>
                  <div className="product-info">
                    <h4 className="product-title" title={product.title}>{product.title}</h4>
                    <p className="product-price">₹{product.price || product.rentalPrice} {product.type === 'RENT' && <span className="price-unit">/day</span>}</p>
                    <div className="product-meta">
                      <span>{product.campus}</span>
                      <span>{product.postedAt}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}