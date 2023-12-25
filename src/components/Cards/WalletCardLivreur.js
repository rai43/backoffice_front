import moment from 'moment';
import streetLogo from '../../assets/street_logo.jpeg';
import clientCard from '../../assets/client_card.png';
import merchantCard from '../../assets/merchant_card.png';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

const WalletCardLivreur = ({ client, wallet, phone_number, onWalletClicked }) => {
  const { livreurs, from, isLoading, noMoreQuery } = useSelector((state) => state.livreur);
  useEffect(
    () =>
      console.log(
        livreurs.find((liv) => liv?.id === client?.id)?.wallets?.find((w) => w?.id === wallet?.id)
      ),
    []
  );

  return (
    <div
      className="hover:cursor-pointer  sm:w-96 sm:h-56 m-auto bg-red-100 rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110"
      onClick={() =>
        onWalletClicked(
          client,
          livreurs.find((liv) => liv?.id === client?.id)?.wallets?.find((w) => w?.id === wallet?.id)
        )
      }
    >
      <img
        className="relative object-cover w-full h-full rounded-xl"
        src={
          livreurs.find((liv) => liv?.id === client?.id)?.wallets?.find((w) => w?.id === wallet?.id)
            ?.wallet_type?.code !== 'MARCH'
            ? clientCard
            : merchantCard
        }
        alt=""
      />

      <div className="w-full px-8 absolute top-8">
        <div className="justify-between hidden sm:flex">
          <div className="">
            <p className="font-light">Wallet Info</p>
            <p className="font-medium tracking-widest">
              {
                livreurs
                  .find((liv) => liv?.id === client?.id)
                  ?.wallets?.find((w) => w?.id === wallet?.id)?.wallet_type?.libelle
              }
              <span
                className={`mx-2 inline-grid rounded-lg w-3 h-3 justify-items-center self-center items-center ${
                  livreurs
                    .find((liv) => liv?.id === client?.id)
                    ?.wallets?.find((w) => w?.id === wallet?.id)?.wallet_status?.code ===
                  'ACTIVATED'
                    ? 'bg-success'
                    : 'bg-red-900'
                }`}
              ></span>
            </p>
          </div>
          <img className="w-14 h-14 rounded-full" src={streetLogo} alt="" />
          {/* <img
						className='w-14 h-14'
						src='https://i.imgur.com/bbPHJVe.png'
						alt=''
					/> */}
        </div>
        <div className="pt-1">
          <p className="font-light">Client Number</p>
          <p className="font-medium tracking-more-wider">{phone_number || 'N/A'}</p>
        </div>
        <div className="pt-6 pr-6">
          <div className="flex justify-between">
            <div className="">
              <p className="font-light text-xs">Balance</p>
              <p className="font-medium tracking-wider text-sm">
                {
                  livreurs
                    .find((liv) => liv?.id === client?.id)
                    ?.wallets?.find((w) => w?.id === wallet?.id)?.balance
                }{' '}
                CFA
              </p>
            </div>
            <div className="">
              <p className="font-light text-xs">Bonus</p>
              <p className="font-medium tracking-wider text-sm">
                {
                  livreurs
                    .find((liv) => liv?.id === client?.id)
                    ?.wallets?.find((w) => w?.id === wallet?.id)?.bonus
                }{' '}
                CFA
              </p>
            </div>

            <div className="">
              <p className="font-light text-xs">Created On</p>
              <p className="font-bold tracking-more-wider text-sm">
                {moment
                  .utc(
                    livreurs
                      .find((liv) => liv?.id === client?.id)
                      ?.wallets?.find((w) => w?.id === wallet?.id)?.created_at
                  )
                  .format('ll')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCardLivreur;
