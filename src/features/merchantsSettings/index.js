import React, { useCallback, useEffect, useState } from 'react';

import InputText from '../../components/Input/InputText';
import { useDispatch, useSelector } from 'react-redux';
import { getMerchantsContent, resetForm } from './merchantsSettingsSlice';
import { useFormik } from 'formik';
import InputCheckbox from '../../components/Input/InputCheckbox';
import SelectBox from '../../components/Input/SelectBox';
import MerchantsList from './components/MerchantsList';
import InfoText from '../../components/Typography/InfoText';
import {
  setActive,
  setDeleted,
  setDirection,
  setLimit,
  setMerchantId,
  setMerchantName
} from '../common/merchantSettingsTableSlice';

const orderOptions = [
  { name: 'Most recent', value: 'DESC' },
  { name: 'Oldest', value: 'ASC' }
];

const fetchLimitOptions = [
  { name: '10', value: '10' },
  { name: '30', value: '30' },
  { name: '50', value: '50' },
  { name: '100', value: '100' },
  { name: '250', value: '250' },
  { name: '500', value: '500' },
  { name: '1000', value: '1000' },
  { name: '1500', value: '1500' }
];

const MerchantsMenu = () => {
  const dispatch = useDispatch();

  const { active, deleted, direction, limit, merchantId, merchantName } = useSelector(
    (state) => state.merchantSettingsTable
  );

  const INITIAL_MERCHANTS_FILTER_OBJ = {
    active: active,
    deleted: deleted,
    direction: direction,
    limit: limit,
    searchPattern: '',
    merchantId: merchantId,
    merchantName: merchantName
  };

  const { merchants, skip, isLoading, noMoreQuery } = useSelector((state) => state.merchant);

  const formik = useFormik({
    initialValues: INITIAL_MERCHANTS_FILTER_OBJ
  });

  const [openFilter, setOpenFilter] = useState(false);

  const applyFilter = async (dispatchParams) => {
    await dispatch(getMerchantsContent(dispatchParams));
  };

  const onFetchMerchants = async () => {
    dispatch(resetForm());
    const dispatchParams = {
      skip: 0,
      active: formik.values.active,
      deleted: formik.values.deleted,
      limit: formik.values.limit,
      direction: formik.values.direction,
      searchPattern: formik.values.searchPattern,
      merchantId: formik.values.merchantId,
      merchantName: formik.values.merchantName
    };
    applyFilter(dispatchParams);
  };

  const handleLoadMerchants = async () => {
    if (!noMoreQuery && !isLoading) {
      const dispatchParams = {
        skip: skip,
        active: formik.values.active,
        deleted: formik.values.deleted,
        limit: formik.values.limit,
        direction: formik.values.direction,
        searchPattern: formik.values.searchPattern,
        merchantId: formik.values.merchantId,
        merchantName: formik.values.merchantName
      };

      await applyFilter(dispatchParams);
    }
  };

  const updateFormValue = useCallback(
    ({ key, value }) => {
      formik.setValues({
        ...formik.values,
        [key]: value
      });
    },
    [formik]
  );

  useEffect(() => {
    onFetchMerchants();
  }, []);

  return (
    <div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-x-5 lg:gap-y-3">
            <div>
              <p className={'inline-block'}>Account Status</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1 lg:gap-x-5 lg:gap-y-1 font-thin">
                <InputCheckbox
                  defaultValue={formik.values.active}
                  updateType="active"
                  containerStyle="md:col-span-2 mt-1"
                  inputStyle="checkbox-sm"
                  labelTitle="ACTIVE"
                  updateFormValue={updateFormValue}
                />
                <InputCheckbox
                  defaultValue={formik.values.deleted}
                  updateType="deleted"
                  containerStyle="md:col-span-2 mt-1"
                  inputStyle="checkbox-sm"
                  labelTitle="DELETED"
                  updateFormValue={updateFormValue}
                />
              </div>
            </div>
            <div>
              <p className={'inline-block'}>Direction</p>
              <div className="grid grid-cols-1  gap-1 lg:gap-x-5 lg:gap-y-1 font-thin">
                <SelectBox
                  options={orderOptions}
                  labelTitle="Period"
                  updateType="direction"
                  placeholder="Select desired direction"
                  labelStyle="hidden"
                  selectStyle={'select-sm'}
                  defaultValue={formik.values.direction}
                  updateFormValue={updateFormValue}
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
                  selectStyle={'select-sm'}
                  defaultValue={formik.values.limit}
                  updateFormValue={updateFormValue}
                />
              </div>
            </div>
            <div className="sm:col-span-2 md:col-span-4 divider my-1">Extra Filters</div>
            <div className="sm:col-span-2 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-x-5 lg:gap-y-3">
              <InputText
                type="text"
                defaultValue={formik.values.merchantName}
                updateType="merchantName"
                containerStyle=""
                inputStyle="input-sm"
                labelTitle="Merchant Name"
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
            </div>
            <button
              onClick={() => {
                dispatch(setActive({ active: formik.values?.active }));
                dispatch(setDeleted({ deleted: formik.values?.deleted }));
                dispatch(setDirection({ direction: formik.values?.direction }));
                dispatch(setLimit({ limit: formik.values?.limit }));
                dispatch(setMerchantId({ merchantId: formik.values?.merchantId }));
                dispatch(
                  setMerchantName({
                    merchantName: formik.values?.merchantName
                  })
                );

                onFetchMerchants();
              }}
              className="btn btn-outline btn-primary w-full sm:col-span-1 md:col-start-2 my-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {merchants.length ? (
        <MerchantsList onLoadMerchants={handleLoadMerchants} />
      ) : (
        <InfoText styleClasses={'md:grid-cols-2'}>No client found ...</InfoText>
      )}
    </div>
  );
};

export default MerchantsMenu;
