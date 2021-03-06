import Box from './box';
import Prop from './prop';

function formatReserveRatio(ratio) {
  const rounded = ratio >= 1000 ? Math.round(ratio) : Number(ratio.toFixed(2));
  return rounded.toLocaleString('en');
}

const Reserve = ({ ergs, ratio }) => {
  return (
    <Box>
      <div className="container">
        <div className="text-muted mb-3">Reserves</div>
        <Prop label="Total" value={Number(ergs.toFixed(2)).toLocaleString('en') + " ERG"} />
        <Prop label="Reserve Ratio" value={formatReserveRatio(ratio) + " %"} />
      </div>
    </Box>
  );
}

export default Reserve;