const Subtitle = ({ styleClasses, children }) => {
  return (
    <div className={`text-xl font-semibold ${styleClasses}`}>{children}</div>
  );
};

export default Subtitle;
