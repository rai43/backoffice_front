import React, { useEffect, useState } from 'react';

import { useFormik } from 'formik';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';

import { AiOutlineFileDone, AiOutlineFieldTime } from 'react-icons/ai';
import { CgSmileNone } from 'react-icons/cg';
import { CiWarning } from 'react-icons/ci';
import { FcCancel } from 'react-icons/fc';
import { GiSandsOfTime, GiTimeBomb } from 'react-icons/gi';
import { GoEyeClosed } from 'react-icons/go';
import { IoReturnDownBackOutline } from 'react-icons/io5';
import {
  MdOutlineCancel,
  MdOutlineAssignmentInd,
  MdOutlineDeliveryDining,
  MdOutlineWarehouse,
  MdDoneAll
} from 'react-icons/md';
import { TbUserCancel } from 'react-icons/tb';

import { getColisStatistics } from './controlPanelSlice';
import { setFrom, setTo } from '../../common/colisControlPanelTableSlice';

// import { openModal } from "../common/modalSlice";
// import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
// import { getDiscounts } from "./discountManagementSlice";
// import InfoText from "../../components/Typography/InfoText";
// import CodeList from "./components/CodeList";

function ColisControlPanel() {
  const dispatch = useDispatch();
  const { from, to } = useSelector((state) => state.colisControlPanelTable);

  const INITIAL_WALLET_FILTER_OBJ = {
    from: from,
    to: to,
    type: '',
    status: ''
  };

  const {
    isLoading,
    colis,
    totalCount,
    pendingCount,
    registeredCount,
    canceledCount,
    assignedForCollectionCount,
    collectionInProgressCount,
    collectedCount,
    notCollectedCount,
    warehousedCount,
    assignedForDeliveryCount,
    waitingForDeliveryCount,
    deliveryInProgressCount,
    deliveredCount,
    notDeliveredCount,
    articleToReturnCount,
    assignedForReturnCount,
    returnInProgressCount,
    returnedCount,
    notReturnedCount,
    refusedCount,
    lostCount
  } = useSelector((state) => state.controlPanel);

  const formik = useFormik({
    initialValues: INITIAL_WALLET_FILTER_OBJ
  });

  const [dateValue, setDateValue] = useState({
    startDate: formik.values.from,
    endDate: formik.values.to
  });

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
    await dispatch(getColisStatistics(dispatchParams));
  };

  useEffect(() => {
    const dispatchParams = {
      to: formik.values.to,
      from: formik.values.from
    };
    applyFilter(dispatchParams);
  }, [formik.values.to]);

  return (
    <div className={'mb-2'}>
      <div className="grid sm:grid-cols-3 gap-3 mt-2">
        <h4 className={'sm:col-span-2'}>
          Logistics Statistics from{' '}
          <span className="font-semibold">
            {moment.utc(dateValue.startDate).format('DD-MM-YYYY')}
          </span>{' '}
          to{' '}
          <span className="font-semibold">
            {moment.utc(dateValue.endDate).format('DD-MM-YYYY')}
          </span>
        </h4>
        <div className="">
          <Datepicker
            containerClassName="w-full"
            value={dateValue}
            theme={'light'}
            inputClassName="input input-bordered w-full input-sm"
            popoverDirection={'down'}
            toggleClassName="invisible"
            onChange={handleDatePickerValueChange}
            showShortcuts={true}
            primaryColor={'white'}
          />
        </div>
      </div>
      {!isLoading ? (
        <>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <GiSandsOfTime className={'h-6 w-6'} />
                </div>
                <div className="stat-value">{pendingCount}</div>
                <div className="stat-title">Parcel{pendingCount > 0 ? 's' : ''}</div>
                <div className="stat-desc text-primary">Waiting for action</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-accent">
                  <AiOutlineFileDone className={'h-6 w-6'} />
                </div>
                <div className="stat-value">{registeredCount}</div>
                <div className="stat-title">Parcel{registeredCount > 0 ? 's' : ''}</div>
                <div className="stat-desc text-accent">Registered</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary">
                  <MdOutlineCancel className={'h-6 w-6'} />
                </div>
                <div className="stat-value">{canceledCount}</div>
                <div className="stat-title">Parcel{canceledCount > 0 ? 's' : ''}</div>
                <div className="stat-desc text-secondary">Canceled</div>
              </div>
            </div>

            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-warning">
                  <IoReturnDownBackOutline className={'h-6 w-6'} />
                </div>
                <div className="stat-value">{returnedCount}</div>
                <div className="stat-title">Parcel{returnedCount > 0 ? 's' : ''}</div>
                <div className="stat-desc text-warning">Returned</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-error">
                  <CgSmileNone className={'h-6 w-6'} />
                </div>
                <div className="stat-value">{refusedCount}</div>
                <div className="stat-title">Refused Parcel{refusedCount > 0 ? 's' : ''}</div>
                <div className="stat-desc text-error">Waiting for action</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-error-content">
                  <GoEyeClosed className={'h-6 w-6'} />
                </div>
                <div className="stat-value text-error-content">{lostCount}</div>
                <div className="stat-title">Parcel{lostCount > 0 ? 's' : ''}</div>
                <div className="stat-desc text-error-content">Lost</div>
              </div>
            </div>
          </div>
          <div className={'divider'}>Collection</div>
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <AiOutlineFileDone className={'h-8 w-8'} />
              </div>
              <div className="stat-title">Registered</div>
              <div className="stat-value">{registeredCount}</div>
              <div className="stat-desc">
                Still <span className={'font-semibold'}>{pendingCount}</span> pending
              </div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <MdOutlineAssignmentInd className={'h-8 w-8'} />
              </div>
              <div className="stat-title">Assigned</div>
              <div className="stat-value">{assignedForCollectionCount}</div>
              <div className="stat-desc">For collection</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <MdOutlineDeliveryDining className={'h-8 w-8'} />
              </div>
              <div className="stat-title">Pick up of </div>
              <div className="stat-value">{collectionInProgressCount}</div>
              <div className="stat-desc">In progress</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-success">
                <AiOutlineFileDone className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{collectedCount}</div>
              <div className="stat-title">Parcel{collectedCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-success">Collected</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-error">
                <MdOutlineCancel className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{notCollectedCount}</div>
              <div className="stat-title">Parcel{notCollectedCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-error">Not collected</div>
            </div>
          </div>

          <div className={'divider'}>Warehouse</div>
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <AiOutlineFileDone className={'h-8 w-8'} />
              </div>
              <div className="stat-title">Collected</div>
              <div className="stat-value">{collectedCount}</div>
              {/*<div className="stat-desc">For collection</div>*/}
            </div>

            <div className="stat">
              <div className="stat-figure text-primary">
                <MdOutlineWarehouse className={'h-8 w-8'} />
              </div>
              <div className="stat-title">Warehouse</div>
              <div className="stat-value">{warehousedCount}</div>
              {/*<div className="stat-desc">For collection</div>*/}
            </div>

            <div className="stat">
              <div className="stat-figure text-success">
                <MdOutlineAssignmentInd className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{assignedForDeliveryCount}</div>
              <div className="stat-title">Parcel{assignedForDeliveryCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-success">Assigned for delivery</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-error">
                <CiWarning className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{collectedCount + warehousedCount}</div>
              <div className="stat-title">
                Parcel{collectedCount + warehousedCount > 0 ? 's' : ''}
              </div>
              <div className="stat-desc text-error">Not yet assigned for delivery</div>
            </div>
          </div>

          <div className={'divider'}>Delivery</div>
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-success-content">
                <MdOutlineAssignmentInd className={'h-8 w-8'} />
              </div>
              <div className="stat-title">Assigned</div>
              <div className="stat-value">{collectedCount}</div>
              <div className="stat-desc">For Delivery</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-success-content">
                <AiOutlineFieldTime className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{waitingForDeliveryCount}</div>
              <div className="stat-title">Parcel{waitingForDeliveryCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-success-content">Waiting for delivery</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-success-content">
                <MdOutlineDeliveryDining className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{deliveryInProgressCount}</div>
              <div className="stat-title">Delivery</div>
              <div className="stat-desc text-success-content">in progress</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-success">
                <MdDoneAll className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{deliveredCount}</div>
              <div className="stat-title">Parcel{deliveredCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-success">Delivered</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-warning">
                <CiWarning className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{notDeliveredCount}</div>
              <div className="stat-title">Parcel{notDeliveredCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-warning">Not delivered</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-error">
                <TbUserCancel className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{refusedCount}</div>
              <div className="stat-title">Parcel{refusedCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-error">Refused</div>
            </div>
          </div>

          <div className={'divider'}>Return</div>
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-secondary-focus">
                <GiTimeBomb className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{articleToReturnCount}</div>
              <div className="stat-title">Parcel{articleToReturnCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-secondary-focus">To be returned</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary-focus">
                <MdOutlineAssignmentInd className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{assignedForReturnCount}</div>
              <div className="stat-title">Parcel{assignedForReturnCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-secondary-focus">Assigned for return</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary-focus">
                <MdOutlineDeliveryDining className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{returnInProgressCount}</div>
              <div className="stat-title">Parcel{returnInProgressCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-secondary-focus">Being returned</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">
                <IoReturnDownBackOutline className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{returnedCount}</div>
              <div className="stat-title">Parcel{returnedCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-accent">Returned</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-error">
                <FcCancel className={'h-8 w-8'} />
              </div>
              <div className="stat-value">{notReturnedCount}</div>
              <div className="stat-title">Parcel{notReturnedCount > 0 ? 's' : ''}</div>
              <div className="stat-desc text-error">Not Returned</div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ColisControlPanel;
