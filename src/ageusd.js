/*

SC: Stable Coin (sigUSD)
RC: Reserve Coin (sigRSV)

Base currency for sigUSD: (nano)ERG

scCirc: number of circulating stable coins

*/

const bank = {
	/*
	 * Number of stable coins in circulation
	 */
	scCirc: 0,
	/*
	 * Number of reserve coins in circulation
	 */
	rcCirc: 0,
	/*
	 * Total amount of nanoErgs held in reserve
	 */
	baseReserves: 0 * 10 ** 9, // nanoERGs
}

const MIN_RESERVE_RATIO = 400; // %
const MAX_RESERVE_RATIO = 800; // %
const RESERVECOIN_DEFAULT_PRICE = 1000000; // nanoERG (0.001 ERG)
const MIN_BOX_VALUE = 10000000; // nanoERG (0.01 ERG)
const TX_FEE = 2000000; // nanoERG (0.002 ERG)
const FEE_PERCENT = 2; // %
const IMPLEMENTOR_FEE_PERCENT = 0.25; // %

export function initialBank() {
	return Object.create(bank);
}

/*
 * Outstanding liabilities in nanoERG's to cover stable coins in circulation.
 *
 * baseReserves: total amount in reserves [nanoERG]
 * scCirc: number of stable coins in circulation [-]
 * pegRate: current ERG/USD price [nanoERG]
 */
function _liabilities(baseReserves, scCirc, pegRate) {
	if (scCirc === 0) return 0;

	const baseReservesNeeded = scCirc * pegRate;
	return Math.min(baseReserves, baseReservesNeeded)
}

/*
 * Equity (i.e. reserves - liabilities) [nanoERG]
 *
 * baseReserves: total amount in reserves [nanoERG]
 * scCirc: number of stable coins in circulation [-]
 * pegRate: current ERG/USD price [nanoERG]
 */
function _equity(baseReserves, scCirc, pegRate) {
	const liabs = _liabilities(baseReserves, scCirc, pegRate);
	if (baseReserves <= liabs) {
		return 0;
	}
	return baseReserves - liabs;
}

/*
 * Stable coin price [nanoERG]
 *
 * baseReserves: total amount in reserves [nanoERG]
 * scCirc: number of stable coins in circulation [-]
 * pegRate: current ERG/USD price [nanoERG]
 */
function _scRate(baseReserves, scCirc, pegRate) {
	const liabs = _liabilities(baseReserves, scCirc, pegRate);
	if (scCirc === 0 || pegRate < liabs / scCirc) {
		return pegRate;
	} else {
		return liabs / scCirc;
	}
}

/*
 * Reserve coin price [nanoERG]
 *
 * baseReserves: total amount in reserves [nanoERG]
 * scCirc: number of stable coins in circulation [-]
 * rcCirc: number of reserve coins in circulation [-]
 * pegRate: current ERG/USD price [nanoERG]
 */
function _rcRate(rcCirc, equity) {
	if (rcCirc <= 1 || equity === 0) {
		return RESERVECOIN_DEFAULT_PRICE;
	}
	return equity / rcCirc;
}

/*
 * Current reserve ratio in %
 *
 * baseReserves: total amount in reserves [nanoERG]
 * scCirc: number of stable coins in circulation [-]
 * pegRate: current ERG/USD price [nanoERG]
 */
function _reserveRatio(baseReserves, scCirc, pegRate) {
	if (baseReserves === 0 || pegRate === 0) return 0;
	if (scCirc === 0) return baseReserves * 100 / pegRate;
	const scRatePrc = (baseReserves * 100) / scCirc;
	return scRatePrc / pegRate;
}

/*
 * Base cost of minting SC or RC [nanoERG]
 * This is price of stable coins + fees that go to reserve.
 *
 * rate: coin price [nanoERG]
 * nbToMint: number of stable coins to be minted [-]
 */
function _baseCostToMint(rate, nbToMint) {
	const noFeeCost = rate * nbToMint;
	const protocolFee = noFeeCost * FEE_PERCENT / 100;
	return noFeeCost + protocolFee;
}

/*
 * Base amount returned from redeeming SC or RC [nanoERG]
 * This is amount after fees that go to reserve (protocol fees).
 *
 * rate: coin price [nanoERG]
 * nbToMint: number of stable coins to be minted [-]
 */
