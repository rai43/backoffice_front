import React, { useMemo, useRef } from 'react';

import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { classNames } from '../../../components/Common/UtilsClassNames';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { openModal } from '../../common/modalSlice';
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
        field: 'id',
        headerName: 'ID',
        flex: 1,
        // pinned: true,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            // <div className='flex items-center justify-center'>
            <p className={classNames('px- py-1 uppercase leading-wide font-bold  ')}>{value}</p>
            // </div>
          );
        }
      },
      {
        field: 'wallet.client.phone_number',
        headerName: 'CLIENT',
        flex: 2,
        // pinned: true,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            // <div className='flex items-center justify-center'>
            <p className={classNames('uppercase flex items-center justify-center')}>{value}</p>
            // </div>
          );
        }
      },
      {
        field: 'status',
        headerName: 'STATUS',
        flex: 2,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            <p
              className={`uppercase leading-wide font-bold flex items-center justify-center ${
                value === 'CANCELED' ? 'text-red-700' : ''
              }`}>
              {value}
            </p>
          );
        }
      },
      {
        field: 'type',
        headerName: 'TYPE',
        flex: 2,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            <p className={classNames('flex items-center justify-center uppercase leading-wide')}>
              {!STREET_NUMBERS.includes(value) && value}
            </p>
          );
        }
      },
      {
        field: 'amount',
        headerName: 'AMOUNT',
        flex: 2,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ data }) => {
          return (
            <p
              className={`flex items-center justify-center font-semibold ${
                data?.credited ? 'text-green-700' : 'text-red-700'
              }`}>
              {data?.credited ? `+ ${data?.credited}` : `- ${data?.debited}`}
            </p>
          );
        }
      },
      {
        field: 'created_at',
        headerName: 'DATE',
        flex: 2,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            <div className="flex items-center justify-center">
              {moment.utc(value).format('DD-MM-YYYY HH:mm')}
            </div>
          );
        }
      },
      {
        field: 'description',
        headerName: 'DESCRIPTION',
        flex: 6,
        filterParams: containFilterParams,
        onCellClicked: (params) => onDetailsClicked(params.data),
        cellRenderer: ({ value }) => {
          return (
            // <div className='flex items-center justify-center'>
            <p className={classNames('uppercase leading-wide')}>{value}</p>
            // </div>
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
                  defaultValue={paginationSize}>
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
                  // if (currentPage === totalPages - 1 && currentPage !== 0) {
                  //   await onLoad();
                  // }
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
