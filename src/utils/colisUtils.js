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
    FRONT: ['DELIVERED', 'NOT_DELIVERED', 'REGISTERED', 'ARTICLE_TO_RETURN', 'REFUSED', 'RETURNED'],
    BACK: [
      'COLLECTED',
      'NOT_COLLECTED',
      'NOT_RETURNED',
      'PENDING',
      'ASSIGNED_FOR_COLLECTION',
      'ASSIGNED_FOR_DELIVERY'
    ],
    CAN_CANCEL: true,
    CAN_DECLARE_LOST: true
  }
};

export const STATUS_ACTIONS = {
  PENDING: {
    FRONT: ['REGISTERED'],
    BACK: [],
    CAN_CANCEL: true
  },
  REGISTERED: {
    FRONT: ['ASSIGNED_FOR_COLLECTION'],
    BACK: ['PENDING'],
    CAN_CANCEL: true
  },
  ASSIGNED_FOR_COLLECTION: {
    FRONT: ['COLLECTION_IN_PROGRESS'],
    BACK: ['REGISTERED'],
    CAN_CANCEL: true
  },
  COLLECTION_IN_PROGRESS: {
    FRONT: ['COLLECTED', 'NOT_COLLECTED'],
    BACK: ['ASSIGNED_FOR_COLLECTION'],
    CAN_CANCEL: true
  },
  COLLECTED: {
    FRONT: ['WAREHOUSED', 'ARTICLE_TO_RETURN'],
    BACK: ['COLLECTION_IN_PROGRESS'],
    CAN_DECLARE_LOST: true
  },
  NOT_COLLECTED: {
    FRONT: ['COLLECTED', 'PENDING'],
    BACK: ['COLLECTION_IN_PROGRESS'],
    CAN_CANCEL: true
  },
  WAREHOUSED: {
    FRONT: ['ASSIGNED_FOR_DELIVERY', 'ARTICLE_TO_RETURN'],
    BACK: ['COLLECTED'],
    CAN_DECLARE_LOST: true
  },
  ASSIGNED_FOR_DELIVERY: {
    FRONT: ['WAITING_FOR_DELIVERY', 'ARTICLE_TO_RETURN'],
    BACK: ['WAREHOUSED'],
    CAN_DECLARE_LOST: true
  },
  WAITING_FOR_DELIVERY: {
    FRONT: ['DELIVERY_IN_PROGRESS', 'ARTICLE_TO_RETURN'],
    BACK: ['ASSIGNED_FOR_DELIVERY'],
    CAN_DECLARE_LOST: true
  },
  DELIVERY_IN_PROGRESS: {
    FRONT: ['DELIVERED', 'NOT_DELIVERED', 'ARTICLE_TO_RETURN'],
    BACK: ['WAITING_FOR_DELIVERY'],
    CAN_DECLARE_LOST: true
  },
  DELIVERED: {
    FRONT: [],
    BACK: ['DELIVERY_IN_PROGRESS']
  },
  NOT_DELIVERED: {
    FRONT: ['ARTICLE_TO_RETURN', 'DELIVERED'],
    BACK: ['WAREHOUSED', 'DELIVERY_IN_PROGRESS'],
    CAN_DECLARE_LOST: true
  },
  ARTICLE_TO_RETURN: {
    FRONT: ['ASSIGNED_FOR_RETURN'],
    BACK: ['PENDING', 'WAREHOUSED'],
    CAN_DECLARE_LOST: true
  },
  ASSIGNED_FOR_RETURN: {
    FRONT: ['RETURN_IN_PROGRESS'],
    BACK: ['ARTICLE_TO_RETURN'],
    CAN_DECLARE_LOST: true
  },
  RETURN_IN_PROGRESS: {
    FRONT: ['RETURNED', 'NOT_RETURNED'],
    BACK: ['ASSIGNED_FOR_RETURN'],
    CAN_DECLARE_LOST: true
  },
  RETURNED: {
    FRONT: [],
    BACK: ['RETURN_IN_PROGRESS']
  },
  NOT_RETURNED: {
    FRONT: ['RETURNED'],
    BACK: ['WAREHOUSED', 'RETURN_IN_PROGRESS', 'ARTICLE_TO_RETURN'],
    CAN_DECLARE_LOST: true
  },
  REFUSED: {
    FRONT: [],
    BACK: ['WAREHOUSED', 'ARTICLE_TO_RETURN'],
    CAN_DECLARE_LOST: true
  },
  CANCELED: {
    FRONT: [],
    BACK: ['PENDING']
  },
  LOST: {
    FRONT: [],
    BACK: ['PENDING']
  }
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
