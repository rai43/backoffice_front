import React from 'react';

import { AiOutlineFieldTime, AiOutlineFileDone } from 'react-icons/ai';
import { CiWarning } from 'react-icons/ci';
import { FcCancel } from 'react-icons/fc';
import { GiSandsOfTime, GiTimeBomb } from 'react-icons/gi';
import { GoEyeClosed } from 'react-icons/go';
import { IoReturnDownBackOutline } from 'react-icons/io5';
import {
  MdDoneAll,
  MdOutlineAssignmentInd,
  MdOutlineCancel,
  MdOutlineDeliveryDining,
  MdOutlineWarehouse
} from 'react-icons/md';
import { TbUserCancel } from 'react-icons/tb';

export const STATUS_ICON_NAMES = {
  PENDING: <GiSandsOfTime className="w-6 h-6" />,
  REGISTERED: <AiOutlineFileDone className="w-6 h-6" />,
  CANCELED: <MdOutlineCancel className="w-6 h-6" />,
  ASSIGNED_FOR_COLLECTION: <MdOutlineAssignmentInd className="w-6 h-6" />,
  COLLECTION_IN_PROGRESS: <MdOutlineDeliveryDining className="w-6 h-6" />,
  COLLECTED: <AiOutlineFileDone className="w-6 h-6" />,
  NOT_COLLECTED: <MdOutlineCancel className="w-6 h-6" />,
  WAREHOUSED: <MdOutlineWarehouse className="w-6 h-6" />,
  ASSIGNED_FOR_DELIVERY: <MdOutlineAssignmentInd className="w-6 h-6" />,
  DELIVERY_IN_PROGRESS: <MdOutlineDeliveryDining className="w-6 h-6" />,
  WAITING_FOR_DELIVERY: <AiOutlineFieldTime className="w-6 h-6" />,
  DELIVERED: <MdDoneAll className="w-6 h-6" />,
  NOT_DELIVERED: <CiWarning className="w-6 h-6" />,
  ARTICLE_TO_RETURN: <GiTimeBomb className="w-6 h-6" />,
  ASSIGNED_FOR_RETURN: <MdOutlineAssignmentInd className="w-6 h-6" />,
  RETURN_IN_PROGRESS: <MdOutlineDeliveryDining className="w-6 h-6" />,
  RETURNED: <IoReturnDownBackOutline className="w-6 h-6" />,
  NOT_RETURNED: <FcCancel className="w-6 h-6" />,
  REFUSED: <TbUserCancel className="w-6 h-6" />,
  LOST: <GoEyeClosed className="w-6 h-6" />
};

export const STATUS_COLORS = {
  PENDING: 'text-primary',
  REGISTERED: 'text-primary',
  CANCELED: 'text-error',
  ASSIGNED_FOR_COLLECTION: 'text-primary',
  COLLECTION_IN_PROGRESS: 'text-primary',
  COLLECTED: 'text-primary',
  NOT_COLLECTED: 'text-secondary',
  WAREHOUSED: 'text-primary',
  ASSIGNED_FOR_DELIVERY: 'text-primary',
  WAITING_FOR_DELIVERY: 'text-primary',
  DELIVERY_IN_PROGRESS: 'text-primary',
  DELIVERED: 'text-success',
  NOT_DELIVERED: 'text-secondary',
  ARTICLE_TO_RETURN: 'text-secondary',
  ASSIGNED_FOR_RETURN: 'text-primary',
  RETURN_IN_PROGRESS: 'text-primary',
  RETURNED: 'text-success',
  NOT_RETURNED: 'text-secondary',
  REFUSED: 'text-error',
  LOST: 'text-error'
};

export const ABSOLUTE_STATUS_ACTIONS = {
  ABSOLUTE: {
    FRONT: [
      'DELIVERED',
      'NOT_DELIVERED',
      'REGISTERED',
      'WAREHOUSED',
      'ARTICLE_TO_RETURN',
      'REFUSED',
      'RETURNED'
    ],
    BACK: [
      'COLLECTED',
      'NOT_COLLECTED',
      'NOT_RETURNED',
      'PENDING',
      'ASSIGNED_FOR_COLLECTION',
      'ASSIGNED_FOR_DELIVERY'
    ],
    PICKUP: [
      'ASSIGNED_FOR_COLLECTION',
      // 'COLLECTION_IN_PROGRESS',
      'COLLECTED',
      'NOT_COLLECTED'
    ],
    DELIVERY: [
      'ASSIGNED_FOR_DELIVERY',
      // 'WAITING_FOR_DELIVERY',
      // 'DELIVERY_IN_PROGRESS',
      'DELIVERED',
      'NOT_DELIVERED',
      'POSTPONED',
      'REFUSED',
      'ARTICLE_TO_RETURN'
    ],
    RETURN: [
      'ASSIGNED_FOR_RETURN',
      // 'WAITING_FOR_RETURN',
      // 'RETURN_IN_PROGRESS',
      'RETURNED',
      'NOT_RETURNED'
    ],
    CAN_CANCEL: true,
    CAN_DECLARE_LOST: true,
    IS_LOST: true,
    IS_DAMAGED: true,
    IS_REFUNDED: true
  }
};

