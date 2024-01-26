import React, { useCallback, useEffect, useState } from 'react';

import { useFormik } from 'formik';
import * as _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { AiOutlineUserAdd } from 'react-icons/ai';
import { BiHide, BiShow } from 'react-icons/bi';
import { GoChevronDown } from 'react-icons/go';

import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';

import { getClientsContent, resetFrom } from './clientSlice';
import ClientFilters from './components/ClientFilters';
import Clients from './components/Clients';
import InputCheckbox from '../../components/Input/InputCheckbox';
import InputText from '../../components/Input/InputText';
import SelectBox from '../../components/Input/SelectBox';
import InfoText from '../../components/Typography/InfoText';
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import {
  resetTableCustomerSettings,
  setActive,
  setDeleted,
  setDirection,
  setFieldValue,
  setLimit,
  setMerchant,
  setMerchantId,
  setMerchantName,
  setPersonal,
  setPhoneNumber,
  setSettings
} from '../common/CustomersTableSlice';
import { openModal } from '../common/modalSlice';
import { setOrderStatus } from '../common/ordersTableSlice';
import { setPaginationSize } from '../common/parcelsManagementTableSlice';

/**
 * Grid options configuration for the customer's table.
 * This configures how the data grid behaves and its features.
 */
const gridOptions = {
  paginationPageSize: 20, // Number of items per page in the grid
  suppressExcelExport: true, // Disables the option to export data to Excel
  defaultColDef: {
    sortable: true, // Allows sorting columns
    resizable: true // Allows resizing columns
  }
};

/**
 * Options for ordering the customers in the grid.
 * It allows the user to choose how to sort the data (most recent or oldest).
 */
const orderOptions = [
  { name: 'Most recent', value: 'ASC' }, // Sort by most recent
  { name: 'Oldest', value: 'DESC' } // Sort by oldest
];

/**
 * Options for the number of customers to fetch and display in the grid.
 * It defines limits for data fetching, allowing control over the volume of data loaded.
 */
const fetchLimitOptions = [
  { name: '250', value: '250' }, // Fetch limit of 250
  { name: '500', value: '500' }, // Fetch limit of 500
  { name: '1000', value: '1000' }, // Fetch limit of 1000
  { name: '1500', value: '1500' }, // Fetch limit of 1500
  { name: 'All', value: '1000000000' } // Fetch limit of 1000000000 for all
];

/**
 * Initial state for filter settings.
 *
 * This object is used to initialize and control the visibility state of various filters.
 * Each key represents a specific filter category, and the boolean value indicates whether
 * that filter category is currently active (visible) or not.
 */
const initFilters = {
  accountType: false, // Account type filter is hidden by default.
  accountStatus: false, // Account status filter is initially inactive.
  direction: false, // Direction filter is not visible initially.
  fetchLimit: false, // Fetch limit filter is set to be hidden initially.
  more: false // Additional filters are not shown by default.
};

/**
 * Component to manage customers in a dashboard or similar interface.
 * It utilizes Redux for state management and Formik for handling form data.
 */
