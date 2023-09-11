// All components mapping with path for internal routes

import { lazy } from 'react';

// const Dashboard = lazy(() => import("../pages/protected/Dashboard"));
const Dashboard = lazy(() => import('../pages/authenticated/Dashboard'));
const Customers = lazy(() => import('../pages/authenticated/Customers'));
const Livreurs = lazy(() => import('../pages/authenticated/Livreurs'));
const Transactions = lazy(() => import('../pages/authenticated/Transactions'));
const Orders = lazy(() => import('../pages/authenticated/Orders'));
const MerchantMenu = lazy(() => import('../pages/authenticated/MerchantMenu'));
const MerchantSettings = lazy(() => import('../pages/authenticated/MerchantSettings'));
const Users = lazy(() => import('../pages/authenticated/Users'));

const routes = [
	{
		path: '/dashboard', // the url
		component: Dashboard, // view rendered
	},
	{
		path: '/users', // the url
		component: Users, // view rendered
	},
	{
		path: '/customers-and-wallets',
		component: Customers,
	},
	{
		path: '/livreurs-and-wallets',
		component: Livreurs,
	},
	{
		path: '/transactions',
		component: Transactions,
	},
	{
		path: '/menu-and-ordering/orders',
		component: Orders,
	},
	{
		path: '/menu-and-ordering/menu',
		component: MerchantMenu,
	},
	{
		path: '/menu-and-ordering/settings',
		component: MerchantSettings,
	},
];

export default routes;