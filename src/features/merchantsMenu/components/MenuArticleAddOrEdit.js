import React, { useCallback, useEffect, useState } from 'react';
import InputText from '../../../components/Input/InputText';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../common/headerSlice';
import ImageUpload from '../../../components/Input/ImageUpload';
import { getMerchantsBySearch, saveMenu, updateMenu } from '../merchantsMenuSlice';
import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';

const MenuArticleAddOrEdit = ({ extraObject, closeModal, closeRightDrawer }) => {
	console.log(extraObject);
	const dispatch = useDispatch();
	const { searchedMerchants, isLoading } = useSelector((state) => state.article);
	const [merchant, setMerchant] = useState(extraObject?.inEditMode || extraObject?.edit ? extraObject?.article?.merchantId : '');
	const [title, setTitle] = useState(extraObject?.inEditMode || extraObject?.edit ? extraObject?.article?.title : '');
	const [description, setDescription] = useState(extraObject?.inEditMode || extraObject?.edit ? extraObject?.article?.description : '');
	const [price, setPrice] = useState(extraObject?.inEditMode || extraObject?.edit ? extraObject?.article?.price : '');
	const [image, setImage] = useState(extraObject?.inEditMode || extraObject?.edit ? extraObject?.article?.image : '');
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

	useEffect(() => {
		extraObject?.article?.article_accompagnements?.map((accompagnement) =>
			setAccs((oldValues) => {
				return {
					...oldValues,
					[accompagnement?.accompagnement_id]: true,
				};
			})
		);
		extraObject?.article?.article_supplements?.map((supplement) =>
			setSupps((oldValues) => {
				return {
					...oldValues,
					[supplement?.accompagnement_id]: { price: supplement?.price, status: true },
				};
			})
		);
	}, []);

	useEffect(() => console.log(searchedMerchants), [searchedMerchants]);

	return (
		<div>
			<h3 className='text-lg font-semibold mt-2'>{extraObject?.inEditMode || extraObject?.edit ? 'EDIT A NEW ARTICLE' : 'ADD A NEW ARTICLE'}</h3>
			<div className='divider'></div>
			<div className='grid md:grid-cols-2 gap-3'>
				{extraObject?.edit ? (
					<InputText
						type='text'
						defaultValue={`${extraObject?.article?.merchant?.name} (${extraObject?.article?.merchant?.whatsapp})`}
						updateType='merchant_name'
						placeholder='Merchant Name'
						containerStyle='mt-3'
						labelTitle='Merchant Name'
						disabled
					/>
				) : (
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
				)}

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
					defaultValue={title}
					updateType='title'
					placeholder='Title'
					containerStyle='md:col-span-2'
					labelTitle='Title'
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

			{!extraObject?.edit && !isLoading && searchedMerchants?.find((merch) => merch.id === merchant)?.id ? (
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
										value={supps[acc.id]?.price}
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
			) : (
				<></>
			)}
			{extraObject?.edit && extraObject?.article?.merchant?.accompagnements?.length ? (
				<>
					<h3 className='mt-4'>ACCOMPAGNEMENTS</h3>
					<div className='divider mt-0'></div>
					{extraObject?.article?.merchant?.accompagnements
						?.filter((acc) => acc.is_deleted === false)
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
										checked={accs[acc.id]}
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
						{extraObject?.article?.merchant?.accompagnements
							?.filter((acc) => acc.is_deleted === false)
							?.map((supp) => (
								<div
									key={supp?.id}
									className='grid md:grid-cols-8'
								>
									{/* <label className='label cursor-pointer md:col-start-2 md:col-span-6'> */}
									<input
										type='checkbox'
										value={supp.id}
										className='checkbox checkbox-primary checkbox-sm md:col-start-2 mt-2'
										onChange={(e) =>
											setSupps((oldValues) => {
												return {
													...oldValues,
													[e.target.value]: { ...supps[e.target.value], status: e.target.checked },
												};
											})
										}
										checked={supps[supp.id]?.status}
									/>
									<span className='label-text md:col-span-3 mt-2'>{supp.name}</span>
									<input
										type='number'
										className='input input-bordered input-sm md:col-span-2 mt-2'
										placeholder='Price'
										value={supps[supp.id]?.price}
										disabled={!supps[supp.id]?.status}
										onChange={(e) =>
											setSupps((oldValues) => {
												return {
													...oldValues,
													[supp.id]: { ...supps[supp.id], price: e.target.value },
												};
											})
										}
									/>
									{/* </label> */}
								</div>
							))}
					</div>
				</>
			) : (
				<></>
			)}

			{extraObject?.edit && searchedMerchants?.find((merch) => merch.id === merchant)?.id ? (
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
										value={supps[acc.id]?.price}
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
			) : (
				<></>
			)}
			{/* <div className='divider'>Action</div> */}
			{!extraObject?.inEditMode && (
				<div className='grid md:grid-cols-3 mt-5'>
					{extraObject?.edit ? (
						<button
							className='btn btn-outline btn-secondary btn-sm w-full md:col-start-2'
							onClick={async () => {
								await dispatch(
									updateMenu({
										article_id: extraObject?.article?.id,
										merchant_id: extraObject?.article?.merchant_id,
										title,
										description,
										price: parseInt(price),
										image,
										accs,
										supps,
									})
								).then(async (response) => {
									if (response?.error) {
										dispatch(
											showNotification({
												message: 'Error while updating the article',
												status: 0,
											})
										);
									} else {
										dispatch(
											showNotification({
												message: 'Succefully updated the article',
												status: 1,
											})
										);
										closeRightDrawer();
									}
								});
							}}
						>
							Update
						</button>
					) : (
						<button
							className='btn btn-outline btn-primary w-full md:col-start-2'
							onClick={onSaveHandler}
						>
							{extraObject?.inEditMode ? 'UPDATE' : 'SAVE'}
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default MenuArticleAddOrEdit;
