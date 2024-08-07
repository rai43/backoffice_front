import React, { useMemo, useRef } from 'react';

import { AgGridReact } from 'ag-grid-react';
import moment from 'moment/moment';
import { useDispatch, useSelector } from 'react-redux';

import { CiEdit, CiNoWaitingSign } from 'react-icons/ci';
import { FaAmazonPay } from 'react-icons/fa';
import { GiCardExchange, GiAirplaneDeparture } from 'react-icons/gi';

import { calculateMontantACollecter } from './PointVersementLivreurContent';
import { classNames } from '../../../components/Common/UtilsClassNames';
import { STATUS_ACTIONS } from '../../../utils/colisUtils';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';
import { openModal } from '../../common/modalSlice';
import { setFilters, setPaginationCurrentPage } from '../../common/parcelsManagementTableSlice';
import parcelsUtils from '../parcels.utils';

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

const ColisList = ({ onLoad, gridOptions }) => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);

  const { colis, isLoading } = useSelector((state) => state.parcelsManagement);

  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.parcelsManagementTable
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

  const onPayMerchantClicked = async ({ data, value }) => {
    if (
      (value === 'DELIVERED' || value === 'LOST' || value === 'DAMAGED') &&
      parseInt(data?.price) > 0 &&
      data?.payment === 'PENDING'
    ) {
      dispatch(
        openModal({
          title: 'MERCHANT PAYMENT',
          size: '',
          bodyType: MODAL_BODY_TYPES.COLIS_PAY_MERCHANT,
          extraObject: { colis: data }
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
    // {
    //   field: 'id',
    //   valueGetter: ({ data }) => {
    //     return data?.id + '';
    //   },
    //   headerName: 'ID',
    //   width: 70,
    //   pinned: true,
    //   filterParams: containFilterParams,
    //   onCellClicked: (params) => onColumnClicked(params.data),
    //   cellRenderer: ({ value }) => {
    //     return <p className={classNames('px-3 py-1 uppercase leading-wide font-bold')}>{value}</p>;
    //   }
    // },
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
          ? data?.colis_statuses[0]?.colis_status?.code?.toUpperCase()
          : 'N/A';
      },
      headerName: 'Status',
      width: 100,
      pinned: 'left',
      onCellClicked: (params) => {
        return onStatusChangeClicked({
          data: params.data,
          value: params?.data?.colis_statuses?.length
            ? params?.data?.colis_statuses[0]?.colis_status?.code?.toUpperCase()
            : 'N/A'
        });
      },
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
          ? data?.colis_statuses[0]?.colis_status?.code?.toUpperCase()
          : 'N/A';
      },
      headerName: 'Pay',
      width: 80,
      pinned: 'left',
      onCellClicked: ({ data }) =>
        onPayMerchantClicked({
          data: data,
          value: data?.colis_statuses?.length
            ? data?.colis_statuses[0]?.colis_status?.code?.toUpperCase()
            : 'N/A'
        }),
      cellRenderer: ({ value, data }) => {
        return (
          <div className="flex items-center justify-center ">
            {(value === 'DELIVERED' || value === 'LOST' || value === 'DAMAGED') &&
            parseInt(data?.price) > 0 &&
            data?.payment === 'PENDING' ? (
              <span className="text-gray-600 mt-2">
                <FaAmazonPay className={'h-6 w-6'} />
              </span>
            ) : (
              <span className="text-gray-600 mt-2">-</span>
            )}
          </div>
        );
      }
    },
    {
      field: 'pickup_longitude',
      valueGetter: ({ data }) => {
        return data?.colis_statuses?.length
          ? data?.colis_statuses[0]?.colis_status?.code?.toUpperCase()
          : // data?.colis_statuses?.length - 1
            'N/A';
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
      field: 'expedition_fee',
      headerName: 'Expedition',
      width: 80,
      // filter: containFilterParams,
      pinned: 'left',
      cellRenderer: ({ value }) => {
        if (!value || parseInt(value) === 0) return;
        return (
          <div className="flex items-center justify-center ">
            <span className="text-gray-600 mt-2">
              <GiAirplaneDeparture className={'h-6 w-6 text-neutral'} />
            </span>
          </div>
        );
      }
    },
    {
      field: 'delivery_longitude',
      valueGetter: ({ data }) => {
        // const assignment = parcelsUtils.findOngoingAssignment(data);
        // let status = assignment?.colis_status;
        //
        // if (
        //   !assignment &&
        //   (data?.status?.colis_status?.code === 'PENDING' ||
        //     data?.status?.colis_status?.code === 'CANCELED')
        // ) {
        //   status = data.status;
        //   console.log({ assignment, status, sta: data?.status?.colis_status });
        // }
        //
        // return status
        //   ? status?.colis_status?.code?.toUpperCase()?.replaceAll('_', ' ')
        //   : data?.colis_assignment?.length
        //   ? data?.colis_assignment
        //       ?.slice()
        //       .sort((a, b) => b.id - a.id)[0]
        //       ?.colis_status?.colis_status?.code?.toUpperCase()
        //       ?.replaceAll('_', ' ')
        //   : 'N/A';
        return data?.status
          ? data?.status?.colis_status?.code?.toUpperCase()?.replaceAll('_', ' ')
          : 'N/A';
      },
      headerName: 'Current Status',
      width: 230,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        let textColor = 'text-gray-500'; // Default color

        const statusColorMap = {
          // Collection Process
          PENDING: 'text-blue-500',
          REGISTERED: 'text-indigo-400',
          ASSIGNED_FOR_COLLECTION: 'text-blue-300',
          COLLECTION_IN_PROGRESS: 'text-indigo-300',

          // Collection Outcomes
          COLLECTED: 'text-green-500',
          NOT_COLLECTED: 'text-orange-700',

          // Warehouse and Delivery Assignment
          WAREHOUSED: 'text-gray-500',
          ASSIGNED_FOR_DELIVERY: 'text-yellow-500',
          WAITING_FOR_DELIVERY: 'text-yellow-400',
          DELIVERY_IN_PROGRESS: 'text-amber-500',

          // Delivery Outcomes
          DELIVERED: 'text-green-600',
          NOT_DELIVERED: 'text-red-600',
          POSTPONED: 'text-lime-600',
          REFUSED: 'text-rose-600',

          // Return Process
          ARTICLE_TO_RETURN: 'text-cyan-600',
          ASSIGNED_FOR_RETURN: 'text-cyan-500',
          WAITING_FOR_RETURN: 'text-cyan-400',
          RETURN_IN_PROGRESS: 'text-cyan-300',
          RETURNED: 'text-cyan-200',
          NOT_RETURNED: 'text-cyan-700',

          // Special Cases
          CANCELED: 'text-pink-600',
          LOST: 'text-purple-700',
          REFUNDED: 'text-purple-500',
          DAMAGED: 'text-red-700'
        };

        // Assigning text color based on value
        textColor = statusColorMap[value?.toUpperCase().replaceAll(' ', '_')] || textColor;

        return (
          <span
            className={`px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm shadow-gray-600 ${textColor} mt-3`}>
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
      valueGetter: ({ data }) => {
        return data?.pickup_address
          ? data?.pickup_address?.description
          : data?.pickup_address_name || '';
      },
      headerName: 'From',
      width: 220,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value?.toUpperCase()}</p>;
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
      valueGetter: ({ data }) => {
        return data?.delivery_address
          ? data?.delivery_address?.description
          : data?.delivery_address_name || '';
      },
      headerName: 'To',
      width: 220,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value?.toUpperCase()}</p>;
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
      valueGetter: ({ data: colis }) => {
        return parseInt(calculateMontantACollecter(colis, 'Collection'));
      },
      headerName: 'Pickup Amount',
      width: 135,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p className="uppercase font-semibold text-primary break-all overflow-hidden">{value}</p>
        );
      }
    },
    {
      field: 'fee_paid_by',
      valueGetter: ({ data: colis }) => {
        return parseInt(calculateMontantACollecter(colis, 'Delivery'));
      },
      headerName: 'Delivery Amount',
      width: 135,
      filterParams: containFilterParams,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p className="uppercase font-semibold text-primary break-all overflow-hidden">{value}</p>
        );
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
      headerName: 'Tot. To Collect',
      width: 135,
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
      field: 'expedition_fee',
      headerName: 'Exp. fee',
      width: 100,
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value }) => {
        if (!value || parseInt(value) === 0) return;
        return (
          <p className="uppercase font-semibold break-all overflow-hidden text-info">
            {parseInt(value)}
          </p>
        );
      }
    },
    {
      field: 'pickup_latitude',
      headerName: 'Operation Livreur',
      width: 170,
      filterParams: containFilterParams,
      valueGetter: ({ data: colis }) => {
        const assignmentsData = parcelsUtils.findOngoingAssignment(colis);

        const lastName = assignmentsData?.livreur?.first_name;
        const firstName = assignmentsData?.livreur?.last_name;

        return assignmentsData
          ? `${firstName ? firstName?.toUpperCase() + ' ' + lastName?.toUpperCase() : 'N/A'}`
          : 'N/A';
      },
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value, data }) => {
        const assignmentsData = parcelsUtils.findOngoingAssignment(data);
        const phoneNumber = assignmentsData?.livreur?.first_name
          ? assignmentsData?.livreur?.client?.phone_number
          : '';

        return (
          <div className="grid row-span-2 text-sm">
            <div className="font-medium text-gray-900 flex items-center justify-center">
              {phoneNumber}
            </div>
            <div className="text-gray-500 flex items-center justify-center">{value}</div>
          </div>
        );
      }
    },
    {
      field: 'pickup_date',
      headerName: 'Operation Date',
      valueGetter: ({ data: colis }) => {
        // const assignmentsData = parcelsUtils.processAssignments(colis?.assignments || []);
        const assignmentsData = parcelsUtils.findOngoingAssignment(colis);
        return assignmentsData ? assignmentsData : 'N/A';
      },
      width: 160,
      filter: 'agDateColumnFilter',
      onCellClicked: (params) => onColumnClicked(params.data),
      cellRenderer: ({ value: assignment }) => {
        const formattedValue = moment.utc(assignment?.created_at);

        return (
          <>
            {formattedValue ? (
              <div className="grid row-span-2 text-xs">
                <p>
                  <span className="text-sm flex items-center justify-center">
                    {formattedValue?.format('DD-MM-YYYY')}
                  </span>
                </p>
                <span className="text-sm flex items-center justify-center">
                  {formattedValue?.format('HH:mm')}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center">N/A</div>
            )}
          </>
        );
      }
    },
    // {
    //   field: 'pickup_date',
    //   headerName: 'Operation End',
    //   valueGetter: ({ data: colis }) => {
    //     const assignmentsData = parcelsUtils.findOngoingAssignment(colis);
    //
    //     let assignment = assignmentsData ? assignmentsData : 'N/A';
    //
    //     return assignment;
    //   },
    //   width: 160,
    //   filter: 'agDateColumnFilter',
    //   onCellClicked: (params) => onColumnClicked(params.data),
    //   cellRenderer: ({ value: assignment }) => {
    //     let formattedValue;
    //
    //     if (assignment?.colis_status) {
    //       formattedValue = moment.utc(assignment?.colis_status?.created_at);
    //     }
    //
    //     return (
    //       <>
    //         {formattedValue ? (
    //           <div className="grid row-span-2 text-xs">
    //             {' '}
    //             <p>
    //               <span className="text-sm flex items-center justify-center">
    //                 {formattedValue?.format('DD-MM-YYYY')}
    //               </span>
    //             </p>
    //             <span className="text-sm flex items-center justify-center">
    //               {formattedValue?.format('HH:mm')}
    //             </span>
    //           </div>
    //         ) : (
    //           <div className="flex items-center justify-center">N/A</div>
    //         )}
    //       </>
    //     );
    //   }
    // },
    // {
    //   field: 'delivery_date',
    //   headerName: 'Delivery Date',
    //   width: 130,
    //   filter: 'agDateColumnFilter',
    //   valueGetter: ({ data: colis }) => {
    //     const assignmentsData = parcelsUtils.processAssignments(colis?.assignments || []);
    //     return assignmentsData?.DELIVERY;
    //   },
    //   onCellClicked: (params) => onColumnClicked(params.data),
    //   cellRenderer: ({ value: assignment }) => {
    //     let formattedValue;

    //     if (assignment?.status) {
    //       formattedValue = moment.utc(assignment?.status?.created_at);
    //     }

    //     return (
    //       <>
    //         {formattedValue ? (
    //           <div className="grid row-span-2 text-xs">
    //             {' '}
    //             <p>
    //               <span className="text-sm flex items-center justify-center">
    //                 {formattedValue?.format('DD-MM-YYYY')}
    //               </span>
    //             </p>
    //             <span className="text-sm flex items-center justify-center">
    //               {formattedValue?.format('HH:mm')}
    //             </span>
    //           </div>
    //         ) : (
    //           <div className="flex items-center justify-center">N/A</div>
    //         )}
    //       </>
    //     );
    //   }
    // },
    // {
    //   field: 'delivery_latitude',
    //   headerName: 'Delivery livreur',
    //   width: 170,
    //   filterParams: containFilterParams,
    //   onCellClicked: (params) => onColumnClicked(params.data),
    //   cellRenderer: ({ data: colis }) => {
    //     let { DELIVERY: assignment } = parcelsUtils.processAssignments(colis?.assignments || []);

    //     assignment = assignment
    //       ? assignment
    //       : colis?.colis_statuses?.length
    //         ? colis?.assignments?.filter((assignment) =>
    //             colis?.colis_statuses?.some((status) => status.assignment_id === assignment.id)
    //           )[0]
    //         : 'N/A';

    //     if (assignment?.type !== 'DELIVERY') {
    //       assignment = null;
    //     }

    //     const phoneNumber = assignment?.livreur?.first_name
    //       ? assignment?.livreur?.client?.phone_number
    //       : '';
    //     const lastName = assignment?.livreur?.first_name;
    //     const firstName = assignment?.livreur?.last_name;
    //     return (
    //       <div className="grid row-span-2 text-sm">
    //         <div className="font-medium text-gray-900 flex items-center justify-center">
    //           {phoneNumber}
    //         </div>
    //         <div className="text-gray-500 flex items-center justify-center">
    //           {firstName ? firstName?.toUpperCase() + ' ' + lastName?.toUpperCase() : 'N/A'}
    //         </div>
    //       </div>
    //     );
    //   }
    // },
    // {
    //   field: 'client.id',
    //   headerName: 'Return Date',
    //   width: 130,
    //   filter: 'agDateColumnFilter',
    //   valueGetter: ({ data: colis }) => {
    //     const assignmentsData = parcelsUtils.processAssignments(colis?.assignments || []);
    //     return assignmentsData?.RETURN;
    //   },
    //   onCellClicked: (params) => onColumnClicked(params.data),
    //   cellRenderer: ({ value: assignment }) => {
    //     let formattedValue;

    //     if (assignment?.status) {
    //       formattedValue = moment.utc(assignment?.status?.created_at);
    //     }

    //     return (
    //       <>
    //         {formattedValue ? (
    //           <div className="grid row-span-2 text-xs">
    //             {' '}
    //             <p>
    //               <span className="text-sm flex items-center justify-center">
    //                 {formattedValue?.format('DD-MM-YYYY')}
    //               </span>
    //             </p>
    //             <span className="text-sm flex items-center justify-center">
    //               {formattedValue?.format('HH:mm')}
    //             </span>
    //           </div>
    //         ) : (
    //           <div className="flex items-center justify-center">N/A</div>
    //         )}
    //       </>
    //     );
    //   }
    // },
    // {
    //   field: 'client.is_deleted',
    //   headerName: 'Return livreur',
    //   width: 150,
    //   filterParams: containFilterParams,
    //   onCellClicked: (params) => onColumnClicked(params.data),
    //   cellRenderer: ({ data: colis }) => {
    //     let { RETURN: assignment } = parcelsUtils.processAssignments(colis?.assignments || []);

    //     assignment = assignment
    //       ? assignment
    //       : colis?.colis_statuses?.length
    //         ? colis?.assignments?.filter((assignment) =>
    //             colis?.colis_statuses?.some((status) => status.assignment_id === assignment.id)
    //           )[0]
    //         : 'N/A';

    //     if (assignment?.type !== 'RETURN') {
    //       assignment = null;
    //     }

    //     const phoneNumber = assignment?.livreur?.first_name
    //       ? assignment?.livreur?.client?.phone_number
    //       : '';
    //     const lastName = assignment?.livreur?.first_name;
    //     const firstName = assignment?.livreur?.last_name;
    //     return (
    //       <div className="grid row-span-2 text-sm">
    //         <div className="font-medium text-gray-900 flex items-center justify-center">
    //           {phoneNumber}
    //         </div>
    //         <div className="text-gray-500 flex items-center justify-center">
    //           {firstName ? firstName?.toUpperCase() + ' ' + lastName?.toUpperCase() : 'N/A'}
    //         </div>
    //       </div>
    //     );
    //   }
    // },
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
              <span className="text-sm flex items-center justify-center">{formattedValue}</span>
            </p>
            <span className="text-sm flex items-center justify-center">
              {moment.utc(value).format('HH:mm')}
            </span>
          </div>
        );
      }
    }
  ]);

  return (
    <div className="overflow-hidden mt-2">
      {!isLoading && (
        <>
          <div className="ag-theme-alpine h-[40rem]">
            <AgGridReact
              ref={gridRef}
              columnDefs={columnDefs}
              rowData={colis}
              defaultColDef={AG_GRID_DEFAULT_COL_DEF}
              gridOptions={gridOptions}
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
        </>
      )}
    </div>
  );
};

export default ColisList;
