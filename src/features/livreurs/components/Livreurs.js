import React, { useMemo } from 'react';

import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { classNames } from '../../../components/Common/UtilsClassNames';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import {
  setFilters,
  setPaginationCurrentPage,
  setPaginationSize
} from '../../common/livreursTableSlice';
import { openModal } from '../../common/modalSlice';

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const Livreurs = ({ onLoadLivreurs }) => {
  const dispatch = useDispatch();
  const { livreurs, from, isLoading, noMoreQuery } = useSelector((state) => state.livreur);

  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.livreursTable
  );

  const openLivreurDetails = (livreur) => {
    dispatch(
      openModal({
        title: `Details View - ${livreur.phone_number}`,
        size: 'lg',
        bodyType: MODAL_BODY_TYPES.LIVREUR_DETAILS,
        extraObject: livreur
      })
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        valueGetter: ({ data }) => {
          return data
            ? data?.phone_number +
                (data?.livreurs[0]?.first_name
                  ? data?.livreurs[0]?.first_name + ' ' + data?.livreurs[0]?.last_name
                  : '')
            : '';
        },
        headerName: 'Livreur',
        flex: 2,
        filterParams: containFilterParams,
        cellRenderer: ({ value, data }) => {
          const PHONE_NUMBER = data.phone_number;
          const last_name = data?.livreurs[0]?.last_name;
          const first_name = data?.livreurs[0]?.first_name;
          return (
            <div className="flex items-center cursor-pointer">
              <div className="ml-4 text-sm">
                <div className="font-medium text-gray-900">{PHONE_NUMBER}</div>
                <div className={`text-gray-500`}>
                  {data?.livreurs[0]?.first_name
                    ? data?.livreurs[0]?.first_name?.toUpperCase() +
                      ' ' +
                      data?.livreurs[0]?.last_name?.toUpperCase()
                    : 'N/A'}
                </div>
              </div>
            </div>
          );
        },
        onCellClicked: (params) => openLivreurDetails(params.data)
      },
      {
        field: 'wallets.0.balance',
        valueGetter: (params) => {
          const wallets = params?.data?.wallets;
          const livreurWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'LIVREUR');
          return livreurWallet ? livreurWallet.balance : '';
        },
        headerName: 'Livreur Wallet',
        flex: 1,
        filterParams: containFilterParams,
        onCellClicked: (params) => openLivreurDetails(params.data),
        cellRenderer: ({ value, data }) => {
          const wallets = data.wallets;
          const personalWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'LIVREUR');
          return (
            <div className="flex items-center justify-center">
              <p
                className={classNames(
                  'px-3 py-1 uppercase leading-wide font-bold text-md',
                  personalWallet?.balance >= 0 ? ' text-blue-700' : null,
                  !personalWallet ? 'text-red-700' : null
                )}>
                {value}
              </p>
            </div>
          );
        }
      },
      {
        field: 'wallets.0.bonus',
        headerName: 'Livreur Bonus Wallet',
        valueGetter: (params) => {
          const wallets = params?.data?.wallets;
          const livreurWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'LIVREUR');
          return livreurWallet ? livreurWallet.bonus : '';
        },
        flex: 1,
        filterParams: containFilterParams,
        onCellClicked: (params) => openLivreurDetails(params.data),
        cellRenderer: ({ value, data }) => {
          const wallets = data.wallets;
          const personalWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'LIVREUR');
          return (
            <div className="flex items-center justify-center">
              <p
                className={classNames(
                  'px-3 py-1 uppercase leading-wide font-bold text-md',
                  personalWallet?.bonus >= 0 ? ' text-blue-700' : null,
                  !personalWallet ? 'text-red-700' : null
                )}>
                {value}
              </p>
            </div>
          );
        }
      },
      {
        field: 'created_at',
        headerName: 'Registration Date',
        flex: 1,
        filter: 'agDateColumnFilter',
        onCellClicked: (params) => openLivreurDetails(params.data),
        cellRenderer: ({ value }) => {
          let formattedValue = value ? value : 'N/A';

          if (formattedValue !== 'N/A') {
            formattedValue = moment.utc(value).format('DD/MM/YYYY HH:mm');
          }

          return <span className="font-semibold text-md">{formattedValue}</span>;
        }
      }
    ],
    []
  );

  return (
    <div className="overflow-hidden mt-2">
      {!isLoading && (
        <>
          <div className="flex justify-between mb-4 mt-2 gap-5">
            <div className={``}>
              {/*<button*/}
              {/*  className={`btn btn-primary btn-outline w-full btn-sm`}*/}
              {/*  onClick={() => {*/}
              {/*    dispatch(*/}
              {/*      openModal({*/}
              {/*        title: 'Add a new livreur',*/}
              {/*        bodyType: MODAL_BODY_TYPES.LIVREUR_ADD_OR_EDIT,*/}
              {/*        size: 'lg'*/}
              {/*      })*/}
              {/*    );*/}
              {/*  }}*/}
              {/*>*/}
              {/*  Add New Livreur*/}
              {/*</button>*/}
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
              columnDefs={columnDefs}
              rowData={livreurs}
              defaultColDef={AG_GRID_DEFAULT_COL_DEF}
              pagination={true}
              rowHeight={50}
              gridOptions={gridOptions}
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
                if (currentPage === totalPages - 1 && currentPage !== 0) {
                  await onLoadLivreurs();
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

export default Livreurs;
