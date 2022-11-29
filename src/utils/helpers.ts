import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenHolder,
  Delegate,
  Proposal,
  Governance,
  Protocol,
  Vote,
  State
} from "../../generated/schema";
import {
  ZERO_ADDRESS,
  BIGINT_ZERO,
  BIGINT_ONE,
  BIGDECIMAL_ZERO,
} from "./constants";
import {
  getTokenAddress,
  getTokenName,
  getTokenSymbol,
  getTokenDecimals
} from "./tokens"

export function getOrCreateTokenHolder(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): TokenHolder {
  let tokenHolder = TokenHolder.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new TokenHolder(id);
    tokenHolder.tokenBalanceRaw = BIGINT_ZERO;
    tokenHolder.tokenBalance = BIGDECIMAL_ZERO;
    tokenHolder.totalTokensHeldRaw = BIGINT_ZERO;
    tokenHolder.totalTokensHeld = BIGDECIMAL_ZERO;

    if (id != ZERO_ADDRESS) {
      let governance = getGovernanceEntity();
      governance.totalTokenHolders = governance.totalTokenHolders.plus(
        BIGINT_ONE
      );
      governance.save();
    }

    if (save) {
      tokenHolder.save();
    }
  }

  return tokenHolder as TokenHolder;
}

export function getOrCreateDelegate(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): Delegate | null {
  let delegate = Delegate.load(id);

  if (delegate == null && createIfNotFound) {
    delegate = new Delegate(id);
    delegate.delegatedVotesRaw = BIGINT_ZERO;
    delegate.delegatedVotes = BIGDECIMAL_ZERO;
    delegate.tokenHoldersRepresentedAmount = 0;

    if (id != ZERO_ADDRESS) {
      let governance = getGovernanceEntity();
      governance.totalDelegates = governance.totalDelegates.plus(BIGINT_ONE);
      governance.save();
    }

    if (save) {
      delegate.save();
    }
  }

  return delegate;
}

export function getOrCreateVote(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false
): Vote {
  let vote = Vote.load(id);

  if (vote == null && createIfNotFound) {
    vote = new Vote(id);

    if (save) {
      vote.save();
    }
  }

  return vote as Vote;
}

export function getOrCreateProposal(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false
): Proposal {
  let proposal = Proposal.load(id);

  if (proposal == null && createIfNotFound) {
    proposal = new Proposal(id);

    let governance = getGovernanceEntity();

    governance.proposals = governance.proposals.plus(BIGINT_ONE);
    governance.save();

    if (save) {
      proposal.save();
    }
  }

  return proposal as Proposal;
}

export function getGovernanceEntity(): Governance {
  let governance = Governance.load("GOVERNANCE");
  
  if (governance == null) {
    governance = new Governance("GOVERNANCE");
    governance.proposals = BIGINT_ZERO;
    governance.totalTokenHolders = BIGINT_ZERO;
    governance.currentTokenHolders = BIGINT_ZERO;
    governance.currentDelegates = BIGINT_ZERO;
    governance.totalDelegates = BIGINT_ZERO;
    governance.delegatedVotesRaw = BIGINT_ZERO;
    governance.delegatedVotes = BIGDECIMAL_ZERO;
    governance.proposalsQueued = BIGINT_ZERO;
  }

  return governance as Governance;
}

export function updateVaultCreated(network: string, id: string, address: Address): void {
  let protocol = Protocol.load(id);
  if (protocol == null) {
    protocol = new Protocol(id);
    protocol.address = address;
    protocol.totalCollateral = BigInt.fromI32(0);
    protocol.totalDebt = BigInt.fromI32(0);
    protocol.totalBurnFee = BigInt.fromI32(0);
    protocol.createdVaults = BigInt.fromI32(1);
    protocol.totalTransactions = BigInt.fromI32(1);
    
    let token = Token.load(id);
    if (token == null) {
      token = new Token(id);
      token.address = getTokenAddress(network, id);
      token.name = getTokenName(id);
      token.symbol = getTokenSymbol(id);
      token.decimals = getTokenDecimals(id);
      token.save()

      protocol.underlyingToken = token.id;
    }
  }
  else {
    protocol.createdVaults = protocol.createdVaults.plus(BigInt.fromI32(1));
    protocol.totalTransactions = protocol.totalTransactions.plus(BigInt.fromI32(1));
  }
    
  protocol.save();
}

export function updateVaultCollateralTotals(id: string, address: Address, collateral: BigInt, isAdding: boolean): void {
  let protocol = Protocol.load(id);
  if (protocol == null) {
    protocol = new Protocol(id);
    protocol.address = address;    
  }
  protocol.totalTransactions = protocol.totalTransactions.plus(
    BigInt.fromI32(1)
  );
  if (isAdding) 
    protocol.totalCollateral = protocol.totalCollateral.plus(collateral) 
  else 
    protocol.totalCollateral = protocol.totalCollateral.minus(collateral) 

  protocol.save()
}

export function updateVaultDebtTotals(id: string, address: Address, debt: BigInt, minting: boolean, burnFee: BigInt): void {
  let protocol = Protocol.load(id);
  if (protocol == null) {
    protocol = new Protocol(id);
    protocol.address = address;
  }
  protocol.totalTransactions = protocol.totalTransactions.plus(
    BigInt.fromI32(1)
  );
  if (minting)
    protocol.totalDebt = protocol.totalDebt.plus(debt);
  else {
    protocol.totalDebt = protocol.totalDebt.minus(debt);
    protocol.totalBurnFee = protocol.totalBurnFee.plus(burnFee)
  }
    
  protocol.save()
}

export function addToStateAmountStaked(address: Address, amount: BigInt): void {
  let state = State.load(address.toHex());
  if (state != null) {
    if (state.amountStaked) {
      state.amountStaked = state.amountStaked.plus(amount);
    } else {
      state.amountStaked = amount;
    }
    state.save();
  }
}

export function substractFromStateAmountStaked(address: Address, amount: BigInt): void {
  let state = State.load(address.toHex());
  if (state != null) {
    if (state.amountStaked) {
      state.amountStaked = state.amountStaked.minus(amount);
      state.save();
    }
  }
}
