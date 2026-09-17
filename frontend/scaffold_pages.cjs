const fs = require('fs');
const path = require('path');

const files = {
  'src/main.jsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,

  'src/pages/Marketplace/index.jsx': `import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import './Marketplace.css';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);

  const filtered = products.filter(p => filter === 'ALL' || p.type === filter);

  return (
    <div className="container marketplace">
      <aside className="sidebar desktop-only">
        <h3>Categories</h3>
        <ul className="cat-list">
          <li>Books</li>
          <li>Electronics</li>
          <li>Cycles</li>
        </ul>
        <div className="filters">
          <Button variant={filter === 'ALL' ? 'primary' : 'outline'} onClick={() => setFilter('ALL')}>All</Button>
          <Button variant={filter === 'SELL' ? 'primary' : 'outline'} onClick={() => setFilter('SELL')}>Buy</Button>
          <Button variant={filter === 'RENT' ? 'primary' : 'outline'} onClick={() => setFilter('RENT')}>Rent</Button>
        </div>
      </aside>
      <main className="product-grid">
        {filtered.map(product => (
          <Link to={\`/product/\${product.id}\`} key={product.id}>
            <Card className="product-card">
              <img src={product.images[0]} alt={product.title} className="product-image" />
              <div className="product-info">
                <Badge type={product.type.toLowerCase()}>{product.type}</Badge>
                <h4 className="product-title">{product.title}</h4>
                <p className="product-price">₹{product.price || product.rentalPrice}</p>
                <p className="product-meta">{product.location}</p>
              </div>
            </Card>
          </Link>
        ))}
      </main>
    </div>
  );
}`,

  'src/pages/Marketplace/Marketplace.css': `.marketplace { display: flex; gap: var(--spacing-8); padding: var(--spacing-8) var(--spacing-4); }
.sidebar { width: 250px; flex-shrink: 0; }
.cat-list { list-style: none; margin: var(--spacing-4) 0; }
.cat-list li { padding: var(--spacing-2) 0; cursor: pointer; color: var(--color-text-muted); }
.filters { display: flex; gap: var(--spacing-2); flex-wrap: wrap; }
.product-grid { flex-grow: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--spacing-6); }
.product-card { transition: transform 0.2s; }
.product-card:hover { transform: translateY(-4px); }
.product-image { width: 100%; height: 160px; object-fit: cover; }
.product-info { padding: var(--spacing-4); }
.product-title { margin: var(--spacing-2) 0; font-size: var(--font-size-lg); }
.product-price { font-weight: 700; color: var(--color-primary); font-size: var(--font-size-xl); }
.product-meta { color: var(--color-text-muted); font-size: var(--font-size-sm); margin-top: var(--spacing-2); }
@media (max-width: 768px) { .marketplace { flex-direction: column; } .desktop-only { display: none; } }`,

  'src/pages/ProductDetails/index.jsx': `import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.getProduct(id).then(setProduct);
  }, [id]);

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container pdetails">
      <div className="pdetails-image-col">
        <img src={product.images[0]} alt={product.title} className="pdetails-main-img" />
      </div>
      <div className="pdetails-info-col">
        <Badge type={product.type.toLowerCase()}>{product.type}</Badge>
        <h1 className="pdetails-title">{product.title}</h1>
        <div className="pdetails-price">₹{product.price || product.rentalPrice}</div>
        
        <div className="pdetails-seller">
          <div className="seller-avatar"></div>
          <div>
            <strong>{product.seller}</strong>
            <div>{product.campus} - {product.location}</div>
          </div>
        </div>

        <div className="pdetails-desc">
          <h3>Description</h3>
          <p>{product.description}</p>
          <p><strong>Condition:</strong> {product.condition}</p>
        </div>

        <div className="pdetails-actions">
          <Link to="/chat"><Button variant="primary">Chat with Seller</Button></Link>
          <Button variant="outline">Save</Button>
        </div>
      </div>
    </div>
  );
}`,

  'src/pages/ProductDetails/ProductDetails.css': `.pdetails { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-12); padding: var(--spacing-8) var(--spacing-4); }
.pdetails-main-img { width: 100%; border-radius: var(--radius-xl); object-fit: cover; aspect-ratio: 4/3; }
.pdetails-title { margin: var(--spacing-2) 0; font-size: var(--font-size-3xl); }
.pdetails-price { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-primary); margin-bottom: var(--spacing-6); }
.pdetails-seller { display: flex; gap: var(--spacing-4); align-items: center; padding: var(--spacing-4); background: var(--color-bg-subtle); border-radius: var(--radius-lg); margin-bottom: var(--spacing-6); }
.seller-avatar { width: 48px; height: 48px; background: var(--color-border); border-radius: 50%; }
.pdetails-desc { margin-bottom: var(--spacing-8); }
.pdetails-actions { display: flex; gap: var(--spacing-4); }
@media (max-width: 768px) { .pdetails { grid-template-columns: 1fr; gap: var(--spacing-6); } }`,

  'src/pages/CreateListing/index.jsx': `import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import './CreateListing.css';

export default function CreateListing() {
  const [type, setType] = useState('SELL');
  
  return (
    <div className="container create-listing">
      <h1>Create Listing</h1>
      <form className="listing-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Transaction Type</label>
          <div className="type-toggle">
            <Button variant={type === 'SELL' ? 'primary' : 'outline'} onClick={() => setType('SELL')} type="button">Sell</Button>
            <Button variant={type === 'RENT' ? 'primary' : 'outline'} onClick={() => setType('RENT')} type="button">Rent</Button>
          </div>
        </div>
        
        <div className="form-group">
          <label>Title</label>
          <input type="text" className="form-input" placeholder="What are you listing?" />
        </div>
        
        {type === 'SELL' ? (
          <div className="form-group">
            <label>Price (₹)</label>
            <input type="number" className="form-input" placeholder="e.g. 500" />
          </div>
        ) : (
          <div className="form-group">
            <label>Price per day (₹)</label>
            <input type="number" className="form-input" placeholder="e.g. 50" />
          </div>
        )}
        
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-input" rows="4"></textarea>
        </div>
        
        <Button variant="primary" type="submit">Publish Listing</Button>
      </form>
    </div>
  );
}`,

  'src/pages/CreateListing/CreateListing.css': `.create-listing { max-width: 600px; padding: var(--spacing-8) var(--spacing-4); }
.listing-form { display: flex; flex-direction: column; gap: var(--spacing-6); margin-top: var(--spacing-6); }
.form-group { display: flex; flex-direction: column; gap: var(--spacing-2); }
.form-group label { font-weight: 500; }
.form-input { padding: var(--spacing-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--font-size-base); }
.form-input:focus { outline: none; border-color: var(--color-primary); }
.type-toggle { display: flex; gap: var(--spacing-2); }`,

  'src/pages/Chat/index.jsx': `import React from 'react';
import './Chat.css';

export default function Chat() {
  return (
    <div className="container chat-layout">
      <aside className="chat-sidebar desktop-only">
        <h3>Conversations</h3>
        <div className="chat-thread active">Casio Calculator</div>
        <div className="chat-thread">Engineering Book</div>
      </aside>
      <main className="chat-main">
        <div className="chat-header">
          <strong>Casio Calculator</strong>
          <span className="chat-status">Rahul</span>
        </div>
        <div className="chat-messages">
          <div className="message received">Hi, is this available?</div>
          <div className="message sent">Yes, it is.</div>
        </div>
        <div className="chat-input-area">
          <input type="text" className="chat-input" placeholder="Type a message..." />
          <button className="chat-send">Send</button>
        </div>
      </main>
    </div>
  );
}`,

  'src/pages/Chat/Chat.css': `.chat-layout { display: flex; height: calc(100vh - var(--navbar-height)); padding: var(--spacing-4) 0; gap: var(--spacing-6); }
.chat-sidebar { width: 300px; border-right: 1px solid var(--color-border); padding-right: var(--spacing-4); }
.chat-thread { padding: var(--spacing-3); border-radius: var(--radius-md); cursor: pointer; margin-bottom: var(--spacing-2); }
.chat-thread.active { background: var(--color-bg-subtle); font-weight: 500; }
.chat-main { flex-grow: 1; display: flex; flex-direction: column; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.chat-header { padding: var(--spacing-4); border-bottom: 1px solid var(--color-border); background: var(--color-bg-base); }
.chat-messages { flex-grow: 1; padding: var(--spacing-4); display: flex; flex-direction: column; gap: var(--spacing-4); overflow-y: auto; }
.message { padding: var(--spacing-3) var(--spacing-4); border-radius: var(--radius-xl); max-width: 70%; }
.message.received { background: var(--color-bg-subtle); align-self: flex-start; }
.message.sent { background: var(--color-primary); color: white; align-self: flex-end; }
.chat-input-area { padding: var(--spacing-4); border-top: 1px solid var(--color-border); display: flex; gap: var(--spacing-2); }
.chat-input { flex-grow: 1; padding: var(--spacing-3); border: 1px solid var(--color-border); border-radius: var(--radius-full); }
.chat-send { padding: 0 var(--spacing-6); background: var(--color-accent); color: var(--color-primary); border-radius: var(--radius-full); font-weight: 600; }
@media (max-width: 768px) { .chat-sidebar { display: none; } }`,

  'src/App.jsx': `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import CreateListing from './pages/CreateListing';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/sell" element={<CreateListing />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
export default App;`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content);
}
console.log("Pages scaffold complete");
