import moment from 'moment';
import React from 'react';

import ArrowLongRightIcon from '@heroicons/react/24/outline/ArrowLongRightIcon';
import ArrowLongDownIcon from '@heroicons/react/24/outline/ArrowLongDownIcon';

const WalletCard = ({ wallet, transactionType }) => {
  return (
    <>
      {wallet?.wallet_type ? (
        <div
          className={`w-full border-base-100 rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] max-h-[15rem] mt-3 p-4`}
        >
          <div className="flex flex-col items-center pb-4">
            <span
              className={`rounded-full px-3 m-2 ${
                wallet?.wallet_type?.libelle.startsWith('MERCHANT')
                  ? 'bg-violet-100 text-violet-700'
                  : wallet?.wallet_type?.libelle.startsWith('PERSONAL')
                    ? 'bg-blue-100 text-blue-700'
                    : wallet?.wallet_type?.libelle.startsWith('LIVREUR')
                      ? 'bg-teal-100 text-teal-700'
                      : null
              }`}
            >
              {wallet?.wallet_type?.libelle || 'N/A'}
            </span>

            <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
              {wallet?.client?.phone_number}
            </h5>
            <h5 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
              BALANCE: <span className="text-primary">{wallet?.balance} FCFA</span>
            </h5>
            <h5 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
              BONUS: <span className="text-secondary">{wallet?.bonus} FCFA</span>
            </h5>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <span>{transactionType?.code?.toUpperCase()}</span>
        </div>
      )}
    </>
  );
};

const TransactionDetails = ({ extraObject }) => {
  console.log(extraObject);
  return (
    <>
      <div className="stats shadow w-full">
        <div className="stat place-items-center">
          <div className="stat-title">Transaction Reference</div>
          <div className="stat-value text-[1.3rem] text-secondary">{extraObject?.reference}</div>
          <div className="stat-desc">{extraObject?.transaction_type?.code || 'N/A'}</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">Transaction Amount</div>
          <div className="stat-value text-secondaryd text-[1.8rem]">
            {extraObject?.amount || 0} FCFA
          </div>
          <div
            className={`stat-desc font-semibold ${
              extraObject?.transaction_status?.code === 'COMPLETED' ? 'text-success' : ''
            }`}
          >
            {extraObject?.transaction_status?.code || 'N/A'}
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">Date</div>
          <div className="stat-value text-[1.3rem]">
            {moment.utc(extraObject?.created_at).format('DD-MM-YYYY')}
          </div>
          <div className="stat-desc">{moment.utc(extraObject?.created_at).format('HH:mm')}</div>
        </div>
        {/*<div className="stat place-items-center">*/}
        {/*  <div className="stat-title">Date</div>*/}
        {/*  <div className="stat-value text-[1.3rem]">*/}
        {/*    {moment.utc(extraObject?.created_at).format("DD-MM-YYYY")}*/}
        {/*  </div>*/}
        {/*  <div className="stat-desc">*/}
        {/*    {moment.utc(extraObject?.created_at).format("HH:mm")}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>

      <h3 className="mt-4">Cash Flow</h3>
      <div className="divider mt-0"></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5">
        <div className="w-full">
          <WalletCard
            wallet={extraObject?.sender_wallet}
            transactionType={extraObject?.transaction_type}
          />
        </div>
        <div className="flex items-center justify-center">
          <ArrowLongRightIcon className="h-20 w-32 hidden sm:block" />
          <ArrowLongDownIcon className="h-20 w-32 sm:hidden" />
        </div>
        <div className="w-full">
          <WalletCard
            wallet={extraObject?.receiver_wallet}
            transactionType={extraObject?.transaction_type}
          />
        </div>
      </div>
    </>
  );
};

export default TransactionDetails;