export const COLIS_ASSIGNMENTS_VS_ACTIONS = {
  INIT: ['PENDING'],
  PICKUP: [
    'CANCEL',
    'REGISTERED',
    'ASSIGNED_FOR_COLLECTION',
    'COLLECTION_IN_PROGRESS',
    'COLLECTED',
    'NOT_COLLECTED'
    // 'WAREHOUSED'
  ],
  DELIVERY: [
    // 'ASSIGNED_FOR_DELIVERY',
    // 'WAITING_FOR_DELIVERY',
    // 'DELIVERY_IN_PROGRESS',
    'DELIVERED',
    'NOT_DELIVERED',
    // 'POSTPONED',
    'REFUSED'
  ],
  RETURN: [
    // 'ARTICLE_TO_RETURN',
    // 'ASSIGNED_FOR_RETURN',
    // 'WAITING_FOR_RETURN',
    // 'RETURN_IN_PROGRESS',
    'RETURNED',
    'NOT_RETURNED'
  ],
  IS_CANCELED: true,
  IS_LOST: true,
  IS_DAMAGED: true,
  IS_REFUNDED: true
};

export const ALL_STATUSES = {
  PENDING: 'PENDING',
  REGISTERED: 'REGISTERED',

  ASSIGNED_FOR_COLLECTION: 'ASSIGNED_FOR_COLLECTION',
  COLLECTION_IN_PROGRESS: 'COLLECTION_IN_PROGRESS', // Ce statut est défini pour chacun des colis que le livreur va récupérer chez un même marchand.
  COLLECTED: 'COLLECTED',
  NOT_COLLECTED: 'NOT_COLLECTED',
  COLLECTION_POSTPONED: 'COLLECTION_POSTPONED',

  WAREHOUSED: 'WAREHOUSED',
  ASSIGNED_FOR_DELIVERY: 'ASSIGNED_FOR_DELIVERY',
  WAITING_FOR_DELIVERY: 'WAITING_FOR_DELIVERY',
  DELIVERY_IN_PROGRESS: 'DELIVERY_IN_PROGRESS',
  DELIVERED: 'DELIVERED',
  NOT_DELIVERED: 'NOT_DELIVERED', // Needs to go back to status WAREHOUSED so that the system can reassign it again
  DELIVERY_POSTPONED: 'DELIVERY_POSTPONED',
  // REFUSED n’est pas un statut mais une raison du statut NOT_DELIVERED (Non livré).
  // Donc REFUSED est à retirer de la liste des statuts.
  REFUSED: 'REFUSED',

  ARTICLE_TO_RETURN: 'ARTICLE_TO_RETURN', // Ce statut n’est pas nécessaire. Le colis reste à REFUSED
  ASSIGNED_FOR_RETURN: 'ASSIGNED_FOR_RETURN',
  WAITING_FOR_RETURN: 'WAITING_FOR_RETURN',
  RETURN_IN_PROGRESS: 'RETURN_IN_PROGRESS',
  RETURNED: 'RETURNED',
  NOT_RETURNED: 'NOT_RETURNED', // The system can reassign it again
  RETURN_POSTPONED: 'RETURN_POSTPONED', // The system can reassign it again

  CANCELED: 'CANCELED',
  LOST: 'LOST', // The amount of the package must be REFUNDED
  DAMAGED: 'DAMAGED' // The amount of the package must be REFUNDED
};

