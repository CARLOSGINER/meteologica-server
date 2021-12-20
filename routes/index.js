const express = require("express");
const router = express.Router();
const cors = require('cors');

const corsOptions = {
  origin: 'https://meteologica-app-server.herokuapp.com/',
  optionsSuccessStatus: 200 
}

router.get("/",cors(corsOptions), (req, res) => {
  res.send({ response: "server up..." }).status(200);
});


module.exports = router;