import React from 'react';

import { useDispatch } from 'react-redux';

import InputText from '../../../components/Input/InputText';
import { showNotification } from '../../common/headerSlice';
import { creditAccountToServer, debitAccountToServer } from '../../transaction/transactionSlice';
import { replaceClientObjectByUpdatedOne } from '../clientSlice';

const CreditDebitModal = ({ modalObj, setModalObj, extraObject, closeModal }) => {
  const dispatch = useDispatch();

  const handleCreditOrDebit = async () => {
    const action = modalObj.action === 'credit' ? creditAccountToServer : debitAccountToServer;
    const response = await dispatch(
      action({
        wallet: extraObject?.wallet?.id,
        amount: modalObj.amount,
        accountType: modalObj?.actionType
      })
    ).unwrap();

    if (response?.error) {
      console.error(response.error);
      dispatch(
        showNotification({
          message: `Error while ${modalObj.action}ing the client account`,
          status: 0
        })
      );
    } else {
      dispatch(
        showNotification({
          message: `Successfully ${modalObj.action}ed the client account`,
          status: 1
        })
      );

      try {
        await dispatch(
          replaceClientObjectByUpdatedOne({
            client: response?.client
          })
        );
      } catch (e) {
        console.error('Could not update the information:', e);
      }
    }

    setModalObj({ action: '', amount: 0, isOpened: false, actionType: 'principal' });
  };

  return (
    <div
      className={`modal modal-bottom sm:modal-middle ${
        modalObj?.isOpened && (modalObj.action === 'credit' || modalObj.action === 'debit')
          ? 'modal-open'
          : ''
      }`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {modalObj.action === 'credit' ? 'Credit Account' : 'Debit Account'}
        </h3>
        {(modalObj.action === 'credit' || modalObj.action === 'debit') && (
          <div className="py-4">
            <InputText
              type="number"
              labelTitle="Amount"
              defaultValue={0}
              updateFormValue={({ value }) => setModalObj((old) => ({ ...old, amount: value }))}
            />
            {extraObject?.wallet?.wallet_type?.code === 'PERSO' ? (
              <>
                <label className="label cursor-pointer">
                  <span className="label-text">Principal Account</span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-blue-500"
                    onChange={(_) =>
                      setModalObj((old) => {
                        return {
                          ...old,
                          actionType: 'principal'
                        };
                      })
                    }
                    checked={modalObj?.actionType === 'principal'}
                  />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text">Bonus Account</span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-red-500"
                    onChange={(_) =>
                      setModalObj((old) => {
                        return {
                          ...old,
                          actionType: 'bonus'
                        };
                      })
                    }
                    checked={modalObj?.actionType === 'bonus'}
                  />
                </label>
              </>
            ) : (
              <></>
            )}
          </div>
        )}
        <div className="modal-action">
          <button className="btn btn-outline btn-ghost" onClick={() => closeModal()}>
            Close
          </button>
          <button className="btn btn-outline btn-primary" onClick={handleCreditOrDebit}>
            {modalObj.action === 'credit' ? 'Credit Now' : 'Debit Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditDebitModal;
