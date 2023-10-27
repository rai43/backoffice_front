import React, { useCallback, useState } from "react";
import { v4 as uuidv4, validate, version } from "uuid";

import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { AiOutlineRadiusSetting } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import TitleCard from "../../../../components/Cards/TitleCard";
import InputText from "../../../../components/Input/InputText";

const INITIAL_OBJ = {
  id: "",
  name: "",
  latitude: "",
  longitude: "",
  radius: "",
  details: "",
};

function isUUIDv4(id) {
  return validate(id) && version(id) === 4;
}

const Location = ({ formik, clickAction, locations, setLocations }) => {
  const [addNew, setAddNew] = useState(false);
  const [editLocation, setEditLocation] = useState(false);
  const [editLocationObj, setEditLocationObj] = useState({});
  const [location, setLocation] = useState(INITIAL_OBJ);

  const updateFormValue = useCallback(({ key, value }) => {
    return setLocation((oldValues) => {
      return { ...oldValues, [key]: value };
    });
  }, []);

  const AddNewLocation = () => {
    return (
      <button
        className="btn btn-outline btn-primary btn-sm"
        onClick={() => {
          setAddNew((_) => false);
          setEditLocation((old) => false);
          setLocation(INITIAL_OBJ);
          setTimeout(() => {
            setLocation(INITIAL_OBJ);
            setEditLocation((_) => false);
            setAddNew((_) => true);
          }, 0);

          // setLocation(INITIAL_OBJ);
          // setEditLocation((_) => false);
          // setAddNew((old) => !old);
        }}
      >
        Add a New Location
      </button>
    );
  };

  return (
    <>
      <TitleCard title={"Locations"} TopSideButtons={<AddNewLocation />}>
        {addNew || editLocation ? (
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-7 gap-2">
              <InputText
                type="text"
                defaultValue={location.name}
                updateType="name"
                placeholder="Name"
                containerStyle="mt-3 md:col-span-2"
                labelTitle="Name"
                updateFormValue={updateFormValue}
              />
              <InputText
                type="text"
                defaultValue={location.details}
                updateType="details"
                placeholder="Details"
                containerStyle="mt-3 md:col-span-2"
                labelTitle="Details"
                updateFormValue={updateFormValue}
              />
              <InputText
                type="number"
                defaultValue={location.latitude}
                updateType="latitude"
                placeholder="Latitude"
                containerStyle="mt-3"
                labelTitle="Latitude"
                updateFormValue={updateFormValue}
              />
              <InputText
                type="number"
                defaultValue={location.longitude}
                updateType="longitude"
                placeholder="Longitude"
                containerStyle="mt-3"
                labelTitle="Longitude"
                updateFormValue={updateFormValue}
              />
              <InputText
                type="number"
                defaultValue={location.radius}
                updateType="radius"
                placeholder="Radius"
                containerStyle="mt-3"
                labelTitle="Radius"
                updateFormValue={updateFormValue}
              />
            </div>
            <div className="flex items-center justify-center my-3 gap-3">
              <button
                className="btn btn-outline btn-sm btn-ghost w-1/4"
                onClick={() => {
                  setEditLocation((_) => false);
                  setAddNew((old) => false);
                }}
              >
                Cancel
              </button>
              <button
                className={`btn btn-outline btn-sm w-1/4 ${
                  editLocation ? "btn-secondary" : "btn-primary"
                }`}
                onClick={() => {
                  if (
                    location.name.length &&
                    location.details.length &&
                    parseInt(location?.radius || 0) > 0
                  ) {
                    if (editLocation) {
                      setLocations((oldValues) => {
                        const indexToReplace = oldValues.findIndex(
                          (loc) => loc?.id === location?.id,
                        );
                        oldValues[indexToReplace] = location;
                        return oldValues;
                      });
                    } else {
                      setLocations((oldValues) => {
                        return [
                          {
                            ...location,
                            name: location.name.toLocaleUpperCase(),
                            id: uuidv4(),
                          },
                          ...oldValues,
                        ];
                      });
                    }

                    setLocation(INITIAL_OBJ);
                    setEditLocation((_) => false);
                    setAddNew((old) => false);
                  }
                }}
              >
                {editLocation ? "Edit Location" : "Add Location"}
              </button>
            </div>
            {locations?.length ? (
              <div className={`divider`}>Locations</div>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}

        {locations.map((location) => (
          <div key={location.id} className="alert shadow-lg my-4">
            <div>
              <AiOutlineRadiusSetting className={"h-6 w-6"} />
              <div>
                <h3 className="font-bold">
                  {location.name} - ({location.details})
                </h3>
                <div className="text-xs">
                  Latitude:{" "}
                  <span className="font-semibold text-primary">
                    {location.latitude}
                  </span>
                  , Longitude:{" "}
                  <span className="font-semibold text-primary">
                    {location.longitude}
                  </span>
                  , Radius:{" "}
                  <span className="font-semibold text-primary">
                    {location.radius} meter(s)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-none">
              <button
                className="btn btn-sm btn-outline btn-secondary"
                onClick={() => {
                  setAddNew((_) => false);
                  setEditLocation((old) => false);
                  setLocation(INITIAL_OBJ);
                  setTimeout(() => {
                    setAddNew((_) => false);
                    setEditLocation((old) => true);
                    setLocation(location);
                  }, 0);
                }}
              >
                <CiEdit className="h-3 w-3" />
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setLocations((oldValues) => {
                    return oldValues.filter((loc) => loc.id !== location.id);
                  });
                }}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        {!locations?.length && !addNew && (
          <div className="flex items-center justify-center my-3 gap-3">
            No location added, Click
            <button
              className="hover:cursor-pointer text-primary"
              onClick={() => {
                setAddNew(true);
                setEditLocation((_) => false);
              }}
            >
              here to start adding
            </button>
          </div>
        )}
      </TitleCard>
      <div className="flex flex-row-reverse mt-6 mb-2 mx-4 gap-3">
        <button
          className="btn btn-outline btn-primary btn-sm"
          onClick={() =>
            clickAction((old) => {
              if (locations?.length) {
                return old + 1;
              } else {
                return old;
              }
            })
          }
        >
          Next
        </button>
        <button
          className=" btn btn-outline btn-ghost btn-sm"
          onClick={() => clickAction((old) => old - 1)}
        >
          Back
        </button>
      </div>
    </>
  );
};

export default Location;
