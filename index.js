const express = require("express");
const fetch = require("node-fetch");
const PORT = 3000;
const app = express();
const fs = require("fs");
const readline = require("readline");
let FinalData = [];
let Sainte_Data = [];
let Sainte_ss = [];
let Sainte_si = [];
let dataString = "";
// let Lyon_Data = [];
const get_Saintetienne_Data = require("./saint-etienne-data");
const get_Lyon_Data = require("./lyon-data");
setInterval(() => {
  dataString = "";
  FinalData = [];
  Sainte_si = [];
  Sainte_ss = [];
  get_data(dataString, FinalData);
}, 3000);

// parser Lyon: https://download.data.grandlyon.com/wfs/rdata?SERVICE=WFS&VERSION=1.1.0&outputformat=GEOJSON&request=GetFeature&typename=jcd_jcdecaux.jcdvelov&SRSNAME=urn:ogc:def:crs:EPSG::4171
// parser rennes
// the other ones..


function get_data(dataString, FinalData) {
  get_Saintetienne_Data(
    Sainte_si,
    Sainte_ss,
    Sainte_Data,
    FinalData,
    dataString
  ).then(d => {
    // FinalData=[];
    console.log(d.length, FinalData.length);
    get_Lyon_Data(FinalData, d) // bug: get_Lyon_Data(FinalData, dataString)
      .then(DataString => {
        // update the file
        fetch("http://localhost:3030/TestTripleStore/data?graph=default", {
          credentials: "omit",
          method: "PUT",
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language":
              "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar-MA;q=0.6,ar;q=0.5",
            "content-type": "text/turtle; charset=UTF-8",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
          },
          referrer: "http://localhost:3030/dataset.html",
          referrerPolicy: "no-referrer-when-downgrade",
          body: DataString
        })
          .then(res => res.json())
          .then(s => console.log("Done updating the triplestore !", s))
          .catch(err => console.error());
      });
  });
  // .then(DataString => {
  //   let writeStream = fs.createWriteStream("./Project_data2.ttl");
  //   writeStream.write(DataString);
  //   writeStream.on("finish", () => {
  //       console.log("wrote Lyon's data to file");
  //     })
  //     return DataString;

  //   })
}
app.listen(PORT, () => {
  console.log(`listenning on ${PORT}`);
});
