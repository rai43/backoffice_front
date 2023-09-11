import { useState } from 'react';

const InputText = ({ labelTitle, labelStyle, type, containerStyle, defaultValue, placeholder, updateFormValue, updateType, inputStyle, showLabel = true, disabled = false }) => {
	const [value, setValue] = useState(defaultValue);
	const updateInputValue = (val) => {
		setValue(val);
		updateFormValue({ key: updateType, value: val });
	};

	return (
		<div className={`form-control w-full ${containerStyle}`}>
			{showLabel && (
				<label className='label'>
					<span className={'label-text text-base-content ' + labelStyle}>{labelTitle}</span>
				</label>
			)}
			<input
				type={type || 'text'}
				value={value}
				placeholder={placeholder || ''}
				onChange={(e) => updateInputValue(e.target.value)}
				className={`input  input-bordered w-full ${inputStyle}`}
				disabled={disabled}
			/>
		</div>
	);
};

export default InputText;
