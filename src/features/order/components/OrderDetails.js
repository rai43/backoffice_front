import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setOrderStatusNoCheck } from "../orderSlice";
import { showNotification } from "../../common/headerSlice";

const OrderDetails = ({ extraObject, closeModal }) => {
  const dispatch = useDispatch();
  useEffect(() => console.log(extraObject));
  return (
    <div>
      <h3 className="font-semibold text-lg uppercase">
        General Information -{" "}
        <span className="text-primary">{extraObject.id}</span>
      </h3>
      <div className="divider">General</div>
      <div className="grid md:grid-cols-2 gap-3 uppercase">
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">ID</h4>
          <div className="col-span-2 text-primary">{extraObject?.id}</div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Date</h4>
          <div className="col-span-2 text-primary">
            {moment.utc(extraObject?.created_at).format("DD/MM/YYYY HH:mm")}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Client</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.phone_number}
          </div>
        </div>
      </div>
      <div className="divider">Payment</div>
      <div className="grid md:grid-cols-2 gap-3 uppercase">
        <div className="grid col-span-2 grid-cols-6 font-semibold">
          <h4 className="uppercase">Payment method</h4>
          <div className="col-span-4 text-primary">
            {extraObject?.payment_method}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Client Price</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.total_articles}
            {parseInt(extraObject?.total_discount) > 0 ? (
              <span className="text-secondary mx-2">
                (- {extraObject?.total_discount})
              </span>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Merchant Price</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.article_commandes?.reduce(
              (accumulator, currentObj) => {
                return accumulator + parseFloat(currentObj.merchant_price);
              },
              0,
            ) || 0}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Service Fee</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.service_fee}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Total Paid</h4>
          <div className="col-span-2 text-primary">{extraObject?.total}</div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Balance share</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.balance_share}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Bonus share</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.bonus_share}
          </div>
        </div>
      </div>
      <div className="divider">Merchant</div>
      <div className="grid md:grid-cols-2 gap-3 uppercase">
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Merchant name</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.merchant?.name}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Merchant phone number</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.merchant?.client?.phone_number}
          </div>
        </div>
      </div>
      <div className="divider">Address</div>
      <div className="grid md:grid-cols-2 gap-3 uppercase">
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Latitude</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.address?.latitude}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Longitude</h4>
          <div className="col-span-2 text-primary uppercase">
            {extraObject?.address?.longitude}
          </div>
        </div>
        <div className="grid col-span-2 grid-cols-6 font-semibold">
          <h4 className="uppercase">Address details</h4>
          <div className="col-span-4 text-primary uppercase">
            {extraObject?.address?.detail}
          </div>
        </div>
      </div>
      <div className="divider">Livreur</div>
      <div className="grid md:grid-cols-2 gap-3 uppercase">
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Livreur Name</h4>
          <div className="col-span-2 text-primary">
            {extraObject?.livreur
              ? `${extraObject?.livreur?.last_name} ${extraObject?.livreur?.first_name}`
              : "N/A"}
          </div>
        </div>
        <div className="grid grid-cols-3 font-semibold">
          <h4 className="uppercase">Livreur Phone</h4>
          <div className="col-span-2 text-primary uppercase">
            {" "}
            {extraObject?.livreur?.client?.phone_number} (
            {extraObject?.livreur?.whatsapp || "N/A"})
          </div>
        </div>
      </div>
      <div className="divider">Status</div>
      <div className="stats shadow w-full text-[1.1rem]">
        <div className="stat place-items-center">
          <div className="stat-title">PENDING</div>
          <div className="stat-value">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "PENDING",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) => status?.commande_status?.code === "PENDING",
                    )?.created_at,
                  )
                  .format("HH:mm")
              : "- -"}
          </div>
          <div className="stat-desc">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "PENDING",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) => status?.commande_status?.code === "PENDING",
                    )?.created_at,
                  )
                  .format("DD-MM-YYYY")
              : "- -"}
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">REGISTERED</div>
          <div className="stat-value text-">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "REGISTERED",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) =>
                        status?.commande_status?.code === "REGISTERED",
                    )?.created_at,
                  )
                  .format("HH:mm")
              : "- -"}
          </div>
          <div className="stat-desc text-">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "REGISTERED",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) =>
                        status?.commande_status?.code === "REGISTERED",
                    )?.created_at,
                  )
                  .format("DD-MM-YYYY")
              : "- -"}
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">INPROCESS</div>
          <div className="stat-value text-">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "INPROCESS",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) => status?.commande_status?.code === "INPROCESS",
                    )?.created_at,
                  )
                  .format("HH:mm")
              : "- -"}
          </div>
          <div className="stat-desc text-">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "INPROCESS",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) => status?.commande_status?.code === "INPROCESS",
                    )?.created_at,
                  )
                  .format("DD-MM-YYYY")
              : "- -"}
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">INDELIVERY</div>
          <div className="stat-value text-">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "INDELIVERY",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) =>
                        status?.commande_status?.code === "INDELIVERY",
                    )?.created_at,
                  )
                  .format("HH:mm")
              : "- -"}
          </div>
          <div className="stat-desc text-">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "INDELIVERY",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) =>
                        status?.commande_status?.code === "INDELIVERY",
                    )?.created_at,
                  )
                  .format("DD-MM-YYYY")
              : "- -"}
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">DELIVERED</div>
          <div className="stat-value text-primary">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "DELIVERED",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) => status?.commande_status?.code === "DELIVERED",
                    )?.created_at,
                  )
                  .format("HH:mm")
              : "- -"}
          </div>
          <div className="stat-desc text-primary">
            {extraObject?.commande_commande_statuses.find(
              (status) => status?.commande_status?.code === "DELIVERED",
            )
              ? moment
                  .utc(
                    extraObject?.commande_commande_statuses.find(
                      (status) => status?.commande_status?.code === "DELIVERED",
                    )?.created_at,
                  )
                  .format("DD-MM-YYYY")
              : "- -"}
          </div>
        </div>
        {extraObject?.commande_commande_statuses.find(
          (status) => status?.commande_status?.code === "CANCELED",
        ) && (
          <div className="stat place-items-center">
            <div className="stat-title text-secondary">CANCELED</div>
            <div className="stat-value text-secondary">
              {extraObject?.commande_commande_statuses.find(
                (status) => status?.commande_status?.code === "CANCELED",
              )
                ? moment
                    .utc(
                      extraObject?.commande_commande_statuses.find(
                        (status) =>
                          status?.commande_status?.code === "CANCELED",
                      )?.created_at,
                    )
                    .format("HH:mm")
                : "- -"}
            </div>
            <div className="stat-desc text-secondary">
              {extraObject?.commande_commande_statuses.find(
                (status) => status?.commande_status?.code === "CANCELED",
              )
                ? moment
                    .utc(
                      extraObject?.commande_commande_statuses.find(
                        (status) =>
                          status?.commande_status?.code === "CANCELED",
                      )?.created_at,
                    )
                    .format("DD-MM-YYYY")
                : "- -"}
            </div>
          </div>
        )}
      </div>
      <div className="my-4 flex justify-center">
        <select
          className="select select-ghost select-sm"
          onChange={async (e) => {
            console.log(e.target.value);
            await dispatch(
              setOrderStatusNoCheck({
                commandId: extraObject?.id,
                status: e.target.value,
              }),
            ).then(async (response) => {
              if (response?.error) {
                dispatch(
                  showNotification({
                    message: "Error while change the status",
                    status: 0,
                  }),
                );
              } else {
                dispatch(
                  showNotification({
                    message: "Succefully changed the status",
                    status: 1,
                  }),
                );

                closeModal();
              }
            });
          }}
        >
          <option disabled selected>
            Change the order Status
          </option>
          <option value={"PENDING"}>PENDING</option>
          <option value={"REGISTERED"}>REGISTERED</option>
          <option value={"INPROCESS"}>INPROCESS</option>
          <option value={"INDELIVERY"}>INDELIVERY</option>
          <option value={"DELIVERED"}>DELIVERED</option>
          <option value={"CANCELED"}>CANCELED</option>
        </select>
      </div>
      {extraObject?.article_commandes?.length > 0 &&
        extraObject?.article_commandes?.map((article) => (
          <div key={article?.id}>
            <div className="divider text-primary">
              Article ID: {article?.id}
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              <div className="avatar">
                <div className="w-32 h-32 rounded-xl flex justify-center">
                  <img src={article?.article?.image} alt="article" />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-3 uppercase font-semibold">
                <div>Article name</div>
                <div className="col-span-2">{article?.article?.title}</div>
                <div>Quantity</div>
                <div className="col-span-2">{article?.quantity}</div>
                <div>Unit Price</div>
                <div className="col-span-2">{article?.price}</div>
                <div>Total Price</div>
                <div className="col-span-2">
                  {article?.price * article?.quantity}
                </div>
                <div>Total Merchant Price</div>
                <div className="col-span-2">
                  {article?.merchant_price * article?.quantity}
                </div>
                <div>Comment</div>
                <div className="col-span-2">{article?.comment || "N/A"}</div>
                {/* {article?.ligne_accompagnements?.map((acc) => ( */}
                {/* {article?.accompagnements?.map((acc) => ( */}
                {article?.accompagnement?.id && (
                  <>
                    <div className="col-span-3 divider text-secondary">
                      Accompagnements
                    </div>
                    <div
                      key={article?.accompagnement?.id}
                      className="grid md:grid-cols-8 col-span-3"
                    >
                      {/* <label className='label cursor-pointer md:col-start-2 md:col-span-6'> */}
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm md:col-start-2 mt-2"
                        checked
                        disabled
                      />
                      <span className="label-text md:col-span-3 mt-2">
                        {article?.accompagnement?.name}
                      </span>
                    </div>
                  </>
                )}
                {/* ))} */}
                {/* {article?.ligne_supplements?.length > 0 ? <div className='col-span-3 divider text-secondary'>Supplements</div> : ''} */}
                {article?.supplements?.length > 0 ? (
                  <div className="col-span-3 divider text-secondary">
                    Supplements
                  </div>
                ) : (
                  ""
                )}
                {article?.supplements?.map((supp) => (
                  <div
                    key={supp?.id}
                    className="grid md:grid-cols-8 col-span-3"
                  >
                    {/* <label className='label cursor-pointer md:col-start-2 md:col-span-6'> */}
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm md:col-start-2 mt-2"
                      checked
                      disabled
                    />
                    <span className="label-text md:col-span-3 mt-2">
                      {supp?.accompagnement?.name}
                    </span>
                    <span className="label-text md:col-span-3 mt-2">
                      {supp?.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default OrderDetails;
