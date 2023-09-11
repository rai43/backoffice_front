import React, { useState } from 'react';

import SellerImageBg from '../../../../assets/SellerImageBg.avif';
import PersonalImageBg from '../../../../assets/clientImageBg.avif';

const ChooseAccountType = ({ selectedAccount, setSelectedAccount, clickAction }) => {
	return (
		<>
			<div className='w-full flex items-center justify-center'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-5 place-items-center'>
					<div
						className={`card w-3/4 h-1/2 bg-white shadow-xl image-full mx-4 hover:cursor-pointer ${selectedAccount === 'personal' ? 'border-t-4 border-b-4 border-primary' : ''}`}
						onClick={() => setSelectedAccount('personal')}
					>
						<figure>
							<img
								src={PersonalImageBg}
								alt='PersonalImageBg'
							/>
						</figure>
						<div className='card-body flex items-center justify-center'>
							<h2 className='card-title'>Create a Personal Account</h2>
						</div>
					</div>

					<div
						className={`card w-3/4 h-1/2 bg-slate-100 shadow-xl image-full mx-4 hover:cursor-pointer ${selectedAccount === 'merchant' ? 'border-t-4 border-b-4 border-primary' : ''}`}
						onClick={() => setSelectedAccount('merchant')}
					>
						<figure>
							<img
								src={SellerImageBg}
								alt='SellerImageBg'
							/>
						</figure>
						<div className='card-body flex items-center justify-center'>
							<h2 className='card-title text-center'>Create a Marchand Account</h2>
						</div>
					</div>
				</div>
			</div>
			<div className='md:col-start-2 grid grid-cols-1 content-end mx-4 my-3 md:my-1'>
				<button
					className='md:col-start-2 btn btn-outline btn-primary btn-sm'
					onClick={() => clickAction((old) => old + 1)}
				>
					Next
				</button>
			</div>
		</>
	);
};

export default ChooseAccountType;
