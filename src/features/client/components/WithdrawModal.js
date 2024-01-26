import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { showNotification } from '../../common/headerSlice';
import { withdrawFromAccount } from '../../transaction/transactionSlice';

const WithdrawModal = ({
  modalObj,
  extraObject,
  setModalObj,
  operator_operation_types,
  closeModal
}) => {
  const dispatch = useDispatch();
  const { clients } = useSelector((state) => state.client);
  const clientWallet = clients
    .find((client) => client?.id === extraObject?.client?.id)
    ?.wallets?.find((wallet) => wallet?.id === extraObject?.wallet?.id);

  const [submitted, setSubmitted] = useState(false);
  const handleWithdraw = async (finalAmount) => {
    // Implement the withdraw functionality here
    console.log('Withdrawal Process');
    setSubmitted(() => true);
    const operatorId = operator_operation_types?.find(
      (elt) => elt?.id === modalObj?.operatorOperationId
    )?.operator?.id;
    const amount = finalAmount;
    const phoneNumber = modalObj?.mobileMoneyNumber;
    const operatorFee =
      operator_operation_types?.find(
        (elt) => parseInt(elt?.id) === parseInt(modalObj?.operatorOperationId)
      )?.fee || 0;
    const walletId = extraObject?.wallet?.id;

    // Validate required fields
    if (
      !amount ||
      !operatorFee ||
      !operatorId ||
      !walletId ||
      (phoneNumber && phoneNumber.length !== 10)
    ) {
      dispatch(
        showNotification({
          message: `Some fields are not correctly filled`,
          status: 0
        })
      );
      console.log({
        amount,
        phoneNumber,
        operatorId,
        operatorFee,
        walletId
      });
      return;
    }

    try {
      // Dispatching the withdrawal action
      const response = await dispatch(
        withdrawFromAccount({
          amount,
          phoneNumber,
          operatorId,
          operatorFee,
          walletId
        })
      ).unwrap();

      // Check if there's an error in the response
      if (response.error) {
        throw new Error(response.error);
      }

      // Dispatch success notification
      dispatch(
        showNotification({
          message: `Successfully withdrawn from the client account`,
          status: 1
        })
      );

      console.log({ response });
      if (response?.finalTransaction?.status === 'SUCCESS') {
        // // Logic after successful withdrawal
        // try {
        //   setWalletStatus((old) => ({
        //     ...old,
        //     balance:
        //       old.balance -
        //       (response?.payload?.withdrawalTransaction
        //         ? parseInt(response?.withdrawalTransaction?.debit)
        //         : parseInt(amount))
        //   }));
        //
        //   await dispatch(
        //     replaceClientObjectByUpdatedOne({
        //       client: response?.client
        //     })
        //   );
        // } catch (e) {
        //   throw new Error('Error updating the status');
        // }

        // Reset modal object in case of success
        closeModal();
      }
    } catch (error) {
      // Handle errors during withdrawal process
      console.error('Error during withdrawal:', error);
      dispatch(
        showNotification({
          message: `Error while withdrawing the amount from the account: ${error.message}`,
          status: 0
        })
      );
    } finally {
      // Reset modal object regardless of success or failure
      setSubmitted(() => false);
    }
  };

  // Phone number validation function
  const isValidPhoneNumber = (phoneNumber) => {
    const pattern = /^\d+$/; // Regex to check if the string contains only digits
    return pattern.test(phoneNumber);
  };

  // Phone number validation function
  const isValidPrice = (price) => {
    const pattern = /^\d+$/; // Regex to check if the string contains only digits
    return pattern.test(price);
  };

  const getPercentage = () => {
    // if (!modalObj?.operatorOperationId) return 0;

    const feePercentage =
      operator_operation_types?.find(
        (elt) => parseInt(elt?.id) === parseInt(modalObj?.operatorOperationId)
      )?.fee || 0;

    return Math.ceil(parseInt(modalObj?.amount) * (parseFloat(feePercentage) / 100));
  };

  const getTotal = () => {
    if (!modalObj?.operatorOperationId || !modalObj?.amount) return 0;

    return parseInt(modalObj?.amount) - getPercentage();
  };

  return (
    <div
      className={`modal modal-bottom sm:modal-middle ${
        modalObj?.isOpened && modalObj.action === 'withdraw' ? 'modal-open' : ''
      }`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Withdraw money</h3>
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Mobile Money Number Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Mobile Money Number</span>
              </label>
              <input
                type={'text'}
                value={modalObj?.mobileMoneyNumber || ''}
                placeholder={'0xxxxxxxxx'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setModalObj((old) => ({ ...old, mobileMoneyNumber: value }));
                    return;
                  }
                  if (!isValidPhoneNumber(value)) {
                    return;
                  }
                  setModalObj((old) => ({ ...old, mobileMoneyNumber: value }));
                }}
                className={`input input-bordered w-full ${
                  modalObj?.mobileMoneyNumber?.length && modalObj?.mobileMoneyNumber?.length !== 10
                    ? 'input-error'
                    : ''
                }`}
                disabled={submitted}
              />
            </div>

            {/* Operator Dropdown */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Operator</span>
              </label>
              <select
                className="select select-bordered"
                value={modalObj?.operatorOperationId}
                onChange={(e) => {
                  console.log({ val: e.target.value });
                  setModalObj((prevState) => ({
                    ...prevState,
                    operatorOperationId: parseInt(e.target.value)
                  }));
                }}
                disabled={submitted}>
                <option value="pickOne" disabled selected>
                  Pick one
                </option>
                {operator_operation_types
                  ?.filter(
                    (operator_operation) =>
                      operator_operation?.operator_type?.code === 'RETRAIT' &&
                      operator_operation?.wallet_type?.code ===
                        extraObject?.wallet?.wallet_type?.code
                    // operator_operation?.wallet_type?.code === 'PERSO'
                  )
                  ?.map((operator_operation) => (
                    <option key={operator_operation?.operator?.name} value={operator_operation?.id}>
                      {operator_operation?.operator?.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="form-control w-full md:col-span-2">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type={'text'}
                value={modalObj?.amount || 0}
                placeholder={'1000'}
                onChange={(e) => {
                  let value = e.target.value;
                  // Allow the field to be empty
                  if (value === '') {
                    setModalObj((old) => ({ ...old, amount: 0 }));
                    return;
                  }
                  // Remove leading zeros for non-empty fields
                  value = value.replace(/^0+/, '');

                  if (!isValidPrice(value)) {
                    return;
                  }
                  setModalObj((old) => ({ ...old, amount: value }));
                }}
                className={`input input-bordered w-full`}
                disabled={submitted}
              />
            </div>

            {/* Total Calculation Display */}
            {modalObj?.operatorOperationId && modalObj?.operatorOperationId !== 'pickOne' && (
              <>
                <div className="font-semibold mt-3">
                  Fee (
                  {parseInt(
                    operator_operation_types?.find(
                      (elt) => parseInt(elt?.id) === parseInt(modalObj?.operatorOperationId)
                    )?.fee
                  )}
                  %) :
                </div>
                <div className="font-semibold text-primary mt-3">{getPercentage()} CFA</div>
                <div className="font-semibold mt-3">Total:</div>
                <div className="font-semibold text-primary mt-3">{getTotal()} CFA</div>
                {clientWallet?.balance < getTotal() + getPercentage() && getTotal() > 0 ? (
                  <div className="font-bold text-error text-center mt-3 col-span-2">
                    Insufficient balance
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}
          </div>
        </div>
        {!submitted && (
          <div className="modal-action">
            <button className="btn btn-outline btn-ghost" onClick={closeModal}>
              Close
            </button>
            {clientWallet?.balance >= getTotal() + getPercentage() && getTotal() > 0 ? (
              <button
                className="btn btn-outline btn-primary"
                onClick={() => handleWithdraw(getTotal() + getPercentage())}>
                Withdraw
              </button>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
