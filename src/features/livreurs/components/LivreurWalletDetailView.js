import React, { useEffect, useState } from 'react';

import { useFormik } from 'formik';
import moment from 'moment';
import numeral from 'numeral';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';

import { CiMoneyCheck1 } from 'react-icons/ci';
import { FaMoneyBillTransfer } from 'react-icons/fa';
import { MdOutlineSendToMobile } from 'react-icons/md';
import { SlWallet } from 'react-icons/sl';

import ArrowLeftOnRectangleIcon from '@heroicons/react/24/outline/ArrowLeftOnRectangleIcon';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import LockClosedIcon from '@heroicons/react/24/outline/LockClosedIcon';

import BlockUnblockModal from '../../client/components/BlockUnblockModal';
import ClientTransactionsTable from '../../client/components/ClientTransactionsTable';
import CreditDebitModal from '../../client/components/CreditDebitModal';
// import LivreurTransactionsTable from './LivreurTransactionsTable';
import {
  getClientTransactions,
  // getLivreurTransactions,
  getOperatorTypes,
  resetForm
} from '../../transaction/transactionSlice';

// Constants
const INITIAL_WALLET_FILTER_OBJ = {
  transactionType: 'ALL',
  from: moment.utc().subtract(30, 'days').format('YYYY-MM-DD'),
  to: moment.utc().add(1, 'day').format('YYYY-MM-DD')
};

/**
 * Component to handle the view and manipulation of a livreur's wallet details.
 * Displays the detailed view of the livreur's wallet, including transactions and wallet operations.
 *
 * @param {Object} extraObject - Additional data about the livreur and wallet.
 */
