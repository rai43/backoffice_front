import React, { useCallback, useEffect, useState } from 'react';

import { useFormik } from 'formik';

import AddOrModifyMerchantAccount from './accountCreation/AddOrModifyMerchantAccount';
import AddOrModifyPersonalAccount from './accountCreation/AddOrModifyPersonalAccount';
import ChooseAccountType from './accountCreation/ChooseAccountType';
import Location from './accountCreation/Location';
import Summary from './accountCreation/Summary';
import WorkSchedule from './accountCreation/WorkSchedule';
import { schema as merchantSchema } from '../../../schemas/MerchantAccountFilter.schema';
import { schema as personalSchema } from '../../../schemas/PersonalAccountFilter.schema';

// Constants for initial objects
const INITIAL_PERSONAL_OBJ = {
  accountType: 'PERSO',
  phone_number: ''
};

// Constants for the differents account types
const ACCOUNT_TYPES = {
  PERSONAL: 'personal',
  MERCHANT: 'merchant'
};

const INITIAL_MERCHANT_OBJ = {
  accountType: 'MARCH',
  phone_number: '',
  merchant_name: '',
  latitude: '',
  longitude: '',
  profile_picture: ''
};

/**
 * Extracts initial locations from the client object.
 * @param {Object} client - The client data from which to extract locations.
 * @returns {Array} An array of locations.
 */
const getInitialLocations = (client) => {
  if (!client || !client.merchants || client.merchants.length === 0) {
    return [];
  }
  client?.merchants[0]?.locations?.map;

  // Because a client can only have one merchant account now,
  // So the first merchant's locations are what we want.
  const firstMerchant = client.merchants[0];

  return firstMerchant.locations.map((loc) => ({
    ...loc,
    details: loc.detail
  }));
};

/**
 * Extracts initial workdays from the client object.
 * @param {Object} client - The client data from which to extract workdays.
 * @returns {Array} An array of workdays.
 */
const getInitialWorkDays = (client) => {
  if (!client || !client.merchants || client.merchants.length === 0) {
    return [];
  }

  // Extracting the first merchant's workday schedule
  const firstMerchant = client.merchants[0];
  // noinspection UnnecessaryLocalVariableJS
  const workdaySchedules = firstMerchant?.merchant_workdays?.map((workday) => ({
    id: workday.id || '',
    day: workday.workday?.work_day || '',
    status: workday.status === 'OPEN',
    start_time: workday.from_time || '',
    end_time: workday.to_time || '',
    description: workday.description || ''
  }));

  return workdaySchedules;
};

/**
 * Extracts initial values for a personal account form from the client object.
 * @param {Object} client - The client data.
 * @returns {Object} An object with initial form values for a personal account.
 */
function getInitialPersonalValues(client) {
  // Default values if client data is not available
  if (!client || !client.phone_number) {
    return { ...INITIAL_PERSONAL_OBJ };
  }

  // Extracting and formatting personal account details from client
  return {
    ...INITIAL_PERSONAL_OBJ,
    phone_number: `+225${client.phone_number}`
  };
}

/**
 * Extracts initial values for a merchant account form from the client object.
 * @param {Object} client - The client data.
 * @returns {Object} An object with initial form values for a merchant account.
 */
function getInitialMerchantValues(client) {
  // Default values if client data is not available
  if (!client || !client.phone_number || !client.merchants || client.merchants.length === 0) {
    return { ...INITIAL_MERCHANT_OBJ };
  }

  // Extracting and formatting merchant account details from client
  const firstMerchant = client.merchants[0];
  return {
    ...INITIAL_MERCHANT_OBJ,
    phone_number: `+225${client.phone_number}`,
    merchant_name: firstMerchant.name || '',
    latitude: firstMerchant.latitude || '',
    longitude: firstMerchant.longitude || '',
    profile_picture: firstMerchant.logo || ''
  };
}

/**
 * Component for adding or modifying client accounts.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.extraObject - Extra data for initializing the component.
 * @returns {React.ReactElement} A React component for adding or modifying clients.
 */
