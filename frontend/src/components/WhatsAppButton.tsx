import React from 'react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  mode?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber, mode }) => {
  if (!phoneNumber || mode !== 'manual') return null;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <button
      style={{
        position: 'fixed',
        zIndex: 999,
        bottom: '20px',
        right: '20px',
        background: 'none',
        border: 'none',
      }}
      className="btns btn-successx mr-2"
      onClick={handleWhatsAppClick}
    >
      <img style={{ width: '75px' }} src="/wp_support.webp" alt="WhatsApp Support" />
    </button>
  );
};

export default WhatsAppButton;
