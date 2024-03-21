import React, { useCallback, useRef, useState, useEffect } from 'react';

import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';
import axios from 'axios';
import flatpickr from 'flatpickr';
import moment from 'moment/moment';
import { useDispatch } from 'react-redux';

import { FaCopy } from 'react-icons/fa';
import { IoClose, IoAddSharp } from 'react-icons/io5';

import AddOrEditColis from './AddOrEditColis';
import { showNotification } from '../../common/headerSlice';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import parcelsUtils from '../parcels.utils';
import { saveColisBulk, updateColis } from '../parcelsManagementSlice';

const ColisListManager = ({ extraObject, closeModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pickupAddressSearchBox, setPickupAddressSearchBox] = useState(null);
  const [deliveryAddressSearchBox, setDeliveryAddressSearchBox] = useState(null);

  const [latestColisObject, setLatestColisObject] = useState(null);
  const [colisGeneralInfo, setColisGeneralInfo] = useState({});
  const [colisList, setColisList] = useState([]);

  useEffect(() => {
    const fetchParcelById = async (id) => {
      try {
        const response = await axios.get('/api/colis/get-colis-by-id-or-code', {
          params: { reference: id }
        });
        const fetchedColis = response.data?.colis;
        setLatestColisObject(fetchedColis);

        const assignments = parcelsUtils.findOngoingAssignment(fetchedColis);

        // Update colisList and colisGeneralInfo based on the fetched data
        init(
          setColisList,
          fetchedColis,
          assignments,
          // pickupAssignment,
          // deliveryAssignment,
          // returnAssignment,
          setColisGeneralInfo
        );
      } catch (error) {
        console.error('Failed to fetch parcel data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (extraObject?.colis?.id) {
      setIsLoading(true);
      fetchParcelById(extraObject?.colis?.id);
    } else {
      init(setColisList, [], null, setColisGeneralInfo);
    }
  }, [extraObject?.colis?.id]);

  const onPickupPlacesChanged = () => {
    const place = pickupAddressSearchBox?.getPlaces()?.length
      ? pickupAddressSearchBox?.getPlaces()[0]
      : {};
    handleGeneralInfoChange('pickup_address_name', `${place?.name}, ${place?.formatted_address}`);
  };

  const onPickupSBLoad = (ref) => {
    setPickupAddressSearchBox(ref);
  };

  const onDeliveryPlacesChanged = (index) => {
    const place = deliveryAddressSearchBox?.getPlaces()?.length
      ? deliveryAddressSearchBox?.getPlaces()[0]
      : {};
    onValueChange(index, 'delivery_address_name', `${place?.name}, ${place?.formatted_address}`);
    // setDeliveryAddressSearchBox(null);
  };

  const onDeliverySBLoad = (ref) => {
    setDeliveryAddressSearchBox(ref);
  };

  const dispatch = useDispatch();

  const pickupDateRef = useRef();

  console.log({ latestColisObject });

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
      case 'delivery_livreur_id':
        if (!`${value}`.length) {
          error = 'Invalid delivery delivery livreur';
        }
        break;
      case 'pickup_livreur_id':
        if (!`${value}`.length) {
          error = 'Invalid pickup livreur';
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
          delivery_livreur: null,
          delivery_address_data: {}
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
    } else if (fieldName === 'delivery_address_name') {
      const place = deliveryAddressSearchBox?.getPlaces()?.length
        ? deliveryAddressSearchBox?.getPlaces()[0]
        : {};
      // Allow the field to be empty
      setColisList((prevList) => {
        prevList[index][fieldName] = value;
        prevList[index]['delivery_address_data'] = place?.geometry
          ? {
              lat: place?.geometry?.location?.lat(),
              lng: place?.geometry?.location?.lng(),
              placeId: place?.place_id
            }
          : {};
        return [...prevList];
      });
      return;
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
      const {
        delivery_phone_number,
        delivery_address_name,
        fee,
        fee_payment,
        price,
        pickup_livreur_id,
        delivery_livreur_id
      } = colis;
      validateField(formPosition, 'delivery_phone_number', delivery_phone_number); // Validate field and update errors
      validateField(formPosition, 'delivery_address_name', delivery_address_name); // Validate field and update errors
      validateField(formPosition, 'fee_payment', fee_payment); // Validate field and update errors
      validateField(formPosition, 'pickup_livreur_id', pickup_livreur_id); // Validate field and update errors
      if (!parcelsUtils.findOngoingAssignment(latestColisObject)) {
        console.log({ delivery_livreur_id });
        validateField(formPosition, 'delivery_livreur_id', delivery_livreur_id); // Validate field and update errors
      }
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
    const parcelsData = colisList?.map((colis) => ({
      ...colisGeneralInfo, // General information fields
      pickup_date: moment.utc(colisGeneralInfo?.pickup_date).format('YYYY-MM-DD'),
      pickup_address_data: pickupAddressSearchBox?.getPlaces()?.length
        ? {
            lat: pickupAddressSearchBox?.getPlaces()[0]?.geometry?.location?.lat(),
            lng: pickupAddressSearchBox?.getPlaces()[0]?.geometry?.location?.lng(),
            placeId: pickupAddressSearchBox?.getPlaces()[0]?.place_id
          }
        : undefined,
      ...colis // Specific colis fields
    }));

    try {
      let response;

      if (latestColisObject?.id) {
        const assignments = parcelsUtils.processAssignments(latestColisObject?.assignments || []);
        // If an ID exists, update the existing parcel
        const updatedParcelData = {
          ...parcelsData[0],
          id: extraObject.colis.id,
          // pickup_address_data: undefined,
          delivery_address_data: parcelsData[0]?.delivery_address_data?.lat
            ? parcelsData[0]?.delivery_address_data
            : undefined
        };
        console.log({
          parcelsData: parcelsData[0],
          updatedParcelData,
          extraObject,
          assignments
        });
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
              latestColisObject?.id ? 'updated' : 'saved'
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

  const inputPickupDateRef = useCallback(
    (node) => {
      if (node !== null) {
        console.log({ parcelsUtils: parcelsUtils.findOngoingAssignment(latestColisObject)?.date });
        pickupDateRef.current = flatpickr(node, {
          enableTime: true,
          defaultDate: parcelsUtils.findOngoingAssignment(latestColisObject)?.date
            ? moment
                .utc(parcelsUtils.findOngoingAssignment(latestColisObject)?.date)
                .format('YYYY-MM-DD')
            : moment.utc().format('YYYY-MM-DD'),
          dateFormat: 'Y-m-d',
          time_24hr: true,
          onChange: (date) => {
            handleGeneralInfoChange('pickup_date', date[0]);
          }
        });
      }
    },
    [latestColisObject]
  );

  // The content as a separate component
  const content = (
    <div className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="mb-3 text-lg font-semibold text-gray-700">Sender General Information</h3>
        <div className="mb-5">
          <div
            className={`grid gap-3 ${latestColisObject?.id ? 'md:grid-cols-4' : 'md:grid-cols-4'}`}>
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
                <span className={'label-text text-base-content '}>Pickup Address</span>
              </label>

              <StandaloneSearchBox onPlacesChanged={onPickupPlacesChanged} onLoad={onPickupSBLoad}>
                <input
                  type="text"
                  value={colisGeneralInfo.pickup_address_name}
                  className={getInputClass('pickup_address_name')}
                  onChange={(e) => handleGeneralInfoChange('pickup_address_name', e.target.value)}
                />
              </StandaloneSearchBox>
            </div>
            {/*{!latestColisObject?.id && (*/}
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
            {/*)}*/}
          </div>
        </div>
      </div>
      {colisList &&
        colisList?.map((colis, index) => (
          <div key={index} className="relative ">
            {!latestColisObject?.id ? (
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
                onDeliveryPlacesChanged={onDeliveryPlacesChanged}
                onDeliverySBLoad={onDeliverySBLoad}
              />
            </div>
          </div>
        ))}

      {!latestColisObject?.id ? (
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
            latestColisObject?.id ? 'btn-primary-content' : 'btn-secondary'
          } btn-outline`}
          onClick={handleSubmit}>
          {latestColisObject?.id ? 'Edit Parcel' : 'Submit Parcel(s)'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {
        !isLoading && (
          // (window.google === undefined ? (
          <LoadScript
            googleMapsApiKey="AIzaSyBn8n_poccjk4WVSg31H0rIkU-u7a2lYg8"
            libraries={['places']}>
            {content}
          </LoadScript>
        )
        // ) : (
        //   content
        // ))
      }
    </>
  );
};

export default ColisListManager;

const init = (
  setColisList,
  fetchedColis,
  activeAssignment,
  // pickupAssignment,
  // deliveryAssignment,
  // returnAssignment,
  setColisGeneralInfo
) => {
  setColisList([
    {
      delivery_phone_number: fetchedColis?.delivery_phone_number || '',
      delivery_address_name: fetchedColis?.delivery_address?.description || '',
      fee: parseInt(fetchedColis?.fee) || 0,
      fee_payment: fetchedColis?.fee_payment || '',
      price: parseInt(fetchedColis?.price) || 0,
      photo: fetchedColis?.photo || '',
      pickup_livreur_id: fetchedColis?.pickup_livreur?.id || '',
      delivery_livreur_id: fetchedColis?.delivery_livreur?.id || '',
      active_assignment: activeAssignment,
      // pickup_livreur: pickupAssignment,
      // delivery_livreur: deliveryAssignment,
      // return_livreur: returnAssignment,
      delivery_address_data: {}
      // Other fields as needed
    }
  ]);

  setColisGeneralInfo({
    merchant_phone_number: fetchedColis?.client?.phone_number || '',
    pickup_phone_number: fetchedColis?.pickup_phone_number || '',
    pickup_address_name: fetchedColis?.pickup_address?.description || '',
    pickup_date: fetchedColis?.pickup_date
      ? moment(fetchedColis.pickup_date).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD')
  });
};
