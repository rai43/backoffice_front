import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import cliTruncate from "cli-truncate";
import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination,
  useRowSelect,
} from "react-table";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  XMarkIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Button, PageButton } from "../Common/Button";
import { SortDownIcon, SortIcon, SortUpIcon } from "../Common/SortIcons";
import { classNames } from "../Common/UtilsClassNames";
import InputCheckbox from "../Input/InputCheckbox";
import streetLogo from "../../assets/street_logo.jpeg";
import InfoText from "../Typography/InfoText";

export function IdDisplay({ value, onDetailsClicked }) {
  return (
    // <div className='flex items-center justify-center'>
    <span
      className={
        "px-3 py-2 uppercase leading-wide font-bold text-md bg-gray-50 text-gray-600 rounded-full shadow-sm hover:cursor-pointer"
      }
      onClick={() => onDetailsClicked()}
    >
      {value}
    </span>
    // </div>
  );
}

export function SimplePill({ value, column, row, color }) {
  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
        color?.startsWith("blue") ? "bg-blue-100 text-blue-700" : null,
        color?.startsWith("green") ? "bg-green-100 text-green-700" : null,
        color?.startsWith("orange") ? "bg-yellow-100 text-yellow-700" : null,
        color.startsWith("red") ? "bg-red-100 text-red-700" : null,
        !color ? "bg-gray-100 text-gray-700" : null,
      )}
    >
      {value || 0} FCFA
    </span>
  );
}

export function DeliveryStatusPill({ value }) {
  const status = value ? value.toLocaleUpperCase() : "unknown";
  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
        status?.startsWith("DELIVERED") ? "bg-green-100 text-green-700" : null,
        status?.startsWith("PENDING") ||
          status?.startsWith("INPROCESS") ||
          status?.startsWith("REGISTERED") ||
          status?.startsWith("INDELIVERY") ||
          status?.startsWith("INPROGRESS")
          ? "bg-yellow-100 text-yellow-700"
          : null,
        status.startsWith("unknown") || status.startsWith("CANCELED")
          ? "bg-red-100 text-red-700"
          : null,
      )}
    >
      {value}
    </span>
  );
}

export function BasicPhoneNumber({ value }) {
  return (
    // <div className='flex items-center justify-center'>
    <span
      className={
        "px-3 py-2 uppercase leading-wide font-semibold text-primary text-md"
      }
    >
      +225 {value}
    </span>
    // </div>
  );
}

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  setSearchPattern,
}) {
  const count = preGlobalFilteredRows?.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || "");
    setSearchPattern({ key: "searchPattern", value: value || "" });
  }, 200);

  return (
    <label className="flex gap-x-2 items-baseline">
      {/*<span className="text-gray-700">Search: </span>*/}
      <input
        type="text"
        className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`Search here ...`}
      />
    </label>
  );
}

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <label className="flex gap-x-2 items-baseline">
      <select
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="">{render("Header")}</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MerchantArticlesAndAccompagnementPill({
  value,
  column,
  row,
  type,
}) {
  const count = value?.length || 0;

  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
        type?.startsWith("article") && count > 0
          ? "bg-green-100 text-green-700"
          : null,
        type?.startsWith("accompagnement") && count > 0
          ? "bg-indigo-100 text-indigo-700"
          : null,
        count === 0 ? "bg-stone-100 text-stone-700" : null,
      )}
    >
      {count} {`${count > 1 ? type : ""}${count > 1 ? "s" : ""}`}
    </span>
  );
}

export function AccountTypePill({ value, column, row }) {
  const TYPE_OBJ = row.original[column.clientTypeAccessor];
  const status = value ? value.toLowerCase() : "unknown";

  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
        TYPE_OBJ?.code?.startsWith("march")
          ? "bg-green-100 text-green-700"
          : null,
        TYPE_OBJ?.code?.startsWith("perso")
          ? "bg-yellow-100 text-yellow-700"
          : null,
        status.startsWith("unknown") ? "bg-red-100 text-red-700" : null,
      )}
    >
      {status}
    </span>
  );
}

