import 'react-phone-number-input/style.css';
import { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

const InputPhoneNumber = ({
  labelTitle,
  labelStyle,
  containerStyle,
  defaultValue,
  defaultCountry,
  placeholder,
  updateFormValue,
  updateType,
  inputStyle
}) => {
  const [value, setValue] = useState(defaultValue);
  const updateInputValue = (val) => {
    setValue(val);
    updateFormValue({ key: updateType, value: val });
  };

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span className={'label-text text-base-content ' + labelStyle}>{labelTitle}</span>
      </label>

      <PhoneInput
        className={`input  input-bordered w-full ${inputStyle}`}
        placeholder={placeholder}
        value={value}
        defaultCountry={defaultCountry}
        onChange={(number) => updateInputValue(number)}
        flags={flags}
      />
    </div>
  );
};

export default InputPhoneNumber;
