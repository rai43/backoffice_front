import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { REQUEST_QUERY_CONSTANTS } from "../../utils/globalConstantUtil";

export const getMerchantsArticlesContent = createAsyncThunk(
  "/merchants-article/content",
  async (params) => {
    const skip = params.skip;
    const active = params.active;
    const deleted = params.deleted;
    const direction = params.direction || "DESC";
    const limit = params.limit || 1000;
    const searchPattern = params.searchPattern || "";
    const merchantId = params.merchantId || 0;
    const articleStatus = params.status || "";
    const availability = params.availability || "";

    const status =
      active && deleted
        ? REQUEST_QUERY_CONSTANTS.ALL
        : active && !deleted
        ? REQUEST_QUERY_CONSTANTS.STATUS_ACTIVE.IS_ACTIVE
        : !active && deleted
        ? REQUEST_QUERY_CONSTANTS.STATUS_DELETED.IS_DELETED
        : REQUEST_QUERY_CONSTANTS.NOTHING;

    const response = await axios.get(`/api/articles/get-articles`, {
      params: {
        status: status,
        searchPattern: searchPattern,
        direction: direction,
        merchantId,
        articleStatus,
        availability,
        skip: skip,
        limit: limit,
      },
    });
    // const response = await axios.get(`/api/merchants-ordering/get-merchants`, {
    // 	params: {
    // 		status: status,
    // 		searchPattern: searchPattern,
    // 		direction: direction,
    // 		skip: skip,
    // 		limit: limit,
    // 	},
    // });

    console.log("getMerchantsArticlesContent");
    console.log(response);
    return response.data;
  },
);

