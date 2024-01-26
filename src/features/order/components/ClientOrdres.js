import React, { useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { CiGps } from 'react-icons/ci';
import { FiXCircle, FiCheckCircle } from 'react-icons/fi'; // Import React Icon

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

/**
 * Configuration object for a 'contains' type filter used in data grids or tables.
 * This object specifies the filtering options and behavior for text-based filtering.
 */
const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

// Common filter parameters for columns
const commonFilterParams = containFilterParams;

// Generic cell renderer for text values
const textCellRenderer = ({ value }) => (
  <p className="px-3 py-1 uppercase leading-wide font-bold">{value}</p>
);

// Value getter for livreur column
const getLivreurValue = (data) => {
  const livreur = data?.livreur;
  return livreur ? `${livreur.last_name} ${livreur.first_name} ${livreur.client.phone_number}` : '';
};

/**
 * Converts an order status to a corresponding set of CSS class names for styling.
 * This function is used to apply different background and text colors based on the
 * order's current status.
 *
 * @param {string} status - The status code of the order.
 * @returns {string} The CSS class names to apply for the given status.
 */
const statusToColorClass = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-lime-100 text-lime-700';
    case 'REGISTERED':
      return 'bg-yellow-100 text-yellow-700';
    case 'INPROCESS':
      return 'bg-blue-100 text-blue-700';
    case 'INDELIVERY':
      return 'bg-orange-100 text-orange-700';
    case 'DELIVERED':
      return 'bg-green-100 text-green-700';
    case 'CANCELED':
      return 'bg-red-100 text-red-700';
    // Add additional cases for other statuses if necessary
    default:
      return 'bg-gray-100 text-gray-700'; // Default styling for undefined statuses
  }
};

const statusToButtonClass = (status) => {
  if (COMMANDE_STATUS_CODE_VS_NUMBERS[status] >= 5) {
    return 'btn-outline'; // Non-interactive appearance
  }
  return 'btn-primary'; // Interactive appearance
};

/**
 * Component to render and manage a grid of client orders.
 * It provides functionality to view order details, change the delivery person (livreur),
 * update the status of orders, and handle order cancellations and positions.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onLoad - Function to call when the component loads.
 * @param {Object} props.gridOptions - Configuration options for the grid.
 * @param {Object} props.gridRef - Reference to the grid component.
 * @param {Function} props.setShowSelectedMap - Function to update the state of selected map.
 */
