import React, { useState } from "react";
import moment from "moment";
import cliTruncate from "cli-truncate";
import {
  MdPlaylistAdd,
  MdOutlineDeleteOutline,
  MdOutlineModeEditOutline,
} from "react-icons/md";

import UserBasicDetail from "../../../components/Common/UserBasicDetail";
import TitleCard from "../../../components/Cards/TitleCard";
import InfoText from "../../../components/Typography/InfoText";
import { useDispatch, useSelector } from "react-redux";
import { openRightDrawer } from "../../common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../../../utils/globalConstantUtil";
import {
  deleteMerchantsAccompagnement,
  switchArticlePublishFromSettings,
} from "../merchantsSettingsSlice";
import { showNotification } from "../../common/headerSlice";
import { switchArticlePublish } from "../../merchantsMenu/merchantsMenuSlice";

const MerchantsSettingsDetailView = ({ extraObject }) => {
  const dispatch = useDispatch();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [modalInfo, setModalInfo] = useState({
    isOpened: false,
    name: "",
    id: "",
  });
  const { merchants, skip, isLoading, noMoreQuery } = useSelector(
    (state) => state.merchant,
  );
  console.log(extraObject);

  const openMerchantArticle = (obj) => {
    // api call to get the client transactions details
    dispatch(
      openRightDrawer({
        header: `Add New Article`,
        bodyType: RIGHT_DRAWER_TYPES.MERCHANT_SETTINGS_ARTICLE,
        extraObject: obj,
      }),
    );
  };

  const openMerchantAccompagnement = (obj) => {
    // api call to get the client transactions details
    dispatch(
      openRightDrawer({
        header: `Accompagnements`,
        bodyType: RIGHT_DRAWER_TYPES.MERCHANT_SETTINGS_ACCOMPAGNEMENT,
        extraObject: obj,
      }),
    );
  };
  // console.log(extraObject);

  const AddArticle = () => {
    return (
      <button
        className="btn btn-outline btn-primary btn-sm"
        onClick={() =>
          openMerchantArticle({
            merchant_id: extraObject?.id,
            accompagnements: merchants
              ?.find((merch) => merch.id === extraObject.id)
              ?.accompagnements?.filter((acc) => acc.is_deleted === false),
          })
        }
      >
        Add a New Article
      </button>
    );
  };

  const AddAccompagnement = () => {
    return (
      <button
        className="btn btn-outline btn-primary btn-sm"
        onClick={() =>
          openMerchantAccompagnement({ merchant_id: extraObject?.id })
        }
      >
        Add a New Accompagnement
      </button>
    );
  };

  return (
    <>
      <div className="w-full">
        {/* Divider */}
        <div className="divider mt-0"></div>

        {/* Basic Client Info */}
        <UserBasicDetail {...extraObject.client} merchants={[extraObject]} />

        {/* Info card */}
        <div className="w-full stats stats-vertical lg:stats-horizontal shadow mb-4">
          <div className="stat">
            <div className="stat-title">Merchant ID</div>
            <div className={`stat-value text-[1.6rem] text-primary`}>
              {extraObject?.id || "0"}
            </div>
            <div className="stat-desc">
              <span className="font-semibold"></span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Articles</div>
            <div
              className={`stat-value text-[1.6rem] ${
                extraObject?.articles?.length > 0 ? "text-primary" : ""
              }`}
            >
              {extraObject?.articles?.length || "0"}
            </div>
            <div className="stat-desc">
              <span className="font-semibold">{`Article${
                extraObject?.articles?.length ? "s" : ""
              }`}</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Accompagnements</div>
            <div
              className={`stat-value text-[1.6rem] ${
                extraObject?.accompagnements?.length > 0 ? "text-primary" : ""
              }`}
            >
              {extraObject?.accompagnements?.length || "0"}
            </div>
            <div className="stat-desc">
              <span className="font-semibold">{`Accompagnement${
                extraObject?.accompagnements?.length ? "s" : ""
              }`}</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Creation Info</div>
            <div className="stat-value text-[1.2rem]">
              {moment(extraObject?.created_at).format("DD-MM-YYYY HH:mm") ||
                "N/A"}
            </div>
            <div className="stat-desc">
              By:{" "}
              <span className="font-semibold">
                {extraObject?.created_by || "Backoffice"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}

        <TitleCard
          title={"Accompagnements"}
          topMargin={"mt-4"}
          // containerStyle={'max-h-60'}
          TopSideButtons={<AddAccompagnement />}
        >
          {merchants?.find((merch) => merch.id === extraObject.id)
            ?.accompagnements?.length ? (
            <>
              {merchants
                ?.find((merch) => merch.id === extraObject.id)
                ?.accompagnements?.filter((acc) => acc.is_deleted === false)
                .map((acc) => (
                  <Accompagnement
                    key={acc.id}
                    acc={acc}
                    setModalInfo={setModalInfo}
                  />
                ))}
            </>
          ) : (
            <InfoText styleClasses={"md:grid-cols-2"}>
              No accompagnement found ...
            </InfoText>
          )}
        </TitleCard>

        <TitleCard
          title={"Articles"}
          topMargin={"mt-4"}
          containerStyle={""}
          TopSideButtons={<AddArticle />}
        >
          {merchants?.find((merch) => merch.id === extraObject.id)?.articles
            ?.length ? (
            <>
              <div className="btn-group btn-group-vertical md:btn-group-horizontal w-full px-2">
                <button
                  className={`btn btn-sm btn-outline md:w-1/5 ${
                    filterStatus === "ALL" ? "btn-active" : ""
                  }`}
                  onClick={() => setFilterStatus("ALL")}
                >
                  SHOW ALL
                </button>
                <button
                  className={`btn btn-sm btn-outline md:w-1/5 ${
                    filterStatus === "PUBLISHED" ? "btn-active" : ""
                  }`}
                  onClick={() => setFilterStatus("PUBLISHED")}
                >
                  PUBLISHED
                </button>
                <button
                  className={`btn btn-sm btn-outline md:w-1/5 ${
                    filterStatus === "UNPUBLISHED" ? "btn-active" : ""
                  }`}
                  onClick={() => setFilterStatus("UNPUBLISHED")}
                >
                  UNPUBLISHED
                </button>
                <button
                  className={`btn btn-sm btn-outline md:w-1/5 ${
                    filterStatus === "PENDING" ? "btn-active" : ""
                  }`}
                  onClick={() => setFilterStatus("PENDING")}
                >
                  PENDING
                </button>
                <button
                  className={`btn btn-sm btn-outline md:w-1/5 ${
                    filterStatus === "REJECTED" ? "btn-active" : ""
                  }`}
                  onClick={() => setFilterStatus("REJECTED")}
                >
                  REJECTED
                </button>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-3">
                {merchants
                  ?.find((merch) => merch.id === extraObject.id)
                  ?.articles?.filter((article) => {
                    if (filterStatus === "ALL") {
                      return article;
                    } else {
                      return article?.status === filterStatus;
                    }
                  })
                  ?.map((article) => (
                    <Article
                      key={article.id}
                      merchant_id={extraObject?.id}
                      article={article}
                      accompagnements={
                        merchants?.find((merch) => merch.id === extraObject.id)
                          ?.accompagnements || []
                      }
                    />
                  ))}
              </div>
            </>
          ) : (
            <InfoText styleClasses={"md:grid-cols-2"}>
              No article found ...
            </InfoText>
          )}
        </TitleCard>
      </div>
      <div
        className={`modal modal-bottom sm:modal-middle ${
          modalInfo.isOpened ? "modal-open" : ""
        }`}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Are you sure you want to delete the accompagnement{" "}
            <span className="font-semibold text-primary uppercase">
              {modalInfo.name}
            </span>{" "}
            ?
          </h3>
          <div className="modal-action">
            <label
              htmlFor="my-modal-6"
              className="btn btn-outline btn-ghost"
              onClick={() =>
                setModalInfo((oldData) => {
                  return { ...oldData, isOpened: false, id: "", name: "" };
                })
              }
            >
              No
            </label>
            <label
              htmlFor="my-modal-6"
              className="btn btn-outline btn-error"
              onClick={async () => {
                await dispatch(
                  deleteMerchantsAccompagnement({
                    name: modalInfo.name,
                    id: modalInfo.id,
                  }),
                ).then(async (response) => {
                  if (response?.error) {
                    dispatch(
                      showNotification({
                        message: "Error while deleting the accompagnement",
                        status: 0,
                      }),
                    );
                  } else {
                    dispatch(
                      showNotification({
                        message: "Succefully deleted the accompagnement",
                        status: 1,
                      }),
                    );
                    setModalInfo((oldData) => {
                      return { ...oldData, isOpened: false, id: "", name: "" };
                    });
                  }
                });
              }}
            >
              Yes, Proceed
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default MerchantsSettingsDetailView;

const Article = (props) => {
  const dispatch = useDispatch();
  const { merchants, skip, isLoading, noMoreQuery } = useSelector(
    (state) => state.merchant,
  );

  const openMerchantArticle = (obj) => {
    dispatch(
      openRightDrawer({
        header: `Edit Article - ${obj?.article?.id}`,
        bodyType: RIGHT_DRAWER_TYPES.MERCHANT_SETTINGS_ARTICLE,
        extraObject: { ...obj },
      }),
    );
  };

  return (
    <>
      <div
        className="flex flex-col justify-center my-4 hover:cursor-pointer "
        onClick={() =>
          openMerchantArticle({
            article: props?.article,
            merchant_id: props?.merchant_id,
            accompagnements: props?.accompagnements,
            inEditMode: true,
          })
        }
      >
        <div className="relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-lg p-3 max-w-xs md:max-w-4xl mx-auto border border-white bg-white hover:bg-gray-200 w-full">
          <div className="w-full md:w-1/3  grid place-items-center max-h-3">
            <img
              src={props?.article?.image}
              alt="tailwind logo"
              className="rounded-xl h-32 w-32"
              // style={{ objectFit: 'contain' }}
            />
          </div>

          <div className="w-full md:w-2/3  flex flex-col space-y-2 p-3">
            <div className="flex justify-between item-center">
              {/* <p className='text-gray-500 font-medium hidden md:block'>{moment(props?.article?.created_at).format('DD/MM/YYYY')}</p> */}
              <p className="text-gray-500 font-medium hidden md:block">
                {props?.article?.id}
              </p>
              <p
                className={`font-medium hidden capitalize md:block ${
                  props?.article?.status === "PUBLISHED"
                    ? "text-success"
                    : "text-secondary"
                }`}
              >
                {merchants
                  ?.find((merch) => merch.id === props.merchant_id)
                  ?.articles?.find(
                    (article) => article?.id === props?.article?.id,
                  )
                  ?.status?.toLocaleLowerCase()}
              </p>
              {/* <div className='flex items-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-yellow-500'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
							</svg>
							<p className='text-gray-600 font-bold text-sm ml-1'>
								4.96
								<span className='text-gray-500 font-normal'>(76 reviews)</span>
							</p>
						</div>
						<div className=''>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-pink-500'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path
									fillRule='evenodd'
									d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z'
									clipRule='evenodd'
								/>
							</svg>
						</div>
						<div className='bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800 hidden md:block'>Superhost</div> */}
            </div>
            <h3 className="font-black text-gray-800 text-md uppercase">
              {cliTruncate(props?.article?.title, 22)}
            </h3>
            <p className="md:text-lg text-gray-500 text-base lowercase">
              {cliTruncate(
                props?.article?.description || props?.article?.title,
                25,
              )}
            </p>
            <p className="text-sm font-black text-gray-800">
              Price: {props?.article?.price}
              <span className="font-normal text-gray-600 text-sm ml-2">
                FCFA
              </span>
            </p>
            <p className="text-sm font-black text-gray-800">
              Merch. Price: {props?.article?.merchant_price}
              <span className="font-normal text-gray-600 text-sm ml-2">
                FCFA
              </span>
            </p>

            <div
              className="col-span-2 text-base"
              onClick={(e) => e.stopPropagation()}
            >
              <select
                value={
                  merchants
                    ?.find((merch) => merch.id === props.merchant_id)
                    ?.articles?.find(
                      (article) => article?.id === props?.article?.id,
                    )?.status
                }
                className="select select-bordered select-sm w-2/3"
                onChange={async (e) => {
                  console.log(e.target.value);
                  await dispatch(
                    switchArticlePublishFromSettings({
                      articleId: merchants
                        ?.find((merch) => merch.id === props.merchant_id)
                        ?.articles?.find(
                          (article) => article?.id === props?.article?.id,
                        )?.id,
                      status: e.target.value,
                    }),
                  ).then(async (response) => {
                    if (response?.error) {
                      dispatch(
                        showNotification({
                          message:
                            "Error while change the article publish status",
                          status: 0,
                        }),
                      );
                    } else {
                      dispatch(
                        showNotification({
                          message: "Succefully changed the publish status",
                          status: 1,
                        }),
                      );

                      // closeModal();
                    }
                  });
                }}
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="UNPUBLISHED">UNPUBLISHED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
    // <div className='card card-side bg-base-100 shadow-xl my-4 grid grid-cols-4 h-36'>
    // 	<figure className='p-2'>
    // 		<img
    // 			src={props?.image}
    // 			alt='Movie'
    // 			className='rounded-sm'
    // 			style={{
    // 				objectFit: 'contain',
    // 				// overflow: 'hidden',
    // 			}}
    // 		/>
    // 	</figure>
    // 	<div className='card-body col-span-3 my-1'>
    // 		{/* <h2 className='card-title'>{props?.title}</h2> */}
    // 		<div className='grid grid-cols-4 font-semibold'>
    // 			<div className=''>Title</div>
    // 			<div className='col-span-3 text-primary my-1'>{props?.title}</div>
    // 			<div className=''>Prix</div>
    // 			<div className='col-span-3 text-primary my-1'>{props?.price} F CFA</div>
    // 		</div>
    // 		{/* <p>Click the button to watch on Jetflix app.</p> */}
    // 		{/* <div className='card-actions justify-end'>
    // 			<button className='btn btn-primary'>Watch</button>
    // 		</div> */}
    // 	</div>
    // </div>
  );
};

const Accompagnement = (props) => {
  const dispatch = useDispatch();
  const openMerchantAccompagnement = () => {
    // api call to get the client transactions details
    dispatch(
      openRightDrawer({
        header: `Edit Accompagnements`,
        bodyType: RIGHT_DRAWER_TYPES.MERCHANT_SETTINGS_ACCOMPAGNEMENT,
        extraObject: { ...props.acc, inEditMode: true },
      }),
    );
  };

  return (
    <div className="w-full mb-4">
      <div className="alert shadow-lg">
        <div>
          <MdPlaylistAdd className="h-5 w-5" />
          <div>
            <h3 className="font-bold">
              {props.acc.name}{" "}
              <span className="text-sm text-primary">
                on {moment(props.acc.created_at).format("lll")}
              </span>
            </h3>
            <div className="text-xs text-primary font-semibold">
              {props.acc.price || 0} F CFA
            </div>
          </div>
        </div>
        <div className="">
          <button
            className="btn btn-sm btn-outline btn-ghost"
            onClick={openMerchantAccompagnement}
          >
            <MdOutlineModeEditOutline className="h-5 w-5" />
          </button>

          <button className="btn btn-sm btn-outline btn-error">
            <MdOutlineDeleteOutline
              className="h-5 w-5"
              onClick={() =>
                props.setModalInfo((oldData) => {
                  return {
                    ...oldData,
                    isOpened: true,
                    id: props.acc.id,
                    name: props.acc.name,
                  };
                })
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
};
