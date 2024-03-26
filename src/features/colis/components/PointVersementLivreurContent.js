import React, { useEffect, useState } from 'react';

import axios from 'axios';
import moment from 'moment';

import { STATUS_ENGLISH_VS_FRENCH } from '../../../utils/colisUtils';
import { TABS_ENUMERATION_IN_QR_CODE_PANEL } from '../../../utils/globalConstantUtil';
import parcelsUtils from '../parcels.utils';

const findLivreurInfo = (colis, livreurId) => {
  let livreur = null;
  console.log({ colis, livreurId });
  colis?.find((c) => {
    console.log({ c });
    c?.commande_colis?.map((cc) => {
      if (cc?.livreur_id === livreurId) {
        livreur = cc?.livreur;
        return c;
      }
    });
  });
  return livreur;
};

export const determinePhase = (status) => {
  const collectionStatuses = [
    // 'PENDING',
    // 'REGISTERED',
    // 'CANCELED',
    // 'ASSIGNED_FOR_COLLECTION',
    // 'COLLECTION_IN_PROGRESS',
    // 'NOT_COLLECTED',
    // 'COLLECTION_POSTPONED'
    'COLLECTED'
  ];
  const deliveryStatuses = [
    // 'WAREHOUSED',
    // 'ASSIGNED_FOR_DELIVERY',
    // 'WAITING_FOR_DELIVERY',
    // 'DELIVERY_IN_PROGRESS',
    // 'NOT_DELIVERED',
    // 'DELIVERY_POSTPONED',
    // 'REFUSED',
    'DELIVERED'
  ];

  if (collectionStatuses.includes(status)) {
    return 'Collection';
  } else if (deliveryStatuses.includes(status)) {
    return 'Delivery';
  }
  return null;
};

export const calculateMontantACollecter = (colis, phase) => {
  if (colis.fee_payment === 'POSTPAID') {
    if (colis.price <= 0) {
      if (phase === 'Delivery') {
        return colis.fee;
      } else if (phase === 'Collection') {
        return 0;
      }
    } else {
      if (phase === 'Delivery') {
        return parseInt(colis.fee) + parseInt(colis.price);
      } else if (phase === 'Collection') {
        return 0;
      }
    }
  } else if (colis.fee_payment === 'PREPAID') {
    if (colis.price <= 0) {
      if (phase === 'Delivery') {
        return 0;
      } else if (phase === 'Collection') {
        return colis.fee;
      }
    } else {
      if (phase === 'Delivery') {
        return parseInt(colis.price);
      } else if (phase === 'Collection') {
        return parseInt(colis.fee);
      }
    }
  }
  return 0;
};

const PointVersementLivreurContent = ({ livreur, data, setPaymentList, onCopy }) => {
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

  const markVersementDone = async (commandeColisIds) => {
    try {
      const responseForPaymentParcels = await axios.post('/api/colis/mark-colis-versement-done', {
        commande_colis_ids: commandeColisIds
      });

      const fetchedVersemnentParcels = responseForPaymentParcels?.data?.colis?.colis;

      console.log({ fetchedVersemnentParcels });

      const newData = (fetchedVersemnentParcels || [])?.filter((colis) => {
        const ongoingAssignment = parcelsUtils.findOngoingAssignment(colis);
        if (ongoingAssignment && livreur === ongoingAssignment?.livreur_id) {
          return colis;
        }
      });

      setPaymentList(() => newData);
    } catch (error) {
      console.error('Failed to fetch parcel data:', error);
    }
  };

  const livreurInfo = findLivreurInfo(data, livreur);

  // Calculate total amount to be paid and total delivery fees
  let totalAmountToBePaid = 0;
  let totalDeliveryFees = 0;

  data?.forEach((colis) => {
    const paymentList =
      colis?.commande_colis?.filter(
        (cc) => cc.livreur_id === livreur && cc.versement_status === 'PENDING'
      ) || [];

    paymentList.forEach((paymentItem) => {
      const status = paymentItem?.colis_status?.colis_status?.code;
      const phase = determinePhase(status);
      const montantACollecter = calculateMontantACollecter(colis, phase);

      totalAmountToBePaid += parseInt(montantACollecter || 0);
      if (phase === 'Delivery') {
        totalDeliveryFees += parseInt(colis.fee);
      }
    });
  });

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden mt-4 mx-4"
        id={`content-${livreurInfo?.id}`}>
        <div className="p-4 bg-gray-100 border-b">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Point Livreur
            <span className="block text-sm font-normal text-gray-600">
              {`${livreurInfo?.last_name} ${livreurInfo?.first_name} - ${livreurInfo?.client?.phone_number}`}
            </span>
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Parcels</div>
                <div className="stat-value">{data?.length || 0}</div>
                <div className="stat-desc">concerned parcels</div>
              </div>
              <div className="stat">
                <div className="stat-title">Due Montant</div>
                <div className="stat-value text-[1.5rem]">{totalAmountToBePaid} CFA</div>
                <div className="stat-desc">Pour le marchant</div>
              </div>
              <div className="stat">
                <div className="stat-title">Payment Action</div>
                <div className="stat-value text-[1.5rem]">{totalAmountToBePaid} CFA</div>
                <div className="stat-desc">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      let paymentList = [];
                      data?.map((colis) => {
                        colis?.commande_colis?.filter((cc) => {
                          if (cc?.livreur_id === livreur && cc?.versement_status === 'PENDING') {
                            paymentList.push(cc?.id);
                            return true;
                          }
                          return false;
                        });
                      });
                      await markVersementDone(paymentList);
                    }}>
                    Mark All Paid
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>Action</th>
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
                {data?.map((colis) => {
                  const paymentList =
                    colis?.commande_colis?.filter(
                      (cc) => cc.livreur_id === livreur && cc.versement_status === 'PENDING'
                    ) || [];

                  return paymentList.map((paymentItem, index) => {
                    const status = paymentItem?.colis_status?.colis_status?.code;
                    const phase = determinePhase(status);
                    const montantACollecter = calculateMontantACollecter(colis, phase);
                    const statusColor = getStatusColor(status);

                    return (
                      <tr
                        key={`${colis?.id}-${index}`}
                        className={status === 'DELIVERED' || status === 'LOST' ? 'active' : ''}>
                        <td>
                          <button
                            className="btn btn-primary btn-outline btn-sm"
                            onClick={async () => {
                              await markVersementDone([paymentItem?.id]);
                            }}>
                            Paid
                          </button>
                        </td>
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
    </>
  );
};

export default PointVersementLivreurContent;
