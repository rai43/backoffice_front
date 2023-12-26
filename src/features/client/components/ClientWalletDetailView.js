import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useFormik } from 'formik';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';

import { FaMoneyBillTransfer } from 'react-icons/fa6';

import ArrowLeftOnRectangleIcon from '@heroicons/react/24/outline/ArrowLeftOnRectangleIcon';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import LockClosedIcon from '@heroicons/react/24/outline/LockClosedIcon';

import ClientRechargementsTable from './ClientRechargementsTable';
import ClientRequetesTable from './ClientRequetesTable';
import ClientTransactionsTable from './ClientTransactionsTable';
import InputText from '../../../components/Input/InputText';
import SelectBox from '../../../components/Input/SelectBox';
import { showNotification } from '../../common/headerSlice';
import { getClientRechargements } from '../../rechargement/rechargementSlice';
import { getClientRetraits } from '../../retrait/retraitSlice';
import {
  creditAccountToServer,
  debitAccountToServer,
  generateStatistics,
  getClientTransactions,
  getOperatorTypes,
  resetForm,
  switchWalletStatus,
  withdrawFromAccount
} from '../../transaction/transactionSlice';
import { replaceClientObjectByUpdatedOne } from '../clientSlice';
import PersonalCardTransactionsNav from '../containers/PersonalCardTransactionsNav';

const INITIAL_WALLET_FILTER_OBJ = {
  transactionType: 'ALL',
  from: moment.utc().subtract(30, 'd').format('YYYY-MM-DD'),
  to: moment.utc().add(1, 'days').format('YYYY-MM-DD')
};

const transactionTypeOptionsTransactions = [
  { name: 'ALL', value: 'ALL' },
  { name: 'PAYMENT', value: 'PAYMENT' },
  { name: 'RECHARGEMENT', value: 'RECHARGEMENT' },
  { name: 'RECHARGEMENT_STREET', value: 'RECHARGEMENT_STREET' },
  { name: 'RETRAIT', value: 'RETRAIT' },
  { name: 'RECHARGEMENT_MOBILE_MONEY', value: 'RECHARGEMENT_MOBILE_MONEY' },
  { name: 'BONUS', value: 'BONUS' }
];

