import React from 'react';
import './Card.css';
export const Card = ({ children, className = '' }) => <div className={`card ${className}`}>{children}</div>;