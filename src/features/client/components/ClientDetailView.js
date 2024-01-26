import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import WalletCard from '../../../components/Cards/WalletCard';
import UserBasicDetail from '../../../components/Common/UserBasicDetail';
import BasicModal from '../../../components/Modals/BasicModal';
import { enableScroll } from '../../../utils/functions/preventAndAllowScroll';
import { RIGHT_DRAWER_TYPES } from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';
import { openRightDrawer } from '../../common/rightDrawerSlice';
import { blockClientPaymentMethod, resetClientPassword } from '../clientSlice';

const PAYMENT_METHODS = {
  STREET: 'STREET',
  CASH: 'CASH'
};

/**
 * Component for displaying detailed view of a client.
 * It shows client's basic details, wallet information, and allows blocking of payment methods.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.extraObject - Extra data for initializing the component.
 * @param {Function} props.closeModal - Function to close the modal.
 * @returns {React.ReactElement} - A detailed view of a client.
 */
const ClientDetailView = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const { clients } = useSelector((state) => state.client);

  const client = clients.find((c) => c?.id === extraObject?.id) || {};
  const [clientObj, setClientObj] = useState({});
  const [blockMethodsState, setBlockMethodsState] = useState({
    [PAYMENT_METHODS.CASH]: false,
    [PAYMENT_METHODS.STREET]: false
  });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  /**
   * Opens a modal to display the wallet and transaction details for a specific client.
   * @param {Object} client - The client object containing details like phone number.
   * @param {Object} wallet - The wallet object related to the client.
   */
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

  /**
   * useEffect hook to find a client object based on the provided ID.
   * It updates the clientObj state when the list of clients or the extraObject changes.
   */
  useEffect(() => {
    // Fetch client object from the client list based on the provided ID in extraObject
    const foundClient = clients.find((client) => client?.id === extraObject?.id);
    setClientObj(foundClient || {});
  }, [clients, extraObject]);

  /**
   * Closes the block modal and re-enables scrolling.
   */
  const onCloseBlockModal = () => {
    enableScroll();
    setBlockMethodsState(() => {
      return {
        [PAYMENT_METHODS.CASH]: false,
        [PAYMENT_METHODS.STREET]: false
      };
    });
  };

  /**
   * Handles the click event for blocking or unblocking a payment method.
   * @param {string} method - The payment method to be blocked or unblocked.
   */
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

  /**
   * Proceeds with the action of blocking or unblocking a payment method for a client.
   * @param {Object} params - Object containing client ID, method, and action string.
   * @param {string} params.client - Client ID.
   * @param {string} params.method - Payment method to be modified.
   * @param {string} params.actionString - Action to be taken (Lock/Unlock).
   */
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

  /**
   * Checks if a given payment method is blocked for the client.
   * @param {string} method - The payment method to check.
   * @returns {boolean} - Returns true if the method is blocked, otherwise false.
   */
  const isMethodBlocked = (method) =>
    client?.client_blocked_payment_methods?.some(
      (blockedMethod) => blockedMethod?.payment_method?.method === method
    );

  /**
   * Handles the click event on the reset password button.
   */
  const handleResetPasswordClicked = () => {
    setIsResetModalOpen(true);
  };

  /**
   * Handles the confirmation of the password reset.
   * This function should contain the logic to actually reset the password.
   */
  const handleResetPasswordConfirm = async () => {
    // Dispatch the action to reset the password
    const response = await dispatch(
      resetClientPassword({
        clientId: clientObj.id, // clientObj contains the client's information
        newPassword: '1234'
      })
    );

    // Check the response and dispatch a notification
    if (response?.error) {
      dispatch(
        showNotification({
          message: 'Error while resetting the password',
          status: 0 // Assuming status 0 indicates an error
        })
      );
    } else {
      dispatch(
        showNotification({
          message: 'Password successfully reset to 1234',
          status: 1 // Assuming status 1 indicates success
        })
      );
      // Close the modal or perform any other cleanup actions
      handleCloseModal();
    }
  };

  /**
   * Handles closing the reset password modal.
   */
  const handleCloseModal = () => {
    enableScroll();
    setIsResetModalOpen(false);
  };

  return (
    <div className="w-full">
      <UserBasicDetail
        phone_number={client.phone_number}
        is_deleted={client.is_deleted}
        photo={client.photo}
        client_type={client.client_type}
        country={client.country}
        merchants={client.merchants}
        isLivreur={client.isLivreur}
      />

      <div className="w-full bg-gradient-to-r from-gray-100 to-gray-50 shadow-lg rounded-xl p-5 my-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Number of wallets"
            value={client?.wallets?.length || 'N/A'}
            className="bg-white rounded-lg p-4 shadow-md"
          />
          <StatCard
            title="Client Type"
            value={client?.client_type?.libelle || 'N/A'}
            desc={`${client?.merchants[0]?.id ? 'Merchant ID: ' + client?.merchants[0]?.id : ''}`}
            className="bg-white rounded-lg p-4 shadow-md"
          />
          <StatCard
            title="Client ID"
            value={extraObject?.id}
            className="bg-white rounded-lg p-4 shadow-md"
          />
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <ActionButton
            client={client}
            method={PAYMENT_METHODS.CASH}
            onBlockMethodClicked={onBlockMethodClicked}
            isMethodBlocked={isMethodBlocked}
          />
          <ActionButton
            client={client}
            method={PAYMENT_METHODS.STREET}
            onBlockMethodClicked={onBlockMethodClicked}
            isMethodBlocked={isMethodBlocked}
          />
          <ResetPasswordButton onResetPasswordClicked={handleResetPasswordClicked} />
        </div>
      </div>

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onProceed={handleResetPasswordConfirm}
        onClose={handleCloseModal}
      />

      <ModalSection
        client={client}
        blockMethodsState={blockMethodsState}
        onProceedActionModal={onProceedActionModal}
        onCloseBlockModal={onCloseBlockModal}
        isMethodBlocked={isMethodBlocked}
      />

      <WalletsSection client={client} openCardDetails={openCardDetails} />
    </div>
  );
};

