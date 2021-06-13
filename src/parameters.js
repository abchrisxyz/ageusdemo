import NumberFormat from 'react-number-format';
import Box from './box';
import Prop from './prop';

import './parameters.css';

const Parameters = ({ ergPrice, setErgPrice }) => {

  return (
    <Box>
      <div className="container">
        <div className="text-muted mb-3">Parameters</div>
        <form id="ergprice">
          <label>ERG Price</label>
          <NumberFormat
            style={{maxWidth: '6rem'}}
            value={ergPrice}
            thousandSeparator={true}
            allowNegative={false}
            decimalScale="2"
            fixedDecimalScale={false}
            prefix="$"
            onValueChange = {(values) => {
             const {value} = values;
             setErgPrice(Number(value));
            }}
          />
        </form>
        <Prop label="Protocol fee" value="2 %" />
      </div>
    </Box>
  )
}

export default Parameters;