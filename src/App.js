import { useState } from 'react';

import CoinInfo from './coininfo';
import Reserve from './reserve';
import Parameters from './parameters';
import Wallet from './wallet';
import {
  initialBank,
  calcSCRate,
  calcRCRate,
  toNano,
  fromNano,
  mintSC,
  mintRC,
  redeemSC,
  redeemRC,
  calcReserveRatio
} from './ageusd';
import Box from './box';


function App() {
  const [bank, setBank] = useState(initialBank())
  const [ergPrice, setErgPrice] = useState(2.5);

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

  return (
    <div className="container pb-5">
      <div className="mt-3 alert alert-warning" role="alert">
        <p className="text-center">This is an unvalidated prototype - for educational purposes only.</p>
      </div>
      <div className="mt-3 p-3 alert alert-light" role="alert">
        <p><a href="https://github.com/Emurgo/age-usd">AgeUSD</a> is an algorithmic stablecoin protocol. This demo is a simple web app to help coin holders understand how their assets can evolve under various conditions.</p>
        <p>The current version focusses on the <a href="http://sigmausd.io/">SigmaUSD</a> implementation, part of the <a href="https://ergoplatform.org/en/">Ergo</a> ecosystem.</p>
        <p></p>
        <h6>Usage:</h6>
        <ol>
          <li>Bring the reserve to desired state by increasing/decreasing the supplies of SigUSD and SigRSV.</li>
          <li>Mint stable or reserve coins in the <i>My Wallet</i> section.</li>
          <li>Simulate external events by again increasing/decreasing the supplies of SigUSD and SigRSV and/or changing the ERG price.</li>
        </ol>
        <h6>To be implemented:</h6>
        <ul>
          <li>Enforce reserve ratio constraints</li>
          <li>Show redeemable ERG amount</li>
          <li>Make protocol fee configurable</li>
        </ul>
        <h6>Resources:</h6>
        <ul>
          <li>
            <a href="https://veriumfellow.medium.com/introduction-to-ergos-sigmausd-stablecoin-risk-and-reward-mechanism-18690b52d672">
              Introduction to Ergo’s SigmaUSD stablecoin risk and reward mechanism
            </a>
          </li>
          <li>
            <a href="https://github.com/abchrisxyz/ageusdemo">
              GitHub repo
            </a>
          </li>
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

export default App;
