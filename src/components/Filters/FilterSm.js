import React from 'react';

const FilterSm = ({ title, filterStatus, onOpenFilter, actionButton, children }) => {
  const handleOkayClicked = () => {
    onOpenFilter((oldValue) => !oldValue);
  };
  return (
    <div className={`${filterStatus ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
      <div className="modal-box">
        {/*<h3 className="font-bold text-lg">{title}</h3>*/}
        <div className="py-4">{children}</div>
        <div className="modal-action">
          {actionButton}
          <button className="btn btn-sm btn-outline" onClick={handleOkayClicked}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSm;
