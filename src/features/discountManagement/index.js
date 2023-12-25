import React, { useEffect, useState } from 'react';

import { useFormik } from 'formik';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';

import { BiHide, BiShow } from 'react-icons/bi';
import { IoAdd } from 'react-icons/io5';

import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';

import DiscountList from './components/DiscountList';
import { getDiscounts } from './discountManagementSlice';
import InfoText from '../../components/Typography/InfoText';
import { MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { setFrom, setTo, setPaginationSize } from '../common/discountManagementTableSlice';
import { openModal } from '../common/modalSlice';

const gridOptions = {
  paginationPageSize: 20,
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};
const DiscountManagement = () => {
  const dispatch = useDispatch();
  const [showStats, setShowStats] = useState(true);
  const { from, to } = useSelector((state) => state.discountManagementTable);

  const INITIAL_WALLET_FILTER_OBJ = {
    from: from,
    to: to,
    type: '',
    status: ''
  };

  const { discounts } = useSelector((state) => state.discount);

  const formik = useFormik({
    initialValues: INITIAL_WALLET_FILTER_OBJ
  });

  const [dateValue, setDateValue] = useState({
    startDate: formik.values.from,
    endDate: formik.values.to
  });

  const { paginationSize } = useSelector((state) => state.discountManagementTable);

  const handleDatePickerValueChange = (newValue) => {
    setDateValue(newValue);
    formik.setValues({
      ...formik.values,
      from: newValue.startDate,
      to: newValue.endDate
    });
    dispatch(
      setFrom({
        from: newValue.startDate
      })
    );
    dispatch(
      setTo({
        to: newValue.endDate
      })
    );
  };

  const applyFilter = async (dispatchParams) => {
    await dispatch(getDiscounts(dispatchParams));
  };

  useEffect(() => {
    const dispatchParams = {
      to: formik.values.to,
      from: formik.values.from
    };
    applyFilter(dispatchParams);
  }, [formik.values.to]);

  return (
    <div>
      {/*  We got{' '}*/}
      {/*  <span className={'text-primary font-semibold'}>*/}
      {/*    {discounts?.reduce((accumulator, currentObj) => {*/}
      {/*      return (*/}
      {/*        accumulator +*/}
      {/*        currentObj?.article_commandes?.filter((article) => {*/}
      {/*          return article?.commande?.commande_commande_statuses?.some((status) => {*/}
      {/*            return status?.commande_status?.code === 'DELIVERED';*/}
      {/*          });*/}
      {/*        }).length*/}
      {/*      );*/}
      {/*    }, 0)}*/}
      {/*  </span>{' '}*/}
      {/*  discount from{' '}*/}
      {/*  <span className="font-semibold">*/}
      {/*    {moment.utc(dateValue.startDate).format('DD/MM/YYYY')}*/}
      {/*  </span>{' '}*/}
      {/*  to{' '}*/}
      {/*  <span className="font-semibold">{moment.utc(dateValue.endDate).format('DD/MM/YYYY')}</span>*/}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center ">
          <Datepicker
            containerClassName="w-full sm:w-72"
            value={dateValue}
            theme={'light'}
            inputClassName="input input-bordered w-full"
            popoverDirection={'down'}
            toggleClassName="invisible"
            onChange={handleDatePickerValueChange}
            showShortcuts={true}
            primaryColor={'white'}
          />
        </div>
        <div className="text-right sm:mb-2">
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
          {discounts.length ? (
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
              <li
                onClick={() => {
                  dispatch(
                    openModal({
                      title: 'Add Discount',
                      size: 'lg',
                      bodyType: MODAL_BODY_TYPES.DISCOUNT_ADD_OR_EDIT,
                      extraObject: { dateValue }
                    })
                  );
                }}>
                <span>
                  <IoAdd className="w-4" />
                  New Discount
                </span>
              </li>
              <li>
                <span>
                  <ArrowDownTrayIcon className="w-4" />
                  Download
                </span>
              </li>
              <li>
                <span>
                  <EnvelopeIcon className="w-4" />
                  Email Digests
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {discounts.length ? (
        <>
          <DiscountList dateValue={dateValue} gridOptions={gridOptions} />
        </>
      ) : (
        <InfoText styleClasses={'md:grid-cols-2'}>
          No client found from{' '}
          <span className="font-semibold">
            {moment.utc(dateValue.startDate).format('DD/MM/YYYY')}
          </span>{' '}
          to{' '}
          <span className="font-semibold">
            {moment.utc(dateValue.endDate).format('DD/MM/YYYY')}
          </span>
        </InfoText>
      )}
    </div>
  );
};

export default DiscountManagement;
