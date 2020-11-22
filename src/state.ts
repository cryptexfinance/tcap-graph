import {
  LogInitializeVault,
  LogSetBurnFee,
  LogSetLiquidationPenalty,
  LogSetRatio,
  OwnershipTransferred,
  Paused,
} from "../generated/State/ERC20Vault";
import { State } from "../generated/schema";
import { dataSource } from "@graphprotocol/graph-ts";

export function handleLogInitializeVault(event: LogInitializeVault): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
  }
  state.collateralContract = event.params._collateralAddress;
  state.collateralOracle = event.params._collateralOracle;
  state.divisor = event.params._divisor;
  state.ethContract = event.params._ethOracle;
  state.liquidationPenalty = event.params._liquidationPenalty;
  state.tcapContract = event.params._tcapAddress;
  state.tcapOracle = event.params._tcapOracle;
  state.ratio = event.params._ratio;
  state.burnFee = event.params._burnFee;
  state.isPaused = false;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogSetBurnFee(event: LogSetBurnFee): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params._owner;
  }
  state.burnFee = event.params._burnFee;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogSetLiquidationPenalty(
  event: LogSetLiquidationPenalty
): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params._owner;
  }
  state.liquidationPenalty = event.params._liquidationPenalty;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleLogSetRatio(event: LogSetRatio): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params._owner;
  }
  state.ratio = event.params._ratio;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
  }
  state.owner = event.params.newOwner;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handlePaused(event: Paused): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params.account;
  }
  state.isPaused = true;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleUnpaused(event: Paused): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params.account;
  }
  state.isPaused = false;
  // Entities can be written to the store with `.save()`
  state.save();
}
