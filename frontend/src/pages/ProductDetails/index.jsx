import React, { useState, useEffect } from 'react';
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
             <img key={i} src={img} alt={`${product.title} ${i}`} className="gallery-img" />
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
}