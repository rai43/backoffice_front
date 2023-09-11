import { useEffect, useRef, useState } from 'react';

import GifIcon from '@heroicons/react/24/outline/GifIcon';

const ImageUpload = (props) => {
	const [file, setFile] = useState(props.defaultValue?.length ? '' : props.defaultValue);
	const [previewUrl, setPreviewUrl] = useState(
		props.defaultValue && props.defaultValue?.length ? (props.defaultValue?.startsWith('http') ? props.defaultValue : `${process.env.REACT_APP_BASE_URL_DEV}/${props.defaultValue}`) : ''
	);
	const [isValid, setIsValid] = useState(false);

	let filePickerRef = useRef();

	useEffect(() => {
		if (!file) {
			return;
		}
		const fileReader = new FileReader();
		fileReader.onload = () => {
			setPreviewUrl(fileReader.result);
		};
		fileReader.readAsDataURL(file);
	}, [file]);

	const pickedHandler = (event) => {
		let pickedFile;
		let fileIsValid = isValid;

		if (event.target.files && event.target.files.length === 1) {
			pickedFile = event.target.files[0];
			setFile(pickedFile);
			setIsValid(true);
			fileIsValid = true;
		} else {
			setIsValid(false);
			fileIsValid = false;
		}

		console.log(pickedFile);
		props.updateFormValue({ key: props.updateType, value: pickedFile });
		// props.onInput(props.id, pickedFile, fileIsValid);
	};

	const pickImageHandler = () => {
		filePickerRef.current.click();
	};

	return (
		<>
			<div className='form-control mt-3'>
				<input
					id={props.id}
					ref={filePickerRef}
					style={{ display: 'none' }}
					type='file'
					accept='.jpg,.png,.jpeg'
					onChange={pickedHandler}
					name={props.name}
				/>
				<div className={`flex justify-center items-center flex-col image-upload ${props.center && 'center'}`}>
					<div className='w-32 h-32 flex justify-center items-center text-center mb-4 border-b-2 border-t-2 border-base-300 rounded-md'>
						{previewUrl ? (
							<img
								className='w-full h-full object-cover'
								style={{ maxWidth: '13rem', maxHeight: '13rem', objectFit: 'fill', overflow: 'hidden' }}
								src={previewUrl}
								alt='Preview'
							/>
						) : (
							<GifIcon className='h-12 w-12' />
						)}
					</div>
					{!props.disabled && (
						<button
							type='button'
							onClick={pickImageHandler}
							className='btn btn-outline btn-ghost'
						>
							CHOOSE AN IMAGE
						</button>
					)}
				</div>
				{/* {!isValid() && <p>{props.errorText}</p>} */}
			</div>
		</>
	);
};

export default ImageUpload;
