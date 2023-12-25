import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { deleteOffer, getOffers, resetForm } from './offersSlice';
import { openModal } from '../common/modalSlice';
import Datepicker from 'react-tailwindcss-datepicker';
import { AiOutlineDelete } from 'react-icons/ai';
import { disableScroll, enableScroll } from '../../utils/functions/preventAndAllowScroll';
import { deleteDiscount } from '../discountManagement/discountManagementSlice';
import { showNotification } from '../common/headerSlice';

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const Offer = () => {
  const dispatch = useDispatch();
  const { offers, isLoading } = useSelector((state) => state.offers);

  const [ToBedeletedOffer, setToBeDeletedOffer] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState({});

  // Opening right sidebar for user details
  // const changeProvider = (provider) => {
  //   dispatch(
  //     openModal({
  //       title: `Change ${provider?.sms_operator?.name}'s Provider`,
  //       bodyType: MODAL_BODY_TYPES.CHANGE_PROVIDER,
  //       extraObject: { provider },
  //     }),
  //   );
  // };

  const deleteOfferById = async (data) => {
    disableScroll();
    setToBeDeletedOffer((_) => true);
    setSelectedOffer(data);
  };

  const columnDefs = useMemo(() => [
    {
      field: 'name',
      headerName: 'Offer Name',
      width: 250,
      // flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="font-semibold text-md">{value}</span>;
      }
    },
    {
      field: 'offer',
      headerName: 'Offer',
      width: 150,
      // flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="">{value}</span>;
      }
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      // flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="">{value}</span>;
      }
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      // flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="font-semibold text-md">{value}</span>;
      }
    },
    {
      field: 'max_quantity',
      headerName: 'Max Quantity',
      width: 150,
      // flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="font-semibold text-md">{value}</span>;
      }
    },
    {
      field: 'suscriber_limit',
      headerName: 'Suscriber Limit',
      width: 150,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="font-semibold text-md">{value}</span>;
      }
    },
    {
      field: 'created_at',
      headerName: 'Registration Date',
      width: 130,
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        let formattedValue = value ? value : 'N/A';

        if (formattedValue !== 'N/A') {
          formattedValue = moment.utc(value).format('DD/MM/YYYY');
        }

        return (
          <div className="grid row-span-2 text-xs">
            <p>
              <span className=" text-sm mr-2">{formattedValue}</span>
            </p>
            <span className=" text-sm">{moment.utc(value).format('HH:mm')}</span>
          </div>
        );
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 400,
      // flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="">{value}</span>;
      }
    },
    {
      field: 'id',
      headerName: 'Delete',
      width: 110,
      filterParams: containFilterParams,
      pinned: 'right',
      onCellClicked: (params) => deleteOfferById(params.data),
      cellRenderer: () => {
        return (
          <div className="flex items-center justify-center ">
            <button className="btn btn-outline btn-xs btn-error mt-2">
              <AiOutlineDelete />
            </button>
          </div>
        );
      }
    }
  ]);

  const onFetchOffers = async () => {
    dispatch(resetForm());

    await dispatch(getOffers());
  };

  useEffect(() => {
    onFetchOffers();
    console.log(offers);
  }, []);

  return (
    <>
      <div className={`${ToBedeletedOffer ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Are you sure you want to delete the offer (id:{' '}
            <span className="text-primary">{selectedOffer?.id}</span>)?
          </h3>

          <div className="">
            <div className="divider">Information</div>
            <p>
              Offer Name:{' '}
              <span className="text-primary font-semibold lowercase">{selectedOffer?.name}</span>
            </p>
            <p>
              Offer:{' '}
              <span className="text-primary font-semibold lowercase">{selectedOffer?.offer}</span>
            </p>
            <p>
              Type:{' '}
              <span className="text-primary font-semibold lowercase">{selectedOffer?.type}</span>
            </p>
            <p>
              Amount:{' '}
              <span className="text-primary font-semibold lowercase">{selectedOffer?.amount}</span>
            </p>
            <p>
              Max Quantity:{' '}
              <span className="text-primary font-semibold lowercase">
                {selectedOffer?.max_quantity}
              </span>
            </p>
            <p>
              Subscriber Limit:{' '}
              <span className="text-primary font-semibold lowercase">
                {selectedOffer?.suscriber_limit}
              </span>
            </p>
          </div>
          <div className="divider">Actions</div>
          <div className="modal-action">
            <button
              className="btn btn-sm btn-outline btn-ghost"
              onClick={() => {
                enableScroll();
                setToBeDeletedOffer((_) => false);
                setSelectedOffer((_) => {});
              }}
            >
              No, Cancel Action
            </button>
            <button
              className="btn btn-sm btn-outline btn-secondary"
              onClick={async () => {
                await dispatch(
                  deleteOffer({
                    offerId: selectedOffer?.id
                  })
                ).then(async (response) => {
                  if (response?.error) {
                    dispatch(
                      showNotification({
                        message: 'Could not delete the selected offer',
                        status: 0
                      })
                    );
                  } else {
                    dispatch(
                      showNotification({
                        message: 'Succefully deleted the offer',
                        status: 1
                      })
                    );
                    setToBeDeletedOffer((_) => false);
                    setSelectedOffer((_) => {});
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

      <div className="overflow-hidden mt-2">
        <div className="grid sm:grid-cols-3 gap-3 my-3">
          <div className="md:col-start-3">
            <button
              className="btn btn-sm btn-outline btn-primary w-full"
              onClick={() => {
                dispatch(
                  openModal({
                    title: 'New Offer',
                    size: 'lg',
                    bodyType: MODAL_BODY_TYPES.OFFER_ADD_OR_EDIT
                    // extraObject: { dateValue },
                  })
                );
              }}
            >
              New Offer
            </button>
          </div>
        </div>

        <div className="ag-theme-alpine h-[40rem]">
          <AgGridReact
            columnDefs={columnDefs}
            rowData={offers}
            defaultColDef={AG_GRID_DEFAULT_COL_DEF}
            pagination={true}
            paginationPageSize={20}
            rowHeight={50}
            gridOptions={gridOptions}
            paginationPageSizeOptions={[10, 20, 50]}
            // onSelectionChanged={(val) => {
            // 	const selectedObject = val.api.getSelectedRows()[0];
            // 	openModal({
            // 		...annualCheckupModalConfig,
            // 		title: selectedObject.label,
            // 		extraObject: {
            // 			data: selectedObject,
            // 			config: { openInReadOnlyMode: true },
            // 		},
            // 	});
            // }}
            rowSelection="single"
          />
        </div>
      </div>
    </>
  );
};

export default Offer;
