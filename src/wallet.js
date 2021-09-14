import { useState } from 'react';
import NumberFormat from 'react-number-format';

import Box from './box';
import Prop from './prop';

import './wallet.css';

const formatErg = (erg) => {
  return Number(erg.toFixed(2)).toLocaleString('en')
}

const Exchange = ({ coin, mint, mintableAmount }) => {
  const [nbOfCoins, setNbOfCoins] = useState(0);

  const disabled = nbOfCoins <= 0;

  const mintLimit = ({ floatValue }) => floatValue <= mintableAmount;

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-center p-3">
      <NumberFormat
        className="p-1"
        value={nbOfCoins > 0 ? nbOfCoins : null}
        thousandSeparator={true}
        allowNegative={false}
        suffix={" " + coin}
        isAllowed={mintLimit}
        onValueChange={(values) => {
          const { value } = values;
          setNbOfCoins(Number(value));
        }}
      />
      <button
        type="button"
        className="btn btn-sm btn-outline-primary ms-sm-3 mt-3 mt-sm-0"
        disabled={disabled}
        onClick={(e) => mint(nbOfCoins)}
      >Mint {coin}
      </button>
    </div>
  )
}

const BalanceForm = ({ coin, circSupply, add }) => {
  const [nbOfCoins, setNbOfCoins] = useState(0);
  const [costInERG, setCostInERG] = useState(0);

  const circulatingSupplyLimit = ({ floatValue }) => floatValue <= circSupply;

  const disabled = nbOfCoins <= 0 || costInERG <= 0;

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center p-3 gap-2">
      <div className="d-flex align-items-center gap-2">
        <div style={{ width: "100px", textAlign: "right" }}> Balance:</div>
        <NumberFormat
          className="p-1"
          value={nbOfCoins > 0 ? nbOfCoins : null}
          thousandSeparator={true}
          allowNegative={false}
          suffix={" " + coin}
          isAllowed={circulatingSupplyLimit}
          onValueChange={(values) => {
            const { value } = values;
            setNbOfCoins(Number(value));
          }}
        />
      </div>
      <div className="d-flex justify-content-start align-items-center gap-2">
        <div style={{ width: "100px", textAlign: "right" }}> Total cost:</div>
        <NumberFormat
          className="p-1"
          value={costInERG > 0 ? costInERG : null}
          thousandSeparator={true}
          allowNegative={false}
          suffix={" ERG"}
          onValueChange={(values) => {
            const { value } = values;
            setCostInERG(Number(value));
          }}
        />
      </div>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary ms-sm-3 mt-3 mt-sm-0"
        disabled={disabled}
        onClick={() => {
          add(nbOfCoins, costInERG);
          // setNbOfCoins(0);
          // setCostInERG(0);
        }}
      >
        Add {coin}
      </button>
    </div>
  )
}

const Wallet = ({ scRate, rcRate, buySC, buyRC, mintableSC, mintableRC, redeemableRC, scCirc, rcCirc }) => {
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

  const onAddSC = (nbOfCoins, costInERG) => {
    setSCBalance(scBalance + nbOfCoins);
    setSpentErg(spentErg + costInERG);
  }

  const onAddRC = (nbOfCoins, costInERG) => {
    setRCBalance(rcBalance + nbOfCoins);
    setSpentErg(spentErg + costInERG);
  }

  const clearBalances = () => {
    setSCBalance(0);
    setRCBalance(0);
    setSpentErg(0);
  }

  const scBalanceInErg = scBalance * scRate;
  const rcBalanceInErg = rcBalance * rcRate;

  const rcRedeemableBalance = Math.min(rcBalance, redeemableRC);
  // TODO: Don't use hard coded fees here
  const redeemableBalanceInErgAfterFees = (scBalanceInErg + rcRedeemableBalance * rcRate) * (1 - 0.0225)

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
            <Prop label="Redeemable ERG (after fees)" value={redeemableBalanceInErgAfterFees.toLocaleString('en')} />
          </div>
        </div>
        <hr></hr>
        <div className="pb-3 text-center">
          <button type="button" className={`btn btn-sm btn${mode === "SC" ? "" : "-outline"}-primary mx-2 my-1`} onClick={() => setMode("SC")}>Mint SigUSD</button>
          <button type="button" className={`btn btn-sm btn${mode === "RC" ? "" : "-outline"}-primary mx-2 my-1`} onClick={() => setMode("RC")}>Mint SigRSV</button>
          <button type="button" className={`btn btn-sm btn${mode === "EDIT" ? "" : "-outline"}-primary mx-2 my-1`} onClick={() => setMode("EDIT")}>Edit Balances</button>
        </div>
        <div>
          <div hidden={mode !== 'SC'}>
            <Exchange coin={"SigUSD"} mint={onBuySC} mintableAmount={mintableSC} />
          </div>
          <div hidden={mode !== 'RC'}>
            <Exchange coin={"SigRSV"} mint={onBuyRC} mintableAmount={mintableRC} />
          </div>
          <div hidden={mode !== 'EDIT'}>
            <BalanceForm coin={"SigUSD"} add={onAddSC} circSupply={scCirc} />
            <BalanceForm coin={"SigRSV"} add={onAddRC} circSupply={rcCirc} />
            <div className="d-flex justify-content-center">
              <button type="button" className="btn btn-sm btn-outline-danger mx-2 my-1 text-center" onClick={() => clearBalances()}>Clear Balances</button>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
}

export default Wallet;