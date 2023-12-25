import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { getMerchantsArticlesContent, getMerchantsBySearch, resetFrom } from './merchantsMenuSlice';
import { useFormik } from 'formik';
import InputCheckbox from '../../components/Input/InputCheckbox';
import SelectBox from '../../components/Input/SelectBox';
import { MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { openModal } from '../common/modalSlice';
import MerchantsList from './components/MerchantsList';
import InfoText from '../../components/Typography/InfoText';
import AsyncSelect from 'react-select/async';
import {
  setActive,
  setAvailability,
  setDeleted,
  setDirection,
  setLimit,
  setMerchantId,
  setMerchantNameLabel,
  setStatus
} from '../common/merchantMenuTableSlice';

const customStyles = {
  control: (base) => ({
    ...base
    // height: '3rem',
  }),
  menu: (base) => ({
    ...base,
    marginBottom: '2rem'
  })
};

const orderOptions = [
  { name: 'Most recent', value: 'DESC' },
  { name: 'Oldest', value: 'ASC' }
];

const fetchLimitOptions = [
  { name: '100', value: '100' },
  { name: '250', value: '250' },
  { name: '500', value: '500' },
  { name: '1000', value: '1000' },
  { name: '1500', value: '1500' }
];

const MerchantsMenu = () => {
  const dispatch = useDispatch();

  const { active, deleted, direction, limit, merchantId, merchantNameLabel, status, availability } =
    useSelector((state) => state.merchantMenuTable);

  const INITIAL_MERCHANTS_FILTER_OBJ = {
    active: active,
    deleted: deleted,
    direction: direction,
    limit: limit,
    searchPattern: '',
    merchantId: merchantId,
    status: status,
    availability: availability
  };

  const openMerchantArticle = (obj) => {
    dispatch(
      openModal({
        header: `Add New Article`,
        bodyType: MODAL_BODY_TYPES.MERCHANT_ARTICLE_ADD_EDIT,
        size: 'lg',
        extraObject: obj
      })
    );
  };

  const { articles, skip, isLoading, noMoreQuery } = useSelector((state) => state.article);

  const formik = useFormik({
    initialValues: INITIAL_MERCHANTS_FILTER_OBJ
  });

  const [openFilter, setOpenFilter] = useState(false);

  const applyFilter = async (dispatchParams) => {
    await dispatch(getMerchantsArticlesContent(dispatchParams));
  };

  const onFetchMerchants = async () => {
    dispatch(resetFrom());
    const dispatchParams = {
      skip: 0,
      active: formik.values.active,
      deleted: formik.values.deleted,
      limit: formik.values.limit,
      direction: formik.values.direction,
      searchPattern: formik.values.searchPattern,
      merchantId: formik.values.merchantId,
      status: formik.values.status,
      availability: formik.values.availability
    };
    applyFilter(dispatchParams);
  };

  const handleLoadMerchants = async (prevPage) => {
    if (!noMoreQuery && !isLoading) {
      const dispatchParams = {
        skip: skip,
        active: formik.values.active,
        deleted: formik.values.deleted,
        limit: formik.values.limit,
        direction: formik.values.direction,
        searchPattern: formik.values.searchPattern,
        merchantId: formik.values.merchantId,
        status: formik.values.status,
        availability: formik.values.availability
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

  const merchantsPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      if (inputValue?.length >= 3) {
        dispatch(getMerchantsBySearch({ searchPattern: inputValue })).then((res) =>
          resolve(
            (res?.payload || [])
              .filter(
                (merchant) =>
                  merchant.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                  merchant.whatsapp.toLowerCase().includes(inputValue.toLowerCase())
              )
              .map((merchant) => {
                return {
                  value: merchant.id,
                  label: `${merchant.name} (${merchant?.whatsapp})`
                };
              })
          )
        );
      } else {
        resolve([]);
      }
    });

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
                  inputStyle="checkbox-sm checkbox-secondary"
                  labelTitle="ACTIVE"
                  updateFormValue={updateFormValue}
                />
                <InputCheckbox
                  defaultValue={formik.values.deleted}
                  updateType="deleted"
                  containerStyle="md:col-span-2 mt-1"
                  inputStyle="checkbox-sm checkbox-secondary"
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
            <div className="sm:col-span-2 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-x-5 lg:gap-y-3 ">
              <div className={`form-control w-full`}>
                <label className="label">
                  <span className={'label-text text-base-content '}>Select Merchant</span>
                </label>
                <AsyncSelect
                  maxMenuHeight={90}
                  cacheOptions
                  defaultOptions
                  loadOptions={merchantsPromiseOptions}
                  styles={customStyles}
                  onChange={(selectedObj) => {
                    updateFormValue({
                      key: 'merchantId',
                      value: selectedObj?.value
                    });
                    dispatch(
                      setMerchantNameLabel({
                        merchantNameLabel: selectedObj?.label
                      })
                    );
                  }}
                  defaultValue={() => {
                    if (merchantId) {
                      return {
                        label: merchantNameLabel,
                        value: merchantId
                      };
                    }
                  }}
                />
              </div>

              <div className={`form-control w-full`}>
                <label className="label">
                  <span className={'label-text text-base-content'}>Select Status</span>
                </label>

                <select
                  className="select select-bordered select-sm"
                  defaultValue={status}
                  onChange={async (e) => {
                    return updateFormValue({
                      key: 'status',
                      value: e.target.value
                    });
                  }}
                >
                  <option value="ALL">ALL</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="UNPUBLISHED">UNPUBLISHED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch(setActive({ active: formik.values?.active }));
                dispatch(setDeleted({ deleted: formik.values?.deleted }));
                dispatch(setDirection({ direction: formik.values?.direction }));
                dispatch(setLimit({ limit: formik.values?.limit }));
                dispatch(
                  setMerchantId({
                    merchantId: formik.values?.merchantId
                  })
                );
                dispatch(setStatus({ status: formik.values?.status }));
                dispatch(
                  setAvailability({
                    availability: formik.values?.availability
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 my-4">
        <button
          className="btn btn-outline w-2/3 btn-sm btn-ghost"
          onClick={() => openMerchantArticle({})}
        >
          Add New Menu
        </button>
      </div>

      {articles.length ? (
        <MerchantsList onLoadMerchants={handleLoadMerchants} />
      ) : (
        <InfoText styleClasses={'md:grid-cols-2'}>No menu found ...</InfoText>
      )}
    </div>
  );
};

export default MerchantsMenu;
