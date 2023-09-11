import React, { useEffect } from 'react';
import cliTruncate from 'cli-truncate';

import streetLogo from '../../../assets/street_logo.jpeg';
import EllipsisHorizontalIcon from '@heroicons/react/24/outline/EllipsisHorizontalIcon';

const User = ({ user, onEditClicked, onDeleteClicked, onDetailsClicked }) => {
	return (
		<div className={`w-full ${user.is_locked ? '' : 'bg-base-100'} border-base-100 rounded-lg shadow max-h-[15rem]`}>
			<div className='flex justify-end px-3 pt-3'>
				<div className='dropdown dropdown-hover dropdown-left'>
					<label tabIndex={0}>
						<EllipsisHorizontalIcon className='w-6 h-6' />
					</label>
					<ul
						tabIndex={0}
						className='dropdown-content menu p-1 shadow bg-base-200 rounded-box w-40 z-50'
					>
						<li>
							<button
								className={''}
								onClick={() => onEditClicked(user)}
							>
								Edit
							</button>
						</li>
						<li>
							<button onClick={() => onDeleteClicked(user)}>Delete</button>
						</li>
					</ul>
				</div>
			</div>
			<div className='flex flex-col items-center pb-4'>
				<img
					className='w-12 h-12 mb-3 rounded-full shadow-lg'
					src={streetLogo}
					alt='Bonnie'
				/>
				<h5 className='mb-1 text-xl font-medium text-gray-900 dark:text-white'>{cliTruncate(user.nom_complet, 15)}</h5>
				<span className='text-sm text-gray-500 dark:text-gray-400'>{user?.user_type?.libelle || 'ROLE'}</span>
				<span className='text-sm text-gray-500 dark:text-gray-400'>{user.email}</span>
				<div className='flex mt-4 space-x-3 md:mt-6'>
					<button
						className='btn btn-sm btn-outline btn-primary'
						onClick={() => onDetailsClicked(user)}
					>
						Details
					</button>
				</div>
			</div>
		</div>
	);
};

export default User;
