import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { AiOutlineDelete } from 'react-icons/ai';
import { classNames } from '../../../components/Common/UtilsClassNames';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import moment from 'moment';
import { deleteDiscount, toggleDiscountStatus } from '../discountManagementSlice';
import { showNotification } from '../../common/headerSlice';
import { openModal } from '../../common/modalSlice';
import { disableScroll, enableScroll } from '../../../utils/functions/preventAndAllowScroll';

const containFilterParams = {
	filterOptions: ['contains', 'notContains'],
	debounceMs: 200,
	maxNumConditions: 1,
};

const DiscountList = ({ dateValue }) => {
	const dispatch = useDispatch();
	const { discounts, isLoading } = useSelector((state) => state.discount);

	const [disableDiscount, setDisableDiscount] = useState(false);
	const [ToBedeletedDiscount, setToBeDeletedDiscount] = useState(false);
	const [selectedDiscount, setSelectedDiscount] = useState({});

	const onDefaultColClicked = async (data) => {
		console.log(data);
		dispatch(
			openModal({
				title: 'Add Discount',
				size: 'lg',
				bodyType: MODAL_BODY_TYPES.DISCOUNT_ADD_OR_EDIT,
				extraObject: { discountObject: data, dateValue },
			})
		);
	};

	const toggleStatus = async (data) => {
		disableScroll();
		setDisableDiscount((_) => true);
		setSelectedDiscount(data);
	};

	const deleteDiscountById = async (data) => {
		disableScroll();
		setToBeDeletedDiscount((_) => true);
		setSelectedDiscount(data);
	};

	const columnDefs = useMemo(() => [
		{
			field: 'id',
			headerName: 'ID',
			width: 70,
			pinned: true,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ value }) => {
				return <p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-primary')}>{value}</p>;
			},
		},
		{
			field: 'article.id',
			headerName: 'Article ID',
			width: 120,
			pinned: true,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ value }) => {
				return <p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-primary')}>{value}</p>;
			},
		},
		{
			field: 'article.merchant.name',
			headerName: 'Merchant',
			width: 150,
			filterParams: containFilterParams,
			// pinned: 'right',
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className='uppercase break-all overflow-hidden'>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'article.title',
			headerName: 'Article',
			width: 170,
			filterParams: containFilterParams,
			// pinned: 'right',
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className='uppercase break-all overflow-hidden'>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'value_type',
			headerName: 'Type',
			width: 130,
			filterParams: containFilterParams,
			// pinned: 'right',
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className='uppercase break-all overflow-hidden'>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'value',
			headerName: 'Value',
			width: 100,
			filterParams: containFilterParams,
			// pinned: 'right',
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ data, value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className='uppercase break-all overflow-hidden'>{value + (data?.value_type === 'PRICE' ? '' : ' %')}</p>
					// </div>
				);
			},
		},
		{
			field: 'start_date',
			headerName: 'Start Date',
			width: 155,
			filterParams: containFilterParams,
			// pinned: 'right',
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className='uppercase break-all overflow-hidden'>{moment(value).format('DD/MM/YYYY HH:mm')}</p>
					// </div>
				);
			},
		},
		{
			field: 'end_date',
			headerName: 'End Date',
			width: 155,
			filterParams: containFilterParams,
			// pinned: 'right',
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className='uppercase break-all overflow-hidden'>{moment(value).format('DD/MM/YYYY HH:mm')}</p>
					// </div>
				);
			},
		},
		{
			field: 'id',
			headerName: 'Status',
			width: 100,
			filterParams: containFilterParams,
			// pinned: 'right',
			onCellClicked: (params) => toggleStatus(params.data),
			cellRenderer: ({ data, value }) => {
				return (
					<div className='form-control w-52'>
						<label className='cursor-pointer label'>
							<input
								type='checkbox'
								className='toggle toggle-primary toggle-sm'
								checked={data?.active}
								onChange={() => {}}
							/>
						</label>
					</div>
				);
			},
		},
		{
			field: 'id',
			headerName: 'Delete',
			width: 90,
			filterParams: containFilterParams,
			// pinned: 'right',
			onCellClicked: (params) => deleteDiscountById(params.data),
			cellRenderer: ({ data, value }) => {
				return (
					<div className='flex items-center justify-center '>
						<button className='btn btn-outline btn-xs btn-error mt-2'>
							<AiOutlineDelete />
						</button>
					</div>
				);
			},
		},
		{
			field: 'id',
			headerName: 'Image',
			width: 90,
			filterParams: containFilterParams,
			pinned: 'right',
			onCellClicked: (params) => onDefaultColClicked(params.data),
			cellRenderer: ({ data }) => {
				return (
					<div className={`avatar ${data?.active ? 'online' : 'offline'}`}>
						<div className='w-11 h-11 rounded-full'>
							<img
								src={data?.article?.image}
								alt='food'
							/>
						</div>
					</div>
				);
			},
		},
	]);

	return (
		<div className='overflow-hidden mt-2'>
			<div className={`${ToBedeletedDiscount ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
				<div className='modal-box'>
					<h3 className='font-bold text-lg'>
						Are you sure you want to delete the discount with ID: <span className='text-primary'>{selectedDiscount?.id}</span>?
					</h3>

					<div className=''>
						<div className='divider'>Information</div>
						<p>
							Article: <span className='text-primary font-semibold lowercase'>{selectedDiscount?.article?.title}</span>
						</p>
						<p>
							Type: <span className='text-primary font-semibold lowercase'>{selectedDiscount?.value_type}</span>
						</p>
						<p>
							Value: <span className='text-primary font-semibold lowercase'>{selectedDiscount?.value}</span>
						</p>
						<p>
							Merchant: <span className='text-primary font-semibold lowercase'>{selectedDiscount?.article?.merchant?.name}</span>
						</p>
						<p>
							Interval: From <span className='text-primary font-semibold lowercase'>{moment(selectedDiscount?.start_date).format('DD-MM-YYYY HH:mm')}</span> To{' '}
							<span className='text-primary font-semibold lowercase'>{moment(selectedDiscount?.end_date).format('DD-MM-YYYY HH:mm')}</span>
						</p>
					</div>
					<div className='divider'>Actions</div>
					<div className='modal-action'>
						<button
							className='btn btn-sm btn-outline btn-primary'
							onClick={() => {
								enableScroll();
								setToBeDeletedDiscount((_) => false);
								setSelectedDiscount((_) => {});
							}}
						>
							No, Cancel Action
						</button>
						<button
							className='btn btn-sm btn-outline btn-secondary'
							onClick={async () => {
								await dispatch(
									deleteDiscount({
										discountId: selectedDiscount?.id,
									})
								).then(async (response) => {
									if (response?.error) {
										dispatch(
											showNotification({
												message: 'Error while deleting the discount',
												status: 0,
											})
										);
									} else {
										dispatch(
											showNotification({
												message: 'Succefully deleted the discount',
												status: 1,
											})
										);
										setToBeDeletedDiscount((_) => false);
										setSelectedDiscount((_) => {});
										enableScroll();
									}
								});
							}}
						>
							PROCEED
						</button>
					</div>
				</div>
			</div>

			<div className={`${disableDiscount ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
				<div className='modal-box'>
					<h3 className='font-bold text-lg'>
						Are you sure you want to {selectedDiscount?.active ? 'disable' : 'enable'} the discount with ID: <span className='text-primary'>{selectedDiscount?.id}</span>?
					</h3>

					<div className=''>
						<div className='divider'>Information</div>
						<p>
							Article: <span className='text-primary font-semibold lowercase'>{selectedDiscount?.article?.title}</span>
						</p>
						<p>
							Type: <span className='text-primary font-semibold lowercase'>{selectedDiscount?.value_type}</span>
						</p>
						<p>
							Value: <span className='text-primary font-semibold lowercase'>{selectedDiscount?.value}</span>
						</p>
						<p>
							Merchant: <span className='text-primary font-semibold lowercase'>{selectedDiscount?.article?.merchant?.name}</span>
						</p>
						<p>
							Interval: From <span className='text-primary font-semibold lowercase'>{moment(selectedDiscount?.start_date).format('DD-MM-YYYY HH:mm')}</span> To{' '}
							<span className='text-primary font-semibold lowercase'>{moment(selectedDiscount?.end_date).format('DD-MM-YYYY HH:mm')}</span>
						</p>
					</div>
					<div className='divider'>Actions</div>
					<div className='modal-action'>
						<button
							className='btn btn-sm btn-outline btn-primary'
							onClick={() => {
								enableScroll();
								setDisableDiscount((_) => false);
								setSelectedDiscount((_) => {});
							}}
						>
							No, Cancel Action
						</button>
						<button
							className='btn btn-sm btn-outline btn-secondary'
							onClick={async () => {
								await dispatch(
									toggleDiscountStatus({
										discountId: selectedDiscount?.id,
									})
								).then(async (response) => {
									if (response?.error) {
										dispatch(
											showNotification({
												message: 'Error while toggling the discount status',
												status: 0,
											})
										);
									} else {
										dispatch(
											showNotification({
												message: response?.payload?.discount?.existingDiscount
													? `Could not change the discount's status, please check the date range`
													: "Succefully changed the discount's status",
												status: response?.payload?.discount?.existingDiscount ? 0 : 1,
											})
										);
										enableScroll();
										setDisableDiscount((_) => false);
										setSelectedDiscount((_) => {});
									}
								});
							}}
						>
							PROCEED
						</button>
					</div>
				</div>
			</div>

			{!isLoading && (
				<>
					<div className='ag-theme-alpine h-[40rem]'>
						<AgGridReact
							columnDefs={columnDefs}
							rowData={discounts}
							defaultColDef={AG_GRID_DEFAULT_COL_DEF}
							// defaultColDef={defaultColDef}
							pagination={true}
							paginationPageSize={20}
							rowHeight={50}
							sideBar={'filters'}
							rowSelection='single'
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default DiscountList;
