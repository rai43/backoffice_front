import React, { useMemo } from "react";
import cliTruncate from "cli-truncate";
import { useDispatch, useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";

import {
  AG_GRID_DEFAULT_COL_DEF,
  CONFIRMATION_MODAL_CLOSE_TYPES,
  MODAL_BODY_TYPES,
} from "../../../utils/globalConstantUtil";
import { openModal } from "../../common/modalSlice";
import moment from "moment";
import { classNames } from "../../../components/Common/UtilsClassNames";

const containFilterParams = {
  filterOptions: ["contains", "notContains"],
  debounceMs: 200,
  maxNumConditions: 1,
};

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  defaultColDef: {
    sortable: true,
    resizable: true,
  },
};

const Livreurs = ({ onLoadLivreurs, currPage, updateFormValue }) => {
  const dispatch = useDispatch();
  const { livreurs, from, isLoading, noMoreQuery } = useSelector(
    (state) => state.livreur,
  );

  // Opening right sidebar for user details
  const openLivreurDetails = (livreur) => {
    dispatch(
      openModal({
        title: `Details View - ${livreur.phone_number}`,
        size: "lg",
        bodyType: MODAL_BODY_TYPES.LIVREUR_DETAILS,
        extraObject: livreur,
      }),
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "livreurs.0.second_phone_number",
        headerName: "Client",
        // width: 210,
        flex: 1,
        // pinned: true,
        filterParams: containFilterParams,
        cellRenderer: ({ value, data }) => {
          const TYPE_OBJ = data.client_type;
          const PHONE_NUMBER = data.phone_number;
          const MERCHANT_NAME = data.merchant_name;
          return (
            <div className="flex items-center cursor-pointer">
              <div className="ml-4">
                <div className="text-md font-medium text-gray-900">
                  {value} {!value ? `[${PHONE_NUMBER}]` : ""}
                </div>
                <div
                  className={`text-md  ${
                    TYPE_OBJ["code"] === "MARCH"
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                >
                  LIVREUR
                </div>
              </div>
            </div>
          );
        },
        // cellRenderer: AgTableClickComponent,
        // cellClass: cellClass,
        onCellClicked: (params) => openLivreurDetails(params.data),
      },
      {
        field: "wallets.0.balance",
        headerName: "Livreur Wallet",
        // width: 210,
        flex: 1,
        filterParams: containFilterParams,
        onCellClicked: (params) => openLivreurDetails(params.data),
        cellRenderer: ({ value, data }) => {
          const wallets = data.wallets;
          const personalWallet = wallets.find(
            (wallet) => wallet?.wallet_type?.code === "LIVREUR",
          );
          return (
            <div className="flex items-center justify-center">
              <p
                className={classNames(
                  "px-3 py-1 uppercase leading-wide font-bold text-md",
                  personalWallet?.balance >= 0 ? " text-blue-700" : null,
                  !personalWallet ? "text-red-700" : null,
                )}
              >
                {personalWallet?.balance >= 0 ? personalWallet?.balance : "N/A"}
              </p>
            </div>
          );
        },
      },
      {
        field: "wallets.0.bonus",
        headerName: "Livreur Bonus Wallet",
        // width: 210,
        flex: 1,
        filterParams: containFilterParams,
        onCellClicked: (params) => openLivreurDetails(params.data),
        cellRenderer: ({ value, data }) => {
          const wallets = data.wallets;
          const personalWallet = wallets.find(
            (wallet) => wallet?.wallet_type?.code === "LIVREUR",
          );
          return (
            <div className="flex items-center justify-center">
              <p
                className={classNames(
                  "px-3 py-1 uppercase leading-wide font-bold text-md",
                  personalWallet?.bonus >= 0 ? " text-blue-700" : null,
                  !personalWallet ? "text-red-700" : null,
                )}
              >
                {personalWallet?.bonus >= 0 ? personalWallet?.bonus : "N/A"}
              </p>
            </div>
          );
        },
      },
      {
        field: "created_at",
        headerName: "Registration Date",
        // width: 200,
        flex: 1,
        // pinned: 'right',
        filter: "agDateColumnFilter",
        onCellClicked: (params) => openLivreurDetails(params.data),
        cellRenderer: ({ value }) => {
          let formattedValue = value ? value : "N/A";

          if (formattedValue !== "N/A") {
            formattedValue = moment.utc(value).format("DD/MM/YYYY HH:mm");
          }

          return (
            <span className="font-semibold text-md">{formattedValue}</span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="overflow-hidden mt-2">
      {!isLoading && (
        <>
          <div className="flex justify-between mb-4 mt-2 gap-5">
            <div className={``}>
              <button
                className={`btn btn-primary btn-outline w-full btn-sm`}
                onClick={() => {
                  dispatch(
                    openModal({
                      title: "Add a new livreur",
                      bodyType: MODAL_BODY_TYPES.LIVREUR_ADD_OR_EDIT,
                      size: "lg",
                    }),
                  );
                }}
              >
                Add New Livreur
              </button>
            </div>

            <div className="font-semibold">
              <label>Page Size:</label>
              <select
                className="mx-3"
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  gridOptions.api.paginationSetPageSize(newSize);
                }}
                defaultValue={20}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
              </select>

              {/* <label>Current Page:</label>
							<input
								type='number'
								min='1'
								onChange={(e) => {
									const newPage = parseInt(e.target.value);
									gridOptions.api.paginationGoToPage(newPage - 1); // Page numbers start from 0
								}}
							/> */}
            </div>
          </div>
          <div className="ag-theme-alpine h-[40rem]">
            <AgGridReact
              columnDefs={columnDefs}
              rowData={livreurs}
              defaultColDef={AG_GRID_DEFAULT_COL_DEF}
              pagination={true}
              paginationPageSize={20}
              rowHeight={50}
              gridOptions={gridOptions}
              paginationPageSizeOptions={[10, 20, 50]}
              // onSelectionChanged={(val) => {
              // 	const selectedObject = val.api.getSelectedRows()[0];
              // 	openModal({
              // 		...annualCheckupModalConfig,
              // 		title: selectedObject.label,
              // 		extraObject: {
              // 			data: selectedObject,
              // 			config: { openInReadOnlyMode: true },
              // 		},
              // 	});
              // }}
              rowSelection="single"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Livreurs;
