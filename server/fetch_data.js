// https://saint-etienne-gbfs.klervi.net/gbfs/en/station_status.json
const fetch = require("node-fetch");
module.exports = async function fetch_url(url) {
  let response = await fetch(url);
  let data = await response.json()
  return data;
};

