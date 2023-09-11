import axios from 'axios';
import { useFormik } from 'formik';
import Cookies from 'js-cookie';
import React, { lazy, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ErrorText from '../../components/Typography/ErrorText';
import loginSchema from '../../schemas/Login.schema';

const InputText = lazy(() => import('../../components/Input/InputText'));
const LandingIntro = lazy(() => import('./LandingIntro'));

const INITIAL_LOGIN_OBJ = {
	email: 'paxeldp@gmail.com',
	password: 'Pass@1234',
};
const Login = () => {
	const [loading, setLoading] = useState(false);
	const handleOnSubmit = async (values) => {
		const stringifyValues = JSON.stringify(values);
		let response;
		try {
			response = await axios.post('/api/user/authenticate/login', stringifyValues);
			Cookies.set('token', response.data.token, { expires: 1 / 24 });
			Cookies.set('nom', response.data.nom, { expires: 1 / 24 });
			Cookies.set('email', response.data.email, { expires: 1 / 24 });
			Cookies.set('telephone', response.data.telephone, { expires: 1 / 24 });
			Cookies.set('userId', response.data.userId, { expires: 1 / 24 });
			Cookies.set('adresse', response.data.adresse, { expires: 1 / 24 });
			window.location.href = '/app/dashboard';
		} catch (e) {
			if (e) {
				console.log('e.statusText: ', e.statusText);
			} else {
				// have to handle correctly the error here
			}
		}
	};

	const formik = useFormik({
		initialValues: INITIAL_LOGIN_OBJ,
		validationSchema: loginSchema,
		onSubmit: handleOnSubmit,
	});

	const updateFormValue = useCallback(
		({ key, value }) => {
			return formik.setValues({
				...formik.values,
				[key]: value,
			});
		},
		[formik]
	);

	// useEffect(() => {}, [formik]);

	return (
		<div className='min-h-screen bg-base-200 flex items-center'>
			<div className='card mx-auto w-full max-w-5xl  shadow-xl'>
				<div className='grid md:grid-cols-2 grid-cols-1  bg-base-100 rounded-xl'>
					<div className=''>
						<LandingIntro />
					</div>
					<div className='py-24 px-10'>
						<h2 className='text-2xl font-semibold mb-2 text-center'>Login Screen</h2>
						<form onSubmit={formik.handleSubmit}>
							<div className='mb-4'>
								<InputText
									type='email'
									defaultValue={formik.values.email}
									updateType='email'
									containerStyle='mt-4'
									labelTitle='Email'
									updateFormValue={updateFormValue}
								/>

								<InputText
									defaultValue={formik.values.password}
									type='password'
									updateType='password'
									containerStyle='mt-4'
									labelTitle='Password'
									updateFormValue={updateFormValue}
								/>
							</div>

							<div className='text-right text-primary'>
								<Link to='/forgot-password'>
									<span className='text-sm  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200'>Forgot Password?</span>
								</Link>
							</div>

							<ErrorText styleClasses='mt-8 font-bold'>{formik.errors.email || formik.errors.password}</ErrorText>
							<button
								type='submit'
								className={'btn mt-2 w-full btn-primary' + (loading ? ' loading' : '')}
								disabled={!formik.isValid}
								// disabled={!formik.isValid || !formik.dirty}
							>
								Login
							</button>

							<div className='text-center mt-4'>
								Don't have an account yet?{' '}
								<Link to='/'>
									<span className='inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200'>Register</span>
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
export default Login;
