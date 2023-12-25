import React, { useState } from 'react';

import moment from 'moment';
import { useDispatch } from 'react-redux';

import { MdDeleteOutline } from 'react-icons/md';

import BasicModal from '../../../components/Modals/BasicModal';
import { STATUS_COLORS, STATUS_ICON_NAMES } from '../../../utils/colisUtils';
import { enableScroll } from '../../../utils/functions/preventAndAllowScroll';
import { showNotification } from '../../common/headerSlice';
import { changeColisStatus, deleteColis } from '../parcelsManagementSlice';

const ACTIONS = {
  DELETE: 'DELETE'
};

const DetailsColis = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const [actionsState, setActionsState] = useState({
    [ACTIONS.DELETE]: false
  });

  const onCloseBlockModal = () => {
    enableScroll();
    setActionsState(() => {
      return {
        [ACTIONS.DELETE]: false
      };
    });
  };

  const handleDeleteColis = (method) => {
    setActionsState(() => {
      if (method === ACTIONS.DELETE) {
        return {
          [ACTIONS.DELETE]: true
        };
      }
    });
  };

  return (
    <>
      <BasicModal
        isOpen={actionsState[ACTIONS.DELETE]}
        onProceed={async () => {
          dispatch(
            deleteColis({
              colisId: extraObject?.colis?.id
            })
          ).then(async (response) => {
            if (response?.error) {
              console.log(response);
              dispatch(
                showNotification({
                  message: 'Error while deleting the parcel',
                  status: 0
                })
              );
            } else {
              dispatch(
                showNotification({
                  message: 'Successfully deleted the parcel',
                  status: 1
                })
              );
              closeModal();
            }
          });
        }}
        onClose={onCloseBlockModal}>
        <p>
          ARE YOU SURE YOU WANT TO DELETE THE PARCEL{' '}
          <span className="text-secondary font-semibold">{extraObject?.colis?.code}</span>
        </p>
      </BasicModal>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 sm:mb-3">
        <div className="divider sm:col-span-3 uppercase text-primary font-bold text-3xl">
          {extraObject?.colis?.code}
        </div>
        <div className={'divider sm:col-span-3 m-0'}>General Information</div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Colis Code</h4>
          <div className="col-span-2 text-primary">{extraObject?.colis?.code}</div>
        </div>
        {extraObject?.colis?.colis_statuses?.length ? (
          <div className="grid grid-cols-3 font-semibold">
            <h4 className="uppercase">Status</h4>
            <div className="col-span-2 text-primary">
              {extraObject?.colis?.colis_statuses[
                extraObject?.colis?.colis_statuses?.length - 1
              ]?.colis_status?.code?.replaceAll('_', ' ')}
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Delete</h4>
          <div className="col-span-2 text-primary">
            <button
              className={'btn btn-outline btn-sm btn-error'}
              onClick={() => handleDeleteColis(ACTIONS.DELETE)}>
              <MdDeleteOutline className={''} />
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className={'divider sm:col-span-2 m-0'}>Amount Information</div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Fee</h4>
          <div className="col-span-2 text-primary">{extraObject?.colis?.fee}</div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Fee Payment</h4>
          <div className="col-span-2 text-primary">{extraObject?.colis?.fee_payment}</div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Amount To Collect</h4>
          <div className="col-span-2 text-primary">{extraObject?.colis?.price}</div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Total To Collect</h4>
          <div className="col-span-2 text-secondary font-bold">
            {extraObject?.colis?.fee_payment === 'PREPAID'
              ? extraObject?.colis?.price
              : (extraObject?.colis?.price ? parseInt(extraObject?.colis?.price) : 0) +
                parseInt(extraObject?.colis?.fee)}
          </div>
        </div>
        <div className={'divider sm:col-span-2 m-0'}>Sender Information</div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Client ID</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.client ? extraObject?.colis?.client?.id : 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Phone Number</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.client ? extraObject?.colis?.client?.phone_number : 'N/A'}
          </div>
        </div>
        <div className={'divider sm:col-span-2 m-0'}>Pickup Information</div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Address</h4>
          <div className="col-span-2 text-primary uppercase">
            {extraObject?.colis?.pickup_address_name}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Pickup Phone Number</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.pickup_phone_number || 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Pickup Date</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.pickup_date
              ? moment.utc(extraObject?.colis?.pickup_date).format('DD-MM-YYYY HH:mm')
              : 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Pickup Livreur</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.pickup_livreur
              ? extraObject?.colis?.pickup_livreur?.last_name +
                ' ' +
                extraObject?.colis?.pickup_livreur?.first_name +
                ' - ' +
                extraObject?.colis?.pickup_livreur?.client?.phone_number
              : 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Pickup Latitude</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.pickup_latitude || 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Pickup Longitude</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.pickup_longitude || 'N/A'}
          </div>
        </div>
        <div className={'divider sm:col-span-2 m-0'}>Delivery Information</div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Address</h4>
          <div className="col-span-2 text-primary uppercase">
            {extraObject?.colis?.delivery_address_name}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Delivery Phone Number</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.delivery_phone_number || 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Delivery Date</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.delivery_date
              ? moment.utc(extraObject?.colis?.delivery_date).format('DD-MM-YYYY HH:mm')
              : 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Delivery Livreur</h4>
          <div className="col-span-2 text-primary uppercase">
            {extraObject?.colis?.delivery_livreur
              ? extraObject?.colis?.delivery_livreur?.last_name +
                ' ' +
                extraObject?.colis?.delivery_livreur?.first_name +
                ' - ' +
                extraObject?.colis?.delivery_livreur?.client?.phone_number
              : 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Delivery Latitude</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.delivery_latitude || 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Delivery Longitude</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.colis?.delivery_longitude || 'N/A'}
          </div>
        </div>
        <div className={'divider sm:col-span-2 m-0'}>Creation Information</div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Created At</h4>
          <div className="col-span-2 text-primary">
            {moment.utc(extraObject?.colis?.created_at).format('DD-MM-YYYY HH:mm')}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Last Update At</h4>
          <div className="col-span-2 text-primary">
            {moment.utc(extraObject?.colis?.updated_at).format('DD-MM-YYYY HH:mm')}
          </div>
        </div>
      </div>

      {extraObject?.colis?.colis_statuses?.length ? (
        <>
          <div className={'divider mt-4'}>Status Information</div>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6 mb-4">
            {extraObject?.colis?.colis_statuses?.map((status, i) => (
              <div
                className={`stats shadow ${
                  i === extraObject?.colis?.colis_statuses?.length - 1 ? 'shadow-primary' : ''
                }`}
                key={status?.id}>
                <div className="stat">
                  <div className={`stat-figure dark:text-slate-300 text-primary`}>
                    {STATUS_ICON_NAMES[status?.colis_status?.code?.toUpperCase()]}
                  </div>
                  <div className="stat-title dark:text-slate-300">
                    {status?.colis_status?.code?.replaceAll('_', ' ')}
                  </div>
                  <div
                    className={`stat-value text-xl ${
                      STATUS_COLORS[status?.colis_status?.code?.toUpperCase()]
                    }`}>
                    {status?.created_at
                      ? moment.utc(status?.created_at).format('DD-MM-YYYY')
                      : 'N/A'}
                  </div>
                  <div className={'stat-desc  '}>
                    {status?.created_at
                      ? 'Time: ' + moment.utc(status?.created_at).format('HH:mm')
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default DetailsColis;
