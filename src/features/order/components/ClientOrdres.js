import React, { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { CiGps } from 'react-icons/ci';

import { classNames } from '../../../components/Common/UtilsClassNames';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import { enableScroll } from '../../../utils/functions/preventAndAllowScroll';
import {
  COMMANDE_NUMBERS_VS_STATUS_CODE,
  AG_GRID_DEFAULT_COL_DEF,
  MODAL_BODY_TYPES,
  COMMANDE_STATUS_CODE_VS_NUMBERS
} from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';
import { openModal } from '../../common/modalSlice';
import { setFilters, setPaginationCurrentPage } from '../../common/ordersTableSlice';
import { setOrderStatus } from '../orderSlice';

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

const ClientOrdres = ({ onLoad, gridOptions, gridRef, setShowSelectedMap }) => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.order);
  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.ordersTable
  );

  const [cancelOrder, setCancelOrder] = useState(false);
  const [isLastPageLoaded, setIsLastPageLoaded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({});

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

  const onChangeStatusClicked = async (data) => {
    const status =
      data?.commande_commande_statuses[data?.commande_commande_statuses?.length - 1]
        ?.commande_status?.code;
    if (COMMANDE_STATUS_CODE_VS_NUMBERS[status] >= 5) return;
    if (COMMANDE_STATUS_CODE_VS_NUMBERS[status] === 2) {
      dispatch(
        openModal({
          title: 'Choose the livreur',
          extraObject: { orderId: data?.id },
          bodyType: MODAL_BODY_TYPES.ASSIGN_LIVREUR
        })
      );
    } else {
      await dispatch(setOrderStatus({ commandId: data.id })).then(async (response) => {
        if (response?.error) {
          dispatch(
            showNotification({
              message: 'Error while changing the order status',
              status: 0
            })
          );
        } else {
          dispatch(
            showNotification({
              message: 'Succefully changed the order status',
              status: 1
            })
          );
        }
      });
    }
  };

  const onCancelClicked = async (data) => {
    setCancelOrder((_) => true);
    setSelectedOrder((_) => {
      return { ...data };
    });
  };

  const onPositionClicked = async (data) => {
    dispatch(
      openModal({
        title: 'Position',
        extraObject: { order: { ...data } },
        bodyType: MODAL_BODY_TYPES.ORDER_POSITION,
        size: 'max'
      })
    );
  };

  const columnDefs = useMemo(() => [
    {
      field: 'id',
      headerName: 'Command ID',
      width: 110,
      pinned: true,
      filterParams: containFilterParams,
      valueGetter: ({ data }) => {
        return data?.id + '';
      },
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
      valueGetter: ({ data }) => {
        const livreur = data?.livreur;
        return livreur
          ? livreur?.last_name + ' ' + livreur?.first_name + ' ' + livreur?.client?.phone_number
          : '';
      },
      field: 'livreur',
      headerName: 'Livreur',
      width: 170,
      filterParams: containFilterParams,
      onCellClicked: (params) => onChangeLivreur(params.data),
      cellRenderer: ({ value, data }) => {
        return (
          <div className="grid grid-row-2 text-xs font-semibold hover:cursor-pointer">
            <p className={classNames('p-1 uppercase leading-wide')}>
              {`${data?.livreur?.last_name ? data?.livreur?.last_name : ''} ${
                data?.livreur?.first_name ? data?.livreur?.first_name : ''
              }`}
            </p>
            <p className={classNames('p-1 uppercase leading-wide')}>
              {`${
                data?.livreur?.client?.phone_number ? data?.livreur?.client?.phone_number : 'N/A'
              }`}
            </p>
          </div>
        );
      }
    },
    {
      field: 'total',
      headerName: 'Total Paid',
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
      field: 'service_fee',
      headerName: 'Service Fee',
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
      headerName: 'Status',
      field: 'commande_commande_statuses',
      width: 130,
      valueGetter: ({ data }) => {
        const status =
          data?.commande_commande_statuses[data?.commande_commande_statuses?.length - 1]
            ?.commande_status?.code;
        return status;
      },
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <span
            className={classNames(
              'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3',
              value === 'PENDING'
                ? 'bg-lime-100 text-lime-700'
                : value === 'REGISTERED'
                ? 'bg-yellow-100 text-yellow-700'
                : value === 'INPROCESS'
                ? 'bg-blue-100 text-blue-700'
                : value === 'INDELIVERY'
                ? 'bg-orange-100 text-orange-700'
                : value === 'DELIVERED'
                ? 'bg-green-100 text-green-700'
                : value === 'CANCELED'
                ? 'bg-red-100 text-red-700'
                : null
            )}>
            {value}
          </span>
        );
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
      field: 'merchant.client.phone_number',
      headerName: 'Merchant Number',
      width: 150,
      hide: true,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1 uppercase leading-wide font-bold')}>{value}</p>;
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
      headerName: 'Action',
      field: 'commande_commande_statuses',
      valueGetter: ({ data }) => {
        const status =
          data?.commande_commande_statuses[data?.commande_commande_statuses?.length - 1]
            ?.commande_status?.code;

        return COMMANDE_STATUS_CODE_VS_NUMBERS[status] >= 5
          ? status
          : COMMANDE_NUMBERS_VS_STATUS_CODE[(COMMANDE_STATUS_CODE_VS_NUMBERS[status] || 0) + 1]; // Adjust this based on your actual structure
      },
      width: 130,
      pinned: 'right',
      onCellClicked: (params) => onChangeStatusClicked(params.data),
      cellRenderer: ({ value }) => {
        // const status = value[value?.length - 1]?.commande_status?.code;
        if (COMMANDE_STATUS_CODE_VS_NUMBERS[value] >= 5)
          return (
            <span
              className={classNames(
                'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3'
              )}>
              {value}
            </span>
          );
        return <button className="btn btn-outline btn-xs btn-primary"> {value}</button>;
      }
    },
    {
      field: 'code',
      valueGetter: ({ data }) => {
        const status =
          data?.commande_commande_statuses[data?.commande_commande_statuses?.length - 1]
            ?.commande_status?.code;
        return status; // Adjust this based on your actual structure
      },
      headerName: 'Cancel',
      width: 110,
      pinned: 'right',
      onCellClicked: (params) => onCancelClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center ">
            {value === 'CANCELED' || value === 'DELIVERED' ? (
              <span className="px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3">
                N/A
              </span>
            ) : (
              <button className="btn btn-outline btn-xs btn-error mt-2">X</button>
            )}
          </div>
        );
      }
    },
    {
      field: 'updated_at',
      headerName: 'Position',
      width: 110,
      pinned: 'right',
      onCellClicked: (params) => onPositionClicked(params.data),
      cellRenderer: (_) => {
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

  const handleResize = () => {
    if (gridRef.current && gridRef.current.api) {
      if (window.innerWidth < 576) {
        // Screen size for 'sm' is generally <576px
        gridOptions.columnApi.setColumnsVisible(
          [
            'client.phone_number',
            'balance_share',
            'bonus_share',
            'service_fee',
            'total_articles',
            'payment_method',
            'created_at',
            'updated_at',
            'code',
            'commande_commande_statuses'
          ],
          false
        );
      } else {
        gridOptions.columnApi.setColumnsVisible(
          [
            'client.phone_number',
            'balance_share',
            'bonus_share',
            'service_fee',
            'total_articles',
            'payment_method',
            'created_at',
            'updated_at',
            'code',
            'commande_commande_statuses'
          ],
          true
        );
      }
    }
  };
  //
  // useEffect(() => {
  //   console.log('IN HERE');
  //   window.addEventListener('resize', handleResize);
  //   handleResize();
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

  return (
    <div>
      <div className="overflow-hidden mt-3">
        {!isLoading && (
          <>
            <div
              className={`${cancelOrder ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
              <div className="modal-box">
                <h3 className="font-bold text-lg">
                  Are you sure you want to the order with ID:{' '}
                  <span className="text-primary">{selectedOrder?.id}</span>?
                </h3>

                <div className="">
                  <div className="divider">Information</div>
                  <p>
                    ID:{' '}
                    <span className="text-primary font-semibold lowercase">
                      {selectedOrder?.id}
                    </span>
                  </p>
                  <p>
                    Client:{' '}
                    <span className="text-primary font-semibold lowercase">
                      {selectedOrder?.client?.phone_number}
                    </span>
                  </p>
                  <p>
                    Merchant Name:{' '}
                    <span className="text-primary font-semibold lowercase">
                      {selectedOrder?.merchant?.name}
                    </span>
                  </p>
                  <p>
                    Merchant Name:{' '}
                    <span className="text-primary font-semibold lowercase">
                      {selectedOrder?.merchant?.client?.phone_number ||
                        selectedOrder?.merchant?.whatsapp}
                    </span>
                  </p>
                </div>
                <div className="divider">Actions</div>
                <div className="modal-action">
                  <button
                    className="btn btn-sm btn-outline btn-primary"
                    onClick={() => {
                      enableScroll();
                      setCancelOrder((_) => false);
                      setSelectedOrder((_) => {});
                    }}>
                    No, Cancel Action
                  </button>
                  <button
                    className="btn btn-sm btn-outline btn-secondary"
                    onClick={async () => {
                      const status =
                        selectedOrder.commande_commande_statuses[
                          selectedOrder.commande_commande_statuses?.length - 1
                        ]?.commande_status?.code;
                      if (status === 'CANCELED' || status === 'DELIVERED') {
                        enableScroll();
                        setCancelOrder((_) => false);
                        setSelectedOrder((_) => {});
                        return;
                      }
                      await dispatch(
                        setOrderStatus({
                          commandId: selectedOrder.id,
                          isDelete: true
                        })
                      ).then(async (response) => {
                        if (response?.error) {
                          dispatch(
                            showNotification({
                              message: 'Error while changing the order status',
                              status: 0
                            })
                          );
                        } else {
                          dispatch(
                            showNotification({
                              message: 'Succefully changed the order status',
                              status: 1
                            })
                          );
                          enableScroll();
                          setCancelOrder((_) => false);
                          setSelectedOrder((_) => {});
                        }
                      });
                    }}>
                    PROCEED
                  </button>
                </div>
              </div>
            </div>

            <div className="ag-theme-alpine">
              <AgGridReact
                ref={gridRef}
                gridOptions={gridOptions}
                columnDefs={columnDefs}
                rowData={orders}
                defaultColDef={AG_GRID_DEFAULT_COL_DEF}
                pagination={true}
                rowHeight={50}
                suppressRowDeselection={false}
                paginationPageSize={paginationSize || 20}
                onPaginationChanged={async (params) => {
                  adjustGridHeight(params.api);
                  let currentPage = params.api.paginationGetCurrentPage();
                  let totalPages = params.api.paginationGetTotalPages();
                  await dispatch(
                    setPaginationCurrentPage({
                      paginationCurrentPage: currentPage
                    })
                  );

                  if (currentPage === totalPages - 1 && !isLastPageLoaded) {
                    setIsLastPageLoaded(true); // Set a flag to indicate the last page is loaded
                    await onLoad();
                  } else if (currentPage < totalPages - 1) {
                    setIsLastPageLoaded(false); // Reset the flag when not on the last page
                  }
                  // if (currentPage === totalPages - 1 && currentPage !== 0) {
                  //   await onLoad();
                  // }
                }}
                onFirstDataRendered={(params) => {
                  adjustGridHeight(params.api);
                  handleResize();
                  if (paginationCurrentPage !== null) {
                    params.api.paginationGoToPage(paginationCurrentPage);
                  }
                  params.api.setFilterModel(filters);
                }}
                // onFirstDataRendered={(params) => {
                //   adjustGridHeight(params.api);
                //   params.api.paginationGoToPage(
                //     paginationCurrentPage !== null
                //       ? paginationCurrentPage
                //       : params.api.paginationGetCurrentPage()
                //   );
                //   params.api.setFilterModel(filters);
                // }}
                onFilterChanged={async (params) => {
                  await dispatch(
                    setFilters({
                      filters: params?.api?.getFilterModel() || {}
                    })
                  );
                }}
                onSelectionChanged={(val) => {
                  adjustGridHeight(val.api); // Adjust height
                  setShowSelectedMap((_) => [...val.api.getSelectedRows()]);
                }}
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
