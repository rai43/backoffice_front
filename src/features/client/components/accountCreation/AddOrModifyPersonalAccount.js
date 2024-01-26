import React from 'react';

import InputPhoneNumber from '../../../../components/Input/InputPhoneNumber';

const AddOrModifyPersonalAccount = ({
  formik,
  updateFormValue,
  clickAction,
  firstLoad,
  preventGoBack
}) => {
  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <InputPhoneNumber
            defaultCountry={'CI'}
            defaultValue={formik.values.phone_number}
            updateType="phone_number"
            containerStyle="mt-3 md:col-start-2"
            labelTitle="Phone number"
            updateFormValue={updateFormValue}
            inputStyle={`${
              !formik.isValid && formik.touched.phone_number && formik.errors.phone_number
                ? 'input-error'
                : ''
            } `}
          />
        </div>
        <div className="flex flex-row-reverse mt-6 mb-2 mx-4 gap-3">
          <button
            className="btn btn-outline btn-primary btn-sm"
            onClick={() =>
              clickAction((old) => {
                if (preventGoBack || (!firstLoad && formik.isValid)) {
                  return old + 1;
                } else {
                  return old;
                }
              })
            }>
            Next
          </button>
          <button
            className=" btn btn-outline btn-ghost btn-sm"
            disabled={preventGoBack}
            onClick={() => {
              if (preventGoBack) {
                return clickAction((old) => old);
              }
              return clickAction((old) => old - 1);
            }}>
            Back
          </button>
        </div>
      </form>
    </>
  );
};

export default AddOrModifyPersonalAccount;
