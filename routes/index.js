const express = require('express');
const router = express.Router();
const axios = require('axios');

const getUTC = now => {
  var timeZoneOffset = now.getTimezoneOffset() * 60000;
  return now.getTime() + timeZoneOffset;
}

const getPST = now => {
  const utc = getUTC(now);
  return utc + (3600000 * -8);
}

const getUrl = date => {
  const yr = date.getFullYear(), mn = date.getMonth(), dy = date.getDate();
  const dateStr = `${yr}-${mn < 9 ? `0${mn + 1}` : mn + 1}-${dy < 10 ? `0${dy}` : dy}`;
  return `https://wateroffice.ec.gc.ca/services/real_time_graph/json/inline?station=08HA009&start_date=${dateStr}&end_date=${dateStr}&param1=46`;
}

const fetchWaterLevel = cb => {
  const now = new Date();
  const pst = new Date(getPST(now));
  const url = getUrl(pst);
  axios.get(url)
    .then(response => {
      const levels = response.data['46'].provisional;
      const latest = levels[levels.length - 1];
      const latestObj = {
        time: latest[0],
        level: latest[1]
      };
      cb(200, latestObj);
    })
    .catch(error => {
      cb(400, { error: error });
    });
}

router.get('/', function(req, res, next) {
  const cb = (status, response) => res.status(status).json(response);
  fetchWaterLevel(cb);
});

module.exports = router;
