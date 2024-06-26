import React, { useCallback, useState, useRef } from 'react';

import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import flatpickr from 'flatpickr';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';

import {
  TABS_ENUMERATION_IN_COLIS,
  TABS_ENUMERATION_IN_QR_CODE_PANEL
} from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';

const DownloadColisData = ({ closeModal }) => {
  const dispatch = useDispatch();

  const [startDate, setStartDate] = useState(moment.utc().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment.utc().format('YYYY-MM-DD'));

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const updateEndDate = (newStartDate) => {
    if (moment(newStartDate).isAfter(endDate)) {
      setEndDate(newStartDate);
    }
  };

  const updateStartDate = (newEndDate) => {
    if (moment(startDate).isAfter(newEndDate)) {
      setStartDate(newEndDate);
    }
  };

  const inputStartDateRef = useCallback(
    (node) => {
      if (node !== null) {
        startDateRef.current = flatpickr(node, {
          enableTime: true,
          defaultDate: startDate,
          dateFormat: 'Y-m-d',
          time_24hr: true,
          onChange: (date) => {
            const newStartDate = moment.utc(date[0]).format('YYYY-MM-DD');
            setStartDate(newStartDate);
            updateEndDate(newStartDate);
          }
        });
      }
    },
    [startDate, endDate]
  );

  const inputEndDateRef = useCallback(
    (node) => {
      if (node !== null) {
        endDateRef.current = flatpickr(node, {
          enableTime: true,
          defaultDate: endDate,
          dateFormat: 'Y-m-d',
          time_24hr: true,
          onChange: (date) => {
            const newEndDate = moment.utc(date[0]).format('YYYY-MM-DD');
            setEndDate(newEndDate);
            updateStartDate(newEndDate);
          }
        });
      }
    },
    [startDate, endDate]
  );

  const excelDownloader = async (startDate, endDate) => {
    const downloadExcel = (data, fn, sheetName) => {
      // Create a new workbook and a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Update column headers and define column keys and widths
      worksheet.columns = [
        { header: 'Code', key: 'code', width: 10 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Merchant', key: 'merchant', width: 13 },
        { header: 'Client', key: 'client', width: 13 },
        { header: 'Pickup Address', key: 'pickup_address', width: 35 },
        { header: 'Delivery Address', key: 'delivery_address', width: 35 },
        { header: 'Fee Payment', key: 'fee_payment', width: 10 },
        { header: 'Price', key: 'price', width: 10 },
        { header: 'Fee', key: 'fee', width: 10 },
        { header: 'Amount To Collect', key: 'amount_to_collect', width: 15 },
        { header: 'Livreurs and Statuses', key: 'livreurs', width: 50 }, // New column for all livreurs
        // { header: 'Pickup Date', key: 'pickup_date', width: 12 },
        { header: 'Creation', key: 'created_at', width: 20 }
      ];

      // Style the headers
      worksheet.getRow(1).font = {
        bold: true
      };

      // Add some data
      for (const row of data) {
        worksheet.addRow(row);
      }

      // Additional Excel file formatting and styling goes here
      // Many additional things will be added here according to the boss specifications

      // Save the Excel file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        saveAs(blob, `${fn}.xlsx`);
      });
    };

    try {
      const config = {
        params: {
          from: startDate,
          to: endDate,
          skip: 0,
          type: TABS_ENUMERATION_IN_COLIS.date_search
        }
      };

      const response = await axios.get('/api/colis/get-colis', config);

      const formattedData = response?.data?.colis?.map((colis) => {
        // Concatenate all livreur names and statuses from assignments
        const livreursInfo = colis?.commande_colis
          ?.map((assignment) => {
            const livreurName = `${assignment?.livreur?.last_name} ${assignment?.livreur?.first_name}`;
            const status =
              assignment.colis_status?.colis_status?.code?.replaceAll('_', ' ')?.toUpperCase() ||
              'N/A';
            return `${livreurName} (${assignment.livreur.client.phone_number}) - Status: ${status}`;
          })
          .join('; ');

        return {
          code: colis?.code,
          status: colis?.status?.colis_status?.code?.replaceAll('_', ' ')?.toUpperCase() || 'N/A',
          merchant: colis?.client?.phone_number || 'N/A',
          client: colis?.delivery_phone_number || 'N/A',
          pickup_address: colis?.pickup_address?.description?.toUpperCase() || 'N/A',
          delivery_address: colis?.delivery_address?.description?.toUpperCase() || 'N/A',
          fee_payment: colis?.fee_payment,
          price: parseInt(colis?.price),
          fee: parseInt(colis?.fee),
          amount_to_collect:
            colis?.fee_payment === 'PREPAID'
              ? parseInt(colis?.price)
              : parseInt(parseFloat(colis?.price) + parseFloat(colis?.fee)),
          livreurs: livreursInfo.toUpperCase(),
          // pickup_date: moment.utc(colis?.pickup_date).format('DD-MM-YYYY'),
          created_at: moment.utc(colis?.created_at).format('DD-MM-YYYY HH:mm')
        };
      });

      if (formattedData?.length) {
        const fileName = `colis_data_from_${moment.utc(startDate).format('DD-MM-YYYY')}_to_${moment
          .utc(endDate)
          .format('DD-MM-YYYY')}`;
        const sheetName = 'Colis Data';
        downloadExcel(formattedData, fileName, sheetName);
        dispatch(
          showNotification({
            message: `Data successfully downloaded from ${moment
              .utc(startDate)
              ?.format('DD-MM-YYYY')} to ${moment.utc(endDate)?.format('DD-MM-YYYY')}`,
            status: 1
          })
        );
        closeModal();
      } else {
        // Dispatch a notification if there's no data to download
        dispatch(
          showNotification({
            message: 'No data to download. Try another date range',
            status: 1
          })
        );
      }
    } catch (error) {
      console.error('Error fetching colis data:', error);
      dispatch(
        showNotification({
          message: 'Error fetching data for download',
          status: 0
        })
      );
    }
  };

  const handleSubmit = async () => {
    console.log({ startDate, endDate });
    await excelDownloader(startDate, endDate);
  };

  return (
    <div>
      <div className="grid md:grid-cols-1 md:gap-3">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-base-content">Start Date</span>
          </label>
          <input type="date" className="input input-bordered w-full" ref={inputStartDateRef} />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-base-content">End Date</span>
          </label>
          <input type="date" className="input input-bordered w-full" ref={inputEndDateRef} />
        </div>
      </div>
      <div className="flex justify-around flex-wrap gap-3 my-5">
        <button className={'inline-flex btn btn-outline btn-ghost'} onClick={() => closeModal()}>
          Cancel
        </button>
        <button className={'inline-flex btn btn-outline btn-secondary'} onClick={handleSubmit}>
          Download <ArrowDownTrayIcon className={'ml-2 h-6 w-6'} />
        </button>
      </div>
    </div>
  );
};

export default DownloadColisData;
