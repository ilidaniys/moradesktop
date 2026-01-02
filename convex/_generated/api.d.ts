/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics_getAreaHealth from "../analytics/getAreaHealth.js";
import type * as analytics_getChunkStats from "../analytics/getChunkStats.js";
import type * as analytics_getCompletionRates from "../analytics/getCompletionRates.js";
import type * as areas_create from "../areas/create.js";
import type * as areas_delete from "../areas/delete.js";
import type * as areas_get from "../areas/get.js";
import type * as areas_list from "../areas/list.js";
import type * as areas_update from "../areas/update.js";
import type * as chunks_create from "../chunks/create.js";
import type * as chunks_createBatch from "../chunks/createBatch.js";
import type * as chunks_delete from "../chunks/delete.js";
import type * as chunks_listByIntention from "../chunks/listByIntention.js";
import type * as chunks_listReadyChunks from "../chunks/listReadyChunks.js";
import type * as chunks_update from "../chunks/update.js";
import type * as chunks_updateStatus from "../chunks/updateStatus.js";
import type * as dayPlans_addItem from "../dayPlans/addItem.js";
import type * as dayPlans_complete from "../dayPlans/complete.js";
import type * as dayPlans_create from "../dayPlans/create.js";
import type * as dayPlans_finalize from "../dayPlans/finalize.js";
import type * as dayPlans_get from "../dayPlans/get.js";
import type * as dayPlans_getByDate from "../dayPlans/getByDate.js";
import type * as dayPlans_removeItem from "../dayPlans/removeItem.js";
import type * as dayPlans_reorderItems from "../dayPlans/reorderItems.js";
import type * as intentions_checkLimit from "../intentions/checkLimit.js";
import type * as intentions_create from "../intentions/create.js";
import type * as intentions_delete from "../intentions/delete.js";
import type * as intentions_listByArea from "../intentions/listByArea.js";
import type * as intentions_reorder from "../intentions/reorder.js";
import type * as intentions_update from "../intentions/update.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "analytics/getAreaHealth": typeof analytics_getAreaHealth;
  "analytics/getChunkStats": typeof analytics_getChunkStats;
  "analytics/getCompletionRates": typeof analytics_getCompletionRates;
  "areas/create": typeof areas_create;
  "areas/delete": typeof areas_delete;
  "areas/get": typeof areas_get;
  "areas/list": typeof areas_list;
  "areas/update": typeof areas_update;
  "chunks/create": typeof chunks_create;
  "chunks/createBatch": typeof chunks_createBatch;
  "chunks/delete": typeof chunks_delete;
  "chunks/listByIntention": typeof chunks_listByIntention;
  "chunks/listReadyChunks": typeof chunks_listReadyChunks;
  "chunks/update": typeof chunks_update;
  "chunks/updateStatus": typeof chunks_updateStatus;
  "dayPlans/addItem": typeof dayPlans_addItem;
  "dayPlans/complete": typeof dayPlans_complete;
  "dayPlans/create": typeof dayPlans_create;
  "dayPlans/finalize": typeof dayPlans_finalize;
  "dayPlans/get": typeof dayPlans_get;
  "dayPlans/getByDate": typeof dayPlans_getByDate;
  "dayPlans/removeItem": typeof dayPlans_removeItem;
  "dayPlans/reorderItems": typeof dayPlans_reorderItems;
  "intentions/checkLimit": typeof intentions_checkLimit;
  "intentions/create": typeof intentions_create;
  "intentions/delete": typeof intentions_delete;
  "intentions/listByArea": typeof intentions_listByArea;
  "intentions/reorder": typeof intentions_reorder;
  "intentions/update": typeof intentions_update;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
