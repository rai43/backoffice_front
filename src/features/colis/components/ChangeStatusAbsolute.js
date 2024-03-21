import React, { useCallback, useState } from 'react';

import { useDispatch } from 'react-redux';

import { BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs';
import { GiConfirmed } from 'react-icons/gi';
import { GoEyeClosed } from 'react-icons/go';
import { MdOutlineDeliveryDining } from 'react-icons/md';
import { TiCancel } from 'react-icons/ti';

import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';
import { STATUS_ACTIONS, STATUS_ICON_NAMES } from '../../../utils/colisUtils';
import { showNotification } from '../../common/headerSlice';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import { changeColisStatus } from '../parcelsManagementSlice';

const ChangeStatusAbsolute = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const [move, setMove] = useState(''); // front or back
  const [confirmAction, setConfirmAction] = useState('');
  const [chooseLivreur, setChooseLivreur] = useState(false);
  const [livreur, setLivreur] = useState('');
  const [statusActions, setStatusActions] = useState(
    STATUS_ACTIONS[
      extraObject?.colis?.colis_statuses[0]?.colis_status?.code?.toUpperCase()
      // extraObject?.colis?.colis_statuses?.length - 1
    ]
  );

  const updateForm = useCallback(({ key, value }) => {
    if (key === 'livreur') {
      return setLivreur(value);
    }
  }, []);

  const livreursPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      if (inputValue?.length >= 3) {
        dispatch(getLivreursBySearch({ searchPattern: inputValue })).then((res) =>
          resolve(
            (res?.payload.livreurs || [])
              .filter(
                (livreur) =>
                  livreur?.first_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.last_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.whatsapp?.toLowerCase()?.includes(inputValue.toLowerCase())
              )
              .map((livreur) => {
                return {
                  value: livreur.id,
                  label: `${livreur.first_name} ${livreur.last_name} (${livreur?.whatsapp})`
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
      <div className="flex justify-center">
        <div className={'divider'}>Current Status</div>

        <span className={'p-2 shadow shadow-primary rounded'}>
          {extraObject?.colis?.colis_statuses[0]?.colis_status?.code
            // extraObject?.colis?.colis_statuses?.length - 1
            ?.toUpperCase()
            ?.replaceAll('_', ' ')}
        </span>
      </div>
      {!confirmAction?.length ? (
        <>
          <div className={'divider my-5'}>Actions</div>
          <div className="flex justify-around flex-wrap gap-3">
            {statusActions?.BACK?.length && move === '' ? (
              <button
                className={'inline-flex btn btn-outline btn-primary'}
                onClick={() => setMove((_) => 'back')}>
                <BsChevronDoubleLeft className={'mr-2 h-4 w-4'} /> Move Backward
              </button>
            ) : (
              <></>
            )}
            {statusActions?.CAN_CANCEL && move === '' ? (
              <button
                className={'inline-flex btn btn-outline btn-secondary'}
                onClick={() => setConfirmAction((_) => 'CANCELED')}>
                Mark As Canceled <TiCancel className={'ml-2 h-4 w-4'} />
              </button>
            ) : (
              <></>
            )}
            {statusActions?.CAN_DECLARE_LOST && move === '' ? (
              <button
                className={'inline-flex btn btn-outline btn-error'}
                onClick={() => {
                  setConfirmAction((_) => 'LOST');
                }}>
                Mark As Lost <GoEyeClosed className={'ml-2 h-4 w-4'} />
              </button>
            ) : (
              <></>
            )}
            {statusActions?.FRONT?.length && move === '' ? (
              <button
                className={'inline-flex btn btn-outline btn-accent '}
                onClick={() => setMove((_) => 'front')}>
                Move Forward <BsChevronDoubleRight className={'ml-2 h-4 w-4'} />
              </button>
            ) : (
              <></>
            )}
          </div>
          <div className="flex justify-around flex-wrap">
            {statusActions?.BACK?.length && move === 'back' ? (
              <>
                <button
                  className={'inline-flex btn btn-outline btn-ghost my-2'}
                  onClick={() => setMove((_) => '')}>
                  <BsChevronDoubleLeft className={'mr-2 h-4 w-4'} /> Back
                </button>
                {statusActions?.BACK?.map((action) => (
                  <button
                    key={action}
                    className={'inline-flex btn btn-outline btn-primary my-2'}
                    onClick={() => setConfirmAction((_) => action)}>
                    MARK As {action?.replaceAll('_', ' ')} <span className={'mr-2'}></span>
                    {STATUS_ICON_NAMES[action]}
                  </button>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>

          <div className="flex justify-around flex-wrap">
            {statusActions?.FRONT?.length && move === 'front' ? (
              <>
                <button
                  className={'inline-flex btn btn-outline btn-ghost my-2'}
                  onClick={() => setMove((_) => '')}>
                  <BsChevronDoubleLeft className={'mr-2 h-4 w-4'} /> Back
                </button>
                {statusActions?.FRONT?.map((action) => (
                  <button
                    key={action}
                    className={'inline-flex btn btn-outline btn-primary my-2'}
                    onClick={() => setConfirmAction((_) => action)}>
                    MARK AS {action?.replaceAll('_', ' ')} <span className={'mr-2'}></span>
                    {STATUS_ICON_NAMES[action]}
                  </button>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
        </>
      ) : (
        <></>
      )}
      {confirmAction?.length && !chooseLivreur ? (
        <div className={'mt-4'}>
          <div className={'divider my-6'}>Choose a Delivery Person</div>
          <div className="flex justify-center">
            ARE YOU SURE YOU WANT TO MARK THE STATUS OF THE PARCEL WITH ID{' '}
            <span className={'text-primary mx-2 font-semibold'}>{extraObject?.colis?.id}</span> AS{' '}
            <span className={'text-primary mx-2 font-semibold'}>
              {confirmAction?.toUpperCase()?.replaceAll('_', ' ')}
            </span>
          </div>
          <div className="flex justify-around flex-wrap mt-4">
            <button
              className={'inline-flex btn btn-outline btn-ghost my-2'}
              onClick={() => setConfirmAction((_) => '')}>
              <BsChevronDoubleLeft className={'mr-2 h-4 w-4'} /> DISMISS ACTION
            </button>
            {['ASSIGNED_FOR_COLLECTION', 'ASSIGNED_FOR_DELIVERY', 'ASSIGNED_FOR_RETURN'].includes(
              confirmAction
            ) ? (
              <button
                className={'inline-flex btn btn-outline btn-success my-2'}
                onClick={() => setChooseLivreur((_) => true)}>
                PROCEED BY CHOOSING LIVREUR <MdOutlineDeliveryDining className={'ml-2 h-4 w-4'} />
              </button>
            ) : (
              <button
                className={'inline-flex btn btn-outline btn-success my-2'}
                onClick={async () => {
                  dispatch(
                    changeColisStatus({
                      colisId: extraObject?.colis?.id,
                      livreurId: livreur,
                      action: confirmAction
                    })
                  ).then(async (response) => {
                    if (response?.error) {
                      console.log(response);
                      dispatch(
                        showNotification({
                          message: 'Error while changing the parcel status',
                          status: 0
                        })
                      );
                    } else {
                      dispatch(
                        showNotification({
                          message: 'Succefully updated the parcel status',
                          status: 1
                        })
                      );
                      closeModal();
                    }
                  });
                }}>
                PROCEED <GiConfirmed className={'ml-2 h-4 w-4'} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
      {chooseLivreur ? (
        <div className={'mt-4'}>
          <div className={'divider my-6'}>Confirmation Panel</div>
          <div className="flex justify-center">
            PLEASE ASSOCIATE A DELIVERY PERSON TO THE PARCEL WITH ID{' '}
            <span className={'text-primary mx-2 font-semibold'}>{extraObject?.colis?.id}</span> AS{' '}
            <span className={'text-primary mx-2 font-semibold'}>
              {confirmAction?.toUpperCase()?.replaceAll('_', ' ')}
            </span>
          </div>

          <div className="flex justify-around flex-wrap mt-4">
            <InputAsyncSelect
              type="text"
              updateType="livreur"
              containerStyle="mt-3"
              labelTitle="Livreur"
              updateFormValue={updateForm}
              loadOptions={livreursPromiseOptions}
            />
          </div>
          <div className="flex justify-around flex-wrap mt-4">
            <button
              className={'inline-flex btn btn-outline btn-ghost my-2'}
              onClick={() => {
                setChooseLivreur((_) => false);
                setLivreur((_) => '');
              }}>
              <BsChevronDoubleLeft className={'mr-2 h-4 w-4'} /> BACK
            </button>
            {livreur ? (
              <button
                className={'inline-flex btn btn-outline btn-success my-2'}
                onClick={async () => {
                  await dispatch(
                    changeColisStatus({
                      colisId: extraObject?.colis?.id,
                      livreurId: livreur,
                      action: confirmAction
                    })
                  ).then(async (response) => {
                    if (response?.error) {
                      console.log(response.error);
                      dispatch(
                        showNotification({
                          message: response.error || 'Error while changing the parcel status',
                          status: 0
                        })
                      );
                    } else {
                      dispatch(
                        showNotification({
                          message:
                            response?.payload?.message || 'Succefully updated the parcel status',
                          status: 1
                        })
                      );
                      closeModal();
                    }
                  });
                }}>
                PROCEED <GiConfirmed className={'ml-2 h-4 w-4'} />
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ChangeStatusAbsolute;
