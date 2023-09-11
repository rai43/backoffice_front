import moment from 'moment';
import React, { useEffect } from 'react';

const OrderDetails = ({ extraObject, closeModal }) => {
	useEffect(() => console.log(extraObject));
	return (
		<div>
			<h3 className='font-semibold text-lg uppercase'>General Information</h3>
			<div className='divider my-1'></div>
			<div className='grid md:grid-cols-2 gap-3 uppercase'>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>ID</h4>
					<div className='col-span-2 text-primary'>{extraObject.id}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Date</h4>
					<div className='col-span-2 text-primary'>{moment(extraObject.created_at).format('DD/MM/YYYY  HH:MM')}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Client</h4>
					<div className='col-span-2 text-primary'>{extraObject?.phone_number}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Payment method</h4>
					<div className='col-span-2 text-primary'>{extraObject?.payment_method}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Total Article</h4>
					<div className='col-span-2 text-primary'>{extraObject?.total_articles}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Delivery fee</h4>
					<div className='col-span-2 text-primary'>{extraObject?.delivery_fee}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Total Command</h4>
					<div className='col-span-2 text-primary'>{extraObject?.total}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Balance share</h4>
					<div className='col-span-2 text-primary'>{extraObject?.balance_share}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Balance share</h4>
					<div className='col-span-2 text-primary'>{extraObject?.bonus_share}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Merchant name</h4>
					<div className='col-span-2 text-primary'>{extraObject?.merchant?.name}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Merchant phone number</h4>
					<div className='col-span-2 text-primary'>{extraObject?.merchant?.whatsapp}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Address details</h4>
					<div className='col-span-2 text-primary uppercase'>{extraObject?.address?.detail}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Latitude</h4>
					<div className='col-span-2 text-primary'>{extraObject?.address?.latitude}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Longitude</h4>
					<div className='col-span-2 text-primary uppercase'>{extraObject?.address?.longitude}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Livreur Name</h4>
					<div className='col-span-2 text-primary'>{extraObject?.livreur ? `${extraObject?.livreur?.last_name} ${extraObject?.livreur?.first_name}` : 'N/A'}</div>
				</div>
				<div className='grid grid-cols-3 font-semibold'>
					<h4 className='uppercase'>Livreur Phone</h4>
					<div className='col-span-2 text-primary uppercase'>{extraObject?.livreur?.whatsapp || 'N/A'}</div>
				</div>
			</div>
			<h3 className='my-3 uppercase font-semibold'>Status</h3>
			<div className='stats shadow w-full text-[1.1rem]'>
				<div className='stat place-items-center'>
					<div className='stat-title'>PENDING</div>
					<div className='stat-value'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'PENDING')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'PENDING')?.commande_status?.created_at).format('HH:MM')
							: '- -'}
					</div>
					<div className='stat-desc'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'PENDING')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'PENDING')?.commande_status?.created_at).format('DD-MM-YYYY')
							: '- -'}
					</div>
				</div>

				<div className='stat place-items-center'>
					<div className='stat-title'>REGISTERED</div>
					<div className='stat-value text-'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'REGISTERED')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'REGISTERED')?.commande_status?.created_at).format('HH:MM')
							: '- -'}
					</div>
					<div className='stat-desc text-'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'REGISTERED')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'REGISTERED')?.commande_status?.created_at).format('DD-MM-YYYY')
							: '- -'}
					</div>
				</div>

				<div className='stat place-items-center'>
					<div className='stat-title'>INPROCESS</div>
					<div className='stat-value text-'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'INPROCESS')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'INPROCESS')?.commande_status?.created_at).format('HH:MM')
							: '- -'}
					</div>
					<div className='stat-desc text-'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'INPROCESS')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'INPROCESS')?.commande_status?.created_at).format('DD-MM-YYYY')
							: '- -'}
					</div>
				</div>

				<div className='stat place-items-center'>
					<div className='stat-title'>INDELIVERY</div>
					<div className='stat-value text-'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'INDELIVERY')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'INDELIVERY')?.commande_status?.created_at).format('HH:MM')
							: '- -'}
					</div>
					<div className='stat-desc text-'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'INDELIVERY')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'INDELIVERY')?.commande_status?.created_at).format('DD-MM-YYYY')
							: '- -'}
					</div>
				</div>

				<div className='stat place-items-center'>
					<div className='stat-title'>DELIVERED</div>
					<div className='stat-value text-primary'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'DELIVERED')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'DELIVERED')?.commande_status?.created_at).format('HH:MM')
							: '- -'}
					</div>
					<div className='stat-desc text-primary'>
						{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'DELIVERED')
							? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'DELIVERED')?.commande_status?.created_at).format('DD-MM-YYYY')
							: '- -'}
					</div>
				</div>
				{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'CANCELED') && (
					<div className='stat place-items-center'>
						<div className='stat-title text-secondary'>CANCELED</div>
						<div className='stat-value text-secondary'>
							{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'CANCELED')
								? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'CANCELED')?.commande_status?.created_at).format('HH:MM')
								: '- -'}
						</div>
						<div className='stat-desc text-secondary'>
							{extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'CANCELED')
								? moment(extraObject?.commande_commande_statuses.find((status) => status?.commande_status?.code === 'CANCELED')?.commande_status?.created_at).format('DD-MM-YYYY')
								: '- -'}
						</div>
					</div>
				)}
			</div>
			{extraObject?.article_commandes?.length > 0 &&
				extraObject?.article_commandes?.map((article) => (
					<div key={article?.id}>
						<div className='divider text-primary'>Article ID: {article?.id}</div>
						<div className='grid md:grid-cols-3 gap-2'>
							<div className='avatar'>
								<div className='w-32 h-32 rounded-xl flex justify-center'>
									<img
										src={article?.article?.media[0].url}
										alt='article'
									/>
								</div>
							</div>

							<div className='md:col-span-2 grid grid-cols-3 uppercase font-semibold'>
								<div>Article name</div>
								<div className='col-span-2'>{article?.article?.title}</div>
								<div>Quantity</div>
								<div className='col-span-2'>{article?.quantity}</div>
								<div>Price</div>
								<div className='col-span-2'>{article?.price}</div>
								<div>Comment</div>
								<div className='col-span-2'>{article?.comment || 'N/A'}</div>
								<div className='col-span-3 divider text-secondary'>Accompagnements</div>
								{article?.ligne_accompagnements?.map((acc, index) => (
									<div
										key={acc?.id}
										className='col-span-3 grid grid-cols-3 gap-2'
									>
										<div>N {index + 1}</div>
										<div className='col-span-2'>{acc?.accompagnement?.name}</div>
									</div>
								))}
								{article?.ligne_supplements?.map((supp, index) => (
									<div
										key={supp?.id}
										className='col-span-3 grid grid-cols-3 gap-2'
									>
										<div>N {index + 1}</div>
										<div className='col-span-2'>{supp?.accompagnement?.name}</div>
									</div>
								))}
							</div>
						</div>
					</div>
				))}
		</div>
	);
};

export default OrderDetails;
