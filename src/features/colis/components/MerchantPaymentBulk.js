import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AgGridReact } from 'ag-grid-react';
import html2canvas from 'html2canvas';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import { FaAmazonPay } from 'react-icons/fa';

import { classNames } from '../../../components/Common/UtilsClassNames';
import { STATUS_ENGLISH_VS_FRENCH } from '../../../utils/colisUtils';
import { disableScroll, enableScroll } from '../../../utils/functions/preventAndAllowScroll';
import { AG_GRID_DEFAULT_COL_DEF } from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';
import { toggleDiscountStatus } from '../../discountManagement/discountManagementSlice';
import { payColisMerchantBulk } from '../parcelsManagementSlice';

const gridOptions = {
  // paginationPageSize: 20,
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};
const MerchantPaymentBulk = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const { colis, pointMarchant, from, to } = extraObject;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(pointMarchant);

  useEffect(() => {
    setFilteredData(
      Object.fromEntries(Object.entries(pointMarchant).filter(([key]) => key.includes(searchTerm)))
    );
  }, [searchTerm, pointMarchant]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = async (paymentArray) => {
    if (!Array.isArray(paymentArray) || paymentArray?.length === 0) {
      const message = 'Payment information is empty or not in the correct format';
      console.log(message);
      dispatch(
        showNotification({
          message: message,
          status: 0
        })
      );
      return;
    }

    try {
      // Dispatch the payColisMerchantBulk action with all parcels data
      const response = await dispatch(payColisMerchantBulk({ paymentArray }));

      if (payColisMerchantBulk.rejected.match(response)) {
        // Handle the error
        console.log(response.payload); // This will contain the error message
      }

      if (response?.error) {
        // Display error notification
        dispatch(
          showNotification({
            message: 'Error while paying the colis merchant in bulk',
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
    <div className="p-4">
      <input
        type="text"
        placeholder="Rechercher par numéro de marchand"
        className="input input-bordered w-full"
        onChange={handleSearchChange}
      />

      {Object.entries(filteredData)?.map(([phone, data], index) => (
        <MerchantPaymentBulkContent
          key={phone}
          merchantPhoneNumber={phone}
          data={data}
          from={from}
          to={to}
          onSubmit={() =>
            handleSubmit(
              data?.colisList?.map((colis) => {
                return { colisId: colis?.id };
              })
            )
          }
        />
      ))}
    </div>
  );
};

export default MerchantPaymentBulk;

const MerchantPaymentBulkContent = ({ merchantPhoneNumber, data, from, to, onSubmit }) => {
  const [confirmPayment, setConfirmPayment] = useState(false);

  // Function to determine the color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-500';
      case 'LOST':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="my-20">
      <div className="divider text-primary font-bold">MARCHAND: +225 {merchantPhoneNumber}</div>
      <div
        className="bg-white rounded-lg shadow-md shadow-cyan-800 overflow-hidden mt-4 mx-4"
        id={`content-${merchantPhoneNumber}`}>
        <div className="p-4 bg-gray-100 border-b">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Paiement Marchant - {merchantPhoneNumber}
            <span className="block text-sm font-normal text-gray-600">
              du {moment.utc(from).format('DD-MM-YYYY')} au {moment.utc(to).format('DD-MM-YYYY')}
            </span>
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total des Livraisons</div>
                <div className="stat-value">{data?.deliveryStatusCounts?.total}</div>
                <div className="stat-desc">
                  {data?.deliveryStatusCounts?.DELIVERED} article(s) livré(s)
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">Montant Total</div>
                <div className="stat-value text-[1.5rem]">{data?.totalAmountToBePaid} CFA</div>
                <div className="stat-desc">Montant total à payer</div>
              </div>

              <div className="stat">
                <div className="stat-title">Frais de Transfert (1%)</div>
                <div className="stat-value text-[1.5rem]">{data?.processingFee} CFA</div>
                <div className="stat-desc">Frais</div>
              </div>

              <div className="stat">
                <div className="stat-title">Montant Final</div>
                <div className="stat-value text-[1.5rem] text-primary">
                  {data?.finalAmountDue} CFA
                </div>
                <div className="stat-desc">Après déduction des frais</div>
              </div>
            </div>
          </div>

          {confirmPayment ? (
            <>
              <h3 className="font-bold text-lg text-center">
                Êtes-vous sûr de vouloir payer
                <span className="text-primary mx-2">{data?.finalAmountDue} CFA</span> au marchand
                <span className="text-primary mx-2">{merchantPhoneNumber}</span> ?
              </h3>
              <div className="flex justify-center py-2 gap-3">
                <button
                  className="btn btn-error btn-outline"
                  onClick={() => {
                    setConfirmPayment((_) => false);
                  }}>
                  Annuler
                </button>
                <button className="btn btn-info btn-outline" onClick={onSubmit}>
                  <FaAmazonPay className="h-6 w-6 mx-2" /> Payer le Marchant
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-center py-2">
              <button
                className="btn btn-info btn-outline"
                onClick={() => {
                  setConfirmPayment((_) => true);
                }}
                // onClick={onSubmit}
              >
                <FaAmazonPay className="h-6 w-6 mx-2" /> Payer le Marchant {merchantPhoneNumber}
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="table table-zebra table-compact table-auto w-full text-left whitespace-no-wrap my-5">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-gray-500 uppercase border-b bg-gray-300">
                  <th>Statut</th>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {data?.deliveryStatusCounts?.DELIVERED ? (
                  <tr>
                    <td>Livré</td>
                    <td>{data?.deliveryStatusCounts?.DELIVERED}</td>
                  </tr>
                ) : (
                  <></>
                )}
                {data?.deliveryStatusCounts?.ARTICLE_TO_RETURN ? (
                  <tr>
                    <td>Article à Retourner</td>
                    <td>{data?.deliveryStatusCounts?.ARTICLE_TO_RETURN}</td>
                  </tr>
                ) : (
                  <></>
                )}
                {data?.deliveryStatusCounts?.LOST ? (
                  <tr>
                    <td>Perdu</td>
                    <td>{data?.deliveryStatusCounts?.LOST}</td>
                  </tr>
                ) : (
                  <></>
                )}

                {data?.deliveryStatusCounts?.REGISTERED ? (
                  <tr>
                    <td>Enregistré</td>
                    <td>{data?.deliveryStatusCounts?.REGISTERED}</td>
                  </tr>
                ) : (
                  <></>
                )}

                {data?.deliveryStatusCounts?.PENDING ? (
                  <tr>
                    <td>En Attente</td>
                    <td>{data?.deliveryStatusCounts?.PENDING}</td>
                  </tr>
                ) : (
                  <></>
                )}
                <tr className="text-primary font-bold">
                  <td>Total</td>
                  <td>{data?.deliveryStatusCounts?.total}</td>
                </tr>
              </tbody>
            </table>
            <table className="table table-compact table-zebra w-full">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Client</th>
                  <th>Lieu De Livraison</th>
                  <th>Prix</th>
                  <th>Livraison</th>
                  <th>Prix Marchand</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.colisList?.map((colis) => {
                  const status = colis?.colis_statuses?.length
                    ? colis?.colis_statuses[colis?.colis_statuses?.length - 1]?.colis_status?.code
                    : 'N/A';
                  const statusColor = getStatusColor(status);

                  return (
                    <tr key={colis?.id}>
                      <td>{colis?.code}</td>
                      <td>{colis?.delivery_phone_number}</td>
                      <td>{colis?.delivery_address_name}</td>
                      <td>{parseInt(colis?.price)}</td>
                      <td
                        className={`${
                          colis?.fee_payment === 'PREPAID' && status !== 'LOST' ? 'text-error' : ''
                        }`}>
                        {parseInt(colis?.fee)}
                      </td>
                      <td className="text-primary font-semibold">
                        {colis?.fee_payment === 'PREPAID' && status !== 'LOST'
                          ? parseInt(colis?.price) - parseInt(colis?.fee)
                          : parseInt(colis?.price)}
                      </td>
                      <td>
                        <span
                          className={`px-3 py-1 uppercase text-xs font-bold rounded-full ${statusColor}`}>
                          {STATUS_ENGLISH_VS_FRENCH(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
