import React from 'react';


export default function Widget({lastTemp,lastPower}) {
    return (
      <div className="widget">
          <div >
              <p className="subtitle">Last Temperature</p>
              <p className="number">{lastTemp} °C</p>
          </div>
          <div className="divider">
              |
          </div>
          <div>
              <p className="subtitle">Last Power</p>
              <p className="number" >{lastPower} KW</p>
          </div>
      </div>
    );
}
