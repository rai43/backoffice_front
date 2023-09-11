import axios from 'axios';
import { useFormik } from 'formik';
import Cookies from 'js-cookie';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';
import InputPhoneNumber from '../../../components/Input/InputPhoneNumber';
import InputText from '../../../components/Input/InputText';
import ErrorText from '../../../components/Typography/ErrorText';
import userSchema, { schemaNoPassword } from '../../../schemas/UserFilter.schema';
import { MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';
import { closeModal, openModal } from '../../common/modalSlice';
import { getUserTypesContent } from '../../userType/userTypeSlice';
import { saveUserToServer, updateUserToServer } from '../userSlice';

const INITIAL_USER_OBJ = {
	nom: '',
	prenom: '',
	telephone: '',
	email: '',
	adresse: '',
	password: '',
	userType: '',
};
const AddOrModifyUserModalBody = ({ extraObject }) => {
	const SELECTED_USER_ID = extraObject?.id;
	// delete extraObject.id;
	const [repeatPassword, setRepeatPassword] = useState('');
	const handleOnSubmit = async (values) => {
		const stringifyValues = JSON.stringify(values);

		const response = await dispatch(
			extraObject
				? updateUserToServer({
						userId: SELECTED_USER_ID || 0,
						updatedUserStringifyObj: values,
				  })
				: saveUserToServer(stringifyValues)
		);

		if (response?.error) {
			dispatch(
				showNotification({
					message: extraObject ? 'Error while updating the user information' : 'Error while saving the user',
					status: 0,
					// message: response.error.message || "Error while saving the user",
				})
			);
		} else {
			dispatch(
				showNotification({
					message: extraObject ? 'User successfully updated' : 'User successfully saved',
					status: 1,
					// message: response.message || "User successfully saved",
				})
			);
			dispatch(closeModal());
		}
	};

	const formik = useFormik({
		initialValues: INITIAL_USER_OBJ,
		validationSchema: extraObject ? schemaNoPassword : userSchema,
		onSubmit: handleOnSubmit,
	});

	const updateFormValue = useCallback(
		({ key, value }) => {
			if (key === 'repeatPassword') {
				setRepeatPassword(value);
			} else {
				return formik.setValues((oldValues) => {
					return { ...oldValues, [key]: value };
				});
			}
		},
		[formik]
	);

	useEffect(() => {
		if (extraObject)
			formik.setValues({
				...extraObject,
				userType: extraObject.userType.id,
			});
	}, []);

	const dispatch = useDispatch();

	const productsPromiseOptions = (inputValue) =>
		new Promise((resolve) => {
			dispatch(getUserTypesContent({ active: true, inactive: true })).then((res) =>
				resolve(
					(res?.payload?.types || [])
						.filter((elt) => elt.libelle.toLowerCase().includes(inputValue.toLowerCase()))
						.map((i) => {
							return {
								value: i.id,
								label: i.libelle,
							};
						})
				)
			);
		});

	return (
		<>
			{/*  <form onSubmit={formik.handleSubmit}>*/}
			<form onSubmit={formik.handleSubmit}>
				<div className='grid grid-cols-1 md:grid-cols-6 gap-3'>
					<InputText
						type='text'
						defaultValue={extraObject?.prenom || formik.values.prenom}
						updateType='prenom'
						containerStyle='mt-2 col-span-6 md:col-span-4'
						labelTitle='First name'
						updateFormValue={updateFormValue}
						inputStyle={`${!formik.isValid && formik.touched.prenom && formik.errors.prenom ? 'input-error' : ''} `}
					/>
					<InputText
						type='text'
						defaultValue={extraObject?.nom || formik.values.nom}
						updateType='nom'
						containerStyle='mt-2 col-span-6 md:col-span-2'
						labelTitle='Last name'
						updateFormValue={updateFormValue}
						inputStyle={`${!formik.isValid && formik.touched.nom && formik.errors.nom ? 'input-error' : ''} `}
					/>
					<InputText
						type='text'
						defaultValue={extraObject?.adresse || formik.values.adresse}
						updateType='adresse'
						containerStyle='mt-2 col-span-6 md:col-span-4'
						labelTitle='Address'
						updateFormValue={updateFormValue}
						inputStyle={`${!formik.isValid && formik.touched.adresse && formik.errors.adresse ? 'input-error' : ''} `}
					/>
					<InputAsyncSelect
						type='text'
						updateType='userType'
						containerStyle='mt-2 col-span-6 md:col-span-2'
						labelTitle="Type d'utilisateur"
						updateFormValue={updateFormValue}
						inputStyle={`${!formik.isValid && formik.touched.prenom && formik.errors.prenom ? 'input-error' : ''} `}
						loadOptions={productsPromiseOptions}
						extraObject={extraObject}
					/>
					<InputPhoneNumber
						defaultCountry={'CI'}
						defaultValue={extraObject ? (extraObject?.telephone.startsWith('+') ? '' : '+') + extraObject?.telephone : formik.values.telephone}
						updateType='telephone'
						containerStyle='mt-2 col-span-6 md:col-span-3'
						labelTitle='Phone number'
						updateFormValue={updateFormValue}
						inputStyle={`${!formik.isValid && formik.touched.telephone && formik.errors.telephone ? 'input-error' : ''} `}
					/>
					<InputText
						type='email'
						defaultValue={extraObject?.email || formik.values.email}
						updateType='email'
						containerStyle='mt-2 col-span-6 md:col-span-3'
						labelTitle='Email'
						updateFormValue={updateFormValue}
						inputStyle={`${!formik.isValid && formik.touched.email && formik.errors.email ? 'input-error' : ''} `}
					/>
					{!extraObject ? (
						<InputText
							type='password'
							defaultValue={formik.values.password}
							updateType='password'
							containerStyle='mt-2 col-span-6 md:col-span-3'
							labelTitle='Password'
							updateFormValue={updateFormValue}
							inputStyle={`${!formik.isValid && formik.touched.password && formik.errors.password ? 'input-error' : ''} `}
						/>
					) : null}
					{!extraObject ? (
						<InputText
							type='password'
							defaultValue={repeatPassword}
							updateType='repeatPassword'
							containerStyle='mt-2 col-span-6 md:col-span-3'
							labelTitle='Confirm password'
							updateFormValue={updateFormValue}
							inputStyle={`${!formik.isValid && formik.values.password !== repeatPassword ? 'input-error' : ''} `}
						/>
					) : null}
					<div className='md:col-start-3 md:col-span-2 col-span-6 mt-3'>
						<button className={`btn btn-primary btn-outline w-full`}>{extraObject ? 'Update' : 'Save'}</button>
					</div>
				</div>
			</form>
		</>
	);
};

export default AddOrModifyUserModalBody;