function _baseAmountToRedeem(rate, nbToMint) {
	const noFeeAmount = rate * nbToMint;
	const protocolFee = noFeeAmount * FEE_PERCENT / 100;
	return noFeeAmount - protocolFee;
}

/*
 * Add non-protocol fees on top of base cost [nanoERG]
 * This is base cost + any fees that don't make it to the reserve (tx and implementor).
 *
 * baseCost: Cost of minted coins + protocol fees [nanoERG]
 */
function _totalCostToMint(baseCost) {
	const implementorsFee = baseCost * IMPLEMENTOR_FEE_PERCENT / 100;
	return baseCost + implementorsFee + TX_FEE + MIN_BOX_VALUE * 2;
}

/*
 * Deduct non-protocol fees from base redeemable amount [nanoERG]
 * This is base amount - any fees that don't make it to the reserve (tx and implementor).
 *
 * baseAmount: Value of redeemed coins + protocol fees [nanoERG]
 */
function _totalAmountToRedeem(baseAmount) {
	const implementorsFee = baseAmount * IMPLEMENTOR_FEE_PERCENT / 100;
	return baseAmount - implementorsFee - TX_FEE;
}


/*
 * Buy Stable Coin with ERG
 *
 * scToMint: Number of stable coins to mint [-]
 */
export function mintSC(bank, pegRate, scToMint) {
	const rate = _scRate(bank.baseReserves, bank.scCirc, pegRate);
	const baseCost = _baseCostToMint(rate, scToMint);
	const totalCost = _totalCostToMint(baseCost)
	const newBank = Object.create(bank);
	newBank.scCirc += scToMint;
	newBank.baseReserves += baseCost;
	return [newBank, totalCost];
}


/*
* Sell Stable Coin for ERG
*
* scToSell: Number of stable coins to sell [-]
*/
export function redeemSC(bank, pegRate, scToSell) {
	const rate = _scRate(bank.baseReserves, bank.scCirc, pegRate);
	const baseAmount = _baseAmountToRedeem(rate, scToSell);
	const totalAmount = _totalAmountToRedeem(baseAmount)
	const newBank = Object.create(bank);
	newBank.scCirc -= scToSell;
	newBank.baseReserves -= baseAmount;
	return [newBank, totalAmount];
}

/*
 * Buy Reserve Coin with ERG
 *
 * rcToMint: Number of reserve coins to mint [-]
 */
export function mintRC(bank, pegRate, rcToMint) {
	const equity = _equity(bank.baseReserves, bank.scCirc, pegRate);
	const rate = _rcRate(bank.rcCirc, equity)
	const baseCost = _baseCostToMint(rate, rcToMint);
	const totalCost = _totalCostToMint(baseCost);
	const newBank = Object.create(bank);
	newBank.rcCirc += rcToMint;
	newBank.baseReserves += baseCost;
	return [newBank, totalCost];
}

/*
 * Sell Reserve Coin for ERG
 *
 * rcToSell: Number of reserve coins to sell [-]
 */
export function redeemRC(bank, pegRate, rcToSell) {
	const equity = _equity(bank.baseReserves, bank.scCirc, pegRate);
	const rate = _rcRate(bank.rcCirc, equity)
	const baseAmount = _baseAmountToRedeem(rate, rcToSell);
	const totalAmount = _totalAmountToRedeem(baseAmount);
	const newBank = Object.create(bank);
	newBank.rcCirc -= rcToSell;
	newBank.baseReserves -= baseAmount;
	return [newBank, totalAmount];
}

export function toNano(ergs) {
	return ergs * 10 ** (9);
}

export function fromNano(nanoERGs) {
	return nanoERGs * 10 ** (-9);
}

export function calcSCRate(bank, pegRateInNanoERG) {
	return _scRate(bank.baseReserves, bank.scCirc, pegRateInNanoERG);
}

export function calcRCRate(bank, pegRateInNanoERG) {
	const equity = _equity(bank.baseReserves, bank.scCirc, pegRateInNanoERG);
	return _rcRate(bank.rcCirc, equity);
}

export function calcReserveRatio(bank, pegRateInNanoERG) {
	return _reserveRatio(bank.baseReserves, bank.scCirc, pegRateInNanoERG)
}
