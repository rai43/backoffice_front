import Axios from "axios";
import Cookies from "js-cookie";

const initializeApp = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const TOKEN = Cookies.get("token");

  // Setting base URL for all API request via axios
  Axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;
  Axios.defaults.headers.post["Content-Type"] = "application/json";

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    // dev code
    Axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_DEV;
    console.log(`Successfully initialized the app for development`);
  } else {
    // Prod build code
    Axios.defaults.baseURL = process.env.REACT_APP_BASE_URL_PROD;

    // init analytics here for later improvement
    console.log(`Successfully initialized the app for production`);
  }
};

export default initializeApp;
