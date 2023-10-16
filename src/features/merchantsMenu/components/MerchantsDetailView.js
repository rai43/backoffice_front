import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { MdPlaylistAdd, MdOutlineDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';

import UserBasicDetail from '../../../components/Common/UserBasicDetail';
import TitleCard from '../../../components/Cards/TitleCard';
import InfoText from '../../../components/Typography/InfoText';
import { openRightDrawer } from '../../common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../../../utils/globalConstantUtil';
import { useDispatch, useSelector } from 'react-redux';
import { saveMenu, switchArticlePublish, switchArticleStatus } from '../merchantsMenuSlice';
import { showNotification } from '../../common/headerSlice';

const MerchantsDetailView = ({ extraObject, closeModal }) => {
	const dispatch = useDispatch();
	const { articles } = useSelector((state) => state.article);

	console.log(extraObject);
	console.log(articles?.find((article) => article?.id === extraObject?.id));
	const [availabilityState, setAvailabilityState] = useState(extraObject?.available);

	return (
		<div className='w-full'>
			<div className='grid grid-cols-5'>
				<div className='avatar'>
					<div className='w-32 h-32 rounded-xl'>
						<img
							src={articles?.find((article) => article?.id === extraObject?.id)?.image}
							alt='menu img'
						/>
					</div>
				</div>

				<div className='col-span-4 grid grid-cols-6 font-semibold uppercase gap-2'>
					<div className='divider col-span-6 my-1'>General Information</div>
					<div>ID</div>
					<div className='col-span-2 text-primary'>{articles?.find((article) => article?.id === extraObject?.id)?.id}</div>
					<div>Name</div>
					<div className='col-span-2 text-primary'>{articles?.find((article) => article?.id === extraObject?.id)?.title}</div>
					<div>Category</div>
					<div className='col-span-2 text-primary'>{'NOURRITURE'}</div>
					<div>Created At</div>
					<div className='col-span-2 text-primary'>
						{moment(articles?.find((article) => article?.id === extraObject?.id)?.created_at).format('DD-MM-YYYY') +
							' ' +
							moment(articles?.find((article) => article?.id === extraObject?.id)?.created_at).format('LT')}
					</div>
					<div className='divider col-span-6 my-1'>Price</div>
					<div>Price</div>
					<div className='col-span-2 text-primary'>{articles?.find((article) => article?.id === extraObject?.id)?.price}</div>
					<div>Discount</div>
					<div className='col-span-2 text-primary'>{articles?.find((article) => article?.id === extraObject?.id)?.discount || 0}</div>
					<div className='divider col-span-6 my-1'>Merchant</div>
					<div>Merchant ID</div>
					<div className='col-span-2 text-primary'>{articles?.find((article) => article?.id === extraObject?.id)?.merchant?.id}</div>
					<div>Merchant Name</div>
					<div className='col-span-2 text-primary'>{articles?.find((article) => article?.id === extraObject?.id)?.merchant?.name}</div>
					<div>Merchant Phone</div>
					<div className='col-span-2 text-primary'>{articles?.find((article) => article?.id === extraObject?.id)?.merchant?.client?.phone_number}</div>
					<div>Merchant Whatsapp</div>
					<div className='col-span-2 text-primary'>{articles?.find((article) => article?.id === extraObject?.id)?.merchant?.whatsapp}</div>
					<div className='divider col-span-6 my-1'>Actions</div>
					<div>Is available ? </div>
					<div className='col-span-2 text-primary'>
						<input
							onChange={async () => {
								await dispatch(switchArticleStatus({ articleId: articles?.find((article) => article?.id === extraObject?.id)?.id })).then(async (response) => {
									if (response?.error) {
										dispatch(
											showNotification({
												message: 'Error while change the article availability',
												status: 0,
											})
										);
									} else {
										setAvailabilityState((oldValue) => !oldValue);
										// extraObject.available = !extraObject.available;
										dispatch(
											showNotification({
												message: 'Succefully changed the availability',
												status: 1,
											})
										);
										// closeModal();
									}
								});
							}}
							type='checkbox'
							className={`toggle toggle-primary ${availabilityState ? 'toggle-primary' : ''}`}
							checked={availabilityState}
						/>
					</div>
					<div>Status </div>
					<div className='col-span-2 text-primary'>
						<select
							value={articles?.find((article) => article?.id === extraObject?.id)?.status}
							className='select select-bordered select-sm w-2/3'
							onChange={async (e) => {
								console.log(e.target.value);
								await dispatch(switchArticlePublish({ articleId: articles?.find((article) => article?.id === extraObject?.id)?.id, status: e.target.value })).then(async (response) => {
									if (response?.error) {
										dispatch(
											showNotification({
												message: 'Error while change the article publish status',
												status: 0,
											})
										);
									} else {
										dispatch(
											showNotification({
												message: 'Succefully changed the publish status',
												status: 1,
											})
										);

										// closeModal();
									}
								});
							}}
						>
							<option value='PUBLISHED'>PUBLISHED</option>
							<option value='UNPUBLISHED'>UNPUBLISHED</option>
							<option value='PENDING'>PENDING</option>
							<option value='REJECTED'>REJECTED</option>
						</select>
					</div>
				</div>
			</div>

			{/* Content */}
			{articles?.find((article) => article?.id === extraObject?.id)?.article_accompagnements?.length ? (
				<TitleCard
					title={'Accompagnements'}
					topMargin={'mt-4'}
					containerStyle={''}
				>
					<>
						{articles
							?.find((article) => article?.id === extraObject?.id)
							?.article_accompagnements?.map((article) => (
								<div
									key={article?.id}
									className='grid md:grid-cols-8'
								>
									{/* <label className='label cursor-pointer md:col-start-2 md:col-span-6'> */}
									<input
										type='checkbox'
										className='checkbox checkbox-primary checkbox-sm md:col-start-2 mt-2'
										checked
										disabled
									/>
									<span className='label-text md:col-span-3 mt-2'>{article?.accompagnement?.name}</span>
								</div>
							))}
					</>
				</TitleCard>
			) : (
				<></>
			)}
			{articles?.find((article) => article?.id === extraObject?.id)?.article_supplements?.length ? (
				<TitleCard
					title={'Supplements'}
					topMargin={'mt-4'}
				>
					<>
						{articles
							?.find((article) => article?.id === extraObject?.id)
							?.article_supplements?.map((supp) => (
								<div
									key={supp?.id}
									className='grid md:grid-cols-8'
								>
									{/* <label className='label cursor-pointer md:col-start-2 md:col-span-6'> */}
									<input
										type='checkbox'
										className='checkbox checkbox-primary checkbox-sm md:col-start-2 mt-2'
										checked
										disabled
									/>
									<span className='label-text md:col-span-3 mt-2'>{supp?.accompagnement?.name}</span>
									<span className='label-text md:col-span-3 mt-2'>{supp?.price}</span>
								</div>
							))}
					</>
				</TitleCard>
			) : (
				<></>
			)}

			<div className='mt-4 sm:grid sm:grid-cols-3'>
				<button
					className='w-full col-span-1 btn btn-outline btn-secondary btn-sm sm:col-start-2'
					onClick={() => {
						dispatch(
							openRightDrawer({
								header: `Editing Menu`,
								bodyType: RIGHT_DRAWER_TYPES.MERCHANT_ARTICLE_ADD_EDIT,
								extraObject: { article: articles?.find((article) => article?.id === extraObject?.id), edit: true },
							})
						);
					}}
				>
					Edit
				</button>
			</div>
		</div>
	);
};

export default MerchantsDetailView;
