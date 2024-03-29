import { Address, Bytes, log } from "@graphprotocol/graph-ts";
import {
  ProposalCreated,
  ProposalCanceled,
  ProposalQueued,
  ProposalExecuted,
  VoteCast,
} from "../generated/GovernorAlpha/GovernorAlpha";
import {
  DelegatorCreated,
  Staked,
  Withdrawn,
} from "../generated/DelegatorFactory/DelegatorFactory";
import {
  DelegateChanged,
  DelegateVotesChanged,
  Transfer,
} from "../generated/Ctx/Ctx";
import {
  Delegator,
  DelegatorTokenOwner,
} from "../generated/schema";
import {
  getOrCreateTokenHolder,
  getOrCreateDelegate,
  getOrCreateProposal,
  getOrCreateVote,
  getGovernanceEntity,
} from "./utils/helpers";
import {
  ZERO_ADDRESS,
  BIGINT_ONE,
  BIGINT_ZERO,
  BIGDECIMAL_ZERO,
  STATUS_ACTIVE,
  STATUS_QUEUED,
  STATUS_PENDING,
  STATUS_EXECUTED,
  STATUS_CANCELLED,
} from "./utils/constants";
import { toDecimal } from "./utils/decimals";

// - event: ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)
//   handler: handleProposalCreated

export function handleProposalCreated(event: ProposalCreated): void {
  let proposal = getOrCreateProposal(event.params.id.toString());
  let proposer = getOrCreateDelegate(
    event.params.proposer.toHexString(),
    false
  );

  // checking if the proposer was a delegate already accounted for, if not we should log an error
  // since it shouldn't be possible for a delegate to propose anything without first being "created"
  if (proposer == null) {
    log.error("Delegate {} not found on ProposalCreated. tx_hash: {}", [
      event.params.proposer.toHexString(),
      // @ts-ignore
      event.transaction.hash.toHexString(),
    ]);
  }

  // Creating it anyway since we will want to account for this event data, even though it should've never happened
  proposer = getOrCreateDelegate(event.params.proposer.toHexString());

  let targetsAsBytes = new Array<Bytes>();
  let targetsAsAddress = event.params.targets;
  for (let i = 0; i < targetsAsAddress.length; i++) {
    targetsAsBytes.push(
      Bytes.fromHexString(targetsAsAddress[i].toHexString())
    );
  }

  if (proposer !== null) {
    proposal.proposer = proposer.id;
    proposal.targets = targetsAsBytes;
    proposal.values = event.params.values;
    proposal.signatures = event.params.signatures;
    proposal.calldatas = event.params.calldatas;
    proposal.startBlock = event.params.startBlock;
    proposal.endBlock = event.params.endBlock;
    proposal.description = event.params.description;
    proposal.status = // @ts-ignore
      event.block.number >= proposal.startBlock ? STATUS_ACTIVE : STATUS_PENDING;

    proposal.save();
  }
}

// - event: ProposalCanceled(uint256)
//   handler: handleProposalCanceled

export function handleProposalCanceled(event: ProposalCanceled): void {
  let proposal = getOrCreateProposal(event.params.id.toString());

  proposal.status = STATUS_CANCELLED;
  proposal.save();
}

// - event: ProposalQueued(uint256,uint256)
//   handler: handleProposalQueued

export function handleProposalQueued(event: ProposalQueued): void {
  let governance = getGovernanceEntity();
  let proposal = getOrCreateProposal(event.params.id.toString());

  proposal.status = STATUS_QUEUED;
  proposal.executionETA = event.params.eta;
  proposal.save();

  governance.proposalsQueued = governance.proposalsQueued.plus(BIGINT_ONE);
  governance.save(); 
}

// - event: ProposalExecuted(uint256)
//   handler: handleProposalExecuted

export function handleProposalExecuted(event: ProposalExecuted): void {
  let governance = getGovernanceEntity();
  let proposal = getOrCreateProposal(event.params.id.toString());

  proposal.status = STATUS_EXECUTED;
  proposal.executionETA = null;
  proposal.save();

  governance.proposalsQueued = governance.proposalsQueued.minus(BIGINT_ONE);
  governance.save(); 
}

// - event: VoteCast(address,uint256,bool,uint256)
//   handler: handleVoteCast

