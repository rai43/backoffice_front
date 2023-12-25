import React, { useEffect, useState } from 'react';

import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { MdBlockFlipped } from 'react-icons/md';

import WalletCard from '../../../components/Cards/WalletCard';
import UserBasicDetail from '../../../components/Common/UserBasicDetail';
import BasicModal from '../../../components/Modals/BasicModal';
import InfoText from '../../../components/Typography/InfoText';
import { enableScroll } from '../../../utils/functions/preventAndAllowScroll';
import { RIGHT_DRAWER_TYPES } from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';
import { openRightDrawer } from '../../common/rightDrawerSlice';
import { blockClientPaymentMethod, switchClientAccountStatusToServer } from '../clientSlice';

const PAYMENT_METHODS = {
  STREET: 'STREET',
  CASH: 'CASH'
};

const ClientDetailView = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const { clients, from, isLoading, noMoreQuery } = useSelector((state) => state.client);
  const [clientObj, setClientObj] = useState({});
  const [blockMethodsState, setBlockMethodsState] = useState({
    [PAYMENT_METHODS.CASH]: false,
    [PAYMENT_METHODS.STREET]: false
  });

  const cancelBlockAction = () => {};
  const openCardDetails = (client, wallet) => {
    // api call to get the client transactions details
    dispatch(
      openRightDrawer({
        header: `Wallet Details View - ${client.phone_number} (${
          wallet?.wallet_type?.libelle || 'N/A'
        })`,
        bodyType: RIGHT_DRAWER_TYPES.CLIENT_CARD_DETAILS,
        extraObject: { client, wallet }
      })
    );
  };

  useEffect(() => {
    setClientObj((oldObj) => {
      return {
        ...oldObj,
        ...clients.find((client) => client?.id === extraObject?.id)
      };
    });
  }, []);

  console.log(extraObject);

  const onCloseBlockModal = () => {
    enableScroll();
    setBlockMethodsState(() => {
      return {
        [PAYMENT_METHODS.CASH]: false,
        [PAYMENT_METHODS.STREET]: false
      };
    });
  };

  const onBlockMethodClicked = (method) => {
    setBlockMethodsState(() => {
      if (method === PAYMENT_METHODS.CASH) {
        return {
          [PAYMENT_METHODS.CASH]: true,
          [PAYMENT_METHODS.STREET]: false
        };
      } else {
        return {
          [PAYMENT_METHODS.CASH]: false,
          [PAYMENT_METHODS.STREET]: true
        };
      }
    });
  };

  const onProceedActionModal = async ({ client, method, actionString }) => {
    const response = await dispatch(
      blockClientPaymentMethod({
        clientId: client,
        methodString: method,
        action: actionString
      })
    );

    if (response?.error) {
      dispatch(
        showNotification({
          message: 'Error while changing the payment method status',
          status: 0
        })
      );
    } else {
      dispatch(
        showNotification({
          message: 'Successfully changed the payment method status',
          status: 1
        })
      );
      onCloseBlockModal();
    }
  };

  return (
    <div className="w-full">
      {/* Divider */}
      <div className="divider mt-0"></div>

      {/* Basic Client Info */}
      <UserBasicDetail
        {...clients.find((client) => client?.id === extraObject?.id)}
        photo={clients.find((client) => client?.id === extraObject?.id)?.photo}
      />

      {/* Info card */}
      <div className="w-full stats stats-vertical lg:stats-horizontal shadow">
        <div className="stat">
          <div className="stat-title">Number of wallets</div>
          <div className="stat-value">
            {clients.find((client) => client?.id === extraObject?.id)?.wallets?.length || 'N/A'}
          </div>
          <div className="stat-desc">Wallet count</div>
        </div>

        <div className="stat">
          <div className="stat-title">Client Type</div>
          <div className="stat-value text-[1.5rem]">
            {clients.find((client) => client?.id === extraObject?.id)?.client_type?.libelle ||
              'N/A'}
          </div>
          <div className="stat-desc">
            Merchant ID:{' '}
            <span className="font-semibold">
              {clients.find((client) => client?.id === extraObject?.id)?.merchants[0]?.id || 'N/A'}
            </span>
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">Country</div>
          <div className="stat-value text-[1.5rem]">
            {clients.find((client) => client?.id === extraObject?.id)?.country?.name || 'N/A'}
          </div>
          <div className="stat-desc">
            Code:{' '}
            <span className="font-semibold">
              {clients.find((client) => client?.id === extraObject?.id)?.country?.code || 'N/A'}
            </span>{' '}
            | Prefix: <span className="font-semibold">{extraObject?.country?.prefix || 'N/A'}</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Creation Info</div>
          <div className="stat-value text-[1.5rem]">
            {moment.utc(extraObject?.created_at).format('lll') || 'N/A'}
          </div>
          <div className="stat-desc">
            By:{' '}
            <span className="font-semibold">
              {clients.find((client) => client?.id === extraObject?.id)?.created_by || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-5 mb-0 ">
        <button
          className="btn btn-sm btn-outline btn-ghost hover:btn-secondary hover:text-white w-full"
          onClick={() => onBlockMethodClicked(PAYMENT_METHODS.CASH)}>
          <MdBlockFlipped className="h-4 w-4 mr-3" />
          {clients
            .find((client) => client?.id === extraObject?.id)
            ?.client_blocked_payment_methods?.find(
              (blockedMethod) => blockedMethod?.payment_method?.method === PAYMENT_METHODS?.CASH
            )
            ? 'Unlock '
            : 'Lock '}
          Cash Payment
        </button>
        <button
          className="btn btn-sm btn-outline btn-ghost hover:btn-secondary hover:text-white w-full"
          onClick={() => onBlockMethodClicked(PAYMENT_METHODS.STREET)}>
          <MdBlockFlipped className="h-4 w-4 mr-3" />
          {clients
            .find((client) => client?.id === extraObject?.id)
            ?.client_blocked_payment_methods?.find(
              (blockedMethod) => blockedMethod?.payment_method?.method === PAYMENT_METHODS?.STREET
            )
            ? 'Unlock '
            : 'Lock '}
          Street Payment
        </button>
      </div>

      <BasicModal
        isOpen={blockMethodsState[PAYMENT_METHODS.CASH]}
        onProceed={async () =>
          await onProceedActionModal({
            client: extraObject?.id,
            method: PAYMENT_METHODS.CASH,
            actionString: clients
              .find((client) => client?.id === extraObject?.id)
              ?.client_blocked_payment_methods?.find(
                (blockedMethod) => blockedMethod?.payment_method?.method === PAYMENT_METHODS?.CASH
              )
              ? 'UNLOCK'
              : 'LOCK'
          })
        }
        onClose={() => {
          onCloseBlockModal();
        }}>
        <p>
          ARE YOU SURE YOU WANT{' '}
          <span className="text-secondary font-semibold">
            {' '}
            TO
            {clients
              .find((client) => client?.id === extraObject?.id)
              ?.client_blocked_payment_methods?.find(
                (blockedMethod) => blockedMethod?.payment_method?.method === PAYMENT_METHODS?.CASH
              )
              ? ' UNLOCK '
              : ' LOCK '}
            CASH PAYMENT
          </span>
        </p>
      </BasicModal>
      <BasicModal
        isOpen={blockMethodsState[PAYMENT_METHODS.STREET]}
        onProceed={async () =>
          await onProceedActionModal({
            client: extraObject?.id,
            method: PAYMENT_METHODS.STREET,
            actionString: clients
              .find((client) => client?.id === extraObject?.id)
              ?.client_blocked_payment_methods?.find(
                (blockedMethod) => blockedMethod?.payment_method?.method === PAYMENT_METHODS?.STREET
              )
              ? 'UNLOCK'
              : 'LOCK'
          })
        }
        onClose={() => {
          onCloseBlockModal();
        }}>
        <p>
          ARE YOU SURE YOU WANT{' '}
          <span className="text-secondary font-semibold">
            TO
            {clients
              .find((client) => client?.id === extraObject?.id)
              ?.client_blocked_payment_methods?.find(
                (blockedMethod) => blockedMethod?.payment_method?.method === PAYMENT_METHODS?.STREET
              )
              ? ' UNLOCK '
              : ' LOCK '}
            STREET PAYMENT
          </span>
        </p>
      </BasicModal>

      <div className="w-full my-5">
        <h3 className="text-lg font-semibold">
          User Card
          {clients.find((client) => client?.id === extraObject?.id)?.wallets?.length > 1 ? 's' : ''}
        </h3>
        <div className="divider mt-0"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 md:gap-y-6">
          {clients.find((client) => client?.id === extraObject?.id)?.wallets.length ? (
            <>
              {clients
                .find((client) => client?.id === extraObject?.id)
                ?.wallets?.map((wallet) => (
                  <div key={wallet.id} className="p-3">
                    <WalletCard
                      client={clients.find((client) => client?.id === extraObject?.id)}
                      wallet={wallet}
                      phone_number={
                        (clients.find((client) => client?.id === extraObject?.id)?.country?.prefix
                          ? clients.find((client) => client?.id === extraObject?.id)?.country
                              .prefix + ' '
                          : '+225 ') +
                        clients.find((client) => client?.id === extraObject?.id)?.phone_number
                      }
                      onWalletClicked={openCardDetails}
                    />
                  </div>
                ))}{' '}
            </>
          ) : (
            <InfoText styleClasses={'md:grid-cols-2'}>The user has no wallet</InfoText>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailView;
