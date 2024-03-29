import { useState, useEffect } from 'react';

import CoinInfo from '../coininfo';
import Reserve from '../reserve';
import Parameters from '../parameters';
import Wallet from '../wallet';
import {
  initialBank,
  createBank,
  calcSCRate,
  calcRCRate,
  toNano,
  fromNano,
  mintSC,
  mintRC,
  redeemSC,
  redeemRC,
  calcReserveRatio,
  calcMintableSC,
  calcMintableRC,
  calcRedeemableRC,
} from '../ageusd';


const Calculator = () => {
  const [bank, setBank] = useState(initialBank())
  const [ergPrice, setErgPrice] = useState(10);

  useEffect(() => {
    async function fetchData() {
      const url = 'https://erg-oracle-ergusd.spirepools.com/frontendData';
      const response = await fetch(url);
      const json = await response.json();
      const latest_price = JSON.parse(json)["latest_price"];
      setErgPrice(latest_price.toFixed(2));
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fecthBank() {
      const url = 'https://api.ergoplatform.com/api/v0/transactions/boxes/byAddress/unspent/MUbV38YgqHy7XbsoXWF5z7EZm524Ybdwe5p9WDrbhruZRtehkRPT92imXer2eTkjwPDfboa1pR3zb3deVKVq3H7Xt98qcTqLuSBSbHb7izzo5jphEpcnqyKJ2xhmpNPVvmtbdJNdvdopPrHHDBbAGGeW7XYTQwEeoRfosXzcDtiGgw97b2aqjTsNFmZk7khBEQywjYfmoDc9nUCJMZ3vbSspnYo3LarLe55mh2Np8MNJqUN9APA6XkhZCrTTDRZb1B4krgFY1sVMswg2ceqguZRvC9pqt3tUUxmSnB24N6dowfVJKhLXwHPbrkHViBv1AKAJTmEaQW2DN1fRmD9ypXxZk8GXmYtxTtrj3BiunQ4qzUCu1eGzxSREjpkFSi2ATLSSDqUwxtRz639sHM6Lav4axoJNPCHbY8pvuBKUxgnGRex8LEGM8DeEJwaJCaoy8dBw9Lz49nq5mSsXLeoC4xpTUmp47Bh7GAZtwkaNreCu74m9rcZ8Di4w1cmdsiK1NWuDh9pJ2Bv7u3EfcurHFVqCkT3P86JUbKnXeNxCypfrWsFuYNKYqmjsix82g9vWcGMmAcu5nagxD4iET86iE2tMMfZZ5vqZNvntQswJyQqv2Wc6MTh4jQx1q2qJZCQe4QdEK63meTGbZNNKMctHQbp3gRkZYNrBtxQyVtNLR8xEY8zGp85GeQKbb37vqLXxRpGiigAdMe3XZA4hhYPmAAU5hpSMYaRAjtvvMT3bNiHRACGrfjvSsEG9G2zY5in2YWz5X9zXQLGTYRsQ4uNFkYoQRCBdjNxGv6R58Xq74zCgt19TxYZ87gPWxkXpWwTaHogG1eps8WXt8QzwJ9rVx6Vu9a5GjtcGsQxHovWmYixgBU8X9fPNJ9UQhYyAWbjtRSuVBtDAmoV1gCBEPwnYVP5GCGhCocbwoYhZkZjFZy6ws4uxVLid3FxuvhWvQrVEDYp7WRvGXbNdCbcSXnbeTrPMey1WPaXX';
      const response = await fetch(url);
      const json = await response.json();
      // There is only ever 1 unspent bank box, but since some ergold got sent to the bank address,
      // need to avoid using that box.
      // Here we drop all boxes not having sigusd as their first asset.
      const box = json.filter((b) => b.assets[0].tokenId === "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04")[0];
      const sigusd = box.assets[0].amount / 100;
      const sigrsv = box.assets[1].amount;
      const nanoERGs = box.value
      setBank(createBank(sigusd, sigrsv, nanoERGs))
    }
    fecthBank();
  }, []);

  const pegRate = 1. / ergPrice;
  const pegRateInNanoERG = toNano(pegRate);

  const reserveRatio = calcReserveRatio(bank, pegRateInNanoERG);
  const scRate = calcSCRate(bank, pegRateInNanoERG);
  const rcRate = calcRCRate(bank, pegRateInNanoERG);
  const mintableSC = calcMintableSC(bank, pegRateInNanoERG);
  const mintableRC = calcMintableRC(bank, pegRateInNanoERG);
  const redeemableRC = calcRedeemableRC(bank, pegRateInNanoERG);

  const buySC = (nbOfCoins) => {
    const [newBank, CostNanoERG] = mintSC(bank, pegRateInNanoERG, nbOfCoins);
    setBank(newBank);
    return fromNano(CostNanoERG);
  }

  const sellSC = (nbOfCoins) => {
    const [newBank, AmountNanoERG] = redeemSC(bank, pegRateInNanoERG, nbOfCoins);
    setBank(newBank);
    return fromNano(AmountNanoERG);
  }

  const buyRC = (nbOfCoins) => {
    const [newBank, CostNanoERG] = mintRC(bank, pegRateInNanoERG, nbOfCoins);
    setBank(newBank);
    return fromNano(CostNanoERG);
  }

  const sellRC = (nbOfCoins) => {
    const [newBank, AmountNanoERG] = redeemRC(bank, pegRateInNanoERG, nbOfCoins);
    setBank(newBank);
    return fromNano(AmountNanoERG);
  }

  return (
    <div>
      <div className="mt-3 p-3 alert alert-light" role="alert">
        <h6>Usage:</h6>
        <ol>
          <li>Mint stable or reserve coins in the <i>My Wallet</i> section or edit your wallet balance to represent existing assets without changing the current bank state.</li>
          <li>Simulate external events by increasing/decreasing the supplies of SigUSD and SigRSV and/or changing the ERG price.</li>
        </ol>
      </div>
      <div className="row row-cols-1 row-cols-md-2">
        <div className="col">
          <CoinInfo
            name="SigUSD"
            minted={bank.scCirc}
            mintable={mintableSC}
            redeemable={bank.scCirc}
            price={fromNano(scRate).toFixed(2)}
            increase={buySC}
            decrease={sellSC}
            steps={[1 * 10 ** 3, 10 * 10 ** 3, 100 * 10 ** 3]}
          />
        </div>
        <div className="col">
          <CoinInfo
            name="SigRSV"
            minted={bank.rcCirc}
            mintable={mintableRC}
            redeemable={redeemableRC}
            price={fromNano(rcRate).toFixed(8)}
            increase={buyRC}
            decrease={sellRC}
            steps={[1 * 10 ** 6, 10 * 10 ** 6, 100 * 10 ** 6]}
          />
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 pb-3">
        <div className="col">
          <Reserve ergs={fromNano(bank.baseReserves)} ratio={reserveRatio} />
        </div>
        <div className="col">
          <Parameters ergPrice={ergPrice} setErgPrice={setErgPrice} />
        </div>
      </div>
      <Wallet
        scRate={fromNano(scRate)}
        rcRate={fromNano(rcRate)}
        buySC={buySC}
        buyRC={buyRC}
        mintableSC={mintableSC}
        mintableRC={mintableRC}
        redeemableRC={redeemableRC}
        scCirc={bank.scCirc}
        rcCirc={bank.rcCirc}
      />
      <div className="mt-3 p-3 alert alert-light" role="alert">
        The value of SigRSV can fluctuate depending on ERG price, transaction volumes, as well as how and when SigUSD holders redeem their value.
        None of these events are predictable and their implications on the AgeUSD protocol can be hard to grasp when starting out.
        This calculator lets one play around to see how SigUSD and SigRSV value is affected.
      </div>
    </div>

  );
}

export default Calculator;