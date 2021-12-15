const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 4001;
const socketIo = require("socket.io")
const io = socketIo(server);
const index = require("./routes/index");
const bodyParser = require('body-parser');
const fs = require('fs');
const YAML = require('js-yaml');
const path =require('path');
const cors = require('cors');

// ** MIDDLEWARE ** //
const whitelist = ['http://localhost:3000', 'http://localhost:4001']
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(index);
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors(corsOptions))

if (process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*',  (req,res)=>{
        res.sendFile(path.join(__dirname, '../client/build','index.html'));
    })
}



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
        socket.emit("FromAPI",{updatedTemperatures,updatedPowers});
    }
}

io.on("connection", (socket) => {

    console.log("New client connected");

    sendDelayData(socket)

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
});




server.listen(port, () => console.log(`Listening on port ${port}`));





