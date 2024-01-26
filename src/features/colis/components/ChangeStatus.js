import React, { useCallback, useState } from 'react';

import { useDispatch } from 'react-redux';

import { BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs';
import { GiConfirmed } from 'react-icons/gi';
import { GoEyeClosed } from 'react-icons/go';
import { MdOutlineDeliveryDining } from 'react-icons/md';
import { TiCancel } from 'react-icons/ti';

import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';
import {
  ABSOLUTE_STATUS_ACTIONS,
  STATUS_ACTIONS,
  STATUS_ICON_NAMES
} from '../../../utils/colisUtils';
import { showNotification } from '../../common/headerSlice';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import { changeColisStatus, updateColisPaymentStatus } from '../parcelsManagementSlice';

const ChangeStatus = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();

  // States to manage UI and data flow
  const [move, setMove] = useState(''); // Controls forward or backward movement in the status flow
  const [confirmAction, setConfirmAction] = useState(''); // Tracks the action to be confirmed
  const [chooseLivreur, setChooseLivreur] = useState(false); // Flag for choosing a delivery person
  const [deliveryFeeOption, setDeliveryFeeOption] = useState({
    show: false,
    paid: false,
    method: ''
  }); // Flag for setting up the delivery fee payment option
  const [livreur, setLivreur] = useState(''); // Selected delivery person ID
  const [statusActions, setStatusActions] = useState(ABSOLUTE_STATUS_ACTIONS['ABSOLUTE']); // Available actions based on current status

  // Update form values - mainly for selecting a delivery person
  const updateForm = useCallback(({ key, value }) => {
    if (key === 'livreur') {
      setLivreur(value);
    }
  }, []);

  // Async function to fetch delivery persons based on user input
  const livreursPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      // Fetch options only if input length is 3 or more characters
      if (inputValue?.length >= 3) {
        dispatch(getLivreursBySearch({ searchPattern: inputValue })).then((res) => {
          resolve(
            res?.payload.livreurs
              ?.filter(
                (livreur) =>
                  livreur?.first_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.last_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.whatsapp?.toLowerCase()?.includes(inputValue.toLowerCase())
              )
              ?.map((livreur) => ({
                value: livreur.id,
                label: `${livreur.first_name} ${livreur.last_name} (${livreur?.whatsapp})`
              }))
          );
        });
      } else {
        resolve([]);
      }
    });

  const handleChangeStatus = async () => {
    try {
      const response = await dispatch(
        changeColisStatus({
          colisId: extraObject?.colis?.id,
          livreurId: livreur,
          action: confirmAction
        })
      );

      if (response?.error) {
        console.error('Error changing status:', response.error);
        dispatch(
          showNotification({
            message: 'Error while changing the parcel status',
            status: 0
          })
        );
      } else {
        dispatch(
          showNotification({
            message: 'Successfully updated the parcel status',
            status: 1
          })
        );
        closeModal();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      dispatch(
        showNotification({
          message: 'An unexpected error occurred',
          status: 0
        })
      );
    }
  };

  // Function to call backend API
  const callBackendAPI = async (payload) => {
    try {
      // API call logic here
      console.log('Payload sent to API:', payload);
      // Call the changeColisStatus action with the statusPayload
      const statusResponse = await dispatch(changeColisStatus(payload));

      // Handle response for status change
      if (statusResponse?.error) {
        console.error('Error changing status:', statusResponse.error);
        dispatch(
          showNotification({
            message: 'Error while changing the parcel status',
            status: 0
          })
        );
      } else {
        // Handle additional logic if the delivery fee is paid or not
        console.log(`Delivery info: ${payload}`);
        // Here you can add more API calls or state updates related to the payment method
        // await dispatch(updateColisPaymentStatus(payload));

        dispatch(
          showNotification({
            message: 'Successfully updated the parcel status',
            status: 1
          })
        );
        closeModal();
      }
    } catch (error) {
      console.error('Error in API call:', error);
    }
  };

  // Unified ButtonAction component
  const ButtonAction = ({ type }) => {
    const handleButtonClick = async () => {
      // Define the payload for the API call
      const payload = {
        paid: type !== 'NOT PAID', // Check if the parcel's delivery fee is paid or not
        fee_payment: type === 'PREPAID' || type === 'POSTPAID' ? type : '',
        colisId: extraObject?.colis?.id,
        action: confirmAction
      };

      // Call the API function with the payload
      await callBackendAPI(payload);
    };

    const buttonClass =
      type === 'NOT PAID'
        ? 'btn-error'
        : type === 'PREPAID'
        ? 'btn-accent'
        : type === 'POSTPAID'
        ? 'btn-info'
        : 'btn-success';
    const buttonIcon = type === 'NOT PAID' ? <TiCancel /> : <GiConfirmed />;

    return (
      <button
        className={`inline-flex items-center gap-2 btn btn-outline my-2 ${buttonClass}`}
        onClick={handleButtonClick}>
        {type} {buttonIcon}
      </button>
    );
  };

  // Component rendering logic
  return (
    <div>
      {/* Current status display */}
      <div className="flex justify-center">
        <div className={'divider'}>Current Status</div>

        <span className={'p-2 shadow shadow-primary rounded'}>
          {extraObject?.colis?.colis_statuses[
            extraObject?.colis?.colis_statuses?.length - 1
          ]?.colis_status?.code
            ?.toUpperCase()
            ?.replaceAll('_', ' ')}
        </span>
      </div>

      {/* Action buttons based on current status */}
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
          <div className="flex justify-around items-center flex-wrap gap-2">
            {statusActions?.BACK?.length && move === 'back' ? (
              <>
                <button
                  className={
                    'inline-flex items-center justify-center gap-2 btn btn-outline btn-ghost my-2'
                  }
                  onClick={() => setMove((_) => '')}>
                  <BsChevronDoubleLeft className={'mr-2 h-4 w-4'} /> Back
                </button>
                {statusActions?.BACK?.map((action) => (
                  <button
                    key={action}
                    className={
                      'inline-flex items-center justify-center gap-2 btn btn-outline btn-primary'
                    }
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

          <div className="flex justify-around items-center flex-wrap gap-2">
            {statusActions?.FRONT?.length && move === 'front' ? (
              <>
                <button
                  className="inline-flex items-center justify-center gap-2 btn btn-outline btn-ghost my-2"
                  onClick={() => setMove((_) => '')}>
                  <BsChevronDoubleLeft className="h-4 w-4" /> Back
                </button>
                {statusActions?.FRONT?.map((action) => (
                  <button
                    key={action}
                    className={`inline-flex items-center justify-center gap-2 btn btn-outline ${
                      action === 'DELIVERED' ? 'btn-secondary' : 'btn-primary'
                    } my-2`}
                    onClick={() => setConfirmAction((_) => action)}>
                    MARK AS {action?.replaceAll('_', ' ')}
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

      {/* Confirmation logic for actions */}
      {confirmAction?.length && !chooseLivreur && !deliveryFeeOption?.show ? (
        <div className={'mt-4'}>
          <div className={'divider my-6'}>Confirmation logic</div>
          <div className="flex justify-center">
            ARE YOU SURE YOU WANT TO MARK THE STATUS OF THE PARCEL WITH CODE{' '}
            <span className={'text-primary mx-2 font-semibold'}>{extraObject?.colis?.code}</span> AS{' '}
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
              //   : ['ARTICLE_TO_RETURN', 'RETURNED'].includes(confirmAction) ? (
              //   <>
              //     <button
              //       className={'inline-flex btn btn-outline btn-success my-2'}
              //       onClick={() =>
              //         setDeliveryFeeOption((oldData) => {
              //           return {
              //             ...oldData,
              //             show: true
              //           };
              //         })
              //       }>
              //       SET DELIVERY FEE OPTION <CiSettings className={'ml-2 h-4 w-4'} />
              //     </button>
              //   </>
              // )
              <button
                className="inline-flex items-center justify-center gap-2 btn btn-outline btn-success my-2"
                onClick={handleChangeStatus}
                aria-label="Proceed with status change" // ARIA label for accessibility
              >
                PROCEED <GiConfirmed className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Choose Livreur UI */}
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

      {/*/!* Delivery Fee Option UI *!/*/}
      {/*{deliveryFeeOption?.show ? (*/}
      {/*  <div className={'mt-4'}>*/}
      {/*    <div className={'divider my-6'}>Confirmation Panel</div>*/}
      {/*    <div className="flex justify-center">*/}
      {/*      {deliveryFeeOption?.paid ? (*/}
      {/*        <>PLEASE CHOOSE A PAYMENT METHOD</> // Message when fee is paid*/}
      {/*      ) : (*/}
      {/*        <>*/}
      {/*          HAS THE DELIVERY FEE OF THE PARCEL{' '}*/}
      {/*          <span className={'text-primary mx-2 font-semibold'}>*/}
      {/*            {extraObject?.colis?.code}*/}
      {/*          </span>{' '}*/}
      {/*          BEEN PAID?*/}
      {/*        </> // Message when fee payment status is undecided*/}
      {/*      )}*/}
      {/*    </div>*/}

      {/*    <div className="flex justify-around flex-wrap mt-4">*/}
      {/*      /!* Back Button *!/*/}
      {/*      <button*/}
      {/*        className={'inline-flex btn btn-outline btn-ghost my-2'}*/}
      {/*        onClick={() => {*/}
      {/*          setDeliveryFeeOption((_) => {*/}
      {/*            return {*/}
      {/*              method: '',*/}
      {/*              paid: false,*/}
      {/*              show: false*/}
      {/*            };*/}
      {/*          });*/}
      {/*        }}>*/}
      {/*        <BsChevronDoubleLeft className={'mr-2 h-4 w-4'} /> BACK*/}
      {/*      </button>*/}

      {/*      /!* Conditional Rendering of Payment Method Buttons *!/*/}
      {/*      {deliveryFeeOption?.paid ? (*/}
      {/*        // Buttons for choosing the payment method (PREPAID/POSTPAID)*/}
      {/*        <>*/}
      {/*          <>*/}
      {/*            <ButtonAction type="PREPAID" />*/}
      {/*            <ButtonAction type="POSTPAID" />*/}
      {/*          </>*/}
      {/*        </>*/}
      {/*      ) : (*/}
      {/*        // Button for confirming fee not paid*/}
      {/*        <>*/}
      {/*          <ButtonAction type="NOT PAID" />*/}
      {/*          <button*/}
      {/*            className={'inline-flex btn btn-outline btn-success my-2'}*/}
      {/*            //not final should ask if prepaid or postpaid*/}
      {/*            onClick={() => {*/}
      {/*              setDeliveryFeeOption((oldData) => {*/}
      {/*                return {*/}
      {/*                  ...oldData,*/}
      {/*                  paid: true*/}
      {/*                };*/}
      {/*              });*/}
      {/*            }}>*/}
      {/*            PAID <GiConfirmed className={'ml-2 h-4 w-4'} />*/}
      {/*          </button>*/}
      {/*        </>*/}
      {/*      )}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*) : (*/}
      {/*  <></>*/}
      {/*)}*/}
    </div>
  );
};

export default ChangeStatus;
