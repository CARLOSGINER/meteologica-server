const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 4001;
const io = socketIo(server);
const index = require("./routes/index");
const bodyParser = require('body-parser');
const fs = require('fs');
const YAML = require('js-yaml');
const path =require('path');
const cors = require('cors');
const socketIo = require("socket.io")(server, {

    cors: {
        origin: "https://meteologica-app-server.herokuapp.com/",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
      },
  });


// // ** MIDDLEWARE ** //
// const whitelist = ['http://localhost:3000', 'http://localhost:4001','https://meteologica-app-server.herokuapp.com/']
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log("** Origin of request " + origin)
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       console.log("Origin acceptable")
//       callback(null, true)
//     } else {
//       console.log("Origin rejected")
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// app.use(cors(corsOptions)); 
app.use(cors())
app.use(index);
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "request.get('origin')"); 
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, Access-Control-Allow-Credentials');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//     res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
//     next();
// });

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