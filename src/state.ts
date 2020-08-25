import {
  BigInt,
  DataSourceContext,
  DataSourceTemplate,
  dataSource,
} from "@graphprotocol/graph-ts";
import {
  Contract,
  LogSetBurnFee,
  LogSetCollateralContract,
  LogSetCollateralPriceOracle,
  LogSetDivisor,
  LogSetLiquidationPenalty,
  LogSetRatio,
  LogSetTCAPOracle,
  LogSetTCAPXContract,
  LogEnableWhitelist,
} from "../generated/Contract/Contract";
import { State } from "../generated/schema";

export function handleLogSetBurnFee(event: LogSetBurnFee): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.burnFee = event.params._burnFee;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handlLogSetCollateralContract(
  event: LogSetCollateralContract
): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.collateralContract = event.params._collateralContract;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handlLogSetCollateralPriceOracle(
  event: LogSetCollateralPriceOracle
): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.ethContract = event.params._priceOracle;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogSetDivisor(event: LogSetDivisor): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.divisor = event.params._divisor;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogSetLiquidationPenalty(
  event: LogSetLiquidationPenalty
): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.liquidationPenalty = event.params._liquidationPenalty;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogSetRatio(event: LogSetRatio): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.ratio = event.params._ratio;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogSetTCAPOracle(event: LogSetTCAPOracle): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.tcapOracle = event.params._oracle;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogSetTCAPXContract(event: LogSetTCAPXContract): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.tcapContract = event.params._token;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogEnableWhitelist(event: LogEnableWhitelist): void {
  let state = State.load("0");

  if (state == null) {
    state = new State("0");
    state.owner = event.params._owner;
  }
  state.hasWishlist = event.params._enable;
  // Entities can be written to the store with `.save()`
  state.save();
}
