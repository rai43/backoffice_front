import React, { useState } from 'react';

import { useDispatch } from 'react-redux';

import { FaAmazonPay } from 'react-icons/fa';

import { showNotification } from '../../common/headerSlice';
import { payColisMerchant } from '../parcelsManagementSlice';

const MerchantPayment = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();

  const colisStatus = extraObject?.colis?.colis_statuses?.length
    ? extraObject?.colis?.colis_statuses[0]?.colis_status?.code?.toUpperCase()
    : // extraObject?.colis?.colis_statuses?.length - 1
      '';

  const [paymentAmount, setPaymentAmount] = useState(
    extraObject?.colis?.fee_payment === 'PREPAID' && colisStatus !== 'LOST'
      ? parseInt(extraObject?.colis?.price || 0) - parseInt(extraObject?.colis?.fee || 0)
      : parseInt(extraObject?.colis?.price || 0)
  );

  const handleSubmit = async () => {
    if (!extraObject?.colis?.id || !paymentAmount || paymentAmount <= 0) {
      dispatch(
        showNotification({
          message: 'Conditions are not met to pay this colis merchant',
          status: 0
        })
      );
      return;
    }

    try {
      // Dispatch the payColisMerchant action with all parcels data
      const response = await dispatch(
        payColisMerchant({ colisId: extraObject?.colis?.id, amount: paymentAmount })
      );

      if (payColisMerchant.rejected.match(response)) {
        // Handle the error
        console.log(response.payload); // This will contain the error message
      }

      if (response?.error) {
        // Display error notification
        dispatch(
          showNotification({
            message: 'Error while paying the colis merchant',
            status: 0
          })
        );
      } else {
        // Success notification
        dispatch(
          showNotification({
            message: 'Successfully paid the colis merchant',
            status: 1
          })
        );

        // Optional: Close modal or reset form here
        closeModal();
      }
    } catch (error) {
      // Handle any other errors
      console.error('Submission error:', error);
      dispatch(
        showNotification({
          message: 'An unexpected error occurred during payment',
          status: 0
        })
      );
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 md:gap-3">
        <div className="">Client</div>
        <div className="font-semibold">{extraObject?.colis?.client?.phone_number}</div>
        <div className="">Amount</div>
        <div className="font-semibold">{parseInt(extraObject?.colis?.price || 0)}</div>
        {extraObject?.colis?.fee_payment === 'PREPAID' && colisStatus !== 'LOST' ? (
          <>
            <div className="">Delivery Fee</div>
            <div className="font-semibold">{parseInt(extraObject?.colis?.fee || 0)}</div>
            <div className="">Fee To Be Paid</div>
            <div className="font-semibold text-primary">
              {parseInt(extraObject?.colis?.price || 0) - parseInt(extraObject?.colis?.fee || 0)}
            </div>
          </>
        ) : (
          <></>
        )}
        <div className="form-control w-full md:col-span-2">
          <label className="label">
            <span className={'label-text text-secondary font-semibold'}>
              The following amount will be credited to the merchant account
            </span>
          </label>
          <input
            type="text"
            value={paymentAmount}
            className="input input-sm input-bordered w-full"
            onChange={(e) => setPaymentAmount(parseInt(e.target.value || 0))}
            disabled={true}
          />
        </div>
      </div>
      <div className="flex justify-around flex-wrap gap-3 my-5">
        <button className={'inline-flex btn btn-outline btn-ghost'} onClick={() => closeModal()}>
          Cancel
        </button>
        <button className={'inline-flex btn btn-outline btn-secondary'} onClick={handleSubmit}>
          Proceed <FaAmazonPay className={'ml-2 h-6 w-6'} />
        </button>
      </div>
    </div>
  );
};

export default MerchantPayment;