const CustomersManager = () => {
  // Accessing Redux dispatch function
  const dispatch = useDispatch();

  // State hook for managing the visibility states of various filters in the component.
  const [filterStates, setFilterStates] = useState(initFilters);

  // Extracting state values from the Redux store
  const {
    clients,
    skip,
    isLoading,
    noMoreQuery,

    personal,
    merchant,
    active,
    deleted,
    direction,
    limit,
    phoneNumber,
    merchantId,
    merchantName,
    paginationSize
  } = useSelector((state) => ({
    clients: state.client.clients,
    skip: state.client.skip,
    isLoading: state.client.isLoading,
    noMoreQuery: state.client.noMoreQuery,

    personal: state.customersTable.personal,
    merchant: state.customersTable.merchant,
    active: state.customersTable.active,
    deleted: state.customersTable.deleted,
    direction: state.customersTable.direction,
    limit: state.customersTable.limit,
    phoneNumber: state.customersTable.phoneNumber,
    merchantId: state.customersTable.merchantId,
    merchantName: state.customersTable.merchantName,
    paginationSize: state.customersTable.paginationSize
  }));

  // const { clients, skip, isLoading, noMoreQuery } = useSelector((state) => state.client);
  //
  // const {
  //   personal,
  //   merchant,
  //   active,
  //   deleted,
  //   direction,
  //   limit,
  //   phoneNumber,
  //   merchantId,
  //   merchantName,
  //   paginationSize
  // } = useSelector((state) => state.customersTable);

  // State to control visibility of stats
  const [showStats, setShowStats] = useState(true);

  // Initial values for the customer filter form
  const initialFilterValues = {
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

  // Formik hook for managing form state
  const formik = useFormik({
    initialValues: initialFilterValues
  });

  // State to control the visibility of the filter section
  const [openFilter, setOpenFilter] = useState(false);

  /**
   * Opens a modal to add a new client.
   */
  const openAddNewClientModal = () => {
    dispatch(
      openModal({
        title: 'Create a New Customer',
        bodyType: MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT,
        size: 'lg',
        extraObject: {
          type: CONFIRMATION_MODAL_CLOSE_TYPES.CLIENT_CLIENTS_OR_EDIT
        }
      })
    );
  };

  /**
   * Dispatches an action to fetch clients based on specified parameters.
   * @param {Object} params - Filter parameters for client data.
   */
  const fetchClients = async (params) => {
    await dispatch(getClientsContent(params));
  };

  /**
   * Handles the loading of clients when triggered, typically by a UI event.
   */
  const handleLoadClients = async () => {
    if (!noMoreQuery && !isLoading) {
      await fetchClients({ skip, ...formik.values });
    }
  };

  /**
   * Initial fetch of clients when the component mounts.
   */
  useEffect(() => {
    dispatch(resetFrom());
    dispatch(resetTableCustomerSettings());
    fetchClients({ skip: 0, ...formik.values });
  }, [dispatch, formik.values]);

  /**
   * Updates a specific value in the form state.
   *
   * This function is memoized using useCallback to prevent unnecessary re-renders.
   * It only depends on formik.setFieldValue, which is a stable function reference.
   *
   * @param {Object} param0 - Object containing the key and value to update.
   * @param {string} param0.key - The key (field name) in the form state to update.
   * @param {any} param0.value - The new value to set for the specified key.
   */
  const updateFormValue = useCallback(
    ({ key, value }) => {
      // Directly set the value of a specific form field using Formik's setFieldValue.
      // This approach is efficient as it avoids updating the entire form state,
      // focusing only on the necessary field.
      formik.setFieldValue(key, value);
    },
    // Dependency on setFieldValue method from Formik. This dependency is stable
    // and ensures the function is only recreated if setFieldValue changes,
    // which is unlikely in normal use cases.
    [formik.setFieldValue]
  );

  /**
   * Changes a specific filter value and optionally resets all filter states.
   *
   * @param {Object} params - Parameters for changing filter.
   * @param {string} params.key - The key of the filter to be changed.
   * @param {*} params.value - The new value for the filter.
   * @param {boolean} [params.resetState=false] - Flag to indicate whether to reset all filter states.
   *
   * This function updates the form values using `updateFormValue` and dispatches an action to update
   * the Redux store. If `resetState` is true, it also resets all filter states to their initial values.
   */
  const changeFilter = async ({ key, value, resetState = false }) => {
    // Update form values using the updateFormValue function
    updateFormValue({ key, value });

    // Reset filterStates to initial if resetState is true
    if (resetState) {
      setFilterStates(initFilters);
    }

    // Dispatch an action to update the Redux store field value
    await dispatch(
      setFieldValue({
        [key]: value
      })
    );
  };

  /**
   * Resets all form fields to their initial states.
   *
   * Resets the fields personal, merchant, active, deleted, direction, limit, searchPattern,
   * phoneNumber, merchantId, and merchantName to their default values. It also resets
   * the states in the Redux store and any local component states related to these fields.
   */
  const resetAllFields = async () => {
    const initialFieldValues = {
      personal: true,
      merchant: true,
      active: true,
      deleted: false,
      direction: 'DESC',
      limit: '500',
      searchPattern: '',
      phoneNumber: '',
      merchantId: '',
      merchantName: ''
    };

    // Update form values to initial states
    formik.setValues(initialFieldValues);

    // Dispatch actions to update Redux store state for each field
    await dispatch(setPersonal({ personal: initialFieldValues.personal }));
    await dispatch(setMerchant({ merchant: initialFieldValues.merchant }));
    await dispatch(setActive({ active: initialFieldValues.active }));
    await dispatch(setDeleted({ deleted: initialFieldValues.deleted }));
    await dispatch(setDirection({ direction: initialFieldValues.direction }));
    await dispatch(setLimit({ limit: initialFieldValues.limit }));
    await dispatch(setPhoneNumber({ phoneNumber: initialFieldValues.phoneNumber }));
    await dispatch(setMerchantId({ merchantId: initialFieldValues.merchantId }));
    await dispatch(setMerchantName({ merchantName: initialFieldValues.merchantName }));

    // Reset any local states related to filters
    setFilterStates(initFilters);

    // Clears the Redux state slice related to clients to its initial state.
    // Additional code to reset fields, if any, goes here
    await dispatch(resetFrom());

    // Re-fetch clients with initial filter settings
    // await fetchClients({ skip: 0, ...initialFieldValues });
    // no need to call as the useEffect already is watching the form variables changes
  };

  const debouncedUpdateFormValue = _.debounce(changeFilter, 1500);

  return (
    <>
      {!isLoading && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="sm:col-start-2 text-right sm:mb-2">
              <button
                className="btn btn-ghost btn-sm normal-case"
                onClick={() => window.location.reload()}>
                <ArrowPathIcon className="w-4 mr-2" />
                Refresh Data
              </button>
              <button
                className="btn btn-ghost btn-sm normal-case"
                onClick={() => {
                  setShowStats((oldValue) => !oldValue);
                }}>
                {showStats ? <BiHide className="w-4 mr-2" /> : <BiShow className="w-4 mr-2" />}
                {showStats ? 'Hide' : 'Show'} Stats
              </button>

              {clients.length ? (
                <select
                  className="select select-ghost select-sm normal-case align-top"
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    gridOptions.api.paginationSetPageSize(newSize);
                    dispatch(setPaginationSize({ paginationSize: newSize || 20 }));
                  }}
                  defaultValue={paginationSize}>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
              ) : (
                <></>
              )}

              <div className="dropdown dropdown-bottom dropdown-end  ml-2">
                <label tabIndex={0} className="btn btn-ghost btn-sm normal-case btn-square ">
                  <EllipsisVerticalIcon className="w-5" />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu menu-compact  p-2 shadow bg-base-100 rounded-box w-52">
                  <li onClick={openAddNewClientModal}>
                    <span>
                      <AiOutlineUserAdd className="w-4" />
                      New Customer
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <ClientFilters
            formik={formik}
            changeFilter={changeFilter}
            initFilters={initFilters}
            filterStates={filterStates}
            setFilterStates={setFilterStates}
          />

          {filterStates?.more && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-x-5 lg:gap-y-3 my-2">
                <InputText
                  type="text"
                  defaultValue={formik.values.phoneNumber}
                  updateType="phoneNumber"
                  containerStyle=""
                  inputStyle="input-sm"
                  labelTitle="Customer Phone Number"
                  updateFormValue={debouncedUpdateFormValue}
                />
                <InputText
                  type="number"
                  defaultValue={formik.values.merchantId}
                  updateType="merchantId"
                  containerStyle=""
                  inputStyle="input-sm"
                  labelTitle="Merchant ID"
                  updateFormValue={debouncedUpdateFormValue}
                />
                <InputText
                  type="text"
                  defaultValue={formik.values.merchantName}
                  updateType="merchantName"
                  containerStyle=""
                  inputStyle="input-sm"
                  labelTitle="Merchant Name"
                  updateFormValue={debouncedUpdateFormValue}
                />
              </div>
            </>
          )}

          <div
            className={
              'hidden sm:block bg-base-300 px-5 border-0 border-y-2 border-y-gray-300 mb-2 text-base-content'
            }>
            <div className={'grid grid-cols-1 sm:grid-cols-7 gap-3 my-2'}>
              <div className="py-2">Filters</div>
              {/*
              personal: personal,
              merchant: merchant,
              active: active,
              deleted: deleted,
              // direction: direction ? direction : 'DESC',
              // limit: limit ? limit : '500',
              // searchPattern: '',
              phoneNumber: phoneNumber ? phoneNumber : '',
              merchantId: merchantId ? merchantId : '',
              merchantName: merchantName ? merchantName : ''
              */}
              <div className="sm:col-span-5">
                <div className={'w-full overflow-scroll py-2'}>
                  {(formik.values.personal || formik.values.merchant) && (
                    <span className="p-2 mx-2 font-thin text-xs rounded-full bg-secondary-content flex-shrink-0 flex-grow-0 whitespace-nowrap">
                      Type
                      <span className="text-secondary font-bold ml-1">
                        {formik.values.personal && formik.values.merchant
                          ? 'Personal & Merchant'
                          : formik.values.personal
                          ? 'Personal'
                          : formik.values.merchant
                          ? 'Merchant'
                          : ''}
                      </span>
                    </span>
                  )}
                  {Object.entries({
                    limit: 'Limit',
                    direction: 'Sort',
                    phoneNumber: 'Client Number',
                    merchantName: 'Merchant Number',
                    merchantId: 'Merchant Id'
                  }).map(
                    (filter) =>
                      formik.values[filter[0]] && (
                        <span
                          className="p-2 mx-2 font-thin text-xs rounded-full bg-secondary-content flex-shrink-0 flex-grow-0 whitespace-nowrap"
                          key={filter[0]}>
                          {filter[1]}
                          <span className="text-secondary font-bold ml-1">
                            {formik.values[filter[0]] === '1000000000'
                              ? 'ALL'
                              : formik.values[filter[0]]?.toUpperCase()}
                          </span>
                        </span>
                      )
                  )}

                  {(formik.values.active || formik.values.deleted) && (
                    <span className="p-2 mx-2 font-thin text-xs rounded-full bg-secondary-content flex-shrink-0 flex-grow-0 whitespace-nowrap">
                      Status
                      <span className="text-secondary font-bold ml-1">
                        {formik.values.active && formik.values.deleted
                          ? 'Active & Deleted'
                          : formik.values.active
                          ? 'Active'
                          : formik.values.deleted
                          ? 'Deleted'
                          : ''}{' '}
                        Customers
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <div className="py-2 justify-center">
                <button className={'btn btn-xs btn-outline btn-ghost'} onClick={resetAllFields}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {clients.length ? (
            <Clients onLoadClients={handleLoadClients} gridOptions={gridOptions} />
          ) : (
            <InfoText styleClasses={'md:grid-cols-2'}>No client found ...</InfoText>
          )}
        </div>
      )}
    </>
  );
};

export default CustomersManager;
