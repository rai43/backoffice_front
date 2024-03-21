import React, { useState } from 'react';

import { useDispatch } from 'react-redux';

import InputAsyncSelect from '../../../../components/Input/InputAsyncSelect';
import { showNotification } from '../../../common/headerSlice';
import { getLivreursBySearch } from '../../../livreurs/livreursSlice';
import { changeZoneLivreurProvider } from '../colisZonesSlide';

function ChangeZoneLivreur({ extraObject, closeModal }) {
  const dispatch = useDispatch();
  const [livreur, setLivreur] = useState(
    extraObject?.[extraObject?.group === 1 ? 'group1' : 'group2']?.id || ''
  );

  const livreursPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      // Fetch options only if input length is 3 or more characters
      if (inputValue?.length >= 3) {
        dispatch(getLivreursBySearch({ searchPattern: inputValue })).then((res) => {
          resolve(
            res?.payload.livreurs
              ?.filter(
                (livreur) =>
                  livreur?.first_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.last_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.client?.phone_number?.toLowerCase()?.includes(inputValue.toLowerCase())
              )
              ?.map((livreur) => ({
                value: livreur.id,
                label: `${livreur.first_name} ${livreur.last_name} (${livreur?.client?.phone_number})`
              }))
          );
        });
      } else {
        resolve([]);
      }
    });

  return (
    <div>
      <div className={livreur ? 'mb-5' : 'mb-[8rem]'}>
        <InputAsyncSelect
          type="text"
          updateType="livreur"
          containerStyle="mt-3"
          labelTitle="Choose a Livreur"
          updateFormValue={({ _, value }) => setLivreur(value)}
          loadOptions={livreursPromiseOptions}
        />
      </div>
      <button
        className="btn btn-sm w-full btn-secondary btn-outline my-4"
        onClick={async () => {
          await dispatch(
            changeZoneLivreurProvider({
              zoneName: extraObject?.zone,
              livreurId: livreur,
              group: extraObject?.group
            })
          ).then(async (response) => {
            if (response?.error) {
              dispatch(
                showNotification({
                  message: 'Error while update the livreur',
                  status: 0
                })
              );
            } else {
              dispatch(
                showNotification({
                  message: 'Succefully updated the sms provider',
                  status: 1
                })
              );
              closeModal();
            }
          });
        }}>
        Change
      </button>
    </div>
  );
}

export default ChangeZoneLivreur;
