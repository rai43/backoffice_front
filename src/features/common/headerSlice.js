import { createSlice } from '@reduxjs/toolkit';

export const headerSlice = createSlice({
	name: 'header',
	initialState: {
		pageTitle: 'Home', // current page title state management
		noOfNotifications: 15, // no of unread notifications
		newNotificationMessage: '', // message of notification to be shown
		newNotificationStatus: 1, // to check the notification type -  success/ error/ info
		isSideBarOpened: true,
	},
	reducers: {
		setPageTitle: (state, action) => {
			state.pageTitle = action.payload.title;
		},

		toggleSideBarStatus: (state, action) => {
			state.isSideBarOpened = !state.isSideBarOpened;
		},

		removeNotificationMessage: (state, action) => {
			state.newNotificationMessage = '';
		},

		showNotification: (state, action) => {
			state.newNotificationMessage = action.payload.message;
			state.newNotificationStatus = action.payload.status;
		},
	},
});

export const { setPageTitle, toggleSideBarStatus, removeNotificationMessage, showNotification } = headerSlice.actions;

export default headerSlice.reducer;
