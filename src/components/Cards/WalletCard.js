import React from 'react';

import moment from 'moment';

import clientCardBackground from '../../assets/client_card.png';
import merchantCardBackground from '../../assets/merchant_card.png';
import streetLogo from '../../assets/street_logo.jpeg';

/**
 * Displays individual wallet information in a visually appealing card layout.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.client - Client data related to the wallet.
 * @param {Object} props.wallet - Wallet data to be displayed.
 * @param {string} props.phone_number - Phone number associated with the wallet.
 * @param {Function} props.onWalletClicked - Function for handling wallet card click events.
 * @returns {React.ReactElement} - A styled wallet card.
 */
const WalletCard = ({ client, wallet, phone_number, onWalletClicked }) => {
  const walletData = client?.wallets?.find((w) => w?.id === wallet?.id) || {};
  const isMerchant = walletData?.type === 'MERCHANT';
  const cardBackground = isMerchant ? merchantCardBackground : clientCardBackground;
  const formattedNumber = `•••• •••• •••• ${client.phone_number.slice(-4)}`;

  // Format the balance for accounting (in CFA currency)
  const formattedBalance = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // CFA currency code
    minimumFractionDigits: 0 // You can adjust the decimal places as needed
  }).format(walletData?.balance || 0);

  return (
    <div
      className="relative cursor-pointer rounded-xl overflow-hidden shadow-lg text-white"
      style={{
        height: '200px',
        backgroundImage: `url(${cardBackground})`,
        backgroundSize: 'cover'
      }}
      onClick={() => onWalletClicked(client, walletData)}>
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Top section */}
        <div className="flex justify-between">
          <div>
            <p className="font-bold text-lg">{walletData?.wallet_type?.libelle}</p>
            <p className="text-sm opacity-80">
              Valid From: {moment.utc().add(3, 'years').format('MM/YY')}
            </p>
          </div>
          <img src={streetLogo} alt="Logo" className="h-8 rounded-full" />
        </div>

        {/* Middle section with balance */}
        <div className="my-2">
          <p className="text-xl font-medium">Balance: {formattedBalance}</p>
        </div>

        {/* Bottom section */}
        <div>
          <p className="font-medium text-xl">{formattedNumber}</p>
          <p className="text-sm">{walletData?.type?.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
