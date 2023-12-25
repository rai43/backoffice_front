import React from 'react';

const PersonalCardTransactionsNav = ({ activePage, setActivePage, accountType }) => {
  return (
    <>
      <div className="my-2">
        <div className="tabs my-1">
          <button
            className={`tab tab-bordered w-1/2 ${
              activePage === '/my-wallet/transactions' ? 'tab-active' : ''
            }`}
            onClick={() => {
              if (activePage !== '/my-wallet/transactions') {
                setActivePage('/my-wallet/transactions');
              }
            }}
          >
            Transactions
          </button>
          {accountType === 'MARCH' ? (
            <button
              className={`tab tab-bordered w-1/2 ${
                activePage === '/marchant-wallet/requests' ? 'tab-active' : ''
              }`}
              onClick={() => {
                if (activePage !== '/marchant-wallet/requests') {
                  setActivePage('/marchant-wallet/requests');
                }
              }}
            >
              Requests
            </button>
          ) : (
            <button
              className={`tab tab-bordered w-1/2 ${
                activePage === '/personal-wallet/rechargements' ? 'tab-active' : ''
              }`}
              onClick={() => {
                if (activePage !== '/personal-wallet/rechargements') {
                  setActivePage('/personal-wallet/rechargements');
                }
              }}
            >
              Rechargement
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default PersonalCardTransactionsNav;
