import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Customers from "../../features/client";
import Offers from "../../features/offers";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Offers" }));
  }, []);

  return <Offers />;
}

export default InternalPage;
