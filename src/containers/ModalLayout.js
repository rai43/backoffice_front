import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import AddOrModifyClients from '../features/client/components/AddOrModifyClients';
import ClientDetailView from '../features/client/components/ClientDetailView';
import ConfirmationModalForClientCreation from '../features/client/components/ConfirmationModalForClientCreation';
import AddOrEditCode from '../features/codeManagement/components/AddOrEditCode';
import ChangeZoneLivreur from '../features/colis/colisZones/components/ChangeZoneLivreur';
import AddOrEditColis from '../features/colis/components/AddOrEditColis';
import ChangeStatus from '../features/colis/components/ChangeStatus';
import ColisListManager from '../features/colis/components/ColisListManager';
import ColisQrCode from '../features/colis/components/ColisQRCode';
import DetailsColis from '../features/colis/components/DetailsColis';
import DownloadColisData from '../features/colis/components/DownloadColisData';
import MerchantPayment from '../features/colis/components/MerchantPayment';
import MerchantPaymentBulk from '../features/colis/components/MerchantPaymentBulk';
import PointLivreur from '../features/colis/components/PointLivreur';
import PointMarchant from '../features/colis/components/PointMarchant';
import QrCodePanel from '../features/colis/components/QrCodePanel';
import ConfirmationModalBody from '../features/common/components/ConfirmationModalBody';
import { closeModal } from '../features/common/modalSlice';
import AddOrEditDiscount from '../features/discountManagement/components/AddOrEditDiscount';
import AssignLivreursToZone from '../features/DynamicAssignment/components/AssignLivreursToZone';
import AddOrModifyLivreur from '../features/livreurs/components/AddOrModifyLivreur';
import LivreurDetailView from '../features/livreurs/components/LivreurDetailView';
import MenuArticleAddOrEdit from '../features/merchantsMenu/components/MenuArticleAddOrEdit';
import MerchantsDetailView from '../features/merchantsMenu/components/MerchantsDetailView';
import MerchantsSettingsDetailView from '../features/merchantsSettings/components/MerchantsSettingsDetailView';
import AddOffer from '../features/offers/components/AddOffer';
import AssignLivreur from '../features/order/components/AssignLivreur';
import OrderDetails from '../features/order/components/OrderDetails';
import OrderPosition from '../features/order/components/OrderPosition';
import ChangeProvider from '../features/smsPorvider/components/ChangeProvider';
import TransactionDetails from '../features/transaction/components/TransactionDetails';
import AddOrModifyUserModalBody from '../features/user/components/AddOrModifyUserModalBody';
import { MODAL_BODY_TYPES } from '../utils/globalConstantUtil';

function ModalLayout() {
  const { isOpen, bodyType, size, extraObject, title } = useSelector((state) => state.modal);
  const dispatch = useDispatch();

  const close = (e) => {
    dispatch(closeModal(e));
  };

  return (
    <>
      {/* The button to open modal */}

      {/* Put this part before </body> tag */}
      <div className={`modal ${isOpen ? 'modal-open' : ''}`} id="modal-layout-id">
        <div
          className={`modal-box  ${
            size === 'lg' ? 'max-w-5xl' : size === 'max' ? 'max-w-full' : ''
          }`}>
          <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={() => close()}>
            ✕
          </button>
          <h3 className="font-semibold text-2xl pb-6 text-center">{title}</h3>

          {/* Loading modal body according to different modal type */}
          {
            {
              [MODAL_BODY_TYPES.USER_ADD_OR_EDIT]: (
                <AddOrModifyUserModalBody closeModal={close} extraObject={extraObject} />
              ),
              [MODAL_BODY_TYPES.CONFIRMATION]: (
                <ConfirmationModalBody extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.CONFIRMATION_FOR_CLIENT_CREATION]: (
                <ConfirmationModalForClientCreation extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.CLIENT_DETAILS]: (
                <ClientDetailView extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.LIVREUR_DETAILS]: (
                <LivreurDetailView extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.CHANGE_PROVIDER]: (
                <ChangeProvider extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.CHANGE_ZONE_LIVREUR]: (
                <ChangeZoneLivreur extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.MERCHANT_DETAILS]: (
                <MerchantsDetailView extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.MERCHANT_SETTINGS_DETAILS]: (
                <MerchantsSettingsDetailView extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.MERCHANT_ARTICLE_ADD_EDIT]: (
                <MenuArticleAddOrEdit extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.ORDERS_DETAILS]: (
                <OrderDetails extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.TRANSACTIONS_DETAILS]: (
                <TransactionDetails extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.ASSIGN_LIVREUR]: (
                <AssignLivreur extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.ASSIGN_LIVREURS_TO_ZONE]: (
                <AssignLivreursToZone extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT]: (
                <AddOrModifyClients extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.LIVREUR_ADD_OR_EDIT]: (
                <AddOrModifyLivreur extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.DISCOUNT_ADD_OR_EDIT]: (
                <AddOrEditDiscount extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.CODE_ADD_OR_EDIT]: (
                <AddOrEditCode extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.COLIS_ADD_OR_EDIT]: (
                <ColisListManager extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.COLIS_DETAILS]: (
                <DetailsColis extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.COLIS_CHANGE_STATUS]: (
                <ChangeStatus extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.OFFER_ADD_OR_EDIT]: (
                <AddOffer extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.ORDER_POSITION]: (
                <OrderPosition extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.COLIS_PAY_MERCHANT]: (
                <MerchantPayment extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.COLIS_PAY_MERCHANT_BULK]: (
                <MerchantPaymentBulk extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.POINT_MARCHANT]: (
                <PointMarchant extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.POINT_LIVREUR]: (
                <PointLivreur extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.DOWNLOAD_COLIS_DATA]: (
                <DownloadColisData extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.GENERATE_COLIS_QR_CODES]: (
                <ColisQrCode extraObject={extraObject} closeModal={close} />
              ),
              [MODAL_BODY_TYPES.COLIS_QR_CODE_PANEL]: (
                <QrCodePanel extraObject={extraObject} closeModal={close} />
              ),
              // [MODAL_BODY_TYPES.COLIS_ADD_OR_EDIT]: (
              //   <AddOrEditColis extraObject={extraObject} closeModal={close} />
              // ),
              [MODAL_BODY_TYPES.DEFAULT]: <div></div>
            }[bodyType]
          }
        </div>
      </div>
    </>
  );
}

export default ModalLayout;
