import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { chatAPI } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MapPin, User, Clock, ShieldCheck, MessageSquare, AlertCircle, Info, X } from 'lucide-react';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [showMockNotice, setShowMockNotice] = useState(false);

  useEffect(() => {
    api.getProduct(id).then(setProduct);
  }, [id]);

  const handleChatWithSeller = async () => {
    setChatError(null);

    // If user is not authenticated, prompt them to log in
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    // Check if product has a genuine registered seller account ID
    const sellerId = product.seller_id || product.sellerId || (typeof product.seller === 'object' ? product.seller.id : null);

    if (!sellerId) {
      // Mock listing limitation: do not fabricate seller IDs or fake accounts
      setShowMockNotice(true);
      return;
    }

    // Prevent user from starting conversation with themselves
    if (user.id === sellerId) {
      setChatError("You cannot message yourself about your own listing.");
      return;
    }

    try {
      setLoadingChat(true);
      const conversation = await chatAPI.createOrGetConversation({
        other_user_id: sellerId,
        listing_id: product.id,
        listing_title: product.title,
        listing_image: product.images?.[0] || null
      });
      navigate(`/chat?conv=${conversation.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setChatError(err.error || err.detail || 'Failed to start conversation with seller.');
    } finally {
      setLoadingChat(false);
    }
  };

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
            <strong className="seller-name">{typeof product.seller === 'string' ? product.seller : product.seller?.username} {product.verified && <ShieldCheck size={16} className="text-success"/>}</strong>
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

        {chatError && (
          <div style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: 'var(--font-size-sm)'
          }}>
            <AlertCircle size={16} />
            <span>{chatError}</span>
          </div>
        )}

        <div className="pdetails-actions border-top">
          <Button 
            variant="primary" 
            className="w-full btn-lg"
            onClick={handleChatWithSeller}
            disabled={loadingChat}
          >
            <MessageSquare size={18} style={{marginRight: '0.5rem'}} />
            {loadingChat ? 'Connecting...' : 'Chat with Seller'}
          </Button>
          <Button variant="outline" className="btn-lg">♡ Save</Button>
        </div>

        {showMockNotice && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowMockNotice(false)} 
              style={{position: 'absolute', top: '0.75rem', right: '0.75rem', cursor: 'pointer', color: 'var(--color-text-muted)'}}
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.75rem'}}>
              <Info size={20} color="var(--color-primary)" style={{flexShrink: 0, marginTop: '2px'}} />
              <div>
                <strong style={{display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-main)'}}>
                  Demonstration Mock Listing
                </strong>
                <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>
                  Direct messaging is unavailable for this demo catalog item because it is not linked to a registered student account.
                  Real marketplace listings with student user IDs support instantaneous real-time messaging.
                </p>
                <Link to="/chat" style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline'}}>
                  Open Chat Inbox &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
