import React from 'react';

import moment from 'moment/moment';

import { calculateMontantACollecter, determinePhase } from './PointVersementLivreurContent';
import { STATUS_ENGLISH_VS_FRENCH } from '../../../utils/colisUtils';

const PointLivreurContent = ({ livreurInfo, data, from, to, onCopy }) => {
  // Function to determine the color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-500';
      case 'LOST':
        return 'text-red-500';
      case 'PENDING':
        return 'text-yellow-500';
      case 'ARTICLE_TO_RETURN':
        return 'text-blue-500';
      case 'REGISTERED':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <>
      <div className="divider text-primary font-bold">LIVREUR: {livreurInfo}</div>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden mt-4 mx-4"
        id={`content-${livreurInfo}`}>
        <div className="p-4 bg-gray-100 border-b">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Point Livreur
            <span className="block text-sm font-normal text-gray-600">
              {livreurInfo} FROM {moment.utc(from).format('DD/MM/YYYY')} TO{' '}
              {moment.utc(to).format('DD/MM/YYYY')}
            </span>
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Delivery Amount</div>
                <div className="stat-value text-[1.5rem]">{data?.totalAmountToBePaid} CFA</div>
                <div className="stat-desc">For the article price</div>
              </div>

              <div className="stat">
                <div className="stat-title">Frais de Livraison</div>
                <div className="stat-value text-[1.5rem]">{data?.totalDeliveryFees} CFA</div>
                <div className="stat-desc">For the delivery</div>
              </div>

              <div className="stat">
                <div className="stat-title">Montant Final</div>
                <div className="stat-value text-[1.5rem] text-primary">{data?.finalAmount} CFA</div>
                <div className="stat-desc">Amount owned by livreur</div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Merchant</th>
                  <th>Pickup</th>
                  <th>Client</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {data?.colis?.map((colis) => {
                  return colis?.commande_colis?.map((paymentItem, index) => {
                    const status = paymentItem?.colis_status?.colis_status?.code;
                    const phase = determinePhase(status);
                    const montantACollecter = calculateMontantACollecter(colis, phase);
                    const statusColor = getStatusColor(status);

                    return (
                      <tr
                        key={`${colis?.id}-${index}`}
                        className={status === 'DELIVERED' || status === 'LOST' ? 'active' : ''}>
                        <td>{colis?.code}</td>
                        <td>
                          <span
                            className={`px-3 py-1 uppercase text-xs font-bold rounded-full ${statusColor}`}>
                            {STATUS_ENGLISH_VS_FRENCH(status)}
                          </span>
                        </td>
                        <td className="text-primary font-semibold">{montantACollecter}</td>
                        <td>{moment.utc(colis?.created_at).format('DD/MM/YYYY HH:mm')}</td>
                        <td className="font-semibold">{colis?.fee_payment}</td>
                        <td>{parseInt(colis?.price)}</td>
                        <td>{parseInt(colis?.fee)}</td>
                        <td>{colis?.pickup_phone_number}</td>
                        <td>{colis?.pickup_address?.description}</td>
                        <td>{colis?.delivery_phone_number}</td>
                        <td>{colis?.delivery_address?.description}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex justify-end p-4">
        <button className="btn btn-primary btn-outline" onClick={onCopy}>
          Copier le Point du Livreur {livreurInfo}
        </button>
      </div>
    </>
  );
};

export default PointLivreurContent;
