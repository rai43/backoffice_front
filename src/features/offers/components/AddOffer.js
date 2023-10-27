import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { showNotification } from "../../common/headerSlice";
import { useFormik } from "formik";
import { saveOffer } from "../offersSlice";

function AddOffer({ extraObject, closeModal }) {
  const dispatch = useDispatch();
  const INITIAL_FILTER_OBJ = {
    name: "",
    description: "",
    offer_type: "PARTICULIER",
    subscription_type: "WEEKLY",
    amount: 0,
    max_quantity: 0,
    subscriber_limit: 0,
  };

  const formik = useFormik({
    initialValues: INITIAL_FILTER_OBJ,
  });

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-3 mb-2">
        <div className={`form-control w-full`}>
          <label className="label">
            <span className={"label-text text-base-content "}>Name</span>
          </label>
          <input
            type="text"
            value={formik.values.name}
            className="input input-bordered w-full input-sm"
            onChange={(e) => {
              formik.setValues({
                ...formik.values,
                name: e.target.value,
              });
            }}
          />
        </div>
        <div className={`form-control w-full`}>
          <label className="label">
            <span className={"label-text text-base-content "}>Offer Type</span>
          </label>
          <select
            className="select select-bordered w-full select-sm"
            value={formik.values.offer_type}
            onChange={(e) => {
              formik.setValues({
                ...formik.values,
                offer_type: e.target.value || "PARTICULIER",
              });
            }}
          >
            <option value={"PARTICULIER"}>PARTICULIER</option>
            <option value={"ENTREPRISE"}>ENTREPRISE</option>
          </select>
        </div>
        <div className={`form-control w-full`}>
          <label className="label">
            <span className={"label-text text-base-content "}>
              Subscription Type
            </span>
          </label>
          <select
            className="select select-bordered w-full select-sm"
            value={formik.values.subscription_type}
            onChange={(e) => {
              formik.setValues({
                ...formik.values,
                subscription_type: e.target.value || "WEEKLY",
              });
            }}
          >
            <option value={"WEEKLY"}>WEEKLY</option>
            <option value={"MONTHLY"}>MONTHLY</option>
          </select>
        </div>
        <div className={`form-control w-full`}>
          <label className="label">
            <span className={"label-text text-base-content "}>Amount</span>
          </label>
          <input
            type="number"
            value={formik.values.amount}
            className="input input-bordered w-full input-sm"
            onChange={(e) => {
              formik.setValues({
                ...formik.values,
                amount: e.target.value,
              });
            }}
          />
        </div>
        <div className={`form-control w-full`}>
          <label className="label">
            <span className={"label-text text-base-content "}>
              Max Quantity
            </span>
          </label>
          <input
            type="number"
            value={formik.values.max_quantity}
            className="input input-bordered w-full input-sm"
            onChange={(e) => {
              formik.setValues({
                ...formik.values,
                max_quantity: e.target.value,
              });
            }}
          />
        </div>
        <div className={`form-control w-full`}>
          <label className="label">
            <span className={"label-text text-base-content "}>
              Subscriber Limit
            </span>
          </label>
          <input
            type="number"
            value={formik.values.subscriber_limit}
            className="input input-bordered w-full input-sm"
            onChange={(e) => {
              formik.setValues({
                ...formik.values,
                subscriber_limit: e.target.value,
              });
            }}
          />
        </div>
        <div className={`form-control md:col-span-3 w-full`}>
          <label className="label">
            <span className={"label-text text-base-content "}>Description</span>
          </label>
          <input
            type="text"
            value={formik.values.description}
            className="input input-bordered w-full input-sm"
            onChange={(e) => {
              formik.setValues({
                ...formik.values,
                description: e.target.value,
              });
            }}
          />
        </div>
        <div className={"md:col-span-3 grid place-items-center"}>
          <button
            className="btn btn-sm md:w-1/2 btn-secondary btn-outline my-4 "
            onClick={async () => {
              await dispatch(saveOffer(formik.values)).then(
                async (response) => {
                  if (response?.error) {
                    dispatch(
                      showNotification({
                        message: "Error while saving the new offer",
                        status: 0,
                      }),
                    );
                  } else {
                    dispatch(
                      showNotification({
                        message: "Succefully added the offer",
                        status: 1,
                      }),
                    );
                    closeModal();
                  }
                },
              );
            }}
          >
            Add Offer
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddOffer;
