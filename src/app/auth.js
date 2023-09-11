import axios from "axios";
import Cookies from "js-cookie";

const auth = {
  logout: () => {
    Cookies.remove("token");
    Cookies.remove("nom");
    Cookies.remove("email");
    Cookies.remove("telephone");
    Cookies.remove("userId");
    Cookies.remove("adresse");

    window.location.href = "/";
  },

  checkAuth: () => {
    /*  Getting token value stored in localstorage, if token is not present we will open login page
          for all internal dashboard routes  */
    const TOKEN = Cookies.get("token");
    const PUBLIC_ROUTES = ["login", "forgot-password", "register"];

    const isPublicPage = PUBLIC_ROUTES.some((r) =>
      window.location.href.includes(r),
    );

    if (!TOKEN && !isPublicPage) {
      window.location.href = "/login";
    } else {
      axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;

      axios.interceptors.request.use(
        function (config) {
          // UPDATE: Add this code to show global loading indicator
          document.body.classList.add("loading-indicator");
          return config;
        },
        function (error) {
          return Promise.reject(error);
        },
      );

      axios.interceptors.response.use(
        function (response) {
          // UPDATE: Add this code to hide global loading indicator
          document.body.classList.remove("loading-indicator");
          return response;
        },
        function (error) {
          document.body.classList.remove("loading-indicator");
          // return Promise.reject(error);
          if (error.response.status === 401) {
            console.log("unauthorized, logging out ...");
            auth.logout();
            window.location.href = "/login";
          }
          console.log("error", error);
          return Promise.reject(error.response);
        },
      );
      return TOKEN;
    }
  },
};

export default auth;
