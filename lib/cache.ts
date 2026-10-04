// Compatibility names retained for callers; mutable chain state must be fresh.
import { getAssetOrders, getSubassets } from './api';
export const getCachedSubassets = getSubassets;
export const getCachedOrders = getAssetOrders;
