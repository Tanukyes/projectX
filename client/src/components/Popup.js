import React from 'react';
import './Popup.css';

function Popup({ title, content, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h4>{title}</h4>
        <div>{content}</div>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

export default Popup;
