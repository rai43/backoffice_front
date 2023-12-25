import React, { useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';

import { openModal } from '../../common/modalSlice';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import moment from 'moment';
import { classNames } from '../../../components/Common/UtilsClassNames';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import {
  setPaginationCurrentPage,
  setFilters,
  setPaginationSize
} from '../../common/transactionsTableSlice';

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const STREET_NUMBERS = [
  '0700000000',
  '0700000001',
  '0700000002',
  '0700000003',
  '0700000004',
  '0700000005',
  '0700000006',
  '0700000007',
  '0700000008',
  '0700000009',
  '07000000010',
  '07000000011',
  '07000000012',
  '07000000013',
  '07000000014',
  '07000000015'
];

const UsersTransactions = ({ onLoad }) => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);

  const onDetailsClicked = (data) => {
    dispatch(
      openModal({
        title: 'Transaction Details',
        size: 'lg',
        extraObject: data,
        bodyType: MODAL_BODY_TYPES.TRANSACTIONS_DETAILS
      })
    );
  };

  const { isLoading, transactions } = useSelector((state) => state.transaction);
  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.transactionsTable
  );

  const columnDefs = useMemo(
    () => [
      {
        field: 'transaction_type.libelle',
        headerName: 'Transaction Type',
        width: 140,
        pinned: true,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            // <div className='flex items-center justify-center'>
            <p className={classNames('px-3 py-1 uppercase leading-wide font-bold  ')}>{value}</p>
            // </div>
          );
        }
      },
      {
        field: 'reference',
        headerName: 'Reference',
        width: 150,
        pinned: true,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            <p className={classNames('px-3 py-1 uppercase leading-wide font-bold  text-blue-700')}>
              {value}
            </p>
          );
        }
      },
      {
        field: 'sender_wallet.client.phone_number',
        headerName: 'Sender',
        width: 130,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            <p className={classNames('px-3 py-1 uppercase leading-wide font-bold ')}>
              {!STREET_NUMBERS.includes(value) && value}
            </p>
          );
        }
      },
      {
        field: 'sender_wallet.wallet_type.libelle',
        valueGetter: (params) => {
          const walletLibelle = params?.data?.sender_wallet?.wallet_type?.libelle;
          const transactionType = params?.data?.transaction_type?.code?.toUpperCase();
          const phone_number = params?.data?.sender_wallet?.client?.phone_number;

          return !STREET_NUMBERS.includes(phone_number)
            ? walletLibelle
              ? walletLibelle?.toUpperCase()
              : 'STREET-' + transactionType
            : 'STREET';
        },
        headerName: 'Sender Type',
        width: 140,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value, data }) => {
          const phone_number = data?.sender_wallet?.client?.phone_number;
          return (
            <div className="flex items-center justify-center">
              <span
                className={`px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full mt-3
                  ${
                    !STREET_NUMBERS.includes(phone_number) && value.includes('STREET')
                      ? 'bg-green-100 text-green-700 shadow-sm'
                      : value === 'PERSONAL'
                        ? 'bg-violet-100 text-violet-700 shadow-sm'
                        : value === 'MERCHANT'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'bg-gray-100 text-gray-700 shadow-sm'
                  }
                 `}
              >
                {value}
              </span>
            </div>
          );
        }
      },
      {
        field: 'amount',
        valueGetter: (params) => {
          const amount = params?.data?.amount;

          return amount + '';
        },
        headerName: 'Amount',
        width: 110,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return <div className="flex items-center justify-center font-semibold">{value}</div>;
        }
      },
      {
        field: 'receiver_wallet.client.phone_number',
        headerName: 'Receiver',
        width: 130,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            // <div className='flex items-center justify-center'>
            <p className={classNames('px-3 py-1 uppercase leading-wide font-bold ')}>{value}</p>
            // </div>
          );
        }
      },
      {
        field: 'receiver_wallet.wallet_type.libelle',
        valueGetter: (params) => {
          const walletLibelle = params?.data?.receiver_wallet?.wallet_type?.libelle;
          const transactionType = params?.data?.transaction_type?.code?.toUpperCase();
          const phone_number = params?.data?.sender_wallet?.client?.phone_number;

          return !STREET_NUMBERS.includes(phone_number)
            ? walletLibelle
              ? walletLibelle?.toUpperCase()
              : 'STREET-' + transactionType
            : 'STREET';
        },
        headerName: 'Receiver Type',
        width: 140,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value, data }) => {
          console.log(data);
          const phone_number = data?.receiver_wallet?.client?.phone_number;
          return (
            <div className="flex items-center justify-center">
              <span
                className={`px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full mt-3
                  ${
                    !STREET_NUMBERS.includes(phone_number) && value.includes('STREET')
                      ? 'bg-green-100 text-green-700 shadow-sm'
                      : value === 'PERSONAL'
                        ? 'bg-violet-100 text-violet-700 shadow-sm'
                        : value === 'MERCHANT'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : value === 'LIVREUR'
                            ? 'bg-orange-100 text-orange-700 shadow-sm'
                            : 'bg-gray-100 text-gray-700 shadow-sm'
                  }
                 `}
              >
                {value}
              </span>
            </div>
          );
        }
      },
      {
        field: 'commande.balance_share',
        valueGetter: (params) => {
          const balance_share = params?.data?.commande?.balance_share;

          return balance_share ? balance_share + '' : '';
        },
        headerName: 'Balance Shared',
        width: 140,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return <div className="flex items-center justify-center font-semibold">{value}</div>;
        }
      },
      {
        field: 'commande.bonus_share',
        valueGetter: (params) => {
          const bonus_share = params?.data?.commande?.bonus_share;

          return bonus_share ? bonus_share + '' : '';
        },
        headerName: 'Bonus Shared',
        width: 140,
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
        // pinned: 'right',
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
                <span className="font-semibold text-sm mr-2">{formattedValue}</span>
              </p>
              <span className="font-semibold text-sm">{moment.utc(value).format('HH:mm')}</span>
            </div>
          );
        }
      }
    ],
    []
  );

  return (
    <div>
      <div className="overflow-hidden mt-2">
        {!isLoading && (
          <>
            <div className="flex justify-end mb-4 mt-2 gap-5">
              <div className="font-semibold">
                <label>Page Size:</label>
                <select
                  className="mx-3"
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    gridOptions.api.paginationSetPageSize(newSize);
                    dispatch(setPaginationSize({ paginationSize: newSize || 20 }));
                  }}
                  defaultValue={paginationSize}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
              </div>
            </div>
            <div className="ag-theme-alpine h-[40rem]">
              <AgGridReact
                ref={gridRef}
                gridOptions={gridOptions}
                columnDefs={columnDefs}
                rowData={transactions}
                defaultColDef={AG_GRID_DEFAULT_COL_DEF}
                pagination={true}
                paginationPageSize={paginationSize || 20}
                rowHeight={50}
                onPaginationChanged={async (params) => {
                  adjustGridHeight(params.api);
                  let currentPage = params.api.paginationGetCurrentPage();
                  let totalPages = params.api.paginationGetTotalPages();
                  await dispatch(
                    setPaginationCurrentPage({
                      paginationCurrentPage: currentPage
                    })
                  );
                  if (currentPage === totalPages - 1 && currentPage !== 0) {
                    await onLoad();
                  }
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
                rowSelection="single"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersTransactions;
