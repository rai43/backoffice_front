import React, { useState, useEffect } from 'react';

import html2canvas from 'html2canvas';
import moment from 'moment/moment';
import { useDispatch } from 'react-redux';

import PointLivreurContent from './PointLivreurContent';
import { STATUS_ENGLISH_VS_FRENCH } from '../../../utils/colisUtils';
import handleCopyContent from '../../../utils/functions/handleCopyContent';
import { showNotification } from '../../common/headerSlice';

const PointLivreur = ({ extraObject, closeModal }) => {
  console.log({ extraObject });
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

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Rechercher par numéro du livreur ou son nom"
        className="input input-bordered w-full"
        onChange={handleSearchChange}
      />

      {Object.entries(filteredData).map(([phone, data]) => (
        <PointLivreurContent
          key={phone}
          livreurInfo={phone !== 'no_delivery_livreur' ? phone : 'No Delivery Livreur'}
          data={data}
          from={from}
          to={to}
          onCopy={() => handleCopyContent(`content-${phone}`, dispatch)}
        />
      ))}
    </div>
  );
};

export default PointLivreur;
