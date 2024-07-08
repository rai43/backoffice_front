// noinspection DuplicatedCode

import { React, useEffect, useState } from 'react';

import { StandaloneSearchBox } from '@react-google-maps/api';
import axios from 'axios';
import moment from 'moment';
import OpenAI from 'openai';
import { useDispatch } from 'react-redux';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

import { FaCopy } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

import { showNotification } from '../../common/headerSlice';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import parcelsUtils from '../parcels.utils';
import { saveColisBulk, updateColis } from '../parcelsManagementSlice';

const Menu = (props) => {
  return <components.Menu {...props}>{props.children}</components.Menu>;
};

const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: 40,
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

// const zonesOptions = [
//   { value: '', label: 'Select a Zone' },
//   { value: 'Abobo', label: 'Abobo & Anyama' },
//   { value: 'Angre', label: 'Angre & 2 Plateaux' },
//   { value: 'Bingerville', label: 'Bingerville & Riviera' },
//   { value: 'Adjame', label: 'Cocody Centre & Plateau & Adjame' },
//   { value: 'AbidjanSud', label: 'Grand Abidjan Sud' },
//   { value: 'Yopougnon', label: 'Grand Yopougnon' }
// ];

const zonesOptions = [
  { value: '', label: 'Select a Zone' },
  { value: 'zone_a', label: 'Abobo & Anyama & Angre' },
  { value: 'zone_b', label: 'II plateaux & Cocody Centre & Plateau & Adjame ' },
  { value: 'zone_c', label: 'Yopougon' },
  { value: 'zone_d', label: 'Abidjan Sud' },
  { value: 'zone_e', label: 'Riviera & Bingerville' },
  { value: 'zone_f', label: 'Gonzagville & Modeste & Bassam' }
];

const zonesDescription = `
        Zone A: Abobo and Angre and Anyama
        Zone B: Deux Plateaux, Cocody Centre, Plateau, and Adjamé
        Zone C: Yopougon
        Zone D: Treichville, Marcory, Koumassi, and Port-Bouet
        Zone E: Riviera and Bingerville
        Zone F: Gonzagville, Modeste, Bassam
      `;

