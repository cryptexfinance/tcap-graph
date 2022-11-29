import { Address, BigInt, BigDecimal, dataSource, log, ethereum } from "@graphprotocol/graph-ts"
/* eslint-disable prefer-const */
import {
  DecreaseLiquidity,
  IncreaseLiquidity,
  NonfungiblePositionManager,
  Transfer
} from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import {
  TokenStaked,
  TokenUnstaked
} from "../generated/NonfungiblePositionManager/UniswapV3Staker";
import { Swap } from "../generated/UniswapV3Pool/Pool";
import {
  Pool as TcapPool
} from "../generated/UniswapV3Staker/Pool";
import {
  TcapOracle
} from "../generated/UniswapV3Staker/TcapOracle";
import {
  WethOracle
} from "../generated/UniswapV3Staker/WethOracle";
import { APR, Position, Tick } from "../generated/schema";
import {
  factoryContract,
  BIGINT_ZERO,
  BIGDECIMAL_ONE,
  TCAP_ORACLE_ADDRESS,
  TCAP_ORACLE_ADDRESS_R,
  WETH_ORACLE_ADDRESS,
  WETH_ORACLE_ADDRESS_R,
  UNIV3_ETH_TCAP_POOL,
  UNIV3_ETH_TCAP_POOL_R,
  UNIV3_POSITION_MANAGER_ADDRESS
} from "./utils/constants";
import { bigDecimalExponated, safeDiv } from "./utils/decimals";

let APR_ID = "2"
let APR_BLOCK_NUMBER = BigInt.fromI32(15998870);
let DIVISOR_18 = bigDecimalExponated(BigDecimal.fromString("10"), BigInt.fromI32(18))
let DIVISOR_8 = bigDecimalExponated(BigDecimal.fromString("10"), BigInt.fromI32(8))
  

function createTick(tickId: string, tickIdx: BigInt, poolAddress: string, event: ethereum.Event): void {
  let tick = new Tick(tickId);
  tick.tickIdx = tickIdx;
  tick.poolAddress = poolAddress;

  tick.createdAtTimestamp = event.block.timestamp;
  tick.createdAtBlockNumber = event.block.number;

  tick.price0 = BIGDECIMAL_ONE;
  tick.price1 = BIGDECIMAL_ONE;

  // 1.0001^tick is token1/token0.
  let price0 = bigDecimalExponated(BigDecimal.fromString("1.0001"), tickIdx);
  tick.price0 = price0;
  tick.price1 = safeDiv(BIGDECIMAL_ONE, price0);

  tick.save();
}

function getOrCreatePosition(event: ethereum.Event, tokenId: BigInt, owner: String): Position | null {
  let position = Position.load(tokenId.toString())
  if (position === null) {
    let contract = NonfungiblePositionManager.bind(event.address)
    let positionCall = contract.try_positions(tokenId)

    if (!positionCall.reverted) {
      let positionResult = positionCall.value
      let poolAddress = factoryContract.getPool(positionResult.value2, positionResult.value3, positionResult.value4)

      // only cryptex pools
      let tcapPool = UNIV3_ETH_TCAP_POOL;
      /* if (dataSource.network() == "rinkeby") {
        tcapPool = UNIV3_ETH_TCAP_POOL_R;
      } */
      if (!poolAddress.equals(Address.fromHexString(tcapPool))) {
        return null;
      }

      // create tick
      let tickLowerId = poolAddress.toHexString().concat("#").concat(positionResult.value5.toString());
      let tickUpperId = poolAddress.toHexString().concat("#").concat(positionResult.value6.toString());
      createTick(tickLowerId, BigInt.fromI32(positionResult.value5), poolAddress.toHexString(), event);
      createTick(tickUpperId, BigInt.fromI32(positionResult.value6), poolAddress.toHexString(), event);

      position = new Position(tokenId.toString())
      // The owner gets correctly updated in the Transfer handler
      position.owner = owner.toString();
      position.poolAddress = poolAddress.toHexString();
      position.staked = false;
      position.stakedBlockNumber = BIGINT_ZERO;
      position.token0 = positionResult.value2;
      position.token1 = positionResult.value3;
      position.tickLower = tickLowerId;
      position.tickUpper = tickUpperId;
      position.liquidity = BIGINT_ZERO;
      position.depositedToken0 = BIGINT_ZERO;
      position.depositedToken1 = BIGINT_ZERO;
      position.withdrawnToken0 = BIGINT_ZERO;
      position.withdrawnToken1 = BIGINT_ZERO;
    }
  }

  return position
}

