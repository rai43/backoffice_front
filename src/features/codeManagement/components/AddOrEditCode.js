import React, { useState, useRef, useCallback } from 'react';

import { MdContentCopy } from 'react-icons/md';

import flatpickr from 'flatpickr';
import { useFormik } from 'formik';
import moment from 'moment';

import 'flatpickr/dist/flatpickr.css';
import { useDispatch } from 'react-redux';

import { handleCopyClick } from '../../../utils/functions/handleCopyClick';
import { showNotification } from '../../common/headerSlice';
import { saveCode, updateCode } from '../codeManagementSlice';
const AddOrEditCode = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();

  const [isHovered, setIsHovered] = useState(false);

  const datePickerFrom = useRef();
  const datePickerTo = useRef();

  const INITIAL_FILTER_OBJ = {
    discount_type: extraObject?.discountObject
      ? extraObject?.discountObject?.discount_type?.toLocaleLowerCase()
      : 'amount',
    discount: extraObject?.discountObject ? parseInt(extraObject?.discountObject?.discount) : 500,
    min_amount: extraObject?.discountObject ? parseInt(extraObject?.discountObject?.min_amount) : 0,
    description: extraObject?.discountObject ? extraObject?.discountObject?.description : '',
    active: extraObject?.discountObject ? extraObject?.discountObject?.active : true,
    one_time_code: extraObject?.discountObject ? extraObject?.discountObject?.one_time_code : false
  };

  const [discountCodeInfo, setDiscountCodeInfo] = useState({
    showDiscountCode: false,
    discountObj: {}
  });

  const [dateInterval, setDateInterval] = useState({
    from: extraObject?.discountObject
      ? moment.utc(extraObject?.discountObject?.start_date).format('YYYY-MM-DD HH:mm')
      : moment.utc().format('YYYY-MM-DD HH:mm'),
    to: extraObject?.discountObject
      ? moment.utc(extraObject?.discountObject?.end_date).format('YYYY-MM-DD HH:mm')
      : moment.utc().add(1, 'days').format('YYYY-MM-DD HH:mm')
  });

  const inputRefFrom = useCallback((node) => {
    if (node !== null) {
      datePickerFrom.current = flatpickr(node, {
        enableTime: true,
        defaultDate: dateInterval.from,
        dateFormat: 'Y-m-d H:i',
        time_24hr: true,
        onChange: (date) => {
          setDateInterval((oldValues) => {
            return { ...oldValues, from: moment.utc(date[0]) };
          });
        }
      });
    }
  }, []);

  const inputRefTo = useCallback((node) => {
    if (node !== null) {
      datePickerTo.current = flatpickr(node, {
        enableTime: true,
        defaultDate: dateInterval.to,
        dateFormat: 'Y-m-d H:i',
        time_24hr: true,
        onChange: (date) => {
          setDateInterval((oldValues) => {
            return { ...oldValues, to: moment.utc(date[0]) };
          });
        }
      });
    }
  }, []);

  const formik = useFormik({
    initialValues: INITIAL_FILTER_OBJ
  });

  return (
    <div>
      {!discountCodeInfo?.showDiscountCode ? (
        <div>
          <div className="grid md:grid-cols-4 gap-3 mb-[3rem]">
            <div className={`form-control w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Start From</span>
              </label>
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                ref={inputRefFrom}
              />
            </div>
            <div className={`form-control w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Upto</span>
              </label>
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                ref={inputRefTo}
              />
            </div>
            <div className={`form-control w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Discount Type</span>
              </label>
              <select
                className="select select-sm select-bordered w-full max-w-xs"
                value={formik.values?.discount_type}
                onChange={(e) => {
                  formik.setValues({
                    ...formik.values,
                    discount_type: e.target.value || 'amount'
                  });
                }}>
                <option value={'amount'}>Amount</option>
                <option value={'percentage'}>Percentage</option>
              </select>
            </div>
            <div className={`form-control w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Discount Value</span>
              </label>
              <select
                className="select select-sm select-bordered w-full max-w-xs"
                value={formik.values?.discount}
                onChange={(e) => {
                  formik.setValues({
                    ...formik.values,
                    discount: e.target.value || 0
                  });
                }}>
                <option value={500}>REMBOURSEMENT 500F</option>
                <option value={1000}>REMBOURSEMENT 1000F</option>
                <option value={1500}>REMBOURSEMENT 1500F</option>
                <option value={50}>REMBOURSEMENT 50%</option>
                <option value={100}>REMBOURSEMENT 100%</option>
              </select>
            </div>
            <div className={`form-control w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Minimum Value</span>
              </label>
              <input
                type="number"
                value={formik.values.min_amount}
                className="input input-sm input-bordered w-full"
                onChange={(e) => {
                  formik.setValues({
                    ...formik.values,
                    min_amount: e.target.value
                  });
                }}
              />
            </div>
            <div className={`form-control col-span-3 w-full`}>
              <label className="label">
                <span className={'label-text text-base-content '}>Description</span>
              </label>
              <input
                type="text"
                value={formik.values.description}
                className="input input-sm input-bordered w-full"
                onChange={(e) => {
                  formik.setValues({
                    ...formik.values,
                    description: e.target.value
                  });
                }}
              />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Is Active ?</span>
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
                  onChange={(e) => {
                    formik.setValues({
                      ...formik.values,
                      active: e.target.checked
                    });
                  }}
                  checked={formik.values.active}
                />
              </label>
            </div>
            <div className="form-control md:col-start-3 w-full">
              <label className="label cursor-pointer">
                <span className="label-text">Is One Time Use ?</span>
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
                  onChange={(e) => {
                    formik.setValues({
                      ...formik.values,
                      one_time_code: e.target.checked
                    });
                  }}
                  checked={formik.values.one_time_code}
                />
              </label>
            </div>
          </div>
          <div className="md:grid md:grid-cols-3 gap-3">
            <button
              className="md:col-start-2 w-full btn btn-outline btn-secondary btn-sm"
              onClick={async () => {
                if (
                  !dateInterval.from ||
                  !dateInterval.to ||
                  !formik.values.description ||
                  (formik.values.discount_type !== 'amount' &&
                    formik.values.discount_type !== 'percentage') ||
                  parseInt(formik.values.discount) === 0 ||
                  !formik.values.discount
                ) {
                  dispatch(
                    showNotification({
                      message: 'Could not proceed as some values are not correctly set',
                      status: 0
                    })
                  );
                  return;
                }
                if (extraObject?.discountObject) {
                  // FOR UPDATE
                  await dispatch(
                    updateCode({
                      from: dateInterval.from,
                      to: dateInterval.to,
                      discount_type: formik.values.discount_type,
                      discount: parseInt(formik.values.discount),
                      min_amount: parseInt(formik.values.min_amount),
                      description: formik.values.description,
                      active: formik.values.active,
                      one_time_code: formik.values.one_time_code,
                      code_id: extraObject?.discountObject?.id
                    })
                  ).then(async (response) => {
                    if (response?.error) {
                      dispatch(
                        showNotification({
                          message: 'Error while update the discount',
                          status: 0
                        })
                      );
                    } else {
                      dispatch(
                        showNotification({
                          message: 'Succefully created the discounts',
                          status: 1
                        })
                      );
                      closeModal();
                    }
                  });
                } else {
                  // FOR NEW INSERTION
                  console.log({ formik: formik.values, dateInterval });
                  await dispatch(
                    saveCode({
                      from: dateInterval.from,
                      to: dateInterval.to,
                      discount_type: formik.values.discount_type,
                      discount: parseInt(formik.values.discount),
                      min_amount: parseInt(formik.values.min_amount),
                      description: formik.values.description,
                      active: formik.values.active,
                      one_time_code: formik.values.one_time_code
                    })
                  ).then(async (response) => {
                    if (response?.error) {
                      dispatch(
                        showNotification({
                          message: 'Error while creating the discount code',
                          status: 0
                        })
                      );
                    } else {
                      dispatch(
                        showNotification({
                          message: 'Successfully created the discount code',
                          status: 1
                        })
                      );
                      if (response?.payload?.code?.code) {
                        setDiscountCodeInfo((oldData) => {
                          return {
                            ...oldData,
                            showDiscountCode: true,
                            discountObj: response?.payload?.code
                          };
                        });
                      }
                    }
                  });
                }
              }}>
              {extraObject?.discountObject ? 'Update Code' : 'Generate Code'}
            </button>
          </div>{' '}
        </div>
      ) : (
        <div className="flex items-center justify-center font-semibold text-secondary font-bold">
          {discountCodeInfo?.discountObj?.code?.split('').map((char, i) => (
            <kbd className="kbd mx-1" key={i}>
              {char}
            </kbd>
          ))}
          <kbd
            className="tooltip tooltip-right"
            data-tip={isHovered ? 'Click to copy' : ''}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => handleCopyClick(discountCodeInfo?.discountObj?.code, dispatch)}>
            <MdContentCopy className="ml-4 w-6 h-6" />
          </kbd>
        </div>
      )}
    </div>
  );
};

export default AddOrEditCode;