export function StatusPill({ value, column, row }) {
  const status = value ? value.toLowerCase() : "unknown";

  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
        status.startsWith("active") ? "bg-green-100 text-green-700" : null,
        status.startsWith("inactive") ? "bg-yellow-100 text-yellow-700" : null,
        status.startsWith("offline") ? "bg-red-100 text-red-700" : null,
      )}
    >
      {status}
    </span>
  );
}

export function StatusRechargementPill({ value }) {
  const status = value ? value.toLowerCase() : "unknown";

  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
        status === "done" || status === "success"
          ? "bg-green-100 text-green-700"
          : null,
        status === "pending" ? "bg-yellow-100 text-yellow-700" : null,
        status === "failed" ? "bg-red-100 text-red-700" : null,
      )}
    >
      {status}
    </span>
  );
}

export function OperatorPill({ value, column, row }) {
  const operatorObj = row.original[column.operatorObj];
  const operator = value ? value.toLowerCase() : "unknown";

  return (
    <>
      <div className="flex items-center cursor-pointer">
        <div className="flex-shrink-0 h-10 w-10">
          <img
            className="h-10 w-10 rounded-full"
            src={operatorObj?.logo ? operatorObj.logo : streetLogo}
            // src={row.original[column.imgAccessor]}
            alt=""
          />
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium">{operator}</div>
          <div className={`text-sm text-base-`}>
            Cash Operation:{" "}
            <span
              className={`mx-2 ${
                operator?.is_cash ? "text-error" : "text-success"
              }`}
            >
              {operator?.is_cash ? "YES" : "NO"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function DateCell({ value, column, row }) {
  let formattedValue = value ? value : "N/A";

  if (formattedValue !== "N/A") {
    formattedValue = moment.utc(value).format("LLL");
  }

  return (
    <span className="f text-xs">{formattedValue?.toLocaleUpperCase()}</span>
  );
}

export function WalletCellBalance({ column, row }) {
  const WALLETS = row.original[column.accessorObj];

  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => console.log(row.original)}
    >
      <div className="ml-4">
        {WALLETS.map(
          (wallet) =>
            wallet?.wallet_type?.libelle !== "CREDIT_SELLER" && (
              <div
                key={wallet.id}
                className="text-sm font-medium text-gray-900 my-2"
              >
                <span
                  className={classNames(
                    "px-3 py-1  uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
                    wallet?.wallet_type?.libelle.startsWith("MERCHANT")
                      ? "bg-violet-100 text-violet-700"
                      : null,
                    wallet?.wallet_type?.libelle.startsWith("PERSONAL")
                      ? "bg-blue-100 text-blue-700"
                      : null,
                    wallet?.wallet_type?.libelle.startsWith("LIVREUR")
                      ? "bg-teal-100 text-teal-700"
                      : null,
                    // wallet?.wallet_type?.libelle.startsWith('MERCHANT') && (wallet?.balance || 0) > 0 ? 'bg-violet-100 text-violet-700' : null,
                    // wallet?.wallet_type?.libelle.startsWith('PERSONAL') && (wallet?.balance || 0) > 0 ? 'bg-blue-100 text-blue-700' : null
                  )}
                >
                  {wallet?.wallet_type?.libelle + " WALLET: "}{" "}
                  <span className="font-semibold">
                    {(wallet?.balance || 0) + " CFA"}
                  </span>
                </span>
                {/*{wallet?.wallet_type?.libelle + " WALLET: "} {}*/}
              </div>
            ),
        )}
      </div>
    </div>
  );
}

export function RechargementPreviousBalance({ value, column, row }) {
  const previousAmount = row.original[column.previousAmountAccessor];
  const previousBonus = row.original[column.previousBonusAccessor];
  const amount = row.original[column.amountAccessor];
  const wallet = row.original[column.walletAccessor];

  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => console.log(row.original)}
    >
      <div className="">
        <div className="text-sm font-medium text-gray-900 my-2">
          <span
            className={classNames(
              " py-1 uppercase leading-wide font-bold text-xs",
            )}
          >
            {amount ? "" : "Balance: "}
            <span
              className={
                "font-semibold " + amount && !previousBonus
                  ? "text-primary"
                  : ""
              }
            >
              {wallet ? wallet.balance : amount ? value : previousAmount || 0}{" "}
              CFA
            </span>
          </span>
          {!amount ? (
            <span
              className={classNames(
                "px-3 py-1 uppercase leading-wide font-bold text-xs ",
              )}
            >
              Bonus:{" "}
              <span className="font-semibold">
                {wallet ? wallet.bonus : previousBonus || 0} CFA
              </span>
            </span>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export function WalletCellBonus({ column, row }) {
  const WALLETS = row.original[column.accessorObj];

  return (
    <div
      className="flex items-center cursor-pointer"
      // onClick={() => console.log(row.original)}
    >
      <div className="ml-4">
        {WALLETS.map(
          (wallet) =>
            wallet?.wallet_type?.libelle !== "CREDIT_SELLER" && (
              <div
                key={wallet.id}
                className="text-sm font-medium text-gray-900 my-2"
              >
                <span
                  className={classNames(
                    "px-3 py-1 bg-base-200 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
                    wallet?.wallet_type?.libelle.startsWith("MERCHANT")
                      ? "bg-violet-100 text-violet-700"
                      : null,
                    wallet?.wallet_type?.libelle.startsWith("PERSONAL")
                      ? "bg-blue-100 text-blue-700"
                      : null,
                    wallet?.wallet_type?.libelle.startsWith("LIVREUR")
                      ? "bg-teal-100 text-teal-700"
                      : null,
                    // wallet?.wallet_type?.libelle.startsWith('MERCHANT') && (wallet?.bonus || 0) > 0 ? 'bg-violet-100 text-violet-700' : null,
                    // wallet?.wallet_type?.libelle.startsWith('PERSONAL') && (wallet?.bonus || 0) > 0 ? 'bg-blue-100 text-blue-700' : null
                  )}
                >
                  {wallet?.wallet_type?.libelle + " WALLET: "}{" "}
                  <span className="font-semibold">
                    {(wallet?.bonus || 0) + " CFA"}
                  </span>
                </span>
                {/*{wallet?.wallet_type?.libelle + " WALLET: "} {}*/}
              </div>
            ),
        )}
      </div>
    </div>
  );
}

export function ActionButtons({
  value,
  column,
  row,
  onEditClicked,
  onDeleteClicked,
}) {
  const TYPE_OBJ = row.original[column.clientTypeAccessor.split(".")[0]];
  const NAME = row.original[column.nameAccessor];
  const MERCHANT_NAME = row.original[column.merchantNameAccessor];
  return (
    <div className="w-20 grid grid-cols-2 gap-2">
      <button
        className="btn btn-sm btn-circle btn-ghost btn-outline"
        onClick={() => onEditClicked(row.original)}
      >
        <PencilIcon className="h-4 w-4" />
      </button>
      <button
        className="btn btn-sm btn-circle btn-error btn-outline"
        onClick={() => onDeleteClicked(row.original)}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function BasicAvatarCellNoLink({ value, column, row }) {
  const MERCHANT_OBJ = row.original[column.merchantObjAccessor];
  return (
    <div className="flex items-center cursor-pointer">
      <div className="flex-shrink-0 h-10 w-10">
        <img
          className="h-10 w-10 rounded-full"
          src={row.original?.photo ? row.original?.photo : streetLogo}
          alt="STREET"
        />
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{value}</div>
        <div className={`text-sm text-primary`}>MERCHANT</div>
      </div>
    </div>
  );
}

export function AvatarCellForMerchant({
  value,
  column,
  row,
  onDetailsClicked,
}) {
  const TYPE_OBJ = row.original[column.clientTypeAccessor.split(".")[0]];
  const NAME = row.original[column.nameAccessor];
  const MERCHANT_NAME = row.original[column.merchantNameAccessor];
  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => onDetailsClicked(row.original)}
    >
      <div className="flex-shrink-0 h-10 w-10">
        <img
          className="h-10 w-10 rounded-full"
          src={
            row.original?.logo && row.original?.logo?.startsWith("http")
              ? row?.original?.logo
              : streetLogo
          }
          // src={row.original[column.imgAccessor]}
          alt=""
        />
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">
          {value} {NAME ? `(${NAME})` : ""}
        </div>
        <div className={`text-sm text-primary`}>MERCHANT</div>
      </div>
    </div>
  );
}

export function AvatarCell({ value, column, row, onDetailsClicked }) {
  const TYPE_OBJ = row.original[column.clientTypeAccessor.split(".")[0]];
  const NAME = row.original[column.nameAccessor];
  const MERCHANT_NAME = row.original[column.merchantNameAccessor];
  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => onDetailsClicked(row.original)}
    >
      <div className="flex-shrink-0 h-10 w-10">
        <img
          className="h-10 w-10 rounded-full"
          src={
            row.original?.photo && row.original?.photo?.startsWith("http")
              ? row.original?.photo
              : streetLogo
          }
          // src={row.original[column.imgAccessor]}
          alt=""
        />
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">
          {value} {NAME ? `(${NAME})` : ""}
        </div>
        <div
          className={`text-sm  ${
            TYPE_OBJ["code"] === "MARCH" ? "text-primary" : "text-gray-500"
          }`}
        >
          {MERCHANT_NAME
            ? cliTruncate(MERCHANT_NAME.toLocaleUpperCase(), 15)
            : TYPE_OBJ[column.clientTypeAccessor.split(".")[1]] || "N/A"}
        </div>
      </div>
    </div>
  );
}

export function ReferenceAndPaymentTypeCell({
  value,
  column,
  row,
  onDetailsClicked,
}) {
  let paymentType = row.original[column.paymentTypeObjAccessor];

  const libelle =
    column.paymentTypeObjAccessor === "type"
      ? paymentType
      : paymentType?.libelle;

  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => onDetailsClicked(row.original)}
    >
      <div className="">
        <div className="text-sm text-gray-900 font-semibold">{value}</div>
        <div className={`text-xs text-primary`}>{libelle || ""}</div>
      </div>
    </div>
  );
}

