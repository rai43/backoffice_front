import React, { useCallback, useEffect, useState } from 'react';
import InputText from '../../../components/Input/InputText';
import { useDispatch } from 'react-redux';
import { editMerchantsAccompagnement, saveMerchantsAccompagnement, saveMerchantsArticle } from '../merchantsSettingsSlice';
import { showNotification } from '../../common/headerSlice';
import ImageUpload from '../../../components/Input/ImageUpload';

const ArticleAddOrEdit = ({ extraObject, closeRightDrawer }) => {
	const dispatch = useDispatch();
	const { accompagnements } = extraObject;
	const [title, setTitle] = useState(extraObject?.inEditMode ? extraObject?.article?.title : '');
	const [description, setDescription] = useState(extraObject?.inEditMode ? extraObject?.article?.description : '');
	const [price, setPrice] = useState(extraObject?.inEditMode ? extraObject?.article?.price : '');
	const [image, setImage] = useState(extraObject?.inEditMode ? extraObject?.article?.media[0]?.url : '');
	const [accs, setAccs] = useState({});
	const [supps, setSupps] = useState({});

	const updateForm = useCallback(({ key, value }) => {
		if (key === 'title') return setTitle(value);
		if (key === 'description') return setDescription(value);
		if (key === 'price') return setPrice(value);
		if (key === 'image') return setImage(value);
	}, []);

	const onSaveHandler = async () => {
		if (title.length <= 3 || description.length <= 3 || price.length <= 3 || image.length <= 3 || !extraObject.merchant_id) return;
		// await dispatch(extraObject?.inEditMode ? editMerchantsAccompagnement({ name, id: extraObject?.id }) : saveMerchantsAccompagnement({ name, merchant_id: extraObject?.merchant_id })).then(
		await dispatch(saveMerchantsArticle({ merchant_id: extraObject?.merchant_id, title, description, price, image, accs, supps })).then(async (response) => {
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
				closeRightDrawer();
			}
		});
	};

	useEffect(() => console.log(extraObject), [extraObject]);
	useEffect(() => console.log(accs), [accs]);
	useEffect(() => console.log(supps), [supps]);

	return (
		<div>
			<h3 className='text-lg font-semibold mt-2'>{extraObject?.inEditMode ? 'EDIT A NEW ARTICLE' : 'ADD A NEW ARTICLE'}</h3>
			<div className='divider'></div>
			<div className='grid md:grid-cols-2 gap-3'>
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
					containerStyle='md:col-span-2 colmt-3'
					labelTitle='Description'
					updateFormValue={updateForm}
					disabled={extraObject?.inEditMode}
					// inputStyle={`${!formik.isValid && formik.touched.merchant_name && formik.errors.merchant_name ? 'input-error' : ''} `}
				/>

				<div className='md:col-span-2 flex items-center justify-center my-2'>
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

			<h3 className='mt-4'>ACCOMPAGNEMENTS</h3>
			<div className='divider mt-0'></div>
			<div className='grid md:grid-cols-8'>
				{extraObject?.inEditMode &&
					extraObject?.article?.article_accompagnements?.map((acc) => (
						<div
							key={acc?.accompagnement?.id}
							className='form-control md:col-start-2 md:col-span-6'
						>
							<label className='label cursor-pointer'>
								<input
									type='checkbox'
									value={acc?.accompagnement?.name}
									className='checkbox checkbox-primary checkbox-sm'
									disabled
								/>
								<span className='label-text'>{acc?.accompagnement?.name}</span>
							</label>
						</div>
					))}
				{!extraObject?.inEditMode &&
					accompagnements?.map((acc) => (
						<div
							key={acc.id}
							className='form-control md:col-start-2 md:col-span-6'
						>
							<label className='label cursor-pointer'>
								<input
									type='checkbox'
									value={acc.id}
									className='checkbox checkbox-primary checkbox-sm'
									onChange={(e) =>
										setAccs((oldValues) => {
											return {
												...oldValues,
												[e.target.value]: e.target.checked,
											};
										})
									}
								/>
								<span className='label-text'>{acc.name}</span>
							</label>
						</div>
					))}
			</div>
			<h3 className='mt-4'>SUPPLEMENTS</h3>
			<div className='divider mt-0'></div>
			<div className='grid'>
				{extraObject?.inEditMode &&
					extraObject?.article?.article_supplements?.map((supp) => (
						<div
							key={supp.id}
							className='form-control'
						>
							<label className='label cursor-pointer'>
								<input
									type='checkbox'
									value={supp?.accompagnement?.name}
									className='checkbox checkbox-primary checkbox-sm'
									disabled
								/>
								<span className='label-text'>{supp?.accompagnement?.name}</span>
								<input
									type='text'
									className='input input-bordered input-sm'
									placeholder='Price'
									value={supp?.price + ' F'}
									disabled={true}
								/>
							</label>
						</div>
					))}
				{!extraObject?.inEditMode &&
					accompagnements?.map((acc) => (
						<div
							key={acc.id}
							className='form-control grid md:grid-cols-6'
						>
							<label className='label cursor-pointer md:col-start-2 md:col-span-6'>
								<input
									type='checkbox'
									value={acc.id}
									className='checkbox checkbox-primary checkbox-sm'
									onChange={(e) =>
										setSupps((oldValues) => {
											return {
												...oldValues,
												[e.target.value]: { ...supps[e.target.value], status: e.target.checked },
											};
										})
									}
								/>
								<span className='label-text'>{acc.name}</span>
								<input
									type='number'
									className='input input-bordered input-sm'
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
							</label>
						</div>
					))}
			</div>
			{!extraObject?.inEditMode && (
				<div className='grid md:grid-cols-3 mt-3'>
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

export default ArticleAddOrEdit;
