import React, { useCallback, useState } from 'react';
import InputText from '../../../components/Input/InputText';
import { useDispatch } from 'react-redux';
import {
  editMerchantsAccompagnement,
  saveMerchantsAccompagnement
} from '../merchantsSettingsSlice';
import { showNotification } from '../../common/headerSlice';

const AccompagnementAddOrEdit = ({ extraObject, closeRightDrawer }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState(extraObject?.inEditMode ? extraObject?.name : '');
  const [supplementClientPrice, setSupplementClientPrice] = useState(
    extraObject?.inEditMode ? extraObject?.supplement_client_price : 0
  );
  const [supplementMerchantPrice, setSupplementMerchantPrice] = useState(
    extraObject?.inEditMode ? extraObject?.supplement_merchant_price : 0
  );

  const updateForm = useCallback(({ key, value }) => {
    if (key === 'name') {
      return setName(value);
    } else if (key === 'supplement_client_price') {
      return setSupplementClientPrice(value);
    } else if (key === 'supplement_merchant_price') {
      return setSupplementMerchantPrice(value);
    }
  }, []);

  const onSaveHandler = async () => {
    if (name.length < 1 || !extraObject.merchant_id) return;

    await dispatch(
      extraObject?.inEditMode
        ? editMerchantsAccompagnement({
            name,
            supplementClientPrice,
            supplementMerchantPrice,
            id: extraObject?.id
          })
        : saveMerchantsAccompagnement({
            name,
            supplementClientPrice,
            supplementMerchantPrice,
            merchant_id: extraObject?.merchant_id
          })
    ).then(async (response) => {
      console.log(response);
      if (response?.error) {
        console.log(response.error);
        dispatch(
          showNotification({
            message: 'Error while creating the new accompagnement',
            status: 0
          })
        );
      } else {
        dispatch(
          showNotification({
            message: 'Succefully created the new accompagnement',
            status: 1
          })
        );
        closeRightDrawer();
      }
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mt-2">
        {extraObject?.inEditMode ? 'EDIT A NEW ACCOMPAGNEMENT' : 'ADD A NEW ACCOMPAGNEMENT'}
      </h3>
      <InputText
        type="text"
        defaultValue={name}
        updateType="name"
        placeholder="Accompagnement Name"
        containerStyle="mt-3"
        labelTitle="Accompagnement"
        updateFormValue={updateForm}
        // inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
      />
      <InputText
        type="number"
        defaultValue={supplementClientPrice}
        updateType="supplement_client_price"
        placeholder="Client Price"
        containerStyle=""
        labelTitle="Client Price"
        updateFormValue={updateForm}
        // inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
      />
      <InputText
        type="number"
        defaultValue={supplementMerchantPrice}
        updateType="supplement_merchant_price"
        placeholder="Merchant Price"
        containerStyle=""
        labelTitle="Merchant Price"
        updateFormValue={updateForm}
        // inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
      />
      <div className="grid md:grid-cols-3 mt-5">
        <button
          className="btn btn-outline btn-primary w-full md:col-start-2"
          onClick={onSaveHandler}
        >
          {extraObject?.inEditMode ? 'UPDATE' : 'SAVE'}
        </button>
      </div>
    </div>
  );
};

export default AccompagnementAddOrEdit;
