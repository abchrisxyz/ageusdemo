import { useState } from 'react';

import Box from './box';
import Prop from './prop';

function formatStepAmount(amount) {
  return amount >= 1000000
    ? `${amount / 1000000}M`
    : `${amount / 1000}k`
}

const CoinButtons = ({ minted, increase, decrease, steps, mintable, redeemable }) => {
  const [selectedStep, setSelectedStep] = useState(steps[1]);


  const stepButtons = steps.map((step) => {
    const className = step === selectedStep
      ? "btn btn-secondary"
      : "btn btn-light"
    return (
      <button
        key={step}
        type="button"
        className={className} onClick={() => setSelectedStep(step)}
      >
        {formatStepAmount(step)}
      </button>
    )
  });

  const disableDecreaseButton = selectedStep > redeemable;
  const disableIncreaseButton = selectedStep > mintable;

  return (
    <div className="d-flex justify-content-center">
      <button
        type="button"
        className="btn btn-sm btn-outline-primary mr-3"
        disabled={disableDecreaseButton}
        onClick={() => decrease(selectedStep)}
      >-</button>
      <div className="btn-group btn-group-sm" role="group">
        {stepButtons}
      </div>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary ml-3"
        disabled={disableIncreaseButton}
        onClick={() => increase(selectedStep)}
      >+</button>
    </div>
  );
}

const CoinInfo = ({ name, minted, mintable, redeemable, price, increase, decrease, steps }) => {
  return (
    <Box>
      <div className="container">
        <div className="text-muted mb-3">{name}</div>
        <Prop label="Circulating Supply" value={minted.toLocaleString('en')} />
        <Prop label="Price" value={`${price} ERG`} />
        <div className="d-flex justify-content-between">
          <Prop mini={true} label="Redeemable" value={redeemable.toLocaleString('en')} />
          <Prop mini={true} label="Mintable" value={Number(mintable.toFixed(2)).toLocaleString('en')} />
        </div>
      </div>
      <hr></hr>
      <CoinButtons
        minted={minted}
        increase={increase}
        decrease={decrease}
        steps={steps}
        mintable={mintable}
        redeemable={redeemable}
      />
    </Box>
  );
}

export default CoinInfo;