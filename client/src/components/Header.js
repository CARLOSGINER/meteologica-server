import React from 'react'
import Widget from './Widget';

export default function Header({lastTemp,lastPower}) {
    return (
        <nav className="header">
            <img className="logo_img" src={"/assets/meteologica_logo.jpg"} alt="logo" />
            <Widget lastTemp={lastTemp} lastPower={lastPower}/>
        </nav>
    )
}
