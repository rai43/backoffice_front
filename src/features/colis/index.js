import React, { useState, useEffect, useMemo } from 'react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useFormik } from 'formik';
import moment from 'moment/moment';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';

import { BiHide, BiShow } from 'react-icons/bi';
import { CiSearch, CiShoppingTag } from 'react-icons/ci';
import { FaAmazonPay } from 'react-icons/fa';
import { IoCreateOutline } from 'react-icons/io5';
import { MdOutlineDeliveryDining } from 'react-icons/md';
import { PiQrCodeThin } from 'react-icons/pi';
import { TbError404 } from 'react-icons/tb';

import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';

import ColisList from './components/ColisList';
import { getColis, resetForm } from './parcelsManagementSlice';
import InfoText from '../../components/Typography/InfoText';
import NotFoundPage from '../../pages/authenticated/404';
import { STATUS_ICON_NAMES } from '../../utils/colisUtils';
import groupColisByDeliveryLivreurPhone from '../../utils/functions/groupColisByDeliveryLivreurPhone';
import { MODAL_BODY_TYPES, TABS_ENUMERATION_IN_COLIS } from '../../utils/globalConstantUtil';
import { openModal } from '../common/modalSlice';
import {
  resetTableParcelsManagementSettings,
  setPaginationSize,
  setFrom,
  setTo
} from '../common/parcelsManagementTableSlice';

