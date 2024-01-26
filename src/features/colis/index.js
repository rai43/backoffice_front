import React, { useState, useEffect, useMemo } from 'react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useFormik } from 'formik';
import moment from 'moment/moment';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';

import { BiHide, BiShow } from 'react-icons/bi';
import { CiShoppingTag } from 'react-icons/ci';
import { FaAmazonPay } from 'react-icons/fa';
import { IoCreateOutline } from 'react-icons/io5';
import { MdOutlineDeliveryDining } from 'react-icons/md';

import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';

import ColisList from './components/ColisList';
import { getColis, resetForm } from './parcelsManagementSlice';
import InfoText from '../../components/Typography/InfoText';
import { STATUS_ICON_NAMES } from '../../utils/colisUtils';
import { MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
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
    registeredCount,
    articleToReturnCount,
    deliveredCount
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
      const lastStatus = colisItem.colis_statuses[colisItem.colis_statuses.length - 1];
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
      const lastStatus = colisItem.colis_statuses[colisItem.colis_statuses.length - 1];
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

  function groupColisByDeliveryLivreurPhone(data) {
    const groupedData = {};

    // Iterate over each colis item in the data
    data.forEach((colisItem) => {
      let groupKey;

      // Determine the group key based on delivery_livreur's client phone number
      // If delivery_livreur is null, group them under a common key 'no_delivery_livreur'
      if (
        colisItem.delivery_livreur &&
        colisItem.delivery_livreur.client &&
        colisItem.delivery_livreur.client.phone_number
      ) {
        // Concatenate client's phone number, first name, and last name as the group key
        const delivery_livreur = colisItem.delivery_livreur;
        groupKey = `${delivery_livreur.first_name || ''} ${delivery_livreur.last_name || ''} (${
          delivery_livreur?.client?.phone_number || ''
        })`
          ?.trim()
          ?.toUpperCase();
      } else {
        groupKey = 'no_delivery_livreur';
      }

      // Initialize the group if it doesn't exist
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          colisList: [],
          totalAmountToBePaid: 0,
          processingFee: 0,
          finalAmountDue: 0,
          totalFee: 0,
          deliveryStatusCounts: {}
        };
      }

      // Add the current colis item to the group
      groupedData[groupKey].colisList.push(colisItem);

      // Get the last status of the colis
      const lastStatus = colisItem.colis_statuses[colisItem.colis_statuses.length - 1];
      if (lastStatus) {
        const status = lastStatus.colis_status.code;

        // Update the count of delivery statuses
        groupedData[groupKey].deliveryStatusCounts[status] =
          (groupedData[groupKey].deliveryStatusCounts[status] || 0) + 1;

        // Calculate the amount to be paid based on the status and payment conditions
        if (
          status === 'DELIVERED' &&
          parseInt(colisItem.price) > 0
          // &&
          // colisItem.payment === 'PENDING'
        ) {
          let amountToBePaid = parseInt(colisItem.price);
          if (colisItem.fee_payment === 'PREPAID' && status !== 'LOST') {
            amountToBePaid -= parseInt(colisItem.fee || 0);
          }
          groupedData[groupKey].totalAmountToBePaid += amountToBePaid;
        }

        if (status === 'DELIVERED' && colisItem.fee_payment === 'POSTPAID') {
          // Add fee to totalFee for POSTPAID items
          groupedData[groupKey].totalFee += parseInt(colisItem.fee || 0);
        }
      }
    });

    // Final calculations for each group
    for (const key in groupedData) {
      const group = groupedData[key];
      // Calculate processing fee and final amount due
      group.processingFee = group.totalAmountToBePaid * 0; // 0.01
      group.finalAmountDue = group.totalAmountToBePaid - group.processingFee;
      // Add the total count of colis items in the group
      group.deliveryStatusCounts.total = group.colisList.length;
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
  }

  const colisRequiringPayment = (dataList) => {
    const elementsToBePaid = dataList.filter((data) => {
      const lastStatus = data?.colis_statuses[data?.colis_statuses?.length - 1];
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
      const dispatchParams = {
        from: formik.values.from,
        to: formik.values.to,
        skip: skip
      };

      await applyFilter(dispatchParams);
    }
  };

  const onFetchColis = async () => {
    dispatch(resetForm());
    dispatch(resetTableParcelsManagementSettings());
    const dispatchParams = {
      from: formik.values.from,
      to: formik.values.to,
      skip: 0
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
  }, [formik.values.from, formik.values.to]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="">
          <Datepicker
            containerClassName="w-full sm:w-72"
            value={dateValue}
            theme={'light'}
            inputClassName="input input-bordered w-full"
            popoverDirection={'down'}
            toggleClassName="invisible"
            onChange={handleDatePickerValueChange}
            showShortcuts={true}
            primaryColor={'white'}
          />
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
            onClick={() => window.location.reload()}>
            <ArrowPathIcon className="w-4 mr-2" />
            Refresh Data
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
              <li
                onClick={() => {
                  dispatch(
                    openModal({
                      title: 'POINT MARCHANT',
                      size: 'max',
                      bodyType: MODAL_BODY_TYPES.POINT_MARCHANT,
                      extraObject: {
                        from,
                        to,
                        pointMarchant: groupColisByClientPhoneForPointMarchant(colis)
                      }
                    })
                  );
                }}>
                <span>
                  <CiShoppingTag className="w-4" />
                  Point Marchant
                </span>
              </li>
              <li>
                <span onClick={pointRecuperationDownloader}>
                  <ArrowDownTrayIcon className="w-4" />
                  Point Recuperation
                </span>
              </li>
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

              {/*<li>*/}
              {/*  <span>*/}
              {/*    <ArrowDownTrayIcon className="w-4" />*/}
              {/*    Download All Data*/}
              {/*  </span>*/}
              {/*</li>*/}
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
                {STATUS_ICON_NAMES['PENDING']}
              </div>
              <div className="stat-title dark:text-slate-300">Pending</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>{pendingCount}</div>
              <div className={'stat-desc  '}>
                {((pendingCount * 100) / totalCount).toFixed(2)} % of total orders
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {STATUS_ICON_NAMES['REGISTERED']}
              </div>
              <div className="stat-title dark:text-slate-300">Registered</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>
                {registeredCount}
              </div>
              <div className={'stat-desc  '}>
                {((registeredCount * 100) / totalCount).toFixed(2)} % of total orders
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {STATUS_ICON_NAMES['ARTICLE_TO_RETURN']}
              </div>
              <div className="stat-title dark:text-slate-300">Article To Return</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>
                {articleToReturnCount}
              </div>
              <div className={'stat-desc  '}>
                {((articleToReturnCount * 100) / totalCount).toFixed(2)} % of total orders
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
              <div className={'stat-desc '}>
                {((deliveredCount * 100) / totalCount).toFixed(2)} % of total orders
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

      {colis.length ? (
        <ColisList onLoad={handleLoadColis} gridOptions={gridOptions} />
      ) : (
        <InfoText styleClasses={'md:grid-cols-2'}>
          No colis found from {from} to {to}
        </InfoText>
      )}
    </div>
  );
};

export default ParcelsManagement;
