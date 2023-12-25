import React, { useCallback, useEffect, useRef, useState } from 'react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useFormik } from 'formik';
import * as _ from 'lodash';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';

import { BiFoodMenu, BiHide, BiShow } from 'react-icons/bi';
import { BsPlus } from 'react-icons/bs';
import { CiGps } from 'react-icons/ci';
import { FaCashRegister } from 'react-icons/fa';
import { GoChevronDown } from 'react-icons/go';
import { IoCheckmarkDone } from 'react-icons/io5';
import { MdOutlineDeliveryDining } from 'react-icons/md';

import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';

import ClientOrdres from './components/ClientOrdres';
import { generateStatistics, getOrders, resetForm } from './orderSlice';
import InputText from '../../components/Input/InputText';
import InfoText from '../../components/Typography/InfoText';
import { MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { showNotification } from '../common/headerSlice';
import { openModal } from '../common/modalSlice';
import {
  setClientPhone,
  setCmdId,
  setFrom,
  setMaxAmount,
  setMerchantName,
  setMerchantPhone,
  setMinAmount,
  setOrderStatus,
  setPaginationSize,
  setPaymentMethod,
  setSearchPattern,
  setTo
} from '../common/ordersTableSlice';

const INITIAL_FILTERS = {
  sort: false,
  status: false,
  paymentMethod: false,
  merchantName: false,
  more: false
};

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const Orders = () => {
  const gridRef = useRef(null);
  const [filterStates, setFilterStates] = useState(INITIAL_FILTERS);
  const [showStats, setShowStats] = useState(true);
  const [showSelectedMap, setShowSelectedMap] = useState([]);
  const [statistics, setsStatistics] = useState({
    totalOrders: 0,
    totalPaid: 0,
    totalDiscount: 0,
    totalDeliveryAmount: 0,
    cash: 0,
    street: 0,
    InProgressState: 0,
    InPendingState: 0,
    InRegisteredState: 0,
    InInDeliveryState: 0,
    InDeliveredState: 0,
    InCanceledState: 0,
    InInProcessState: 0
  });

  const {
    orderStatus,
    paymentMethod,
    from,
    to,
    minAmount,
    maxAmount,
    searchPattern,
    cmdId,
    clientPhone,
    merchantName,
    merchantPhone
  } = useSelector((state) => state.ordersTable);

  const INITIAL_FILTER_OBJ = {
    orderStatus: orderStatus,
    paymentMethod: paymentMethod,
    from: from,
    to: to,
    minAmount: minAmount,
    maxAmount: maxAmount,
    searchPattern: searchPattern,
    cmdId: cmdId,
    clientPhone: clientPhone,
    merchantName: merchantName,
    merchantPhone: merchantPhone
  };

  const { orders, orderSkipCount, isLoading, noMoreQuery } = useSelector((state) => state.order);
  const { paginationSize } = useSelector((state) => state.ordersTable);

  const orderFormContext = useFormik({
    initialValues: INITIAL_FILTER_OBJ
  });
  const dispatch = useDispatch();

  const [dateValue, setDateValue] = useState({
    startDate: orderFormContext.values.from,
    endDate: orderFormContext.values.to
  });

  /**
   * Fetches and processes orders based on dispatch parameters.
   * It first retrieves orders and then generates statistics based on these orders.
   * @param {Object} orderFetchParams - Parameters used for dispatching the order retrieval action.
   * @param {boolean} load - Flag to indicate if additional orders should be loaded (for pagination).
   */
  const fetchAndProcessOrders = async (orderFetchParams, load = false) => {
    try {
      // Dispatch action to get orders
      const orderFetchResponse = await dispatch(getOrders(orderFetchParams));

      // Check if orders are present in the response
      if (orderFetchResponse?.payload?.orders) {
        // Combine new orders with existing ones if 'load' is true, otherwise use new orders only
        const combinedOrders = load
          ? [...orders, ...orderFetchResponse.payload.orders]
          : [...orderFetchResponse.payload.orders];

        // Dispatch action to generate statistics with the updated orders data
        const { payload: statisticsPayload } = await dispatch(
          generateStatistics({ data: combinedOrders })
        );

        // Update statistics state with the newly received payload
        setsStatistics((oldStats) => ({
          ...oldStats,
          ...statisticsPayload
        }));
      }
    } catch (e) {
      // Log any errors encountered during the process
      console.error('Error in fetchAndProcessOrders:', e.message);
    }
  };

  /**
   * Initiates the retrieval of orders based on form values.
   * This function is typically triggered by a user action, like a page load.
   */
  const initiateOrderRetrieval = async () => {
    // Reset the form state before fetching new orders
    await dispatch(resetForm());

    // Create parameters for dispatching the order retrieval action
    const orderQueryParams = assembleOrderQueryParameters(orderFormContext.values, { skip: 0 });

    // Fetch and process orders with the created parameters
    await fetchAndProcessOrders(orderQueryParams);
  };

  /**
   * Loads additional orders, typically for pagination.
   * This function is called when more orders need to be loaded, for example, when scrolling.
   */
  const loadAdditionalOrders = async () => {
    // Ensure that no more queries are pending and the system is not already loading
    if (!noMoreQuery && !isLoading) {
      // Create parameters for dispatching the order retrieval action with updated skip value
      const additionalOrderParams = assembleOrderQueryParameters(orderFormContext.values, {
        skip: orderSkipCount
      });

      // Fetch and process orders with the created parameters and 'load' set to true
      await fetchAndProcessOrders(additionalOrderParams, true);
    }
  };

  /**
   * Assembles the parameters required for querying orders.
   * @param {Object} formValues - The form values to be used for creating query parameters.
   * @param {Object} extraQueryParams - Additional parameters to be included in the query.
   * @returns {Object} The assembled query parameters.
   */
  const assembleOrderQueryParameters = (formValues, extraQueryParams = {}) => ({
    // Extracting and assembling individual query parameters from form values
    orderStatus: formValues.orderStatus,
    paymentMethod: formValues.paymentMethod,
    from: formValues.from,
    to: formValues.to,
    minAmount: formValues.minAmount,
    maxAmount: formValues.maxAmount,
    cmdId: formValues.cmdId,
    clientPhone: formValues.clientPhone,
    merchantName: formValues.merchantName,
    merchantPhone: formValues.merchantPhone,
    searchPattern: formValues.searchPattern,
    ...extraQueryParams // Including any additional parameters passed to the function
  });

  const updateFormValue = useCallback(
    ({ key, value }) => {
      orderFormContext.setValues({
        ...orderFormContext.values,
        [key]: value
      });
    },
    [orderFormContext]
  );

  const debouncedUpdateFormValue = _.debounce(updateFormValue, 1500);

  const handleDatePickerValueChange = (newValue) => {
    setDateValue(newValue);
    orderFormContext.setValues({
      ...orderFormContext.values,
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

  const excelDownloader = () => {
    const data = orders?.map((order) => {
      const totalSupplementsMerchantPrices = order?.article_commandes.reduce(
        (total, item) => {
          const supplementsTotalPrice = item.supplements.reduce((sum, supplement) => {
            return sum + parseFloat(supplement.price || '0');
          }, 0);

          const supplementsTotalMerchantPrice = item.supplements.reduce((sum, supplement) => {
            return sum + parseFloat(supplement.merchant_price || '0');
          }, 0);

          total.price += supplementsTotalPrice;
          total.merchantPrice += supplementsTotalMerchantPrice;

          return total;
        },
        { price: 0, merchantPrice: 0 }
      );

      const totalArticleMerchantPrices = order?.article_commandes?.reduce(
        (accumulator, currentObj) => {
          return accumulator + parseFloat(currentObj.merchant_price) * currentObj?.quantity;
        },
        0
      );

      return {
        commandId: order?.id,
        client: order?.client?.phone_number,
        livreur: order?.livreur
          ? order?.livreur?.last_name +
            ' ' +
            order?.livreur?.first_name +
            ' ' +
            order?.livreur?.client?.phone_number
          : 'N/A',
        totalPaid: parseInt(order?.total),
        balanceShare: parseInt(order?.balance_share),
        bonusShare: parseInt(order?.bonus_share),
        serviceFee: parseInt(order?.service_fee),
        totalArticle: parseInt(order?.total_articles),
        merchantPrice:
          parseInt(totalSupplementsMerchantPrices?.merchantPrice || 0) +
          parseInt(totalArticleMerchantPrices || 0),
        discount:
          parseInt(order?.total_articles) +
          parseInt(order?.service_fee) -
          parseInt(order?.bonus_share) -
          parseInt(order?.total),
        status:
          order?.commande_commande_statuses[order?.commande_commande_statuses?.length - 1]
            ?.commande_status?.code,
        merchantName: order?.merchant?.name,
        merchantNumber: order?.merchant?.client?.phone_number,
        paymentMethod: order?.payment_method,
        createdAt: moment.utc(order?.created_at).format('DD-MM-YYYY HH:mm')
      };
    });

    function listDeliveredOrders(orders) {
      return orders.filter(
        (order) =>
          order.commande_commande_statuses &&
          order.commande_commande_statuses[order.commande_commande_statuses.length - 1]
            .commande_status.code === 'DELIVERED'
      );
    }

    function sumMerchantPrices(orders) {
      return orders
        .filter(
          (order) =>
            order.commande_commande_statuses &&
            ['DELIVERED', 'UNDELIVERED'].includes(
              order.commande_commande_statuses[order.commande_commande_statuses.length - 1]
                .commande_status.code
            )
        )
        .reduce((sum, order) => {
          const totalSupp = order?.article_commandes.reduce(
            (total, item) => {
              const supplementsTotalPrice = item.supplements.reduce((sum, supplement) => {
                return sum + parseFloat(supplement.price || '0');
              }, 0);

              const supplementsTotalMerchantPrice = item.supplements.reduce((sum, supplement) => {
                return sum + parseFloat(supplement.merchant_price || '0');
              }, 0);

              total.price += supplementsTotalPrice;
              total.merchantPrice += supplementsTotalMerchantPrice;

              return total;
            },
            { price: 0, merchantPrice: 0 }
          );

          const totalArticlePrices = order?.article_commandes?.reduce((accumulator, currentObj) => {
            return accumulator + parseFloat(currentObj.merchant_price) * currentObj?.quantity;
          }, 0);

          const merchantFinalPrice =
            parseInt(totalSupp?.merchantPrice || 0) + parseInt(totalArticlePrices || 0);

          return sum + parseInt(merchantFinalPrice);
        }, 0);
    }

    function sumArticlePricesDelivered(orders) {
      return orders
        .filter(
          (order) =>
            order.commande_commande_statuses &&
            order.commande_commande_statuses[order.commande_commande_statuses.length - 1]
              .commande_status.code === 'DELIVERED'
        )
        .reduce((sum, order) => {
          return sum + parseInt(order.total_articles);
        }, 0);
    }

    function sumOfDiscounts(orders) {
      return listDeliveredOrders(orders).reduce((sum, order) => {
        return (
          sum +
          parseInt(order.total_articles) +
          parseInt(order.service_fee) -
          parseInt(order.bonus_share) -
          parseInt(order.total)
        );
      }, 0);
    }

    function sumBonusSharedDelivered(orders) {
      return orders
        .filter(
          (order) =>
            order.commande_commande_statuses &&
            order.commande_commande_statuses[order.commande_commande_statuses.length - 1]
              .commande_status.code === 'DELIVERED'
        )
        .reduce((sum, order) => {
          return sum + parseInt(order.bonus_share);
        }, 0);
    }

    function sumTotalPaidDelivered(orders) {
      return orders
        .filter(
          (order) =>
            order.commande_commande_statuses &&
            order.commande_commande_statuses[order.commande_commande_statuses.length - 1]
              .commande_status.code === 'DELIVERED'
        )
        .reduce((sum, order) => {
          return sum + parseInt(order.total);
        }, 0);
    }

    function calculateNetCash(orders) {
      const totalPaid = sumTotalPaidDelivered(orders);
      const merchantPrices = sumMerchantPrices(orders);
      return totalPaid - merchantPrices;
    }

    function calculateGMV(orders) {
      const totalPaid = sumTotalPaidDelivered(orders);
      const bonusShared = sumBonusSharedDelivered(orders);
      const discounts = sumOfDiscounts(orders);
      return totalPaid + bonusShared + discounts;
    }

    const downloadExcel = (data, fn, sheetName) => {
      // Create a new workbook and a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Add column headers and define column keys and widths
      worksheet.columns = [
        { header: 'Command ID', key: 'commandId', width: 10 },
        { header: 'Client', key: 'client', width: 15 },
        { header: 'Livreur', key: 'livreur', width: 20 },
        { header: 'Total Paid', key: 'totalPaid', width: 12 },
        { header: 'Balance Share', key: 'balanceShare', width: 12 },
        { header: 'Bonus Share', key: 'bonusShare', width: 12 },
        { header: 'Service Fee', key: 'serviceFee', width: 12 },
        { header: 'Total Article', key: 'totalArticle', width: 12 },
        { header: 'Merchant Price', key: 'merchantPrice', width: 12 },
        { header: 'Discount', key: 'discount', width: 12 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Merchant Name', key: 'merchantName', width: 15 },
        { header: 'Merchant Number', key: 'merchantNumber', width: 15 },
        { header: 'Payment Method', key: 'paymentMethod', width: 12 },
        { header: 'Created At', key: 'createdAt', width: 15 }
      ];

      // Style the headers
      worksheet.getRow(1).font = {
        bold: true
      };

      // Add some data
      for (const row of data) {
        worksheet.addRow(row);
      }

      // Apply styles to columns J and K
      worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        row.getCell('J').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF91DBC9' } // Lighter Green with Opacity
        };

        row.getCell('K').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC46E7E' } // Lighter Red with Opacity
        };
      });

      // === start ===
      for (let i = 0; i < 3; i++) {
        worksheet.addRow([]);
      }

      // Add the summary row for totals
      const titleRow = worksheet.addRow({
        commandId: null,
        client: null,
        livreur: null,
        totalPaid: 'Total Paid',
        balanceShare: null,
        bonusShare: null,
        serviceFee: null,
        totalArticle: null,
        merchantPrice: null,
        discount: null,
        status: null,
        merchantName: null,
        merchantNumber: null,
        paymentMethod: null,
        createdAt: null
      });
      const headersRow = worksheet.addRow({
        commandId: null,
        client: 'GMV',
        livreur: 'Net Cash',
        totalPaid: 'GMV minus Bonus',
        balanceShare: null,
        bonusShare: 'Bonus Share',
        serviceFee: null,
        totalArticle: 'Article Price',
        merchantPrice: 'Merchant Price',
        discount: 'Discount (Black Friday+etc)',
        status: null,
        merchantName: null,
        merchantNumber: null,
        paymentMethod: 'Total Delivered',
        createdAt: null
      });
      const resultRow = worksheet.addRow({
        commandId: null,
        client: calculateGMV(orders),
        livreur: calculateNetCash(orders),
        totalPaid: sumTotalPaidDelivered(orders),
        balanceShare: null,
        bonusShare: sumBonusSharedDelivered(orders),
        serviceFee: null,
        totalArticle: sumArticlePricesDelivered(orders),
        merchantPrice: sumMerchantPrices(orders),
        discount: sumOfDiscounts(orders),
        status: listDeliveredOrders(orders)?.length,
        merchantName: null,
        merchantNumber: null,
        paymentMethod: null,
        createdAt: null
      });
      worksheet.addRow([]);
      worksheet.addRow({
        commandId: null,
        client: null,
        livreur:
          (parseFloat(calculateNetCash(orders) / calculateGMV(orders)) * 100).toFixed(2) + '%',
        totalPaid: 'Delivered',
        balanceShare: null,
        bonusShare: null,
        serviceFee: null,
        totalArticle: null,
        merchantPrice: 'Delivereds & Undelivered',
        discount: null,
        status: null,
        merchantName: null,
        merchantNumber: null,
        paymentMethod: null,
        createdAt: null
      });

      titleRow.font = { bold: true };
      headersRow.font = { bold: true };
      resultRow.font = { bold: true };
      titleRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber >= 1 && colNumber <= 16) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF91C6FF' } // Yellow fill
          };
        }
      });
      headersRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber >= 1 && colNumber <= 16) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFA3C2E3' } // Yellow fill
          };
        }
      });
      // Write to a buffer
      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        saveAs(blob, `${fn || 'data'}.xlsx`);
      });
    };

    if (orders.length) {
      const fileName =
        'orders_data_from_' +
        moment.utc(orderFormContext.values?.from).format('DD-MM-YYYY') +
        '_to_' +
        moment.utc(orderFormContext.values?.to).format('DD-MM-YYYY');
      const sheetName = 'Orders Data';
      downloadExcel(data, fileName, sheetName);
    } else {
      dispatch(
        showNotification({
          message: 'No data to download',
          status: 0
        })
      );
    }
  };

  const onDownload = () => {
    orders.length
      ? gridRef.current.api?.exportDataAsCsv({
          columnKeys: [
            'id',
            'client.phone_number',
            'livreur',
            'total',
            'balance_share',
            'bonus_share',
            'service_fee',
            'total_articles',
            'commande_commande_statuses',
            'merchant.name',
            'merchant.client.phone_number',
            'payment_method',
            'created_at'
          ],
          fileName:
            'orders_data_from_' +
            moment.utc(orderFormContext.values?.from).format('DD-MM-YYYY') +
            '_to_' +
            moment.utc(orderFormContext.values?.to).format('DD-MM-YYYY')
        })
      : dispatch(
          showNotification({
            message: 'No data to download',
            status: 0
          })
        );
  };

  const onAllPositionsClicked = () => {
    orders.length
      ? dispatch(
          openModal({
            title: 'Position',
            extraObject: { all: true },
            bodyType: MODAL_BODY_TYPES.ORDER_POSITION,
            size: 'max'
          })
        )
      : dispatch(
          showNotification({
            message: 'No position to display',
            status: 0
          })
        );
  };

  const onSelectedPositionsClicked = () => {
    if (showSelectedMap?.length) {
      const selectedRows = gridRef.current.api.getSelectedRows();
      dispatch(
        openModal({
          title: 'Positions',
          extraObject: {
            orders: selectedRows,
            selectedRows: true
          },
          bodyType: MODAL_BODY_TYPES.ORDER_POSITION,
          size: 'max'
        })
      );
    } else {
      dispatch(
        showNotification({
          message: 'Please select at least an order',
          status: 0
        })
      );
    }
  };

  useEffect(() => {
    initiateOrderRetrieval();
  }, [orderFormContext.values]);

  const changeFilter = async ({ key, value }) => {
    await orderFormContext.setValues({
      ...orderFormContext.values,
      [key]: value
    });
    setFilterStates((_) => {
      return {
        ...INITIAL_FILTERS
      };
    });
    await dispatch(
      setOrderStatus({
        [key]: value
      })
    );
  };

  const onReset = async () => {
    await orderFormContext.setValues({
      orderStatus: 'ALL',
      paymentMethod: 'ALL',
      from: from,
      to: to,
      minAmount: minAmount,
      maxAmount: maxAmount,
      searchPattern: searchPattern,
      cmdId: '',
      clientPhone: '',
      merchantName: 'ALL',
      merchantPhone: ''
    });

    dispatch(
      setOrderStatus({
        orderStatus: 'ALL'
      })
    );
    dispatch(
      setPaymentMethod({
        paymentMethod: 'ALL'
      })
    );
    dispatch(
      setFrom({
        from: orderFormContext.values?.from
      })
    );
    dispatch(
      setTo({
        to: orderFormContext.values?.to
      })
    );
    dispatch(
      setMinAmount({
        minAmount: orderFormContext.values?.minAmount
      })
    );
    dispatch(
      setMaxAmount({
        maxAmount: orderFormContext.values?.maxAmount
      })
    );
    dispatch(
      setSearchPattern({
        searchPattern: orderFormContext.values?.searchPattern
      })
    );
    dispatch(
      setCmdId({
        cmdId: ''
      })
    );
    dispatch(
      setClientPhone({
        clientPhone: ''
      })
    );
    dispatch(
      setMerchantName({
        merchantName: 'ALL'
      })
    );
    dispatch(
      setMerchantPhone({
        merchantPhone: ''
      })
    );
    setFilterStates((_) => {
      return {
        ...INITIAL_FILTERS
      };
    });
  };

  return (
    <>
      {!isLoading && (
        <>
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
              {orders.length ? (
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

              <div className="dropdown dropdown-bottom dropdown-end ml-2">
                <label tabIndex={0} className="btn btn-ghost btn-sm normal-case btn-square ">
                  <EllipsisVerticalIcon className="w-5" />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu menu-compact  p-2 shadow bg-base-100 rounded-box w-52">
                  <li onClick={onAllPositionsClicked}>
                    <span>
                      <CiGps className="w-4" />
                      Show All Positions
                    </span>
                  </li>
                  <li onClick={onSelectedPositionsClicked}>
                    <span>
                      <CiGps className="w-4" />
                      Selected Positions
                    </span>
                  </li>
                  <li onClick={onDownload}>
                    <span>
                      <ArrowDownTrayIcon className="w-4" />
                      Download
                    </span>
                  </li>
                  <li onClick={excelDownloader}>
                    <span>
                      <ArrowDownTrayIcon className="w-4" />
                      Download All Data
                    </span>
                  </li>
                  <li>
                    <span>
                      <EnvelopeIcon className="w-4" />
                      Email Digests
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {showStats ? (
            <div className="lg:grid-cols-4 mb-3 md:grid-cols-2 grid-cols-1 gap-6 hidden sm:grid">
              <div className="stats shadow">
                <div className="stat">
                  <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                    <BiFoodMenu className="w-6 h-6" />
                  </div>
                  <div className="stat-title dark:text-slate-300">Orders</div>
                  <div className={`stat-value dark:text-slate-300 text-secondary`}>
                    {statistics.totalOrders - statistics?.InCanceledState}
                    <span className={'text-gray-600 text-xs font-light ml-1'}>
                      (Street <span className={'text-secondary'}>{statistics.street}</span> Cash{' '}
                      <span className={'text-secondary'}>{statistics.cash}</span>)
                    </span>
                  </div>
                  <div className={'stat-desc  '}>
                    <span className={'text-secondary'}>{statistics.totalOrders}</span> In All and{' '}
                    <span className={'text-secondary'}>{statistics.InCanceledState}</span> Cancelled
                  </div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                    <FaCashRegister className="w-6 h-6" />
                  </div>
                  <div className="stat-title dark:text-slate-300">Registered</div>
                  <div className={`stat-value dark:text-slate-300 text-secondary`}>
                    {statistics.InRegisteredState}
                  </div>
                  <div className={'stat-desc  '}>
                    Still <span className={'text-secondary'}>{statistics.InPendingState}</span> In{' '}
                    <span className={'text-secondary'}>Pending</span> State
                  </div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                    <MdOutlineDeliveryDining className="w-6 h-6" />
                  </div>
                  <div className="stat-title dark:text-slate-300">In Delivery</div>
                  <div className={`stat-value dark:text-slate-300 text-secondary`}>
                    {statistics.InInDeliveryState}
                  </div>
                  <div className={'stat-desc  '}>
                    Still <span className={'text-secondary'}>{statistics.InInProcessState}</span> In{' '}
                    <span className={'text-secondary'}>Process</span> State
                  </div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                    <IoCheckmarkDone className="w-6 h-6" />
                  </div>
                  <div className="stat-title dark:text-slate-300">Delivered</div>
                  <div className={`stat-value dark:text-slate-300 text-secondary`}>
                    {statistics.InDeliveredState}
                  </div>
                  <div className={'stat-desc  '}>
                    And <span className={'text-secondary'}>{/*{statistics}*/} TBF</span>{' '}
                    <span className={'text-secondary'}>Undelivered</span>{' '}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-5 gap-4 ">
            <div className="">
              <div className="relative inline-block text-left">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setFilterStates((oldState) => {
                        return {
                          ...INITIAL_FILTERS,
                          sort: !oldState.sort
                        };
                      })
                    }
                    className={
                      'group inline-flex justify-center text-sm  ' +
                      (filterStates?.sort ? 'font-bold text-secondary' : 'font-light')
                    }>
                    Sort
                    <GoChevronDown className={'-mr-1 ml-1 h-5 w-5 flex-shrink-0'} />
                  </button>
                </div>
                {filterStates?.sort && (
                  <div
                    className="absolute z-10 mt-2 w-40 origin-top-right rounded-md bg-base-200 shadow-lg ring-1 ring-base-200"
                    tabIndex="-1">
                    <div className="py-1" role="none">
                      <span className="font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm">
                        Newest
                      </span>
                      <span className="font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm">
                        Oldest
                      </span>
                      <span className="font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm">
                        Price: Low to High
                      </span>
                      <span className="font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm">
                        Price: High to Low
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right sm:mb-2 sm:col-span-4">
              <div className="relative inline-block text-left mx-2">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setFilterStates((oldState) => {
                        return {
                          ...INITIAL_FILTERS,
                          status: !oldState.status
                        };
                      })
                    }
                    className={
                      'group inline-flex justify-center text-sm  ' +
                      (filterStates?.status ? 'font-bold text-secondary' : 'font-light')
                    }>
                    Status
                    <GoChevronDown className={'-mr-1 ml-1 h-5 w-5 flex-shrink-0'} />
                  </button>
                </div>
                {filterStates?.status && (
                  <div
                    className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-base-200 shadow-lg ring-1 ring-base-200"
                    tabIndex="-1">
                    <div className="py-1" role="none">
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.orderStatus === 'ALL' ? 'text-secondary' : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'orderStatus',
                            value: 'ALL'
                          })
                        }>
                        All
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.orderStatus === 'PENDING' ? 'text-secondary' : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'orderStatus',
                            value: 'PENDING'
                          })
                        }>
                        Pending
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.orderStatus === 'REGISTERED'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'orderStatus',
                            value: 'REGISTERED'
                          })
                        }>
                        Registered
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.orderStatus === 'INPROCESS'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'orderStatus',
                            value: 'INPROCESS'
                          })
                        }>
                        In Process
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.orderStatus === 'INDELIVERY'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'orderStatus',
                            value: 'INDELIVERY'
                          })
                        }>
                        In Delivery
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.orderStatus === 'DELIVERED'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'orderStatus',
                            value: 'DELIVERED'
                          })
                        }>
                        Delivered
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.orderStatus === 'UNDELIVERED'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'orderStatus',
                            value: 'UNDELIVERED'
                          })
                        }>
                        Undelivered
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.orderStatus === 'CANCELED'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'orderStatus',
                            value: 'CANCELED'
                          })
                        }>
                        Canceled
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative inline-block text-left mx-2">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setFilterStates((oldState) => {
                        return {
                          ...INITIAL_FILTERS,
                          paymentMethod: !oldState.paymentMethod
                        };
                      })
                    }
                    className={
                      'group inline-flex justify-center text-sm  ' +
                      (filterStates?.paymentMethod ? 'font-bold text-secondary' : 'font-light')
                    }>
                    Payment Method
                    <GoChevronDown className={'-mr-1 ml-1 h-5 w-5 flex-shrink-0'} />
                  </button>
                </div>
                {filterStates?.paymentMethod && (
                  <div
                    className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-base-200 shadow-lg ring-1 ring-base-200"
                    tabIndex="-1">
                    <div className="py-1" role="none">
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.paymentMethod === 'ALL' ? 'text-secondary' : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'paymentMethod',
                            value: 'ALL'
                          })
                        }>
                        All
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.paymentMethod === 'STREET'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'paymentMethod',
                            value: 'STREET'
                          })
                        }>
                        Street
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.paymentMethod === 'CASH' ? 'text-secondary' : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'paymentMethod',
                            value: 'CASH'
                          })
                        }>
                        Cash
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative inline-block text-left mx-2">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setFilterStates((oldState) => {
                        return {
                          ...INITIAL_FILTERS,
                          merchantName: !oldState.merchantName
                        };
                      })
                    }
                    className={
                      'group inline-flex justify-center text-sm  ' +
                      (filterStates?.merchantName ? 'font-bold text-secondary' : 'font-light')
                    }>
                    Merchant Name
                    <GoChevronDown className={'-mr-1 ml-1 h-5 w-5 flex-shrink-0'} />
                  </button>
                </div>
                {filterStates?.merchantName && (
                  <div
                    className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-base-200 shadow-lg ring-1 ring-base-200"
                    tabIndex="-1">
                    <div className="py-1" role="none">
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'ALL' ? 'text-secondary' : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'ALL'
                          })
                        }>
                        All
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'FOOD ANGRE'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'FOOD ANGRE'
                          })
                        }>
                        Food Angre
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'FOOD RIVIERA'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'FOOD RIVIERA'
                          })
                        }>
                        Food Riviera
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'FOOD TREICHVILLE'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'FOOD TREICHVILLE'
                          })
                        }>
                        Food Treichville
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'HOT GRAYA'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'HOT GRAYA'
                          })
                        }>
                        Hot Graya
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'RESTAURANT CANAL'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'RESTAURANT CANAL'
                          })
                        }>
                        Restaurant Canal
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'KING DU DABALI'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'KING DU DABALI'
                          })
                        }>
                        King du Dabali
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'MD RESTO'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'MD RESTO'
                          })
                        }>
                        MD Resto
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'EDEN COOK'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'EDEN COOK'
                          })
                        }>
                        Eden Cook
                      </span>
                      <span
                        className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
                          orderFormContext.values?.merchantName === 'LES MERVEILLES DE TYTY'
                            ? 'text-secondary'
                            : ''
                        }`}
                        onClick={async () =>
                          await changeFilter({
                            key: 'merchantName',
                            value: 'LES MERVEILLES DE TYTY'
                          })
                        }>
                        Les Merveilles de Tyty
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative inline-block text-left mx-2">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setFilterStates((oldState) => {
                        return {
                          ...INITIAL_FILTERS,
                          more: !oldState.more
                        };
                      })
                    }
                    className={
                      'group inline-flex justify-center text-sm  ' +
                      (filterStates?.more ? 'font-bold text-secondary' : 'font-light')
                    }>
                    More
                    <BsPlus className={'-mr-1 ml-1 h-5 w-5 flex-shrink-0'} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {filterStates?.more && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-x-5 lg:gap-y-3 my-2">
                <InputText
                  type="number"
                  defaultValue={orderFormContext.values.cmdId}
                  updateType="cmdId"
                  containerStyle=""
                  inputStyle="input-sm"
                  labelTitle="Command ID"
                  updateFormValue={debouncedUpdateFormValue}
                />
                <InputText
                  type="text"
                  defaultValue={orderFormContext.values.merchantPhone}
                  updateType="merchantPhone"
                  containerStyle=""
                  inputStyle="input-sm"
                  labelTitle="Merchant Number"
                  updateFormValue={debouncedUpdateFormValue}
                />
                <InputText
                  type="text"
                  defaultValue={orderFormContext.values.clientPhone}
                  updateType="clientPhone"
                  containerStyle=""
                  inputStyle="input-sm"
                  labelTitle="Client Phone Number"
                  updateFormValue={debouncedUpdateFormValue}
                />
              </div>
            </>
          )}

          <div
            className={
              'hidden sm:block bg-base-300 px-5 border-0 border-y-2 border-y-gray-300 mb-2 text-base-content'
            }>
            <div className={'grid grid-cols-1 sm:grid-cols-7 gap-3 my-2'}>
              <div className="py-2">Filters</div>

              <div className="sm:col-span-5">
                <div className={'w-full overflow-scroll py-2'}>
                  {Object.entries({
                    orderStatus: 'Status',
                    paymentMethod: 'Paid By',
                    merchantName: 'merchant Name',
                    cmdId: 'Order ID',
                    clientPhone: 'Client Phone',
                    merchantPhone: 'Merchant Phone'
                  }).map(
                    (filter) =>
                      orderFormContext.values[filter[0]] && (
                        <span
                          className="p-2 mx-2 font-thin text-xs rounded-full bg-secondary-content flex-shrink-0 flex-grow-0 whitespace-nowrap"
                          key={filter[0]}>
                          {filter[1]}:
                          <span className="text-secondary font-bold ml-1">
                            {orderFormContext.values[filter[0]]?.toUpperCase()}
                          </span>
                        </span>
                      )
                  )}
                </div>
              </div>

              <div className="py-2 justify-center">
                <button
                  className={'btn btn-xs btn-outline btn-ghost'}
                  onClick={async () => await onReset()}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {orders.length ? (
            <ClientOrdres
              onLoad={loadAdditionalOrders}
              gridOptions={gridOptions}
              gridRef={gridRef}
              setShowSelectedMap={setShowSelectedMap}
            />
          ) : (
            <InfoText styleClasses={'md:grid-cols-2'}>No order found ...</InfoText>
          )}
        </>
      )}
    </>
  );
};

export default Orders;
