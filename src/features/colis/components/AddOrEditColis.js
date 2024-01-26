import React, { useState } from 'react';

import Modal from 'react-modal';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

const AddOrEditColis = ({ extraObject, onFieldChange, livreursPromise, index, errors }) => {
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const handleImageClick = () => {
    setIsImageZoomed(true);
  };

  const handleZoomClose = () => {
    setIsImageZoomed(false);
  };

  // Function to get input classes based on error state
  const getInputClass = (fieldName) => {
    const baseClass = 'input input-bordered input-sm w-full';
    return errors[fieldName] ? `${baseClass} border-red-500 bg-red-100` : baseClass;
  };

  // Custom Menu for AsyncSelect
  const Menu = (props) => {
    return <components.Menu {...props}>{props.children}</components.Menu>;
  };

  // Custom styles for AsyncSelect
  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: 30,
      maxWidth: '100%' // Set the maxWidth to 100% to take full width
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: 4
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: 4
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0px 6px'
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0
    }),
    menu: (base) => ({
      ...base,
      marginBottom: '4rem',
      width: '100%', // Set the width to 100% to take full width
      maxWidth: '100%' // Set the maxWidth to 100% to take full width
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999 // Use a high z-index value to ensure the menu is above other elements
    })
    // Additional styles can be added as needed
  };

  return (
    <div className="mb-5 overflow-hidden rounded-lg shadow">
      <div className="flex">
        <div className={extraObject.photo ? 'w-1/2 p-4' : 'w-full p-4'}>
          <div
            className={
              extraObject.photo
                ? 'grid grid-cols-1 gap-4'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4'
            }>
            <div>
              <div className="text-gray-600 text-sm font-semibold">Pickup Livreur</div>
              <AsyncSelect
                maxMenuHeight={90}
                cacheOptions
                defaultOptions
                loadOptions={livreursPromise}
                styles={customStyles}
                onChange={({ value }) => onFieldChange(index, 'pickup_livreur_id', value)}
                defaultValue={() => {
                  if (extraObject?.pickup_livreur !== null) {
                    return {
                      label: `${extraObject?.pickup_livreur?.first_name} ${extraObject?.pickup_livreur?.last_name} (${extraObject?.pickup_livreur?.whatsapp})`,
                      value: extraObject?.pickup_livreur?.id
                    };
                  }
                }}
                components={{ MenuPortal: Menu }}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
              />
            </div>
            <div>
              <div className="text-gray-600 text-sm font-semibold">Delivery Livreur</div>
              <AsyncSelect
                maxMenuHeight={90}
                cacheOptions
                defaultOptions
                loadOptions={livreursPromise}
                styles={customStyles}
                onChange={({ value }) => onFieldChange(index, 'delivery_livreur_id', value)}
                defaultValue={() => {
                  if (extraObject?.delivery_livreur !== null) {
                    return {
                      label: `${extraObject?.delivery_livreur?.first_name} ${extraObject?.delivery_livreur?.last_name} (${extraObject?.delivery_livreur?.whatsapp})`,
                      value: extraObject?.delivery_livreur?.id
                    };
                  }
                }}
                components={{ MenuPortal: Menu }}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
              />
            </div>
            <div>
              <div className="text-gray-600 text-sm font-semibold">Delivery Phone Number</div>
              <input
                type="text"
                value={extraObject.delivery_phone_number}
                className={getInputClass('delivery_phone_number')}
                onChange={(e) => onFieldChange(index, 'delivery_phone_number', e.target.value)}
              />
            </div>
            <div>
              <div className="text-gray-600 text-sm font-semibold">Delivery Address Name</div>
              <input
                type="text"
                value={extraObject.delivery_address_name}
                className={getInputClass('delivery_address_name')}
                onChange={(e) => onFieldChange(index, 'delivery_address_name', e.target.value)}
              />
            </div>
            <div>
              <div className="text-gray-600 text-sm font-semibold">Price</div>
              <input
                type="number"
                value={extraObject.price}
                className={getInputClass('price')}
                onChange={(e) => onFieldChange(index, 'price', e.target.value)}
              />
            </div>
            <div>
              <div className="text-gray-600 text-sm font-semibold">Fee</div>
              <input
                type="number"
                value={extraObject.fee}
                className={getInputClass('fee')}
                onChange={(e) => onFieldChange(index, 'fee', e.target.value)}
              />
            </div>
            <div>
              <div className="text-gray-600 text-sm font-semibold">Fee Payment</div>
              <select
                className={`select select-bordered select-sm w-full ${
                  errors['fee_payment'] ? 'border-red-500 bg-red-100' : ''
                } `}
                value={extraObject.fee_payment}
                onChange={(e) => onFieldChange(index, 'fee_payment', e.target.value)}>
                <option value="" disabled={true} selected={true}>
                  Payment Method
                </option>
                <option value="POSTPAID">POSTPAID</option>
                <option value="PREPAID">PREPAID</option>
              </select>
            </div>
          </div>
        </div>
        {extraObject.photo && (
          // Display the image on the right
          <div className="w-1/2 p-4">
            <div className="col-span-1 md:col-span-1 flex items-center justify-center">
              <div
                className="w-full h-[30rem] bg-cover bg-center rounded-lg cursor-pointer"
                style={{ backgroundImage: `url('${extraObject.photo}')` }}
                onClick={handleImageClick}
              />
            </div>
            {isImageZoomed && (
              <div
                onClick={handleZoomClose}
                className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
                <img className="max-w-full max-h-full" src={extraObject.photo} alt="Zoomed Colis" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOrEditColis;

const ZoomImageModal = ({ isOpen, imageUrl, onRequestClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Zoomed Image"
      className="modal"
      overlayClassName="overlay">
      <div className="modal-content">
        <img src={imageUrl} alt="Zoomed" />
        <button onClick={onRequestClose}>Close</button>
      </div>
    </Modal>
  );
};
