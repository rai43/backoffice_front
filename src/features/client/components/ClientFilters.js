import React from 'react';

import { GoChevronDown } from 'react-icons/go';

import InputText from '../../../components/Input/InputText';

/**
 * Component for creating a dropdown button.
 *
 * @param {{
 *   label: string,
 *   isOpen: boolean,
 *   setIsOpen: Function,
 *   children: React.ReactNode
 * }} props - Component properties.
 */
const DropdownButton = ({ label, isOpen, setIsOpen, children }) => (
  <div className="relative inline-block text-left mx-2">
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`group inline-flex justify-center text-sm ${
        isOpen ? 'font-bold text-secondary' : 'font-light'
      }`}>
      {label}
      <GoChevronDown className={'-mr-1 ml-1 h-5 w-5 flex-shrink-0'} />
    </button>
    {isOpen && (
      <div
        className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-base-200 shadow-lg ring-1 ring-base-200"
        tabIndex="-1">
        <div className="py-1" role="none">
          {children}
        </div>
      </div>
    )}
  </div>
);

/**
 * Component for creating a dropdown item.
 *
 * @param {{
 *   children: React.ReactNode,
 *   isSelected: boolean,
 *   onClick: Function
 * }} props - Component properties.
 */
const DropdownItem = ({ children, isSelected, onClick }) => (
  <span
    className={`font-light hover:cursor-pointer hover:bg-base-300 block px-4 py-2 text-sm ${
      isSelected ? 'text-secondary' : ''
    }`}
    onClick={onClick}>
    {children}
  </span>
);

/**
 * Component for managing dropdown filters.
 *
 * @param {{
 *   formik: any,
 *   setFilterStates: Function,
 *   initFilters: Object,
 *   changeFilter: Function
 * }} props - Component properties.
 */
const ClientFilters = ({ formik, setFilterStates, filterStates, initFilters, changeFilter }) => {
  /**
   * Toggles a specific filter state.
   *
   * @param {string} filter - The filter key to toggle.
   */
  const toggleFilter = (filter) =>
    setFilterStates((oldState) => ({
      ...initFilters,
      [filter]: !oldState[filter]
    }));

  return (
    <div className="hidden sm:grid grid-cols-1 sm:grid-cols-5 gap-4">
      <DropdownButton
        label="Sort"
        isOpen={filterStates.direction}
        setIsOpen={() => toggleFilter('direction')}>
        <DropdownItem
          isSelected={formik.values.direction === 'DESC'}
          onClick={() => changeFilter({ key: 'direction', value: 'DESC', resetState: true })}>
          Newest
        </DropdownItem>
        <DropdownItem
          isSelected={formik.values.direction === 'ASC'}
          onClick={() => changeFilter({ key: 'direction', value: 'ASC', resetState: true })}>
          Oldest
        </DropdownItem>
      </DropdownButton>

      <div className="text-right sm:mb-2 sm:col-span-4">
        <DropdownButton
          label="Account Type"
          isOpen={filterStates.accountType}
          setIsOpen={() => toggleFilter('accountType')}>
          <DropdownItem
            isSelected={formik.values.personal && formik.values.merchant}
            onClick={() => {
              changeFilter({ key: 'personal', value: true, resetState: true });
              changeFilter({ key: 'merchant', value: true, resetState: true });
            }}>
            All
          </DropdownItem>
          <DropdownItem
            isSelected={formik.values.personal && !formik.values.merchant}
            onClick={() => {
              changeFilter({ key: 'personal', value: true, resetState: true });
              changeFilter({ key: 'merchant', value: false, resetState: true });
            }}>
            Personal
          </DropdownItem>
          <DropdownItem
            isSelected={!formik.values.personal && formik.values.merchant}
            onClick={() => {
              changeFilter({ key: 'personal', value: false, resetState: true });
              changeFilter({ key: 'merchant', value: true, resetState: true });
            }}>
            Merchant
          </DropdownItem>
        </DropdownButton>
        <DropdownButton
          label="Account Status"
          isOpen={filterStates.accountStatus}
          setIsOpen={() => toggleFilter('accountStatus')}>
          <DropdownItem
            isSelected={formik.values.active && formik.values.deleted}
            onClick={() => {
              changeFilter({ key: 'active', value: true, resetState: true });
              changeFilter({ key: 'deleted', value: true, resetState: true });
            }}>
            All
          </DropdownItem>
          <DropdownItem
            isSelected={formik.values.active && !formik.values.deleted}
            onClick={() => {
              changeFilter({ key: 'active', value: true, resetState: true });
              changeFilter({ key: 'deleted', value: false, resetState: true });
            }}>
            Active
          </DropdownItem>
          <DropdownItem
            isSelected={!formik.values.active && formik.values.deleted}
            onClick={() => {
              changeFilter({ key: 'active', value: false, resetState: true });
              changeFilter({ key: 'deleted', value: true, resetState: true });
            }}>
            Deleted
          </DropdownItem>
        </DropdownButton>
        <DropdownButton
          label="Fetch Limit"
          isOpen={filterStates.fetchLimit}
          setIsOpen={() => toggleFilter('fetchLimit')}>
          <DropdownItem
            isSelected={formik.values.limit === '1000000000'}
            onClick={() => {
              changeFilter({ key: 'limit', value: '1000000000', resetState: true });
            }}>
            All
          </DropdownItem>
          <DropdownItem
            isSelected={formik.values.limit === '250'}
            onClick={() => changeFilter({ key: 'limit', value: '250', resetState: true })}>
            250
          </DropdownItem>
          <DropdownItem
            isSelected={formik.values.limit === '500'}
            onClick={() => changeFilter({ key: 'limit', value: '500', resetState: true })}>
            500
          </DropdownItem>
          <DropdownItem
            isSelected={formik.values.limit === '1000'}
            onClick={() => changeFilter({ key: 'limit', value: '1000', resetState: true })}>
            1000
          </DropdownItem>
          <DropdownItem
            isSelected={formik.values.limit === '1500'}
            onClick={() => changeFilter({ key: 'limit', value: '1500', resetState: true })}>
            1500
          </DropdownItem>
        </DropdownButton>
        <DropdownButton
          label="More"
          isOpen={filterStates.more}
          setIsOpen={() => toggleFilter('more')}
        />
      </div>
    </div>
  );
};

export default ClientFilters;
