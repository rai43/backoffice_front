module.exports = Object.freeze({
	MODAL_BODY_TYPES: {
		CLIENT_DETAILS: 'CLIENT_DETAILS',
		LIVREUR_DETAILS: 'LIVREUR_DETAILS',
		ASSIGN_LIVREUR: 'ASSIGN_LIVREUR',
		CHANGE_PROVIDER: 'CHANGE_PROVIDER',
		ASSIGN_LIVREURS_TO_ZONE: 'ASSIGN_LIVREURS_TO_ZONE',
		MERCHANT_DETAILS: 'MERCHANT_DETAILS',
		MERCHANT_ARTICLE_ADD_EDIT: 'MERCHANT_ARTICLE_ADD_EDIT',
		MERCHANT_SETTINGS_DETAILS: 'MERCHANT_SETTINGS_DETAILS',
		TRANSACTIONS_DETAILS: 'TRANSACTIONS_DETAILS',
		ORDERS_DETAILS: 'ORDERS_DETAILS',
		USER_ADD_OR_EDIT: 'USER_ADD_OR_EDIT',
		CLIENTS_ADD_OR_EDIT: 'CLIENTS_ADD_OR_EDIT',
		LIVREUR_ADD_OR_EDIT: 'LIVREUR_ADD_OR_EDIT',
		CLIENT_PERSONAL_ADD_OR_EDIT: 'CLIENT_PERSONAL_ADD_OR_EDIT',
		CLIENT_MERCHANT_ADD_OR_EDIT: 'CLIENT_MERCHANT_ADD_OR_EDIT',
		ORDER_POSITION: 'ORDER_POSITION',
		LEAD_ADD_NEW: 'LEAD_ADD_NEW',
		CONFIRMATION: 'CONFIRMATION',
		CONFIRMATION_FOR_CLIENT_CREATION: 'CONFIRMATION_FOR_CLIENT_CREATION',
		DISCOUNT_ADD_OR_EDIT: 'DISCOUNT_ADD_OR_EDIT',
		DEFAULT: '',
	},

	RIGHT_DRAWER_TYPES: {
		USER_DETAILS: 'USER_DETAILS',
		MERCHANT_SETTINGS_ACCOMPAGNEMENT: 'MERCHANT_SETTINGS_ACCOMPAGNEMENT',
		MERCHANT_ARTICLE_ADD_EDIT: 'MERCHANT_ARTICLE_ADD_EDIT',
		MERCHANT_SETTINGS_ARTICLE: 'MERCHANT_SETTINGS_ARTICLE',
		CLIENT_CARD_DETAILS: 'CLIENT_CARD_DETAILS',
		LIVREUR_CARD_DETAILS: 'LIVREUR_CARD_DETAILS',
		NOTIFICATION: 'NOTIFICATION',
		CALENDAR_EVENTS: 'CALENDAR_EVENTS',
	},

	CONFIRMATION_MODAL_CLOSE_TYPES: {
		USER_DELETE: 'USER_DELETE',
		CLIENT_DELETE: 'CLIENT_DELETE',
	},

	REQUEST_QUERY_CONSTANTS: {
		ALL: 'ALL',
		NOTHING: 'NOTHING',
		STATUS_ACTIVE: {
			IS_ACTIVE: 'ACTIVE',
			IS_INACTIVE: 'INACTIVE',
		},
		STATUS_DELETED: {
			IS_DELETED: 'DELETED',
			IS_NOT_DELETED: 'NOT_DELETED',
		},
		CLIENT_SLICE: {
			ACCOUNT_TYPES: {
				PERSONAL_ACCOUNT: 'PERSONAL',
				MERCHANT_ACCOUNT: 'MERCHANT',
			},
		},
	},

	AG_GRID_DEFAULT_COL_DEF: {
		resizable: true,
		sortable: true,
		filter: true,
	},

	COMMANDE_NUMBERS_VS_STATUS_CODE: {
		1: 'PENDING',
		2: 'REGISTERED',
		3: 'INPROCESS',
		4: 'INDELIVERY',
		5: 'DELIVERED',
		6: 'UNDELIVERED',
		7: 'CANCELED',
	},

	COMMANDE_STATUS_CODE_VS_NUMBERS: {
		PENDING: 1,
		REGISTERED: 2,
		INPROCESS: 3,
		INDELIVERY: 4,
		DELIVERED: 5,
		UNDELIVERED: 6,
		CANCELED: 7,
	},
});
