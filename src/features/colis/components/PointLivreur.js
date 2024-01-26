import React, { useState, useEffect } from 'react';

import html2canvas from 'html2canvas';
import moment from 'moment/moment';
import { useDispatch } from 'react-redux';

import { STATUS_ENGLISH_VS_FRENCH } from '../../../utils/colisUtils';
import { showNotification } from '../../common/headerSlice';

const PointLivreur = ({ extraObject, closeModal }) => {
  const { pointLivreur, from, to } = extraObject;
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(pointLivreur);

  useEffect(() => {
    setFilteredData(
      Object.fromEntries(
        Object.entries(pointLivreur).filter(([key]) =>
          key?.replaceAll('_', ' ')?.toLowerCase()?.includes(searchTerm?.toLowerCase())
        )
      )
    );
  }, [searchTerm, pointLivreur]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  console.log({ pointLivreur });

  const handleCopyContent = async (contentId) => {
    const content = document.getElementById(contentId);
    const canvas = await html2canvas(content);
    canvas.toBlob((blob) => {
      const item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item]);
    });

    dispatch(
      showNotification({
        message: 'Copied',
        status: 1
      })
    );
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Rechercher par numéro du livreur ou son nom"
        className="input input-bordered w-full"
        onChange={handleSearchChange}
      />

      {Object.entries(filteredData)
        ?.sort(([keyA], [keyB]) => {
          if (keyA === 'no_delivery_livreur') return -1;
          if (keyB === 'no_delivery_livreur') return 1;
          return 0;
        })
        .map(([phone, data], index) => (
          <PointLivreurContent
            key={phone}
            livreurInfo={phone !== 'no_delivery_livreur' ? phone : 'No Delivery Livreur'}
            data={data}
            from={from}
            to={to}
            onCopy={() => handleCopyContent(`content-${phone}`)}
          />
        ))}
    </div>
  );
};

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
            Point Livreur - {livreurInfo}
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
                <div className="stat-desc">Pour le marchant</div>
              </div>

              <div className="stat">
                <div className="stat-title">Frais de Livraison</div>
                <div className="stat-value text-[1.5rem]">{data?.totalFee} CFA</div>
                <div className="stat-desc">Pour la livraison</div>
              </div>

              <div className="stat">
                <div className="stat-title">Montant Final</div>
                <div className="stat-value text-[1.5rem] text-primary">
                  {data?.totalAmountToBePaid + data?.totalFee} CFA
                </div>
                <div className="stat-desc">Total à Payer par le Livreur</div>
              </div>
            </div>
          </div>
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
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Client</th>
                  <th>Lieu De Livraison</th>
                  <th>Prix</th>
                  <th>Livraison</th>
                  <th>Payment Method</th>
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
                    <tr
                      key={colis?.id}
                      className={status === 'DELIVERED' || status === 'LOST' ? 'active' : ''}>
                      <td>{colis?.code}</td>
                      <td>{colis?.delivery_phone_number}</td>
                      <td>{colis?.delivery_address_name}</td>
                      <td>{parseInt(colis?.price)}</td>
                      <td>{parseInt(colis?.fee)}</td>
                      <td className="font-semibold">{colis?.fee_payment}</td>
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
      <div className="flex justify-end p-4">
        <button className="btn btn-primary btn-outline" onClick={onCopy}>
          Copier le Point du Livreur {livreurInfo}
        </button>
      </div>
    </>
  );
};

export default PointLivreur;
