/** Icons are imported separatly to reduce build time */
import { AiFillDashboard } from 'react-icons/ai';
import { AiOutlinePartition } from 'react-icons/ai';
import { BiSolidOffer } from 'react-icons/bi';
import { CiDiscount1 } from 'react-icons/ci';
import { FaSlideshare } from 'react-icons/fa6';
import { FcSms } from 'react-icons/fc';
import { GiPartyPopper } from 'react-icons/gi';
import { LuPackageCheck } from 'react-icons/lu';
import {
  MdOutlineDiscount,
  MdOutlineMenuBook,
  MdManageHistory,
  MdOutlineDeliveryDining,
  MdRestaurantMenu
} from 'react-icons/md';
import {
  PiContactlessPaymentLight,
  PiBowlFoodThin,
  PiShareNetworkThin,
  PiPersonSimpleBikeThin
} from 'react-icons/pi';
import { VscSettings } from 'react-icons/vsc';

import ArrowsRightLeftIcon from '@heroicons/react/24/outline/ArrowsRightLeftIcon';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';

const iconClasses = `h-6 w-6`;
const submenuIconClasses = `h-5 w-5`;

const routes = [
  {
    path: '/app/dashboard',
    icon: <Squares2X2Icon className={iconClasses} />,
    name: 'Dashboard'
  },
  {
    path: '', //no url needed as this has submenu
    icon: <UserGroupIcon className={`${iconClasses} inline`} />, // icon component
    name: 'Accounts', // name that appear in Sidebar
    submenu: [
      {
        path: '/app/users', // url
        icon: <UserIcon className={submenuIconClasses} />, // icon component
        name: 'Users' // name that appear in Sidebar
      },
      {
        path: '/app/customers-and-wallets',
        icon: <WalletIcon className={submenuIconClasses} />,
        name: 'Customers & Wallets'
      },
      {
        path: '/app/livreurs-and-wallets',
        icon: <GlobeAltIcon className={submenuIconClasses} />,
        name: 'Deliveries & Wallets'
      }
    ]
  },
  {
    path: '', //no url needed as this has submenu
    icon: <MdRestaurantMenu className={`${iconClasses} inline`} />, // icon component
    name: 'Menu and Ordering', // name that appear in Sidebar
    submenu: [
      {
        path: '/app/menu-and-ordering/orders', // url
        icon: <PiBowlFoodThin className={submenuIconClasses} />, // icon component
        name: 'Orders' // name that appear in Sidebar
      },
      {
        path: '/app/menu-and-ordering/menu',
        icon: <MdOutlineMenuBook className={submenuIconClasses} />,
        name: 'Menu Items'
      },
      {
        path: '/app/menu-and-ordering/settings',
        icon: <VscSettings className={submenuIconClasses} />,
        name: 'Merchant Menu Settings'
      },
      {
        path: '/app/menu-and-ordering/dynamic-assignment',
        icon: <PiShareNetworkThin className={submenuIconClasses} />,
        name: 'Dynamic Assignment'
      }
    ]
  },
  {
    path: '', //no url needed as this has submenu
    icon: <LuPackageCheck className={`${iconClasses} inline`} />, // icon component
    name: 'Logistics Center', // name that appear in Sidebar
    submenu: [
      {
        path: '/app/logistics-center/control-panel', // url
        icon: <AiFillDashboard className={submenuIconClasses} />, // icon component
        name: 'Control Panel' // name that appear in Sidebar
      },
      {
        path: '/app/logistics-center/parcels', // url
        icon: <MdOutlineDeliveryDining className={submenuIconClasses} />, // icon component
        name: 'Parcels Management' // name that appear in Sidebar
      }
    ]
  },
  {
    path: '/app/transactions',
    icon: <ArrowsRightLeftIcon className={iconClasses} />,
    name: 'Transactions'
  },
  {
    path: '', //no url needed as this has submenu
    icon: <CiDiscount1 className={`${iconClasses} inline`} />, // icon component
    name: 'Discounts', // name that appear in Sidebar
    submenu: [
      {
        path: '/app/discounts/discount-management', // url
        icon: <MdOutlineDiscount className={submenuIconClasses} />, // icon component
        name: 'Promo' // name that appear in Sidebar
      },
      {
        path: '/app/discounts/code-management',
        icon: <BiSolidOffer className={submenuIconClasses} />,
        name: 'Code'
      }
    ]
  },
  {
    path: '', //no url needed as this has submenu
    icon: <MdManageHistory className={`${iconClasses} inline`} />, // icon component
    name: 'General Management', // name that appear in Sidebar
    submenu: [
      {
        path: '/app/general-management/offersSlice',
        icon: <BiSolidOffer className={submenuIconClasses} />,
        name: 'Offers'
      },
      {
        path: '/app/general-management/subscriptions',
        icon: <PiContactlessPaymentLight className={submenuIconClasses} />,
        name: 'Subscriptions'
      }
    ]
  },
  {
    path: '', //no url needed as this has submenu
    icon: <GiPartyPopper className={`${iconClasses} inline`} />, // icon component
    name: 'Invitation & Partnership', // name that appear in Sidebar
    submenu: [
      {
        path: '/app/general-management/invitations',
        icon: <FaSlideshare className={submenuIconClasses} />,
        name: 'Invitations'
      },
      {
        path: '/app/general-management/partnership-cashback',
        icon: <AiOutlinePartition className={submenuIconClasses} />,
        name: 'Partnership Cashback'
      },
      {
        path: '/app/general-management/partnership-bonus',
        icon: <AiOutlinePartition className={submenuIconClasses} />,
        name: 'Partnership Bonus'
      }
    ]
  },
  {
    path: '/app/live-positions',
    icon: <PiPersonSimpleBikeThin className={iconClasses} />,
    name: 'Live Positions'
  },
  {
    path: '', //no url needed as this has submenu
    icon: <WrenchScrewdriverIcon className={`${iconClasses} inline`} />, // icon component
    name: 'Settings', // name that appear in Sidebar
    submenu: [
      {
        path: '/app/settings/sms-provider',
        icon: <FcSms className={submenuIconClasses} />,
        name: 'SMS Providers'
      }
    ]
  }
];

export default routes;
