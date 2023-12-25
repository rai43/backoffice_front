import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import PatnershipList from './components/patnershipList';
import { getInvitations, resetForm } from './partnershipSlice';
import InfoText from '../../components/Typography/InfoText';
import { showNotification } from '../common/headerSlice';

const Partnership = () => {
  const dispatch = useDispatch();
  const { invitations, isLoading } = useSelector((state) => state.invitations);

  useEffect(() => {
    onFetchInvitations();
  }, []);

  const applyFilter = async (dispatchParams) => {
    await dispatch(getInvitations(dispatchParams)).then(async (response) => {
      if (response?.error) {
        console.log(response.error);
        dispatch(
          showNotification({
            message: 'Error while fetching invitations',
            status: 0
          })
        );
      } else {
        dispatch(
          showNotification({
            message: 'Succefully fetched the invitations',
            status: 1
          })
        );
      }
    });
  };

  const onFetchInvitations = async () => {
    dispatch(resetForm());
    const dispatchParams = {};
    await applyFilter(dispatchParams);
  };

  return (
    <div>
      {!isLoading && (
        <>
          {invitations.length ? (
            <PatnershipList />
          ) : (
            <InfoText styleClasses={'md:grid-cols-2'}>No order found ...</InfoText>
          )}
        </>
      )}
    </div>
  );
};

export default Partnership;
