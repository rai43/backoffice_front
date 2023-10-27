import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { CiGps } from "react-icons/ci";
import { openModal } from "../../common/modalSlice";
import {
  AG_GRID_DEFAULT_COL_DEF,
  MODAL_BODY_TYPES,
} from "../../../utils/globalConstantUtil";
import { classNames } from "../../../components/Common/UtilsClassNames";
import moment from "moment";
import { COMMANDE_NUMBERS_VS_STATUS_CODE } from "../../../utils/globalConstantUtil";
import { COMMANDE_STATUS_CODE_VS_NUMBERS } from "../../../utils/globalConstantUtil";
import { setOrderStatus } from "../orderSlice";
import { showNotification } from "../../common/headerSlice";
import { adjustGridHeight } from "../../../utils/functions/adjustGridHeight";
import { FilterContext } from "../../../contexts/AgGridFilterContext";
import { AiOutlineCloudDownload } from "react-icons/ai";

const containFilterParams = {
  filterOptions: ["contains", "notContains"],
  debounceMs: 200,
  maxNumConditions: 1,
};

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true,
  },
};

const ClientOrdres = ({
  currPage,
  onLoad,
  updateFormValue,
  client,
  dateValues,
}) => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);
  const { orders, isLoading } = useSelector((state) => state.order);

  const [showSelectedMap, setShowSelectedMap] = useState([]);
  // const [filterState, setFilterState] = useState({});
  // const { filters, setFilters } = useContext(FilterContext);

  // const onFilterChanged = (params) => {
  // 	const currentFilterModel = params.api.getFilterModel();
  // 	console.log('params.api.getFilterModel()', currentFilterModel);
  // 	setFilterState(currentFilterModel);
  // };

  // const onGridReady = (params) => {
  // 	if (Object.keys(filterState).length > 0) {
  // 		params.api.setFilterModel(filterState);
  // 	}
  // };

  useEffect(() => {
    localStorage.setItem("currentPage", 0);
  }, []);

  // useEffect(() => {
  // 	if (filters && gridRef.current) {
  // 		gridRef.current.api.setFilterModel(filters);
  // 	}
  // }, [filters]);

  // const onFilterChanged = () => {
  // 	const filterModel = gridRef.current.api.getFilterModel();
  // 	setFilters(filterModel);
  // };

  const onDetailsClicked = (data) => {
    dispatch(
      openModal({
        title: "Order Details",
        size: "lg",
        extraObject: data,
        bodyType: MODAL_BODY_TYPES.ORDERS_DETAILS,
      }),
    );
  };

  const onChangeLivreur = (data) => {
    const status =
      data?.commande_commande_statuses[
        data?.commande_commande_statuses?.length - 1
      ]?.commande_status?.code;
    if (
      COMMANDE_STATUS_CODE_VS_NUMBERS[status] > 1 &&
      COMMANDE_STATUS_CODE_VS_NUMBERS[status] < 5
    ) {
      dispatch(
        openModal({
          title: "Choose the livreur",
          extraObject: { orderId: data?.id, isChangeLivreur: true },
          bodyType: MODAL_BODY_TYPES.ASSIGN_LIVREUR,
        }),
      );
    }
  };

  const onChangeStatusClicked = async (data) => {
    const status =
      data?.commande_commande_statuses[
        data?.commande_commande_statuses?.length - 1
      ]?.commande_status?.code;
    if (COMMANDE_STATUS_CODE_VS_NUMBERS[status] >= 5) return;
    console.log(data);
    console.log(status);
    if (COMMANDE_STATUS_CODE_VS_NUMBERS[status] === 2) {
      dispatch(
        openModal({
          title: "Choose the livreur",
          extraObject: { orderId: data?.id },
          bodyType: MODAL_BODY_TYPES.ASSIGN_LIVREUR,
        }),
      );
    } else {
      await dispatch(setOrderStatus({ commandId: data.id })).then(
        async (response) => {
          if (response?.error) {
            console.log(response.error);
            dispatch(
              showNotification({
                message: "Error while changing the order status",
                status: 0,
              }),
            );
          } else {
            dispatch(
              showNotification({
                message: "Succefully changed the order status",
                status: 1,
              }),
            );
          }
        },
      );
    }
  };

  const onCancelClicked = async (data) => {
    const status =
      data.commande_commande_statuses[
        data.commande_commande_statuses?.length - 1
      ]?.commande_status?.code;
    if (status === "CANCELED" || status === "DELIVERED") {
      return;
    }
    await dispatch(setOrderStatus({ commandId: data.id, isDelete: true })).then(
      async (response) => {
        if (response?.error) {
          console.log(response.error);
          dispatch(
            showNotification({
              message: "Error while changing the order status",
              status: 0,
            }),
          );
        } else {
          dispatch(
            showNotification({
              message: "Succefully changed the order status",
              status: 1,
            }),
          );
        }
      },
    );
  };

  const onPositionClicked = async (data) => {
    dispatch(
      openModal({
        title: "Position",
        extraObject: { order: { ...data } },
        bodyType: MODAL_BODY_TYPES.ORDER_POSITION,
        size: "max",
      }),
    );
  };

  const columnDefs = useMemo(() => [
    {
      field: "id",
      headerName: "Command ID",
      width: 110,
      pinned: true,
      // filterParams: 'agNumberColumnFilter',
      filterParams: containFilterParams,
      // onCellClicked: (params) => onDetailsClicked(params.data),
      valueGetter: ({ data }) => {
        // const wallets = params.data.wallets || [];
        return data?.id + ""; // Adjust this based on your actual structure
      },
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p
            className={classNames(
              "px-3 py-1 uppercase leading-wide font-bold text-primary",
            )}
          >
            {value}
          </p>
          // </div>
        );
      },
    },
    {
      field: "client.phone_number",
      headerName: "Client",
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p
            className={classNames("px-3 py-1 uppercase leading-wide font-bold")}
          >
            {value}
          </p>
          // </div>
        );
      },
    },
    {
      // field: 'livreur',
      headerName: "Livreur",
      width: 170,
      // pinned: 'right',
      valueGetter: ({ data }) => {
        const livreur = data?.livreur;
        return (
          livreur?.last_name +
          " " +
          livreur?.first_name +
          livreur?.client?.phone_number
        ); // Adjust this based on your actual structure
      },
      filterParams: containFilterParams,
      onCellClicked: (params) => onChangeLivreur(params.data),
      cellRenderer: ({ value, data }) => {
        return (
          <div className="grid grid-row-2 text-xs font-semibold hover:cursor-pointer">
            <p className={classNames("p-1 uppercase leading-wide")}>{`${
              data?.livreur?.last_name ? data?.livreur?.last_name : ""
            } ${
              data?.livreur?.first_name ? data?.livreur?.first_name : ""
            }`}</p>
            <p className={classNames("p-1 uppercase leading-wide")}>{`${
              data?.livreur?.client?.phone_number
                ? data?.livreur?.client?.phone_number
                : ""
            }`}</p>
          </div>
        );
      },
    },
    {
      field: "total",
      headerName: "Total Paid",
      width: 120,
      // filterParams: containFilterParams,
      filterParams: "agNumberColumnFilter",
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || "N/A"}
          </div>
        );
      },
    },
    {
      field: "balance_share",
      headerName: "Balance Share",
      width: 120,
      // filterParams: containFilterParams,
      filterParams: "agNumberColumnFilter",
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value)}
          </div>
        );
      },
    },
    {
      field: "bonus_share",
      headerName: "Bonus Share",
      width: 120,
      // filterParams: containFilterParams,
      filterParams: "agNumberColumnFilter",
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value)}
          </div>
        );
      },
    },
    {
      field: "service_fee",
      headerName: "Service Fee",
      width: 120,
      // filterParams: containFilterParams,
      filterParams: "agNumberColumnFilter",
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value)}
          </div>
        );
      },
    },
    {
      field: "total_articles",
      headerName: "Total Article",
      width: 120,
      // pinned: 'left',
      // filterParams: containFilterParams,
      filterParams: "agNumberColumnFilter",
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || "N/A"}
          </div>
        );
      },
    },
    {
      // field: 'commande_commande_statuses',
      headerName: "Status",
      width: 130,
      valueGetter: ({ data }) => {
        const status =
          data?.commande_commande_statuses[
            data?.commande_commande_statuses?.length - 1
          ]?.commande_status?.code;
        return status; // Adjust this based on your actual structure
      },
      // pinned: 'right',
      // filter: 'agDateColumnFilter',
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        // const status = value[value?.length - 1]?.commande_status?.code;
        return (
          <span
            className={classNames(
              "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3",
              value === "PENDING"
                ? "bg-lime-100 text-lime-700"
                : value === "REGISTERED"
                ? "bg-yellow-100 text-yellow-700"
                : value === "INPROCESS"
                ? "bg-blue-100 text-blue-700"
                : value === "INDELIVERY"
                ? "bg-orange-100 text-orange-700"
                : value === "DELIVERED"
                ? "bg-green-100 text-green-700"
                : value === "CANCELED"
                ? "bg-red-100 text-red-700"
                : null,
            )}
          >
            {value}
          </span>
        );
      },
    },
    {
      field: "merchant.name",
      headerName: "Merchant Name",
      width: 170,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p className={classNames("p-1 uppercase leading-wide")}>{value}</p>
          // </div>
        );
      },
    },
    {
      field: "merchant.client.phone_number",
      headerName: "Merchant Number",
      width: 150,
      hide: true,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p
            className={classNames("px-3 py-1 uppercase leading-wide font-bold")}
          >
            {value}
          </p>
          // </div>
        );
      },
    },
    {
      field: "payment_method",
      headerName: "Payment Method",
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {value}
          </div>
        );
      },
    },
    {
      field: "created_at",
      headerName: "Registration Date",
      width: 130,
      filter: "agDateColumnFilter",
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        let formattedValue = value ? value : "N/A";

        if (formattedValue !== "N/A") {
          formattedValue = moment.utc(value).format("DD/MM/YYYY");
        }

        return (
          <div className="grid row-span-2 text-xs">
            <p>
              <span className=" text-sm mr-2">{formattedValue}</span>
            </p>
            <span className=" text-sm">
              {moment.utc(value).format("HH:mm")}
            </span>
          </div>
        );
      },
    },
    {
      headerName: "Action",
      field: "commande_commande_statuses",
      valueGetter: ({ data }) => {
        const status =
          data?.commande_commande_statuses[
            data?.commande_commande_statuses?.length - 1
          ]?.commande_status?.code;
        return status; // Adjust this based on your actual structure
      },
      width: 130,
      pinned: "right",
      onCellClicked: (params) => onChangeStatusClicked(params.data),
      cellRenderer: ({ value }) => {
        // const status = value[value?.length - 1]?.commande_status?.code;
        if (COMMANDE_STATUS_CODE_VS_NUMBERS[value] >= 5)
          return (
            <span
              className={classNames(
                "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3",
                // status === 'PENDING'
                // 	? 'bg-yellow-100 text-yellow-700'
                // 	: status === 'INPROCESS'
                // 	? 'bg-lime-100 text-lime-700'
                // 	: status === 'REGISTERED'
                // 	? 'bg-blue-100 text-blue-700'
                // 	: status === 'INDELIVERY'
                // 	? 'bg-orange-100 text-orange-700'
                // 	: status === 'DELIVERED'
                // 	? 'bg-green-100 text-green-700'
                // 	: status === 'CANCELED'
                // 	? 'bg-red-100 text-red-700'
                // 	: null
              )}
            >
              {value}
            </span>
          );
        return (
          <button className="btn btn-outline btn-xs btn-primary">
            {" "}
            {
              COMMANDE_NUMBERS_VS_STATUS_CODE[
                (COMMANDE_STATUS_CODE_VS_NUMBERS[value] || 0) + 1
              ]
            }
          </button>
        );
        // return <button className='btn btn-outline btn-xs btn-primary'>MARK AS {COMMANDE_NUMBERS_VS_STATUS_CODE[(COMMANDE_STATUS_CODE_VS_NUMBERS[status] || 0) + 1]}</button>;
      },
    },
    {
      field: "code",
      valueGetter: ({ data }) => {
        const status =
          data?.commande_commande_statuses[
            data?.commande_commande_statuses?.length - 1
          ]?.commande_status?.code;
        return status; // Adjust this based on your actual structure
      },
      headerName: "Cancel",
      width: 110,
      pinned: "right",
      onCellClicked: (params) => onCancelClicked(params.data),
      cellRenderer: ({ value }) => {
        // const status = value[value?.length - 1]?.commande_status?.code;
        return (
          <div className="flex items-center justify-center ">
            {value === "CANCELED" || value === "DELIVERED" ? (
              <span className="px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3">
                N/A
              </span>
            ) : (
              <button className="btn btn-outline btn-xs btn-error mt-2">
                X
              </button>
            )}
          </div>
        );
      },
    },
    {
      field: "updated_at",
      // valueGetter: ({ data }) => {
      // 	const status = data?.commande_commande_statuses[data?.commande_commande_statuses?.length - 1]?.commande_status?.code;
      // 	return status; // Adjust this based on your actual structure
      // },
      headerName: "Position",
      width: 110,
      pinned: "right",
      onCellClicked: (params) => onPositionClicked(params.data),
      cellRenderer: (_) => {
        return (
          <div className="flex items-center justify-center ">
            <button className="btn btn-outline btn-ghost btn-sm mt-2">
              <CiGps className="" />
            </button>
          </div>
        );
      },
    },
  ]);

  const columnDefsSm = useMemo(() => [
    {
      field: "id",
      headerName: "Command ID",
      width: 110,
      pinned: true,
      filterParams: "agNumberColumnFilter",
      // filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p
            className={classNames(
              "px-3 py-1 uppercase leading-wide font-bold text-primary",
            )}
          >
            {value}
          </p>
          // </div>
        );
      },
    },

    {
      field: "total",
      headerName: "Total Paid",
      width: 120,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {parseInt(value) || "N/A"}
          </div>
        );
      },
    },

    {
      field: "livreur",
      headerName: "Livreur",
      width: 170,
      // pinned: 'right',
      filterParams: containFilterParams,
      onCellClicked: (params) => onChangeLivreur(params.data),
      cellRenderer: ({ value }) => {
        return (
          <>
            {value && (
              <div className="grid grid-row-2 text-xs font-semibold hover:cursor-pointer">
                <p
                  className={classNames("p-1 uppercase leading-wide")}
                >{`${value?.last_name} ${value?.first_name}`}</p>
                <p
                  className={classNames("p-1 uppercase leading-wide")}
                >{`${value?.whatsapp}`}</p>
              </div>
            )}
          </>
        );
      },
    },

    {
      // field: 'commande_commande_statuses',
      headerName: "Status",
      width: 130,
      valueGetter: ({ data }) => {
        const status =
          data?.commande_commande_statuses[
            data?.commande_commande_statuses?.length - 1
          ]?.commande_status?.code;
        return status; // Adjust this based on your actual structure
      },
      // pinned: 'right',
      // filter: 'agDateColumnFilter',
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        // const status = value[value?.length - 1]?.commande_status?.code;
        return (
          <span
            className={classNames(
              "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3",
              value === "PENDING"
                ? "bg-lime-100 text-lime-700"
                : value === "REGISTERED"
                ? "bg-yellow-100 text-yellow-700"
                : value === "INPROCESS"
                ? "bg-blue-100 text-blue-700"
                : value === "INDELIVERY"
                ? "bg-orange-100 text-orange-700"
                : value === "DELIVERED"
                ? "bg-green-100 text-green-700"
                : value === "CANCELED"
                ? "bg-red-100 text-red-700"
                : null,
            )}
          >
            {value}
          </span>
        );
      },
    },
    {
      field: "merchant.name",
      headerName: "Merchant Name",
      width: 170,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p className={classNames("p-1 uppercase leading-wide")}>{value}</p>
          // </div>
        );
      },
    },
    {
      field: "merchant.client.phone_number",
      headerName: "Merchant Number",
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDetailsClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p
            className={classNames("px-3 py-1 uppercase leading-wide font-bold")}
          >
            {value}
          </p>
          // </div>
        );
      },
    },
  ]);

  const onButtonClick = () => {
    // Command ID,,"Action","Cancel","Position"
    const csvData = gridRef.current.api.getDataAsCsv({
      // columnKeys: [
      // 	'Command ID',
      // 	'Client',
      // 	'Merchant Name',
      // 	'Merchant Number',
      // 	'Total Paid',
      // 	'Balance Share',
      // 	'Bonus Share',
      // 	'Service Fee',
      // 	'Total Article',
      // 	'Payment Method',
      // 	'Status',
      // 	'Livreur',
      // 	'Registration Date',
      // ],
    });
    console.log(gridRef.current.api);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `exported_orders_data_from_${dateValues?.startDate}_to_${dateValues?.endDate}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResize = () => {
    if (gridRef.current && gridRef.current.api) {
      if (window.innerWidth < 576) {
        // Screen size for 'sm' is generally <576px
        gridOptions.columnApi.setColumnsVisible(
          [
            "client.phone_number",
            "balance_share",
            "bonus_share",
            "service_fee",
            "total_articles",
            "payment_method",
            "created_at",
            "updated_at",
            "code",
            "commande_commande_statuses",
          ],
          false,
        );
      } else {
        gridOptions.columnApi.setColumnsVisible(
          [
            "client.phone_number",
            "balance_share",
            "bonus_share",
            "service_fee",
            "total_articles",
            "payment_method",
            "created_at",
            "updated_at",
            "code",
            "commande_commande_statuses",
          ],
          true,
        );
      }
    }
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    // Set initial visibility based on current screen width
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <div className="overflow-hidden mt-3">
        {!isLoading && (
          <>
            <div className="flex justify-end mb-4 mt-2 gap-5">
              {showSelectedMap?.length ? (
                <div className="flex items-center justify-center">
                  <button
                    className="btn btn-outline btn-secondary btn-sm"
                    onClick={() => {
                      const selectedRows =
                        gridRef.current.api.getSelectedRows();
                      console.log(selectedRows);
                      dispatch(
                        openModal({
                          title: "Positions",
                          extraObject: {
                            orders: selectedRows,
                            selectedRows: true,
                          },
                          bodyType: MODAL_BODY_TYPES.ORDER_POSITION,
                          size: "lg",
                        }),
                      );
                    }}
                  >
                    <CiGps className="mx-2" /> SELECTED POSITIONS
                  </button>
                </div>
              ) : (
                <></>
              )}

              <div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={onButtonClick}
                >
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
                    console.log(
                      "gridOptions.api.paginationPageSize",
                      gridOptions.api.paginationProxy.pageSize,
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

            <div className="ag-theme-alpine">
              <AgGridReact
                ref={gridRef}
                gridOptions={gridOptions}
                columnDefs={columnDefs}
                rowData={orders}
                defaultColDef={AG_GRID_DEFAULT_COL_DEF}
                pagination={true}
                rowHeight={50}
                paginationPageSize={20}
                paginationPageSizeOptions={[10, 20, 50]}
                suppressRowDeselection={false}
                // suppressPaginationPanel={true}
                onPaginationChanged={async (params) => {
                  adjustGridHeight(params.api); // Adjust height
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
                    localStorage.setItem(
                      "oldPage",
                      JSON.stringify(currentPage),
                    );
                    await onLoad();
                    const pageToNavigate = JSON.parse(
                      localStorage.getItem("oldPage"),
                    );
                    params.api.paginationGoToPage(pageToNavigate);
                  }
                }}
                onFirstDataRendered={(params) => {
                  adjustGridHeight(params.api); // Adjust height
                  handleResize();
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
                // onFilterChanged={function (gridOptions) {
                // 	console.log(gridOptions);
                // 	const searchedField = gridOptions?.columns[0]?.colId;
                // 	if (searchedField === 'id') {
                // 		const filterInstanceId = gridOptions.api.getFilterInstance('id');
                // 		const filterValueId = filterInstanceId ? filterInstanceId.getModel() : null;
                // 		console.log('searchedField', searchedField);
                // 		if (filterValueId) {
                // 			const searchPattern = filterValueId?.filter; // Access the filter value
                // 			console.log('Search pattern1:', searchPattern);
                // 			updateFormValue({ key: 'searchPatternId', value: searchPattern });
                // 			// Perform your search or update logic here with searchPattern
                // 		}
                // 	} else if (searchedField === 'client.phone_number') {
                // 		const filterInstanceMerchantNumber = gridOptions.api.getFilterInstance('client.phone_number');
                // 		const filterValueMerchantNumber = filterInstanceMerchantNumber ? filterInstanceMerchantNumber.getModel() : null;
                // 		if (filterValueMerchantNumber) {
                // 			const searchPattern = filterValueMerchantNumber?.filter; // Access the filter value
                // 			console.log('Search pattern1:', searchPattern);
                // 			// updateFormValue({ key: 'searchPattern', value: searchPattern });
                // 			// Perform your search or update logic here with searchPattern
                // 		}
                // 	}
                // 	// filterValue will contain the current filter value
                // }}
                onSelectionChanged={(val) => {
                  adjustGridHeight(val.api); // Adjust height
                  console.log(val.api.getSelectedRows());
                  setShowSelectedMap((_) => [...val.api.getSelectedRows()]);
                  // 	const selectedObject = val.api.getSelectedRows()[0];
                  // 	openModal({
                  // 		...annualCheckupModalConfig,
                  // 		title: selectedObject.label,
                  // 		extraObject: {
                  // 			data: selectedObject,
                  // 			config: { openInReadOnlyMode: true },
                  // 		},
                  // 	});
                }}
                // onFilterChanged={onFilterChanged}
                // onFilterChanged={onFilterChanged}
                // onRowClicked={onGridReady}
                // onFilterChanged={(params) => {
                // 	console.log('params.api.getFilterModel()', params.api.getFilterModel());
                // 	// this.filterState = params.api.getFilterModel();
                // 	params.api.setFilterModel(params.api.getFilterModel());
                // }}
                // onRowClicked={(params) => {
                // 	// Your row click logic...
                // 	// ...
                // 	// Restore the filter state:
                // 	if (params.api.getFilterModel()) {
                // 		console.log('Clicked params.api.getFilterModel()', params.api.getFilterModel());
                // 		params.api.setFilterModel(params.api.getFilterModel());
                // 	}
                // }}
                // rowSelection='single'
                rowSelection="multiple"
              />
            </div>
            {/*<div className="ag-theme-alpine h-[40rem] sm:hidden">*/}
            {/*  sm*/}
            {/*  <AgGridReact*/}
            {/*    // ref={gridRefSm}*/}
            {/*    gridOptions={gridOptions}*/}
            {/*    columnDefs={columnDefsSm}*/}
            {/*    rowData={orders}*/}
            {/*    defaultColDef={AG_GRID_DEFAULT_COL_DEF}*/}
            {/*    pagination={true}*/}
            {/*    rowHeight={40}*/}
            {/*    paginationPageSize={20}*/}
            {/*    paginationPageSizeOptions={[10, 20, 50]}*/}
            {/*    suppressRowDeselection={false}*/}
            {/*    onPaginationChanged={async (params) => {*/}
            {/*      adjustGridHeight(params.api); // Adjust height*/}
            {/*      let currentPage = params.api.paginationGetCurrentPage();*/}
            {/*      let totalPages = params.api.paginationGetTotalPages();*/}
            {/*      console.log(currentPage, totalPages);*/}
            {/*      if (params.newPage) {*/}
            {/*        localStorage.setItem(*/}
            {/*          "currentPage",*/}
            {/*          JSON.stringify(currentPage),*/}
            {/*        );*/}
            {/*        localStorage.removeItem("oldPage");*/}
            {/*      }*/}
            {/*      if (*/}
            {/*        currentPage === totalPages - 1 &&*/}
            {/*        currentPage !== 0 &&*/}
            {/*        currentPage !== 0*/}
            {/*      ) {*/}
            {/*        localStorage.setItem(*/}
            {/*          "oldPage",*/}
            {/*          JSON.stringify(currentPage),*/}
            {/*        );*/}
            {/*        await onLoad();*/}
            {/*        const pageToNavigate = JSON.parse(*/}
            {/*          localStorage.getItem("oldPage"),*/}
            {/*        );*/}
            {/*        params.api.paginationGoToPage(pageToNavigate);*/}
            {/*      }*/}
            {/*    }}*/}
            {/*    onFirstDataRendered={(params) => {*/}
            {/*      adjustGridHeight(params.api); // Adjust height*/}
            {/*      const pageToNavigate = JSON.parse(*/}
            {/*        localStorage.getItem("currentPage"),*/}
            {/*      );*/}
            {/*      const oldPageToNavigate = JSON.parse(*/}
            {/*        localStorage.getItem("oldPage"),*/}
            {/*      );*/}
            {/*      params.api.paginationGoToPage(*/}
            {/*        oldPageToNavigate ? oldPageToNavigate : pageToNavigate,*/}
            {/*      );*/}
            {/*    }}*/}
            {/*    onSelectionChanged={(val) => {*/}
            {/*      adjustGridHeight(val.api); // Adjust height*/}
            {/*      console.log(val.api.getSelectedRows());*/}
            {/*      setShowSelectedMap((_) => [...val.api.getSelectedRows()]);*/}
            {/*    }}*/}
            {/*    rowSelection="single"*/}
            {/*  />*/}
            {/*</div>*/}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientOrdres;
