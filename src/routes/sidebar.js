/** Icons are imported separatly to reduce build time */
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/outline/ArrowsRightLeftIcon';

import { VscSettings } from 'react-icons/vsc';

import { MdOutlineFastfood, MdOutlineMenuBook } from 'react-icons/md';
import { PiBowlFoodThin } from 'react-icons/pi';

const iconClasses = `h-6 w-6`;
const submenuIconClasses = `h-5 w-5`;

const routes = [
	{
		path: '/app/dashboard',
		icon: <Squares2X2Icon className={iconClasses} />,
		name: 'Dashboard',
	},
	{
		path: '', //no url needed as this has submenu
		icon: <UserGroupIcon className={`${iconClasses} inline`} />, // icon component
		name: 'Accounts', // name that appear in Sidebar
		submenu: [
			{
				path: '/app/users', // url
				icon: <UserIcon className={submenuIconClasses} />, // icon component
				name: 'Users', // name that appear in Sidebar
			},
			{
				path: '/app/customers-and-wallets',
				icon: <WalletIcon className={submenuIconClasses} />,
				name: 'Customers & Wallets',
			},
			{
				path: '/app/livreurs-and-wallets',
				icon: <GlobeAltIcon className={submenuIconClasses} />,
				name: 'Deliveries & Wallets',
			},
		],
	},
	{
		path: '', //no url needed as this has submenu
		icon: <MdOutlineFastfood className={`${iconClasses} inline`} />, // icon component
		name: 'Menu and Ordering', // name that appear in Sidebar
		submenu: [
			{
				path: '/app/menu-and-ordering/menu',
				icon: <MdOutlineMenuBook className={submenuIconClasses} />,
				name: 'Merchants Menu',
			},
			{
				path: '/app/menu-and-ordering/orders', // url
				icon: <PiBowlFoodThin className={submenuIconClasses} />, // icon component
				name: 'Orders', // name that appear in Sidebar
			},
			{
				path: '/app/menu-and-ordering/settings',
				icon: <VscSettings className={submenuIconClasses} />,
				name: 'Merchant Menu Settings',
			},
		],
	},
	{
		path: '/app/transactions',
		icon: <ArrowsRightLeftIcon className={iconClasses} />,
		name: 'Transactions',
	},
	{
		path: '', //no url needed as this has submenu
		icon: <WrenchScrewdriverIcon className={`${iconClasses} inline`} />, // icon component
		name: 'Settings', // name that appear in Sidebar
		submenu: [
			{
				path: '/app/settings/user-type', // url
				icon: <Cog6ToothIcon className={submenuIconClasses} />, // icon component
				name: 'User Type', // name that appear in Sidebar
			},
			// {
			//   path: "/app/features",
			//   icon: <UserIcon className={submenuIconClasses} />,
			//   name: "Features",
			// },
			// {
			//   path: "/app/components",
			//   icon: <UserIcon className={submenuIconClasses} />,
			//   name: "Components",
			// },
		],
	},
];

export default routes;
