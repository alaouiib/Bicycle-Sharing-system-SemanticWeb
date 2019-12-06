const express = require("express");
const fetch = require("node-fetch");
const PORT = 3000;
const app = express();
const fs = require("fs");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
let cors = require("cors");
let FinalData = [];
let Sainte_Data = [];
let Sainte_ss = [];
let Sainte_si = [];
let dataString = "";
let newAddedCities = [];
const get_Saintetienne_Data = require("./saint-etienne-data");
const get_Lyon_Data = require("./lyon-data");
const get_newCity_Data = require("./newCity-data");
/** =========== Main() ============*/
// first : get data of Saint-Etienne and Lyon
get_data(dataString, FinalData).catch(err => console.error(err));

// socket interaction to add some realtime to the app

/** ============================== */
// middleware to allow making requests from all origins
app.use(cors());

/** Controllers */
app.get("/createJSONld", async (req, res) => {
  // console.log(req.query.toJsonldQuery);
  var toJsonldQuery = req.query.toJsonldQuery;
  // console.log(toJsonldQuery);

  fetch("http://www.easyrdf.org/converter", {
    credentials: "include",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "accept-language":
        "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar-MA;q=0.6,ar;q=0.5",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "upgrade-insecure-requests": "1"
    },
    referrer: "http://www.easyrdf.org/converter",
    referrerPolicy: "no-referrer-when-downgrade",
    body: `data=${toJsonldQuery}&uri=http%3A%2F%2Fnjh.me%2F&in=turtle&out=jsonld&raw=1`,
    method: "POST",
    mode: "cors"
  })
    .then(res => res.json())
    .then(doc => {
      // console.log(doc);

      res.json({
        jsonld: doc
      });
    })
    .catch(err => console.log(err));
});

app.get("/createCity", async (req, res) => {
  let newCity_name = req.query.newCity_name;
  newAddedCities.push(newCity_name);
  var d_newCity = await get_newCity_Data(FinalData, dataString, newCity_name);
  res.json({
    message: `the ${newCity_name}  city has been added successfully ! `
  });
});
app.get("/weather/:latlon", async (req, res) => {
  console.log(req.params.latlon);
  var latlon = req.params.latlon;
  const url = `https://api.darksky.net/forecast/9e7042c94f627252694fde689da9a27f/${latlon}`;
  console.log(url);

  var fetch_response = await fetch(url);
  var json = await fetch_response.json();
  // console.log(json);

  res.json(json);
});
// parser Lyon: https://download.data.grandlyon.com/wfs/rdata?SERVICE=WFS&VERSION=1.1.0&outputformat=GEOJSON&request=GetFeature&typename=jcd_jcdecaux.jcdvelov&SRSNAME=urn:ogc:def:crs:EPSG::4171
// parser rennes

// socket actions

io.sockets.on("connection", function(socket) {
  socket.on("updateData", async function(data) {
    var lat = data[0];
    var lon = data[1];
    var commune = data[2];
    var zip_code = data[3];
    if (zip_code) {
      if (zip_code.match('^42')) {
        // var x  = FinalData.filter(station => 
        //   station.ZIP_CODE.contains(zip_code)
        // );
        
        var d = await get_Saintetienne_Data(
          [],
          [],
          [],
          FinalData,
          dataString
        );
        console.log("updated sainte RT");
      } else if (zip_code.match('^69')) {
        var d = await get_Lyon_Data(FinalData, dataString);
        console.log("updated lyon RT");
      } else {
        var d_newCity = await get_newCity_Data(FinalData, dataString, commune);
        console.log("updated", commune, " RT");
      }
    }
    
    // console.log(data[0]);
    var query = encodeURIComponent(`PREFIX ex: <http://example.org/#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rel: <http://relations.example.com/>
    
        SELECT ?station  ?lat  ?lon  ?FREE_BIKES ?EMPTY_SLOTS  ?LAST_UPDATE    
        WHERE {
          ?station a geo:SpatialThing. 
          ?station  geo:lat ?lat.
          ?station  geo:lon ?lon.
          ?station  rel:FREE_BIKES ?FREE_BIKES.
          ?station  rel:EMPTY_SLOTS ?EMPTY_SLOTS.
          ?station  rel:LAST_UPDATE ?LAST_UPDATE.
         
      FILTER (regex(str(?lat),"${lat}") && regex(str(?lon),"${lon}"))}`);
    fetch("http://localhost:3030/TestTripleStore/sparql", {
      credentials: "include",
      headers: {
        accept: "application/sparql-results+json,*/*;q=0.9",
        "accept-language":
          "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar-MA;q=0.6,ar;q=0.5",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      referrer: "http://localhost:3030/dataset.html",
      referrerPolicy: "no-referrer-when-downgrade",
      body: `query=${query}`,
      method: "POST",
      mode: "cors"
    })
      .then(res => res.json())
      .then(data => {
        console.log(" updated data sent to the city !");

        var resultData = data.results.bindings;
        // console.log(resultData[0]);
        // resultData[0].FREE_BIKES.value;
        // resultData[0].EMPTY_SLOTS.value;
        // resultData[0].LAST_UPDATE.value;
        socket.emit("dataUpdated", [
          resultData[0].FREE_BIKES.value,
          resultData[0].EMPTY_SLOTS.value,
          resultData[0].LAST_UPDATE.value
        ]);
      })
      .catch(err => console.error(err, "error socket fetch !"));
  });
});

/** Functions */
async function get_data(dataString, FinalData) {
  var d = await get_Saintetienne_Data(
    Sainte_si,
    Sainte_ss,
    Sainte_Data,
    FinalData,
    dataString
  );
  // console.log(d);

  var d2 = await get_Lyon_Data(FinalData, dataString); // bug: get_Lyon_Data(FinalData, dataString)
}
server.listen(PORT, () => {
  console.log(`listenning on ${PORT}`);
});
