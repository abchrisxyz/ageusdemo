import {useState} from 'react';

import Calculator from './components/calculator';
import History from './components/history';


function App() {
  const [mode, setMode] = useState("calc");

  return (
    <div className="container pb-5">
      <div className="mt-4 mb-4 d-flex justify-content-center">
        <button type="button" className={`btn btn-sm btn${mode==="calc"?"":"-outline"}-primary mx-2`} onClick={() => setMode("calc")}>Playground</button>
        <button type="button" className={`btn btn-sm btn${mode==="hist"?"":"-outline"}-primary mx-2`} onClick={() => setMode("hist")}>History</button>
      </div>

      <History show={mode==='hist'} />
      <Calculator show={mode==='calc'} />

    </div>
  );
}

export default App;
