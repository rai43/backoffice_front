import React, { useEffect, useState } from 'react';

import moment from 'moment';
import { useDispatch } from 'react-redux';

import { AiOutlineCheck } from 'react-icons/ai';

import { showNotification } from '../../common/headerSlice';
import { setOrderStatusNoCheck } from '../orderSlice';

const OrderDetails = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const [totalSupplementsPrices, setTotalSupplementsPrices] = useState({
    price: 0,
    merchantPrice: 0
  });

  /**
   * useEffect Hook to calculate the total supplements prices.
   * It iterates over each article in the order and sums up the price and merchant price of each supplement.
   */
  useEffect(() => {
    const calculateSupplementTotals = () => {
      return extraObject?.article_commandes.reduce(
        (total, item) => {
          const supplementsTotalPrice = item.supplements.reduce(
            (sum, supplement) => sum + parseFloat(supplement.price || '0'),
            0
          );
          const supplementsTotalMerchantPrice = item.supplements.reduce(
            (sum, supplement) => sum + parseFloat(supplement.merchant_price || '0'),
            0
          );

          total.price += supplementsTotalPrice;
          total.merchantPrice += supplementsTotalMerchantPrice;
          return total;
        },
        { price: 0, merchantPrice: 0 }
      );
    };

    const supplementsTotals = calculateSupplementTotals();
    setTotalSupplementsPrices(supplementsTotals);
  }, [extraObject]);

  /**
   * Handles the change of order status.
   * Dispatches an action to update the order status and shows a notification based on the response.
   *
   * @param {Event} e - The event object from the select dropdown.
   */
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const response = await dispatch(
      setOrderStatusNoCheck({ commandId: extraObject?.id, status: newStatus })
    );
    if (response?.error) {
      dispatch(showNotification({ message: 'Error while changing the status', status: 0 }));
    } else {
      dispatch(showNotification({ message: 'Successfully changed the status', status: 1 }));
      closeModal();
    }
  };

  return (
    <div className="overflow-y-auto max-h-[80vh] p-4">
      {/* General Information */}
      <div className="bg-primary text-white text-center py-2 font-semibold uppercase mb-3">
        General Information - {extraObject.id}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* General Details */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">General</h2>
          <div className="text-lg">
            <p className="text-gray-600">ID:</p>
            <p className="font-semibold">{extraObject?.id}</p>
          </div>
          <div className="text-lg mt-4">
            <p className="text-gray-600">Date:</p>
            <p className="font-semibold">
              {moment.utc(extraObject?.created_at).format('DD/MM/YYYY HH:mm')}
            </p>
          </div>
          <div className="text-lg mt-4">
            <p className="text-gray-600">Client:</p>
            <p className="font-semibold">{extraObject?.client?.phone_number}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white shadow-md p-4 rounded-lg mt-4">
          <h2 className="text-xl font-semibold mb-2 text-primary">Payment Details</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-600">Method:</p>
              <p className="font-semibold">{extraObject?.payment_method}</p>
            </div>
            <div>
              <p className="text-gray-600">Client Price:</p>
              <p className="font-semibold">
                {extraObject?.total_articles}{' '}
                {parseInt(extraObject?.total_discount) > 0 && (
                  <span className="text-secondary">(- {extraObject?.total_discount})</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Merchant Price:</p>
              <p className="font-semibold">
                {extraObject?.article_commandes?.reduce(
                  (accumulator, currentObj) =>
                    accumulator + parseFloat(currentObj.merchant_price) * currentObj?.quantity,
                  0
                ) || 0}{' '}
                + (SUP. {totalSupplementsPrices?.merchantPrice || 0})
              </p>
            </div>
            <div>
              <p className="text-gray-600">Service Fee:</p>
              <p className="font-semibold">{extraObject?.service_fee}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Paid:</p>
              <p className="font-semibold">{extraObject?.total}</p>
            </div>
            <div>
              <p className="text-gray-600">Balance Share:</p>
              <p className="font-semibold">{extraObject?.balance_share}</p>
            </div>
            <div>
              <p className="text-gray-600">Bonus Share:</p>
              <p className="font-semibold">{extraObject?.bonus_share}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Details and Address Details */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Merchant Details */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">Merchant</h2>
          <div>
            <p className="text-gray-600">Name:</p>
            <p className="font-semibold">{extraObject?.merchant?.name}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Phone:</p>
            <p className="font-semibold">{extraObject?.merchant?.client?.phone_number}</p>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">Address</h2>
          <div>
            <p className="text-gray-600">Latitude:</p>
            <p className="font-semibold">{extraObject?.address?.latitude}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Longitude:</p>
            <p className="font-semibold">{extraObject?.address?.longitude}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Details:</p>
            <p className="font-semibold">
              {`${extraObject?.address?.detail} ${
                extraObject?.address?.description ? ' - ' + extraObject?.address?.description : ''
              }`}
            </p>
          </div>
        </div>
      </div>

      {/* Change Status Dropdown */}
      <div className="form-control mb-4">
        <select className="select select-bordered" onChange={handleStatusChange}>
          {/* Options */}
          <option disabled selected>
            Change Order Status
          </option>
          <option value="PENDING">PENDING</option>
          <option value="REGISTERED">REGISTERED</option>
          <option value="INPROCESS">INPROCESS</option>
          <option value="INDELIVERY">INDELIVERY</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="UNDELIVERED">UNDELIVERED</option>
          <option value="CANCELED">CANCELED</option>
        </select>
      </div>

      {/* Status Timeline */}
      <div className="card bg-base-100 shadow-xl mb-4">
        <div className="card-body">
          <h2 className="card-title text-xl font-semibold text-primary">Status Timeline</h2>
          <div className="grid md:grid-cols-5">
            {/* Loop through each status and display its timestamp */}
            {extraObject?.commande_commande_statuses.map((status, index) => (
              <div key={index} className="stat place-items-center">
                <div
                  className={`stat-title ${
                    index === extraObject?.commande_commande_statuses.length - 1
                      ? 'text-primary font-semibold'
                      : ''
                  }`}>
                  {status.commande_status.code}
                </div>
                <div className="stat-value text-">
                  {moment.utc(status.created_at).format('HH:mm')}
                </div>
                <div className="stat-desc text-">
                  {moment.utc(status.created_at).format('DD-MM-YYYY')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Articles List */}
      {extraObject?.article_commandes?.length > 0 &&
        extraObject?.article_commandes?.map((article) => (
          <ArticleDetails
            key={article?.id}
            article={article}
            totalSupplementsPrices={totalSupplementsPrices}
          />
        ))}
    </div>
  );
};

export default OrderDetails;

// Function to calculate the total supplement prices for both merchant and client
const calculateTotalSupplements = (supplements) => {
  const merTotal = supplements.reduce((accumulator, currentObj) => {
    return accumulator + parseInt(currentObj?.merchant_price);
  }, 0);
  const clientTotal = supplements.reduce((accumulator, currentObj) => {
    return accumulator + parseInt(currentObj?.price);
  }, 0);
  return { merTotal, clientTotal };
};

// Function to render the list of supplements
const renderSupplements = (supplements) => {
  return supplements.map((supp) => (
    <div key={supp?.id} className="flex items-center mb-2">
      <AiOutlineCheck className="text-green-500 w-6 h-6 mr-2" />
      <span className="text-lg">{supp?.accompagnement?.name}</span>
      <span className="text-lg ml-auto">{supp?.price}</span>
    </div>
  ));
};

const ArticleDetails = ({ article, totalSupplementsPrices }) => {
  const { id, quantity, price, supplements, merchant_price, comment, accompagnement } = article;

  const { merTotal, clientTotal } = calculateTotalSupplements(supplements);

  return (
    <div key={id} className="bg-white shadow-sm shadow-primary p-6 rounded-lg mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold">Article ID: {id}</h2>
            <div className="flex flex-col md:flex-row md:space-x-4 text-lg">
              <div className="md:w-1/2">
                <p className="text-gray-600">Name:</p>
                <p className="text-xl font-semibold">{article?.article?.title}</p>
              </div>
              <div className="md:w-1/2">
                <p className="text-gray-600">Quantity:</p>
                <p className="text-xl font-semibold">{quantity}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4 text-lg">
              <div className="md:w-1/2">
                <p className="text-gray-600">Unit Price:</p>
                <p className="text-xl font-semibold">CFA {price}</p>
              </div>
              <div className="md:w-1/2">
                <p className="text-gray-600">Total Articles:</p>
                <p className="text-xl font-semibold">CFA {price * quantity}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4 text-lg text-primary text-xl font-semibold text-center">
              <div className="md:w-full">
                <span>Total Price:</span>
                <span> CFA {price * quantity + clientTotal}</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4 text-lg">
              <div className="md:w-full">
                <span>Special Comments:</span>
                <span className="font-semibold"> {comment || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1 md:col-span-1 flex items-center justify-center">
          <div
            className="w-48 h-48 bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url('${article?.article?.image}')` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-gray-100 p-3 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Merchant Payment Info</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Articles Price:</span>
              <span className="text-green-600 font-semibold">CFA {merchant_price * quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Supplements Price:</span>
              <span className="text-blue-600 font-semibold">CFA {merTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="text-red-600 font-semibold">
                CFA {merchant_price * quantity + merTotal}
              </span>
            </div>
          </div>
        </div>
      </div>

      {accompagnement?.id && (
        <>
          <div className="border-t border-gray-300 mt-6 pt-6">
            <h2 className="text-xl font-semibold mb-4">Accompagnements</h2>
            <div key={accompagnement?.id} className="flex items-center">
              <AiOutlineCheck className="text-green-500 w-6 h-6 mr-2" />
              <span className="text-lg">{accompagnement?.name}</span>
            </div>
          </div>
        </>
      )}
      {supplements?.length > 0 && (
        <>
          <div className="border-t border-gray-300 mt-6 pt-6">
            <h2 className="text-xl font-semibold mb-4">Supplements</h2>
            {renderSupplements(supplements)}
          </div>
        </>
      )}
    </div>
  );
};
