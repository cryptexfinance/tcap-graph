import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export const STATUS_PENDING = "PENDING";
export const STATUS_CANCELLED = "CANCELLED";
export const STATUS_EXECUTED = "EXECUTED";
export const STATUS_QUEUED = "QUEUED";
export const STATUS_ACTIVE = "ACTIVE";
export const PROTOCOL_ENTITY_ALL_ID = "0"
export const PROTOCOL_ENTITY_ETH_ID = "1"
export const PROTOCOL_ENTITY_ERC_ID = "2"
export const PROTOCOL_ENTITY_AAVE_ID = "3"
export const PROTOCOL_ENTITY_LINK_ID = "4"
export const SUMMARY_STATUS_EMPTY = "EMPTY"
export const SUMMARY_STATUS_READY = "READY"
export const SUMMARY_STATUS_ACTIVE = "ACTIVE"