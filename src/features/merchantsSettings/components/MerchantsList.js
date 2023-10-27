import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import {
  AvatarCell,
  AvatarCellForMerchant,
  DateCell,
  MerchantArticlesAndAccompagnementPill,
} from "../../../components/Table/Table";
import Table from "../../../components/Table/Table";
import { AG_GRID_DEFAULT_COL_DEF } from "../../../utils/globalConstantUtil";
import { classNames } from "../../../components/Common/UtilsClassNames";
import moment from "moment";

const containFilterParams = {
  filterOptions: ["contains", "notContains"],
  debounceMs: 200,
  maxNumConditions: 1,
};

const MerchantsList = ({ onLoadMerchants, currPage, updateFormValue }) => {
  const dispatch = useDispatch();
  const { merchants, from, isLoading, noMoreQuery } = useSelector(
    (state) => state.merchant,
  );

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 150,
      filter: true,
      sortable: true,
    };
  }, []);

  // Opening right sidebar for user details
  const openMerchantDetails = (merchant) => {
    dispatch(
      openModal({
        title: `Details View - ${merchant?.name} (${merchant?.whatsapp})`,
        size: "lg",
        bodyType: MODAL_BODY_TYPES.MERCHANT_SETTINGS_DETAILS,
        extraObject: merchant,
      }),
    );
  };

  const columnDefs = useMemo(() => [
    {
      field: "id",
      headerName: "Merchant ID",
      // width: 170,
      flex: 2,
      pinned: true,
      // filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
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
      field: "name",
      headerName: "Name",
      flex: 2,
      // width: 260,
      filterParams: containFilterParams,
      pinned: true,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          // <div className='flex items-center justify-center'>
          <p className="uppercase break-all overflow-hidden font-semibold">
            {value}
          </p>
          // </div>
        );
      },
    },
    {
      field: "articles",
      headerName: "Articles",
      flex: 2,
      // width: 210,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {value?.length + " art" || "N/A"}
          </div>
        );
      },
    },
    {
      field: "accompagnements",
      headerName: "Accompagnements",
      flex: 2,
      // width: 210,
      filterParams: containFilterParams,
      onCellClicked: (params) => openMerchantDetails(params.data),
      cellRenderer: ({ value }) => {
        return (
          <div className="flex items-center justify-center font-semibold">
            {value?.filter((acc) => acc.is_deleted === false)?.length +
              " acc" || "N/A"}
          </div>
        );
      },
    },

    {
      field: "created_at",
      headerName: "Registration Date",
      flex: 2,
      // width: 170,
      filter: "agDateColumnFilter",
      onCellClicked: (params) => openMerchantDetails(params.data),
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
  ]);

  return (
    <div className="overflow-hidden mt-2">
      {!isLoading && (
        <>
          <div className="ag-theme-alpine h-[40rem]">
            <AgGridReact
              columnDefs={columnDefs}
              rowData={merchants}
              defaultColDef={AG_GRID_DEFAULT_COL_DEF}
              pagination={true}
              paginationPageSize={20}
              rowHeight={50}
              onFilterChanged={function (gridOptions) {
                const filterInstanceId =
                  gridOptions.api.getFilterInstance("id");
                const filterValueId = filterInstanceId
                  ? filterInstanceId.getModel()
                  : null;
                const filterInstanceTitle =
                  gridOptions.api.getFilterInstance("title");
                const filterValueTitle = filterInstanceTitle
                  ? filterInstanceTitle.getModel()
                  : null;

                // filterValue will contain the current filter value
                if (filterValueId || filterValueTitle) {
                  const searchPattern1 = filterValueId?.filter; // Access the filter value
                  const searchPattern2 = filterValueTitle?.filter; // Access the filter value
                  console.log("Search pattern1:", searchPattern1);
                  console.log("Search pattern:", searchPattern2);
                  // Perform your search or update logic here with searchPattern
                }
              }}
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
          {/* <Table
						columns={columns}
						data={articles}
						currPage={currPage}
						onLoad={onLoadMerchants}
						updateFormValue={updateFormValue}
						// showFilter
					/> */}
        </>
      )}
    </div>
  );
};

export default MerchantsList;
