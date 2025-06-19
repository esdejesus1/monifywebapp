import React, { useEffect } from 'react';

type ModalWrapperProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

const ModalWrapper: React.FC<ModalWrapperProps> = ({ open, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close modal"
        >
          &times;
        </button>
        {children ?? <p className="text-center">Modal Content</p>}
      </div>
    </div>
  );
};

export default ModalWrapper;
