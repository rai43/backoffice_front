import React, { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import TitleCard from '../../../../components/Cards/TitleCard';
import InputText from '../../../../components/Input/InputText';

const INITIAL_OBJ = {
	id: '',
	name: '',
	latitude: '',
	longitude: '',
	radius: '',
	details: '',
};

const Location = ({ formik, clickAction, locations, setLocations }) => {
	const [addNew, setAddNew] = useState(false);
	const [location, setLocation] = useState(INITIAL_OBJ);

	const updateFormValue = useCallback(({ key, value }) => {
		return setLocation((oldValues) => {
			return { ...oldValues, [key]: value };
		});
	}, []);

	const AddNewLocation = () => {
		return (
			<button
				className='btn btn-outline btn-primary btn-sm'
				onClick={() => setAddNew((old) => !old)}
			>
				Add a New Location
			</button>
		);
	};

	return (
		<>
			<TitleCard
				title={'Locations'}
				TopSideButtons={<AddNewLocation />}
			>
				{addNew ? (
					<>
						<div className='w-full grid grid-cols-1 md:grid-cols-7 gap-2'>
							<InputText
								type='text'
								defaultValue={location.name}
								updateType='name'
								placeholder='Name'
								containerStyle='mt-3 md:col-span-2'
								labelTitle='Name'
								updateFormValue={updateFormValue}
							/>
							<InputText
								type='text'
								defaultValue={location.details}
								updateType='details'
								placeholder='Details'
								containerStyle='mt-3 md:col-span-2'
								labelTitle='Details'
								updateFormValue={updateFormValue}
							/>
							<InputText
								type='number'
								defaultValue={location.latitude}
								updateType='latitude'
								placeholder='Latitude'
								containerStyle='mt-3'
								labelTitle='Latitude'
								updateFormValue={updateFormValue}
							/>
							<InputText
								type='number'
								defaultValue={location.longitude}
								updateType='longitude'
								placeholder='Longitude'
								containerStyle='mt-3'
								labelTitle='Longitude'
								updateFormValue={updateFormValue}
							/>
							<InputText
								type='number'
								defaultValue={location.radius}
								updateType='radius'
								placeholder='Radius'
								containerStyle='mt-3'
								labelTitle='Radius'
								updateFormValue={updateFormValue}
							/>
						</div>
						<div className='flex items-center justify-center my-3 gap-3'>
							<button
								className='btn btn-outline btn-sm btn-error w-1/4'
								onClick={() => {
									setAddNew((old) => !old);
								}}
							>
								Cancel
							</button>
							<button
								className='btn btn-outline btn-sm btn-ghost w-1/4'
								onClick={() => {
									if (location.name.length && location.details.length && parseInt(location?.radius || 0) > 0) {
										setLocations((oldValues) => {
											return [{ ...location, name: location.name.toLocaleUpperCase(), id: uuidv4() }, ...oldValues];
										});
										setLocation(INITIAL_OBJ);
										setAddNew((old) => !old);
									}
								}}
							>
								Add
							</button>
						</div>
					</>
				) : (
					<></>
				)}

				{locations.map((location) => (
					<div
						key={location.id}
						className='alert shadow-lg my-4'
					>
						<div>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='stroke-current flex-shrink-0 h-6 w-6'
								fill='none'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
							<div>
								<h3 className='font-bold'>
									{location.name} - ({location.details})
								</h3>
								<div className='text-xs'>
									Latitude: <span className='font-semibold text-primary'>{location.latitude}</span>, Longitude:{' '}
									<span className='font-semibold text-primary'>{location.longitude}</span>, Radius: <span className='font-semibold text-primary'>{location.radius} meter(s)</span>
								</div>
							</div>
						</div>
						<div className='flex-none'>
							<button
								className='btn btn-sm btn-outline'
								onClick={() => {
									setLocations((oldValues) => {
										return oldValues.filter((loc) => loc.id !== location.id);
									});
								}}
							>
								<XMarkIcon className='h-3 w-3' />
							</button>
						</div>
					</div>
				))}
				{!locations?.length && !addNew && (
					<div className='flex items-center justify-center my-3 gap-3'>
						No location added, Click
						<button
							className='hover:cursor-pointer text-primary'
							onClick={() => setAddNew(true)}
						>
							here to start adding
						</button>
					</div>
				)}
			</TitleCard>
			<div className='flex flex-row-reverse mt-6 mb-2 mx-4 gap-3'>
				<button
					className='btn btn-outline btn-primary btn-sm'
					onClick={() =>
						clickAction((old) => {
							if (locations?.length) {
								return old + 1;
							} else {
								return old;
							}
						})
					}
				>
					Next
				</button>
				<button
					className=' btn btn-outline btn-ghost btn-sm'
					onClick={() => clickAction((old) => old - 1)}
				>
					Back
				</button>
			</div>
		</>
	);
};

export default Location;
