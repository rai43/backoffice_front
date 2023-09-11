import React, { useCallback, useEffect, useState } from 'react';
import InputText from '../../../components/Input/InputText';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../common/headerSlice';
import ImageUpload from '../../../components/Input/ImageUpload';
import { getMerchantsBySearch, saveMenu } from '../merchantsMenuSlice';
import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';

const MenuArticleAddOrEdit = ({ extraObject, closeModal }) => {
	const dispatch = useDispatch();
	const { searchedMerchants, isLoading } = useSelector((state) => state.article);
	const [merchant, setMerchant] = useState(extraObject?.inEditMode ? extraObject?.article?.merchantId : '');
	const [title, setTitle] = useState(extraObject?.inEditMode ? extraObject?.article?.title : '');
	const [description, setDescription] = useState(extraObject?.inEditMode ? extraObject?.article?.description : '');
	const [price, setPrice] = useState(extraObject?.inEditMode ? extraObject?.article?.price : '');
	const [image, setImage] = useState(extraObject?.inEditMode ? extraObject?.article?.media[0]?.url : '');
	const [accs, setAccs] = useState({});
	const [supps, setSupps] = useState({});

	const updateForm = useCallback(({ key, value }) => {
		if (key === 'merchant') {
			return setMerchant(value);
		}
		if (key === 'title') return setTitle(value);
		if (key === 'description') return setDescription(value);
		if (key === 'price') return setPrice(value);
		if (key === 'image') return setImage(value);
	}, []);

	const onSaveHandler = async () => {
		console.log(title, description, price, image, accs, supps, merchant);
		if (title.length <= 3 || description.length <= 3 || price.length <= 3 || image.length <= 3 || !merchant) return;
		// await dispatch(extraObject?.inEditMode ? editMerchantsAccompagnement({ name, id: extraObject?.id }) : saveMerchantsAccompagnement({ name, merchant_id: extraObject?.merchant_id })).then(
		// await dispatch(saveMerchantsArticle({ merchant_id: extraObject?.merchant_id, title, description, price, image, accs, supps })).then(async (response) => {
		await dispatch(saveMenu({ merchant_id: merchant, title, description, price, image, accs, supps })).then(async (response) => {
			if (response?.error) {
				dispatch(
					showNotification({
						message: 'Error while creating the article',
						status: 0,
					})
				);
			} else {
				dispatch(
					showNotification({
						message: 'Succefully created the article',
						status: 1,
					})
				);
				closeModal();
			}
		});
	};

	const merchantsPromiseOptions = (inputValue) =>
		new Promise((resolve) => {
			if (inputValue?.length >= 3) {
				dispatch(getMerchantsBySearch({ searchPattern: inputValue })).then((res) =>
					resolve(
						(res?.payload || [])
							.filter((merchant) => merchant.name.toLowerCase().includes(inputValue.toLowerCase()) || merchant.whatsapp.toLowerCase().includes(inputValue.toLowerCase()))
							.map((merchant) => {
								return {
									value: merchant.id,
									label: `${merchant.name} (${merchant?.whatsapp})`,
								};
							})
					)
				);
			} else {
				resolve([]);
			}
		});

	useEffect(() => console.log(searchedMerchants), [searchedMerchants]);
	// useEffect(() => console.log(accs), [accs]);
	// useEffect(() => console.log(supps), [supps]);

	return (
		<div>
			<h3 className='text-lg font-semibold mt-2'>{extraObject?.inEditMode ? 'EDIT A NEW ARTICLE' : 'ADD A NEW ARTICLE'}</h3>
			<div className='divider'></div>
			<div className='grid md:grid-cols-3 gap-3'>
				<InputAsyncSelect
					type='text'
					updateType='merchant'
					containerStyle='mt-3'
					labelTitle='Merchant'
					updateFormValue={updateForm}
					loadOptions={merchantsPromiseOptions}
					// defaultValue={
					// 	workDay.id
					// 		? {
					// 				label: workDay.day,
					// 				value: workDay.day,
					// 		  }
					// 		: {
					// 				...week_days_options[0],
					// 		  }
					// }
				/>
				<InputText
					type='text'
					defaultValue={title}
					updateType='title'
					placeholder='Title'
					containerStyle='mt-3'
					labelTitle='Title'
					updateFormValue={updateForm}
					disabled={extraObject?.inEditMode}
					// inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
				/>
				<InputText
					type='number'
					defaultValue={price}
					updateType='price'
					placeholder='Price'
					containerStyle='mt-3'
					labelTitle='Price'
					updateFormValue={updateForm}
					disabled={extraObject?.inEditMode}
					// inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
				/>
				<InputText
					type='text'
					defaultValue={description}
					updateType='description'
					placeholder='Description'
					containerStyle='md:col-span-3 colmt-3'
					labelTitle='Description'
					updateFormValue={updateForm}
					disabled={extraObject?.inEditMode}
					// inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
				/>

				<div className='md:col-span-3 flex items-center justify-center my-2'>
					<ImageUpload
						id='image'
						name='image'
						defaultValue={image}
						updateType='image'
						updateFormValue={updateForm}
						errorText='Choisir une image'
						disabled={extraObject?.inEditMode}
					/>
				</div>
			</div>

			{!isLoading && searchedMerchants?.find((merch) => merch.id === merchant)?.id && (
				<>
					<h3 className='mt-4'>ACCOMPAGNEMENTS</h3>
					<div className='divider mt-0'></div>
					{searchedMerchants
						?.find((merch) => merch.id === merchant)
						?.accompagnements?.filter((acc) => acc.is_deleted === false)
						?.map((acc) => (
							<div
								key={acc?.id}
								className='grid md:grid-cols-8'
							>
								<div
									className='hover:cursor-pointer md:col-start-2 mt-2'
									onChange={(e) =>
										setAccs((oldValues) => {
											return {
												...oldValues,
												[e.target.value]: e.target.checked,
											};
										})
									}
								>
									<input
										type='checkbox'
										value={acc.id}
										className='checkbox checkbox-primary checkbox-sm '
									/>
								</div>
								<div className='md:col-span-6 mt-2'>
									<span className='label-text '>{acc.name}</span>
								</div>
							</div>
						))}

					<h3 className='mt-4'>SUPPLEMENTS</h3>
					<div className='divider mt-0'></div>
					<div className='grid'>
						{searchedMerchants
							?.find((merch) => merch.id === merchant)
							?.accompagnements?.filter((acc) => acc.is_deleted === false)
							?.map((acc) => (
								<div
									key={acc?.id}
									className='grid md:grid-cols-8'
								>
									{/* <label className='label cursor-pointer md:col-start-2 md:col-span-6'> */}
									<input
										type='checkbox'
										value={acc.id}
										className='checkbox checkbox-primary checkbox-sm md:col-start-2 mt-2'
										onChange={(e) =>
											setSupps((oldValues) => {
												return {
													...oldValues,
													[e.target.value]: { ...supps[e.target.value], status: e.target.checked },
												};
											})
										}
									/>
									<span className='label-text md:col-span-3 mt-2'>{acc.name}</span>
									<input
										type='number'
										className='input input-bordered input-sm md:col-span-2 mt-2'
										placeholder='Price'
										value={supps[acc.id]?.price || 0}
										disabled={!supps[acc.id]?.status}
										onChange={(e) =>
											setSupps((oldValues) => {
												return {
													...oldValues,
													[acc.id]: { ...supps[acc.id], price: e.target.value },
												};
											})
										}
									/>
									{/* </label> */}
								</div>
							))}
					</div>
				</>
			)}
			<div className='divider'></div>
			{!extraObject?.inEditMode && (
				<div className='grid md:grid-cols-3 mt-5'>
					<button
						className='btn btn-outline btn-primary w-full md:col-start-2'
						onClick={onSaveHandler}
					>
						{extraObject?.inEditMode ? 'UPDATE' : 'SAVE'}
					</button>
				</div>
			)}
		</div>
	);
};

export default MenuArticleAddOrEdit;
