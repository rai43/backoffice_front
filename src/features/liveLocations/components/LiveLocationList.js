import React, { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { openModal } from '../../common/modalSlice';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { useDispatch, useSelector } from 'react-redux';
import { classNames } from '../../../components/Common/UtilsClassNames';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import moment from 'moment/moment';

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
const LiveLocationList = (props) => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);
  const { subscriptions, isLoading } = useSelector((state) => state.subscriptions);

  const columnDefs = useMemo(() => [
    {
      field: 'client.phone_number',
      headerName: 'Client',
      width: 160,
      pinned: true,
      filterParams: containFilterParams,
      // onCellClicked: (params) => onDetailsClicked(params.data),
      valueGetter: ({ data }) => {
        // const wallets = params.data.wallets || [];
        return data?.client?.phone_number + ''; // Adjust this based on your actual structure
      },
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-primary')}>
            {value}
          </p>
          // </div>
        );
      }
    },
    {
      field: 'subscription.offer.offer',
      headerName: 'Offer',
      width: 140,
      filterParams: containFilterParams,
      // onCellClicked: (params) => onDetailsClicked(params.data),
      valueGetter: ({ data }) => {
        // const wallets = params.data.wallets || [];
        return data?.subscription?.offer?.offer || 'N/A'; // Adjust this based on your actual structure
      },
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p className={classNames('px-3 py-1')}>{value}</p>
          // </div>
        );
      }
    },
    {
      field: 'subscription.offer.type',
      headerName: 'Subscription Type',
      width: 160,
      filterParams: containFilterParams,
      // onCellClicked: (params) => onDetailsClicked(params.data),
      valueGetter: ({ data }) => {
        // const wallets = params.data.wallets || [];
        return data?.subscription?.offer?.type || 'N/A'; // Adjust this based on your actual structure
      },
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1')}>{value}</p>;
      }
    },
    {
      field: 'subscription.amount',
      headerName: 'Amount',
      width: 110,
      filterParams: containFilterParams,
      // onCellClicked: (params) => onDetailsClicked(params.data),
      valueGetter: ({ data }) => {
        // const wallets = params.data.wallets || [];
        return data?.subscription?.amount + '' || '0'; // Adjust this based on your actual structure
      },
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1')}>{value}</p>;
      }
    },
    {
      field: 'subscription_id',
      headerName: 'Sub. ID',
      width: 110,
      filterParams: containFilterParams,
      // onCellClicked: (params) => onDetailsClicked(params.data),
      valueGetter: ({ data }) => {
        // const wallets = params.data.wallets || [];
        return data?.subscription_id + '' || '0'; // Adjust this based on your actual structure
      },
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1')}>{value}</p>;
      }
    },
    {
      field: 'subscription.start_date',
      headerName: 'Start Date',
      width: 160,
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => onDetailsClicked(params.data),
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
      field: 'subscription.end_date',
      headerName: 'End Date',
      width: 160,
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => onDetailsClicked(params.data),
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
      field: 'created_at',
      headerName: 'Creation Date',
      width: 160,
      filter: 'agDateColumnFilter',
      // onCellClicked: (params) => onDetailsClicked(params.data),
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
    <div>
      <div className="overflow-hidden mt-3">
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
                    console.log(
                      'gridOptions.api.paginationPageSize',
                      gridOptions.api.paginationProxy.pageSize
                    );
                  }}
                  defaultValue={20}
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
            <div className="ag-theme-alpine">
              <AgGridReact
                ref={gridRef}
                gridOptions={gridOptions}
                columnDefs={columnDefs}
                rowData={subscriptions}
                defaultColDef={AG_GRID_DEFAULT_COL_DEF}
                pagination={true}
                rowHeight={50}
                paginationPageSize={20}
                paginationPageSizeOptions={[10, 20, 50]}
                suppressRowDeselection={false}
                onPaginationChanged={async (params) => {
                  adjustGridHeight(params.api); // Adjust height
                }}
                onFirstDataRendered={async (params) => {
                  adjustGridHeight(params.api); // Adjust height
                }}
                onSelectionChanged={async (params) => {
                  adjustGridHeight(params.api); // Adjust height
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveLocationList;
