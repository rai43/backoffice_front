import React from 'react';
import streetLogo from '../../assets/street_logo.jpeg';

const UserBasicDetail = ({ phone_number, is_deleted, merchant_name, photo, client_type, country }) => {
	return (
		<div className='w-full grid grid-cols-1 md:grid-cols-4'>
			<div className='col-span-3 p-2 grid grid-rows-2 gap-2'>
				<div>
					<div className={`inline-grid rounded-lg w-3 h-3 justify-items-center self-center items-center ${is_deleted ? 'bg-error' : 'bg-success'}`}></div>
					<div className='inline-grid mx-4 font-semibold'>
						{country?.prefix ? country.prefix + ' ' : '+225 '} {phone_number}
					</div>

					<div className='inline-grid mx-6 font-extralight'>/ mobile number</div>
				</div>
				<div>
					<span className='mx-4 p-3 my-3 text-primary font-semibold'>{merchant_name?.toLocaleUpperCase() || client_type?.libelle?.toLocaleUpperCase()}</span>
				</div>
			</div>

			<div className='flex flex-row-reverse'>
				<div className='flex-shrink-0 h-14 w-14 mx-5'>
					<img
						className='h-14 w-14 rounded-full'
						src={photo?.startsWith('http') ? photo : streetLogo}
						alt='UserImage'
					/>
				</div>
			</div>
		</div>
	);
};

export default UserBasicDetail;