const ClientOrdres = ({ onLoad, gridOptions, gridRef, setShowSelectedMap }) => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.order);
  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.ordersTable
  );

  // State to manage order cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  // State to track if the last page of data is loaded
  const [isLastPageLoaded, setIsLastPageLoaded] = useState(false);
  // State to hold the selected order
  const [selectedOrder, setSelectedOrder] = useState({});

  /**
   * Dispatches an action to open a modal displaying details of the selected order.
   *
   * @param {Object} data - Data of the selected order.
   */
  const onDetailsClicked = ({ data }) => {
    dispatch(
      openModal({
        title: 'Order Details',
        size: 'lg',
        extraObject: data,
        bodyType: MODAL_BODY_TYPES.ORDERS_DETAILS
      })
    );
  };

  /**
   * Handles the change of the delivery person (livreur) for an order.
   * Opens a modal to select a new livreur if the order status allows for it.
   *
   * @param {Object} data - Data of the selected order, containing status and other details.
   */
  const onChangeLivreur = ({ data }) => {
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

  /**
   * Updates the status of an order. If the order status allows, it opens a modal
   * to assign a livreur. Otherwise, it directly changes the order status and displays
   * a notification based on the success or failure of the operation.
   *
   * @param {Object} data - Data of the selected order, containing status and other details.
   */
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
      const response = await dispatch(setOrderStatus({ commandId: data.id }));
      if (response?.error) {
        dispatch(showNotification({ message: 'Error while changing the order status', status: 0 }));
      } else {
        dispatch(showNotification({ message: 'Successfully changed the order status', status: 1 }));
      }
    }
  };

  /**
   * Sets the state to indicate that an order is being cancelled and stores the selected
   * order data in the state.
   *
   * @param {Object} data - Data of the order to be cancelled.
   */
  const onCancelClicked = async (data) => {
    setShowCancelModal(() => true);
    setSelectedOrder(() => data);
  };

  /**
   * Dispatches an action to open a modal displaying the position of the selected order.
   *
   * @param {Object} data - Data of the selected order.
   */
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

  const columnDefs = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'Command ID',
        width: 110,
        pinned: true,
        filterParams: commonFilterParams,
        valueGetter: ({ data }) => data?.id?.toString(),
        cellRenderer: ({ value }) => (
          <p className="px-3 py-1 uppercase leading-wide font-bold text-primary">{value}</p>
        )
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 200,
        pinned: 'left',
        cellRenderer: ({ data }) => {
          const status =
            data?.commande_commande_statuses[data?.commande_commande_statuses?.length - 1]
              ?.commande_status?.code;
          const isCancelable = status !== 'CANCELED' && status !== 'DELIVERED';

          return (
            <div className="flex items-center justify-between space-x-2 pl-2 mt-2">
              <button
                className={`btn btn-outline btn-xs ${statusToButtonClass(status)}`}
                onClick={() => onChangeStatusClicked(data)}
                disabled={COMMANDE_STATUS_CODE_VS_NUMBERS[status] >= 5}>
                {COMMANDE_STATUS_CODE_VS_NUMBERS[status] < 5 ? 'Change Status' : status}
              </button>

              {isCancelable && (
                <button
                  className="btn btn-xs btn-ghost text-red-500 hover:text-red-700 end"
                  onClick={() => onCancelClicked(data)}>
                  <FiXCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          );
        }
      },
      {
        field: 'updated_at',
        headerName: 'Position',
        width: 90,
        pinned: true,
        onCellClicked: (params) => onPositionClicked(params.data),
        cellRenderer: (_) => {
          return (
            <div className="flex items-center justify-center ">
              <button className="btn btn-outline btn-ghost btn-sm mt-2">
                <CiGps className="w-5 h-5" />
              </button>
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
        onCellClicked: onDetailsClicked,
        cellRenderer: ({ value }) => (
          // Custom rendering based on status value
          <span className={`badge badge-outline ${statusToColorClass(value)}`}>
            {/*<span*/}
            {/*  className={`px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3 ${statusToColorClass(*/}
            {/*    value*/}
            {/*  )}`}>*/}
            {value}
          </span>
        )
      },
      {
        field: 'merchant.name',
        headerName: 'Merchant Name',
        width: 170,
        filterParams: commonFilterParams,
        onCellClicked: onDetailsClicked,
        cellRenderer: textCellRenderer
      },
      {
        field: 'client.phone_number',
        headerName: 'Client',
        width: 150,
        filterParams: commonFilterParams,
        onCellClicked: onDetailsClicked,
        cellRenderer: textCellRenderer
      },
      {
        field: 'livreur',
        headerName: 'Livreur',
        width: 170,
        filterParams: commonFilterParams,
        valueGetter: ({ data }) => getLivreurValue(data),
        onCellClicked: onChangeLivreur,
        cellRenderer: textCellRenderer
      },
      {
        field: 'total',
        headerName: 'Total Paid',
        width: 120,
        filterParams: 'agNumberColumnFilter',
        onCellClicked: onDetailsClicked,
        cellRenderer: ({ value }) => (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || 'N/A'}
          </div>
        )
      },
      {
        field: 'balance_share',
        headerName: 'Balance Share',
        width: 120,
        filterParams: 'agNumberColumnFilter',
        onCellClicked: onDetailsClicked,
        cellRenderer: ({ value }) => (
          <div className="flex items-center justify-center font-semibold">{parseInt(value)}</div>
        )
      },
      {
        field: 'bonus_share',
        headerName: 'Bonus Share',
        width: 120,
        filterParams: 'agNumberColumnFilter',
        onCellClicked: onDetailsClicked,
        cellRenderer: ({ value }) => (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || 'N/A'}
          </div>
        )
      },
      {
        field: 'service_fee',
        headerName: 'Service Fee',
        width: 120,
        filterParams: 'agNumberColumnFilter',
        onCellClicked: onDetailsClicked,
        cellRenderer: ({ value }) => (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || 'N/A'}
          </div>
        )
      },
      {
        field: 'total_articles',
        headerName: 'Total Article',
        width: 120,
        filterParams: 'agNumberColumnFilter',
        onCellClicked: onDetailsClicked,
        cellRenderer: ({ value }) => (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || 'N/A'}
          </div>
        )
      },

      {
        field: 'payment_method',
        headerName: 'Payment Method',
        width: 120,
        filterParams: containFilterParams,
        onCellClicked: onDetailsClicked,
        cellRenderer: ({ value }) => {
          return <div className="flex items-center justify-center font-semibold">{value}</div>;
        }
      },
      {
        field: 'created_at',
        headerName: 'Registration Date',
        width: 130,
        filter: 'agDateColumnFilter',
        onCellClicked: onDetailsClicked,
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
      }
    ],
    [commonFilterParams, onDetailsClicked, onChangeLivreur]
  );

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
            'code'
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
            'code'
          ],
          true
        );
      }
    }
  };

  const closeModal = () => {
    setShowCancelModal(false);
    setSelectedOrder({});
  };

  const proceedCancelOrder = async () => {
    const status =
      selectedOrder.commande_commande_statuses[selectedOrder.commande_commande_statuses.length - 1]
        ?.commande_status?.code;

    // Proceed only if the order is not already canceled or delivered
    if (status === 'CANCELED' || status === 'DELIVERED') {
      closeModal();
      return;
    }

    // Dispatch action to cancel the order
    const response = await dispatch(
      setOrderStatus({
        commandId: selectedOrder.id,
        isDelete: true
      })
    );

    // Handle response
    if (response?.error) {
      dispatch(showNotification({ message: 'Error while changing the order status', status: 0 }));
    } else {
      dispatch(showNotification({ message: 'Successfully changed the order status', status: 1 }));
    }

    // Close modal after action
    closeModal();
  };

  return (
    <div>
      <div className="overflow-hidden mt-3">
        {!isLoading && (
          <>
            <CancelOrderModal
              isVisible={showCancelModal}
              order={selectedOrder}
              onCancel={closeModal}
              onProceed={proceedCancelOrder}
            />

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
                }}
                onFirstDataRendered={(params) => {
                  adjustGridHeight(params.api);
                  handleResize();
                  if (paginationCurrentPage !== null) {
                    params.api.paginationGoToPage(paginationCurrentPage);
                  }
                  params.api.setFilterModel(filters);
                }}
                onFilterChanged={async (params) => {
                  await dispatch(
                    setFilters({
                      filters: params?.api?.getFilterModel() || {}
                    })
                  );
                }}
                onSelectionChanged={(val) => {
                  adjustGridHeight(val.api); // Adjust height
                  setShowSelectedMap(() => [...val.api.getSelectedRows()]);
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

/**
 * Modal component to confirm the cancellation of an order.
 *
 * @param {{
 *   isVisible: boolean,
 *   onCancel: Function,
 *   order: Object,
 *   onProceed: Function
 * }} props
 */
const CancelOrderModal = ({ isVisible, order, onCancel, onProceed }) => {
  if (!isVisible) return null;

  return (
    <div className={`${isVisible ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
      <div className="modal-box bg-white shadow-xl border border-gray-200 rounded-lg">
        <h3 className="font-bold text-lg text-gray-800">Confirm Cancellation</h3>
        <p className="text-sm text-gray-600 my-3">
          You are about to cancel the order with ID:{' '}
          <span className="font-semibold text-blue-600">{order?.id}</span>
        </p>

        {/* Order Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="mb-2 text-gray-700">
            <strong>ID:</strong> <span className="text-blue-500">{order?.id}</span>
          </p>
          <p className="mb-2 text-gray-700">
            <strong>Client:</strong>{' '}
            <span className="text-blue-500">{order?.client?.phone_number}</span>
          </p>
          <p className="mb-2 text-gray-700">
            <strong>Merchant:</strong>{' '}
            <span className="text-blue-500">{order?.merchant?.name}</span>
          </p>
          <p className="mb-2 text-gray-700">
            <strong>Contact:</strong>{' '}
            <span className="text-blue-500">
              {order?.merchant?.client?.phone_number || order?.merchant?.whatsapp}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button
            className="btn btn-outline btn-accent btn-sm flex items-center"
            onClick={onProceed}>
            <FiCheckCircle className="mr-2" /> Confirm
          </button>
          <button className="btn btn-outline btn-ghost btn-sm flex items-center" onClick={onCancel}>
            <FiXCircle className="mr-2" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
