import React, { useEffect, useState } from 'react';

import { NotificationContainer, NotificationManager } from 'react-notifications';
import { useSelector, useDispatch } from 'react-redux';

import LeftSidebar from './LeftSidebar';
import ModalLayout from './ModalLayout';
import PageContent from './PageContent';
import { removeNotificationMessage } from '../features/common/headerSlice';
import 'react-notifications/lib/notifications.css';

import RightSidebar from './RightSidebar';
// import ModalLayout from "./ModalLayout";

function Layout() {
  const dispatch = useDispatch();

  const { newNotificationMessage, newNotificationStatus, isSideBarOpened } = useSelector(
    (state) => state.header
  );

  useEffect(() => {
    if (newNotificationMessage !== '') {
      if (newNotificationStatus === 1)
        NotificationManager.success(newNotificationMessage, 'Success');
      if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
      dispatch(removeNotificationMessage());
    }
  }, [newNotificationMessage]);

  return (
    <>
      {/* Left drawer - containing page content and side bar (always open) */}
      <div className={`drawer ${isSideBarOpened ? 'drawer-mobile' : ''} `}>
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <PageContent />
        <LeftSidebar />
      </div>

      {/* Right drawer - containing secondary content like notifications list etc.. */}
      <RightSidebar />

      {/** Notification layout container */}
      <NotificationContainer />

      {/* Modal layout container */}
      <ModalLayout />
    </>
  );
}

export default Layout;
