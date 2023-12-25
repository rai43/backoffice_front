import React, { useMemo, useRef } from 'react';

import { AgGridReact } from 'ag-grid-react';
import moment from 'moment/moment';
import { useDispatch, useSelector } from 'react-redux';

import { classNames } from '../../../components/Common/UtilsClassNames';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { openModal } from '../../common/modalSlice';

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
const InvitationList = (props) => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);
  const { invitations, isLoading } = useSelector((state) => state.invitations);

  const columnDefs = useMemo(() => [
    {
      field: 'inviter_client.phone_number',
      headerName: 'Inviter',
      flex: 3,
      filterParams: containFilterParams,
      // onCellClicked: (params) => onDetailsClicked(params.data),
      valueGetter: ({ data }) => {
        // const wallets = params.data.wallets || [];
        return data?.inviter_client?.phone_number + ''; // Adjust this based on your actual structure
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
      field: 'invitee_client.phone_number',
      headerName: 'Invitee',
      flex: 3,
      filterParams: containFilterParams,
      valueGetter: ({ data }) => {
        return data?.invitee_client?.phone_number + ''; // Adjust this based on your actual structure
      },
      cellRenderer: ({ value }) => {
        return (
          <p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-secondary')}>
            {value}
          </p>
        );
      }
    },
    {
      field: 'bonus.value',
      headerName: 'Offer',
      flex: 2,
      filterParams: containFilterParams,
      valueGetter: ({ data }) => {
        return data?.bonus ? data?.bonus?.value + '' : 'N/A';
      },
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1')}>{value}</p>;
      }
    },
    {
      field: 'inviter_bonus_amount',
      headerName: 'Inviter Bonus Amount',
      flex: 2,
      filterParams: containFilterParams,
      valueGetter: ({ data }) => {
        return data?.inviter_bonus_amount ? data?.inviter_bonus_amount + '' : 'N/A';
      },
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1')}>{value}</p>;
      }
    },
    {
      field: 'invitee_bonus_amount',
      headerName: 'Invitee Bonus Amount',
      flex: 2,
      filterParams: containFilterParams,
      valueGetter: ({ data }) => {
        return data?.invitee_bonus_amount ? data?.invitee_bonus_amount + '' : 'N/A';
      },
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 py-1')}>{value}</p>;
      }
    },
    {
      field: 'created_at',
      headerName: 'Creation Date',
      flex: 3,
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
                  defaultValue={20}>
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
                rowData={invitations}
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

export default InvitationList;