function getPosition(tokenId: BigInt): Position | null {
  let position = Position.load(tokenId.toString())
  if (position != null) {
    let contract = NonfungiblePositionManager.bind(Address.fromString(UNIV3_POSITION_MANAGER_ADDRESS));
    let positionCall = contract.try_positions(tokenId)

    if (!positionCall.reverted) {
      let positionResult = positionCall.value
      let poolAddress = factoryContract.getPool(positionResult.value2, positionResult.value3, positionResult.value4)

      // only cryptex pools
      let tcapPool = UNIV3_ETH_TCAP_POOL;
      /* if (dataSource.network() == "rinkeby") {
        tcapPool = UNIV3_ETH_TCAP_POOL_R;
      } */
      if (!poolAddress.equals(Address.fromHexString(tcapPool))) {
        return null;
      }

      return position;
    }
  }
  return null;
}

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  // temp fix
  if (event.block.number.equals(BigInt.fromI32(14317993))) {
    return
  }

  let position = getOrCreatePosition(event, event.params.tokenId, event.transaction.from.toHexString());

  // position was not able to be fetched
  if (position == null) {
    return
  }

  let amount0 = event.params.amount0;
  let amount1 = event.params.amount1;

  position.liquidity = position.liquidity.plus(event.params.liquidity);
  position.depositedToken0 = position.depositedToken0.plus(amount0);
  position.depositedToken1 = position.depositedToken1.plus(amount1);
  position.save();
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  // temp fix
  if (event.block.number == BigInt.fromI32(14317993)) {
    return
  }

  let position = getOrCreatePosition(event, event.params.tokenId, "");

  // position was not able to be fetched
  if (position == null) {
    return
  }
  let amount0 = event.params.amount0;
  let amount1 = event.params.amount1;

  position.liquidity = position.liquidity.minus(event.params.liquidity);
  position.withdrawnToken0 = position.withdrawnToken0.plus(amount0);
  position.withdrawnToken1 = position.withdrawnToken1.plus(amount1);
  position.save();
}

export function handleTransfer(event: Transfer): void {

  let position = getOrCreatePosition(event, event.params.tokenId, event.params.to.toHexString());

  // position was not able to be fetched
  if (position == null) {
    return
  }

  /* if (Address.fromHexString(UNIV3_STAKER_ADDRESS).equals(event.params.to)) {
    position.stakerAddress = event.params.to.toHexString();
  } */
  position.save();
}

function addStakedPosition(tokenId: string): APR | null {
  let apr = APR.load(APR_ID)
  let positions = new Array<string>()
  if (apr == null) {
    apr = new APR(APR_ID)
    apr.totalAmount0 = BigDecimal.fromString("0")
    apr.totalAmount1 = BigDecimal.fromString("0")
    positions.push(tokenId)
    apr.stakedPositions = positions
    apr.save()
  } else {
    positions = apr.stakedPositions
    positions.push(tokenId)
    apr.stakedPositions = positions
    apr.save()
  }
  return apr;
}

function removeStakedPosition(tokenId: string): APR | null {
  let apr = APR.load(APR_ID)
  if (apr != null) {
    let newPositions = new Array<string>()
    let stakedPositions = apr.stakedPositions
    for (let i = 0; i < stakedPositions.length; i++) {
      if (tokenId != stakedPositions[i]) {
        newPositions.push(stakedPositions[i])
      }
    }
    apr.stakedPositions = newPositions
    apr.save()

    return apr
  }
  return apr
}

function tickToPrice(tick: number): number {
  return 1.0001 ** tick
}

