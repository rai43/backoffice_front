import { useEffect } from 'react';
import ClientDetailView from '../features/client/components/ClientDetailView';
import ConfirmationModalForClientCreation from '../features/client/components/ConfirmationModalForClientCreation';
import { MODAL_BODY_TYPES } from '../utils/globalConstantUtil';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '../features/common/modalSlice';
import AddOrModifyUserModalBody from '../features/user/components/AddOrModifyUserModalBody';
import ConfirmationModalBody from '../features/common/components/ConfirmationModalBody';
import TransactionDetails from '../features/transaction/components/TransactionDetails';
import AddOrModifyClients from '../features/client/components/AddOrModifyClients';
import OrderDetails from '../features/order/components/OrderDetails';
import MerchantsDetailView from '../features/merchantsMenu/components/MerchantsDetailView';
import MerchantsSettingsDetailView from '../features/merchantsSettings/components/MerchantsSettingsDetailView';
import MenuArticleAddOrEdit from '../features/merchantsMenu/components/MenuArticleAddOrEdit';
import AssignLivreur from '../features/order/components/AssignLivreur';

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
			<div className={`modal ${isOpen ? 'modal-open' : ''}`}>
				<div className={`modal-box  ${size === 'lg' ? 'max-w-5xl' : ''}`}>
					<button
						className='btn btn-sm btn-circle absolute right-2 top-2'
						onClick={() => close()}
					>
						✕
					</button>
					<h3 className='font-semibold text-2xl pb-6 text-center'>{title}</h3>

					{/* Loading modal body according to different modal type */}
					{
						{
							[MODAL_BODY_TYPES.USER_ADD_OR_EDIT]: (
								<AddOrModifyUserModalBody
									closeModal={close}
									extraObject={extraObject}
								/>
							),
							[MODAL_BODY_TYPES.CONFIRMATION]: (
								<ConfirmationModalBody
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.CONFIRMATION_FOR_CLIENT_CREATION]: (
								<ConfirmationModalForClientCreation
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.CLIENT_DETAILS]: (
								<ClientDetailView
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.MERCHANT_DETAILS]: (
								<MerchantsDetailView
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.MERCHANT_SETTINGS_DETAILS]: (
								<MerchantsSettingsDetailView
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.MERCHANT_ARTICLE_ADD_EDIT]: (
								<MenuArticleAddOrEdit
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.ORDERS_DETAILS]: (
								<OrderDetails
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.TRANSACTIONS_DETAILS]: (
								<TransactionDetails
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.ASSIGN_LIVREUR]: (
								<AssignLivreur
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT]: (
								<AddOrModifyClients
									extraObject={extraObject}
									closeModal={close}
								/>
							),
							[MODAL_BODY_TYPES.DEFAULT]: <div></div>,
						}[bodyType]
					}
				</div>
			</div>
		</>
	);
}

export default ModalLayout;
