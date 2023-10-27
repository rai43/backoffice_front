import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptions, resetForm } from "./subscriptionSlice";
import { showNotification } from "../common/headerSlice";
import ClientOrdres from "../order/components/ClientOrdres";
import InfoText from "../../components/Typography/InfoText";
import SubscriptionList from "./components/SubscriptionList";

const Subscription = (props) => {
  const dispatch = useDispatch();
  const { subscriptions, isLoading } = useSelector(
    (state) => state.subscriptions,
  );
  console.log(subscriptions);

  useEffect(() => {
    onFetchClientSubscriptions();
  }, []);

  const applyFilter = async (dispatchParams) => {
    await dispatch(getSubscriptions(dispatchParams)).then(async (response) => {
      if (response?.error) {
        console.log(response.error);
        dispatch(
          showNotification({
            message: "Error while fetching subscriptions",
            status: 0,
          }),
        );
      } else {
        dispatch(
          showNotification({
            message: "Succefully fetched the subscriptions",
            status: 1,
          }),
        );
      }
    });
  };

  const onFetchClientSubscriptions = async () => {
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
            New Subscription
          </button>
        </div>
      </div>
      {!isLoading && (
        <>
          {subscriptions.length ? (
            <SubscriptionList
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

export default Subscription;
