import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getLivreursBySearch } from '../../livreurs/livreursSlice';
import InputAsyncSelect from '../../../components/Input/InputAsyncSelect';
import { showNotification } from '../../common/headerSlice';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { markPresentLivreursPerZone } from '../dynamicAssignmentSlice';

const customStyles = {
	control: (base) => ({
		...base,
		// height: '3rem',
	}),
	menu: (base) => ({
		...base,
		marginBottom: '2rem',
	}),
};

const AssignLivreursToZone = ({ extraObject, closeModal }) => {
	const dispatch = useDispatch();
	const [zone, setZone] = useState('');
	const [livreurs, setLivreurs] = useState([]);

	const updateFormZone = useCallback(({ _, value }) => {
		return setZone(value);
	}, []);

	const zonePromiseOptions = (inputValue) =>
		new Promise(async (resolve) => {
			if (inputValue?.length >= 3) {
				const response = await axios.get('/api/zones/get-zones-by-search', {
					params: {
						searchPattern: inputValue,
					},
				});

				resolve(
					(response?.data?.zones || [])
						.filter((zone) => zone?.name?.toLowerCase()?.includes(inputValue.toLowerCase()))
						.map((zone) => {
							return {
								value: zone.id,
								label: `${zone.name} (${zone?.id})`,
							};
						})
				);
			} else {
				resolve([]);
			}
		});

	const livreursPromiseOptions = (inputValue) =>
		new Promise((resolve) => {
			if (inputValue?.length >= 3) {
				dispatch(getLivreursBySearch({ searchPattern: inputValue })).then((res) =>
					resolve(
						(res?.payload.livreurs || [])
							.filter(
								(livreur) =>
									livreur?.first_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
									livreur?.last_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
									livreur?.whatsapp?.toLowerCase()?.includes(inputValue.toLowerCase())
							)
							.map((livreur) => {
								return {
									value: livreur.id,
									label: `${livreur.first_name} ${livreur.last_name} (${livreur?.whatsapp})`,
								};
							})
					)
				);
			} else {
				resolve([]);
			}
		});
	return (
		<div className=''>
			<div className='grid grid-cols-3 gap-3 h-96'>
				<div className={`form-control w-full col-span-1 mt-3`}>
					<label className='label'>
						<span className={'label-text text-base-content '}>Select Zone</span>
					</label>
					<AsyncSelect
						styles={customStyles}
						placeholder={'Select zone'}
						maxMenuHeight={100}
						cacheOptions
						defaultOptions
						onChange={updateFormZone}
						loadOptions={zonePromiseOptions}
					/>
				</div>
				<div className={`form-control w-full col-span-2 mt-3`}>
					<label className='label'>
						<span className={'label-text text-base-content '}>Livreurs</span>
					</label>
					<AsyncSelect
						styles={customStyles}
						placeholder={'Select livreurs'}
						isMulti
						maxMenuHeight={100}
						cacheOptions
						defaultOptions
						labelTitle='Livreur'
						loadOptions={livreursPromiseOptions}
						onChange={(e) => {
							console.log(e);
							setLivreurs((oldValues) => [...e.map((liv) => liv.value)]);
						}}
					/>
				</div>

				{zone && livreurs && (
					<button
						className='btn btn-outline btn-primary col-start-2'
						onClick={async () => {
							console.log(zone);
							console.log(livreurs);
							await dispatch(markPresentLivreursPerZone({ zone, livreurs })).then(async (response) => {
								if (response?.error) {
									console.log(response.error);
									dispatch(
										showNotification({
											message: 'Error while changing the order status',
											status: 0,
										})
									);
								} else {
									dispatch(
										showNotification({
											message: 'Succefully changed the order status and assigned livreur',
											status: 1,
										})
									);
									closeModal();
								}
							});
						}}
					>
						ASSIGN
					</button>
				)}
			</div>
		</div>
	);
};

export default AssignLivreursToZone;