export function handleVoteCast(event: VoteCast): void {
  let proposal = getOrCreateProposal(event.params.proposalId.toString());
  let voteId = event.params.voter
    .toHexString()
    .concat("-")
    .concat(event.params.proposalId.toString());
  let vote = getOrCreateVote(voteId);
  let voter = getOrCreateDelegate(event.params.voter.toHexString(), false);

  // checking if the voter was a delegate already accounted for, if not we should log an error
  // since it shouldn't be possible for a delegate to vote without first being "created"
  if (voter == null) {
    log.error("Delegate {} not found on VoteCast. tx_hash: {}", [
      event.params.voter.toHexString(), // @ts-ignore
      event.transaction.hash.toHexString(),
    ]);
  }

  // Creating it anyway since we will want to account for this event data, even though it should've never happened
  voter = getOrCreateDelegate(event.params.voter.toHexString());
  if (voter !== null) {
    vote.proposal = proposal.id;
    vote.voter = voter.id;
    vote.votesRaw = event.params.votes;
    vote.votes = toDecimal(event.params.votes);
    vote.support = event.params.support;

    vote.save();
  }
  if (proposal.status == STATUS_PENDING) {
    proposal.status = STATUS_ACTIVE;
    proposal.save();
  }
}

// - event: DelegateChanged(indexed address,indexed address,indexed address)
//   handler: handleDelegateChanged

export function handleDelegateChanged(event: DelegateChanged): void {
  let tokenHolder = getOrCreateTokenHolder(
    event.params.delegator.toHexString()
  );
  let previousDelegate = getOrCreateDelegate(
    event.params.fromDelegate.toHexString()
  );
  let newDelegate = getOrCreateDelegate(event.params.toDelegate.toHexString());
  
  if (newDelegate !== null) {
    tokenHolder.delegate = newDelegate.id;
    tokenHolder.save();
  }
  if (previousDelegate !== null) {
    previousDelegate.tokenHoldersRepresentedAmount =
      previousDelegate.tokenHoldersRepresentedAmount - 1;
    previousDelegate.save();
  }
  if (newDelegate !== null) {
    newDelegate.tokenHoldersRepresentedAmount =
      newDelegate.tokenHoldersRepresentedAmount + 1;
    newDelegate.save();
  }
}

// - event: DelegateVotesChanged(indexed address,uint256,uint256)
//   handler: handleDelegateVotesChanged

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
  let governance = getGovernanceEntity();
  let delegate = getOrCreateDelegate(event.params.delegate.toHexString());
  let votesDifference = event.params.newBalance.minus(
    event.params.previousBalance
  );
  
  if (delegate !== null) {
    delegate.delegatedVotesRaw = event.params.newBalance;
    delegate.delegatedVotes = toDecimal(event.params.newBalance);
    delegate.save();
  }

  if (
    event.params.previousBalance == BIGINT_ZERO &&
    event.params.newBalance > BIGINT_ZERO
  ) {
    governance.currentDelegates = governance.currentDelegates.plus(BIGINT_ONE);
  }
  if (event.params.newBalance == BIGINT_ZERO) {
    governance.currentDelegates = governance.currentDelegates.minus(BIGINT_ONE);
  }
  governance.delegatedVotesRaw = governance.delegatedVotesRaw.plus(
    votesDifference
  );
  governance.delegatedVotes = toDecimal(governance.delegatedVotesRaw);
  governance.save();
}

// - event: Transfer(indexed address,indexed address,uint256)
//   handler: handleTransfer

