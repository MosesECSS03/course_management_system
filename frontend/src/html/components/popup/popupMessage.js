import React, { Component } from "react";
import '../../../css/popup/popup.css'; // Import CSS for popup styles

class Popup extends Component {
  render() {
    const { message, isOpen, onClose, type } = this.props;

    if (!isOpen) return null;

    const popupTypeClass = `popup-content ${type}`;

    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className={popupTypeClass} onClick={(e) => e.stopPropagation()}>
          {type === "loading" ? (
            // Layout for loading type
            <div className="loading-popup">
              <h2>{message}</h2>
              <div className="bouncing-circles">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
              </div>
            </div>
          ) : (
            // Layout for other types
            <>
              <span className="close-btn" onClick={onClose}>&times;</span>
              <p>{message}</p>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default Popup;
