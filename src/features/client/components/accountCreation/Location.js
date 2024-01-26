import React, { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import { v4 as uuidv4, validate, version } from 'uuid';

import { AiOutlineEdit, AiOutlineDelete, AiOutlineRadiusSetting } from 'react-icons/ai';
import { CiEdit } from 'react-icons/ci';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';

import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

import TitleCard from '../../../../components/Cards/TitleCard';
import InputText from '../../../../components/Input/InputText';
import { showNotification } from '../../../common/headerSlice';

const INITIAL_OBJ = {
  id: '',
  name: '',
  latitude: '',
  longitude: '',
  radius: '',
  details: ''
};

/**
 * Component for adding, editing, and displaying locations for a merchant account.
 *
 * @param {Object} formik - Formik object for form handling.
 * @param {Function} clickAction - Function to navigate through form steps.
 * @param {Array} locations - Array of location objects.
 * @param {Function} setLocations - Function to update locations state.
 * @returns {React.Component} A component for managing locations.
 */
const Location = ({ formik, clickAction, locations, setLocations }) => {
  const dispatch = useDispatch();

  // Component state and handlers
  const [addNew, setAddNew] = useState(false);
  const [editLocation, setEditLocation] = useState(false);
  const [location, setLocation] = useState(INITIAL_OBJ);

  const updateFormValue = ({ key, value }) => {
    setLocation((oldValues) => ({ ...oldValues, [key]: value }));
  };

  const handleSaveLocation = () => {
    // Check if any of the location fields are empty
    if (!location.name || !location.latitude || !location.longitude || !location.radius) {
      dispatch(
        showNotification({
          message: 'Please fill in the required fields.',
          status: 0
        })
      );
      return; // Exit the function if any field is empty
    }
    if (!addNew && editLocation) {
      setLocations((oldLocations) =>
        oldLocations.map((loc) => (loc.id === location.id ? location : loc))
      );
    } else {
      setLocations((oldLocations) => [...oldLocations, { ...location, id: uuidv4() }]);
    }
    resetFormState();
  };

  const handleEditLocation = (loc) => {
    resetFormState();
    setTimeout(() => {
      setLocation(() => loc);
      setAddNew(false);
      setEditLocation(true);
    }, 0);
  };

  const handleDeleteLocation = (locId) => {
    setLocations((oldLocations) => oldLocations.filter((loc) => loc.id !== locId));
  };

  const resetFormState = () => {
    setLocation(INITIAL_OBJ);
    setAddNew(false);
    setEditLocation(false);
  };

  return (
    <div className="container mx-auto my-4 p-4">
      {addNew || editLocation ? (
        <LocationForm
          addNew={addNew}
          editLocation={editLocation}
          location={location}
          updateFormValue={updateFormValue}
          handleSaveLocation={handleSaveLocation}
          resetFormState={resetFormState}
        />
      ) : (
        <button className="btn btn-primary" onClick={() => setAddNew(true)}>
          Add New Location
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-3">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-white rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-6">
            <div className="mb-4 flex items-center">
              <div className="text-4xl text-primary mr-4">
                <FiMapPin />
              </div>
              <h3 className="text-2xl font-semibold">{location.name}</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {location.details ? location.details : 'No description'}
            </p>
            <div className="text-gray-600">
              <p>
                <span className="font-semibold">Latitude:</span> {location.latitude}
              </p>
              <p>
                <span className="font-semibold">Longitude:</span> {location.longitude}
              </p>
              <p>
                <span className="font-semibold">Radius:</span> {location.radius} meter(s)
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="btn btn-sm btn-primary hover:bg-primary-600 hover:text-white mr-4"
                onClick={() => handleEditLocation(location)}>
                <FiEdit2 />
              </button>
              <button
                className="btn btn-sm btn-error hover:bg-red-600 hover:text-white"
                onClick={() => handleDeleteLocation(location.id)}>
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!locations?.length && !addNew && (
        <div className="flex items-center justify-center my-3 gap-3">No location added</div>
      )}
      {/*</TitleCard>*/}
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
          }>
          Next
        </button>
        <button
          className=" btn btn-outline btn-ghost btn-sm"
          onClick={() => clickAction((old) => old - 1)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default Location;

/**
 * LocationForm - A form component for adding or editing locations.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.addNew - Flag indicating if it's a new location addition.
 * @param {boolean} props.editLocation - Flag indicating if it's an existing location edit.
 * @param {Object} props.location - The location data.
 * @param {Function} props.updateFormValue - Function to update form values.
 * @param {Function} props.handleSaveLocation - Function to handle saving the location.
 * @param {Function} props.resetFormState - Function to reset the form state.
 * @returns {React.Component} - A form component for adding or editing locations.
 */
const LocationForm = ({
  addNew,
  editLocation,
  location,
  updateFormValue,
  handleSaveLocation,
  resetFormState
}) => {
  if (!addNew && !editLocation) {
    return null;
  }

  return (
    <div className="card bg-base-100 p-4 mb-4 shadow-[inset_-12px_-8px_40px_#46464620]">
      <div className="card-body">
        <h2 className="card-title">{editLocation ? 'Edit Location' : 'Add New Location'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Input Fields */}
          <InputText
            type="text"
            defaultValue={location.name}
            updateType="name"
            placeholder="Name"
            containerStyle="mt-3"
            labelTitle="Name"
            updateFormValue={updateFormValue}
          />
          <InputText
            type="text"
            defaultValue={location.details}
            updateType="details"
            placeholder="Details"
            containerStyle="mt-3"
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
        <div className="card-actions justify-end">
          <button className="btn btn-ghost" onClick={resetFormState}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSaveLocation}>
            {editLocation ? 'Update Location' : 'Save Location'}
          </button>
        </div>
      </div>
    </div>
  );
};