export function CashFlowCell({ value, column, row, phoneNumber }) {
  const senderObj = row.original[column.SenderObjAccessor];
  const receiverObj = row.original[column.ReceiverObjAccessor];
  const transactionTypeObj = row.original[column.transactionTypeObjAccessor];

  const isMobileMoneyTransaction =
    transactionTypeObj?.code === "RECHARGEMENT_MOBILE_MONEY";

  const senderPhoneNumber = senderObj?.client?.phone_number || "N/A";
  const formattedSenderPhoneNumber =
    (senderPhoneNumber !== "N/A" ? "+225 " : "") + senderPhoneNumber;
  const receiverPhoneNumber = receiverObj?.client?.phone_number;

  return (
    <div className="flex items-center cursor-pointer">
      <div className="ml-4">
        <div className="text-sm text-gray-900 font-semibold">
          <div className="badge badge-xs badge-error"></div>
          <span className="mx-3">
            {isMobileMoneyTransaction
              ? "MOBILE MONEY"
              : formattedSenderPhoneNumber
              ? formattedSenderPhoneNumber
              : "N/A"}
          </span>
        </div>
        <div className="text-sm text-gray-900 font-semibold mt-1">
          <div className="badge badge-xs badge-success"></div>
          <span className="mx-3">
            {receiverPhoneNumber ? "+225 " + receiverPhoneNumber : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AmountCell({ value, client, column, row }) {
  const senderPhoneNumber =
    row.original[column.SenderObjAccessor]?.client?.phone_number;

  const originalClientPhoneNumber = client?.phone_number;

  const transactionFromClient = originalClientPhoneNumber === senderPhoneNumber;

  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm",
        transactionFromClient
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700",
      )}
    >
      {value} FCFA
    </span>
  );
}