export const ColisManager = ({ extraObject, closeModal }) => {
  const openai = new OpenAI({
    apiKey: 'sk-bo-zone-service-account-rtcVHtncsj5sVyxtS4v5T3BlbkFJendqkeELz8oWwTNV6fIX', // This is the default and can be omitted
    dangerouslyAllowBrowser: true
  });
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [merchantInfo, setMerchantInfo] = useState({});
  const [merchantErrors, setMerchantErrors] = useState({});
  const [errorsList, setErrorsList] = useState([{}]);
  const [latestColisObject, setLatestColisObject] = useState(null);
  const [colisList, setColisList] = useState([]);
  const [pickupAddressSearchBox, setPickupAddressSearchBox] = useState(null);
  const [deliveryAddressSearchBox, setDeliveryAddressSearchBox] = useState({});

  const nextStep = async () => {
    if (step === 0) {
      document.body.classList.add('loading-indicator');
      const errorsCheckObj = validateGeneralField({
        merchant_phone_number: merchantInfo?.merchant_phone_number,
        pickup_phone_number: merchantInfo?.pickup_phone_number,
        pickup_address_name: merchantInfo?.pickup_address_name
      });

      if (Object.keys(errorsCheckObj).length === 0) {
        const locationDescription = `
          Delivery Address Name: ${merchantInfo.pickup_address_name}
        `;

        const prompt = `
          Given the following zones and their descriptions:
          ${zonesDescription}

          And the following location details:
          ${locationDescription}

          Determine which zone the location belongs to
          Basing on the Delivery Address Name that matches a zones name
          For instance, if the address contains angre, angr, angré ..., it is likely to be zone A
          
          result should be an object like this: {zone: ..., precision: ...%}
          precision: is how well the string fits the location description
          please, don't explain anything
          just the stringified object 
        `;

        const chatCompletion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          top_p: 1
        });

        let result;
        try {
          result = JSON.parse(chatCompletion?.choices?.[0]?.message?.content);
          handleGeneralInfoChange('pickup_livreur_id', `zone_${result?.zone}`.toLowerCase());
          // setMerchantInfo((prevState) => {
          //   const newState = { ...prevState };
          //   prevState.pickup_livreur_id = `zone_${result?.zone}`.toLowerCase();
          //   return newState;
          // });
        } catch (e) {
          console.log('Could not get the zone');
        }
        document.body.classList.remove('loading-indicator');
        setStep((prevStep) => Math.min(prevStep + 1, 2));
      } else {
        dispatch(
          showNotification({
            message: 'The form contains some errors.',
            status: 0
          })
        );
      }
    } else if (step === 1) {
      document.body.classList.add('loading-indicator');
      let iter = 0;
      let validForm = true;

      for (const colis of colisList) {
        const validationResult = validateField(iter, colis, colis?.active_assignment);
        delete validationResult['pickup_livreur_id'];
        if (Object.keys(validationResult).length > 0) {
          validForm = false;
          break;
        }
        iter++;
      }

      if (validForm) {
        for (let i = 0; i < colisList.length; i++) {
          const locationDescription = `
          Delivery Address Name: ${colisList[i].delivery_address_name}
        `;

          const prompt = `
          Given the following zones and their descriptions:
          ${zonesDescription}

          And the following location details:
          ${locationDescription}

          Determine which zone the location belongs to
          Basing on the Delivery Address Name that matches a zones name
          For instance, if the address contains angre, angr, angré ..., it is likely to be zone A
          
          result should be an object like this: {zone: ..., precision: ...%}
          precision: is how well the string fits the location description
          please, don't explain anything
          just the stringified object 
        `;

          const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            top_p: 1
          });

          let result;
          try {
            result = JSON.parse(chatCompletion?.choices?.[0]?.message?.content);
            setColisList((prevList) => {
              const newList = [...prevList];
              newList[i].delivery_livreur_id = `zone_${result?.zone}`.toLowerCase();
              return newList;
            });
          } catch (e) {
            console.log('Could not get the zone');
          }
        }

        setStep((prevStep) => Math.min(prevStep + 1, 2));
      }
      document.body.classList.remove('loading-indicator');
    } else if (step === 2) {
      document.body.classList.add('loading-indicator');
      await handleSubmit();
      document.body.classList.remove('loading-indicator');
    }
  };

  const prevStep = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleGeneralInfoChange = (fieldName, value) => {
    if (fieldName.includes('phone_number')) {
      if (!isValidPhoneNumber(value)) {
        return;
      }
    }

    setMerchantInfo((prevState) => ({
      ...prevState,
      [fieldName]: value
    }));

    // validateGeneralField(fieldName, value); // Validate field and update errors
  };

  const validateGeneralField = (fields) => {
    let errors = {};

    for (const [fieldName, value] of Object.entries(fields)) {
      let error = '';

      switch (fieldName) {
        case 'merchant_phone_number':
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
        default:
          break;
      }

      if (error) {
        errors[fieldName] = error;
      }
    }

    setMerchantErrors(errors);

    return errors;
  };

  const validateField = (index, fields, hasActiveAssignment) => {
    let errors = {};

    for (const [fieldName, value] of Object.entries(fields)) {
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
        case 'pickup_livreur_id':
          if (!`${value}`.length) {
            error = 'Invalid pickup livreur';
          }
          break;
        case 'delivery_livreur_id' && !hasActiveAssignment:
          if (!`${value}`.length) {
            error = 'Invalid delivery livreur';
          }
          break;
        case 'fee' || 'price':
          if (value === undefined || parseInt(value) < 0) {
            error = 'This value can not be negative';
          }
          break;
        case 'fee_payment':
          if (value !== 'PREPAID' && value !== 'POSTPAID') {
            error = 'Fee payment should either be PREPAID or POSTPAID';
          }
          break;
        default:
          break;
      }

      if (error) {
        errors[fieldName] = error;
      }
    }

    setErrorsList((prevErrors) => {
      const newErrors = [...prevErrors];
      newErrors[index] = { ...errors };
      return newErrors;
    });

    return errors;
  };

  const getInputClass = (fieldName, index = null, isMerchant = true) => {
    const baseClass = 'mt-1 block w-full p-2 border rounded-md';
    return (isMerchant ? merchantErrors?.[fieldName] : errorsList?.[index]?.[fieldName])
      ? `${baseClass} border-red-500 bg-red-100`
      : baseClass;
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const pattern = /^\d+$/; // Regex to check if the string contains only digits
    return pattern.test(phoneNumber);
  };

  const onPickupPlacesChanged = () => {
    const place = pickupAddressSearchBox?.getPlaces()?.length
      ? pickupAddressSearchBox?.getPlaces()[0]
      : {};
    handleGeneralInfoChange('pickup_address_name', `${place?.name}, ${place?.formatted_address}`);
  };

  const onDeliveryPlacesChanged = (index) => {
    const place = deliveryAddressSearchBox?.[index]?.getPlaces()?.length
      ? deliveryAddressSearchBox?.[index]?.getPlaces()?.[0]
      : {};
    onValueChange(index, 'delivery_address_name', `${place?.name}, ${place?.formatted_address}`);
  };

  const onPickupSBLoad = (ref) => {
    setPickupAddressSearchBox(ref);
  };

  const onDeliverySBLoad = (ref, index) => {
    setDeliveryAddressSearchBox((prevSearchBoxes) => {
      return { ...prevSearchBoxes, [index]: ref };
    });
  };

  const duplicateColis = (index) => {
    setColisList((prevList) => {
      // Copy the colis object at the specified index
      const colisToDuplicate = { ...prevList[index] };
      // Insert the copied colis object into the list
      return [...prevList, colisToDuplicate];
      // return [...prevList.slice(0, index + 1), colisToDuplicate, ...prevList.slice(index + 1)];
    });

    // setDeliveryAddressSearchBox((prevSearchBoxes) => {
    //   const deliveryBoxesToDuplicate = { ...prevSearchBoxes };
    //   return { ...deliveryBoxesToDuplicate, [index]: { deliveryBoxesToDuplicate[index] } };
    // });

    // setErrorsList((prevErrors) => {
    //   // Copy the errors object at the specified index
    //   const errorsToDuplicate = { ...prevErrors[index] };
    //   // Insert the copied errors object into the errorsList
    //   return [...prevErrors.slice(0, index + 1), errorsToDuplicate, ...prevErrors.slice(index + 1)];
    // });
  };

  const removeColis = (index) => {
    setColisList((prevState) => prevState.filter((_, i) => i !== index));
  };

  const isValidPrice = (price) => {
    const pattern = /^\d+$/; // Regex to check if the string contains only digits
    return pattern.test(price);
  };

  const onValueChange = (index, fieldName, value) => {
    const updateColisList = (updatedField) => {
      setColisList((prevList) => {
        const newList = [...prevList];
        newList[index] = {
          ...newList[index],
          ...updatedField
        };
        return newList;
      });
    };

    if (fieldName.includes('phone_number')) {
      // Allow the field to be empty
      if (value === '' || isValidPhoneNumber(value)) {
        updateColisList({ [fieldName]: value });
      }
      return;
    }

    if (fieldName === 'fee' || fieldName === 'price' || fieldName === 'expedition_fee') {
      // Allow the field to be empty and set default to 0
      if (value === '') {
        updateColisList({ [fieldName]: 0 });
        return;
      }
      // Remove leading zeros for non-empty fields
      const cleanedValue = value.replace(/^0+/, '');
      if (isValidPrice(cleanedValue)) {
        updateColisList({ [fieldName]: cleanedValue });
      }
      return;
    }

    if (fieldName === 'delivery_address_name') {
      const place = deliveryAddressSearchBox?.[index]?.getPlaces()?.[0] ?? {};
      const addressData = place?.geometry
        ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id
          }
        : {};
      updateColisList({
        [fieldName]: value,
        delivery_address_data: addressData
      });
      return;
    }

    updateColisList({ [fieldName]: value });
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

  const handleSubmit = async () => {
    // validationFailed will be true if the forms validation has failed
    let validationFailed = false;

    const {
      merchant_phone_number,
      pickup_phone_number,
      pickup_address_name,
      pickup_date,
      pickup_livreur_id
    } = merchantInfo;

    validateGeneralField('merchant_phone_number', merchant_phone_number); // Validate field and update errors
    validateGeneralField('pickup_phone_number', pickup_phone_number); // Validate field and update errors
    validateGeneralField('pickup_address_name', pickup_address_name); // Validate field and update errors
    validateGeneralField('pickup_date', pickup_date); // Validate field and update errors

    if (!merchant_phone_number || !pickup_phone_number || !pickup_address_name || !pickup_date) {
      dispatch(
        showNotification({
          message: 'Merchant information form contains errors.',
          status: 0
        })
      );
      validationFailed = true;
    }

    let formPosition = 0;
    // Check if all required fields are set in each object in colisList
    for (const colis of colisList) {
      const { delivery_phone_number, delivery_address_name, fee_payment, delivery_livreur_id } =
        colis;
      validateField(formPosition, 'delivery_phone_number', delivery_phone_number); // Validate field and update errors
      validateField(formPosition, 'delivery_address_name', delivery_address_name); // Validate field and update errors
      validateField(formPosition, 'fee_payment', fee_payment); // Validate field and update errors
      validateField(formPosition, 'pickup_livreur_id', pickup_livreur_id); // Validate field and update errors
      if (!parcelsUtils.findOngoingAssignment(latestColisObject)) {
        validateField(formPosition, 'delivery_livreur_id', delivery_livreur_id); // Validate field and update errors
      }

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
      ...colis, // Specific colis fields
      ...merchantInfo, // General information fields
      pickup_date: moment.utc(merchantInfo?.pickup_date).format('YYYY-MM-DD'),
      pickup_address_data: pickupAddressSearchBox?.getPlaces()?.length
        ? {
            lat: pickupAddressSearchBox?.getPlaces()[0]?.geometry?.location?.lat(),
            lng: pickupAddressSearchBox?.getPlaces()[0]?.geometry?.location?.lng(),
            placeId: pickupAddressSearchBox?.getPlaces()[0]?.place_id
          }
        : undefined
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

  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const handleImageClick = () => {
    setIsImageZoomed(true);
  };

  const handleZoomClose = () => {
    setIsImageZoomed(false);
  };

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
        init(setColisList, fetchedColis, assignments, setMerchantInfo);
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
      init(setColisList, [], null, setMerchantInfo);
    }
  }, [extraObject?.colis?.id]);

  return (
    <>
      <div className="h-[30rem] bg-gray-50 flex">
        {/* Sidebar for Steps */}
        <div className="w-1/4 bg-white p-8 border-r border-gray-300">
          <h2 className="text-2xl font-semibold mb-4">Colis Steps</h2>
          <div className="space-y-4">
            <ul className="steps steps-vertical">
              <li className={`step ${step >= 0 ? 'step-primary' : ''}`}>Merchant information</li>
              <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Colis data</li>
              <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Zones Validation</li>
              {/*<li className={`step ${step === 3 ? 'step-primary' : ''}`}>Summary</li>*/}
            </ul>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-3/4 bg-white p-8">
          <h3 className="text-xl font-semibold mb-4">Data Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[25rem] overflow-auto">
            {step === 0 && (
              <>
                <div>
                  <label className="block text-gray-700">Merchant Phone Number</label>
                  <input
                    type="text"
                    value={merchantInfo.merchant_phone_number}
                    className={getInputClass('merchant_phone_number')}
                    onChange={(e) =>
                      handleGeneralInfoChange('merchant_phone_number', e.target.value)
                    }
                  />
                </div>
                <div>
                  <span className="block text-gray-700">Pickup Phone Number</span>
                  <input
                    type="text"
                    value={merchantInfo.pickup_phone_number}
                    className={getInputClass('pickup_phone_number')}
                    onChange={(e) => handleGeneralInfoChange('pickup_phone_number', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700">Pickup Address</label>
                  <StandaloneSearchBox
                    onPlacesChanged={onPickupPlacesChanged}
                    onLoad={onPickupSBLoad}>
                    <input
                      type="text"
                      value={merchantInfo.pickup_address_name}
                      className={getInputClass('pickup_address_name')}
                      onChange={(e) =>
                        handleGeneralInfoChange('pickup_address_name', e.target.value)
                      }
                    />
                  </StandaloneSearchBox>
                </div>
              </>
            )}
            {(step === 1 || step === 2) &&
              colisList &&
              colisList?.map((colis, index) => (
                <div
                  key={index}
                  className={`md:col-span-2 ${
                    colis?.photo ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''
                  }`}>
                  <div className="p-4 border border-gray-300 rounded-lg mx-2">
                    <div className="flex justify-between">
                      <h3 className="mb-3 text-lg font-semibold text-gray-700">#{index + 1}</h3>
                      {!latestColisObject?.id && step === 1 ? (
                        <div>
                          <button
                            onClick={() => duplicateColis(index)}
                            className="flex items-center font-semibold text-gray-600"
                            title="Remove">
                            <FaCopy className="text-lg" />
                            <span className="mx-2">Duplicate</span>
                          </button>
                        </div>
                      ) : (
                        <></>
                      )}
                      {colisList?.length > 1 && step === 1 ? (
                        <div>
                          <button
                            onClick={() => removeColis(index)}
                            className="text-red-500 hover:text-red-600"
                            title="Remove">
                            <IoClose size="1.5em" />
                          </button>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>

                    <div className="divider p-0 m-0"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="block text-gray-700">Delivery Phone Number</div>
                        <input
                          disabled={step !== 1}
                          type="text"
                          value={colis.delivery_phone_number}
                          className={getInputClass('delivery_phone_number', index, false)}
                          onChange={(e) =>
                            onValueChange(index, 'delivery_phone_number', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={errorsList?.[index]?.['fee_payment'] ? `text-red-500` : ''}>
                          <label className="block text-gray-700">Fee Payment Method</label>
                          <div className="mt-1 flex justify-between space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="form-radio"
                                name={`fee_payment_${index}`}
                                value="POSTPAID"
                                disabled={step !== 1}
                                checked={colis.fee_payment === 'POSTPAID'}
                                onChange={(e) =>
                                  onValueChange(index, 'fee_payment', e.target.value)
                                }
                              />
                              <span className="ml-2">Postpaid</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                className="form-radio"
                                name={`fee_payment_${index}`}
                                value="PREPAID"
                                disabled={step !== 1}
                                checked={colis.fee_payment === 'PREPAID'}
                                onChange={(e) =>
                                  onValueChange(index, 'fee_payment', e.target.value)
                                }
                              />
                              <span className="ml-2">Prepaid</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="block text-gray-700">Price</div>
                          <input
                            type="number"
                            value={colis.price}
                            disabled={step !== 1}
                            className={getInputClass('price', index, false)}
                            onChange={(e) => onValueChange(index, 'price', e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="block text-gray-700">Fee</div>
                          <input
                            type="number"
                            value={colis.fee}
                            disabled={step !== 1}
                            className={getInputClass('fee', index, false)}
                            onChange={(e) => onValueChange(index, 'fee', e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="block text-gray-700">Expedition Fee</div>
                          <input
                            type="number"
                            value={colis?.expedition_fee}
                            disabled={step !== 1}
                            className={getInputClass('expedition_fee', index, false)}
                            onChange={(e) => onValueChange(index, 'expedition_fee', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="block text-gray-700">Delivery Address Name</div>
                        <StandaloneSearchBox
                          onPlacesChanged={() => onDeliveryPlacesChanged(index)}
                          onLoad={(ref) => onDeliverySBLoad(ref, index)}>
                          <input
                            type="text"
                            value={colis.delivery_address_name}
                            className={getInputClass('delivery_address_name', index, false)}
                            disabled={step !== 1}
                            onChange={(e) =>
                              onValueChange(index, 'delivery_address_name', e.target.value)
                            }
                          />
                        </StandaloneSearchBox>
                      </div>

                      {step === 2 &&
                        (colis?.active_assignment ? (
                          <div className="md:col-span-2">
                            <div className="block text-gray-700">Ongoing Assignment Livreur</div>
                            <AsyncSelect
                              maxMenuHeight={90}
                              cacheOptions
                              defaultOptions
                              loadOptions={livreursPromiseOptions}
                              styles={customStyles}
                              onChange={({ value }) =>
                                handleGeneralInfoChange('pickup_livreur_id', value)
                              }
                              defaultValue={() => {
                                if (colis?.active_assignment !== null) {
                                  return {
                                    label: `${colis?.active_assignment?.livreur?.first_name} ${colis?.active_assignment?.livreur?.last_name} (${colis?.active_assignment?.livreur?.whatsapp})`,
                                    value: colis?.active_assignment?.livreur?.id
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
                            <div>
                              <div className="block text-gray-700">
                                Pickup Zone {merchantInfo?.pickup_livreur_id ? 'a ' : 'b'}
                              </div>
                              <select
                                className={getInputClass('pickup_livreur_id')}
                                value={merchantInfo?.pickup_livreur_id}
                                onChange={(e) =>
                                  handleGeneralInfoChange('pickup_livreur_id', e.target.value)
                                }>
                                {zonesOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label?.toUpperCase()}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <div>
                                <div className="block text-gray-700">Delivery Zone</div>
                                <select
                                  className={getInputClass('delivery_livreur_id')}
                                  value={colis?.delivery_livreur_id}
                                  onChange={(e) =>
                                    onValueChange(index, 'delivery_livreur_id', e.target.value)
                                  }>
                                  {zonesOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label?.toUpperCase()}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </>
                        ))}
                    </div>
                  </div>
                  {colis?.photo && (
                    <div className="p-4">
                      <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                        <div
                          className="w-full h-[30rem] bg-cover bg-center rounded-lg cursor-pointer"
                          style={{ backgroundImage: `url('${colis.photo}')` }}
                          onClick={handleImageClick}
                        />
                      </div>
                      {isImageZoomed && (
                        <div
                          onClick={handleZoomClose}
                          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
                          <img
                            className="max-w-full max-h-full"
                            src={colis.photo}
                            alt="Zoomed Colis"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            {step === 3 && (
              <div>
                <p>Submit your information</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          disabled={step === 0}>
          Previous
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          disabled={step > 2}>
          {step === 2 ? 'Save' : 'Next'}
        </button>
      </div>
    </>
  );
};

const init = (setColisList, fetchedColis, activeAssignment, setColisGeneralInfo) => {
  setColisList([
    {
      delivery_phone_number: fetchedColis?.delivery_phone_number || '',
      delivery_address_name: fetchedColis?.delivery_address?.description || '',
      fee: parseInt(fetchedColis?.fee) || 0,
      expedition_fee: parseInt(fetchedColis?.expedition_fee) || 0,
      fee_payment: fetchedColis?.fee_payment || '',
      price: parseInt(fetchedColis?.price) || 0,
      photo: fetchedColis?.photo || '',
      pickup_livreur_id: fetchedColis?.pickup_livreur?.id || '',
      delivery_livreur_id: fetchedColis?.delivery_livreur?.id || '',
      active_assignment: activeAssignment,
      delivery_address_data: {}
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
