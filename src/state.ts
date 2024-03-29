import {
  NewBurnFee,
  NewLiquidationPenalty,
  NewRatio,
  NewTreasury,
  NewRewardHandler,
  OwnershipTransferred,
  Paused,
} from "../generated/State/ERC20Vault";
import { State } from "../generated/schema";
import { dataSource } from "@graphprotocol/graph-ts";
import { BIGINT_ZERO } from "./utils/constants";

export function handleNewBurnFee(event: NewBurnFee): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.amountStaked = BIGINT_ZERO;
    state.owner = event.params._owner;
  }
  state.burnFee = event.params._burnFee;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleNewLiquidationPenalty(
  event: NewLiquidationPenalty
): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.amountStaked = BIGINT_ZERO;
    state.owner = event.params._owner;
  }
  state.liquidationPenalty = event.params._liquidationPenalty;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleNewRatio(event: NewRatio): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.amountStaked = BIGINT_ZERO;
    state.owner = event.params._owner;
  }
  state.ratio = event.params._ratio;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleNewTreasury(event: NewTreasury): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.amountStaked = BIGINT_ZERO;
    state.owner = event.params._owner;
  }
  state.treasuryContract = event.params._tresury;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleNewRewardHandler(event: NewRewardHandler): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.amountStaked = BIGINT_ZERO;
    state.owner = event.params._owner;
  }
  state.rewardContract = event.params._rewardHandler;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.amountStaked = BIGINT_ZERO;
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
    state.amountStaked = BIGINT_ZERO;
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
    state.amountStaked = BIGINT_ZERO;
  }
  state.isPaused = false;
  // Entities can be written to the store with `.save()`
  state.save();
}
