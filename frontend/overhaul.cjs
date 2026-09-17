const fs = require('fs');
const path = require('path');

const files = {
  'src/index.css': `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

:root {
  --color-primary: #0A192F;
  --color-primary-light: #112240;
  --color-primary-dark: #020c1b;
  --color-accent: #a8ff3e;
  --color-accent-hover: #91e62a;
  --color-bg-base: #faf9f6;
  --color-bg-surface: #ffffff;
  --color-bg-subtle: #f0eee5;
  --color-text-main: #111827;
  --color-text-muted: #4b5563;
  --color-text-light: #9ca3af;
  --color-border: #e5e7eb;
  
  --font-family: 'Outfit', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;

  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  --max-width-desktop: 1200px;
  --navbar-height: 80px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-family); background-color: var(--color-bg-base); color: var(--color-text-main); line-height: 1.5; }
a { color: inherit; text-decoration: none; }
button { font-family: var(--font-family); border: none; background: none; cursor: pointer; }
input, textarea, select { font-family: var(--font-family); }
.container { max-width: var(--max-width-desktop); margin: 0 auto; padding: 0 var(--spacing-4); }
@media (min-width: 768px) { .container { padding: 0 var(--spacing-8); } }
`,

  'src/data/mockProducts.js': `export const mockProducts = [
  { id: 1, title: 'Engineering Mathematics Book', price: 250, category: 'Books', condition: 'Good', type: 'SELL', campus: 'Delhi Campus', location: 'Hostel A', seller: 'Rahul', verified: true, images: ['https://placehold.co/800x600?text=Math+Book', 'https://placehold.co/800x600?text=Back+Cover'], description: 'Used for one semester. Great condition.', postedAt: '2 days ago', views: 45 },
  { id: 2, title: 'Casio fx-991ES Plus', price: 700, category: 'Electronics', condition: 'Like New', type: 'SELL', campus: 'Delhi Campus', location: 'Hostel B', seller: 'Aman', verified: true, images: ['https://placehold.co/800x600?text=Calculator'], description: 'Hardly used.', postedAt: '1 day ago', views: 120 },
  { id: 3, title: 'Scientific Calculator', rentalPrice: 30, deposit: 300, category: 'Electronics', condition: 'Good', type: 'RENT', campus: 'Mumbai Campus', location: 'Hostel XYZ', seller: 'Sneha', verified: true, images: ['https://placehold.co/800x600?text=Rent+Calc'], description: 'Available for exams.', postedAt: '5 hours ago', views: 80 },
  { id: 4, title: 'Mountain Bike', price: 2500, category: 'Cycles', condition: 'Fair', type: 'SELL', campus: 'Delhi Campus', location: 'Main Gate', seller: 'Vikram', verified: false, images: ['https://placehold.co/800x600?text=Bike'], description: 'Needs a new tube.', postedAt: '1 week ago', views: 200 },
  { id: 5, title: 'Mini Cooler', rentalPrice: 50, deposit: 500, category: 'Hostel', condition: 'Good', type: 'RENT', campus: 'Delhi Campus', location: 'Hostel C', seller: 'Priya', verified: true, images: ['https://placehold.co/800x600?text=Cooler'], description: 'Perfect for summers.', postedAt: '3 days ago', views: 300 }
];`,

  'src/pages/Home/index.jsx': `import React from 'react';
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
             <Link to={\`/marketplace?cat=\${cat}\`} key={cat}>
               <Card className="category-card"><h3>{cat}</h3></Card>
             </Link>
          ))}
        </div>
      </section>
    </div>
  );
}`,

  'src/pages/Home/Home.css': `.hero { padding: var(--spacing-16) 0; background: linear-gradient(135deg, var(--color-bg-subtle) 0%, var(--color-bg-surface) 100%); text-align: center; }
.hero-container { max-width: 800px; }
.hero-title { font-size: var(--font-size-5xl); color: var(--color-primary); font-weight: 800; line-height: 1.1; margin-bottom: var(--spacing-6); }
.highlight { color: var(--color-accent-hover); -webkit-text-stroke: 1px var(--color-primary); text-shadow: 2px 2px 0 var(--color-primary); }
.hero-subtitle { font-size: var(--font-size-xl); color: var(--color-text-muted); margin-bottom: var(--spacing-8); }
.hero-cta { display: flex; justify-content: center; gap: var(--spacing-4); }
.hero-btn { padding: var(--spacing-3) var(--spacing-8); font-size: var(--font-size-lg); border-radius: var(--radius-full); }
.bg-white { background: var(--color-bg-surface); }
.section-title { text-align: center; font-size: var(--font-size-3xl); margin: var(--spacing-12) 0 var(--spacing-8); }
.category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-4); margin-bottom: var(--spacing-16); }
.category-card { padding: var(--spacing-8) var(--spacing-4); text-align: center; background: var(--color-bg-surface); transition: transform 0.2s, box-shadow 0.2s; }
.category-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--color-accent); }`,

  'src/pages/Marketplace/index.jsx': `import React, { useState, useEffect } from 'react';
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
          <Link to={\`/product/\${product.id}\`} key={product.id}>
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
}`,

  'src/pages/Marketplace/Marketplace.css': `.marketplace { display: flex; gap: var(--spacing-8); padding: var(--spacing-8) var(--spacing-4); }
.sidebar { width: 280px; flex-shrink: 0; background: var(--color-bg-surface); padding: var(--spacing-6); border-radius: var(--radius-xl); border: 1px solid var(--color-border); height: fit-content; }
.filter-group { margin-top: var(--spacing-4); }
.filter-group label { display: block; font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--spacing-2); color: var(--color-text-muted); }
.search-box { display: flex; align-items: center; gap: var(--spacing-2); border: 1px solid var(--color-border); padding: var(--spacing-2) var(--spacing-3); border-radius: var(--radius-md); }
.search-box input { border: none; outline: none; width: 100%; }
.filters { display: flex; gap: var(--spacing-2); flex-wrap: wrap; }
.product-grid { flex-grow: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--spacing-6); }
.product-card { transition: transform 0.2s, box-shadow 0.2s; border-radius: var(--radius-xl); overflow: hidden; }
.product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--color-accent); }
.product-image-wrap { position: relative; }
.product-image { width: 100%; height: 200px; object-fit: cover; }
.badge-overlay { position: absolute; top: var(--spacing-3); right: var(--spacing-3); }
.product-info { padding: var(--spacing-4); }
.product-title { margin: 0 0 var(--spacing-1); font-size: var(--font-size-lg); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-price { font-weight: 800; color: var(--color-primary); font-size: var(--font-size-2xl); margin-bottom: var(--spacing-2); }
.product-meta { display: flex; justify-content: space-between; color: var(--color-text-light); font-size: var(--font-size-xs); font-weight: 500; }
@media (max-width: 768px) { .marketplace { flex-direction: column; } .desktop-only { display: none; } }`,

  'src/pages/ProductDetails/index.jsx': `import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MapPin, User, Clock, ShieldCheck } from 'lucide-react';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.getProduct(id).then(setProduct);
  }, [id]);

  if (!product) return <div className="container" style={{padding: '4rem'}}>Loading...</div>;

  return (
    <div className="container pdetails">
      <div className="pdetails-gallery">
        <div className="gallery-scroll">
          {product.images.map((img, i) => (
             <img key={i} src={img} alt={\`\${product.title} \${i}\`} className="gallery-img" />
          ))}
        </div>
      </div>
      <div className="pdetails-info-col">
        <div className="pdetails-header">
           <Badge type={product.type.toLowerCase()}>{product.type}</Badge>
           <span className="pdetails-date"><Clock size={14}/> {product.postedAt}</span>
        </div>
        <h1 className="pdetails-title">{product.title}</h1>
        <div className="pdetails-price">
           ₹{product.price || product.rentalPrice} 
           {product.type === 'RENT' && <span className="price-suffix">/day</span>}
        </div>
        {product.type === 'RENT' && <div className="pdetails-deposit">Security Deposit: ₹{product.deposit}</div>}
        
        <div className="pdetails-seller card">
          <div className="seller-avatar"><User size={24}/></div>
          <div className="seller-info">
            <strong className="seller-name">{product.seller} {product.verified && <ShieldCheck size={16} className="text-success"/>}</strong>
            <div className="seller-meta"><MapPin size={14}/> {product.campus} - {product.location}</div>
          </div>
        </div>

        <div className="pdetails-desc card">
          <h3>Description</h3>
          <p>{product.description}</p>
          <div className="desc-meta">
             <strong>Condition:</strong> {product.condition} <br/>
             <strong>Category:</strong> {product.category}
          </div>
        </div>

        <div className="pdetails-actions border-top">
          <Link to="/chat" className="w-full"><Button variant="primary" className="w-full btn-lg">💬 Chat with Seller</Button></Link>
          <Button variant="outline" className="btn-lg">♡ Save</Button>
        </div>
      </div>
    </div>
  );
}`,

  'src/pages/ProductDetails/ProductDetails.css': `.pdetails { display: grid; grid-template-columns: 1fr 400px; gap: var(--spacing-8); padding: var(--spacing-8) var(--spacing-4); align-items: start; }
.pdetails-gallery { overflow: hidden; border-radius: var(--radius-2xl); border: 1px solid var(--color-border); background: var(--color-bg-surface); }
.gallery-scroll { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.gallery-scroll::-webkit-scrollbar { display: none; }
.gallery-img { scroll-snap-align: center; width: 100%; object-fit: cover; aspect-ratio: 4/3; flex-shrink: 0; }
.pdetails-info-col { display: flex; flex-direction: column; gap: var(--spacing-6); }
.pdetails-header { display: flex; justify-content: space-between; align-items: center; }
.pdetails-date { display: flex; align-items: center; gap: 4px; color: var(--color-text-light); font-size: var(--font-size-sm); font-weight: 500; }
.pdetails-title { margin: 0; font-size: var(--font-size-4xl); font-weight: 800; line-height: 1.2; }
.pdetails-price { font-size: var(--font-size-5xl); font-weight: 800; color: var(--color-primary); }
.price-suffix { font-size: var(--font-size-xl); color: var(--color-text-muted); font-weight: 600; }
.pdetails-deposit { background: var(--color-bg-subtle); padding: var(--spacing-2) var(--spacing-3); border-radius: var(--radius-md); font-weight: 600; color: var(--color-text-muted); display: inline-block; width: fit-content; }
.pdetails-seller { display: flex; gap: var(--spacing-4); align-items: center; padding: var(--spacing-4); }
.seller-avatar { width: 56px; height: 56px; background: var(--color-bg-subtle); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
.seller-name { display: flex; align-items: center; gap: 4px; font-size: var(--font-size-lg); }
.text-success { color: var(--color-success); }
.seller-meta { display: flex; align-items: center; gap: 4px; color: var(--color-text-muted); font-size: var(--font-size-sm); margin-top: 4px; }
.pdetails-desc { padding: var(--spacing-6); }
.pdetails-desc h3 { margin-bottom: var(--spacing-3); }
.desc-meta { margin-top: var(--spacing-4); padding-top: var(--spacing-4); border-top: 1px solid var(--color-border); font-size: var(--font-size-sm); color: var(--color-text-muted); line-height: 1.8; }
.pdetails-actions { display: flex; gap: var(--spacing-4); position: sticky; bottom: 0; padding-top: var(--spacing-4); background: var(--color-bg-base); z-index: 10; }
.w-full { width: 100%; flex: 1; }
.btn-lg { padding: var(--spacing-4) var(--spacing-6); font-size: var(--font-size-lg); }
@media (max-width: 1024px) { .pdetails { grid-template-columns: 1fr; } }`,

  'src/components/layout/Navbar.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, PlusSquare, User, Search, Bell } from 'lucide-react';
import './Navbar.css';
export const Navbar = () => (
  <nav className="navbar">
    <div className="container nav-container">
      <div className="nav-left">
        <Link to="/" className="nav-logo">
           <span className="logo-icon">S</span>
           Sasta OLX
        </Link>
        <div className="nav-links desktop-only">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/marketplace?cat=RENT">Rentals</Link>
          <Link to="/requests">Requests</Link>
        </div>
      </div>
      <div className="nav-actions desktop-only">
        <Link to="/sell" className="nav-btn-accent"><PlusSquare size={18}/> Sell</Link>
        <Link to="/chat" className="nav-icon-btn"><MessageSquare size={22}/></Link>
        <Link to="/notifications" className="nav-icon-btn"><Bell size={22}/></Link>
        <Link to="/profile" className="nav-icon-btn"><User size={22}/></Link>
      </div>
    </div>
  </nav>
);`,

  'src/components/layout/Navbar.css': `.navbar { background: var(--color-bg-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 100; height: var(--navbar-height); display: flex; align-items: center; }
.nav-container { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.nav-left { display: flex; align-items: center; gap: var(--spacing-8); }
.nav-logo { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-primary); display: flex; align-items: center; gap: var(--spacing-2); }
.logo-icon { background: var(--color-accent); color: var(--color-primary); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: var(--font-size-lg); }
.nav-links { display: flex; gap: var(--spacing-6); font-weight: 600; color: var(--color-text-muted); }
.nav-links a:hover { color: var(--color-primary); }
.nav-actions { display: flex; gap: var(--spacing-4); align-items: center; }
.nav-icon-btn { color: var(--color-text-muted); padding: var(--spacing-2); border-radius: 50%; transition: background 0.2s; display: flex; }
.nav-icon-btn:hover { background: var(--color-bg-subtle); color: var(--color-primary); }
.nav-btn-accent { display: flex; align-items: center; gap: var(--spacing-2); background: var(--color-primary); color: white; padding: var(--spacing-2) var(--spacing-4); border-radius: var(--radius-full); font-weight: 600; }
.nav-btn-accent:hover { background: var(--color-primary-light); }
@media (max-width: 768px) { .desktop-only { display: none; } }`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content);
}
console.log("Overhaul scaffold complete");
