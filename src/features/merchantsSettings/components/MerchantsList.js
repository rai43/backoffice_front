import React, { useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../../common/modalSlice';
import { MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { AG_GRID_DEFAULT_COL_DEF } from '../../../utils/globalConstantUtil';
import { classNames } from '../../../components/Common/UtilsClassNames';
import moment from 'moment';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import {
  setFilters,
  setPaginationCurrentPage,
  setPaginationSize
} from '../../common/merchantSettingsTableSlice';

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

const gridOptions = {
  paginationPageSize: 20,
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const MerchantsList = ({ onLoadMerchants, currPage, updateFormValue }) => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);

  const { merchants, from, isLoading, noMoreQuery } = useSelector((state) => state.merchant);

  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.merchantSettingsTable
  );

  const openMerchantDetails = (merchant) => {
    dispatch(
      openModal({
        title: `Details View - ${merchant?.name} (${merchant?.whatsapp})`,
        size: 'lg',
        bodyType: MODAL_BODY_TYPES.MERCHANT_SETTINGS_DETAILS,
        extraObject: merchant
      })
    );
  };

  const columnDefs = useMemo(() => [
    {
      field: 'id',
      valueGetter: ({ data }) => {
        return data?.id + '';
      },
      headerName: 'Merchant ID',
      flex: 2,
      pinned: true,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-primary')}>
            {value}
          </p>
        );
      }
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      // width: 260,
      filterParams: containFilterParams,
      pinned: true,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden font-semibold">{value}</p>;
      }
    },
    {
      field: 'articles',
      headerName: 'Articles',
      flex: 2,
      // width: 210,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {value?.length + ' art' || 'N/A'}
          </div>
        );
      }
    },
    {
      field: 'accompagnements',
      headerName: 'Accompagnements',
      flex: 2,
      // width: 210,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {value?.filter((acc) => acc.is_deleted === false)?.length + ' acc' || 'N/A'}
          </div>
        );
      }
    },

    {
      field: 'created_at',
      headerName: 'Registration Date',
      flex: 2,
      // width: 170,
      filter: 'agDateColumnFilter',
      onCellClicked: (params) => openMerchantDetails(params.data),
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
                <option value="50">30</option>
                <option value="50">40</option>
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
              rowData={merchants}
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
                  await onLoadMerchants();
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
  );
};

export default MerchantsList;