const LivreurWalletDetailView = ({ extraObject }) => {
  const dispatch = useDispatch();
  const { livreurs, transactions, isLoading, noMoreQuery, operator_operation_types } = useSelector(
    (state) => ({
      livreurs: state.livreur.livreurs,
      transactions: state.transaction.transactions,
      isLoading: state.transaction.isLoading,
      noMoreQuery: state.transaction.noMoreQuery,
      operator_operation_types: state.transaction.operator_operation_types
    })
  );

  const livreurWallet = livreurs.reduce((foundWallet, livreur) => {
    if (foundWallet) return foundWallet; // If already found, just return it

    // Try to find the wallet in the current livreur's wallet array
    const wallet = livreur?.wallets?.find((wallet) => wallet?.id === extraObject?.wallet?.id);

    return wallet; // Return the found wallet, or undefined if not found in this livreur
  }, null);

  console.log({ LivreurWalletDetailView: extraObject, livreurs, livreurWallet });

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

  const formik = useFormik({
    initialValues: INITIAL_WALLET_FILTER_OBJ
  });

  const [dateValue, setDateValue] = useState({
    startDate: formik.values.from,
    endDate: formik.values.to
  });

  const handleDatePickerValueChange = (newValue) => {
    setDateValue(newValue);
    formik.setValues((currentValues) => ({
      ...currentValues,
      from: newValue.startDate,
      to: newValue.endDate
    }));
  };

  const fetchTransactions = (skip = 0) => {
    const filterParams = {
      transactionType: formik.values.transactionType,
      fromDate: moment(formik.values.from).format('YYYY-MM-DD'),
      toDate: moment(formik.values.to).format('YYYY-MM-DD'),
      walletId: extraObject?.wallet?.id,
      skip
    };
    dispatch(getClientTransactions(filterParams));
    // dispatch(getLivreurTransactions(filterParams));
  };

  useEffect(() => {
    dispatch(resetForm());
    fetchTransactions();
  }, [formik.values.from, formik.values.to, formik.values.transactionType]);

  const handleLoadMoreTransactions = () => {
    if (!isLoading && !noMoreQuery) {
      fetchTransactions(transactions.length);
    }
  };

  useEffect(() => {
    async function fetchOperatorTypeList() {
      await dispatch(getOperatorTypes());
    }

    fetchOperatorTypeList();
  }, []);

  /**
   * Sums credited and debited transactions in an array of transaction objects, differentiating bonus transactions.
   *
   * @param {Object[]} transactions - Array of transaction objects.
   * @returns {Object} An object containing the total of credited and debited transactions, separated by bonus and others.
   */
  const sumTransactionsWithBonusDifferentiation = () => {
    return transactions.reduce(
      (acc, transaction) => {
        // Convert string values to numbers and handle null values
        const credited = parseFloat(transaction.credited) || 0;
        const debited = parseFloat(transaction.debited) || 0;
        const isBonusType = transaction.type === 'BONUS';

        // Accumulate credited and debited amounts, separate bonus from others
        if (isBonusType) {
          acc.creditedBonusTotal += credited;
          acc.debitedBonusTotal += debited;
        } else {
          acc.creditedOtherTotal += credited;
          acc.debitedOtherTotal += debited;
        }

        return acc;
      },
      {
        creditedBonusTotal: 0, // Initial values for bonus totals
        debitedBonusTotal: 0, // Initial values for bonus totals
        creditedOtherTotal: 0, // Initial values for other totals
        debitedOtherTotal: 0 // Initial values for other totals
      }
    );
  };

  const handleCloseModal = () => {
    setModalObj({
      isOpened: false,
      amount: 0,
      actionType: 'principal',
      action: '',
      operatorOperationId: 'pickOne',
      mobileMoneyNumber: ''
    });
  };

  const renderActionButtons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ActionButton
        action="credit"
        label="Credit"
        icon={ArrowLeftOnRectangleIcon}
        colorClass="btn-success focus:bg-success-300 btn-outline "
        setModalObj={setModalObj}
      />
      <ActionButton
        action="debit"
        label="Debit"
        icon={ArrowRightOnRectangleIcon}
        colorClass="btn-secondary btn-outline"
        setModalObj={setModalObj}
      />
      <ActionButton
        action="block"
        label={isActive ? 'Block' : 'Unblock'}
        icon={LockClosedIcon}
        colorClass="btn-outline btn-error"
        isActive={isActive}
        setModalObj={setModalObj}
      />
    </div>
  );

  /**
   * Renders the statistics section displaying wallet balance and transaction statistics.
   */
  const renderStatistics = () => (
    <div className="grid mb-3 md:grid-cols-3 grid-cols-1 gap-6 my-2">
      {/* Statistics components */}
      <div className="stats shadow">
        <div className="stat">
          <div className={`stat-figure dark:text-slate-300 text-secondary`}>
            <CiMoneyCheck1 className="w-6 h-6" />
          </div>
          <div className="stat-title dark:text-slate-300">Principal Account</div>
          <div className={`stat-value dark:text-slate-300 text-secondary text-[1.5rem]`}>
            {numeral(parseInt(livreurWallet?.balance || 0)).format('0,0')}
          </div>
          <div className={'stat-desc  '}>
            Bonus Account: {numeral(parseInt(livreurWallet?.bonus || 0)).format('0,0')}
          </div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className={`stat-figure dark:text-slate-300 text-secondary`}>
            <SlWallet className="w-6 h-6" />
          </div>
          <div className="stat-title dark:text-slate-300">Cash In</div>
          <div className={`stat-value dark:text-slate-300 text-secondary text-[1.5rem]`}>
            {numeral(
              parseInt(sumTransactionsWithBonusDifferentiation()?.creditedOtherTotal || 0)
            ).format('0,0')}
          </div>
          <div className={'stat-desc  '}>
            {numeral(
              parseInt(sumTransactionsWithBonusDifferentiation()?.creditedBonusTotal || 0)
            ).format('0,0')}{' '}
            on bonus
          </div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className={`stat-figure dark:text-slate-300 text-secondary`}>
            <MdOutlineSendToMobile className="w-6 h-6" />
          </div>
          <div className="stat-title dark:text-slate-300">Cash Out</div>
          <div className={`stat-value dark:text-slate-300 text-secondary text-[1.5rem]`}>
            {numeral(
              parseInt(sumTransactionsWithBonusDifferentiation()?.debitedOtherTotal || 0)
            ).format('0,0')}
          </div>
          <div className={'stat-desc  '}>
            {numeral(
              parseInt(sumTransactionsWithBonusDifferentiation()?.debitedBonusTotal || 0)
            ).format('0,0')}{' '}
            on bonus
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isLoading && (
        <div className="w-full my-2">
          <div className="w-full">
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
          </div>
          <div className="w-full">{renderActionButtons()}</div>

          {/* Statistics display */}
          {renderStatistics()}

          {/* Transactions table */}
          <ClientTransactionsTable onLoad={handleLoadMoreTransactions} />
        </div>
      )}

      <CreditDebitModal
        modalObj={modalObj}
        setModalObj={setModalObj}
        extraObject={extraObject}
        closeModal={handleCloseModal}
        isLivreur={true}
      />

      <BlockUnblockModal
        modalObj={modalObj}
        setModalObj={setModalObj}
        isActive={isActive}
        setIsActive={setIsActive}
        extraObject={extraObject}
        closeModal={handleCloseModal}
      />
    </>
  );
};

export default LivreurWalletDetailView;

/**
 * Renders an action button with a specified icon and label.
 *
 * @param {Object} props - Properties passed to the component.
 * @param {string} props.action - The action type (e.g., 'credit', 'debit').
 * @param {string} props.label - The label displayed on the button.
 * @param {Function} props.Icon - The icon component to be displayed.
 * @param {string} props.colorClass - Additional CSS classes for styling.
 * @param {boolean} props.isActive - Indicates if the button is active.
 * @param {Function} props.setModalObj - Function to update the modal state.
 * @returns {React.Component} A button component with an icon and label.
 */
const ActionButton = ({ action, label, icon: Icon, colorClass, isActive, setModalObj }) => (
  <button
    className={`btn btn-sm w-full ${colorClass} ${isActive ? 'focus:ring-error-500' : ''}`}
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
