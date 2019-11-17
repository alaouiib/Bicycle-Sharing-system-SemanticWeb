const fetch_data = require("./fetch_data");
const N3 = require("n3");
const fetch = require("node-fetch");

const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
const fs = require("fs");
var slugify = require("slugify");

module.exports = function get_Saintetienne_Data(Sainte_si, Sainte_ss, Sainte_Data, FinalData, dataString) {
    return new Promise((resolve, reject)=>{
        fetch_data(
            "https://saint-etienne-gbfs.klervi.net/gbfs/en/station_status.json"
          )
            .then(data => {
              data.data.stations.forEach(station => {
                let element = {};
                element.station_id = station.station_id;
                element.FREE_BIKES = station.num_bikes_available;
                element.EMPTY_SLOTS = station.num_docks_available;
                element.TOTAL_SLOTS = element.FREE_BIKES + element.EMPTY_SLOTS;
                element.LAST_UPDATE = station.last_reported;
                element.ZIP_CODE = 42000;
                element.CB_PAYMENT = 0;
                if (station.is_renting == 1) {
                    element.STATUS = "OPEN"
                }
                else element.STATUS = "CLOSED"
                Sainte_ss.push(element);
                // console.log(FinalData);
              });
            })
            .then(
              fetch_data(
                "https://saint-etienne-gbfs.klervi.net/gbfs/en/station_information.json"
              )
                .then(data =>
                  data.data.stations.forEach(station => {
                    let element = {};
                    element.station_id = station.station_id;
                    element.NAME = station.name;
                    element.LATITUDE = station.lat;
                    element.LONGITUDE = station.lon;
                    Sainte_si.push(element);
                  })
                )
                .catch(err => console.err(err))
            )
            .then(() => {
              //  console.log(Sainte_ss, Sainte_si);
              // FinalData = [];
              Sainte_si.forEach(el => { // fucking bug
                // element to store to the final table
                var elementToStore = Sainte_ss.find(item => {
                  return el.station_id == item.station_id;
                });
                elementToStore.NAME = el.NAME;
                elementToStore.LATITUDE = el.LATITUDE;
                elementToStore.LONGITUDE = el.LONGITUDE;
                elementToStore.ID = `${elementToStore.NAME}(${elementToStore.ZIP_CODE})`;
                elementToStore.ADDRESS = `${el.station_id} ${el.NAME} `;
                elementToStore.COMMUNE = "Saint-Etienne";
                Sainte_Data.push(elementToStore); // push data to saintne db
                FinalData.push(elementToStore); // push data to the global db

              });

                //  console.log('Sainte_si ',Sainte_si.length);
                // console.log(`length after Sainte`, FinalData.length);


            })
            .then(() => {
              // let rl = readline.createInterface({
              //     input: fs.createReadStream('stops.csv','utf-8')
              // });
              // var line_no = 0;
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
              console.log(`writing to sainte`,FinalData.length);
              
              FinalData.forEach(station => {
                var ID = slugify(station.ID, { remove: /[*+~.'()"/!:]/g });
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
                    FREE_BIKES = 00  
                } 
                if (isNaN(EMPTY_SLOTS)) {
                    TOTAL_SLOTS = 00  
                }
                  if (isNaN(TOTAL_SLOTS)) {
                    TOTAL_SLOTS = 00  
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
                      literal(
                        STATUS)
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
                // dataString += result;        
                // writeStream.write(result);
                // writeStream.on("finish", () => {
                //   console.log("wrote Saint-etienne's data to file");
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
                    console.log('done sainte');
                    
                    resolve(dataString);
                    console.log("Done updating the triplestore !", s);
                  })
                  .catch(err => console.error(err));
                // close the stream
                writeStream.end();
                // console.log(result);
              });
            })      

            .catch(err => console.log(err));
            
    })
};
