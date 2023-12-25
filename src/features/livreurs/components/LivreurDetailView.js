import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserBasicDetail from '../../../components/Common/UserBasicDetail';
import moment from 'moment';
import WalletCard from '../../../components/Cards/WalletCard';
import InfoText from '../../../components/Typography/InfoText';
import { useDispatch, useSelector } from 'react-redux';
import { openRightDrawer } from '../../common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../../../utils/globalConstantUtil';
import WalletCardLivreur from '../../../components/Cards/WalletCardLivreur';
import streetLogo from '../../../assets/street_logo.jpeg';

const LivreurDetailView = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  const { livreurs, from, isLoading, noMoreQuery } = useSelector((state) => state.livreur);
  const [clientObj, setClientObj] = useState({});
  // Opening right sidebar for user details
  const openCardDetails = (client, wallet) => {
    // api call to get the client transactions details
    dispatch(
      openRightDrawer({
        header: `Wallet Details View - ${client.phone_number} (${
          wallet?.wallet_type?.libelle || 'N/A'
        })`,
        bodyType: RIGHT_DRAWER_TYPES.LIVREUR_CARD_DETAILS,
        extraObject: { client, wallet }
      })
    );
  };

  useEffect(() => {
    console.log(livreurs.find((livreur) => livreur?.id === extraObject?.id)?.wallets);
    setClientObj((oldObj) => {
      return {
        ...oldObj,
        ...livreurs.find((livreur) => livreur?.id === extraObject?.id)
      };
    });
  }, []);

  console.log(extraObject);
  console.log(clientObj);
  // const { phone_number, is_deleted, merchant_name, photo, client_type } = extraObject;
  return (
    <div className="w-full">
      {/* Divider */}
      <div className="divider mt-0"></div>
      <p className="px-2 text-lg font-semibold uppercase">{`${
        livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]?.last_name
      } ${
        livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]?.first_name
      } - (${
        livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]?.status
      })`}</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-4">
        <div className="col-span-3 p-2 grid grid-rows-2 gap-2">
          {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.phone_number?.length && (
            <div>
              <div
                className={`inline-grid rounded-lg w-3 h-3 justify-items-center self-center items-center ${
                  livreurs.find((livreur) => livreur?.id === extraObject?.id)?.is_deleted
                    ? 'bg-error'
                    : 'bg-success'
                }`}
              ></div>
              <div className="inline-grid mx-4 font-semibold">
                {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country?.prefix
                  ? livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country.prefix +
                    ' '
                  : '+225 '}{' '}
                {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.phone_number}
              </div>

              <div className="inline-grid mx-6 font-extralight">/ client mobile number</div>
            </div>
          )}
          {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]
            ?.second_phone_number?.length && (
            <div>
              <div
                className={`inline-grid rounded-lg w-3 h-3 justify-items-center self-center items-center ${
                  livreurs.find((livreur) => livreur?.id === extraObject?.id)?.is_deleted
                    ? 'bg-error'
                    : 'bg-success'
                }`}
              ></div>
              <div className="inline-grid mx-4 font-semibold">
                {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country?.prefix
                  ? livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country.prefix +
                    ' '
                  : '+225 '}{' '}
                {
                  livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]
                    ?.second_phone_number
                }
              </div>

              <div className="inline-grid mx-6 font-extralight">/ second phone number</div>
            </div>
          )}
          {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]?.whatsapp
            ?.length && (
            <div>
              <div
                className={`inline-grid rounded-lg w-3 h-3 justify-items-center self-center items-center ${
                  livreurs.find((livreur) => livreur?.id === extraObject?.id)?.is_deleted
                    ? 'bg-error'
                    : 'bg-success'
                }`}
              ></div>
              <div className="inline-grid mx-4 font-semibold">
                {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country?.prefix
                  ? livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country.prefix +
                    ' '
                  : '+225 '}{' '}
                {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]?.whatsapp}
              </div>

              <div className="inline-grid mx-6 font-extralight">/ whatsapp number</div>
            </div>
          )}
          {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]
            ?.emergency_contact?.length && (
            <div className="text-warning font-semibold">
              <div
                className={`inline-grid rounded-lg w-3 h-3 justify-items-center self-center items-center bg-warning`}
              ></div>
              <div className="inline-grid mx-4 font-semibold">
                {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country?.prefix
                  ? livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country.prefix +
                    ' '
                  : '+225 '}{' '}
                {
                  livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]
                    ?.emergency_contact
                }
              </div>

              <div className="inline-grid mx-6">/ emergency contact</div>
            </div>
          )}
        </div>

        <div className="flex flex-row-reverse">
          <div className="flex-shrink-0 h-14 w-14 mx-5">
            <img
              className="h-14 w-14 rounded-full"
              src={
                livreurs
                  .find((livreur) => livreur?.id === extraObject?.id)
                  ?.photo?.startsWith('http')
                  ? livreurs.find((livreur) => livreur?.id === extraObject?.id)?.photo
                  : streetLogo
              }
              alt="UserImage"
            />
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="w-full stats stats-vertical lg:stats-horizontal shadow">
        <div className="stat">
          <div className="stat-title">Livreur ID</div>
          <div className="stat-value text-[1.5rem]">
            {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.livreurs[0]?.id || 'N/A'}
          </div>
          <div className="stat-desc">
            Client ID: {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.id}
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">Client Type</div>
          <div className="stat-value text-[1.5rem]">LIVREUR</div>
        </div>

        <div className="stat">
          <div className="stat-title">Country</div>
          <div className="stat-value text-[1.5rem]">
            {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country?.name || 'N/A'}
          </div>
          <div className="stat-desc">
            Code:{' '}
            <span className="font-semibold">
              {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country?.code || 'N/A'}
            </span>{' '}
            | Prefix: <span className="font-semibold">{extraObject?.country?.prefix || 'N/A'}</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Creation Info</div>
          <div className="stat-value text-[1.2rem]">
            {moment.utc(extraObject?.created_at).format('DD-MM-YYYY HH:mm') || 'N/A'}
          </div>
          <div className="stat-desc">
            By:{' '}
            <span className="font-semibold">
              {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.created_by || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full my-5">
        <h3 className="text-lg font-semibold">
          User Card
          {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.wallets?.length > 1
            ? 's'
            : ''}
        </h3>
        {/* Divider */}
        <div className="divider mt-0"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 md:gap-y-6">
          {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.wallets.length ? (
            <>
              {livreurs
                .find((livreur) => livreur?.id === extraObject?.id)
                ?.wallets?.map((wallet) => (
                  <div key={wallet.id} className="p-3">
                    <WalletCardLivreur
                      client={livreurs.find((livreur) => livreur?.id === extraObject?.id)}
                      wallet={wallet}
                      phone_number={
                        (livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country
                          ?.prefix
                          ? livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country
                              .prefix + ' '
                          : '+225 ') +
                        livreurs.find((livreur) => livreur?.id === extraObject?.id)?.phone_number
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

export default LivreurDetailView;
