import React from 'react';
import InputPhoneNumber from '../../../../components/Input/InputPhoneNumber';
import InputText from '../../../../components/Input/InputText';
import ImageUpload from '../../../../components/Input/ImageUpload';

const AddOrModifyMerchantAccount = ({ formik, updateFormValue, clickAction, firstLoad, preventGoBack, clientToMarchant }) => {
	console.log(formik.values);
	return (
		<>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
				<InputPhoneNumber
					defaultCountry={'CI'}
					defaultValue={formik.values.phone_number}
					updateType='phone_number'
					containerStyle='mt-3'
					labelTitle='Phone number'
					updateFormValue={updateFormValue}
					inputStyle={`${!formik.isValid && formik.touched.phone_number && formik.errors.phone_number ? 'input-error' : ''} `}
				/>
				<InputText
					type='text'
					defaultValue={formik.values.merchant_name}
					updateType='merchant_name'
					placeholder='Merchant Name'
					containerStyle='mt-3'
					labelTitle='Merchant Name'
					updateFormValue={updateFormValue}
					inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
				/>
				<InputText
					type='number'
					defaultValue={formik.values.latitude}
					updateType='latitude'
					placeholder='Latitude'
					containerStyle='mt-1'
					labelTitle='Latitude'
					updateFormValue={updateFormValue}
					inputStyle={`${!formik.isValid && formik.touched.latitude && formik.errors.latitude ? 'input-error' : ''} `}
				/>
				<InputText
					type='number'
					defaultValue={formik.values.longitude}
					updateType='longitude'
					placeholder='Longitude'
					containerStyle='mt-1'
					labelTitle='Longitude'
					updateFormValue={updateFormValue}
					inputStyle={`${!formik.isValid && formik.touched.longitude && formik.errors.longitude ? 'input-error' : ''} `}
				/>
				<div className='md:col-span-2'>
					<div className='flex items-center justify-center'>
						<ImageUpload
							id='image'
							name='picture'
							defaultValue={formik.values.profile_picture}
							updateType='profile_picture'
							updateFormValue={updateFormValue}
							disabled={false}
							errorText='Choisir une image'
						/>
					</div>
				</div>
			</div>
			<div className='flex flex-row-reverse mt-6 mb-2 mx-4 gap-3'>
				<button
					className='btn btn-outline btn-primary btn-sm'
					onClick={() =>
						clickAction((old) => {
							console.log(formik.values);
							console.log('preventGoBack', preventGoBack);
							if ((!clientToMarchant && preventGoBack) || (!firstLoad && formik.isValid && formik.values.profile_picture !== '' && formik.values.profile_picture !== undefined)) {
								return old + 1;
							} else {
								return old;
							}
						})
					}
				>
					Next
				</button>
				<button
					className=' btn btn-outline btn-ghost btn-sm'
					disabled={preventGoBack}
					onClick={() => {
						if (preventGoBack) {
							return clickAction((old) => old);
						}
						return clickAction((old) => old - 1);
					}}
				>
					Back
				</button>
			</div>
		</>
	);
};

export default AddOrModifyMerchantAccount;
