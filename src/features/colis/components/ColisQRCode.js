// noinspection UnnecessaryLocalVariableJS

import React, { useState } from 'react';

import CryptoJS from 'crypto-js';
import { jsPDF } from 'jspdf';
// import QRCode from 'qrcode.react';
import QRCode from 'qrcode';

const ColisQrCode = () => {
  const [pages, setPages] = useState(1); // Number of pages to generate

  const encryptData = (data) => {
    console.log({ data });
    // Secret key and IV. For AES, the key size could be 16 bytes (AES-128), 24 bytes (AES-192), or 32 bytes (AES-256). Here we use AES-256.
    const key = CryptoJS.enc.Utf8.parse('9pTbLjNM5al6oZnIZxaiOSuSb9ufF7Lg'); // 32 bytes for AES-256
    const iv = CryptoJS.enc.Utf8.parse('n4Y4YVDoD8mq1mMO'); // 16 bytes

    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  };

  const generatePDF = async () => {
    if (pages < 1) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // const secretKey = 'b540d374926b25c2c64750ecacd653e0dc311a6484a05e63fb1aab08af9cce52';
    const timestamp = Date.now().toString();
    // const encryptedTimestamp = encryptData(timestamp, secretKey).toUpperCase();
    const encryptedTimestamp = encryptData(timestamp);

    const marginLeft = 12; // 1cm converted to mm
    const marginTop = 14.5; // 1.4cm converted to mm
    const qrSize = 25; // QR code size is already correctly specified in mm
    const spacing = 2; // 2mm spacing between each QR code

    for (let page = 0; page < pages; page++) {
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 7; col++) {
          const x = marginLeft + col * (qrSize + spacing);
          const y = marginTop + row * (qrSize + spacing);

          const positionValue = parseInt(`${page + 1}${row + 1}${col + 1}`, 10);
          const base32Value = positionValue.toString(32).toUpperCase();
          const qrValue = `STREET-#$#-${encryptedTimestamp}-#$#-${base32Value}`;

          console.log({ qrValue });

          // Generate QR code as Data URL
          try {
            const url = await QRCode.toDataURL(qrValue, {
              margin: 1,
              width: qrSize * 4
            });
            doc.addImage(url, 'JPEG', x, y, 24, 24);
          } catch (err) {
            console.error(err);
          }
        }
      }

      if (page < pages - 1) {
        doc.addPage();
      }
    }

    // FOR HOT FIX

    // let x = 15;
    // let y = 15;
    // for (const qrValue of [
    //   'STREET-#$#-qgmwbaWzCG7hFK60juvtEQ==-#$#-8P',
    //   'STREET-#$#-U2FSDGVKX18UUL0B7IN46B8FQ56OL9/3WA9B9Q0FS]4=-#$#-57',
    //   'STREET-#$#-qgmwbaWzCG7hFK60juvtEQ==-#$#-12I',
    //   'STREET-#$#-qgmwbaWzCG7hFK60juvtEQ==-#$#-12H',
    //   'STREET-#$#-qgmwbaWzCG7hFK60juvtEQ==-#$#-5B',
    //   'STREET-#$#-qgmwbaWzCG7hFK60juvtEQ==-#$#-4S',
    //   'STREET-#$#-U2FSDGVKX18UUL0B7IN46B8FQ56OL9/3WA9B9Q0FS]4=-#$#-4T',
    //   'STREET-#$#-U2FSDGVKX18UUL0B7IN46B8FQ56OL9/3WA9B9Q0FS]4=-#$#-5R',
    //   'STREET-#$#-U2FSDGVKX18UUL0B7IN46B8FQ56OL9/3WA9B9Q0FS]4=-#$#-3K',
    //   'STREET-#$#-qgmwbaWzCG7hFK60juvtEQ==-#$#-93'
    // ]) {
    //   try {
    //     const url = await QRCode.toDataURL(qrValue, {
    //       margin: 1,
    //       width: qrSize * 4
    //     });
    //     doc.addImage(url, 'JPEG', x, y, 24, 24);
    //     x += 10;
    //     y += 25;
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }
    // doc.addPage();
    doc.save(`qr-codes-${timestamp}.pdf`);
  };

  return (
    <div className="flex justify-center p-6 bg-gray-100">
      <div className="flex flex-col space-y-4 bg-white p-8 rounded-lg shadow">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Number of Pages To Generate</span>
          </label>
          <input
            type="number"
            value={pages}
            onChange={(e) => setPages(parseInt(e.target.value, 10) || '')}
            placeholder="Number of pages"
            className="input input-bordered w-full"
          />
        </div>
        <button onClick={generatePDF} className="btn btn-primary">
          Generate PDF
        </button>
      </div>
    </div>
  );
};

export default ColisQrCode;
