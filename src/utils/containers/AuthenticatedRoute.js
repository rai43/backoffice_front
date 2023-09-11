import React, { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AuthenticatedRoute = (props) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkUserToken = useCallback(() => {
    const userToken = Cookies.get("token");
    if (!userToken || userToken === "undefined") {
      setIsLoggedIn(false);
      return navigate("/login");
    }
    setIsLoggedIn(true);
  }, [setIsLoggedIn, navigate]);

  useEffect(() => {
    checkUserToken();
  }, [checkUserToken]);

  return <React.Fragment>{isLoggedIn ? props.children : null}</React.Fragment>;
};

export default AuthenticatedRoute;
