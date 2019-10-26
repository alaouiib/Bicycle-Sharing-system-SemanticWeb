const fetch_data = require("./fetch_data");
const N3 = require("n3");
const { DataFactory } = N3;
const moment = require("moment");
const { namedNode, literal, defaultGraph, quad } = DataFactory;
const fs = require("fs");
var slugify = require("slugify");
module.exports = function get_Lyon_Data(FinalData, d) {
    return new Promise((resolve, reject)=>{
        fetch_data(
    "https://download.data.grandlyon.com/wfs/rdata?SERVICE=WFS&VERSION=1.1.0&outputformat=GEOJSON&request=GetFeature&typename=jcd_jcdecaux.jcdvelov&SRSNAME=urn:ogc:def:crs:EPSG::4171"
  )
    .then(response => {
      let stations = response.features;
      stations.forEach(station => {
        let station_data = station.properties;
        let element = {}; // station object
        element.station_id = station_data.gid;
        element.FREE_BIKES = Number.parseInt(station_data.available_bikes);
        element.EMPTY_SLOTS = Number.parseInt(
          station_data.available_bike_stands
        );
        element.TOTAL_SLOTS = element.FREE_BIKES + element.EMPTY_SLOTS;

        element.LAST_UPDATE = moment(station_data.last_update).unix();
        element.ZIP_CODE = Number.parseInt(station_data.code_insee);
        if (station_data.banking == true) {
          element.CB_PAYMENT = 1;
        } else {
          element.CB_PAYMENT = 0;
        }
        element.NAME = station_data.name;
        element.LATITUDE = station_data.lat;
        element.LONGITUDE = station_data.lng;
        element.ID = `${element.NAME}(${element.ZIP_CODE})`; // tu be slugifyed after
        if (station_data.address2) {
          element.ADDRESS = `${station_data.address} (${station_data.address2})`;
        } else element.ADDRESS = `${station_data.address}`;
        element.COMMUNE = station_data.commune;
        element.STATUS = station_data.status;
        FinalData.push(element);
      });
      
      console.log(`length after Lyon`, FinalData.length);

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
        var ID = slugify(station.ID, { remove: /[*+~./'()"!:]/g });
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
            EMPTY_SLOTS = 00  
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
        d += result;
        // writeStream.write(result);
        // writeStream.on("finish", () => {
        //   console.log("wrote Lyon's data to file");
        // });
        resolve(d);
    
        // close the stream
        writeStream.end();
        
        // console.log(result);
      });
    })
    .catch(err => console.log(err));
})
};
