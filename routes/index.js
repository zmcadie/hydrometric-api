const express = require('express');
const router = express.Router();
const axios = require('axios');

const timezones = {
  pst: -8,
  mst: -7,
  cst: -6,
  est: -5,
  ast: -4,
  nst: -3.5
}

const getUTC = now => {
  var timezoneOffset = now.getTimezoneOffset() * 60000;
  return now.getTime() + timezoneOffset;
}

const getLocalTime = (now, timezone) => {
  const utc = getUTC(new Date(now));
  return utc + (3600000 * timezones[timezone]);
}

const getUrl = (date, stationId) => {
  const yesterday = new Date(date.getTime() - (3600000 * 24));
  const yr = date.getFullYear(), mn = date.getMonth(), dy = date.getDate();
  const yyr = yesterday.getFullYear(), ymn = yesterday.getMonth(), ydy = yesterday.getDate();
  const dateStr = `${yr}-${mn < 9 ? `0${mn + 1}` : mn + 1}-${dy < 10 ? `0${dy}` : dy}`;
  const yDateStr = `${yyr}-${ymn < 9 ? `0${ymn + 1}` : ymn + 1}-${ydy < 10 ? `0${ydy}` : ydy}`;
  return `https://wateroffice.ec.gc.ca/services/real_time_graph/json/inline?station=${stationId}&start_date=${yDateStr}&end_date=${dateStr}&param1=46`;
}

const fetchWaterLevelClosure = () => {
  let waterLevels = {};
  return (cb, stationId, timezone) => {
    const now = getUTC(new Date());
    if (waterLevels[stationId] && waterLevels[stationId].data && waterLevels[stationId].lastReq - now < 3600000) {
      cb(200, waterLevels[stationId].data)
    } else {
      const localTime = new Date(getLocalTime(now, timezone));
      const url = getUrl(localTime, stationId);
      axios.get(url)
        .then(response => {
          const levels = response.data['46'].provisional;
          const latest = levels[levels.length - 1];
          const data = {
            date: latest[0],
            level: latest[1]
          };
          waterLevels[stationId] = { data, lastReq: now };
          cb(200, data);
        })
        .catch(error => {
          console.error(error);
          cb(400, {});
        });
    };
  }
}

const fetchWaterLevel = fetchWaterLevelClosure();

router.get('/waterLevel/:stationId/:timezone?', function(req, res, next) {
  const { stationId, timezone } = req.params
  const cb = (status, response) => res.status(status).json(response);
  fetchWaterLevel(cb, stationId, timezone || 'est');
});
router.get('/', function(req, res, next) {
  res.status('400').send('please provide a station id in request url');
});

module.exports = router;
