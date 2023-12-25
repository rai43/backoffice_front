import { useFormik } from 'formik';
import * as _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import FilterLg from '../../components/Filters/FilterLg';
import FilterSm from '../../components/Filters/FilterSm';
import InputCheckbox from '../../components/Input/InputCheckbox';
import Search from '../../components/Input/Search';
import InfoText from '../../components/Typography/InfoText';
import {
  MODAL_BODY_TYPES,
  CONFIRMATION_MODAL_CLOSE_TYPES,
  RIGHT_DRAWER_TYPES
} from '../../utils/globalConstantUtil';
import { openModal } from '../common/modalSlice';
import { openRightDrawer } from '../common/rightDrawerSlice';
import User from './components/User';
import { getUsersContent, resetFrom } from './userSlice';

const INITIAL_USER_FILTER_OBJ = {
  activeUsers: true,
  inactiveUsers: false
};

const TopSideButtons = ({ extraClasses, containerStyle }) => {
  const dispatch = useDispatch();

  const openAddNewUserModal = () => {
    dispatch(
      openModal({
        title: 'Add User',
        size: 'lg',
        bodyType: MODAL_BODY_TYPES.USER_ADD_OR_EDIT
      })
    );
  };

  return (
    <div className={`${containerStyle ? containerStyle : 'my-4'}`}>
      <button
        className={`btn px-6 normal-case btn-primary btn-outline w-full ${extraClasses}`}
        onClick={() => openAddNewUserModal()}
      >
        Add New User
      </button>
    </div>
  );
};
const Users = () => {
  const dispatch = useDispatch();
  const { users, from, isLoading, noMoreQuery } = useSelector((state) => state.user);
  const [search, setSearch] = useState('');
  const [openMobileFilter, setOpenMobileFilter] = useState(false);

  const openDeleteUserModal = (user) => {
    dispatch(
      openModal({
        title: 'Confirmation to delete user',
        bodyType: MODAL_BODY_TYPES.CONFIRMATION,
        extraObject: {
          message: `Are you sure you want to delete the user: ${user.email} ?`,
          type: CONFIRMATION_MODAL_CLOSE_TYPES.USER_DELETE,
          id: user.id
        }
      })
    );
  };
  const openEditUserModal = (extraObj) => {
    const extraObject = {
      id: extraObj.id,
      nom: extraObj.nom,
      prenom: extraObj.prenom,
      telephone: extraObj.telephone,
      email: extraObj.email,
      adresse: extraObj.adresse,
      userType: extraObj?.user_type
    };
    dispatch(
      openModal({
        title: 'Edit User',
        size: 'lg',
        bodyType: MODAL_BODY_TYPES.USER_ADD_OR_EDIT,
        extraObject
      })
    );
  };

  // Opening right sidebar for user details
  const openNotification = (user) => {
    dispatch(
      openRightDrawer({
        header: `Details View [${user.nom}]`,
        bodyType: RIGHT_DRAWER_TYPES.USER_DETAILS,
        extraObject: user
      })
    );
  };

  const formik = useFormik({
    initialValues: INITIAL_USER_FILTER_OBJ
  });

  const updateFormValue = useCallback(
    ({ key, value }) => {
      // this update will cause useEffect to get executed as there is a lookup on 'formik.values'
      formik.setValues({
        ...formik.values,
        [key]: value
      });
    },
    [formik]
  );

  const applyFilter = async (dispatchParams) => {
    await dispatch(getUsersContent(dispatchParams));
  };

  useEffect(() => {
    dispatch(resetFrom());
    const dispatchParams = {
      from: 0,
      active: formik.values.activeUsers,
      inactive: formik.values.inactiveUsers,
      searchPattern: search
    };

    applyFilter(dispatchParams);
  }, [formik.values]);

  const handleScroll = async () => {
    const usersContainer = document.getElementById('usersContainer');
    const { scrollHeight, scrollTop, clientHeight } = usersContainer;
    if (!noMoreQuery && scrollHeight - scrollTop <= clientHeight + 100 && !isLoading) {
      const dispatchParams = {
        from: from,
        active: formik.values.activeUsers,
        inactive: formik.values.inactiveUsers,
        searchPattern: search
      };

      await applyFilter(dispatchParams);

      // Maintain scroll position
      if (usersContainer) {
        setScrollPosition(scrollTop);
      }
    }
  };

  const delayedHandleScroll = _.debounce(handleScroll, 500);

  const setScrollPosition = (newPosition) => {
    setTimeout(() => {
      document.getElementById('usersContainer')?.scrollTo(0, newPosition);
    }, 0);
  };

  const getUpdateFormValue = async (value) => {
    setSearch(value);
    // if (value.length >= 3) {
    dispatch(resetFrom());
    const dispatchParams = {
      from: 0,
      active: formik.values.activeUsers,
      inactive: formik.values.inactiveUsers,
      searchPattern: value
    };

    await applyFilter(dispatchParams);
    // }
  };

  return (
    <>
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 lg:gap-x-5 lg:gap-y-3">
          <div className="md:col-span-2 md:flex h-[full] hidden">
            <div className="m-auto w-full h-3/5">
              <TopSideButtons />
              <FilterLg>
                <InputCheckbox
                  defaultValue={formik.values.activeUsers}
                  updateType="activeUsers"
                  containerStyle="mt-2"
                  labelTitle="Active Users"
                  updateFormValue={updateFormValue}
                />

                <InputCheckbox
                  defaultValue={formik.values.inactiveUsers}
                  updateType="inactiveUsers"
                  containerStyle="mt-2"
                  labelTitle="Inactive Users"
                  updateFormValue={updateFormValue}
                />
              </FilterLg>
            </div>
          </div>

          <button className="absolute bottom-2 right-2 p-1 btn btn-circle btn-outline btn-ghost md:hidden">
            <FunnelIcon
              className="w-4 h-4"
              onClick={() => setOpenMobileFilter((oldValue) => !oldValue)}
            />
          </button>

          <div className="md:col-span-5 md:h-[43rem]">
            <Search
              containerStyle={'px-5 py-2'}
              placeholder={'Search user name ...'}
              defaultValue={search}
              updateFormValue={getUpdateFormValue}
            />
            {users.length ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 md:p-5 h-screen md:h-[39rem] overflow-auto"
                id={'usersContainer'}
                onScroll={delayedHandleScroll}
              >
                {users.map((user) => (
                  <User
                    key={user.id}
                    user={user}
                    onEditClicked={openEditUserModal}
                    onDeleteClicked={openDeleteUserModal}
                    onDetailsClicked={openNotification}
                  />
                ))}
              </div>
            ) : (
              <InfoText styleClasses={'md:grid-cols-2'}>No user found ...</InfoText>
            )}
          </div>

          <FilterSm
            filterStatus={openMobileFilter}
            onOpenFilter={setOpenMobileFilter}
            title={<span className="font-semibold">User Filter</span>}
            actionButton={<TopSideButtons extraClasses="btn-sm w-1/2" containerStyle="my-0" />}
          >
            <FilterLg
              activeUsers={formik.values.activeUsers}
              inactiveUsers={formik.values.inactiveUsers}
              updateFormValue={updateFormValue}
            />
          </FilterSm>
        </div>
      )}
    </>
  );
};

export default Users;
