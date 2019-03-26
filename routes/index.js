const express = require('express');
const router = express.Router();
const axios = require('axios');

const getUrl = date => {
  const yr = date.getFullYear(), mn = date.getMonth(), dy = date.getDate();
  const dateStr = `${yr}-${mn < 9 ? `0${mn + 1}` : mn + 1}-${dy < 10 ? `0${dy}` : dy}`;
  return `https://wateroffice.ec.gc.ca/services/real_time_graph/json/inline?station=08HA009&start_date=${dateStr}&end_date=${dateStr}&param1=46`;
}

router.get('/', function(req, res, next) {
  const date = new Date()
  const url = getUrl(date)
  axios.get(url)
    .then(response => {
      const levels = response.data['46'].provisional;
      const latest = levels[levels.length - 1];
      const latestObj = {
        time: latest[0],
        level: latest[1]
      };
      res.status(200).json(latestObj);
    })
    .catch(error => {
      res.status(400).json({ error: error });
    });
});

module.exports = router;
