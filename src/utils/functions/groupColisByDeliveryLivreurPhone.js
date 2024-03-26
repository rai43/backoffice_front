import getLatestAssignment from './getLatestAssignment';
import {
  calculateMontantACollecter,
  determinePhase
} from '../../features/colis/components/PointVersementLivreurContent';

// function groupColisByDeliveryLivreurPhone(data) {
//   const groupedData = {};
//
//   console.log({ data });
//
//   // Iterate over each colis item in the data
//   data.forEach((colisItem) => {
//     const latestAssignment = getLatestAssignment(colisItem?.commande_colis);
//     // const latestAssignment = colisItem?.colis_assignment?.[0];
//
//     const colisStatuses = colisItem?.colis_statuses;
//     const lastStatus = colisStatuses?.[0];
//     const oneBeforeLastStatus = colisStatuses?.[1];
//
//     let groupKey;
//
//     if (latestAssignment && latestAssignment?.livreur) {
//       // Concatenate client's phone number, first name, and last name as the group key
//       const delivery_livreur = latestAssignment.livreur;
//       groupKey = `${delivery_livreur.first_name || ''} ${delivery_livreur.last_name || ''} (${
//         delivery_livreur?.client?.phone_number || ''
//       })`
//         ?.trim()
//         ?.toUpperCase();
//     } else {
//       groupKey = 'no_delivery_livreur';
//     }
//
//     // Initialize the group if it doesn't exist
//     if (!groupedData[groupKey]) {
//       groupedData[groupKey] = {
//         colisList: [],
//         totalAmountToBePaid: 0,
//         processingFee: 0,
//         finalAmountDue: 0,
//         totalFee: 0,
//         deliveryStatusCounts: {}
//       };
//     }
//
//     // Add the current colis item to the group
//     groupedData[groupKey].colisList.push(colisItem);
//
//     // Get the last status of the colis
//     // const lastStatus = colisItem.colis_statuses[0];
//     if (lastStatus) {
//       const status = lastStatus.colis_status.code;
//
//       // Update the count of delivery statuses
//       groupedData[groupKey].deliveryStatusCounts[status] =
//         (groupedData[groupKey].deliveryStatusCounts[status] || 0) + 1;
//
//       // Calculate the amount to be paid based on the status and payment conditions
//       if (
//         status === 'DELIVERED' &&
//         parseInt(colisItem.price) > 0
//         // &&
//         // colisItem.payment === 'PENDING'
//       ) {
//         let amountToBePaid = parseInt(colisItem.price);
//         if (colisItem.fee_payment === 'PREPAID' && status !== 'LOST') {
//           amountToBePaid -= parseInt(colisItem.fee || 0);
//         }
//         groupedData[groupKey].totalAmountToBePaid += amountToBePaid;
//       }
//
//       if (status === 'DELIVERED' && colisItem.fee_payment === 'POSTPAID') {
//         // Add fee to totalFee for POSTPAID items
//         groupedData[groupKey].totalFee += parseInt(colisItem.fee || 0);
//       }
//     }
//     // }
//   });
//
//   // Final calculations for each groupallima
//   for (const key in groupedData) {
//     const group = groupedData[key];
//     // Calculate processing fee and final amount due
//     group.processingFee = group.totalAmountToBePaid * 0; // 0.01
//     group.finalAmountDue = group.totalAmountToBePaid - group.processingFee;
//     // Add the total count of colis items in the group
//     group.deliveryStatusCounts.total = group.colisList.length;
//   }
//
//   // Apply sorting for each client's colisList
//   for (const phone in groupedData) {
//     groupedData[phone].colisList.sort((a, b) => {
//       const lastStatusA = a.colis_statuses[a.colis_statuses.length - 1].colis_status.code;
//       const lastStatusB = b.colis_statuses[b.colis_statuses.length - 1].colis_status.code;
//       return lastStatusA.localeCompare(lastStatusB);
//     });
//   }
//
//   return groupedData;
// }

const groupColisByDeliveryLivreurPhone = (data) => {
  console.log({ data });
  const groupedInfo = {};

  data?.forEach((colis) => {
    console.log({ colis });
    const paymentList = colis?.commande_colis;
    // ?.filter((cc) => cc.versement_status === 'PENDING') || [];

    paymentList?.forEach((paymentItem) => {
      console.log({ paymentItem });
      const livreur = paymentItem.livreur;
      const livreurInfo = `${livreur.first_name || ''} ${livreur.last_name || ''} (${
        livreur?.client?.phone_number || ''
      })`.toUpperCase();
      const status = paymentItem?.colis_status?.colis_status?.code;
      const phase = determinePhase(status);
      const montantACollecter = calculateMontantACollecter(colis, phase);

      if (!groupedInfo[livreurInfo]) {
        groupedInfo[livreurInfo] = {
          livreur: livreurInfo,
          totalLivraisons: 0,
          totalAmountToBePaid: 0,
          totalDeliveryFees: 0,
          finalAmount: 0,
          colis: []
        };
      }

      groupedInfo[livreurInfo].totalLivraisons += 1;

      if (phase === 'Delivery') {
        groupedInfo[livreurInfo].totalAmountToBePaid += parseInt(montantACollecter || 0);
      } else if (phase === 'Collection') {
        groupedInfo[livreurInfo].totalDeliveryFees += parseInt(colis.fee || 0);
      }

      groupedInfo[livreurInfo].finalAmount =
        groupedInfo[livreurInfo].totalAmountToBePaid + groupedInfo[livreurInfo].totalDeliveryFees;

      // Create a new colis object containing only the relevant commande_colis
      const relevantColis = {
        ...colis,
        commande_colis: [paymentItem]
      };

      groupedInfo[livreurInfo].colis.push(relevantColis);
    });
  });

  return groupedInfo;
};

export default groupColisByDeliveryLivreurPhone;
