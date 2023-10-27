import React, { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthenticatedRoute = (props) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkUserToken = useCallback(() => {
    const userToken = Cookies.get("token");
    if (
      !userToken ||
      userToken === "undefined" ||
      jwt_decode(userToken)?.exp < Date.now() / 1000
    ) {
      setIsLoggedIn(false);
      Cookies.remove("token");
      Cookies.remove("nom");
      Cookies.remove("email");
      Cookies.remove("telephone");
      Cookies.remove("userId");
      Cookies.remove("adresse");

      return (window.location.href = "/login");
    }
    setIsLoggedIn(true);
  }, [setIsLoggedIn, navigate]);

  useEffect(() => {
    checkUserToken();
  }, [checkUserToken]);

  return <React.Fragment>{isLoggedIn ? props.children : null}</React.Fragment>;
};

export default AuthenticatedRoute;
