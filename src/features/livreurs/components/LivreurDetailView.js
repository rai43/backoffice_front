import React, { useEffect, useState } from 'react';

import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import streetLogo from '../../../assets/street_logo.jpeg';
import WalletCard from '../../../components/Cards/WalletCard';
import WalletCardLivreur from '../../../components/Cards/WalletCardLivreur';
import UserBasicDetail from '../../../components/Common/UserBasicDetail';
import InfoText from '../../../components/Typography/InfoText';
import { RIGHT_DRAWER_TYPES } from '../../../utils/globalConstantUtil';
import { WalletsSection } from '../../client/components/ClientDetailView';
import { openRightDrawer } from '../../common/rightDrawerSlice';

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

  const merchantName = (() => {
    const found = livreurs.find((livreur) => livreur?.id === extraObject?.id);
    return found && found.livreurs?.[0]?.last_name
      ? `${found.livreurs?.[0]?.last_name} ${found.livreurs?.[0]?.first_name}`.toUpperCase()
      : 'N/A';
  })();

  return (
    <div className="w-full">
      <UserBasicDetail
        phone_number={`${clientObj.phone_number}  ${
          livreurs?.find((livreur) => livreur?.id === extraObject?.id)?.livreurs?.[0]?.whatsapp
            ? '/ +225 ' +
              livreurs?.find((livreur) => livreur?.id === extraObject?.id)?.livreurs?.[0]?.whatsapp
            : '/ N.A'
        } ${
          livreurs?.find((livreur) => livreur?.id === extraObject?.id)?.livreurs?.[0]
            ?.emergency_contact
            ? '/ +225 ' +
              livreurs?.find((livreur) => livreur?.id === extraObject?.id)?.livreurs?.[0]
                ?.emergency_contact
            : '/ N.A'
        }`}
        is_deleted={clientObj.is_deleted}
        photo={clientObj.photo}
        client_type={clientObj.client_type}
        country={clientObj.country}
        merchants={merchantName}
        isLivreur={true}
      />

      <div className="w-full bg-gradient-to-r from-gray-100 to-gray-50 shadow-lg rounded-xl p-5 my-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Number of wallets"
            value={clientObj?.wallets?.length || 'N/A'}
            className="bg-white rounded-lg p-4 shadow-md"
          />
          <StatCard
            title="Client Type"
            value={clientObj?.client_type?.libelle || 'N/A'}
            desc={moment.utc(extraObject?.created_at).format('DD-MM-YYYY HH:mm') || 'N/A'}
            className="bg-white rounded-lg p-4 shadow-md"
          />
          <StatCard
            title="Livreur ID"
            value={clientObj?.livreurs?.[0]?.id}
            desc={'Client ID: ' + extraObject?.id}
            className="bg-white rounded-lg p-4 shadow-md"
          />
        </div>

        {/*<div className="mt-6 flex justify-center space-x-4">*/}
        {/*  <ActionButton*/}
        {/*    client={client}*/}
        {/*    method={PAYMENT_METHODS.CASH}*/}
        {/*    onBlockMethodClicked={onBlockMethodClicked}*/}
        {/*    isMethodBlocked={isMethodBlocked}*/}
        {/*  />*/}
        {/*  <ActionButton*/}
        {/*    client={client}*/}
        {/*    method={PAYMENT_METHODS.STREET}*/}
        {/*    onBlockMethodClicked={onBlockMethodClicked}*/}
        {/*    isMethodBlocked={isMethodBlocked}*/}
        {/*  />*/}
        {/*  <ResetPasswordButton onResetPasswordClicked={handleResetPasswordClicked} />*/}
        {/*</div>*/}
      </div>

      <WalletsSection
        client={livreurs.find((l) => l?.id === clientObj?.id) || {}}
        openCardDetails={openCardDetails}
      />

      {/*<div className="w-full my-5">*/}
      {/*  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 md:gap-y-6">*/}
      {/*    {livreurs.find((livreur) => livreur?.id === extraObject?.id)?.wallets.length ? (*/}
      {/*      <>*/}
      {/*        {livreurs*/}
      {/*          .find((livreur) => livreur?.id === extraObject?.id)*/}
      {/*          ?.wallets?.map((wallet) => (*/}
      {/*            <div key={wallet.id} className="p-3">*/}
      {/*              <WalletCardLivreur*/}
      {/*                client={livreurs.find((livreur) => livreur?.id === extraObject?.id)}*/}
      {/*                wallet={wallet}*/}
      {/*                phone_number={*/}
      {/*                  (livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country*/}
      {/*                    ?.prefix*/}
      {/*                    ? livreurs.find((livreur) => livreur?.id === extraObject?.id)?.country*/}
      {/*                        .prefix + ' '*/}
      {/*                    : '+225 ') +*/}
      {/*                  livreurs.find((livreur) => livreur?.id === extraObject?.id)?.phone_number*/}
      {/*                }*/}
      {/*                onWalletClicked={openCardDetails}*/}
      {/*              />*/}
      {/*            </div>*/}
      {/*          ))}{' '}*/}
      {/*      </>*/}
      {/*    ) : (*/}
      {/*      <InfoText styleClasses={'md:grid-cols-2'}>The user has no wallet</InfoText>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
};

export default LivreurDetailView;

const StatCard = ({ title, value, desc }) => (
  <div className="stat">
    <div className="stat-title">{title}</div>
    <div className="stat-value text-[1.5rem]">{value}</div>
    <div className="stat-desc">{desc}</div>
  </div>
);
