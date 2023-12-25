import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';
import { showNotification } from '../../common/headerSlice';
import { setOrderStatus } from '../orderSlice';

const AssignLivreur = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const [livreur, setLivreur] = useState('');

  const updateForm = useCallback(({ key, value }) => {
    if (key === 'livreur') {
      return setLivreur(value);
    }
  }, []);
  console.log(extraObject);

  const livreursPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      if (inputValue?.length >= 3) {
        dispatch(getLivreursBySearch({ searchPattern: inputValue })).then((res) =>
          resolve(
            (res?.payload.livreurs || [])
              .filter(
                (livreur) =>
                  livreur?.first_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.last_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.whatsapp?.toLowerCase()?.includes(inputValue.toLowerCase())
              )
              .map((livreur) => {
                return {
                  value: livreur.id,
                  label: `${livreur.first_name} ${livreur.last_name} (${livreur?.whatsapp})`
                };
              })
          )
        );
      } else {
        resolve([]);
      }
    });
  return (
    <div className="">
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-1">
          <p className="text-warning my-5">
            Please Assign a livreur to this command in order to proceed
          </p>

          <div className="mb-16">
            <InputAsyncSelect
              type="text"
              updateType="livreur"
              containerStyle="mt-3"
              labelTitle="Livreur"
              updateFormValue={updateForm}
              loadOptions={livreursPromiseOptions}
              // defaultValue={
              // 	workDay.id
              // 		? {
              // 				label: workDay.day,
              // 				value: workDay.day,
              // 		  }
              // 		: {
              // 				...week_days_options[0],
              // 		  }
              // }
            />
          </div>

          {livreur && (
            <button
              className="btn btn-outline btn-primary"
              onClick={async () => {
                await dispatch(
                  setOrderStatus({
                    commandId: extraObject?.orderId,
                    livreurId: livreur,
                    isChangeLivreur: extraObject?.isChangeLivreur
                  })
                ).then(async (response) => {
                  if (response?.error) {
                    console.log(response.error);
                    dispatch(
                      showNotification({
                        message: 'Error while changing the order status',
                        status: 0
                      })
                    );
                  } else {
                    dispatch(
                      showNotification({
                        message: 'Succefully changed the order status and assigned livreur',
                        status: 1
                      })
                    );
                    closeModal();
                  }
                });
              }}
            >
              ASSIGN
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignLivreur;
