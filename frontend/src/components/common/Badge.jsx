import React from 'react';
import './Badge.css';
export const Badge = ({ children, type = 'default' }) => <span className={`badge badge-${type}`}>{children}</span>;