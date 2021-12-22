const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 4001;
const socketIo = require("socket.io");
const io = socketIo(server);
const index = require("./routes/index");
const bodyParser = require('body-parser');
const fs = require('fs');
const YAML = require('js-yaml');
const path =require('path');
const cors = require('cors');


app.use(cors({
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));  

app.options('https://meteologica-app-server.herokuapp.com/',(req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

app.use(index);
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const rawData = fs.readFileSync('data.yml');
const data = YAML.load(rawData);

const updatedTemperatures = []
const updatedPowers = [];
const valuesCount = data.temperature.values.length

const sendDelayData = async (socket) =>{
    for (let i = 0; i < valuesCount; i++) {
        updatedTemperatures.push(data.temperature.values[i]);
        updatedPowers.push(data.power.values[i]);
        await new Promise(done => setTimeout(() => done(), 5000))
        console.log(updatedTemperatures[updatedTemperatures.length-1]);
        console.log(updatedPowers[updatedPowers.length-1]);
        socket.emit("FromAPI",{updatedTemperatures,updatedPowers,usersCount});
        if (i===valuesCount-1){
            i = 0;
        }   
    }
}

io.on("connection", (socket) => {

    const usersCount = io.sockets.sockets.length;
    sendDelayData(socket)   

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});


server.listen(port, () => console.log(`Listening on port ${port}`));