const extractAxiosErrorMessage = (axiosErrorMessageString) => {
  // Extract the error message
  try {
    const regexPattern = /<pre>Error: ([^<]+)/;
    const match = axiosErrorMessageString.match(regexPattern);
    const errorMessage = match ? match[1].trim() : 'Error message not found';
    return errorMessage;
  } catch (e) {
    return 'An error occurred.';
  }
};

export default extractAxiosErrorMessage;
