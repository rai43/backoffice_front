import { configureStore } from '@reduxjs/toolkit';

import clientSlice from '../features/client/clientSlice';
import codeManagementSlice from '../features/codeManagement/codeManagementSlice';
import controlPanelSlice from '../features/colis/controlPanel/controlPanelSlice';
import parcelsManagementSlice from '../features/colis/parcelsManagementSlice';
import codeManagementTableSlice from '../features/common/codeManagementTableSlice';
import colisControlPanelTableSlice from '../features/common/colisControlPanelTableSlice';
import CustomersTableSlice from '../features/common/CustomersTableSlice';
import discountManagementTableSlice from '../features/common/discountManagementTableSlice';
import headerSlice from '../features/common/headerSlice';
import livreursTableSlice from '../features/common/livreursTableSlice';
import merchantMenuTableSlice from '../features/common/merchantMenuTableSlice';
import merchantSettingsTableSlice from '../features/common/merchantSettingsTableSlice';
import modalSlice from '../features/common/modalSlice';
import ordersTableSlice from '../features/common/ordersTableSlice';
import parcelsManagementTableSlice from '../features/common/parcelsManagementTableSlice';
import returnParcelsManagementTableSlice from '../features/common/returnParcelsManagementTableSlice';
import rightDrawerSlice from '../features/common/rightDrawerSlice';
import transactionsTableSlice from '../features/common/transactionsTableSlice';
import discountManagementSlice from '../features/discountManagement/discountManagementSlice';
import dynamicAssignmentSlice from '../features/DynamicAssignment/dynamicAssignmentSlice';
import invitationSlice from '../features/invitations/invitationSlice';
import LiveLocationsSlice from '../features/liveLocations/LiveLocationsSlice';
import livreurSlice from '../features/livreurs/livreursSlice';
import merchantsSlice from '../features/merchantsMenu/merchantsMenuSlice';
import merchantsSettingsSlice from '../features/merchantsSettings/merchantsSettingsSlice';
import offersSlice from '../features/offers/offersSlice';
import orderSlice from '../features/order/orderSlice';
import rechargementSlice from '../features/rechargement/rechargementSlice';
import retraitSlice from '../features/retrait/retraitSlice';
import smsPorviderSlide from '../features/smsPorvider/smsPorviderSlide';
import subscriptionSlice from '../features/subscription/subscriptionSlice';
import transactionSlice from '../features/transaction/transactionSlice';
import userSlice from '../features/user/userSlice';

const combinedReducer = {
  header: headerSlice,
  transactionsTable: transactionsTableSlice,
  customersTable: CustomersTableSlice,
  livreursTable: livreursTableSlice,
  ordersTable: ordersTableSlice,
  merchantMenuTable: merchantMenuTableSlice,
  merchantSettingsTable: merchantSettingsTableSlice,
  discountManagementTable: discountManagementTableSlice,
  colisControlPanelTable: colisControlPanelTableSlice,
  parcelsManagementTable: parcelsManagementTableSlice,
  returnParcelsManagementTable: returnParcelsManagementTableSlice,
  codeManagementTable: codeManagementTableSlice,
  rightDrawer: rightDrawerSlice,
  modal: modalSlice,
  user: userSlice,
  client: clientSlice,
  livreur: livreurSlice,
  transaction: transactionSlice,
  rechargement: rechargementSlice,
  retrait: retraitSlice,
  order: orderSlice,
  article: merchantsSlice,
  merchant: merchantsSettingsSlice,
  discount: discountManagementSlice,
  code: codeManagementSlice,
  dynamicAssignment: dynamicAssignmentSlice,
  smsPorvider: smsPorviderSlide,
  offers: offersSlice,
  subscriptions: subscriptionSlice,
  invitations: invitationSlice,
  liveLocations: LiveLocationsSlice,
  controlPanel: controlPanelSlice,
  parcelsManagement: parcelsManagementSlice
};

export default configureStore({
  reducer: combinedReducer
});
