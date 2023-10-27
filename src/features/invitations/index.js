import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInvitations, resetForm } from "./invitationSlice";
import { showNotification } from "../common/headerSlice";
import InfoText from "../../components/Typography/InfoText";
import InvitationList from "./components/invitationList";

const Invitations = (props) => {
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
            message: "Error while fetching invitations",
            status: 0,
          }),
        );
      } else {
        dispatch(
          showNotification({
            message: "Succefully fetched the invitations",
            status: 1,
          }),
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
      <div className="grid sm:grid-cols-3 gap-3 my-3 md:my-5">
        <div className="md:col-start-3">
          <button
            className="btn btn-sm btn-outline btn-primary w-full"
            // onClick={() => {
            //   dispatch(
            //     openModal({
            //       title: "New Offer",
            //       size: "lg",
            //       bodyType: MODAL_BODY_TYPES.OFFER_ADD_OR_EDIT,
            //       // extraObject: { dateValue },
            //     }),
            //   );
            // }}
          >
            New Invitation
          </button>
        </div>
      </div>
      {!isLoading && (
        <>
          {invitations.length ? (
            <InvitationList
            // currPage={pageNumberRef.current}
            // onLoad={handleLoadOrders}
            // updateFormValue={fetchOrdersOnSearch}
            />
          ) : (
            <InfoText styleClasses={"md:grid-cols-2"}>
              No order found ...
            </InfoText>
          )}
        </>
      )}
    </div>
  );
};

export default Invitations;