export const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  },
);
export function Table({
  columns,
  data,
  currPage,
  onLoad,
  updateFormValue,
  showFilter,
  firstActionButton,
}) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    rows,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
  );
  useEffect(() => {
    // setPageSize(5);
    gotoPage(currPage);
    // gotoPage(pageCount - 1);
  }, []);

  // Render the UI for your table
  return (
    <>
      {showFilter ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-x-5 lg:gap-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="w-full flex items-center justify-center">
              {firstActionButton}
            </div>
          </div>
          <div className="md:col-end-3">
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
              setSearchPattern={updateFormValue}
            />
          </div>
        </div>
      ) : (
        <></>
      )}

      <div className="grid grid-cols-3 gap-2">
        {headerGroups.map((headerGroup) =>
          headerGroup.headers.map((column) =>
            column.Filter ? (
              <div className="" key={column.id}>
                {column.render("Filter")}
              </div>
            ) : null,
          ),
        )}
      </div>
      {rows.length ? (
        <>
          <div className="mt-2 flex flex-col bg-base-200">
            <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <div className="flex flex-col">
                    <div className="flex-grow overflow-auto max-h-screen">
                      <table
                        {...getTableProps()}
                        className="relative w-full"
                        // className="min-w-full divide-y divide-gray-200 "
                      >
                        <thead className="bg-gray-50">
                          {headerGroups.map((headerGroup) => (
                            <tr
                              {...headerGroup.getHeaderGroupProps()}
                              className="sticky top-0 bg-gray-50"
                            >
                              {headerGroup.headers.map((column) => (
                                // Add the sorting props to control sorting. For this example
                                // we can add them into the header props
                                <th
                                  scope="col"
                                  className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  {...column.getHeaderProps(
                                    column.getSortByToggleProps(),
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    {column.render("Header")}
                                    {/* Add a sort direction indicator */}
                                    <span>
                                      {column.isSorted ? (
                                        column.isSortedDesc ? (
                                          <SortDownIcon className="w-4 h-4 text-gray-400" />
                                        ) : (
                                          <SortUpIcon className="w-4 h-4 text-gray-400" />
                                        )
                                      ) : (
                                        <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                      )}
                                    </span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody
                          {...getTableBodyProps()}
                          className="bg-white divide-y divide-gray-200 overflow-y-scroll"
                        >
                          {page.map((row, i) => {
                            prepareRow(row);
                            return (
                              <tr
                                {...row.getRowProps()}
                                className=""
                                // onClick={() => console.log("row clickd", i, row)}
                              >
                                {row.cells.map((cell) => {
                                  return (
                                    <td
                                      {...cell.getCellProps()}
                                      className="px-6 py-4 whitespace-nowrap"
                                      role="cell"
                                    >
                                      {cell.column.Cell.name ===
                                      "defaultRenderer" ? (
                                        <div className="text-sm text-gray-500">
                                          {cell.render("Cell")}
                                        </div>
                                      ) : (
                                        cell.render("Cell")
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <InfoText styleClasses={"md:grid-cols-2 mt-3"}>
          No record found ...
        </InfoText>
      )}
      {/* Pagination */}
      <div className="py-3 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
            Previous
          </Button>
          <Button onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex gap-x-2">
            <span className="text-sm text-gray-700 mt-3">
              Page <span className="font-medium">{state.pageIndex + 1}</span> of{" "}
              <span className="font-medium">{pageOptions.length}</span>
            </span>
            <label>
              {/* <span className='sr-only'>Items Per Page</span> */}
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={state.pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                }}
              >
                {[5, 10, 20].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <PageButton
                className="rounded-l-md"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">First</span>
                <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
              </PageButton>
              <PageButton
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </PageButton>
              <PageButton
                onClick={async () => {
                  // console.log("pageCount - 1", pageCount - 1);
                  if (!canNextPage) {
                    await onLoad(state.pageIndex);
                    // console.log("currPage", currPage);
                  } else {
                    nextPage();
                  }
                }}
                // onClick={() => nextPage()}
                // disabled={!canNextPage}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </PageButton>
              <PageButton
                className="rounded-r-md"
                onClick={async () => {
                  // console.log("pageCount - 1", pageCount - 1);
                  if (!canNextPage) {
                    await onLoad(state.pageIndex);
                    // console.log('currPage', currPage);
                  } else {
                    gotoPage(pageCount - 1);
                  }
                  // console.log("currPage:: ", currPage);
                }}
                // disabled={!canNextPage}
              >
                <span className="sr-only">Last</span>
                <ChevronDoubleRightIcon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </PageButton>
            </nav>
          </div>
        </div>
      </div>
      {/*<p>Selected Rows: {Object.keys(state.selectedRowIds).length}</p>*/}
      {/* <pre>
						<code>
							{JSON.stringify(
								{
									selectedRowIds: state.selectedRowIds,
									'selectedFlatRows[].original': selectedFlatRows.map((d) => d.original),
								},
								null,
								2
							)}
						</code>
					</pre>
					<div>
						<pre>
							<code>{JSON.stringify(state, null, 2)}</code>
						</pre>
					</div> */}
    </>
  );
}

export default Table;
