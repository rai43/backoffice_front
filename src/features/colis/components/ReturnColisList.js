import React, { useMemo, useRef } from 'react';

import { AgGridReact } from 'ag-grid-react';
import moment from 'moment/moment';
import { useDispatch, useSelector } from 'react-redux';

import { CiEdit } from 'react-icons/ci';
import { GiCardExchange } from 'react-icons/gi';

import { classNames } from '../../../components/Common/UtilsClassNames';
import { STATUS_ACTIONS } from '../../../utils/colisUtils';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';
import { openModal } from '../../common/modalSlice';
import {
  setFilters,
  setPaginationCurrentPage
} from '../../common/returnParcelsManagementTableSlice';

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

const ReturnColisList = ({ gridOptions }) => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);

  const { returnedColis } = useSelector((state) => state.parcelsManagement);

  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.returnParcelsManagementTable
  );

  const onColumnClicked = async (data) => {
    dispatch(
      openModal({
        title: 'PARCEL DETAIL VIEW',
        size: 'max',
        bodyType: MODAL_BODY_TYPES.COLIS_DETAILS,
        extraObject: { colis: data }
      })
    );
  };

  const onStatusChangeClicked = async ({ data, value }) => {
    if (STATUS_ACTIONS[value]) {
      dispatch(
        openModal({
          title: 'CHANGE PARCEL STATUS',
          size: 'max', //'lg',
          bodyType: MODAL_BODY_TYPES.COLIS_CHANGE_STATUS,
          extraObject: { colis: data }
        })
      );
    } else {
      dispatch(
        showNotification({
          message: 'No Action Possible',
          status: 0
        })
      );
    }
  };

  const onEditClicked = async ({ data }) => {
    dispatch(
      openModal({
        title: 'MERCHANT PAYMENT',
        size: 'max',
        bodyType: MODAL_BODY_TYPES.COLIS_ADD_OR_EDIT,
        extraObject: { colis: data, edit: true }
      })
    );
  };

  const columnDefs = useMemo(() => [
    {
      field: 'code',
      valueGetter: ({ data }) => {
        return data?.code + '';
      },
      headerName: 'Code',
      width: 80,
      pinned: true,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className={classNames('py-1 uppercase leading-wide font-bold')}>{value}</p>;
      }
    },
    {
      field: 'pickup_longitude',
      valueGetter: ({ data }) => {
        return data?.colis_statuses?.length
          ? data?.colis_statuses[
              data?.colis_statuses?.length - 1
            ]?.colis_status?.code?.toUpperCase()
          : 'N/A';
      },
      headerName: 'Status',
      width: 80,
      // filter: containFilterParams,
      pinned: 'left',
      onCellClicked: (params) =>
        onStatusChangeClicked({
          data: params.data,
          value: params?.data?.colis_statuses?.length
            ? params?.data?.colis_statuses[
                params?.data?.colis_statuses?.length - 1
              ]?.colis_status?.code?.toUpperCase()
            : 'N/A'
        }),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center ">
            {STATUS_ACTIONS[value] ? (
              <span className="text-gray-600 mt-2">
                <GiCardExchange className={'h-6 w-6'} />
              </span>
            ) : (
              <span className="px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3">
                N/A
              </span>
            )}
          </div>
        );
      }
    },
    {
      field: 'pickup_longitude',
      valueGetter: ({ data }) => {
        return data?.colis_statuses?.length
          ? data?.colis_statuses[
              data?.colis_statuses?.length - 1
            ]?.colis_status?.code?.toUpperCase()
          : 'N/A';
      },
      headerName: 'Edit',
      width: 80,
      // filter: containFilterParams,
      pinned: 'left',
      onCellClicked: ({ data }) =>
        onEditClicked({
          data: data
        }),
      cellRenderer: () => {
        return (
          <div className="flex items-center justify-center ">
            <span className="text-gray-600 mt-2">
              <CiEdit className={'h-6 w-6 text-error'} />
            </span>
          </div>
        );
      }
    },
    {
      field: 'delivery_longitude',
      valueGetter: ({ data }) => {
        return data?.colis_statuses?.length
          ? data?.colis_statuses[data?.colis_statuses?.length - 1]?.colis_status?.code
              ?.toUpperCase()
              ?.replaceAll('_', ' ')
          : 'N/A';
      },
      headerName: 'Current Status',
      width: 140,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        let textColor = 'text-primary'; // Default background color

        switch (value) {
          case 'DELIVERED':
            textColor = 'teal-500'; // Teal for a pleasant, successful delivery
            break;
          case 'NOT DELIVERED':
            textColor = 'amber-600'; // Amber for attention, slightly different from orange
            break;
          case 'NOT COLLECTED':
            textColor = 'orange-700'; // Dark orange for a standout warning
            break;
          case 'CANCELED':
            textColor = 'red-600'; // Crimson red for a clear negative outcome
            break;
          case 'RETURNED':
            textColor = 'lime-600'; // Lime for an energetic, alerting return
            break;
          case 'REFUSED':
            textColor = 'rose-600'; // Rose for a softer yet distinct negative response
            break;
          case 'ARTICLE TO RETURN':
            textColor = 'cyan-600'; // Cyan for a cool, noticeable action needed
            break;
          case 'LOST':
            textColor = 'purple-700'; // Deep purple for a serious, unusual event like loss
            break;
          case 'PENDING':
            textColor = 'blue-500'; // Bright blue for a clear in-progress status
            break;
          case 'REGISTERED':
            textColor = 'indigo-400'; // Indigo for a calm, neutral starting phase
            break;
          default:
            textColor = 'gray-500'; // Gray for an unobtrusive default
            break;
        }

        return (
          <span
            className={`px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm shadow-gray-600 text-${textColor} mt-3`}>
            {value}
          </span>
        );
      }
    },
    {
      field: 'client.phone_number',
      headerName: 'Merchant',
      width: 140,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p className="uppercase font-semibold text-primary break-all overflow-hidden">{value}</p>
        );
      }
    },
    {
      field: 'pickup_address_name',
      headerName: 'From',
      width: 160,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value}</p>;
      }
    },
    {
      field: 'pickup_phone_number',
      headerName: 'Pickup Phone Number',
      width: 160,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase font-semibold break-all overflow-hidden">{value}</p>;
      }
    },
    {
      field: 'delivery_address_name',
      headerName: 'To',
      width: 160,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value}</p>;
      }
    },
    {
      field: 'delivery_phone_number',
      headerName: 'Delivery Phone Number',
      width: 160,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase font-semibold break-all overflow-hidden">{value}</p>;
      }
    },
    {
      field: 'fee_paid_by',
      valueGetter: ({ data }) => {
        return (
          parseInt(
            data?.fee_payment === 'PREPAID'
              ? data?.price
              : (data?.price ? parseInt(data?.price) : 0) + parseInt(data?.fee)
          ) + ''
        );
      },
      headerName: 'To Collect',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p
            className={`uppercase font-semibold ${
              value === 'SENDER' ? 'text-primary' : 'text-secondary'
            } break-all overflow-hidden`}>
            {value}
          </p>
        );
      }
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p className="uppercase font-semibold break-all overflow-hidden">{parseInt(value)}</p>
        );
      }
    },
    {
      field: 'fee',
      headerName: 'Fee',
      width: 100,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p className="uppercase font-semibold break-all overflow-hidden">{parseInt(value)}</p>
        );
      }
    },
    {
      field: 'pickup_date',
      headerName: 'Pickup Date',
      width: 130,
      filter: 'agDateColumnFilter',
      // pinned: "right",
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        let formattedValue = value ? value : 'N/A';

        if (formattedValue !== 'N/A') {
          formattedValue = moment.utc(value).format('DD/MM/YYYY');
        }

        return (
          <p>
            <span className=" text-sm mr-2">{value ? formattedValue : ''}</span>
          </p>
        );
      }
    },
    {
      field: 'pickup_latitude',
      valueGetter: ({ data }) => {
        return data?.pickup_livreur?.first_name
          ? data?.pickup_livreur?.client?.phone_number +
              (data?.pickup_livreur?.first_name + ' ' + data?.pickup_livreur?.last_name)
          : '';
      },
      headerName: 'Pickup Livreur',
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ data }) => {
        const PHONE_NUMBER = data?.pickup_livreur?.first_name
          ? data?.pickup_livreur?.client?.phone_number
          : '';
        const last_name = data?.pickup_livreur?.first_name;
        const first_name = data?.pickup_livreur?.last_name;
        return (
          <div className="flex items-center cursor-pointer">
            <div className="ml-4 text-sm">
              <div className="font-medium text-gray-900">{PHONE_NUMBER}</div>
              <div className={`text-gray-500`}>
                {data?.pickup_livreur?.first_name
                  ? first_name?.toUpperCase() + ' ' + last_name?.toUpperCase()
                  : ''}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      field: 'delivery_date',
      headerName: 'Delivery Date',
      width: 130,
      filter: 'agDateColumnFilter',
      // pinned: "right",
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        let formattedValue = value ? value : 'N/A';

        if (formattedValue !== 'N/A') {
          formattedValue = moment.utc(value).format('DD/MM/YYYY');
        }

        return (
          <div className="grid row-span-2 text-xs">
            <p>
              <span className=" text-sm mr-2">{value ? formattedValue : ''}</span>
            </p>
            <span className=" text-sm">{value ? moment.utc(value).format('HH:mm') : ''}</span>
          </div>
        );
      }
    },
    {
      field: 'delivery_latitude',
      valueGetter: ({ data }) => {
        return data?.delivery_livreur?.first_name
          ? data?.delivery_livreur?.client?.phone_number +
              (data?.delivery_livreur?.first_name + ' ' + data?.delivery_livreur?.last_name)
          : '';
      },
      headerName: 'Delivery livreur',
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ data }) => {
        const PHONE_NUMBER = data?.delivery_livreur?.first_name
          ? data?.delivery_livreur?.client?.phone_number
          : '';
        const last_name = data?.delivery_livreur?.first_name;
        const first_name = data?.delivery_livreur?.last_name;
        return (
          <div className="flex items-center cursor-pointer">
            <div className="ml-4 text-sm">
              <div className="font-medium text-gray-900">{PHONE_NUMBER}</div>
              <div className={`text-gray-500`}>
                {data?.delivery_livreur?.first_name
                  ? first_name?.toUpperCase() + ' ' + last_name?.toUpperCase()
                  : ''}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      field: 'created_at',
      headerName: 'Creation',
      width: 130,
      filter: 'agDateColumnFilter',
      // pinned: "right",
      onCellClicked: (params) => onColumnClicked(params.data),
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
  ]);

  return (
    <div className="overflow-hidden mt-2">
      <div className="ag-theme-alpine h-[40rem]">
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={returnedColis}
          defaultColDef={AG_GRID_DEFAULT_COL_DEF}
          gridOptions={gridOptions}
          // defaultColDef={defaultColDef}
          pagination={true}
          rowHeight={50}
          sideBar={'filters'}
          rowSelection="single"
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
          }}
          onFirstDataRendered={(params) => {
            adjustGridHeight(params.api); // Adjust height
            params.api.paginationGoToPage(
              paginationCurrentPage !== null
                ? paginationCurrentPage
                : params.api.paginationGetCurrentPage()
            );
            params.api.setFilterModel(filters);
          }}
          onFilterChanged={async (params) => {
            await dispatch(
              setFilters({
                filters: params?.api?.getFilterModel() || {}
              })
            );
          }}
        />
      </div>
    </div>
  );
};

export default ReturnColisList;
