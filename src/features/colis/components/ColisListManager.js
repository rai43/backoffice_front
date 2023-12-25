import React, { useCallback, useRef, useState } from 'react';

import flatpickr from 'flatpickr';
import moment from 'moment/moment';
import { useDispatch } from 'react-redux';

import { FaCopy } from 'react-icons/fa';
import { IoClose, IoAddSharp } from 'react-icons/io5';

import AddOrEditColis from './AddOrEditColis';
import { showNotification } from '../../common/headerSlice';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import { saveColisBulk, updateColis } from '../parcelsManagementSlice';

const ColisListManager = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();

  const pickupDateRef = useRef();

  const [colisGeneralInfo, setColisGeneralInfo] = useState({
    merchant_phone_number: extraObject?.colis?.client?.phone_number
      ? extraObject?.colis?.client?.phone_number
      : '',
    pickup_phone_number: extraObject?.colis?.pickup_phone_number
      ? extraObject?.colis?.pickup_phone_number
      : '',
    pickup_address_name: extraObject?.colis?.pickup_address_name
      ? extraObject?.colis?.pickup_address_name
      : '',
    pickup_date: extraObject?.colis?.pickup_date
      ? moment.utc(extraObject?.colis?.pickup_date).format('YYYY-MM-DD')
      : moment.utc().format('YYYY-MM-DD')
  });

  const [colisList, setColisList] = useState([
    {
      delivery_phone_number: extraObject?.colis?.delivery_phone_number
        ? extraObject?.colis?.delivery_phone_number
        : '',
      delivery_address_name: extraObject?.colis?.delivery_address_name
        ? extraObject?.colis?.delivery_address_name
        : '',
      fee: parseInt(extraObject?.colis?.fee ? extraObject?.colis?.fee : 0),
      fee_payment: extraObject?.colis?.fee_payment ? extraObject?.colis?.fee_payment : '',
      price: parseInt(extraObject?.colis?.price ? extraObject?.colis?.price : 0),
      photo: extraObject?.colis?.photo ? extraObject?.colis?.photo : '',
      pickup_livreur_id: extraObject?.colis?.pickup_livreur?.id
        ? extraObject?.colis?.pickup_livreur_id
        : '',
      delivery_livreur_id: extraObject?.colis?.delivery_livreur?.id
        ? extraObject?.colis?.delivery_livreur_id
        : '',
      pickup_livreur: extraObject?.colis?.pickup_livreur?.id
        ? extraObject?.colis?.pickup_livreur
        : null,
      delivery_livreur: extraObject?.colis?.delivery_livreur?.id
        ? extraObject?.colis?.delivery_livreur
        : null
    } /* initial data for a new colis */
  ]);

  // State to track errors for colis general information
  const [generalErrors, setGeneralErrors] = useState({});
  // State to track errors for each colis
  const [errorsList, setErrorsList] = useState([{}]);

  // Validate each field and update generalErrors
  const validateGeneralField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'merchant_phone_number':
        if (!isValidPhoneNumber(value) || value.length !== 10) {
          error = 'Invalid phone number';
        }
        break;
      case 'pickup_phone_number':
        if (!isValidPhoneNumber(value) || value.length !== 10) {
          error = 'Invalid phone number';
        }
        break;
      case 'pickup_address_name':
        if (!value) {
          error = 'Invalid pickup address name';
        }
        break;
      case 'pickup_date':
        if (!value) {
          error = 'Invalid pickup date';
        }
        break;
    }

    setGeneralErrors((prevErrors) => {
      let newErrors = { ...prevErrors };
      newErrors = { ...newErrors, [fieldName]: error };
      return newErrors;
    });

    return error;
  };

  // Validate each field and update errorsList
  const validateField = (index, fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'delivery_phone_number':
        if (!isValidPhoneNumber(value) || value.length !== 10) {
          error = 'Invalid phone number';
        }
        break;
      case 'delivery_address_name':
        if (!value.length) {
          error = 'Invalid delivery address name';
        }
        break;
      case 'fee':
        if (value === undefined || parseInt(value) <= 0) {
          error = 'Fee should be positive';
        }
        break;
      case 'fee_payment':
        if (value !== 'PREPAID' && value !== 'POSTPAID') {
          error = 'Fee payment should either be PREPAID or POSTPAID';
        }
        break;
      // ... other validation cases ...
    }

    setErrorsList((prevErrors) => {
      const newErrors = [...prevErrors];
      newErrors[index] = { ...newErrors[index], [fieldName]: error };
      return newErrors;
    });

    return error;
  };

  // Phone number validation function
  const isValidPhoneNumber = (phoneNumber) => {
    const pattern = /^\d+$/; // Regex to check if the string contains only digits
    return pattern.test(phoneNumber);
  };

  // Phone number validation function
  const isValidPrice = (price) => {
    const pattern = /^\d+$/; // Regex to check if the string contains only digits
    return pattern.test(price);
  };

  const addColis = () => {
    setColisList((oldList) => {
      return [
        ...oldList,
        {
          delivery_phone_number: '',
          delivery_address_name: '',
          fee: 0,
          fee_payment: '',
          price: 0,
          photo: '',
          pickup_livreur_id: '',
          delivery_livreur_id: '',
          pickup_livreur: null,
          delivery_livreur: null
        }
      ];
    });

    setErrorsList((prevErrors) => [...prevErrors, {}]);
  };

  // Function to update colisGeneralInfo fields
  const handleGeneralInfoChange = (fieldName, value) => {
    if (fieldName.includes('phone_number')) {
      if (!isValidPhoneNumber(value)) {
        return;
      }
    }

    setColisGeneralInfo((prevState) => ({
      ...prevState,
      [fieldName]: value
    }));

    validateGeneralField(fieldName, value); // Validate field and update errors
  };

  const onValueChange = (index, fieldName, value) => {
    if (fieldName.includes('phone_number')) {
      // Allow the field to be empty
      if (value === '') {
        setColisList((prevList) => {
          prevList[index][fieldName] = value;
          return [...prevList];
        });
        return;
      }
      if (!isValidPhoneNumber(value)) {
        return;
      }
    } else if (fieldName === 'fee' || fieldName === 'price') {
      // Allow the field to be empty
      if (value === '') {
        setColisList((prevList) => {
          prevList[index][fieldName] = 0;
          return [...prevList];
        });
        return;
      }
      // Remove leading zeros for non-empty fields
      value = value.replace(/^0+/, '');

      if (!isValidPrice(value)) {
        return;
      }
    }

    setColisList((prevList) => {
      prevList[index][fieldName] = value;
      return [...prevList];
    });

    validateField(index, fieldName, value); // Validate field and update errors
  };

  const removeColis = (index) => {
    setColisList((prevState) => prevState.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // validationFailed will be true if the forms validation has failed
    let validationFailed = false;

    const { merchant_phone_number, pickup_phone_number, pickup_address_name, pickup_date } =
      colisGeneralInfo;

    validateGeneralField('merchant_phone_number', merchant_phone_number); // Validate field and update errors
    validateGeneralField('pickup_phone_number', pickup_phone_number); // Validate field and update errors
    validateGeneralField('pickup_address_name', pickup_address_name); // Validate field and update errors
    validateGeneralField('pickup_date', pickup_date); // Validate field and update errors

    if (!merchant_phone_number || !pickup_phone_number || !pickup_address_name || !pickup_date) {
      dispatch(
        showNotification({
          message: 'General information form contains errors.',
          status: 0
        })
      );
      validationFailed = true;
    }

    let formPosition = 0;
    // Check if all required fields are set in each object in colisList
    for (const colis of colisList) {
      const { delivery_phone_number, delivery_address_name, fee, fee_payment, price } = colis;
      validateField(formPosition, 'delivery_phone_number', delivery_phone_number); // Validate field and update errors
      validateField(formPosition, 'delivery_address_name', delivery_address_name); // Validate field and update errors
      validateField(formPosition, 'fee_payment', fee_payment); // Validate field and update errors
      // validateField(formPosition, 'fee', fee); // Validate field and update errors

      if (
        !delivery_phone_number ||
        !delivery_address_name ||
        (!fee_payment && fee_payment === 'POSTPAID' && fee_payment === 'PREPAID')
        // || fee === undefined || fee <= 0
      ) {
        validationFailed = true;
      }

      formPosition++;
    }

    if (validationFailed) {
      dispatch(
        showNotification({
          message: 'Some forms contain errors.',
          status: 0
        })
      );
      return;
    }

    // Check for errors in all parcels
    const hasErrors = errorsList.some((errors) => Object.values(errors).some((error) => error));
    if (hasErrors) {
      dispatch(
        showNotification({
          message: 'Please correct errors before submitting.',
          status: 0
        })
      );
      return;
    }

    // Prepare the data for submission
    const parcelsData = colisList.map((colis) => ({
      ...colisGeneralInfo, // General information fields
      pickup_date: moment.utc(colisGeneralInfo?.pickup_date).format('YYYY-MM-DD'),
      ...colis // Specific colis fields
    }));

    try {
      let response;

      if (extraObject?.colis?.id) {
        // If an ID exists, update the existing parcel
        const updatedParcelData = { ...parcelsData[0], id: extraObject.colis.id };
        response = await dispatch(updateColis({ parcel: updatedParcelData }));
      } else {
        // Otherwise, create new parcels
        response = await dispatch(saveColisBulk({ parcels: parcelsData }));
      }

      if (response?.error) {
        dispatch(
          showNotification({
            message: 'Error while saving parcels information',
            status: 0
          })
        );
      } else {
        dispatch(
          showNotification({
            message: `Successfully ${
              extraObject?.colis?.id ? 'updated' : 'saved'
            } parcel information`,
            status: 1
          })
        );
        closeModal();
      }
    } catch (error) {
      console.error('Submission error:', error);
      dispatch(
        showNotification({
          message: 'An unexpected error occurred during submission',
          status: 0
        })
      );
    }
  };

  // Function to get input classes based on error state
  const getInputClass = (fieldName) => {
    const baseClass = 'input input-bordered input-sm w-full';
    return generalErrors[fieldName] ? `${baseClass} border-red-500 bg-red-100` : baseClass;
  };

  const duplicateColis = (index) => {
    setColisList((prevList) => {
      // Copy the colis object at the specified index
      const colisToDuplicate = { ...prevList[index] };
      // Insert the copied colis object into the list
      return [...prevList.slice(0, index + 1), colisToDuplicate, ...prevList.slice(index + 1)];
    });

    setErrorsList((prevErrors) => {
      // Copy the errors object at the specified index
      const errorsToDuplicate = { ...prevErrors[index] };
      // Insert the copied errors object into the errorsList
      return [...prevErrors.slice(0, index + 1), errorsToDuplicate, ...prevErrors.slice(index + 1)];
    });
  };

  const livreursPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      if (inputValue?.length >= 3) {
        dispatch(getLivreursBySearch({ searchPattern: inputValue })).then((res) =>
          resolve(
            (res?.payload.livreurs || [])
              .filter(
                (livreur) =>
                  livreur?.first_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.last_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.whatsapp?.toLowerCase()?.includes(inputValue.toLowerCase())
              )
              .map((livreur) => {
                return {
                  value: livreur.id,
                  label: `${livreur.first_name} ${livreur.last_name} (${livreur?.whatsapp})`
                };
              })
          )
        );
      } else {
        resolve([]);
      }
    });

  const inputPickupDateRef = useCallback((node) => {
    if (node !== null) {
      pickupDateRef.current = flatpickr(node, {
        enableTime: true,
        defaultDate: extraObject?.colis?.pickup_date
          ? moment.utc(extraObject?.colis?.pickup_date).format('YYYY-MM-DD')
          : moment.utc().format('YYYY-MM-DD'),
        dateFormat: 'Y-m-d',
        time_24hr: true,
        onChange: (date) => {
          handleGeneralInfoChange('pickup_date', date[0]);
        }
      });
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="mb-3 text-lg font-semibold text-gray-700">Sender General Information</h3>
        <div className="mb-5">
          <div className="grid md:grid-cols-4 gap-3">
            {/* Merchant Phone Number */}
            <div className={`form-control w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Merchant Phone Number</span>
              </label>
              <input
                type="text"
                value={colisGeneralInfo.merchant_phone_number}
                className={getInputClass('merchant_phone_number')}
                onChange={(e) => handleGeneralInfoChange('merchant_phone_number', e.target.value)}
              />
            </div>
            {/* Pickup Phone Number */}
            <div className={`form-control w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Pickup Phone Number</span>
              </label>
              <input
                type="text"
                value={colisGeneralInfo.pickup_phone_number}
                className={getInputClass('pickup_phone_number')}
                onChange={(e) => handleGeneralInfoChange('pickup_phone_number', e.target.value)}
              />
            </div>
            {/* Pickup Address Name */}
            <div className={`form-control col-span-1 w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Pickup Address Name</span>
              </label>
              <input
                type="text"
                value={colisGeneralInfo.pickup_address_name}
                className={getInputClass('pickup_address_name')}
                onChange={(e) => handleGeneralInfoChange('pickup_address_name', e.target.value)}
              />
            </div>
            <div className={`form-control w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Pickup Date</span>
              </label>
              <input
                type="date"
                className={getInputClass('pickup_date')}
                ref={inputPickupDateRef}
              />
            </div>
          </div>
        </div>
      </div>
      {colisList.map((colis, index) => (
        <div key={index} className="relative ">
          {!extraObject?.colis?.id ? (
            <button
              onClick={() => duplicateColis(index)}
              className="absolute top-2 right-20 flex items-center font-semibold text-gray-600"
              title="Remove">
              <FaCopy className="text-lg" />
              <span className="mx-2">Duplicate</span>
            </button>
          ) : (
            <></>
          )}

          {colisList?.length > 1 ? (
            <button
              onClick={() => removeColis(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-600"
              title="Remove">
              <IoClose size="1.5em" />
            </button>
          ) : (
            <></>
          )}

          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-lg font-semibold text-gray-700">Parcel Form #{index + 1}</h3>
            <AddOrEditColis
              index={index}
              extraObject={colis}
              onFieldChange={onValueChange}
              errors={errorsList[index]}
              livreursPromise={livreursPromiseOptions}
              closeModal={() => {
                /* logic to handle closing a colis */
              }}
            />
          </div>
        </div>
      ))}

      {!extraObject?.colis?.id ? (
        <div className="flex justify-end mt-4">
          <button
            className="p-2 rounded-full btn btn-ghost btn-outline btn-sm"
            onClick={addColis}
            aria-label="Add Parcel">
            <IoAddSharp />
          </button>
        </div>
      ) : (
        <></>
      )}

      <div className="mt-6">
        <button
          className={`w-full py-2 btn ${
            extraObject?.colis?.id ? 'btn-primary-content' : 'btn-secondary'
          } btn-outline`}
          onClick={handleSubmit}>
          {extraObject?.colis?.id ? 'Edit Parcel' : 'Submit Parcel(s)'}
        </button>
      </div>
    </div>
  );
};

export default ColisListManager;
