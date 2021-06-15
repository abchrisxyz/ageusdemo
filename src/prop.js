import './prop.css';

const Prop = ({ label, value, mini=false }) => {
  return (
    <div className={"prop" + (mini ? " mini" : "")}>
      <div className="prop-label">{label}</div>
      <div className="prop-value">{value}</div>
    </div>
  );
}

export default Prop;