import React from 'react';
import moment from 'moment';
import { MdPlaylistAdd, MdOutlineDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';

import UserBasicDetail from '../../../components/Common/UserBasicDetail';
import TitleCard from '../../../components/Cards/TitleCard';
import InfoText from '../../../components/Typography/InfoText';
import { openRightDrawer } from '../../common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../../../utils/globalConstantUtil';
import { useDispatch } from 'react-redux';

const Article = (props) => {
	return (
		<div className='flex flex-col justify-center my-4'>
			<div className='relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-lg p-3 max-w-xs md:max-w-3xl mx-auto border border-white bg-white'>
				<div className='w-full md:w-1/3 bg-white grid place-items-center'>
					<img
						src={props.media[0]?.url}
						alt='tailwind logo'
						className='rounded-xl'
					/>
				</div>
				<div className='w-full md:w-2/3 bg-white flex flex-col space-y-2 p-3'>
					<div className='flex justify-between item-center'>
						<p className='text-gray-500 font-medium hidden md:block'>Vacations</p>
						<div className='flex items-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-yellow-500'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
							</svg>
							<p className='text-gray-600 font-bold text-sm ml-1'>
								4.96
								<span className='text-gray-500 font-normal'>(76 reviews)</span>
							</p>
						</div>
						<div className=''>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-pink-500'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path
									fill-rule='evenodd'
									d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z'
									clip-rule='evenodd'
								/>
							</svg>
						</div>
						<div className='bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800 hidden md:block'>Superhost</div>
					</div>
					<h3 className='font-black text-gray-800 md:text-3xl text-xl'>The Majestic and Wonderful Bahamas</h3>
					<p className='md:text-lg text-gray-500 text-base'>
						The best kept secret of The Bahamas is the country’s sheer size and diversity. With 16 major islands, The Bahamas is an unmatched destination
					</p>
					<p className='text-xl font-black text-gray-800'>
						$110
						<span className='font-normal text-gray-600 text-base'>/night</span>
					</p>
				</div>
			</div>
		</div>
		// <div className='card card-side bg-base-100 shadow-xl my-4 grid grid-cols-4 h-36'>
		// 	<figure className='p-2'>
		// 		<img
		// 			src={props.media[0]?.url}
		// 			alt='Movie'
		// 			className='rounded-sm'
		// 			style={{
		// 				objectFit: 'contain',
		// 				// overflow: 'hidden',
		// 			}}
		// 		/>
		// 	</figure>
		// 	<div className='card-body col-span-3 my-1'>
		// 		{/* <h2 className='card-title'>{props?.title}</h2> */}
		// 		<div className='grid grid-cols-4 font-semibold'>
		// 			<div className=''>Title</div>
		// 			<div className='col-span-3 text-primary my-1'>{props?.title}</div>
		// 			<div className=''>Prix</div>
		// 			<div className='col-span-3 text-primary my-1'>{props?.price} F CFA</div>
		// 		</div>
		// 		{/* <p>Click the button to watch on Jetflix app.</p> */}
		// 		{/* <div className='card-actions justify-end'>
		// 			<button className='btn btn-primary'>Watch</button>
		// 		</div> */}
		// 	</div>
		// </div>
	);
};

const Accompagnement = (props) => {
	return (
		<div className='w-full mb-4'>
			<div className='alert shadow-lg'>
				<div>
					<MdPlaylistAdd className='h-5 w-5' />
					<div>
						<h3 className='font-bold'>
							{props.name} <span className='text-sm text-primary'>on {moment(props.created_at).format('lll')}</span>
						</h3>
						<div className='text-xs text-primary font-semibold'>{props.price || 0} F CFA</div>
					</div>
				</div>
				<div className=''>
					<button className='btn btn-sm btn-outline btn-ghost'>
						<MdOutlineModeEditOutline className='h-5 w-5' />
					</button>
					<button className='btn btn-sm btn-outline btn-error'>
						<MdOutlineDeleteOutline className='h-5 w-5' />
					</button>
				</div>
			</div>
		</div>
	);
};

const MerchantsDetailView = ({ extraObject }) => {
	return (
		<div className='w-full'>
			{/* Divider */}
			<div className='divider mt-0'></div>

			{/* Basic Client Info */}
			<UserBasicDetail {...extraObject.client} />

			{/* Info card */}
			<div className='w-full stats stats-vertical lg:stats-horizontal shadow mb-4'>
				<div className='stat'>
					<div className='stat-title'>Articles</div>
					<div className={`stat-value text-[1.6rem] ${extraObject?.articles?.length > 0 ? 'text-primary' : ''}`}>{extraObject?.articles?.length || '0'}</div>
					<div className='stat-desc'>
						<span className='font-semibold'>{`Article${extraObject?.articles?.length ? 's' : ''}`}</span>
					</div>
				</div>

				<div className='stat'>
					<div className='stat-title'>Country</div>
					<div className={`stat-value text-[1.6rem] ${extraObject?.accompagnements?.length > 0 ? 'text-primary' : ''}`}>{extraObject?.accompagnements?.length || '0'}</div>
					<div className='stat-desc'>
						<span className='font-semibold'>{`Accompagnement${extraObject?.accompagnements?.length ? 's' : ''}`}</span>
					</div>
				</div>
				<div className='stat'>
					<div className='stat-title'>Number of wallets</div>
					<div className={`stat-value text-[1.6rem] ${extraObject?.client?.wallets?.length > 0 ? 'text-primary' : ''}`}>{extraObject?.client?.wallets?.length || 'N/A'}</div>
					<div className='stat-desc'>Wallets</div>
				</div>
				<div className='stat'>
					<div className='stat-title'>Creation Info</div>
					<div className='stat-value text-[1.5rem]'>{moment(extraObject?.created_at).format('lll') || 'N/A'}</div>
					<div className='stat-desc'>
						By: <span className='font-semibold'>{extraObject?.created_by || 'Backoffice'}</span>
					</div>
				</div>
			</div>

			{/* Content */}
			<TitleCard
				title={'Articles'}
				topMargin={'mt-4'}
				containerStyle={''}
			>
				{extraObject?.articles?.length ? (
					<>
						{extraObject?.articles?.map((article) => (
							<Article
								key={article.id}
								{...article}
							/>
						))}
					</>
				) : (
					<InfoText styleClasses={'md:grid-cols-2'}>No article found ...</InfoText>
				)}
			</TitleCard>
			<TitleCard
				title={'Accompagnements'}
				topMargin={'mt-4'}
				// containerStyle={'max-h-60'}
			>
				{extraObject?.accompagnements?.length ? (
					<>
						{extraObject?.accompagnements?.map((acc) => (
							<Accompagnement
								key={acc.id}
								{...acc}
							/>
						))}
					</>
				) : (
					<InfoText styleClasses={'md:grid-cols-2'}>No accompagnement found ...</InfoText>
				)}
			</TitleCard>
		</div>
	);
};

export default MerchantsDetailView;