const AddOrModifyClients = ({ extraObject }) => {
  const { client, clientToMarchant, isEditCustomerSchedule, edit } = extraObject;

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(ACCOUNT_TYPES.PERSONAL);
  const [locations, setLocations] = useState([]);
  const [workDays, setWorkDays] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);

  // Formik's initialization for personal account form
  const personalFormik = useFormik({
    initialValues: getInitialPersonalValues(client),
    validationSchema: personalSchema
  });

  // Formik's initialization for merchant account form
  const merchantFormik = useFormik({
    initialValues: getInitialMerchantValues(client),
    validationSchema: merchantSchema
  });

  /**
   * Updates the personal form values.
   * @param {Object} field - Contains the key and value to be updated in the form.
   * @param {string} field.key - The key (field name) in the form to update.
   * @param {any} field.value - The new value for the specified key.
   */
  const updatePersonalFormValue = useCallback(
    ({ key, value }) => {
      if (firstLoad) {
        setFirstLoad(false);
      }

      return personalFormik.setValues((oldValues) => {
        return { ...oldValues, [key]: value };
      });
    },
    [personalFormik]
  );

  /**
   * Updates the merchant form values.
   * @param {Object} field - Contains the key and value to be updated in the form.
   * @param {string} field.key - The key (field name) in the form to update.
   * @param {any} field.value - The new value for the specified key.
   */
  const updateMerchantFormValue = useCallback(
    ({ key, value }) => {
      if (firstLoad) {
        setFirstLoad(false);
      }
      return merchantFormik.setValues((oldValues) => {
        return { ...oldValues, [key]: value };
      });
    },
    [merchantFormik]
  );

  /**
   * Determines the initial steps for the form based on client data and other conditions.
   * @param {Object} client - The client data.
   * @param {boolean} clientToMarchant - Flag indicating if client is becoming a merchant.
   * @param {boolean} isEditCustomerSchedule - Flag indicating if editing the customer schedule.
   */
  function determineInitialSteps(client, clientToMarchant, isEditCustomerSchedule) {
    // Logic to determine the initial steps
    if (!client) {
      // If no client data is available, start from the beginning
      setActiveStep(0);
      setSelectedAccount(ACCOUNT_TYPES.PERSONAL); // Default to 'personal' if no client data
      return;
    }

    if (isEditCustomerSchedule) {
      // If editing a customer schedule, jump to a specific step
      setActiveStep(3); // Adjust this number based on your step logic
      setSelectedAccount(ACCOUNT_TYPES.MERCHANT);
    } else {
      // Determine the initial step based on client type
      const initialAccountType =
        clientToMarchant || client?.client_type?.code === 'MARCH'
          ? ACCOUNT_TYPES.MERCHANT
          : ACCOUNT_TYPES.PERSONAL;
      setSelectedAccount(initialAccountType);
      setActiveStep((oldValue) => oldValue + 1);
    }
  }

  /**
   * useEffect hook to determine the initial steps of the form.
   * It runs whenever there's a change in client data, clientToMarchant flag, or isEditCustomerSchedule flag.
   * This is used to set the initial state of the form based on various conditions like whether the client is
   * being converted to a merchant or if the customer schedule is being edited.
   *
   * @effect Sets the initial active step and account selection based on the current client data and flags.
   */
  useEffect(() => {
    determineInitialSteps(client, clientToMarchant, isEditCustomerSchedule);
  }, [client, clientToMarchant, isEditCustomerSchedule]);

  /**
   * Sets the initial locations and workdays based on the client data.
   */
  useEffect(() => {
    if (client) {
      setLocations(getInitialLocations(client));
      setWorkDays(getInitialWorkDays(client));
    }
  }, [client]);

  return (
    //     Multi-step form component for handling personal or merchant account creation.
    // It renders different components based on the active step and selected account type.
    <div className="w-full ">
      <div className="flex items-center justify-center">
        {/* Step indicator: Updates based on the active step */}
        <ul className="steps">
          <li className={`step ${activeStep >= 0 ? 'step-primary' : ''}`}>Choose Account type</li>
          <li className={`step ${activeStep >= 1 ? 'step-primary' : ''}`}>Register</li>
          {/* Conditional rendering of steps based on the selected account type */}
          {selectedAccount === ACCOUNT_TYPES.PERSONAL && (
            <li className={`step ${activeStep >= 2 ? 'step-primary' : ''}`}>Summary</li>
          )}
          {selectedAccount === ACCOUNT_TYPES.MERCHANT && (
            <>
              <li className={`step ${activeStep >= 2 ? 'step-primary' : ''}`}>Locations</li>
              <li className={`step ${activeStep >= 3 ? 'step-primary' : ''}`}>Work Schedule</li>
              <li className={`step ${activeStep >= 4 ? 'step-primary' : ''}`}>Summary</li>
            </>
          )}
        </ul>
      </div>

      {/* Render the appropriate component based on the current step */}
      {activeStep === 0 ? (
        <ChooseAccountType
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          clickAction={setActiveStep}
        />
      ) : activeStep === 1 ? (
        selectedAccount === ACCOUNT_TYPES.PERSONAL ? (
          <AddOrModifyPersonalAccount
            formik={personalFormik}
            updateFormValue={updatePersonalFormValue}
            clickAction={setActiveStep}
            firstLoad={firstLoad}
            preventGoBack={client?.phone_number}
          />
        ) : (
          <AddOrModifyMerchantAccount
            formik={merchantFormik}
            updateFormValue={updateMerchantFormValue}
            clickAction={setActiveStep}
            firstLoad={firstLoad}
            preventGoBack={client?.phone_number}
            edit={edit}
            clientToMarchant={clientToMarchant}
          />
        )
      ) : activeStep === 2 ? (
        selectedAccount === ACCOUNT_TYPES.PERSONAL ? (
          <Summary
            client={client}
            clickAction={setActiveStep}
            registrationInfo={personalFormik.values}
            actionTypeBool={client?.phone_number}
          />
        ) : (
          <Location locations={locations} setLocations={setLocations} clickAction={setActiveStep} />
        )
      ) : activeStep === 3 ? (
        <WorkSchedule
          clickAction={setActiveStep}
          workDays={workDays}
          setWorkDays={setWorkDays}
          isEditCustomerSchedule={isEditCustomerSchedule}
          merchantId={client?.merchants[0]?.id}
        />
      ) : activeStep === 4 ? (
        <Summary
          client={client}
          actionTypeBool={client?.phone_number}
          clickAction={setActiveStep}
          registrationInfo={merchantFormik.values}
          locationsInfo={locations}
          workDaysInfo={workDays}
          clientToMarchant={clientToMarchant}
        />
      ) : null}
    </div>
  );
};

export default AddOrModifyClients;