const gridOptions = {
  paginationPageSize: 20,
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const ParcelsManagement = () => {
  const dispatch = useDispatch();
  const [showStats, setShowStats] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS_ENUMERATION_IN_COLIS.active_parcels);
  const [colisInfo, setColisInfo] = useState();

  const { from, to, paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.parcelsManagementTable
  );

  const {
    colis,
    skip,
    isLoading,
    noMoreQuery,
    totalCount,

    pendingCount,
    assignedForCollectionCount,
    collectionInProgressCount,
    collectedCount,

    assignedForDeliveryCount,
    deliveryInProgressCount,
    deliveredCount,

    articleToReturnCount,
    assignedForReturnCount,
    returnInProgressCount,
    returnedCount
  } = useSelector((state) => state.parcelsManagement);

  const INITIAL_WALLET_FILTER_OBJ = {
    from: from,
    to: to
  };

  const formik = useFormik({
    initialValues: INITIAL_WALLET_FILTER_OBJ
  });

  const [dateValue, setDateValue] = useState({
    startDate: formik.values.from,
    endDate: formik.values.to
  });

  const groupColisByClientPhoneForPointMarchant = (data) => {
    const groupedData = {};

    data.forEach((colisItem) => {
      const clientPhone = colisItem.client.phone_number;

      if (!groupedData[clientPhone]) {
        groupedData[clientPhone] = {
          colisList: [],
          totalAmountToBePaid: 0,
          processingFee: 0,
          finalAmountDue: 0,
          deliveryStatusCounts: {}
        };
      }

      groupedData[clientPhone].colisList.push(colisItem);

      // Determine the last colis status
      const lastStatus = colisItem.colis_statuses[0];
      if (lastStatus) {
        const status = lastStatus.colis_status.code;
        groupedData[clientPhone].deliveryStatusCounts[status] =
          (groupedData[clientPhone].deliveryStatusCounts[status] || 0) + 1;

        // Check conditions for calculating amountToBePaid
        if ((status === 'DELIVERED' || status === 'LOST') && parseInt(colisItem.price) > 0) {
          let amountToBePaid = parseInt(colisItem.price);
          if (colisItem?.fee_payment === 'PREPAID' && status !== 'LOST') {
            amountToBePaid -= parseInt(colisItem.fee || 0);
          }
          groupedData[clientPhone].totalAmountToBePaid += amountToBePaid;
        }
      }
    });

    // Calculate processing fee and final amount
    for (const phone in groupedData) {
      const clientGroup = groupedData[phone];
      clientGroup.processingFee = clientGroup.totalAmountToBePaid * 0.01;
      clientGroup.finalAmountDue = clientGroup.totalAmountToBePaid - clientGroup.processingFee;

      // Adding total count in delivery status
      clientGroup.deliveryStatusCounts.total = clientGroup.colisList.length;
    }

    // Apply sorting for each client's colisList
    for (const phone in groupedData) {
      groupedData[phone].colisList.sort((a, b) => {
        const lastStatusA = a.colis_statuses[a.colis_statuses.length - 1].colis_status.code;
        const lastStatusB = b.colis_statuses[b.colis_statuses.length - 1].colis_status.code;
        return lastStatusA.localeCompare(lastStatusB);
      });
    }

    return groupedData;
  };

  const groupColisByClientPhoneForMerchantBulkPayment = (data) => {
    const groupedData = {};

    data.forEach((colisItem) => {
      const clientPhone = colisItem.client.phone_number;

      if (!groupedData[clientPhone]) {
        groupedData[clientPhone] = {
          colisList: [],
          totalAmountToBePaid: 0,
          processingFee: 0,
          finalAmountDue: 0,
          deliveryStatusCounts: {}
        };
      }

      groupedData[clientPhone].colisList.push(colisItem);

      // Determine the last colis status
      const lastStatus = colisItem.colis_statuses[0];
      if (lastStatus) {
        const status = lastStatus.colis_status.code;
        groupedData[clientPhone].deliveryStatusCounts[status] =
          (groupedData[clientPhone].deliveryStatusCounts[status] || 0) + 1;

        // Check conditions for calculating amountToBePaid
        if (
          (status === 'DELIVERED' || status === 'LOST') &&
          parseInt(colisItem.price) > 0 &&
          colisItem?.payment === 'PENDING'
        ) {
          let amountToBePaid = parseInt(colisItem.price);
          if (colisItem?.fee_payment === 'PREPAID' && status !== 'LOST') {
            amountToBePaid -= parseInt(colisItem.fee || 0);
          }
          groupedData[clientPhone].totalAmountToBePaid += amountToBePaid;
        }
      }
    });

    // Calculate processing fee and final amount
    for (const phone in groupedData) {
      const clientGroup = groupedData[phone];
      clientGroup.processingFee = clientGroup.totalAmountToBePaid * 0.01;
      clientGroup.finalAmountDue = clientGroup.totalAmountToBePaid - clientGroup.processingFee;

      // Adding total count in delivery status
      clientGroup.deliveryStatusCounts.total = clientGroup.colisList.length;
    }

    // Apply sorting for each client's colisList
    for (const phone in groupedData) {
      groupedData[phone].colisList.sort((a, b) => {
        const lastStatusA = a.colis_statuses[a.colis_statuses.length - 1].colis_status.code;
        const lastStatusB = b.colis_statuses[b.colis_statuses.length - 1].colis_status.code;
        return lastStatusA.localeCompare(lastStatusB);
      });
    }

    return groupedData;
  };

  const colisRequiringPayment = (dataList) => {
    const elementsToBePaid = dataList.filter((data) => {
      if (!data?.colis_statuses?.length) {
        return;
      }
      const lastStatus = data?.colis_statuses[0];
      // data?.colis_statuses?.length - 1
      const isDeliveredOrLost =
        lastStatus &&
        (lastStatus?.colis_status?.code === 'DELIVERED' ||
          lastStatus?.colis_status?.code === 'LOST');
      const hasPositivePrice = parseInt(data?.price) > 0;
      const isPaymentPending = data?.payment === 'PENDING';

      return isDeliveredOrLost && hasPositivePrice && isPaymentPending;
    });

    return {
      count: elementsToBePaid.length,
      elements: elementsToBePaid
    };
  };

  // Use useMemo for performance optimization if colisRequiringPayment is computationally intensive
  const colisToPay = useMemo(() => colisRequiringPayment(colis), [colis]);

  const handleDatePickerValueChange = (newValue) => {
    setDateValue(newValue);
    formik.setValues({
      ...formik.values,
      from: newValue.startDate,
      to: newValue.endDate
    });
    dispatch(
      setFrom({
        from: newValue.startDate
      })
    );
    dispatch(
      setTo({
        to: newValue.endDate
      })
    );
  };

  const applyFilter = async (dispatchParams) => {
    await dispatch(getColis(dispatchParams));
  };

  const handleLoadColis = async (_) => {
    if (!noMoreQuery && !isLoading) {
      console.log({ activeTab });
      const dispatchParams = {
        from: formik.values.from,
        to: formik.values.to,
        skip: skip,
        type: activeTab
      };

      await applyFilter(dispatchParams);
    }
  };

  const onFetchColis = async (colisInfo) => {
    dispatch(resetForm());
    dispatch(resetTableParcelsManagementSettings());
    const dispatchParams = {
      from: formik.values.from,
      to: formik.values.to,
      skip: 0,
      type: activeTab,
      colisInfo
    };
    applyFilter(dispatchParams);
  };

  const sortAndGroupBy = (data) => {
    if (!Array.isArray(data)) {
      console.error('Data is not an array');
      return {};
    }

    const groupedByDeliveryLivreur = {};

    // Initialize summary data
    let summaryData = {};

    data.forEach((item) => {
      const key = item?.pickup_livreur?.id;
      if (key) {
        const fieldName =
          item?.pickup_livreur?.first_name?.toUpperCase() +
          ' ' +
          item?.pickup_livreur?.last_name?.toUpperCase();
        if (!groupedByDeliveryLivreur[fieldName]) {
          groupedByDeliveryLivreur[fieldName] = [];
          summaryData[fieldName] = { totalAttendu: 0, totalRecu: 0 };
        }
        groupedByDeliveryLivreur[fieldName].push(item);

        // Accumulate totals for summary
        summaryData[fieldName].totalAttendu += 1; // Adjust this based on your data structure
        summaryData[fieldName].totalRecu += 1; // Adjust this based on your data structure
      }
    });

    // Sort each group by pickup_phone_number
    for (const key in groupedByDeliveryLivreur) {
      groupedByDeliveryLivreur[key].sort((a, b) =>
        a.pickup_phone_number.localeCompare(b.pickup_phone_number)
      );
    }

    return { groupedData: groupedByDeliveryLivreur, summary: summaryData };
  };

  const pointRecuperationDownloader = () => {
    const fileName =
      'point_recuperation_from_' +
      moment.utc(from).format('DD-MM-YYYY') +
      '_to_' +
      moment.utc(to).format('DD-MM-YYYY');
    const sheetName = 'Point Recuperation Street';

    // Create a new workbook and a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns
    worksheet.columns = [
      { header: 'Info Livreur', key: 'infoLivreur', width: 35 },
      { header: 'Numero Marchand', key: 'numeroMarchand', width: 20 },
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Numero Client', key: 'numeroClient', width: 20 },
      { header: 'Recuperation', key: 'recuperation', width: 25 },
      { header: 'Livraison', key: 'livraison', width: 30 },
      { header: 'Colis Recuperer ?', width: 15 }
    ];

    // Style the headers
    worksheet.getRow(1).font = { bold: true };

    // Add data to worksheet
    // const groupedData = sortAndGroupBy(colis);
    const { groupedData, summary } = sortAndGroupBy(colis);
    for (const group in groupedData) {
      groupedData[group].forEach((item) => {
        const row = {
          infoLivreur: `${item?.pickup_livreur?.first_name?.toUpperCase()}  ${item?.pickup_livreur?.last_name?.toUpperCase()} (${
            item?.pickup_livreur?.client?.phone_number
          })`,
          numeroMarchand: item?.pickup_phone_number,
          code: item.code,
          numeroClient: item?.delivery_phone_number,
          recuperation: item.pickup_address_name,
          livraison: item.delivery_address_name
        };
        worksheet.addRow(row);
      });
    }

    // Add summary table
    worksheet.addRow([]); // Empty row for separation
    const summaryTitleRow = worksheet.addRow(['Summary']);
    summaryTitleRow.font = { bold: true };

    // Here, the logic to calculate summary values
    worksheet.addRow(['Info Livreur', 'Total Attendu', 'Total Reçu']);
    // Add summary rows
    for (const [livreur, totals] of Object.entries(summary)) {
      worksheet.addRow({
        // Adjust these keys based on your column setup
        infoLivreur: livreur,
        numeroMarchand: totals.totalAttendu,
        code: ''
      });
    }

    // Enable text wrapping for all cells
    worksheet.eachRow({ includeEmpty: true }, function (row) {
      row.eachCell({ includeEmpty: true }, function (cell) {
        cell.alignment = { wrapText: true }; // Enable text wrapping
      });
    });

    // Optionally adjust row heights (if needed)
    // worksheet.eachRow({ includeEmpty: true }, function (row) {
    //   row.height = 24; // Set a custom height
    // });

    // Set print area for the worksheet
    worksheet.pageSetup.printArea = 'A1:Z100'; // Adjust range as needed

    // Function to apply borders to a cell
    const applyBordersToCell = (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    };

    // Apply borders and styles to all rows and cells
    const totalRows = worksheet.rowCount;
    for (let rowIndex = 1; rowIndex <= totalRows; rowIndex++) {
      const row = worksheet.getRow(rowIndex);
      row.eachCell({ includeEmpty: true }, function (cell) {
        applyBordersToCell(cell);

        // Increase font size
        cell.font = { size: 12 }; // Adjust font size as needed

        // Enable text wrapping
        cell.alignment = { wrapText: true };
      });

      // Adjust row height if necessary
      // row.height = 20; // Set a custom height
    }

    // Set page setup for landscape orientation and paper size
    worksheet.pageSetup = {
      orientation: 'landscape', // Set to landscape
      paperSize: 9, // Adjust if needed for landscape. 9 usually corresponds to A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1
    };

    // Write to a buffer and download the file
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, `${fileName}.xlsx`);
    });
  };

  useEffect(() => {
    onFetchColis();
  }, [formik.values.from, formik.values.to, activeTab]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-2">
          {activeTab === TABS_ENUMERATION_IN_COLIS.date_search ? (
            <Datepicker
              containerClassName="max-w-lg md:col-span-2"
              value={dateValue}
              theme={'light'}
              inputClassName="input input-bordered w-full input-sm"
              popoverDirection={'down'}
              toggleClassName="invisible"
              onChange={handleDatePickerValueChange}
              showShortcuts={true}
              primaryColor={'white'}
            />
          ) : (
            <></>
          )}

          <form
            className={`max-w-lg ${
              activeTab === TABS_ENUMERATION_IN_COLIS.date_search
                ? 'md:col-span-2'
                : 'md:col-span-4'
            }`}
            onSubmit={async (event) => {
              event.preventDefault();
              await onFetchColis(colisInfo);
              setActiveTab(TABS_ENUMERATION_IN_COLIS.search_result);
            }}>
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <CiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                id="default-search"
                className="input input-sm w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
                placeholder="Search parcel ..."
                value={colisInfo}
                onChange={(event) => setColisInfo(event.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="text-right sm:mb-2">
          {colisToPay?.count > 0 ? (
            <button
              className="btn btn-sm btn-success btn-outline normal-case gap-2 mx-2"
              onClick={() => {
                dispatch(
                  openModal({
                    title: 'MERCHANT BULK PAYMENT',
                    size: 'max',
                    bodyType: MODAL_BODY_TYPES.COLIS_PAY_MERCHANT_BULK,
                    extraObject: {
                      colis: colisToPay?.elements,
                      pointMarchant: groupColisByClientPhoneForMerchantBulkPayment(
                        // pointMarchant: groupColisByClientPhoneForMerchantBulkPayment(
                        colisToPay?.elements
                      ),
                      from,
                      to
                    }
                  })
                );
              }}>
              <FaAmazonPay className="w-4" />
              Pay
              <div className="badge badge-sm badge-success badge-outline">{colisToPay?.count}</div>
            </button>
          ) : (
            <></>
          )}
          <button
            className="btn btn-ghost btn-sm normal-case"
            onClick={() =>
              dispatch(
                openModal({
                  title: 'QRCODE PANEL',
                  size: 'max',
                  bodyType: MODAL_BODY_TYPES.COLIS_QR_CODE_PANEL,
                  extraObject: { from, to }
                })
              )
            }>
            <PiQrCodeThin className="w-4 mr-2" />
            Scan
          </button>
          <button
            className="btn btn-ghost btn-sm normal-case"
            onClick={() => window.location.reload()}>
            <ArrowPathIcon className="w-4 mr-2" />
            Refresh
          </button>
          <button
            className="btn btn-ghost btn-sm normal-case"
            onClick={() => {
              setShowStats((oldValue) => !oldValue);
            }}>
            {showStats ? <BiHide className="w-4 mr-2" /> : <BiShow className="w-4 mr-2" />}
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          {colis.length ? (
            <select
              className="select select-ghost select-sm normal-case align-top"
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
          ) : (
            <></>
          )}

          <div className="dropdown dropdown-bottom dropdown-end  ml-2">
            <label tabIndex={0} className="btn btn-ghost btn-sm normal-case btn-square ">
              <EllipsisVerticalIcon className="w-5" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-compact  p-2 shadow bg-base-100 rounded-box w-52">
              <li
                onClick={() => {
                  dispatch(
                    openModal({
                      title: 'ADD NEW PARCEL',
                      size: 'max',
                      bodyType: MODAL_BODY_TYPES.COLIS_ADD_OR_EDIT,
                      extraObject: {}
                    })
                  );
                }}>
                <span>
                  <IoCreateOutline className="w-4" />
                  New Colis
                </span>
              </li>
              {/*<li*/}
              {/*  onClick={() => {*/}
              {/*    dispatch(*/}
              {/*      openModal({*/}
              {/*        title: 'QRCODE PANEL',*/}
              {/*        size: 'max',*/}
              {/*        bodyType: MODAL_BODY_TYPES.COLIS_QR_CODE_PANEL,*/}
              {/*        extraObject: {}*/}
              {/*      })*/}
              {/*    );*/}
              {/*  }}>*/}
              {/*  <span>*/}
              {/*    <IoCreateOutline className="w-4" />*/}
              {/*    QR Code Panel*/}
              {/*  </span>*/}
              {/*</li>*/}
              {/*<li*/}
              {/*  onClick={() => {*/}
              {/*    dispatch(*/}
              {/*      openModal({*/}
              {/*        title: 'POINT MARCHANT',*/}
              {/*        size: 'max',*/}
              {/*        bodyType: MODAL_BODY_TYPES.POINT_MARCHANT,*/}
              {/*        extraObject: {*/}
              {/*          from,*/}
              {/*          to,*/}
              {/*          pointMarchant: groupColisByClientPhoneForPointMarchant(colis)*/}
              {/*        }*/}
              {/*      })*/}
              {/*    );*/}
              {/*  }}>*/}
              {/*  <span>*/}
              {/*    <CiShoppingTag className="w-4" />*/}
              {/*    Point Marchant*/}
              {/*  </span>*/}
              {/*</li>*/}
              {/*<li>*/}
              {/*  <span onClick={pointRecuperationDownloader}>*/}
              {/*    <ArrowDownTrayIcon className="w-4" />*/}
              {/*    Point Recuperation*/}
              {/*  </span>*/}
              {/*</li>*/}
              {activeTab === TABS_ENUMERATION_IN_COLIS.date_search ? (
                <li
                  onClick={() => {
                    dispatch(
                      openModal({
                        title: 'POINT LIVREUR',
                        size: 'max',
                        bodyType: MODAL_BODY_TYPES.POINT_LIVREUR,
                        extraObject: {
                          from,
                          to,
                          pointLivreur: groupColisByDeliveryLivreurPhone(colis)
                        }
                      })
                    );
                  }}>
                  <span>
                    <MdOutlineDeliveryDining className="w-4" />
                    Point Livraison
                  </span>
                </li>
              ) : (
                <></>
              )}
              <li>
                <span
                  onClick={() => {
                    dispatch(
                      openModal({
                        title: 'Download Colis Data',
                        size: '',
                        bodyType: MODAL_BODY_TYPES.DOWNLOAD_COLIS_DATA,
                        extraObject: {}
                      })
                    );
                  }}>
                  <ArrowDownTrayIcon className="w-4" />
                  Download Data
                </span>
              </li>

              <li>
                <span
                  onClick={() => {
                    dispatch(
                      openModal({
                        title: 'Download QR Code',
                        size: '',
                        bodyType: MODAL_BODY_TYPES.GENERATE_COLIS_QR_CODES,
                        extraObject: {}
                      })
                    );
                  }}>
                  <PiQrCodeThin className="w-4" />
                  Generate QR Codes
                </span>
              </li>
              {/*<li>*/}
              {/*  <span>*/}
              {/*    <EnvelopeIcon className="w-4" />*/}
              {/*    Email Digests*/}
              {/*  </span>*/}
              {/*</li>*/}
            </ul>
          </div>
        </div>
      </div>

      {showStats ? (
        <div className="grid lg:grid-cols-4 mb-3 md:grid-cols-2 grid-cols-1 gap-6">
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {/*<AiOutlineFileDone className="w-6 h-6" />*/}
                {STATUS_ICON_NAMES['REGISTERED']}
              </div>
              <div className="stat-title dark:text-slate-300">Pending</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>{pendingCount}</div>
              <div className={'stat-desc  '}>
                Ready for Collection:{' '}
                <span className="font-bold text-secondary">{assignedForCollectionCount}</span>
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {STATUS_ICON_NAMES['COLLECTED']}
              </div>
              <div className="stat-title dark:text-slate-300">Collected</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>
                {collectedCount}
              </div>
              <div className={'stat-desc  '}>
                Collecting:{' '}
                <span className="font-bold text-secondary">{collectionInProgressCount}</span>
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {STATUS_ICON_NAMES['DELIVERED']}
              </div>
              <div className="stat-title dark:text-slate-300">Delivered</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>
                {deliveredCount}
              </div>
              <div className={'stat-desc  '}>
                In Delivery:{' '}
                <span className="font-bold text-secondary">
                  {assignedForDeliveryCount + deliveryInProgressCount}
                </span>
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {STATUS_ICON_NAMES['DELIVERED']}
              </div>
              <div className="stat-title dark:text-slate-300">Returned</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>{returnedCount}</div>

              <div className={'stat-desc '}>
                Returning:{' '}
                <span className="font-bold text-secondary">
                  {articleToReturnCount + assignedForReturnCount + returnInProgressCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/*<div*/}
      {/*  tabIndex={0}*/}
      {/*  className={`hidden md:block collapse rounded-lg collapse-plus border bg-white my-3 ${*/}
      {/*    openFilter ? "collapse-open" : "collapse-close"*/}
      {/*  }`}*/}
      {/*>*/}
      {/*  <div*/}
      {/*    className="collapse-title text-xl font-medium"*/}
      {/*    onClick={() => setOpenFilter((oldVal) => !oldVal)}*/}
      {/*  >*/}
      {/*    Filters*/}
      {/*  </div>*/}
      {/*  <div className="collapse-content">*/}
      {/*    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-x-5 lg:gap-y-3">*/}
      {/*      <div className="md:col-span-4 divider my-0">General Filters</div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div className="flex justify-center w-full my-5">
        <div>
          <div className="tabs">
            <a
              className={`tab tab-lifted ${
                activeTab === TABS_ENUMERATION_IN_COLIS.active_parcels ? 'tab-active' : ''
              }`}
              onClick={() => setActiveTab(TABS_ENUMERATION_IN_COLIS.active_parcels)}>
              {TABS_ENUMERATION_IN_COLIS.active_parcels}
            </a>
            <a
              className={`tab tab-lifted ${
                activeTab === TABS_ENUMERATION_IN_COLIS.warehoused ? 'tab-active' : ''
              }`}
              onClick={() => setActiveTab(TABS_ENUMERATION_IN_COLIS.warehoused)}>
              {TABS_ENUMERATION_IN_COLIS.warehoused}
            </a>
            <a
              className={`tab tab-lifted ${
                activeTab === TABS_ENUMERATION_IN_COLIS.payment_list ? 'tab-active' : ''
              }`}
              onClick={() => setActiveTab(TABS_ENUMERATION_IN_COLIS.payment_list)}>
              {TABS_ENUMERATION_IN_COLIS.payment_list}
            </a>
            <a
              className={`tab tab-lifted ${
                activeTab === TABS_ENUMERATION_IN_COLIS.date_search ? 'tab-active' : ''
              }`}
              onClick={() => setActiveTab(TABS_ENUMERATION_IN_COLIS.date_search)}>
              {TABS_ENUMERATION_IN_COLIS.date_search}
            </a>
            <a
              className={`tab tab-lifted ${
                activeTab === TABS_ENUMERATION_IN_COLIS.search_result ? 'tab-active' : ''
              }`}
              onClick={() => setActiveTab(TABS_ENUMERATION_IN_COLIS.search_result)}>
              {TABS_ENUMERATION_IN_COLIS.search_result}
            </a>
          </div>
        </div>
      </div>

      {colis.length ? (
        <ColisList onLoad={handleLoadColis} gridOptions={gridOptions} />
      ) : (
        <NotFoundPage message="No colis found" />
      )}
    </div>
  );
};

export default ParcelsManagement;