export const STATUS_ACTIONS = {
  [ALL_STATUSES.PENDING]: {
    ACTIONS: [
      { action: ALL_STATUSES.REGISTERED, isActive: false },
      { action: ALL_STATUSES.CANCELED, isActive: true }
    ]
  },
  [ALL_STATUSES.REGISTERED]: {
    ACTIONS: [
      { action: ALL_STATUSES.ASSIGNED_FOR_COLLECTION, isActive: false },
      { action: ALL_STATUSES.CANCELED, isActive: true }
    ]
  },
  [ALL_STATUSES.ASSIGNED_FOR_COLLECTION]: {
    ACTIONS: [{ action: ALL_STATUSES.COLLECTION_IN_PROGRESS, isActive: true }]
  },
  [ALL_STATUSES.COLLECTION_IN_PROGRESS]: {
    ACTIONS: [
      { action: ALL_STATUSES.ASSIGNED_FOR_COLLECTION, isActive: true },
      { action: ALL_STATUSES.COLLECTED, isActive: true },
      { action: ALL_STATUSES.NOT_COLLECTED, isActive: true }
    ]
  },
  [ALL_STATUSES.COLLECTED]: {
    ACTIONS: [
      { action: ALL_STATUSES.COLLECTION_IN_PROGRESS, isActive: true },
      { action: ALL_STATUSES.WAREHOUSED, isActive: true }
    ]
  },
  [ALL_STATUSES.NOT_COLLECTED]: {
    ACTIONS: [
      { action: ALL_STATUSES.CANCELED, isActive: true },
      { action: ALL_STATUSES.COLLECTION_IN_PROGRESS, isActive: true }
    ]
  },
  [ALL_STATUSES.WAREHOUSED]: {
    ACTIONS: [{ action: ALL_STATUSES.ASSIGNED_FOR_DELIVERY, isActive: false }]
  },
  [ALL_STATUSES.ASSIGNED_FOR_DELIVERY]: {
    ACTIONS: [{ action: ALL_STATUSES.WAITING_FOR_DELIVERY, isActive: false }]
  },
  [ALL_STATUSES.WAITING_FOR_DELIVERY]: {
    ACTIONS: [{ action: ALL_STATUSES.DELIVERY_IN_PROGRESS, isActive: true }]
  },
  [ALL_STATUSES.DELIVERY_IN_PROGRESS]: {
    ACTIONS: [
      { action: ALL_STATUSES.DELIVERED, isActive: true },
      { action: ALL_STATUSES.NOT_DELIVERED, isActive: true }
    ]
  },
  [ALL_STATUSES.NOT_DELIVERED]: {
    ACTIONS: [
      { action: ALL_STATUSES.WAREHOUSED, isActive: false },
      { action: ALL_STATUSES.DELIVERED, isActive: true }
    ]
  },
  [ALL_STATUSES.DELIVERED]: {
    ACTIONS: [{ action: ALL_STATUSES.NOT_DELIVERED, isActive: true }]
  },
  // [ALL_STATUSES.REFUSED]: {
  //   ACTIONS: [{ action: ALL_STATUSES.WAREHOUSED, isActive: false }]
  // }
  [ALL_STATUSES.ASSIGNED_FOR_RETURN]: {
    ACTIONS: [{ action: ALL_STATUSES.WAITING_FOR_RETURN, isActive: false }]
  },
  [ALL_STATUSES.ARTICLE_TO_RETURN]: {
    ACTIONS: [{ action: ALL_STATUSES.WAITING_FOR_RETURN, isActive: false }]
  },
  [ALL_STATUSES.WAITING_FOR_RETURN]: {
    ACTIONS: [{ action: ALL_STATUSES.RETURN_IN_PROGRESS, isActive: true }]
  },
  [ALL_STATUSES.RETURN_IN_PROGRESS]: {
    ACTIONS: [
      { action: ALL_STATUSES.RETURNED, isActive: true },
      { action: ALL_STATUSES.NOT_RETURNED, isActive: true }
    ]
  },
  [ALL_STATUSES.RETURNED]: {
    ACTIONS: [
      // No actions are available after successful delivery
    ]
  },
  [ALL_STATUSES.NOT_RETURNED]: {
    ACTIONS: [
      { action: ALL_STATUSES.WAREHOUSED, isActive: false },
      { action: ALL_STATUSES.RETURNED, isActive: true }
    ]
  },
  [ALL_STATUSES.LOST]: {
    ACTIONS: [
      // No actions are available after successful delivery
    ]
  },
  [ALL_STATUSES.CANCELED]: {
    ACTIONS: [
      // No actions are available after successful delivery
    ]
  }
  // [ALL_STATUSES.DELIVERY_POSTPONED]: {
  //   ACTIONS: [
  //     // The postponed delivery can be reassigned for delivery
  //     { action: ALL_STATUSES.ASSIGNED_FOR_DELIVERY, isActive: true }
  //   ]
  // },
};

