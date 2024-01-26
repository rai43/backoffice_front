import React from 'react';

import { useDispatch } from 'react-redux';

import { showNotification } from '../../common/headerSlice';
import { switchWalletStatus } from '../../transaction/transactionSlice';
import { replaceClientObjectByUpdatedOne } from '../clientSlice';

const BlockUnblockModal = ({
  modalObj,
  setModalObj,
  isActive,
  setIsActive,
  extraObject,
  closeModal
}) => {
  const dispatch = useDispatch();

  const handleSwitchStatus = async () => {
    const response = await dispatch(switchWalletStatus({ wallet: extraObject?.wallet?.id }));

    if (response?.error) {
      console.error('Error:', response.error);
      dispatch(
        showNotification({
          message: 'Error while switching the wallet status',
          status: 0
        })
      );
    } else {
      dispatch(
        showNotification({
          message: 'Successfully switched the wallet status account',
          status: 1
        })
      );

      setIsActive(response?.payload?.wallet?.wallet_status_id === 1);

      try {
        const { payload } = await dispatch(
          replaceClientObjectByUpdatedOne({
            client: response?.payload?.client
          })
        );
        console.log('Updated Client:', payload);
      } catch (e) {
        console.error('Could not update the information:', e);
      }
    }

    setModalObj({ action: '', amount: 0, isOpened: false, actionType: 'principal' });
  };

  return (
    <div
      className={`modal modal-bottom sm:modal-middle ${
        modalObj?.isOpened && modalObj.action === 'block' ? 'modal-open' : ''
      }`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {isActive
            ? 'Are you sure you want to block this client?'
            : 'Are you sure you want to unblock this client?'}
        </h3>
        <div className="modal-action">
          <button className="btn btn-outline btn-ghost" onClick={() => closeModal()}>
            No, Cancel Action
          </button>
          <button className="btn btn-outline btn-error" onClick={handleSwitchStatus}>
            Yes, Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockUnblockModal;
