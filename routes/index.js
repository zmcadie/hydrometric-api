const express = require('express');
const router = express.Router();
const axios = require('axios');

const url = "https://wateroffice.ec.gc.ca/services/real_time_graph/json/inline?station=08HA009&start_date=2019-03-26&end_date=2019-03-26&param1=46"

router.get('/', function(req, res, next) {
  axios.get(url)
    .then(response => {
      const levels = response.data['46'].provisional;
      const latest = levels[levels.length - 1];
      const latestObj = {
        time: latest[0],
        level: latest[1]
      };
      res.send(latestObj);
    })
    .catch(error => {
      res.send(error);
    });
});

module.exports = router;
