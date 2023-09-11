import React from "react";
import TitleCard from "../Cards/TitleCard";
import InputCheckbox from "../Input/InputCheckbox";

const FilterLg = (props) => {
  return (
    <>
      <TitleCard title={props.title || "Filters"} topMargin={"pb-3"}>
        {props.children}
      </TitleCard>
    </>
  );
};

export default FilterLg;
