const fs = require('fs');
const path = require('path');

const files = {
  'src/data/mockProducts.js': `export const mockProducts = [
  { id: 1, title: 'Engineering Mathematics Book', price: 250, category: 'Books', condition: 'Good', type: 'SELL', campus: 'Delhi Campus', location: 'Hostel A', seller: 'Rahul', verified: true, images: ['https://placehold.co/400x300?text=Math+Book'], description: 'Used for one semester. Great condition.' },
  { id: 2, title: 'Casio fx-991ES Plus', price: 700, category: 'Electronics', condition: 'Like New', type: 'SELL', campus: 'Delhi Campus', location: 'Hostel B', seller: 'Aman', verified: true, images: ['https://placehold.co/400x300?text=Calculator'], description: 'Hardly used.' },
  { id: 3, title: 'Scientific Calculator', rentalPrice: 30, deposit: 300, category: 'Electronics', condition: 'Good', type: 'RENT', campus: 'Mumbai Campus', location: 'Hostel XYZ', seller: 'Sneha', verified: true, images: ['https://placehold.co/400x300?text=Rent+Calc'], description: 'Available for exams.' },
  { id: 4, title: 'Mountain Bike', price: 2500, category: 'Cycles', condition: 'Fair', type: 'SELL', campus: 'Delhi Campus', location: 'Main Gate', seller: 'Vikram', verified: false, images: ['https://placehold.co/400x300?text=Bike'], description: 'Needs a new tube.' },
];`,

  'src/data/mockUsers.js': `export const mockUser = { name: 'Aman', verified: true, university: 'Delhi Campus', hostel: 'Hostel B', memberSince: '2025', rating: 4.8 };`,
  
  'src/services/api.js': `import { mockProducts } from '../data/mockProducts';
export const api = {
  getProducts: async () => mockProducts,
  getProduct: async (id) => mockProducts.find(p => p.id === parseInt(id)),
};`,

  'src/components/common/Button.jsx': `import React from 'react';
import './Button.css';
export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  return <button className={\`btn btn-\${variant} \${className}\`} {...props}>{children}</button>;
};`,

  'src/components/common/Button.css': `.btn { padding: 0.5rem 1rem; border-radius: var(--radius-md); font-weight: 500; transition: all 0.2s; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover { background: var(--color-primary-light); }
.btn-accent { background: var(--color-accent); color: var(--color-primary); }
.btn-accent:hover { background: var(--color-accent-hover); }
.btn-outline { border: 1px solid var(--color-border); background: transparent; }
.btn-outline:hover { background: var(--color-bg-subtle); }`,

  'src/components/common/Card.jsx': `import React from 'react';
import './Card.css';
export const Card = ({ children, className = '' }) => <div className={\`card \${className}\`}>{children}</div>;`,

  'src/components/common/Card.css': `.card { background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; transition: box-shadow 0.2s; }
.card:hover { box-shadow: var(--shadow-md); }`,

  'src/components/common/Badge.jsx': `import React from 'react';
import './Badge.css';
export const Badge = ({ children, type = 'default' }) => <span className={\`badge badge-\${type}\`}>{children}</span>;`,

  'src/components/common/Badge.css': `.badge { padding: 0.125rem 0.375rem; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 600; }
.badge-sell { background: var(--color-info); color: white; }
.badge-rent { background: var(--color-warning); color: white; }
.badge-default { background: var(--color-bg-subtle); color: var(--color-text-muted); }`,

  'src/components/layout/Navbar.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageSquare, PlusSquare, User, Heart } from 'lucide-react';
import './Navbar.css';
export const Navbar = () => (
  <nav className="navbar">
    <div className="container nav-container">
      <Link to="/" className="nav-logo">Sasta OLX</Link>
      <div className="nav-links desktop-only">
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/requests">Requests</Link>
      </div>
      <div className="nav-actions desktop-only">
        <Link to="/sell" className="nav-btn"><PlusSquare size={20}/> Sell</Link>
        <Link to="/chat" className="nav-btn"><MessageSquare size={20}/></Link>
        <Link to="/profile" className="nav-btn"><User size={20}/></Link>
      </div>
    </div>
  </nav>
);`,

  'src/components/layout/Navbar.css': `.navbar { background: var(--color-bg-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 100; height: var(--navbar-height); display: flex; align-items: center; }
.nav-container { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.nav-logo { font-size: var(--font-size-xl); font-weight: 700; color: var(--color-primary); }
.nav-links { display: flex; gap: var(--spacing-6); }
.nav-actions { display: flex; gap: var(--spacing-4); align-items: center; }
.nav-btn { display: flex; align-items: center; gap: 0.25rem; color: var(--color-text-main); }
@media (max-width: 768px) { .desktop-only { display: none; } }`,

  'src/pages/Home/index.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import './Home.css';
export default function Home() {
  return (
    <div className="home">
      <section className="hero container">
        <h1 className="hero-title">Your campus. Your marketplace.</h1>
        <p className="hero-subtitle">Buy, sell and rent things from verified students around you.</p>
        <div className="hero-cta">
          <Link to="/marketplace"><Button variant="accent">Explore Marketplace</Button></Link>
          <Link to="/sell"><Button variant="primary">Sell Something</Button></Link>
        </div>
      </section>
    </div>
  );
}`,

  'src/pages/Home/Home.css': `.hero { padding: var(--spacing-16) 0; text-align: center; }
.hero-title { font-size: var(--font-size-4xl); color: var(--color-primary); margin-bottom: var(--spacing-4); }
.hero-subtitle { font-size: var(--font-size-xl); color: var(--color-text-muted); margin-bottom: var(--spacing-8); }
.hero-cta { display: flex; justify-content: center; gap: var(--spacing-4); }`,

  'src/App.jsx': `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
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
console.log("Scaffold complete");