export const saveMenu = createAsyncThunk(
  "/merchants-article/save-menu",
  async (params) => {
    try {
      const formData = new FormData();
      console.log(params);
      formData.append("title", JSON.stringify(params.title.trim()));
      formData.append("price", JSON.stringify(parseInt(params.price)));
      formData.append(
        "merchant_price",
        JSON.stringify(parseInt(params.merchantPrice)),
      );
      formData.append("description", JSON.stringify(params.description.trim()));
      formData.append("image", params.image);
      formData.append("merchant_id", JSON.stringify(params.merchant_id));

      const accompagnements = Object.keys(params?.accs).map((accKey) => {
        if (params?.accs[accKey]) return accKey;
      });
      const supplements = Object.keys(params?.supps).map((suppKey) => {
        const dataObj = params?.supps[suppKey];
        if (dataObj?.status && parseInt(dataObj?.price) > 0)
          return {
            accompagnement_id: parseInt(suppKey),
            accompagnement_price: parseInt(dataObj?.price),
          };
      });

      formData.append("accompagnements", JSON.stringify(accompagnements));
      formData.append("supplements", JSON.stringify(supplements));

      const response = await axios.post(
        `/api/articles/save-article`,
        formData,
        {
          headers: {
            "Content-type": "multipart/form-data",
          },
        },
      );
      console.log(response);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  },
);

export const updateMenu = createAsyncThunk(
  "/merchants-article/update-article",
  async (params) => {
    try {
      let response;
      if (
        !params?.image?.size &&
        params?.image?.includes("https://res.cloudinary.com/")
      ) {
        console.log(params);
        const title = params.title;
        const price = params.price;
        const merchantPrice = params.merchantPrice;
        const description = params.description;
        const merchant_id = params.merchant_id;
        const article_id = params.article_id;

        const accompagnements = Object.keys(params?.accs).map((accKey) => {
          if (params?.accs[accKey]) return accKey;
        });
        const supplements = Object.keys(params?.supps).map((suppKey) => {
          const dataObj = params?.supps[suppKey];
          if (dataObj?.status && parseInt(dataObj?.price) > 0)
            return {
              accompagnement_id: parseInt(suppKey),
              accompagnement_price: parseInt(dataObj?.price),
            };
        });
        const payload = JSON.stringify({
          title,
          price,
          merchant_price: merchantPrice,
          description,
          merchant_id,
          accompagnements,
          supplements: supplements,
        });
        console.log(payload);

        response = await axios.post(
          `/api/articles/update-article/${article_id}`,
          payload,
        );
      } else {
        const formData = new FormData();
        formData.append("title", JSON.stringify(params.title.trim()));
        formData.append("price", JSON.stringify(parseInt(params.price)));
        formData.append(
          "merchant_price",
          JSON.stringify(parseInt(params.merchantPrice)),
        );
        formData.append(
          "description",
          JSON.stringify(params.description.trim()),
        );
        formData.append("image", params.image);
        formData.append("merchant_id", JSON.stringify(params.merchant_id));
        formData.append("article_id", JSON.stringify(params.article_id));

        const accompagnements = Object.keys(params?.accs).map((accKey) => {
          if (params?.accs[accKey]) return accKey;
        });
        const supplements = Object.keys(params?.supps).map((suppKey) => {
          const dataObj = params?.supps[suppKey];
          if (dataObj?.status && parseInt(dataObj?.price) > 0)
            return {
              accompagnement_id: parseInt(suppKey),
              accompagnement_price: parseInt(dataObj?.price),
            };
        });

        formData.append("accompagnements", JSON.stringify(accompagnements));
        formData.append("supplements", JSON.stringify(supplements));

        response = await axios.post(
          `/api/articles/update-article-with-image/${params?.article_id}`,
          formData,
          {
            headers: {
              "Content-type": "multipart/form-data",
            },
          },
        );
      }
      console.log(response);
      return response.data;
    } catch (e) {
      throw new Error(e.statusText);
    }
  },
);

export const getMerchantsBySearch = createAsyncThunk(
  "/merchants/merchant-search",
  async (params) => {
    const searchPattern = params.searchPattern || "";

    const response = await axios.get(
      "/api/merchants-ordering/get-merchants-by-search",
      {
        params: {
          searchPattern: searchPattern,
        },
      },
    );
    return response.data.merchants;
  },
);

export const switchArticleStatus = createAsyncThunk(
  "/merchants/switch-article-status",
  async (params) => {
    const articleId = params.articleId || "";

    const response = await axios.patch(
      `/api/articles/switch-article-availability/${articleId}`,
      {},
    );
    return response.data;
  },
);

export const switchArticlePublish = createAsyncThunk(
  "/merchants/switch-article-publish",
  async (params) => {
    const articleId = params.articleId || "";
    const status = params.status;

    const response = await axios.patch(
      `/api/articles/switch-article-published/${articleId}/${status}`,
      {},
    );
    return response.data;
  },
);

export const merchantsSlice = createSlice({
  name: "articles",
  initialState: {
    isLoading: false,
    articles: [],
    searchedMerchants: [],
    skip: 0,
    noMoreQuery: false,
    totalCount: 0,
  },
  reducers: {
    resetFrom: (state) => {
      state.skip = 0;
      state.articles = [];
      state.searchedMerchants = [];
      state.noMoreQuery = false;
    },
  },

  extraReducers: {
    [getMerchantsArticlesContent.pending]: (state) => {
      state.isLoading = true;
    },
    [getMerchantsArticlesContent.fulfilled]: (state, action) => {
      // Append the newly fetched users to the list
      state.articles = [...state.articles, ...(action.payload.articles || [])];
      if (state.totalCount !== action.payload.totalCount) {
        state.totalCount = action.payload.totalCount;
      }
      if (state.skip === action.payload.skip) {
        state.noMoreQuery = true;
      } else {
        state.skip = action.payload.skip;
      }
      state.isLoading = false;
    },
    [getMerchantsArticlesContent.rejected]: (state) => {
      state.isLoading = false;
    },

    [saveMenu.pending]: (state) => {
      state.isLoading = true;
    },
    [saveMenu.fulfilled]: (state, action) => {
      state.articles = [action.payload?.article, ...state.articles];

      state.isLoading = false;
    },
    [saveMenu.rejected]: (state) => {
      state.isLoading = false;
    },

    [updateMenu.pending]: (state) => {
      state.isLoading = true;
    },
    [updateMenu.fulfilled]: (state, action) => {
      const indexToRemoved = state.articles.findIndex(
        (article) => article.id === action.payload?.article?.id,
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.articles[indexToRemoved] = action.payload?.article;
      }
      state.isLoading = false;

      state.isLoading = false;
    },
    [updateMenu.rejected]: (state) => {
      state.isLoading = false;
    },

    [getMerchantsBySearch.pending]: (state) => {
      state.isLoading = true;
    },
    [getMerchantsBySearch.fulfilled]: (state, action) => {
      // Append the newly fetched users to the list
      console.log(action.payload);
      state.searchedMerchants = [...(action.payload || [])];
      state.isLoading = false;
    },
    [getMerchantsBySearch.rejected]: (state) => {
      state.isLoading = false;
    },

    [switchArticleStatus.pending]: (state) => {
      state.isLoading = true;
    },
    [switchArticleStatus.fulfilled]: (state, action) => {
      const indexToRemoved = state.articles.findIndex(
        (article) => article.id === action.payload?.article?.id,
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.articles[indexToRemoved] = action.payload?.article;
      }
      state.isLoading = false;
    },
    [switchArticleStatus.rejected]: (state) => {
      state.isLoading = false;
    },

    [switchArticlePublish.pending]: (state) => {
      state.isLoading = true;
    },
    [switchArticlePublish.fulfilled]: (state, action) => {
      console.log(action.payload);
      const indexToRemoved = state.articles.findIndex(
        (article) => article.id === action.payload?.article?.id,
      );

      // If the object is found, replace it with the new object
      if (indexToRemoved !== -1) {
        state.articles[indexToRemoved] = action.payload?.article;
      }
      state.isLoading = false;
    },
    [switchArticlePublish.rejected]: (state) => {
      state.isLoading = false;
    },
  },
});

export const { resetFrom } = merchantsSlice.actions;

export default merchantsSlice.reducer;
