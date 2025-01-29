import React from 'react';
import './Popup.css';
import { IoMdClose } from 'react-icons/io';

function Popup({ title, content, onClose, controls }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          <IoMdClose />
        </button>
        <h4>{title}</h4>
        <div>{content}</div>
        <div className="popup-controls">
          {controls}  {/* Пользовательские кнопки */}
        </div>
      </div>
    </div>
  );
}

export default Popup;