export default ClientDetailView;

const StatCard = ({ title, value, desc }) => (
  <div className="stat">
    <div className="stat-title">{title}</div>
    <div className="stat-value text-[1.5rem]">{value}</div>
    <div className="stat-desc">{desc}</div>
  </div>
);

/**
 * Component for rendering an action button for a specific payment method.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.client - The client data.
 * @param {string} props.method - The payment method (e.g., CASH, STREET).
 * @param {Function} props.onBlockMethodClicked - Function to handle the click event.
 * @param {Function} props.isMethodBlocked - Function to determine if the method is blocked.
 * @returns {React.ReactElement} - A single action button.
 */
const ActionButton = ({ client, method, onBlockMethodClicked, isMethodBlocked }) => {
  const blocked = isMethodBlocked(method);
  return (
    <button
      onClick={() => onBlockMethodClicked(method)}
      className={`px-6 py-3 rounded-lg font-semibold text-md 
                  ${blocked ? 'bg-red-400 hover:bg-red-500' : 'bg-green-400 hover:bg-green-500'} 
                  text-white shadow transition-all duration-300`}>
      {blocked ? `Unlock ${method}` : `Lock ${method}`}
    </button>
  );
};

/**
 * ResetPasswordButton Component
 * Renders a button to initiate the password reset process.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onResetPasswordClicked - Function to call when the reset password button is clicked
 */
const ResetPasswordButton = ({ onResetPasswordClicked }) => {
  return (
    <button
      onClick={onResetPasswordClicked}
      className="px-6 py-3 rounded-lg font-semibold text-md bg-blue-400 hover:bg-blue-500 text-white shadow transition-all duration-300">
      Reset Password
    </button>
  );
};

/**
 * ResetPasswordModal Component
 * Displays a modal for confirming the password reset action.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - State to control the visibility of the modal
 * @param {Function} props.onProceed - Function to call when the action is confirmed
 * @param {Function} props.onClose - Function to call to close the modal
 */
const ResetPasswordModal = ({ isOpen, onProceed, onClose }) => {
  return (
    <BasicModal isOpen={isOpen} onProceed={onProceed} onClose={onClose}>
      <div>
        <p className="text-center font-semibold text-lg">
          Are you sure you want to reset the password to 1234?
        </p>
      </div>
    </BasicModal>
  );
};

/**
 * Component for rendering modals related to payment method actions.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.client - The client data.
 * @param {Object} props.blockMethodsState - State indicating which payment methods are being blocked or unblocked.
 * @param {Function} props.onProceedActionModal - Function to execute when proceeding with a modal action.
 * @param {Function} props.onCloseBlockModal - Function to call on closing the modal.
 * @returns {React.ReactElement} - A section with modals for payment method actions.
 */
const ModalSection = ({
  client,
  blockMethodsState,
  onProceedActionModal,
  onCloseBlockModal,
  isMethodBlocked
}) => {
  const generateModalContent = (method) => {
    const isBlocked = isMethodBlocked(method);
    const actionVerb = isBlocked ? 'Unlock' : 'Lock';
    const paymentMethod = method === PAYMENT_METHODS.CASH ? 'Cash' : 'Street';

    return (
      <div>
        <p className="text-center font-semibold text-lg">
          Are you sure you want to {actionVerb.toLowerCase()} {paymentMethod} Payment?
        </p>
        <p className="text-center text-sm mt-2">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          This will {isBlocked ? 'enable' : 'disable'} the client's ability to use{' '}
          {paymentMethod.toLowerCase()} payments.
        </p>
      </div>
    );
  };

  return (
    <>
      <BasicModal
        isOpen={blockMethodsState[PAYMENT_METHODS.CASH]}
        onProceed={async () =>
          await onProceedActionModal({
            client: client?.id,
            method: PAYMENT_METHODS.CASH,
            actionString: isMethodBlocked(PAYMENT_METHODS.CASH) ? 'UNLOCK' : 'LOCK'
          })
        }
        onClose={onCloseBlockModal}>
        {generateModalContent(PAYMENT_METHODS.CASH)}
      </BasicModal>

      <BasicModal
        isOpen={blockMethodsState[PAYMENT_METHODS.STREET]}
        onProceed={async () =>
          await onProceedActionModal({
            client: client?.id,
            method: PAYMENT_METHODS.STREET,
            actionString: isMethodBlocked(PAYMENT_METHODS.STREET) ? 'UNLOCK' : 'LOCK'
          })
        }
        onClose={onCloseBlockModal}>
        {generateModalContent(PAYMENT_METHODS.STREET)}
      </BasicModal>
    </>
  );
};

/**
 * Component for displaying the client's wallets.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.client - The client data.
 * @param {Function} props.openCardDetails - Function to open the card details view.
 * @returns {React.ReactElement} - A section displaying the client's wallets.
 */
const WalletsSection = ({ client, openCardDetails }) => {
  return (
    <div className="w-full my-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {client?.wallets?.length ? (
          client.wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              client={client}
              wallet={wallet}
              phone_number={client?.country?.prefix + ' ' + client?.phone_number}
              onWalletClicked={openCardDetails}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">The user has no wallet</p>
        )}
      </div>
    </div>
  );
};
