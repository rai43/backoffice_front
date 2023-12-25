// import React, { useState } from 'react';
//
// const AddOrEditColis = ({ extraObject, onFormChange, onFieldChange, closeModal, index }) => {
//   const [showZoomedImage, setShowZoomedImage] = useState(false);
//   const hasPhoto = extraObject?.photo;
//   console.log({ extraObject });
//
//   const handleImageClick = () => {
//     setShowZoomedImage(true);
//   };
//
//   const closeZoomedImage = () => {
//     setShowZoomedImage(false);
//   };
//
//   return (
//     <div className={`mb-5 ${hasPhoto ? 'grid md:grid-cols-3 gap-3' : ''}`}>
//       {hasPhoto && (
//         <div className="photo-container flex justify-center items-center p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
//           <img
//             src={extraObject?.photo}
//             alt="Colis"
//             className="min-w-0 w-full max-h-60 object-cover rounded cursor-pointer" // Adjust width here
//             onClick={handleImageClick}
//           />
//         </div>
//       )}
//       <div
//         className={`p-4 border border-gray-300 rounded-lg bg-gray-50 ${
//           hasPhoto ? 'col-span-2' : 'md:grid-cols-4'
//         }`}>
//         {renderFormData(extraObject, onFieldChange, index)}
//       </div>
//
//       {showZoomedImage && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
//           onClick={closeZoomedImage}>
//           <img
//             src={extraObject?.photo}
//             alt="Zoomed Colis"
//             className="max-w-full max-h-full object-contain rounded"
//           />
//         </div>
//       )}
//     </div>
//   );
// };
//
// const renderFormData = (extraObject, onFieldChange, index) => (
//   // <div className="grid md:grid-cols-4 gap-3 border border-primary ">
//   <div className="mb-5">
//     <div className="grid md:grid-cols-4 gap-3 mb-[3rem]">
//       <div className={`form-control w-full`}>
//         <label className="label">
//           <span className={'label-text text-base-content '}>Delivery Phone Number</span>
//         </label>
//         <input
//           type="text"
//           value={extraObject.delivery_phone_number}
//           className="input input-sm input-bordered w-full"
//           onChange={(e) => onFieldChange(index, 'delivery_phone_number', e.target.value)}
//         />
//       </div>
//       <div className={`form-control col-span-3 w-full`}>
//         <label className="label">
//           <span className={'label-text text-base-content '}>Delivery Address Name</span>
//         </label>
//         <input
//           type="text"
//           value={extraObject.delivery_address_name}
//           className="input input-sm input-bordered w-full"
//           onChange={(e) => onFieldChange(index, 'delivery_address_name', e.target.value)}
//         />
//       </div>
//       <div className={`form-control col-span-1 w-full`}>
//         <label className="label">
//           <span className={'label-text text-base-content '}>Price</span>
//         </label>
//         <input
//           type="number"
//           value={extraObject.price}
//           className="input input-sm input-bordered w-full"
//           onChange={(e) => onFieldChange(index, 'price', e.target.value)}
//         />
//       </div>
//       <div className={`form-control col-span-1 w-full`}>
//         <label className="label">
//           <span className={'label-text text-base-content '}>Fee</span>
//         </label>
//         <input
//           type="number"
//           value={extraObject.fee}
//           className="input input-sm input-bordered w-full"
//           onChange={(e) => onFieldChange(index, 'fee', e.target.value)}
//         />
//       </div>
//       <div className={`form-control col-span-2 w-full`}>
//         <label className="label">
//           <span className={'label-text text-base-content '}>Fee Payment</span>
//         </label>
//         <select
//           className="select select-sm select-bordered w-full"
//           value={extraObject?.fee_payment}
//           onChange={(e) => onFieldChange(index, 'fee_payment', e.target.value)}>
//           <option value={'POSTPAID'}>POSTPAID</option>
//           <option value={'PREPAID'}>PREPAID</option>
//         </select>
//       </div>
//     </div>
//   </div>
//   // </div>
// );
//
// export default AddOrEditColis;

import React from 'react';

import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

import { FaCopy } from 'react-icons/fa';

const AddOrEditColis = ({ extraObject, onFieldChange, livreursPromise, index, errors }) => {
  console.log({ extraObject });
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
      maxWidth: '20vh'
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
      width: '30vh'
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999 // Use a high z-index value to ensure the menu is above other elements
    })
    // Additional styles can be added as needed
  };

  return (
    <div className="mb-5 overflow-hidden rounded-lg shadow">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Pickup Livreur
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Delivery Livreur
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Delivery Phone Number
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Delivery Address Name
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Price
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fee
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fee Payment
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
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
                menuPosition={'fixed'} // To render menu in a fixed position
              />
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
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
                menuPosition={'fixed'} // To render menu in a fixed position
              />
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <input
                type="text"
                value={extraObject.delivery_phone_number}
                className={getInputClass('delivery_phone_number')}
                onChange={(e) => onFieldChange(index, 'delivery_phone_number', e.target.value)}
              />
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <input
                type="text"
                value={extraObject.delivery_address_name}
                className={getInputClass('delivery_address_name')}
                onChange={(e) => onFieldChange(index, 'delivery_address_name', e.target.value)}
              />
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <input
                type="number"
                value={extraObject.price}
                className={getInputClass('price')}
                onChange={(e) => onFieldChange(index, 'price', e.target.value)}
              />
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <input
                type="number"
                value={extraObject.fee}
                className={getInputClass('fee')}
                onChange={(e) => onFieldChange(index, 'fee', e.target.value)}
              />
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AddOrEditColis;
