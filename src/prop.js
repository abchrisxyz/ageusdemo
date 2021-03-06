import './prop.css';

const Prop = ({ label, value }) => {
  return (
    <div className="prop">
      <div className="prop-label">{label}</div>
      <div className="prop-value">{value}</div>
    </div>
  );
}

export default Prop;