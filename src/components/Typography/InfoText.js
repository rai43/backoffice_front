const InfoText = ({ styleClasses, children }) => {
  return <p className={`text-center text-lg ${styleClasses}`}>{children}</p>;
};

export default InfoText;
