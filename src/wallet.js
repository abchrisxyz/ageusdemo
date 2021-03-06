import { useState } from 'react';

import Box from './box';
import Prop from './prop';

import './wallet.css';

const formatErg = (erg) => {
  return Number(erg.toFixed(2)).toLocaleString('en')
}

const Exchange = ({ coin, mint }) => {
  const [nbOfCoins, setNbOfCoins] = useState(0);

  const disabled = nbOfCoins <= 0;

  return (
    <div className="d-flex justify-content-center p-3">
      <form>
        <input
          type="number"
          className="form-control"
          min="0"
          value={nbOfCoins}
          onChange={(e) => setNbOfCoins(Number(e.target.value))}
        />
      </form>
      <button
        type="button"
        className="btn btn-outline-primary ml-3"
        disabled={disabled}
        onClick={(e) => mint(nbOfCoins)}
      >Mint {coin}
      </button>
    </div>
  )
}

const Wallet = ({ scRate, rcRate, buySC, buyRC }) => {
  const [scBalance, setSCBalance] = useState(0);
  const [rcBalance, setRCBalance] = useState(0);
  const [spentErg, setSpentErg] = useState(0);
  const [mode, setMode] = useState('SC');

  const onBuySC = (nbOfCoins) => {
    console.log(nbOfCoins)
    const erg = buySC(nbOfCoins);
    setSCBalance(scBalance + nbOfCoins);
    setSpentErg(spentErg + erg);
  }

  const onBuyRC = (nbOfCoins) => {
    const erg = buyRC(nbOfCoins);
    setRCBalance(rcBalance + nbOfCoins);
    setSpentErg(spentErg + erg);
  }

  const scBalanceInErg = scBalance * scRate;
  const rcBalanceInErg = rcBalance * rcRate;

  return (
    <Box>
      <div className="container">
        <div className="text-muted mb-3">My Wallet</div>
        <div className="row">
          <div className="col">
            <Prop label="SigUSD Balance" value={scBalance.toLocaleString('en') + ` (${formatErg(scBalanceInErg)} ERG)`} />
          </div>
          <div className="col">
            <Prop label="SigRSV Balance" value={rcBalance.toLocaleString('en') + ` (${formatErg(rcBalanceInErg)} ERG)`} />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <Prop label="Spent ERG" value={formatErg(spentErg) + " ERG"} />
          </div>
          <div className="col">
            <Prop label="Redeemable ERG" value={"Todo..."} />
          </div>
        </div>
        {/* <hr></hr> */}
        <ul className="nav nav-tabs nav-fill pt-3">
          <li className="nav-item">
            <button className={`nav-link ${mode === 'SC' ? "active" : ""}`} onClick={() => setMode('SC')}> SigUSD</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${mode === 'RC' ? "active" : ""}`} onClick={() => setMode('RC')}>SigRSV</button>
          </li>
        </ul>
        <div className="nav-body">
          <div hidden={mode !== 'SC'}>
            <Exchange coin={"SigUSD"} mint={onBuySC} />
          </div>
          <div hidden={mode !== 'RC'}>
            <Exchange coin={"SigRSV"} mint={onBuyRC} />
          </div>
        </div>
      </div>
    </Box>
  );
}

export default Wallet;