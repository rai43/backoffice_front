import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Subscription from "../../features/subscription";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Subscriptions" }));
  }, []);

  return <Subscription />;
  // return <Customers />;
}

export default InternalPage;
