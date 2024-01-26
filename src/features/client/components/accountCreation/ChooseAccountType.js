import React from 'react';

import PersonalImageBg from '../../../../assets/clientImageBg.avif';
import SellerImageBg from '../../../../assets/SellerImageBg.avif';

/**
 * Component for choosing the type of account to create.
 * It displays two options, personal and merchant, each represented by a card.
 * The user can select an option by clicking on the respective card.
 *
 * @param {Object} props - Component props.
 * @param {string} props.selectedAccount - The currently selected account type.
 * @param {Function} props.setSelectedAccount - Function to update the selected account type.
 * @param {Function} props.clickAction - Function to handle click actions, typically used to navigate to the next step.
 * @returns {React.Component} A component with account type selection cards and navigation button.
 */
const ChooseAccountType = ({ selectedAccount, setSelectedAccount, clickAction }) => {
  return (
    <>
      <div className="w-full flex items-center justify-center my-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center">
          <div
            className={`card transition-transform transform hover:scale-105 duration-300 rounded-lg w-11/12 md:w-5/6 lg:w-3/4 xl:w-1/2 bg-white shadow-xl hover:shadow-2xl mx-4 hover:cursor-pointer ${
              selectedAccount === 'personal' ? 'border-t-4 border-b-4 border-primary' : ''
            }`}
            onClick={() => setSelectedAccount('personal')}>
            <figure className="rounded-t-lg">
              <img src={PersonalImageBg} alt="Personal account" className="rounded-t-lg" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-center">Create a Personal Account</h2>
            </div>
          </div>

          <div
            className={`card transition-transform transform hover:scale-105 duration-300 rounded-lg w-11/12 md:w-5/6 lg:w-3/4 xl:w-1/2 bg-slate-100 shadow-xl hover:shadow-2xl mx-4 hover:cursor-pointer ${
              selectedAccount === 'merchant' ? 'border-t-4 border-b-4 border-primary' : ''
            }`}
            onClick={() => setSelectedAccount('merchant')}>
            <figure className="rounded-t-lg">
              <img src={SellerImageBg} alt="Merchant account" className="rounded-t-lg" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-center">Create a Merchant Account</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-start-2 grid grid-cols-1 content-end mx-4 my-3 md:my-1">
        <button
          className="md:col-start-2 btn btn-outline btn-primary btn-sm"
          onClick={() => clickAction((old) => old + 1)}>
          Next
        </button>
      </div>
    </>
  );
};

export default ChooseAccountType;
