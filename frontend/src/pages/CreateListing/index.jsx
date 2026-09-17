import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import './CreateListing.css';

export default function CreateListing() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState('SELL');
  
  return (
    <div className="container create-listing">
      <div className="form-header">
        <h1>Create Listing</h1>
        <div className="steps-indicator">Step {step} of 3</div>
      </div>
      
      <div className="card listing-form-card">
        <form className="listing-form" onSubmit={(e) => { e.preventDefault(); if (step < 3) setStep(step + 1); else alert('Listing published!'); }}>
          
          {step === 1 && (
            <div className="form-step">
              <h2>Item Details</h2>
              <div className="form-group">
                <label>Transaction Type</label>
                <div className="type-toggle">
                  <Button variant={type === 'SELL' ? 'primary' : 'outline'} onClick={() => setType('SELL')} type="button" className="flex-1">Sell</Button>
                  <Button variant={type === 'RENT' ? 'primary' : 'outline'} onClick={() => setType('RENT')} type="button" className="flex-1">Rent</Button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-input" placeholder="What are you listing?" required />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select className="form-input" required>
                   <option value="">Select Category</option>
                   <option value="Books">Books</option>
                   <option value="Electronics">Electronics</option>
                   <option value="Hostel">Hostel Essentials</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>Pricing & Description</h2>
              {type === 'SELL' ? (
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" className="form-input" placeholder="e.g. 500" required />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Price per day (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 50" required />
                  </div>
                  <div className="form-group">
                    <label>Security Deposit (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 500" required />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows="4" placeholder="Describe condition, reasons for selling, etc." required></textarea>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h2>Photos</h2>
              <div className="upload-area">
                 <p>Click or drag photos here.</p>
                 <span className="text-muted text-sm">Add up to 5 photos</span>
              </div>
            </div>
          )}

          <div className="form-actions border-top">
            {step > 1 && <Button variant="outline" type="button" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 3 ? (
               <Button variant="primary" type="submit" className="ml-auto">Next</Button>
            ) : (
               <Button variant="accent" type="submit" className="ml-auto">Publish Listing</Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}