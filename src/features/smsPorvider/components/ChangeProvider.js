import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification } from '../../common/headerSlice';
import { changeSmsProvider } from '../smsPorviderSlide';

function ChangeProvider({ extraObject, closeModal }) {
	const dispatch = useDispatch();
	const [provider, setProvider] = useState(extraObject?.provider?.provider || '');
	return (
		<div>
			<div className={`form-control w-full my-4`}>
				<label className='label'>
					<span className={'label-text text-base-content'}>Select provider</span>
				</label>

				<select
					value={provider}
					className='select select-bordered select-sm'
					onChange={async (e) => setProvider(e.target.value)}
				>
					<option value='ORANGE'>ORANGE</option>
					<option value='LETEXTO'>LETEXTO</option>
					<option value='TERMII'>TERMII</option>
					<option value='INFOBIP'>INFOBIP</option>
				</select>
			</div>
			<button
				className='btn btn-sm w-full btn-secondary btn-outline my-4'
				onClick={async () => {
					await dispatch(
						changeSmsProvider({
							operatorId: extraObject?.provider?.id,
							provider: provider,
						})
					).then(async (response) => {
						if (response?.error) {
							dispatch(
								showNotification({
									message: 'Error while update the sms provider',
									status: 0,
								})
							);
						} else {
							dispatch(
								showNotification({
									message: 'Succefully updated the sms provider',
									status: 1,
								})
							);
							closeModal();
						}
					});
				}}
			>
				Change
			</button>
		</div>
	);
}

export default ChangeProvider;
