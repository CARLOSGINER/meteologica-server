const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 4001;
const socketIo = require("socket.io");
const io = socketIo(server,{
    cors: {
      origin: "https://61c041a9852c5c57e5585f97--meteologica-app-front.netlify.app/",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
    },
    allowEIO3: true
  });
const index = require("./routes/index");
const bodyParser = require('body-parser');
const fs = require('fs');
const YAML = require('js-yaml');
const path =require('path');
const cors = require('cors');

//configuracion para permiter CORS en el browser
// app.use(cors({
//     origin: '*',
//     methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
// }));  

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Headers", "Content-Type");
//     res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
//     next();
// });

app.use(index);
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Aqui la data es pasada a JSON para poder trabajar con ella. 
const rawData = fs.readFileSync('data.yml');
const data = YAML.load(rawData);

//se definen los array que serán pasados a traves del socket. Nota: Solo hace falta actualizar temperaturas, pues el rango del tiempo
//se esta tomando de ellas, pues son identicas. Para rangos de tiempos distintos habria que resetear el array de potencias tambien. 
let updatedTemperatures = []
const updatedPowers = [];
const valuesCount = data.temperature.values.length-1;
let count=0;

//cada vez que es invocado, se agrega un objeto con los datos al array especificado. 
const getData = () =>{
    updatedTemperatures.push(data.temperature.values[count]);
    updatedPowers.push(data.power.values[count]);
}


io.on("connection", (socket) => {

    //esto solo para visualizar en consola cuantos cientes hay conectados y desconectados. Nota: para verlo en el browser hace falta 
    //una librería adicional no instalada aún. 
    const usersCount = Object.keys(io.engine.clients).length
    console.log(`${usersCount} users connected`)
    
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });

    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });
});


//Según lo solicitado se actualizan los datos cada 5 segundos. Count sirve para llevar cuenta y que al llegar al final 
//de los datos (de prueba) proveidos, vuelva a comenzar de 0.  
setInterval(() => {
    count=count+1;
    if (count === valuesCount){
        count = 0;
        //!! es sumamente importante mutar el array vaciándolo, pues de no hacerlo, continuaría llenandose el array (push) y enviandose al front,
        //rompiendo el efecto deseado de continuidad en la grafica cuando se terminan los datos. 
        updatedTemperatures=[]
    }
    getData()
    io.emit("sendingData",{updatedTemperatures,updatedPowers}); 
}, 5000);



server.listen(port, () => console.log(`Listening on port ${port}`));