import axios from 'axios';
import capitalize from 'capitalize-the-first-letter';
import React, { useState, useEffect } from 'react';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';

const SelectBox = ({
  labelTitle,
  labelDescription,
  defaultValue,
  containerStyle,
  selectStyle,
  placeholder,
  labelStyle,
  options,
  updateType,
  updateFormValue,
  noSelectBorder,
  selectPlaceholder
}) => {
  const [value, setValue] = useState(defaultValue || false);

  const updateValue = (newValue) => {
    updateFormValue({ key: updateType, value: newValue });
    setValue(newValue);
  };

  return (
    <div className={`inline-block ${containerStyle}`}>
      {labelTitle ? (
        <label className={`label  ${labelStyle}`}>
          <div className="label-text">
            {labelTitle}
            {labelDescription && (
              <div className="tooltip tooltip-right" data-tip={labelDescription}>
                <InformationCircleIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        </label>
      ) : (
        <></>
      )}

      <select
        className={'select w-full ' + (noSelectBorder ? '' : 'select-bordered') + selectStyle}
        value={value}
        onChange={(e) => updateValue(e.target.value)}
      >
        <option disabled value="PLACEHOLDER" selected={selectPlaceholder}>
          {placeholder}
        </option>
        {options.map((o, k) => {
          return (
            <option value={o.value || o.name} key={k}>
              {o.name}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectBox;
