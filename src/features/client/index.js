import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InputCheckbox from '../../components/Input/InputCheckbox';
import InfoText from '../../components/Typography/InfoText';
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { openModal } from '../common/modalSlice';
import { getClientsContent, resetFrom } from './clientSlice';
import Clients from './components/Clients';
import SelectBox from '../../components/Input/SelectBox';
import InputText from '../../components/Input/InputText';
import {
  resetTableCustomerSettings,
  setActive,
  setDeleted,
  setDirection,
  setLimit,
  setMerchant,
  setMerchantId,
  setMerchantName,
  setPersonal,
  setPhoneNumber,
  setSettings
} from '../common/CustomersTableSlice';
import { setMinAmount } from '../common/transactionsTableSlice';

const orderOptions = [
  { name: 'Most recent', value: 'ASC' },
  { name: 'Oldest', value: 'DESC' }
];

const fetchLimitOptions = [
  { name: '250', value: '250' },
  { name: '500', value: '500' },
  { name: '1000', value: '1000' },
  { name: '1500', value: '1500' }
];

const Customers = () => {
  const dispatch = useDispatch();

  const {
    personal,
    merchant,
    active,
    deleted,
    direction,
    limit,
    phoneNumber,
    merchantId,
    merchantName
  } = useSelector((state) => state.customersTable);

  const INITIAL_CUSTOMER_FILTER_OBJ = {
    personal: personal,
    merchant: merchant,
    active: active,
    deleted: deleted,
    direction: direction ? direction : 'DESC',
    limit: limit ? limit : '500',
    searchPattern: '',
    phoneNumber: phoneNumber ? phoneNumber : '',
    merchantId: merchantId ? merchantId : '',
    merchantName: merchantName ? merchantName : ''
  };

  const { clients, skip, isLoading, noMoreQuery } = useSelector((state) => state.client);

  const formik = useFormik({
    initialValues: INITIAL_CUSTOMER_FILTER_OBJ
  });

  const [openFilter, setOpenFilter] = useState(false);

  const TopSideButtons = ({ extraClasses, containerStyle }) => {
    const dispatch = useDispatch();

    const openAddNewClientModal = () => {
      dispatch(
        openModal({
          title: 'Creation a new customer',
          bodyType: MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT,
          size: 'lg',
          extraObject: {
            type: CONFIRMATION_MODAL_CLOSE_TYPES.CLIENT_CLIENTS_OR_EDIT
          }
        })
      );
    };

    return (
      <div className={`${containerStyle ? containerStyle : ''}`}>
        <button
          className={`btn px-6 normal-case btn-primary btn-outline w-full ${extraClasses}`}
          onClick={() => openAddNewClientModal()}
        >
          Add New Customer
        </button>
      </div>
    );
  };

  const applyFilter = async (dispatchParams) => {
    await dispatch(getClientsContent(dispatchParams));
  };

  const handleLoadClients = async (_) => {
    if (!noMoreQuery && !isLoading) {
      const dispatchParams = {
        skip: skip,
        personal: formik.values.personal,
        merchant: formik.values.merchant,
        active: formik.values.active,
        deleted: formik.values.deleted,
        limit: formik.values.limit,
        direction: formik.values.direction,
        searchPattern: formik.values.searchPattern,
        merchantId: formik.values.merchantId,
        merchantName: formik.values.merchantName,
        phoneNumber: formik.values.phoneNumber
      };

      await applyFilter(dispatchParams);
    }
  };

  const onFetchClients = async () => {
    dispatch(resetFrom());
    dispatch(resetTableCustomerSettings());
    const dispatchParams = {
      skip: 0,
      personal: formik.values.personal,
      merchant: formik.values.merchant,
      active: formik.values.active,
      deleted: formik.values.deleted,
      limit: formik.values.limit,
      direction: formik.values.direction,
      searchPattern: formik.values.searchPattern,
      merchantId: formik.values.merchantId,
      merchantName: formik.values.merchantName,
      phoneNumber: formik.values.phoneNumber
    };
    applyFilter(dispatchParams);
  };

  useEffect(() => {
    onFetchClients();
  }, []);

  const updateFormValue = useCallback(
    ({ key, value }) => {
      // this update will cause useEffect to get executed as there is a lookup on 'formik.values'
      formik.setValues({
        ...formik.values,
        [key]: value
      });
    },
    [formik]
  );

  return (
    <>
      {!isLoading && (
        <div className="">
          <div
            tabIndex={0}
            className={`collapse rounded-lg collapse-plus border bg-white ${
              openFilter ? 'collapse-open' : 'collapse-close'
            }`}
          >
            <div
              className="collapse-title text-xl font-medium"
              onClick={() => setOpenFilter((oldVal) => !oldVal)}
            >
              Filters
            </div>
            <div className="collapse-content">
              <div className="sm:col-span-2 md:col-span-4 divider my-1">General Filters</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 lg:gap-x-5 lg:gap-y-3">
                <div className="">
                  <p className="inline-block">Account Type</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 lg:gap-x-5 lg:gap-y-1 font-thin">
                    <InputCheckbox
                      defaultValue={formik.values.personal}
                      updateType="personal"
                      containerStyle="md:col-span-2 mt-1"
                      inputStyle="checkbox-sm checkbox-secondary"
                      labelTitle=" PERSONAL"
                      updateFormValue={updateFormValue}
                    />
                    <InputCheckbox
                      defaultValue={formik.values.merchant}
                      updateType="merchant"
                      containerStyle="md:col-span-2 mt-1"
                      inputStyle="checkbox-sm checkbox-secondary "
                      labelTitle=" MERCHANT"
                      updateFormValue={updateFormValue}
                    />
                  </div>
                </div>
                <div>
                  <p className={'inline-block'}>Account Status</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 lg:gap-x-5 lg:gap-y-1 font-thin">
                    <InputCheckbox
                      defaultValue={formik.values.active}
                      updateType="active"
                      containerStyle="md:col-span-2 mt-1"
                      inputStyle="checkbox-sm checkbox-secondary "
                      labelTitle="ACTIVE"
                      updateFormValue={updateFormValue}
                    />
                    <InputCheckbox
                      defaultValue={formik.values.deleted}
                      updateType="deleted"
                      containerStyle="md:col-span-2 mt-1"
                      inputStyle="checkbox-sm checkbox-secondary "
                      labelTitle="DELETED"
                      updateFormValue={updateFormValue}
                    />
                  </div>
                </div>
                <div>
                  <p className={'inline-block'}>Direction</p>
                  <div className="grid grid-cols-1 gap-1 lg:gap-x-5 lg:gap-y-1 font-thin">
                    <SelectBox
                      options={orderOptions}
                      labelTitle="Period"
                      updateType="direction"
                      placeholder="Select desired direction"
                      labelStyle="hidden"
                      defaultValue={formik.values.direction}
                      updateFormValue={updateFormValue}
                      selectStyle={'select-sm mt-1'}
                    />
                  </div>
                </div>
                <div>
                  <p className={'inline-block'}>Fetch Limit</p>
                  <div className="grid grid-cols-1  gap-1 lg:gap-x-5 lg:gap-y-1 font-thin">
                    <SelectBox
                      options={fetchLimitOptions}
                      labelTitle="Period"
                      updateType="limit"
                      placeholder="Select desired limit"
                      labelStyle="hidden"
                      defaultValue={formik.values.limit}
                      updateFormValue={updateFormValue}
                      selectStyle={'select-sm mt-1'}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 md:col-span-4 divider my-1">Extra Filters</div>
                <div className="sm:col-span-2 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-x-5 lg:gap-y-3 ">
                  <InputText
                    type="text"
                    defaultValue={formik.values.phoneNumber}
                    updateType="phoneNumber"
                    containerStyle=""
                    inputStyle="input-sm"
                    labelTitle="Customer Phone Number"
                    updateFormValue={updateFormValue}
                  />
                  <InputText
                    type="number"
                    defaultValue={formik.values.merchantId}
                    updateType="merchantId"
                    containerStyle=""
                    inputStyle="input-sm"
                    labelTitle="Merchant ID"
                    updateFormValue={updateFormValue}
                  />
                  <InputText
                    type="text"
                    defaultValue={formik.values.merchantName}
                    updateType="merchantName"
                    containerStyle=""
                    inputStyle="input-sm"
                    labelTitle="Merchant Name"
                    updateFormValue={updateFormValue}
                  />
                </div>

                <button
                  onClick={() => {
                    dispatch(setPersonal({ personal: formik.values?.personal }));
                    dispatch(setMerchant({ merchant: formik.values?.merchant }));
                    dispatch(setActive({ active: formik.values?.active }));
                    dispatch(setDeleted({ deleted: formik.values?.deleted }));
                    dispatch(setDirection({ direction: formik.values?.direction }));
                    dispatch(setLimit({ limit: formik.values?.limit }));
                    dispatch(
                      setPhoneNumber({
                        phoneNumber: formik.values?.phoneNumber
                      })
                    );
                    dispatch(setMerchantId({ merchantId: formik.values?.merchantId }));
                    dispatch(
                      setMerchantName({
                        merchantName: formik.values?.merchantName
                      })
                    );

                    onFetchClients();
                  }}
                  className="btn btn-sm btn-outline btn-secondary w-full sm:col-span-2 md:col-start-2 my-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-x-5 lg:gap-y-3 my-4">
            <div className="grid grid-cols-1 gap-3">
              <TopSideButtons extraClasses="btn-sm" />
            </div>
            <div className="md:col-end-3"></div>
          </div>
          {clients.length ? (
            <Clients onLoadClients={handleLoadClients} />
          ) : (
            <InfoText styleClasses={'md:grid-cols-2'}>No client found ...</InfoText>
          )}
        </div>
      )}
    </>
  );
};

export default Customers;
