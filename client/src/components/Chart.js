import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);
const ENDPOINT = "http://127.0.0.1:4001";
// const plotGlobalLayout = {}
const globalColor = '#111d2b'


function App({getLastTemp,getLastPower}) {

    const [temperatures, setTemperatures] = useState([]);
    const [power, setPower] = useState([]);
    const [onLight, setOnLight] = useState(false);


    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);
        socket.on("FromAPI", resp => {
            setTemperatures(resp.updatedTemperatures);
            setPower(resp.updatedPowers);
            setOnLight(true);
        });
        socket.on("disconnect", () => {
            setOnLight(false);
          });
    }, []);


    const makeAxis = (rawData) =>{
        const xAxis = rawData.map((each)=>(
            each.time
        ))
        const yAxis = rawData.map((each)=>(
            each.value
        ))

        const plotData = [xAxis,yAxis]

        return plotData;
    }

    const tempsInCelsius =(kelvinTemperatures) =>{
        const convertedTemperatures = kelvinTemperatures.map(each=>{
            const celsius = each - 273.15
            return (celsius)
        })
        return convertedTemperatures
    }

    const toKW = (MWpowers) =>{
        const KWpowers= MWpowers.map(each=>{
            return each*1000
        })
        return KWpowers
    }

    let plotReadyTemps = tempsInCelsius(makeAxis(temperatures)[1])
    let plotReadyPowers = toKW(makeAxis(power)[1])
    let lastTemperature = typeof plotReadyTemps[plotReadyTemps.length-1] === "undefined"? 0 : plotReadyTemps[plotReadyTemps.length-1]  ; 
    let lastPower = typeof plotReadyPowers[plotReadyPowers.length-1] === "undefined"? 0 : plotReadyPowers[plotReadyPowers.length-1]; 
    getLastTemp(lastTemperature.toFixed(2))
    getLastPower(lastPower.toFixed(2))


  return (

    <>

        <div className={onLight?"loader active":"loader"}>
            {onLight?<p>Connected! receiving data</p>:<p>Disconnected...</p>}
        </div>

        <div className="charts">

            <Plot
                data={[
                    {
                        type:'scatter',
                        mode:'lines',
                        x:makeAxis(temperatures)[0],
                        y:tempsInCelsius(makeAxis(temperatures)[1])
                    }
                ]}

                layout={{
                    title:'Temperature',
                    font:{
                        color:'rgb(179, 179, 179)'
                    },
                    xaxis:{
                        title:'Time',
                        titlefont:{color:'white'},
                        tickfont:{color:'white'},
                        tickmode:'linear',
                        dtick:12,
                        tickformat:'%M'
                    },
                    yaxis:{
                        title:'Temp (C°)',
                        titlefont:{color:'white'},
                        tickfont:{color:'white'}
                    },
                    paper_bgcolor:globalColor,
                    plot_bgcolor:globalColor,
                }}
            />
            <Plot
                data={[
                    {
                        type:'scatter',
                        mode:'lines',
                        x:makeAxis(power)[0],
                        y:toKW(makeAxis(power)[1]),
                    }
                ]}
                layout={{
                    title:'Power',
                    font:{
                        color:'rgb(179, 179, 179)'
                    },
                    xaxis:{
                        title:'Time',
                        titlefont:{color:'white'},
                        tickfont:{color:'white'},
                        tickmode:'linear',
                        dtick:12,
                        tickformat:'%M'
                    },
                    yaxis:{
                        title:'Power (KW)',
                        titlefont:{color:'white'},
                        tickfont:{color:'white'}
                    },
                    paper_bgcolor:globalColor,
                    plot_bgcolor:globalColor,

                }}
            />
        </div>
    </>
  );
}

export default App;
