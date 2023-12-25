import React, { useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../../common/modalSlice';
import { MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { AG_GRID_DEFAULT_COL_DEF } from '../../../utils/globalConstantUtil';
import { classNames } from '../../../components/Common/UtilsClassNames';
import moment from 'moment';
import { AiOutlineCloudDownload } from 'react-icons/ai';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import {
  setFilters,
  setPaginationCurrentPage,
  setPaginationSize
} from '../../common/merchantMenuTableSlice';

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

const MerchantsList = ({ onLoadMerchants }) => {
  const gridRef = useRef(null);
  const dispatch = useDispatch();

  const { articles, from, isLoading, noMoreQuery } = useSelector((state) => state.article);

  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.merchantMenuTable
  );

  const openMerchantDetails = (menu) => {
    dispatch(
      openModal({
        title: `Menu Details View - ${menu?.id}`,
        size: 'lg',
        bodyType: MODAL_BODY_TYPES.MERCHANT_DETAILS,
        extraObject: menu
      })
    );
  };

  const columnDefs = useMemo(() => [
    {
      field: 'id',
      valueGetter: ({ data }) => {
        return data?.id + '';
      },
      headerName: 'Article ID',
      width: 120,
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
      field: 'title',
      headerName: 'Title',
      width: 170,
      filterParams: containFilterParams,
      pinned: true,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value}</p>;
      }
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || 'N/A'}
          </div>
        );
      }
    },
    {
      field: 'merchant_price',
      headerName: 'Merchant Price',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">{parseInt(value)}</div>
        );
      }
    },
    {
      field: 'category.name',
      headerName: 'Category',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return <div className="flex items-center justify-center uppercase">{value || 'N/A'}</div>;
      }
    },
    {
      field: 'merchant.name',
      headerName: 'Merchant Name',
      filter: 'agTextColumnFilter',
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data)
    },
    {
      field: 'merchant.client.phone_number',
      headerName: 'Merchant Phone',
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return <div className="uppercase overflow-auto">{value || 'N/A'}</div>;
      }
    },
    {
      field: 'merchant.whatsapp',
      headerName: 'WhatsApp',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return <div className="uppercase overflow-auto">{value || 'N/A'}</div>;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return <div className="font-semibold uppercase overflow-auto">{value || 'N/A'}</div>;
      }
    },
    {
      field: 'discount',
      headerName: 'Discount',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return <div className="uppercase overflow-auto">{value}</div>;
      }
    },
    {
      field: 'available',
      headerName: 'Availability',
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="uppercase overflow-auto">{value ? 'available' : 'not available'}</div>
        );
      }
    },
    {
      field: 'created_at',
      headerName: 'Registration Date',
      width: 130,
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
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 90,
      pinned: 'right',
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src={value} alt="food" />
            </div>
          </div>
        );
      }
    }
  ]);

  const onButtonClick = () => {
    const csvData = gridRef.current.api.getDataAsCsv({});
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exported_food_items_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overflow-hidden mt-2">
      {!isLoading && (
        <>
          <div className="flex justify-end mb-4 mt-2 gap-5">
            <div>
              <button className="btn btn-outline btn-sm" onClick={onButtonClick}>
                <AiOutlineCloudDownload className="mx-2 h-4 w-4" />
                Download
              </button>
            </div>
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
              rowData={articles}
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
