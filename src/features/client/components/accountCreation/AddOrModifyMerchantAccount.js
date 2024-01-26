import React from 'react';

import ImageUpload from '../../../../components/Input/ImageUpload';
import InputPhoneNumber from '../../../../components/Input/InputPhoneNumber';
import InputText from '../../../../components/Input/InputText';

/**
 * Form component for adding or modifying a merchant account.
 *
 * @param {Object} formik - Formik object for form handling.
 * @param {Function} updateFormValue - Function to update form values.
 * @param {Function} clickAction - Function to handle navigation between form steps.
 * @param {boolean} firstLoad - Flag to indicate if it's the first form load.
 * @param {boolean} preventGoBack - Flag to prevent navigation to the previous step.
 * @param {boolean} clientToMarchant - Flag indicating if the client is becoming a merchant.
 * @returns {React.Component} A form component for merchant account data input.
 */
const AddOrModifyMerchantAccount = ({
  formik,
  updateFormValue,
  clickAction,
  firstLoad,
  edit,
  preventGoBack,
  clientToMarchant
}) => {
  const isFormValid = formik.isValid && formik.values.profile_picture;

  // Determine if the 'Next' button should be enabled
  const shouldEnableNext = () => {
    if (clientToMarchant && preventGoBack && formik.values.profile_picture !== null) {
      return true;
    }
    return firstLoad && !edit ? false : isFormValid;
  };

  // Inline function to handle click for 'Back' button
  const handleBackClick = () => {
    return preventGoBack ? clickAction((old) => old) : clickAction((old) => old - 1);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Input fields for phone number, merchant name, latitude, and longitude */}
        <InputPhoneNumber
          defaultCountry={'CI'}
          defaultValue={formik.values.phone_number}
          updateType="phone_number"
          containerStyle="mt-3"
          labelTitle="Phone number"
          updateFormValue={updateFormValue}
          inputStyle={`${
            !formik.isValid && formik.touched.phone_number && formik.errors.phone_number
              ? 'input-error'
              : ''
          } `}
        />
        <InputText
          type="text"
          defaultValue={formik.values.merchant_name}
          updateType="merchant_name"
          placeholder="Merchant Name"
          containerStyle="mt-3"
          labelTitle="Merchant Name"
          updateFormValue={updateFormValue}
          inputStyle={`${
            !formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name
              ? 'input-error'
              : ''
          } `}
        />
        <InputText
          type="number"
          defaultValue={formik.values.latitude}
          updateType="latitude"
          placeholder="Latitude"
          containerStyle="mt-1"
          labelTitle="Latitude"
          updateFormValue={updateFormValue}
          inputStyle={`${
            !formik.isValid && formik.touched.latitude && formik.errors.latitude
              ? 'input-error'
              : ''
          } `}
        />
        <InputText
          type="number"
          defaultValue={formik.values.longitude}
          updateType="longitude"
          placeholder="Longitude"
          containerStyle="mt-1"
          labelTitle="Longitude"
          updateFormValue={updateFormValue}
          inputStyle={`${
            !formik.isValid && formik.touched.longitude && formik.errors.longitude
              ? 'input-error'
              : ''
          } `}
        />

        {/* Image upload section */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-center">
            <ImageUpload
              id="image"
              name="picture"
              defaultValue={formik.values.profile_picture}
              updateType="profile_picture"
              updateFormValue={updateFormValue}
              disabled={false}
              errorText="Choisir une image"
            />
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-row-reverse mt-6 mb-2 mx-4 gap-3">
        <button
          className="btn btn-outline btn-primary btn-sm"
          onClick={() => clickAction(shouldEnableNext() ? (old) => old + 1 : (old) => old)}>
          Next
        </button>
        <button
          className="btn btn-outline btn-ghost btn-sm"
          disabled={preventGoBack}
          onClick={handleBackClick}>
          Back
        </button>
      </div>
    </>
  );
};

export default AddOrModifyMerchantAccount;