export function handleTransfer(event: Transfer): void {
  let fromHolder = getOrCreateTokenHolder(event.params.from.toHexString());
  let toHolder = getOrCreateTokenHolder(event.params.to.toHexString());
  let governance = getGovernanceEntity();

  // fromHolder
  if (event.params.from.toHexString() != ZERO_ADDRESS) {
    let fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
    fromHolder.tokenBalanceRaw = fromHolder.tokenBalanceRaw.minus(
      event.params.amount
    );
    fromHolder.tokenBalance = toDecimal(fromHolder.tokenBalanceRaw);

    if (fromHolder.tokenBalanceRaw < BIGINT_ZERO) {
      log.error("Negative balance on holder {} with balance {}", [
        fromHolder.id,
        fromHolder.tokenBalanceRaw.toString(),
      ]);
    }

    if (
      fromHolder.tokenBalanceRaw == BIGINT_ZERO &&
      fromHolderPreviousBalance > BIGINT_ZERO
    ) {
      governance.currentTokenHolders = governance.currentTokenHolders.minus(
        BIGINT_ONE
      );
      governance.save();
    } else if (
      fromHolder.tokenBalanceRaw > BIGINT_ZERO &&
      fromHolderPreviousBalance == BIGINT_ZERO
    ) {
      governance.currentTokenHolders = governance.currentTokenHolders.plus(
        BIGINT_ONE
      );
      governance.save();
    }

    fromHolder.save();
  }

  // toHolder
  let toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw.plus(event.params.amount);
  toHolder.tokenBalance = toDecimal(toHolder.tokenBalanceRaw);
  toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw.plus(
    event.params.amount
  );
  toHolder.totalTokensHeld = toDecimal(toHolder.totalTokensHeldRaw);

  if (
    toHolder.tokenBalanceRaw == BIGINT_ZERO &&
    toHolderPreviousBalance > BIGINT_ZERO
  ) {
    governance.currentTokenHolders = governance.currentTokenHolders.minus(
      BIGINT_ONE
    );
    governance.save();
  } else if (
    toHolder.tokenBalanceRaw > BIGINT_ZERO &&
    toHolderPreviousBalance == BIGINT_ZERO
  ) {
    governance.currentTokenHolders = governance.currentTokenHolders.plus(
      BIGINT_ONE
    );
    governance.save();
  }

  toHolder.save();
}

export function handleDelegatorCreated(event: DelegatorCreated): void {
  let delegator = new Delegator(event.params.delegator.toHexString());

  delegator.delegatee = event.params.delegatee;
  delegator.delegatedVotesRaw = BIGINT_ZERO;
  delegator.delegatedVotes = BIGDECIMAL_ZERO;
  delegator.totalHoldersRepresented = 0;
  delegator.save();
}

export function handleStaked(event: Staked): void {
  let delegator = Delegator.load(event.params.delegator.toHexString());
  
  if (delegator != null) {
    delegator.delegatedVotesRaw = delegator.delegatedVotesRaw.plus(event.params.amount);
    delegator.delegatedVotes = delegator.delegatedVotes.plus(toDecimal(event.params.amount));
    
    let tdId = event.params.delegator.toHexString() + "-" + event.params.delegatee.toHexString();
    let delegatorTokenOwner = DelegatorTokenOwner.load(tdId);
    if (delegatorTokenOwner != null) {
      delegatorTokenOwner.stake = delegatorTokenOwner.stake.plus(toDecimal(event.params.amount));
      delegatorTokenOwner.stakeRaw = delegatorTokenOwner.stakeRaw.plus(event.params.amount);
    }
    else {
      delegatorTokenOwner = new DelegatorTokenOwner(tdId);
      delegatorTokenOwner.tokenOwner = event.params.delegatee;
      delegatorTokenOwner.delegator = delegator.id;
      delegatorTokenOwner.stake = toDecimal(event.params.amount);
      delegatorTokenOwner.stakeRaw = event.params.amount;
      delegator.totalHoldersRepresented = delegator.totalHoldersRepresented + 1;
    }
    delegator.save();
    delegatorTokenOwner.save();
  }
}

export function handleWithdrawn(event: Withdrawn): void {
  let delegator = Delegator.load(event.params.delegator.toHexString());

  if (delegator != null) {
    delegator.delegatedVotesRaw = delegator.delegatedVotesRaw.minus(event.params.amount);
    delegator.delegatedVotes = delegator.delegatedVotes.minus(toDecimal(event.params.amount));
    
    let tdId = event.params.delegator.toHexString() + "-" + event.params.delegatee.toHexString();
    let delegatorTokenOwner = DelegatorTokenOwner.load(tdId);
    if (delegatorTokenOwner != null) {
      let newStakeRaw = delegatorTokenOwner.stakeRaw.minus(event.params.amount);
      delegatorTokenOwner.stake = delegatorTokenOwner.stake.minus(toDecimal(event.params.amount));
      delegatorTokenOwner.stakeRaw = newStakeRaw;
      delegatorTokenOwner.save();

      if (newStakeRaw == BIGINT_ZERO) {
        delegator.totalHoldersRepresented = delegator.totalHoldersRepresented  - 1;
      }
    }
    delegator.save();
  }
}

