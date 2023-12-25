import React, { useCallback, useEffect, useState } from 'react';
import InputText from '../../../components/Input/InputText';
import { useDispatch } from 'react-redux';
import {
  editMerchantsAccompagnement,
  saveMerchantsAccompagnement,
  saveMerchantsArticle,
  updateMerchantsArticle
} from '../merchantsSettingsSlice';
import { showNotification } from '../../common/headerSlice';
import ImageUpload from '../../../components/Input/ImageUpload';

const ArticleAddOrEdit = ({ extraObject, closeRightDrawer }) => {
  const dispatch = useDispatch();
  const { accompagnements } = extraObject;
  console.log('extraObject', extraObject);
  const [title, setTitle] = useState(extraObject?.inEditMode ? extraObject?.article?.title : '');
  const [description, setDescription] = useState(
    extraObject?.inEditMode ? extraObject?.article?.description : ''
  );
  const [price, setPrice] = useState(extraObject?.inEditMode ? extraObject?.article?.price : '');
  const [merchantPrice, setMerchantPrice] = useState(
    extraObject?.inEditMode ? extraObject?.article?.merchant_price : 0
  );
  const [image, setImage] = useState(extraObject?.inEditMode ? extraObject?.article?.image : '');
  const [accs, setAccs] = useState({});
  const [supps, setSupps] = useState({});

  const updateForm = useCallback(({ key, value }) => {
    if (key === 'title') return setTitle(value);
    if (key === 'description') return setDescription(value);
    if (key === 'price') return setPrice(value);
    if (key === 'merchantPrice') return setMerchantPrice(value);
    if (key === 'image') return setImage(value);
  }, []);

  const onSaveHandler = async () => {
    if (title.length <= 1 || !extraObject.merchant_id) {
      dispatch(
        showNotification({
          message: 'Please fill the required fields',
          status: 0
        })
      );
      return;
    }
    if (extraObject?.inEditMode) {
      console.log('in edit mode');
      await dispatch(
        updateMerchantsArticle({
          article_id: extraObject?.article?.id,
          merchant_id: extraObject?.merchant_id,
          title,
          description,
          price: parseInt(price),
          merchantPrice: parseInt(merchantPrice),
          image,
          accs,
          supps
        })
      ).then(async (response) => {
        if (response?.error) {
          dispatch(
            showNotification({
              message: 'Error while updating the article',
              status: 0
            })
          );
        } else {
          dispatch(
            showNotification({
              message: 'Succefully updated the article',
              status: 1
            })
          );
          closeRightDrawer();
        }
      });
    } else {
      console.log('in adding mode');
      // await dispatch(extraObject?.inEditMode ? editMerchantsAccompagnement({ name, id: extraObject?.id }) : saveMerchantsAccompagnement({ name, merchant_id: extraObject?.merchant_id })).then(
      await dispatch(
        saveMerchantsArticle({
          merchant_id: extraObject?.merchant_id,
          title,
          description,
          price,
          merchantPrice,
          image,
          accs,
          supps
        })
      ).then(async (response) => {
        if (response?.error) {
          dispatch(
            showNotification({
              message: 'Error while creating the article',
              status: 0
            })
          );
        } else {
          dispatch(
            showNotification({
              message: 'Succefully created the article',
              status: 1
            })
          );
          closeRightDrawer();
        }
      });
    }
  };

  useEffect(() => {
    extraObject?.article?.article_accompagnements?.map((accompagnement) =>
      setAccs((oldValues) => {
        return {
          ...oldValues,
          [accompagnement?.accompagnement_id]: true
        };
      })
    );
    extraObject?.article?.article_supplements?.map((supplement) =>
      setSupps((oldValues) => {
        return {
          ...oldValues,
          [supplement?.accompagnement_id]: {
            status: true
          }
        };
      })
    );
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mt-2">
        {extraObject?.inEditMode
          ? 'EDITING ARTICLE ID: ' + extraObject?.article?.id
          : 'ADD A NEW ARTICLE'}
      </h3>
      <div className="divider"></div>
      <div className="grid md:grid-cols-2 gap-3">
        <InputText
          type="text"
          defaultValue={title}
          updateType="title"
          placeholder="Title"
          containerStyle="md:col-span-2 mt-3"
          labelTitle="Title"
          updateFormValue={updateForm}
          // disabled={extraObject?.inEditMode}
          // inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
        />
        <InputText
          type="text"
          defaultValue={description}
          updateType="description"
          placeholder="Description"
          containerStyle="md:col-span-2"
          labelTitle="Description"
          updateFormValue={updateForm}
          // disabled={extraObject?.inEditMode}
          // inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
        />
        <InputText
          type="number"
          defaultValue={price}
          updateType="price"
          placeholder="Client Price"
          containerStyle=""
          labelTitle="Client Price"
          updateFormValue={updateForm}
          // disabled={extraObject?.inEditMode}
          // inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
        />
        <InputText
          type="number"
          defaultValue={merchantPrice}
          updateType="merchantPrice"
          placeholder="Merchant Price"
          containerStyle=""
          labelTitle="Merchant Price"
          updateFormValue={updateForm}
          // disabled={extraObject?.inEditMode}
          // inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
        />

        <div className="md:col-span-2 flex items-center justify-center my-2">
          <ImageUpload
            id="image"
            name="image"
            defaultValue={image}
            updateType="image"
            updateFormValue={updateForm}
            errorText="Choisir une image"
            // disabled={extraObject?.inEditMode}
          />
        </div>
      </div>

      <h3 className="mt-4">ACCOMPAGNEMENTS</h3>
      <div className="divider mt-0"></div>
      <div className="grid md:grid-cols-8">
        {extraObject?.inEditMode &&
          accompagnements?.map((acc) => (
            <div key={acc.id + 'acc'} className="md:col-span-8 grid md:grid-cols-8">
              <div
                className="hover:cursor-pointer md:col-start-2 mt-2"
                onChange={(e) =>
                  setAccs((oldValues) => {
                    return {
                      ...oldValues,
                      [e.target.value]: e.target.checked
                    };
                  })
                }
              >
                <input
                  type="checkbox"
                  value={acc.id}
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={accs[acc.id]}
                />
              </div>
              <div className="md:col-span-6 mt-2 uppercase">
                <span className="label-text ">{acc.name}</span>
              </div>
            </div>
          ))}
        {!extraObject?.inEditMode &&
          accompagnements?.map((acc) => (
            <div key={acc.id + 'acc'} className="md:col-span-8 grid md:grid-cols-8">
              <div
                className="hover:cursor-pointer md:col-start-2 mt-2"
                onChange={(e) =>
                  setAccs((oldValues) => {
                    return {
                      ...oldValues,
                      [e.target.value]: e.target.checked
                    };
                  })
                }
              >
                <input
                  type="checkbox"
                  value={acc.id}
                  className="checkbox checkbox-primary checkbox-sm"
                />
              </div>
              <div className="md:col-span-6 mt-2 uppercase">
                <span className="label-text ">{acc.name}</span>
              </div>
            </div>
          ))}
      </div>
      <h3 className="mt-4">SUPPLEMENTS</h3>
      <div className="divider mt-0"></div>
      <div className="grid">
        {extraObject?.inEditMode &&
          // extraObject?.article?.article_supplements?.map((supp) => (
          accompagnements?.map((supp) => (
            <div key={supp?.id} className="grid md:grid-cols-8">
              <input
                type="checkbox"
                value={supp?.id}
                className="checkbox checkbox-primary checkbox-sm md:col-start-2 mt-2"
                onChange={(e) =>
                  setSupps((oldValues) => {
                    return {
                      ...oldValues,
                      [e.target.value]: {
                        ...supps[e.target.value],
                        status: e.target.checked
                      }
                    };
                  })
                }
                checked={supps[supp.id]?.status}
              />
              <span className="label-text md:col-span-2 mt-2 uppercase">{supp?.name}</span>
              <span className="label-text md:col-span-2 mt-2">
                M: {supp?.supplement_merchant_price} F
              </span>
              <span className="label-text md:col-span-2 mt-2">
                C: {supp?.supplement_client_price} F
              </span>
            </div>
          ))}
        {!extraObject?.inEditMode &&
          accompagnements?.map((supp) => (
            <div key={supp?.id + 'supp'} className="grid md:grid-cols-8">
              <input
                type="checkbox"
                value={supp?.id}
                className="checkbox checkbox-primary checkbox-sm md:col-start-2 mt-2"
                onChange={(e) =>
                  setSupps((oldValues) => {
                    return {
                      ...oldValues,
                      [e.target.value]: {
                        ...supps[e.target.value],
                        status: e.target.checked
                      }
                    };
                  })
                }
              />
              <span className="label-text md:col-span-2 mt-2 uppercase">{supp?.name}</span>
              <span className="label-text md:col-span-2 mt-2">
                M: {supp?.supplement_merchant_price} F
              </span>
              <span className="label-text md:col-span-2 mt-2">
                C: {supp?.supplement_client_price} F
              </span>
            </div>
          ))}
      </div>
      {/* {!extraObject?.inEditMode && ( */}
      <div className="grid md:grid-cols-3 mt-3">
        <button
          className="btn btn-outline btn-primary w-full md:col-start-2"
          onClick={onSaveHandler}
        >
          {extraObject?.inEditMode ? 'UPDATE' : 'SAVE'}
        </button>
      </div>
      {/* )} */}
    </div>
  );
};

export default ArticleAddOrEdit;