const ClientWalletDetailView = ({ extraObject }) => {
  const clientPhoneNumber = extraObject?.client?.phone_number;
  const pageNumberRef = useRef(0);
  const dispatch = useDispatch();

  const [walletStatus, setWalletStatus] = useState({
    balance: extraObject?.wallet?.balance,
    bonus: extraObject?.wallet?.bonus
  });
  const [modalObj, setModalObj] = useState({
    isOpened: false,
    amount: 0,
    actionType: 'principal',
    action: '',
    operatorOperationId: 'pickOne',
    mobileMoneyNumber: ''
  });

  const [isActive, setIsActive] = useState(
    extraObject?.wallet?.wallet_status?.code === 'ACTIVATED'
  );

  const [activePage, setActivePage] = useState('/my-wallet/transactions');
  const [statistics, setsStatistics] = useState({
    transactionsInCount: 0,
    transactionsOutCount: 0,
    transactionsInAmount: 0,
    transactionsOutAmount: 0,
    paymentsCount: 0,
    paymentsAmount: 0,
    topupsCount: 0,
    topupsAmount: 0,
    withdrawalsCount: 0,
    withdrawalsAmount: 0,
    bonusCount: 0,
    bonusAmount: 0
  });
  const { transactions, skip, isLoading, noMoreQuery, operator_operation_types, totalCount } =
    useSelector((state) => state.transaction);

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
  };

  const updateFormValue = useCallback(
    ({ key, value }) => {
      // this update will cause useEffect to get executed as there is a lookup on 'formik.values'
      formik.setValues({
        ...formik.values,
        [key]: value
      });
    },
    [formik]
  );

  const applyFilter = async (dispatchParams) => {
    if (activePage === '/my-wallet/transactions') {
      dispatch(getClientTransactions(dispatchParams)).then(async (res) => {
        if (res?.payload?.transactions) {
          try {
            const { payload } = await dispatch(
              generateStatistics({
                data: res?.payload?.transactions,
                clientPhoneNumber
              })
            );
            setsStatistics((oldStats) => {
              return {
                ...oldStats,
                ...payload
              };
            });
          } catch (e) {
            console.log('Could not fetch the statistics');
          }
        }
      });
    } else if (activePage === '/personal-wallet/rechargements') {
      dispatch(getClientRechargements(dispatchParams));
    } else if (activePage === '/marchant-wallet/requests') {
      dispatch(getClientRetraits(dispatchParams));
    }
  };

  const onFetchTransactions = async () => {
    dispatch(resetForm());
    const dispatchParams = {
      transactionType: formik.values.transactionType,
      from: formik.values.from,
      to: formik.values.to,
      wallet: extraObject?.wallet?.id,
      skip: 0
    };
    await applyFilter(dispatchParams);
  };
  // setClientPhoneNumber(clientPhoneNumber);

  useEffect(() => {
    const fetchOperatorTypeList = async () => {
      await dispatch(getOperatorTypes());
    };

    fetchOperatorTypeList();
  }, []);

  useEffect(() => {
    onFetchTransactions();
  }, [formik.values.from, formik.values.to, formik.values.transactionType, activePage]);

  const handleLoadTransactions = async (prevPage) => {
    pageNumberRef.current = prevPage;
    if (!noMoreQuery && !isLoading) {
      const dispatchParams = {
        transactionType: formik.values.transactionType,
        from: formik.values.from,
        to: formik.values.to,
        wallet: extraObject?.wallet?.id,
        skip: skip
      };

      await applyFilter(dispatchParams);
    }
  };

  const handleCloseModal = () => {
    setModalObj(() => {
      return {
        isOpened: false,
        amount: 0,
        actionType: 'principal',
        action: '',
        operatorOperationId: 'pickOne',
        mobileMoneyNumber: ''
      };
    });
  };

  return (
    <>
      {!isLoading && (
        <div className="w-full my-2">
          <div className="w-full">
            <h3 className="text-sm font-light">Filters</h3>
            {/* Divider */}
            <div className="divider mt-0 my-1"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Datepicker
                containerClassName="w-full"
                value={dateValue}
                theme={'light'}
                inputClassName="input input-bordered w-full"
                popoverDirection={'down'}
                toggleClassName="invisible"
                onChange={handleDatePickerValueChange}
                showShortcuts={true}
                primaryColor={'white'}
              />
              {activePage === '/my-wallet/transactions' ? (
                <SelectBox
                  options={transactionTypeOptionsTransactions}
                  labelTitle="Transaction Type"
                  updateType="transactionType"
                  placeholder="Select the transaction type"
                  labelStyle="hidden"
                  defaultValue={formik.values.transactionType}
                  updateFormValue={updateFormValue}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="w-full">
            <h3 className="text-sm font-light">
              Actions on{' '}
              {extraObject?.wallet?.wallet_type?.libelle
                ? extraObject?.wallet?.wallet_type?.libelle?.toLocaleLowerCase()
                : ''}{' '}
              wallet
            </h3>
            {/* Divider */}
            <div className="divider mt-0 mb-1"></div>

            <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-6">
              <ActionButton
                action="credit"
                label="Credit"
                icon={ArrowLeftOnRectangleIcon}
                colorClass="btn-success focus:bg-success-300"
                setModalObj={setModalObj}
              />
              <ActionButton
                action="debit"
                label="Debit"
                icon={ArrowRightOnRectangleIcon}
                colorClass="btn-info focus:bg-info-300"
                setModalObj={setModalObj}
              />
              <ActionButton
                action="withdraw"
                label="Withdraw"
                icon={FaMoneyBillTransfer}
                colorClass="btn-warning focus:bg-warning-300"
                setModalObj={setModalObj}
              />
              <ActionButton
                action="block"
                label={isActive ? 'Block' : 'Unblock'}
                icon={LockClosedIcon}
                colorClass={
                  isActive ? 'btn-error focus:bg-error-300' : 'btn-teal focus:bg-teal-300'
                }
                isActive={isActive}
                setModalObj={setModalObj}
              />
            </div>
          </div>

          <div className="my-2">
            <h3 className="text-sm font-light mt-6">
              {/* <span className='mx-2 text-primary'>
						{extraObject?.client?.country?.prefix ? extraObject?.client?.country?.prefix + ' ' : '+225 '} {extraObject?.client?.phone_number}
					</span> */}
              Balance & History
            </h3>
            <div className="w-full stats stats-vertical lg:stats-horizontal shadow mt-2">
              <div className="stat">
                <div className="stat-title">Account Balance</div>
                <div className={`stat-value text-[1.8rem]`}>
                  <span className="text-info">{walletStatus.balance} FCFA </span>
                </div>
                <div className={`stat-desc`}>
                  Bonus:{' '}
                  <span>
                    <span className="text-info">{walletStatus.bonus} FCFA</span>
                  </span>
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Transactions (In/Out)</div>
                <div className={`stat-value text-[1.1rem]`}>
                  <span className="text-info">{statistics.transactionsInAmount} FCFA </span>{' '}
                  <span className="text-error font-normal">
                    ({statistics.transactionsOutAmount} FCFA)
                  </span>
                </div>
                <div className={`stat-desc`}>
                  Count:{' '}
                  <span>
                    <span className="text-info">{statistics.transactionsInCount} </span> |{' '}
                    <span className="text-error">{statistics.transactionsOutCount} </span>
                  </span>
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Payment(s)</div>
                <div className="stat-value text-[1.5rem] text-info">
                  {statistics.paymentsAmount} FCFA
                </div>
                <div className="stat-desc">
                  Count: <span className="text-info">{statistics.paymentsCount}</span>
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Top up(s)</div>
                <div className="stat-value text-[1.5rem] text-info">
                  {statistics.topupsAmount} FCFA
                </div>
                <div className="stat-desc">
                  Count: <span className="text-info">{statistics.topupsCount}</span>
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Withdrawal(s)</div>
                <div className="stat-value text-[1.5rem] text-info">
                  {statistics.withdrawalsAmount} FCFA
                </div>
                <div className="stat-desc">
                  Count: <span className="text-info">{statistics.withdrawalsCount}</span>
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Bonus</div>
                <div className="stat-value text-[1.5rem] text-info">
                  {statistics.bonusAmount} FCFA
                </div>
                <div className="stat-desc">
                  Count <span className="text-info">{statistics.bonusCount}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Divider */}
          <div className="divider mt-0"></div>
          <PersonalCardTransactionsNav
            activePage={activePage}
            setActivePage={setActivePage}
            accountType={extraObject?.wallet?.wallet_type?.code}
          />

          {activePage === '/my-wallet/transactions' && (
            <>
              <ClientTransactionsTable
                currPage={pageNumberRef.current}
                onLoad={handleLoadTransactions}
                updateFormValue={() => {}}
                client={extraObject.client}
              />
            </>
          )}
          {activePage === '/personal-wallet/rechargements' && (
            <>
              <ClientRechargementsTable
                currPage={pageNumberRef.current}
                onLoad={handleLoadTransactions}
                updateFormValue={() => {}}
              />
            </>
          )}
          {activePage === '/marchant-wallet/requests' && (
            <>
              <ClientRequetesTable
                currPage={pageNumberRef.current}
                onLoad={handleLoadTransactions}
                updateFormValue={() => {}}
              />
            </>
          )}
        </div>
      )}

      {/* TODO: make a component for this */}
      <CreditDebitModal
        modalObj={modalObj}
        setModalObj={setModalObj}
        extraObject={extraObject}
        transactions={transactions}
        clientPhoneNumber={clientPhoneNumber}
        setWalletStatus={setWalletStatus}
        setsStatistics={setsStatistics}
        closeModal={handleCloseModal}
      />

      <BlockUnblockModal
        modalObj={modalObj}
        setModalObj={setModalObj}
        isActive={isActive}
        setIsActive={setIsActive}
        extraObject={extraObject}
        closeModal={handleCloseModal}
      />

      <WithdrawModal
        modalObj={modalObj}
        extraObject={extraObject}
        transactions={transactions}
        clientPhoneNumber={clientPhoneNumber}
        setModalObj={setModalObj}
        setsStatistics={setsStatistics}
        walletStatus={walletStatus}
        setWalletStatus={setWalletStatus}
        operator_operation_types={operator_operation_types}
        closeModal={handleCloseModal}
      />
    </>
  );
};

