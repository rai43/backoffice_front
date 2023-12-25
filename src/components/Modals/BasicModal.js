import React, { useEffect } from 'react';

import { disableScroll, enableScroll } from '../../utils/functions/preventAndAllowScroll';

const BasicModal = ({ isOpen, onClose, onProceed, children }) => {
  if (!isOpen) {
    return null;
  }

  useEffect(() => {
    disableScroll();
  }, []);

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box">
        {children}

        <div className="modal-action">
          <button className="btn btn-sm btn-outline btn-primary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-sm btn-outline btn-secondary" onClick={onProceed}>
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicModal;
