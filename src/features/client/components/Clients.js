import React, { useMemo } from "react";
import cliTruncate from "cli-truncate";
import { useDispatch, useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { IoStorefrontOutline, IoPencil } from "react-icons/io5";
import { AiOutlineSchedule } from "react-icons/ai";
import streetLogo from "../../../assets/street_logo.jpeg";

import {
  AG_GRID_DEFAULT_COL_DEF,
  CONFIRMATION_MODAL_CLOSE_TYPES,
  MODAL_BODY_TYPES,
} from "../../../utils/globalConstantUtil";
import { openModal } from "../../common/modalSlice";

import { classNames } from "../../../components/Common/UtilsClassNames";
import moment from "moment";

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  defaultColDef: {
    sortable: true,
    resizable: true,
  },
};

const Clients = ({
  onLoadClients,
  currPage,
  updateFormValue,
  firstActionButton,
  handleClientEdit,
  handleClientDelete,
}) => {
  const dispatch = useDispatch();
  const { clients, from, isLoading, noMoreQuery } = useSelector(
    (state) => state.client,
  );
  console.log("clients", clients);
  // Opening right sidebar for user details
  const openClientDetails = (client) => {
    dispatch(
      openModal({
        title: `Details View - ${client.phone_number}`,
        size: "lg",
        bodyType: MODAL_BODY_TYPES.CLIENT_DETAILS,
        extraObject: client,
      }),
    );
  };

  const editClientDetails = (client) => {
    console.log(client);
    dispatch(
      openModal({
        title: "Edit customer",
        bodyType: MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT,
        size: "lg",
        extraObject: { client },
      }),
    );
  };

  const editClientScheduleDetails = (client) => {
    console.log(client);
    if (client?.client_type?.code === "MARCH") {
      dispatch(
        openModal({
          title: "Edit Customer's Schedule",
          bodyType: MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT,
          size: "lg",
          extraObject: { client, isEditCustomerSchedule: true },
        }),
      );
    }
  };

  const clientToMarchant = (client) => {
    console.log(client);
    if (client?.client_type?.code === "PERSO") {
      dispatch(
        openModal({
          title: "Turn Client Into Merchant",
          bodyType: MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT,
          size: "lg",
          extraObject: { client, clientToMarchant: true },
        }),
      );
    }
  };

  const containFilterParams = {
    filterOptions: ["contains", "notContains"],
    debounceMs: 200,
    maxNumConditions: 1,
  };

  const columnDefs = useMemo(
    () => [
      {
        // field: 'phone_number',
        valueGetter: ({ data }) => {
          return data
            ? data?.phone_number +
                (data?.merchants[0] ? data?.merchants[0]?.name : "")
            : ""; // Adjust this based on your actual structure
        },
        headerName: "Client",
        width: 260,
        // flex: 3,
        pinned: true,
        filterParams: containFilterParams,
        cellRenderer: ({ value, data }) => {
          const TYPE_OBJ = data.client_type;
          const MERCHANT_ID = data.merchants[0]?.id;
          const MERCHANT_NAME = data?.merchants[0]?.name;
          return (
            <div className="flex items-center cursor-pointer">
              {TYPE_OBJ["code"] === "MARCH" && (
                <div className="flex-shrink-0 h-10 w-10">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={
                      data?.photo && data?.photo?.startsWith("http")
                        ? data?.photo
                        : streetLogo
                    }
                    // src={row.original[column.imgAccessor]}
                    alt="The merchant logo"
                  />
                </div>
              )}
              <div className="ml-4 text-sm">
                <div className="font-medium text-gray-900">
                  {data?.phone_number}
                </div>
                <div
                  className={`${
                    TYPE_OBJ["code"] === "MARCH"
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                >
                  {MERCHANT_NAME
                    ? cliTruncate(MERCHANT_NAME.toLocaleUpperCase(), 30)
                    : data?.client_type?.libelle || "N/A"}
                </div>
              </div>
            </div>
          );
        },
        // cellRenderer: AgTableClickComponent,
        // cellClass: cellClass,
        onCellClicked: (params) => openClientDetails(params.data),
      },
      {
        // field: 'wallets.find((wallet) => wallet?.wallet_type?.code === "PERSO")',
        valueGetter: (params) => {
          const wallets = params.data.wallets || [];
          const personalWallet = wallets.find(
            (wallet) => wallet?.wallet_type?.code === "PERSO",
          );
          return personalWallet ? personalWallet.balance : ""; // Adjust this based on your actual structure
        },
        headerName: "Personal Wallet",
        width: 170,
        // flex: 2,
        filterParams: containFilterParams,
        onCellClicked: (params) => openClientDetails(params.data),
        cellRenderer: ({ value, data }) => {
          console.log(value);
          const wallets = data.wallets;
          const personalWallet = wallets.find(
            (wallet) => wallet?.wallet_type?.code === "PERSO",
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
        // field: 'wallets',
        valueGetter: (params) => {
          const wallets = params.data.wallets || [];
          const personalWallet = wallets.find(
            (wallet) => wallet?.wallet_type?.code === "PERSO",
          );
          return personalWallet ? personalWallet.bonus : ""; // Adjust this based on your actual structure
        },
        headerName: "Bonus Wallet",
        width: 170,
        // flex: 2,
        filterParams: containFilterParams,
        onCellClicked: (params) => openClientDetails(params.data),
        cellRenderer: ({ value, data }) => {
          const wallets = data.wallets;
          const personalWallet = wallets.find(
            (wallet) => wallet?.wallet_type?.code === "PERSO",
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
        // field: 'wallets',
        valueGetter: (params) => {
          const wallets = params.data.wallets || [];
          const personalWallet = wallets.find(
            (wallet) => wallet?.wallet_type?.code === "MARCH",
          );
          return personalWallet ? personalWallet.balance : "N/A"; // Adjust this based on your actual structure
        },
        headerName: "Merchant Wallet",
        width: 170,
        // flex: 2,
        filterParams: containFilterParams,
        onCellClicked: (params) => openClientDetails(params.data),
        cellRenderer: ({ value, data }) => {
          const wallets = data.wallets;
          const marchantWallet = wallets.find(
            (wallet) => wallet?.wallet_type?.code === "MARCH",
          );
          return (
            <div className="flex items-center justify-center">
              <p
                className={classNames(
                  "px-3 py-1 uppercase leading-wide font-bold text-md",
                  marchantWallet?.balance >= 0 ? " text-green-700" : null,
                  !marchantWallet ? "text-neutral" : null,
                )}
              >
                {value}
              </p>
            </div>
          );
        },
      },
      {
        // field: 'created_at',
        valueGetter: (params) => {
          return params?.data?.created_at
            ? moment
                .utc(moment(params?.data?.created_at).format("DD/MM/YYYY"))
                .toDate()
            : "N/A"; // Adjust this based on your actual structure
        },
        headerName: "Registration Date",
        width: "200",
        filter: "agDateColumnFilter",
        onCellClicked: (params) => openClientDetails(params.data),
        cellRenderer: ({ value, data }) => {
          let formattedValue = data?.created_at ? data?.created_at : "N/A";

          if (formattedValue !== "N/A") {
            formattedValue = moment
              .utc(data?.created_at)
              .format("DD/MM/YYYY HH:mm");
          }

          return (
            <span className="font-semibold text-md">{formattedValue}</span>
          );
        },
      },
      {
        field: "client_type",
        headerName: "Edit Schedule",
        width: "130",
        pinned: "right",
        filter: "agDateColumnFilter",
        onCellClicked: (params) => editClientScheduleDetails(params.data),
        cellRenderer: ({ value }) => {
          const CODE = value?.code;
          const isPersonalAccount = CODE === "MARCH";

          return (
            <div className="flex items-center justify-center mt-2">
              {isPersonalAccount ? (
                <button className="btn btn-sm btn-outline btn-primary">
                  <AiOutlineSchedule className="h-4 w-4 " />
                </button>
              ) : (
                <span>- -</span>
              )}
            </div>
          );
          // return <div className='flex items-center justify-center mt-2'></div>;
        },
      },
      {
        field: "client_type",
        headerName: "Edit Account",
        width: "130",
        pinned: "right",
        filter: "agDateColumnFilter",
        onCellClicked: (params) => editClientDetails(params.data),
        cellRenderer: (_) => {
          return (
            <div className="flex items-center justify-center mt-2">
              <button className="btn btn-sm btn-outline btn-secondary">
                <IoPencil className="h-4 w-4 " />
              </button>
            </div>
          );
        },
      },
      {
        field: "client_type",
        headerName: "To Merchant ?",
        width: "130",
        pinned: "right",
        filter: "agDateColumnFilter",
        onCellClicked: (params) => clientToMarchant(params.data),
        cellRenderer: ({ value }) => {
          const CODE = value?.code;
          const isPersonalAccount = CODE === "PERSO";

          return (
            <div className="flex items-center justify-center mt-2">
              {isPersonalAccount ? (
                <button className="btn btn-sm btn-outline ">
                  <IoStorefrontOutline className="h-4 w-4 " />
                </button>
              ) : (
                <span>- -</span>
              )}
            </div>
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
          <div className="flex justify-end mb-4 mt-2 gap-5">
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
              rowData={clients}
              gridOptions={gridOptions}
              paginationPageSizeOptions={[10, 20, 50]}
              defaultColDef={AG_GRID_DEFAULT_COL_DEF}
              pagination={true}
              paginationPageSize={20}
              rowHeight={50}
              rowSelection="single"
              onPaginationChanged={async (params) => {
                let currentPage = params.api.paginationGetCurrentPage();
                let totalPages = params.api.paginationGetTotalPages();
                console.log(currentPage, totalPages);
                if (params.newPage) {
                  localStorage.setItem(
                    "currentPage",
                    JSON.stringify(currentPage),
                  );
                  localStorage.removeItem("oldPage");
                }
                if (
                  currentPage === totalPages - 1 &&
                  currentPage !== 0 &&
                  currentPage !== 0
                ) {
                  localStorage.setItem("oldPage", JSON.stringify(currentPage));
                  await onLoadClients();
                  const pageToNavigate = JSON.parse(
                    localStorage.getItem("oldPage"),
                  );
                  params.api.paginationGoToPage(pageToNavigate);
                }
              }}
              onFirstDataRendered={(params) => {
                const pageToNavigate = JSON.parse(
                  localStorage.getItem("currentPage"),
                );
                const oldPageToNavigate = JSON.parse(
                  localStorage.getItem("oldPage"),
                );
                params.api.paginationGoToPage(
                  oldPageToNavigate ? oldPageToNavigate : pageToNavigate,
                );
                // params.api.paginationGoToPage(pageToNavigate);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Clients;
