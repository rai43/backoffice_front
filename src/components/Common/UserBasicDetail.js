import React from 'react';

import streetLogo from '../../assets/street_logo.jpeg';

/**
 * Component to display basic details of a user.
 *
 * @param {Object} props - Component props.
 * @param {string} props.phone_number - Phone number of the user.
 * @param {boolean} props.is_deleted - Indicates if the user is deleted.
 * @param {string} props.photo - Photo URL of the user.
 * @param {Object} props.client_type - Type of the client.
 * @param {Object} props.country - Country information of the user.
 * @param {Array} props.merchants - List of merchants associated with the user.
 * @param {boolean} props.isLivreur - Flag to indicate if the user is a delivery person.
 * @returns {React.ReactElement} - A component showing the user's basic details.
 */
const UserBasicDetail = ({
  phone_number,
  is_deleted,
  photo,
  client_type,
  country,
  merchants,
  isLivreur
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center p-4 bg-white shadow rounded-lg">
      <div className="flex-shrink-0 h-20 w-20 mx-5">
        <img
          className="h-20 w-20 rounded-full border border-gray-300"
          src={photo?.startsWith('http') ? photo : streetLogo}
          alt="User"
        />
      </div>
      <div className="flex-grow text-left ml-4">
        <div className="text-lg font-semibold">
          {country?.prefix ? country.prefix + ' ' : '+225 '} {phone_number}
        </div>
        <div className="text-sm text-gray-500">
          Mobile Number {isLivreur ? ' / WhatsApp / Emergency' : ''}
        </div>
        {!isLivreur ? (
          <div className="mt-2 text-primary font-medium">
            {merchants[0]?.name?.toLocaleUpperCase() || client_type?.libelle?.toLocaleUpperCase()}
          </div>
        ) : (
          <div className="mt-2 text-primary font-medium">{merchants}</div>
        )}
        <div
          className={`mt-1 h-2 w-2 rounded-full ${is_deleted ? 'bg-error' : 'bg-success'}`}></div>
        <div className="text-xs text-gray-500">{is_deleted ? 'Inactive User' : 'Active User'}</div>
      </div>
    </div>
  );
};

export default UserBasicDetail;
