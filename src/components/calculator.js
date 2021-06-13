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
  calcReserveRatio
} from '../ageusd';


const Calculator = ({show}) => {
  const [bank, setBank] = useState(initialBank())
  const [ergPrice, setErgPrice] = useState(5.5);

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
      const sigusd = json[0].assets[0].amount / 100;
      const sigrsv = json[0].assets[1].amount;
      const nanoERGs = json[0].value
      setBank(createBank(sigusd, sigrsv, nanoERGs))
    }
    fecthBank();
  }, []);

  const pegRate = 1. / ergPrice;
  const pegRateInNanoERG = toNano(pegRate);

  const reserveRatio = calcReserveRatio(bank, pegRateInNanoERG);
  const scRate = calcSCRate(bank, pegRateInNanoERG);
  const rcRate = calcRCRate(bank, pegRateInNanoERG);

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

  if (!show) return "";

  return (
    <div>
      <div className="mt-3 p-3 alert alert-light" role="alert">
        <h6>Usage:</h6>
        <ol>
          <li>Mint stable or reserve coins in the <i>My Wallet</i> section.</li>
          <li>Simulate external events by increasing/decreasing the supplies of SigUSD and SigRSV and/or changing the ERG price.</li>
        </ol>
        <h6>To be implemented:</h6>
        <ul>
          <li>Enforce reserve ratio constraints</li>
          <li>Show redeemable ERG amount</li>
        </ul>
      </div>
      <div className="row row-cols-1 row-cols-md-2">
        <div className="col">
          <CoinInfo
            name="SigUSD"
            minted={bank.scCirc}
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
      <Wallet scRate={fromNano(scRate)} rcRate={fromNano(rcRate)} buySC={buySC} buyRC={buyRC} />
    </div>
  );
}

export default Calculator;