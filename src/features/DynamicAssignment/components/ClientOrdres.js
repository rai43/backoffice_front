import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { CiGps } from 'react-icons/ci';
import { openModal } from '../../common/modalSlice';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { classNames } from '../../../components/Common/UtilsClassNames';
import moment from 'moment';
import { COMMANDE_NUMBERS_VS_STATUS_CODE } from '../../../utils/globalConstantUtil';
import { COMMANDE_STATUS_CODE_VS_NUMBERS } from '../../../utils/globalConstantUtil';

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

const ClientOrdres = () => {
  const dispatch = useDispatch();
  const gridRef = useRef();
  const { orders, isLoading } = useSelector((state) => state.dynamicAssignment);

  const [showSelectedMap, setShowSelectedMap] = useState([]);

  useEffect(() => {
    localStorage.setItem('currentPage', 0);
  }, []);

  const onDetailsClicked = (data) => {
    dispatch(
      openModal({
        title: 'Order Details',
        size: 'lg',
        extraObject: data,
        bodyType: MODAL_BODY_TYPES.ORDERS_DETAILS
      })
    );
  };

  const onPositionClicked = async (data) => {
    dispatch(
      openModal({
        title: 'Position',
        extraObject: { order: { ...data } },
        bodyType: MODAL_BODY_TYPES.ORDER_POSITION,
        size: 'lg'
      })
    );
  };

  const onChangeLivreur = (data) => {
    const status =
      data?.commande_commande_statuses[data?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code;
    if (
      COMMANDE_STATUS_CODE_VS_NUMBERS[status] > 1 &&
      COMMANDE_STATUS_CODE_VS_NUMBERS[status] < 5
    ) {
      dispatch(
        openModal({
          title: 'Choose the livreur',
          extraObject: { orderId: data?.id, isChangeLivreur: true },
          bodyType: MODAL_BODY_TYPES.ASSIGN_LIVREUR
        })
      );
    }
  };

  const columnDefs = useMemo(() => [
    {
      field: 'id',
      headerName: 'Command ID',
      width: 110,
      pinned: true,
      filterParams: 'agNumberColumnFilter',
      cellRenderer: ({ value }) => {
        return (
          <p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-primary')}>
            {value}
          </p>
        );
      }
    },
    {
      field: 'client.phone_number',
      headerName: 'Client',
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1 uppercase leading-wide font-bold')}>{value}</p>;
      }
    },
    {
      field: 'merchant.name',
      headerName: 'Merchant Name',
      width: 170,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className={classNames('p-1 uppercase leading-wide')}>{value}</p>;
      }
    },
    {
      field: 'merchant.whatsapp',
      headerName: 'Merchant Number',
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1 uppercase leading-wide font-bold')}>{value}</p>;
      }
    },
    {
      field: 'total',
      headerName: 'Total Paid',
      width: 120,
      // filterParams: containFilterParams,
      filterParams: 'agNumberColumnFilter',
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || 'N/A'}
          </div>
        );
      }
    },
    {
      field: 'balance_share',
      headerName: 'Balance Share',
      width: 120,
      filterParams: 'agNumberColumnFilter',
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">{parseInt(value)}</div>
        );
      }
    },
    {
      field: 'bonus_share',
      headerName: 'Bonus Share',
      width: 120,
      filterParams: 'agNumberColumnFilter',
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">{parseInt(value)}</div>
        );
      }
    },
    {
      field: 'delivery_fee',
      headerName: 'Delivery Fee',
      width: 120,
      filterParams: 'agNumberColumnFilter',
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">{parseInt(value)}</div>
        );
      }
    },
    {
      field: 'payment_method',
      headerName: 'Payment Method',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return <div className="flex items-center justify-center font-semibold">{value}</div>;
      }
    },
    {
      field: 'total_articles',
      headerName: 'Total Article',
      width: 120,
      filterParams: 'agNumberColumnFilter',
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || 'N/A'}
          </div>
        );
      }
    },
    {
      field: 'commande_commande_statuses',
      headerName: 'Status',
      width: 130,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        const status = value[value?.length - 1]?.commande_status?.code;
        return (
          <span
            className={classNames(
              'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3',
              status === 'PENDING'
                ? 'bg-lime-100 text-lime-700'
                : status === 'REGISTERED'
                  ? 'bg-yellow-100 text-yellow-700'
                  : status === 'INPROCESS'
                    ? 'bg-blue-100 text-blue-700'
                    : status === 'INDELIVERY'
                      ? 'bg-orange-100 text-orange-700'
                      : status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : status === 'CANCELED'
                          ? 'bg-red-100 text-red-700'
                          : null
            )}
          >
            {status}
          </span>
        );
      }
    },
    {
      field: 'livreur',
      headerName: 'Livreur',
      width: 170,
      filterParams: containFilterParams,
      onCellClicked: (params) => onChangeLivreur(params.data),
      cellRenderer: ({ value, data }) => {
        return (
          <>
            {value && (
              <div className="grid grid-row-2 text-xs font-semibold hover:cursor-pointer">
                <p
                  className={classNames('p-1 uppercase leading-wide')}
                >{`${value?.last_name} ${value?.first_name}`}</p>
                <p className={classNames('p-1 uppercase leading-wide')}>{`${value?.whatsapp}`}</p>
              </div>
            )}
          </>
        );
      }
    },
    {
      field: 'created_at',
      headerName: 'Registration Date',
      width: 130,
      filter: 'agDateColumnFilter',
      onCellClicked: (params) => onDetailsClicked(params.data),
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
      field: 'commande_commande_statuses',
      headerName: 'Position',
      width: 110,
      pinned: 'right',
      onCellClicked: (params) => onPositionClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center ">
            <button className="btn btn-outline btn-ghost btn-sm mt-2">
              <CiGps className="" />
            </button>
          </div>
        );
      }
    }
  ]);

  return (
    <div>
      <div className="overflow-hidden mt-3">
        {!isLoading && (
          <>
            <div className="flex justify-end mb-4 mt-2 gap-5">
              {showSelectedMap?.length ? (
                <div className="flex items-center justify-center">
                  <button
                    className="btn btn-outline btn-secondary btn-sm"
                    onClick={() => {
                      const selectedRows = gridRef.current.api.getSelectedRows();
                      console.log(selectedRows);
                      dispatch(
                        openModal({
                          title: 'Positions',
                          extraObject: {
                            orders: selectedRows,
                            selectedRows: true
                          },
                          bodyType: MODAL_BODY_TYPES.ORDER_POSITION,
                          size: 'lg'
                        })
                      );
                    }}
                  >
                    <CiGps className="mx-2" /> SELECTED POSITIONS
                  </button>
                </div>
              ) : (
                <></>
              )}

              <div className="font-semibold">
                <label>Page Size:</label>
                <select
                  className="mx-3"
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    gridOptions.api.paginationSetPageSize(newSize);
                  }}
                  defaultValue={20}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="ag-theme-alpine h-[40rem] hidden md:block">
              <AgGridReact
                ref={gridRef}
                gridOptions={gridOptions}
                columnDefs={columnDefs}
                rowData={orders}
                defaultColDef={AG_GRID_DEFAULT_COL_DEF}
                pagination={true}
                rowHeight={50}
                paginationPageSize={20}
                paginationPageSizeOptions={[10, 20, 50]}
                suppressRowDeselection={false}
                // onPaginationChanged={async (params) => {
                // 	let currentPage = params.api.paginationGetCurrentPage();
                // 	let totalPages = params.api.paginationGetTotalPages();
                // 	console.log(currentPage, totalPages);
                // 	if (params.newPage) {
                // 		localStorage.setItem('currentPage', JSON.stringify(currentPage));
                // 		localStorage.removeItem('oldPage');
                // 	}
                // 	if (currentPage === totalPages - 1 && currentPage !== 0 && currentPage !== 0) {
                // 		localStorage.setItem('oldPage', JSON.stringify(currentPage));
                // 		await onLoad();
                // 		const pageToNavigate = JSON.parse(localStorage.getItem('oldPage'));
                // 		params.api.paginationGoToPage(pageToNavigate);
                // 	}
                // }}
                // onFirstDataRendered={(params) => {
                // 	const pageToNavigate = JSON.parse(localStorage.getItem('currentPage'));
                // 	const oldPageToNavigate = JSON.parse(localStorage.getItem('oldPage'));
                // 	params.api.paginationGoToPage(oldPageToNavigate ? oldPageToNavigate : pageToNavigate);
                // }}
                // onSelectionChanged={(val) => {
                // 	console.log(val.api.getSelectedRows());
                // 	setShowSelectedMap((_) => [...val.api.getSelectedRows()]);
                // }}
                rowSelection="multiple"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientOrdres;
