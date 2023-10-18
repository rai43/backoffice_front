import { configureStore } from "@reduxjs/toolkit";
import headerSlice from "../features/common/headerSlice";
import modalSlice from "../features/common/modalSlice";
import rightDrawerSlice from "../features/common/rightDrawerSlice";
import userSlice from "../features/user/userSlice";
import clientSlice from "../features/client/clientSlice";
import livreurSlice from "../features/livreurs/livreursSlice";
import transactionSlice from "../features/transaction/transactionSlice";
import rechargementSlice from "../features/rechargement/rechargementSlice";
import retraitSlice from "../features/retrait/retraitSlice";
import orderSlice from "../features/order/orderSlice";
import merchantsSlice from "../features/merchantsMenu/merchantsMenuSlice";
import merchantsSettingsSlice from "../features/merchantsSettings/merchantsSettingsSlice";
import discountManagementSlice from "../features/discountManagement/discountManagementSlice";
import dynamicAssignmentSlice from "../features/DynamicAssignment/dynamicAssignmentSlice";
import smsPorviderSlide from "../features/smsPorvider/smsPorviderSlide";
import offersSlice from "../features/offers/offersSlice";

const combinedReducer = {
  header: headerSlice,
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
  dynamicAssignment: dynamicAssignmentSlice,
  smsPorvider: smsPorviderSlide,
  offers: offersSlice,
};

export default configureStore({
  reducer: combinedReducer,
});
