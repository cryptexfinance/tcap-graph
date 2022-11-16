import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { BIGINT_ONE, BIGINT_ZERO, BIGDECIMAL_ZERO, BIGDECIMAL_ONE }from "./constants";

export const DEFAULT_DECIMALS = 18;

export function pow(base: BigDecimal, exponent: number): BigDecimal {
  let result = base;

  if (exponent == 0) {
    return BigDecimal.fromString("1");
  }

  for (let i = 2; i <= exponent; i++) {
    result = result.times(base);
  }

  return result;
}

export function toDecimal(
  value: BigInt,
  decimals: number = DEFAULT_DECIMALS
): BigDecimal {
  let precision = BigInt.fromI32(10) // @ts-ignore
    .pow(<u8>decimals)
    .toBigDecimal();

  return value.divDecimal(precision);
}

// return 0 if denominator is 0 in division
export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(BIGDECIMAL_ZERO)) {
    return BIGDECIMAL_ZERO;
  } else {
    return amount0.div(amount1);
  }
}

export function bigDecimalExponated(value: BigDecimal, power: BigInt): BigDecimal {
  if (power.equals(BIGINT_ZERO)) {
    return BIGDECIMAL_ONE;
  }
  let negativePower = power.lt(BIGINT_ZERO);
  let result = BIGDECIMAL_ZERO.plus(value);
  let powerAbs = power.abs();
  for (let i = BIGINT_ONE; i.lt(powerAbs); i = i.plus(BIGINT_ONE)) {
    result = result.times(value);
  }

  if (negativePower) {
    result = safeDiv(BIGDECIMAL_ONE, result);
  }

  return result
}
