import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/arenago-beach-tennis-logo.svg';

export default function Brand({ compact = false, to = '/', className = '', onClick }) {
  return (
    <Link className={`brand${compact ? ' brand--compact' : ''}${className ? ` ${className}` : ''}`} to={to} aria-label="ArenaGo — início" onClick={onClick}>
      <img className="brand-mark" src={logo} alt="" aria-hidden="true" />
      <span className="brand-name">arena<span>go</span></span>
    </Link>
  );
}