function calculateAPR(): void {
  let univ3Address = UNIV3_ETH_TCAP_POOL
  let tcapOracleAddress = TCAP_ORACLE_ADDRESS
  let wethOracleAddress = WETH_ORACLE_ADDRESS

  if (dataSource.network() == "rinkeby") {
    univ3Address = UNIV3_ETH_TCAP_POOL_R
    tcapOracleAddress = TCAP_ORACLE_ADDRESS_R
    wethOracleAddress == WETH_ORACLE_ADDRESS_R
  }

  let apr = APR.load(APR_ID)
  if (apr != null) {
    let tcapPool = TcapPool.bind(Address.fromString(univ3Address))
    let slot0Call = tcapPool.slot0()
    let currentTick = slot0Call.value1;
    let currentSqrtPrice = tickToPrice(currentTick / 2)

    // query all the active StakedPosition
    let totalAmount0 = BigDecimal.fromString("0")
    let totalAmount1 = BigDecimal.fromString("0")
    let positions = apr.stakedPositions
    for (let i = 0; i < positions.length; i++) {
      let position = Position.load(positions[i])
      if (position != null) {
        let tickLower = Tick.load(position.tickLower)
        let tickUpper = Tick.load(position.tickUpper)
        
        // check if ticks exist
        if (tickLower != null && tickUpper != null) {
          // convert ticks to int32
          let tickLowerNumber = 0;
          let tickUpperNumber = 0;
          if (tickLower.tickIdx.isI32()) {
            tickLowerNumber = tickLower.tickIdx.toI32();
          }
          if (tickUpper.tickIdx.isI32()) {
            tickUpperNumber = tickUpper.tickIdx.toI32();
          }

          if (tickLowerNumber < currentTick && currentTick < tickUpperNumber) {
            let sa = tickToPrice(tickLowerNumber / 2)
            let sb = tickToPrice(tickUpperNumber / 2)
            let liquidity = position.liquidity
            
            // calculate amount0
            let amount00 = (sb - currentSqrtPrice) / (currentSqrtPrice * sb)
            let amount0 = liquidity.toBigDecimal().times(BigDecimal.fromString(amount00.toString()))

            // calculate amount1 
            let amount10 = currentSqrtPrice - sa
            let amount1 = liquidity.toBigDecimal().times(BigDecimal.fromString(amount10.toString()))


            let adjustedAmount0 = safeDiv(amount0, DIVISOR_18)
		        let adjustedAmount1 = safeDiv(amount1, DIVISOR_18)

            totalAmount0 = totalAmount0.plus(adjustedAmount0)
            totalAmount1 = totalAmount1.plus(adjustedAmount1)
          }
        }
      }
    }
    
    // calculate TVL
    let tcapOracle = TcapOracle.bind(Address.fromString(tcapOracleAddress))
    let wethOracle = WethOracle.bind(Address.fromString(wethOracleAddress))

    let tcapPrice0 = tcapOracle.getLatestAnswer()
    let wethPrice0 = wethOracle.getLatestAnswer()

    let tcapPrice = safeDiv(tcapPrice0.toBigDecimal(), DIVISOR_18)
    let wethPrice = safeDiv(wethPrice0.toBigDecimal(), DIVISOR_8)

    apr.totalAmount0 = totalAmount0
    apr.totalAmount1 = totalAmount1

    let tvlUSD = totalAmount0.times(tcapPrice).plus(totalAmount1.times(wethPrice))
    apr.tcapPrice = tcapPrice
    apr.wethPrice = wethPrice
    apr.tvl = tvlUSD
    apr.save()
  }
}

export function handleTokenStaked(event: TokenStaked): void {
  let position = getPosition(event.params.tokenId);

  if (position != null) {
    position.staked = true;
    position.stakedBlockNumber = event.block.number;
    position.save();

    if (event.block.number.gt(APR_BLOCK_NUMBER) ) {
      addStakedPosition(position.id)
      calculateAPR()
    }
  }
}

export function handleTokenUnstaked(event: TokenUnstaked): void {
  let position = getPosition(event.params.tokenId);

  if (position != null) {
    position.staked = false;
    position.stakedBlockNumber = BIGINT_ZERO;
    position.save();

    if (event.block.number.gt(APR_BLOCK_NUMBER)) {
      removeStakedPosition(position.id)
      calculateAPR()
    }
  }
}

export function handleSwap(event: Swap): void {
  if (event.block.number.gt(APR_BLOCK_NUMBER)) {
    calculateAPR()
  }
}
