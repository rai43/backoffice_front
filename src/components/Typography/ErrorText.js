const ErrorText = ({ styleClasses, children }) => {
  return <p className={`text-center text-error ${styleClasses}`}>{children}</p>;
};

export default ErrorText;
