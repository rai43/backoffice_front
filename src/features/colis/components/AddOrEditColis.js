import React, { useState, useEffect } from 'react';

import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';
import Modal from 'react-modal';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

const zonesOptions = [
  { value: '', label: 'Select a Zone' },
  { value: 'Abobo', label: 'Abobo & Anyama' },
  { value: 'Angre', label: 'Angre & 2 Plateaux' },
  { value: 'Bingerville', label: 'Bingerville & Riviera' },
  { value: 'Adjame', label: 'Cocody Centre & Plateau & Adjame' },
  { value: 'AbidjanSud', label: 'Grand Abidjan Sud' },
  { value: 'Yopougnon', label: 'Grand Yopougnon' }
];

// {
//     Bingerville: 213, // Maïk Maurel Derou
//     Abobo: 598, // Kacou Marc Junior
//     Yopougnon: 538, // Dje Bi Clovis
//     AbidjanSud: 594, // Moussa Sylla
//     Angre: 263, // Benoît Sib
//     Adjame: 492 // Yao Alphonse Kounan
//   },

const AddOrEditColis = ({
  extraObject,
  onFieldChange,
  livreursPromise,
  index,
  errors,
  onDeliveryPlacesChanged,
  onDeliverySBLoad
}) => {
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    if (extraObject?.active_assignment) {
      onFieldChange(0, 'pickup_livreur_id', extraObject?.active_assignment?.livreur?.id);
    } else {
      onFieldChange(0, 'pickup_livreur_id', '');
      onFieldChange(0, 'delivery_livreur_id', '');
    }
  }, []);

  const handleImageClick = () => {
    setIsImageZoomed(true);
  };

  const handleZoomClose = () => {
    setIsImageZoomed(false);
  };

  // Function to get input classes based on error state
  const getInputClass = (fieldName, type = 'text') => {
    console.log({ errors });
    let baseClass = 'input input-bordered input-sm w-full';
    if (type === 'select') {
      baseClass = 'select select-bordered select-sm w-full';
    }
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

  console.log({ extraObject });

  return (
    <div className="mb-5 overflow-hidden rounded-lg shadow">
      <div className="flex">
        <div className={extraObject.photo ? 'w-1/2 p-4' : 'w-full p-4'}>
          <div
            className={
              extraObject.photo
                ? 'grid grid-cols-1 gap-4'
                : `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
                    extraObject?.active_assignment ? 'xl:grid-cols-7' : 'xl:grid-cols-7'
                  } gap-4`
            }>
            <div
              className={`${extraObject?.active_assignment ? 'xl:col-span-2' : 'xl:grid-cols-7'}`}>
              <div className="text-gray-600 text-sm font-semibold">
                {extraObject?.active_assignment ? 'Ongoing Assignment Livreur' : 'Pickup Livreur'}
              </div>
              {extraObject?.active_assignment ? (
                <AsyncSelect
                  maxMenuHeight={90}
                  cacheOptions
                  defaultOptions
                  loadOptions={livreursPromise}
                  styles={customStyles}
                  onChange={({ value }) => onFieldChange(index, 'pickup_livreur_id', value)}
                  defaultValue={() => {
                    if (extraObject?.active_assignment !== null) {
                      return {
                        label: `${extraObject?.active_assignment?.livreur?.first_name} ${extraObject?.active_assignment?.livreur?.last_name} (${extraObject?.active_assignment?.livreur?.whatsapp})`,
                        value: extraObject?.active_assignment?.livreur?.id
                      };
                    }
                  }}
                  components={{ MenuPortal: Menu }}
                  menuPortalTarget={document.body}
                  menuPosition={'fixed'}
                />
              ) : (
                <select
                  className={getInputClass('pickup_livreur_id')}
                  onChange={(e) => onFieldChange(index, 'pickup_livreur_id', e.target.value)}>
                  {zonesOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label?.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {!extraObject?.active_assignment && (
              <>
                {extraObject?.delivery_livreur ? (
                  <div>
                    <div className="text-gray-600 text-sm font-semibold">Delivery Zone</div>
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
                            label: `${extraObject?.delivery_livreur?.livreur?.first_name} ${extraObject?.delivery_livreur?.livreur?.last_name} (${extraObject?.delivery_livreur?.livreur?.whatsapp})`,
                            value: extraObject?.delivery_livreur?.livreur?.id
                          };
                        }
                      }}
                      components={{ MenuPortal: Menu }}
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                    />
                  </div>
                ) : (
                  <>
                    {!extraObject?.pickup_livreur && (
                      <div>
                        <div className="text-gray-600 text-sm font-semibold">Delivery Zone</div>
                        <select
                          className={getInputClass('delivery_livreur_id')}
                          onChange={(e) =>
                            onFieldChange(index, 'delivery_livreur_id', e.target.value)
                          }>
                          {zonesOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label?.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
                {extraObject?.return_livreur && (
                  <div>
                    <div className="text-gray-600 text-sm font-semibold">Return Livreur</div>
                    <AsyncSelect
                      maxMenuHeight={90}
                      cacheOptions
                      defaultOptions
                      loadOptions={livreursPromise}
                      styles={customStyles}
                      onChange={({ value }) => onFieldChange(index, 'return_livreur_id', value)}
                      defaultValue={() => {
                        if (extraObject?.return_livreur !== null) {
                          return {
                            label: `${extraObject?.return_livreur?.livreur?.first_name} ${extraObject?.return_livreur?.livreur?.last_name} (${extraObject?.return_livreur?.livreur?.whatsapp})`,
                            value: extraObject?.return_livreur?.livreur?.id
                          };
                        }
                      }}
                      components={{ MenuPortal: Menu }}
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                    />
                  </div>
                )}
              </>
            )}

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
              {index === 0 ? (
                <>
                  {/*<div className="text-gray-600 text-sm font-semibold">Delivery Address Name</div>*/}
                  {/*<LoadScript*/}
                  {/*  googleMapsApiKey="AIzaSyBn8n_poccjk4WVSg31H0rIkU-u7a2lYg8"*/}
                  {/*  libraries={['places']}>*/}
                  <DeliveryAddress
                    index={index}
                    onDeliveryPlacesChanged={onDeliveryPlacesChanged}
                    onDeliverySBLoad={onDeliverySBLoad}
                    extraObject={extraObject}
                    getInputClass={getInputClass}
                    onFieldChange={onFieldChange}
                  />
                  {/*</LoadScript>*/}
                </>
              ) : (
                <DeliveryAddress
                  index={index}
                  onDeliveryPlacesChanged={onDeliveryPlacesChanged}
                  onDeliverySBLoad={onDeliverySBLoad}
                  extraObject={extraObject}
                  getInputClass={getInputClass}
                  onFieldChange={onFieldChange}
                />
              )}
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

const DeliveryAddress = ({
  index,
  onDeliveryPlacesChanged,
  onDeliverySBLoad,
  extraObject,
  getInputClass,
  onFieldChange
}) => {
  return (
    <>
      <div className="text-gray-600 text-sm font-semibold">Delivery Address Name</div>
      {/*<LoadScript googleMapsApiKey="AIzaSyBn8n_poccjk4WVSg31H0rIkU-u7a2lYg8" libraries={['places']}>*/}
      <StandaloneSearchBox
        onPlacesChanged={() => onDeliveryPlacesChanged(index)}
        onLoad={onDeliverySBLoad}>
        <input
          type="text"
          value={extraObject.delivery_address_name}
          className={getInputClass('delivery_address_name')}
          onChange={(e) => onFieldChange(index, 'delivery_address_name', e.target.value)}
        />
      </StandaloneSearchBox>
      {/*</LoadScript>*/}
    </>
  );
};

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
