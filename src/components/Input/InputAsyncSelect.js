import React from 'react';

import AsyncSelect from 'react-select/async';

const customStyles = {
  control: (base) => ({
    ...base,
    height: '3rem'
  }),
  menu: (base) => ({
    ...base,
    marginBottom: '2rem'
  })
};
const InputAsyncSelect = ({
  labelTitle,
  labelStyle,
  containerStyle,
  updateFormValue,
  updateType,
  loadOptions,
  defaultValue,
  inputStyle
}) => {
  const updateInputValue = (val) => {
    updateFormValue({ key: updateType, value: val });
  };

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span className={'label-text text-base-content ' + labelStyle}>{labelTitle}</span>
      </label>
      <AsyncSelect
        maxMenuHeight={90}
        cacheOptions
        defaultOptions
        defaultValue={() => {
          if (defaultValue) {
            return {
              label: defaultValue.label,
              value: defaultValue.value
            };
          }
        }}
        loadOptions={loadOptions}
        styles={customStyles}
        // className={` ${inputStyle}`}
        onChange={({ value }) => updateInputValue(value)}
      />
    </div>
  );
};

export default InputAsyncSelect;
