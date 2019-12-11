const fetch_data = require("./fetch_data");
const N3 = require("n3");
const { DataFactory } = N3;
const moment = require("moment");
const { namedNode, literal, defaultGraph, quad } = DataFactory;
const fs = require("fs");
var slugify = require("slugify");
const fetch = require("node-fetch");

// { number: 10122,
//     contract_name: 'lyon',
//     name: '10122 - VERDUN / DESGRAND',
//     address: '17 RUE DE VERDUN (VILLEURBANNE)',
//     position: { lat: 45.784023, lng: 4.897102 },
//     banking: false,
//     bonus: false,
//     bike_stands: 21,
//     available_bike_stands: 9,
//     available_bikes: 12,
//     status: 'OPEN',
//     last_update: 1573419853000 }

module.exports = function get_createdCity_Data(FinalData, d, url, fileKeys, cityName) {
//   console.log("create city :");
//   console.log(fileKeys);
//   console.log('====',fileKeys.available_bikes);
  
  return new Promise((resolve, reject) => {
    fetch_data(url)
      .then(response => {
        let stations = response;
        stations.forEach(station => {
          let element = {}; // station object
          // element.station_id = station_data.gid;

          element.FREE_BIKES = Number.parseInt(station[fileKeys.available_bikes]);
          element.EMPTY_SLOTS = Number.parseInt(station[fileKeys.available_bike_stands]);
          element.TOTAL_SLOTS = element.FREE_BIKES + element.EMPTY_SLOTS;

          element.LAST_UPDATE = station[fileKeys.last_update];
          // get only 10 first digits of the unix number
          var str_lastUpd = element.LAST_UPDATE.toString();
          str_lastUpd = str_lastUpd
            .split("")
            .slice(0, 10)
            .join("");
          element.LAST_UPDATE = Number.parseInt(str_lastUpd);

          element.ZIP_CODE = Number.parseInt(station[fileKeys.code_postale]);
          if (station[fileKeys.banking] == true) {
            element.CB_PAYMENT = 1;
          } else {
            element.CB_PAYMENT = 0;
          }
          element.NAME = station.name;
          element.LATITUDE = station[fileKeys.position].lat;
          element.LONGITUDE = station[fileKeys.position].lng;
          element.ID = `${element.NAME}(${element.ZIP_CODE})`; // to be slugifyed after
          element.ADDRESS = `${station[fileKeys.address]}`;
          element.COMMUNE = station[fileKeys.commune];
          element.STATUS = station[fileKeys.status];
        //   console.log(element);
          
          FinalData.push(element);
        });

        console.log(`length after ${cityName}`, FinalData.length);
      })
      .then(() => {
        // let writeStream = fs.createWriteStream("./Project_data2.ttl");
        const writer = new N3.Writer({
          prefixes: {
            ex: "http://example.org/#",
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            geo: "http://www.w3.org/2003/01/geo/wgs84_pos#",
            xsd: "http://www.w3.org/2001/XMLSchema#",
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            rel: "http://relations.example.com/"
          }
        });

        FinalData.forEach(station => {
          var ID = slugify(station.ID, { remove: /[*+~./#'()"!:]/g });
          var NAME = slugify(station.NAME, { remove: /[*+~./'"!:]/g });
          var LATITUDE = station.LATITUDE;
          var LONGITUDE = station.LONGITUDE;
          var ADDRESS = station.ADDRESS; // address += commune + zip  (in some cases)
          var FREE_BIKES = station.FREE_BIKES;
          var EMPTY_SLOTS = station.EMPTY_SLOTS;
          var TOTAL_SLOTS = station.TOTAL_SLOTS;
          var CB_PAYMENT = station.CB_PAYMENT;
          var LAST_UPDATE = station.LAST_UPDATE; // to be changed later.. !!
          var ZIP_CODE = station.ZIP_CODE;
          var COMMUNE = station.COMMUNE;
          var STATUS = station.STATUS;
          // gestion data indispo

          if (isNaN(FREE_BIKES)) {
            FREE_BIKES = 00;
          }
          if (isNaN(EMPTY_SLOTS)) {
            EMPTY_SLOTS = 00;
          }
          if (isNaN(TOTAL_SLOTS)) {
            TOTAL_SLOTS = 00;
          }

          writer.addQuad(
            namedNode(`http://example.org/#${ID}`),
            namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            namedNode("http://www.w3.org/2003/01/geo/wgs84_pos#SpatialThing")
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
              literal(NAME, "fr")
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://www.w3.org/2003/01/geo/wgs84_pos#lat"),
              literal(
                LATITUDE,
                namedNode("http://www.w3.org/2001/XMLSchema#decimal")
              )
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://www.w3.org/2003/01/geo/wgs84_pos#lon"),
              literal(
                LONGITUDE,
                namedNode("http://www.w3.org/2001/XMLSchema#decimal")
              )
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/STATUS"),
              literal(STATUS)
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/ADDRESS"),
              literal(
                ADDRESS,
                namedNode("http://www.w3.org/2001/XMLSchema#langString")
              )
            )
          );

          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/FREE_BIKES"),
              literal(
                FREE_BIKES,
                namedNode("http://www.w3.org/2001/XMLSchema#integer")
              )
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/EMPTY_SLOTS"),
              literal(
                EMPTY_SLOTS,
                namedNode("http://www.w3.org/2001/XMLSchema#integer")
              )
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/TOTAL_SLOTS"),
              literal(
                TOTAL_SLOTS,
                namedNode("http://www.w3.org/2001/XMLSchema#integer")
              )
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/LAST_UPDATE"),
              literal(
                LAST_UPDATE,
                namedNode("http://www.w3.org/2001/XMLSchema#integer")
              )
            )
          );

          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/CB_PAYMENT"),
              literal(
                CB_PAYMENT,
                namedNode("http://www.w3.org/2001/XMLSchema#integer")
              )
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/ZIP_CODE"),
              literal(
                ZIP_CODE,
                namedNode("http://www.w3.org/2001/XMLSchema#integer")
              )
            )
          );
          writer.addQuad(
            quad(
              namedNode(`http://example.org/#${ID}`),
              namedNode("http://relations.example.com/COMMUNE"),
              literal(COMMUNE, "fr")
            )
          );
        });

        writer.end((error, result) => {
          // d += result;
          // writeStream.write(result);
          // writeStream.on("finish", () => {
          //   console.log("wrote Lyon's data to file");
          // });
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
            body: result
          })
            .then(res => res.json())
            .then(s => {
              // dataString = DataString;
              // console.log(dataString.length);
              // console.log(dataString);
              resolve(d);
              console.log("Done updating the triplestore !", s);
            })
            .catch(err => console.error(err));

          // close the stream
          writeStream.end();

          // console.log(result);
        });
      })
      .catch(err => console.log(err));
  });
};