const ActionButton = ({ action, label, icon: Icon, colorClass, isActive, setModalObj }) => (
  <button
    className={`btn btn-sm btn-outline w-full ${colorClass} hover:bg-opacity-90 focus:ring-2 transition duration-300 ease-in-out ${
      isActive && 'focus:ring-error-500'
    }`}
    onClick={() =>
      setModalObj((old) => ({
        ...old,
        action: action,
        isOpened: true
      }))
    }
    aria-label={label}>
    <Icon className="h-5 w-5 mr-2" />
    {label}
  </button>
);

const CreditDebitModal = ({
  modalObj,
  setModalObj,
  extraObject,
  transactions,
  clientPhoneNumber,
  setWalletStatus,
  setsStatistics,
  closeModal
}) => {
  const dispatch = useDispatch();

  const handleCreditOrDebit = async () => {
    const action = modalObj.action === 'credit' ? creditAccountToServer : debitAccountToServer;
    const response = await dispatch(
      action({
        wallet: extraObject?.wallet?.id,
        amount: modalObj.amount,
        accountType: modalObj?.actionType
      })
    );

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

      // Logic after successful action
      try {
        const statsResponse = await dispatch(
          generateStatistics({
            data: [response?.payload?.transaction, ...transactions],
            clientPhoneNumber
          })
        );
        setsStatistics((oldStats) => ({ ...oldStats, ...statsResponse.payload }));

        if (response?.payload?.isPrincipalAccount) {
          setWalletStatus((old) => ({
            ...old,
            balance:
              modalObj.action === 'credit'
                ? old.balance + response?.payload?.transaction?.amount
                : old.balance - response?.payload?.transaction?.amount
          }));
        } else {
          setWalletStatus((old) => ({
            ...old,
            bonus:
              modalObj.action === 'credit'
                ? old.bonus + response?.payload?.transaction?.amount
                : old.bonus - response?.payload?.transaction?.amount
          }));
        }

        const clientUpdateResponse = await dispatch(
          replaceClientObjectByUpdatedOne({
            client: response?.payload?.client
          })
        );
        console.log('Updated Client:', clientUpdateResponse.payload);
      } catch (e) {
        console.error('Error:', e);
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

const WithdrawModal = ({
  modalObj,
  extraObject,
  transactions,
  clientPhoneNumber,
  setModalObj,
  setsStatistics,
  walletStatus,
  setWalletStatus,
  operator_operation_types,
  closeModal
}) => {
  const dispatch = useDispatch();
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
      if (response?.firebaseTransaction?.status === 'SUCCESS') {
        // Logic after successful withdrawal
        try {
          // const statsResponse = await dispatch(
          //   generateStatistics({
          //     data: [response?.transaction, ...transactions],
          //     clientPhoneNumber
          //   })
          // );
          // setsStatistics((oldStats) => ({ ...oldStats, ...statsResponse.payload }));

          setWalletStatus((old) => ({
            ...old,
            balance:
              old.balance -
              (response?.payload?.withdrawalTransaction
                ? parseInt(response?.withdrawalTransaction?.debit)
                : parseInt(amount))
          }));

          await dispatch(
            replaceClientObjectByUpdatedOne({
              client: response?.client
            })
          );
        } catch (e) {
          throw new Error('Error updating the status');
        }

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
                {walletStatus?.balance < getTotal() + getPercentage() && getTotal() > 0 ? (
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
            {walletStatus?.balance >= getTotal() + getPercentage() && getTotal() > 0 ? (
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
export default ClientWalletDetailView;
