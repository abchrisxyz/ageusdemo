import Box from './box';
import Prop from './prop';

import './parameters.css';

const Parameters = ({ ergPrice, setErgPrice }) => {

  return (
    <Box>
      <div className="container">
        <div className="text-muted mb-3">Parameters</div>
        {/* <Prop label="ERG Price" value={ergPrice.toFixed(2) + " USD"} /> */}
        <form id="ergprice">
          <label>ERG Price</label>
          <input
            type="number"
            min="0.01"
            step="0.1"
            value={ergPrice}
            onChange={(e) => setErgPrice(Number(e.target.value))}
          />
          <div className="units">USD</div>
        </form>
        <Prop label="Protocol fee" value="2 %" />
      </div>
    </Box>
  )
}

export default Parameters;