import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserBasicDetail from '../../../components/Common/UserBasicDetail';
import moment from 'moment';
import WalletCard from '../../../components/Cards/WalletCard';
import InfoText from '../../../components/Typography/InfoText';
import { useDispatch, useSelector } from 'react-redux';
import { openRightDrawer } from '../../common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../../../utils/globalConstantUtil';

const ClientDetailView = ({ extraObject, closeModal }) => {
	const dispatch = useDispatch();
	const { clients, from, isLoading, noMoreQuery } = useSelector((state) => state.client);
	const [clientObj, setClientObj] = useState({});
	// Opening right sidebar for user details
	const openCardDetails = (client, wallet) => {
		// api call to get the client transactions details
		dispatch(
			openRightDrawer({
				header: `Wallet Details View - ${client.phone_number} (${wallet?.wallet_type?.libelle || 'N/A'})`,
				bodyType: RIGHT_DRAWER_TYPES.CLIENT_CARD_DETAILS,
				extraObject: { client, wallet },
			})
		);
	};

	useEffect(() => {
		clients.find((client) => console.log(client?.id, extraObject?.id));
		setClientObj((oldObj) => {
			return { ...oldObj, ...clients.find((client) => client?.id === extraObject?.id) };
		});
	}, []);

	console.log(extraObject);
	console.log(clientObj);
	// const { phone_number, is_deleted, merchant_name, photo, client_type } = extraObject;
	return (
		<div className='w-full'>
			{/* Divider */}
			<div className='divider mt-0'></div>

			{/* Basic Client Info */}
			<UserBasicDetail
				{...clients.find((client) => client?.id === extraObject?.id)}
				photo={clients.find((client) => client?.id === extraObject?.id)?.photo}
			/>

			{/* Info card */}
			<div className='w-full stats stats-vertical lg:stats-horizontal shadow'>
				<div className='stat'>
					<div className='stat-title'>Number of wallets</div>
					<div className='stat-value'>{clients.find((client) => client?.id === extraObject?.id)?.wallets?.length || 'N/A'}</div>
					<div className='stat-desc'>Wallet count</div>
				</div>

				<div className='stat'>
					<div className='stat-title'>Client Type</div>
					<div className='stat-value text-[1.5rem]'>{clients.find((client) => client?.id === extraObject?.id)?.client_type?.libelle || 'N/A'}</div>
					<div className='stat-desc'>
						Merchant ID: <span className='font-semibold'>{clients.find((client) => client?.id === extraObject?.id)?.merchants[0]?.id || 'N/A'}</span>
					</div>
				</div>

				<div className='stat'>
					<div className='stat-title'>Country</div>
					<div className='stat-value text-[1.5rem]'>{clients.find((client) => client?.id === extraObject?.id)?.country?.name || 'N/A'}</div>
					<div className='stat-desc'>
						Code: <span className='font-semibold'>{clients.find((client) => client?.id === extraObject?.id)?.country?.code || 'N/A'}</span> | Prefix:{' '}
						<span className='font-semibold'>{extraObject?.country?.prefix || 'N/A'}</span>
					</div>
				</div>
				<div className='stat'>
					<div className='stat-title'>Creation Info</div>
					<div className='stat-value text-[1.5rem]'>{moment(extraObject?.created_at).format('lll') || 'N/A'}</div>
					<div className='stat-desc'>
						By: <span className='font-semibold'>{clients.find((client) => client?.id === extraObject?.id)?.created_by || 'N/A'}</span>
					</div>
				</div>
			</div>

			<div className='w-full my-5'>
				<h3 className='text-lg font-semibold'>User Card{clients.find((client) => client?.id === extraObject?.id)?.wallets?.length > 1 ? 's' : ''}</h3>
				{/* Divider */}
				<div className='divider mt-0'></div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 md:gap-y-6'>
					{clients.find((client) => client?.id === extraObject?.id)?.wallets.length ? (
						<>
							{clients
								.find((client) => client?.id === extraObject?.id)
								?.wallets?.map((wallet) => (
									<div
										key={wallet.id}
										className='p-3'
									>
										<WalletCard
											client={clients.find((client) => client?.id === extraObject?.id)}
											wallet={wallet}
											phone_number={
												(clients.find((client) => client?.id === extraObject?.id)?.country?.prefix
													? clients.find((client) => client?.id === extraObject?.id)?.country.prefix + ' '
													: '+225 ') + clients.find((client) => client?.id === extraObject?.id)?.phone_number
											}
											onWalletClicked={openCardDetails}
										/>
									</div>
								))}{' '}
						</>
					) : (
						<InfoText styleClasses={'md:grid-cols-2'}>The user has no wallet</InfoText>
					)}
				</div>
			</div>
		</div>
	);
};

export default ClientDetailView;
