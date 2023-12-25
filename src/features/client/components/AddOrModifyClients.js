import React, { useCallback, useEffect, useState } from 'react';
import ChooseAccountType from './accountCreation/ChooseAccountType';
import AddOrModifyPersonalAccount from './accountCreation/AddOrModifyPersonalAccount';
import AddOrModifyMerchantAccount from './accountCreation/AddOrModifyMerchantAccount';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';

import { schema as personalSchema } from '../../../schemas/PersonalAccountFilter.schema';
import { schema as merchantSchema } from '../../../schemas/MerchantAccountFilter.schema';
import Summary from './accountCreation/Summary';
import Location from './accountCreation/Location';
import WorkSchedule from './accountCreation/WorkSchedule';

const INITIAL_PERSONAL_OBJ = {
  accountType: 'PERSO',
  phone_number: ''
};

const INITIAL_MERCHANT_OBJ = {
  accountType: 'MARCH',
  phone_number: '',
  merchant_name: '',
  latitude: '',
  longitude: '',
  profile_picture: ''
};

const AddOrModifyClients = ({ extraObject }) => {
  console.log('extraObject', extraObject);
  const { client, clientToMarchant, isEditCustomerSchedule } = extraObject;
  // const { client_type, country, wallets, merchants } = client;

  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState('personal');
  const [locations, setLocations] = useState(
    client?.merchants[0]?.locations?.map((loc) => {
      return {
        ...loc,
        details: loc.detail
      };
    }) || []
  );
  const [workDays, setWorkDays] = useState(
    client?.merchants[0]?.merchant_workdays?.map((wd) => {
      return {
        id: wd?.id || '',
        day: wd?.workday?.work_day || '',
        status: wd?.status === 'OPEN' ? 'OPENED' : wd.status,
        start_time: wd?.from_time || '',
        end_time: wd?.to_time || '',
        description: wd?.description || ''
      };
    }) || []
  );
  const [firstLoad, setFirstLoad] = useState(true);

  const handleOnSubmit = async (values) => {
    const stringifyValues = JSON.stringify(values);
    console.log(stringifyValues);
  };

  const personalFormik = useFormik({
    initialValues: client?.phone_number
      ? { ...INITIAL_PERSONAL_OBJ, phone_number: '+225' + client.phone_number }
      : INITIAL_PERSONAL_OBJ,
    validationSchema: personalSchema,
    onSubmit: handleOnSubmit
  });

  const merchantFormik = useFormik({
    initialValues: client?.phone_number
      ? {
          ...INITIAL_MERCHANT_OBJ,
          phone_number: '+225' + client?.phone_number,
          merchant_name: client?.merchants[0]?.name,
          latitude: client?.merchants[0]?.latitude,
          longitude: client?.merchants[0]?.longitude,
          profile_picture: client?.merchants[0]?.logo
        }
      : INITIAL_MERCHANT_OBJ,
    validationSchema: merchantSchema,
    onSubmit: handleOnSubmit
  });

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

  useEffect(() => {
    if (client?.client_type?.code) {
      if (isEditCustomerSchedule) {
        setActiveStep((_) => 3);
      } else {
        setActiveStep((oldValue) => oldValue + 1);
      }
      if (clientToMarchant || client.client_type.code === 'MARCH') {
        setSelectedAccount('merchant');
      } else if (client.client_type.code === 'PERSO') {
        setSelectedAccount('personal');
      }
    }
  }, []);

  const updateMerchantFormValue = useCallback(
    ({ key, value }) => {
      console.log('key, value', key, value);
      if (firstLoad) {
        setFirstLoad(false);
      }
      console.log(' key, value', key, value);
      return merchantFormik.setValues((oldValues) => {
        return { ...oldValues, [key]: value };
      });
    },
    [merchantFormik]
  );

  return (
    <div className="w-full ">
      <div className="flex items-center justify-center">
        <ul className="steps">
          <li className={`step ${activeStep >= 0 ? 'step-primary' : ''}`}>Choose Account type</li>
          <li className={`step ${activeStep >= 1 ? 'step-primary' : ''}`}>Register</li>
          {selectedAccount === 'personal' ? (
            <li className={`step ${activeStep >= 2 ? 'step-primary' : ''}`}>Summary</li>
          ) : (
            <></>
          )}
          {selectedAccount === 'merchant' ? (
            <li className={`step ${activeStep >= 2 ? 'step-primary' : ''}`}>Locations</li>
          ) : (
            <></>
          )}
          {selectedAccount === 'merchant' ? (
            <li className={`step ${activeStep >= 3 ? 'step-primary' : ''}`}>Work Schedule</li>
          ) : (
            <></>
          )}
          {selectedAccount === 'merchant' ? (
            <li className={`step ${activeStep >= 4 ? 'step-primary' : ''}`}>Summary</li>
          ) : (
            <></>
          )}
        </ul>
      </div>

      {activeStep === 0 ? (
        <ChooseAccountType
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          clickAction={setActiveStep}
        />
      ) : activeStep === 1 ? (
        <>
          {selectedAccount === 'personal' ? (
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
              clientToMarchant={clientToMarchant}
            />
          )}
        </>
      ) : activeStep === 2 ? (
        <>
          {selectedAccount === 'personal' ? (
            <>
              <Summary
                client={client}
                clickAction={setActiveStep}
                registrationInfo={personalFormik.values}
                actionTypeBool={client?.phone_number}
              />
            </>
          ) : (
            <>
              <Location
                locations={locations}
                setLocations={setLocations}
                clickAction={setActiveStep}
              />
            </>
          )}
        </>
      ) : activeStep === 3 ? (
        <>
          <WorkSchedule
            clickAction={setActiveStep}
            workDays={workDays}
            setWorkDays={setWorkDays}
            isEditCustomerSchedule={isEditCustomerSchedule}
            merchantId={client?.merchants[0]?.id}
          />
        </>
      ) : activeStep === 4 ? (
        <>
          <Summary
            client={client}
            actionTypeBool={client?.phone_number}
            clickAction={setActiveStep}
            registrationInfo={merchantFormik.values}
            locationsInfo={locations}
            workDaysInfo={workDays}
            clientToMarchant={clientToMarchant}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default AddOrModifyClients;