export const countStatuses = (parcels) => {
  const statusCounts = {
    totalCount: 0,
    pendingCount: 0,
    registeredCount: 0,
    canceledCount: 0,
    assignedForCollectionCount: 0,
    collectionInProgressCount: 0,
    collectedCount: 0,
    notCollectedCount: 0,
    warehousedCount: 0,
    assignedForDeliveryCount: 0,
    waitingForDeliveryCount: 0,
    deliveryInProgressCount: 0,
    deliveredCount: 0,
    notDeliveredCount: 0,
    articleToReturnCount: 0,
    assignedForReturnCount: 0,
    returnInProgressCount: 0,
    returnedCount: 0,
    notReturnedCount: 0,
    refusedCount: 0,
    lostCount: 0
  };

  parcels.forEach((parcel) => {
    const code = parcel?.colis_statuses?.length
      ? parcel?.colis_statuses[
          parcel?.colis_statuses?.length - 1
        ]?.colis_status?.code?.toUpperCase()
      : '';
    switch (code) {
      case 'PENDING':
        statusCounts.pendingCount++;
        break;
      case 'REGISTERED':
        statusCounts.registeredCount++;
        break;
      case 'CANCELED':
        statusCounts.canceledCount++;
        break;
      case 'ASSIGNED_FOR_COLLECTION':
        statusCounts.assignedForCollectionCount++;
        break;
      case 'COLLECTION_IN_PROGRESS':
        statusCounts.collectionInProgressCount++;
        break;
      case 'COLLECTED':
        statusCounts.collectedCount++;
        break;
      case 'NOT_COLLECTED':
        statusCounts.notCollectedCount++;
        break;
      case 'WAREHOUSED':
        statusCounts.warehousedCount++;
        break;
      case 'ASSIGNED_FOR_DELIVERY':
        statusCounts.assignedForDeliveryCount++;
        break;
      case 'WAITING_FOR_DELIVERY':
        statusCounts.waitingForDeliveryCount++;
        break;
      case 'DELIVERY_IN_PROGRESS':
        statusCounts.deliveryInProgressCount++;
        break;
      case 'DELIVERED':
        statusCounts.deliveredCount++;
        break;
      case 'NOT_DELIVERED':
        statusCounts.notDeliveredCount++;
        break;
      case 'ARTICLE_TO_RETURN':
        statusCounts.articleToReturnCount++;
        break;
      case 'ASSIGNED_FOR_RETURN':
        statusCounts.assignedForReturnCount++;
        break;
      case 'RETURN_IN_PROGRESS':
        statusCounts.returnInProgressCount++;
        break;
      case 'RETURNED':
        statusCounts.returnedCount++;
        break;
      case 'NOT_RETURNED':
        statusCounts.notReturnedCount++;
        break;
      case 'REFUSED':
        statusCounts.refusedCount++;
        break;
      case 'LOST':
        statusCounts.lostCount++;
        break;
    }
    statusCounts.totalCount++;
  });

  return statusCounts;
};

export const STATUS_ENGLISH_VS_FRENCH = (givenStatus) => {
  const status = {
    PENDING: 'En attente',
    REGISTERED: 'Enregistré',
    CANCELED: 'Annulé',
    ASSIGNED_FOR_COLLECTION: 'Attribué pour collecte',
    COLLECTION_IN_PROGRESS: 'Collecte en cours',
    COLLECTED: 'Collecté',
    NOT_COLLECTED: 'Non collecté',
    WAREHOUSED: 'Entreposé',
    ASSIGNED_FOR_DELIVERY: 'Attribué pour livraison',
    WAITING_FOR_DELIVERY: 'En attente de livraison',
    DELIVERY_IN_PROGRESS: 'Livraison en cours',
    DELIVERED: 'Livré',
    NOT_DELIVERED: 'Non livré',
    ARTICLE_TO_RETURN: 'Article à retourner',
    ASSIGNED_FOR_RETURN: 'Attribué pour retour',
    RETURN_IN_PROGRESS: 'Retour en cours',
    RETURNED: 'Retourné',
    NOT_RETURNED: 'Non retourné',
    REFUSED: 'Refusé',
    LOST: 'Perdu'
  };

  return status[givenStatus] ? status[givenStatus] : givenStatus?.replaceAll('_', ' ');
};
