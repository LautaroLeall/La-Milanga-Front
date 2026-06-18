import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import '../styles/components/Modal.css';

const Modal = ({ title, onClose, children }) => {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay anim-fade" onClick={onClose}>
      <div className="modal-box anim-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
