import { useState } from 'react';

const InputCheckbox = ({
  labelTitle,
  labelStyle,
  type,
  containerStyle,
  defaultValue,
  updateFormValue,
  updateType,
  inputStyle
}) => {
  const [value, setValue] = useState(defaultValue);
  const updateInputValue = () => {
    const newVal = !value;
    setValue(newVal);
    updateFormValue({ key: updateType, value: newVal });
  };

  return (
    <>
      <div className={`form-control w-full ${containerStyle}`}>
        <div className="form-control">
          <label className="label cursor-pointer">
            <input
              type={type || 'checkbox'}
              checked={value}
              onChange={updateInputValue}
              className={`checkbox checkbox-primary ${inputStyle}`}
            />
            <span className={'label-text' + labelStyle}>{labelTitle}</span>
          </label>
        </div>
      </div>
    </>
  );
};

export default InputCheckbox;
