<template>
  <div class="hello">
    <div class="container is-widescreen">
      <div class="notification">
        <div class="columns is-mobile">
          <div class="column">
            <b-field label="Select City:">
              <b-select
                @input="selected"
                v-model="selectedCity"
                placeholder="Select a character"
                rounded
              >
                <option value="Lyon">Lyon</option>
                <option value="Saint-Etienne">Saint-Etienne</option>
              </b-select>
            </b-field>
          </div>
          <div class="column is-10">
            <section>
              <div id="mapid"></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import moment from "moment";

export default {
  name: "Home",
  props: {
    // msg: String
  },
  data() {
    return {
      a: "working",
      list: [],
      features: [],
      mymap: null,
      markers: [],
      selectedCity: ""
    };
  },
  methods: {
    async make_request(query) {
      const res = await this.$axios.post(
        "http://localhost:3030/TestTripleStore/sparql",
        query
      );
      let vars = res.data.head.vars; //  features requested
      let result = res.data.results.bindings; // results
      this.list = result;
      this.features = vars;
      //   console.log(this.list);
      // document.write((JSON.stringify(this.list[0].station.value)).replace('http://example.org/#',''));

      for (let result = 0; result < this.list.length; result++) {
        let ID = this.list[result].station.value.replace(
          "http://example.org/#",
          ""
        );
        let lat = this.list[result].lat.value;
        let lon = this.list[result].lon.value;
        let ADDRESS = this.list[result].ADDRESS.value;
        let ZIP_CODE = this.list[result].ZIP_CODE.value;

        let FREE_BIKES = this.list[result].FREE_BIKES.value;
        let EMPTY_SLOTS = this.list[result].EMPTY_SLOTS.value;
       
        let label = this.list[result].label.value;
        let LAST_UPDATE = this.list[result].LAST_UPDATE.value;
        LAST_UPDATE = moment.unix(LAST_UPDATE).format("DD/MM/YYYY à HH:mm:ss"); // YYYY-MM-DDTHH:mm:ss
        var myIcon;
        if (FREE_BIKES == 0 || FREE_BIKES == 1 || FREE_BIKES == 2) {
          myIcon = L.icon({
            iconUrl: `https://www.velivert.fr/sites/default/files/markers/rouge-${FREE_BIKES}.png`,

            iconSize: [40, 34],
            iconAnchor: [20, 17]
          });
        } else {
          // create new icons with photoshop
          if (FREE_BIKES <= 30) {
            myIcon = L.icon({
              iconUrl: `https://www.velivert.fr/sites/default/files/markers/vert-${FREE_BIKES}.png`,
              iconSize: [40, 34],
              iconAnchor: [20, 17]
            });
          } else {
            myIcon = L.icon({
              iconUrl: `https://www.velivert.fr/sites/default/files/markers/vert-30plus.png`,
              iconSize: [40, 34],
              iconAnchor: [20, 17]
            });
          }
        }

        const marker = L.marker([lat, lon], { icon: myIcon }).addTo(this.mymap);

        this.mymap.createPane("labels");
        this.mymap.getPane("labels").style.zIndex = 650;

        marker.bindPopup(
          `<b>Adresse: </b>${ADDRESS} <br> 
          <img title="free bike" style = "margin-left: 15px; display:inline; margin-bottom:-5px;" width = '20px' height = '10px' src='https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_velo_circle_green.png'/> <p style = "display:inline;">${FREE_BIKES}</p>
          <img title="parking slot" style = "margin-left: 63px; display:inline; margin-bottom:-5px;" width = '20px' height = '10px' src='https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_parking_circle_grey.png'/> <p style = "display:inline;">${EMPTY_SLOTS}</p><br>

           <b>Nom:</b> ${label}<br>
           <b>At time:</b> ${LAST_UPDATE}<br>
           <a style="padding-left: 50px;
          text-decoration: none ;color:grey; text-align:right;" href="/station/${ZIP_CODE}/${ID}"><b >More Info..</b></a>`
        );
        this.markers.push(marker);
      }
    },
    selected(Name) {
      // this.markers = [];
      this.markers.forEach(marker => {
        this.mymap.removeLayer(marker); // this: here refers to the map object
      });

      if (Name == "Lyon") {
        // this.mymap.setView([45.75, 4.85], this.mymap.getZoom(), {
        //   animate: true,
        //   pan: {
        //     duration: 2
        //   }
        // });
        // setTimeout(() => {
        //   if (this.mymap.getZoom() <= 7 || this.mymap.getZoom() > 10) {
        //     this.mymap.setZoom(10);
        //     console.log(this.mymap.getZoom());
        //   }
        // }, 2100);
        this.mymap.flyTo([45.75, 4.85], 10, {
          animate: true,
          duration: 1
        });
        this.make_request(
          `query=PREFIX+ex%3A+%3Chttp%3A%2F%2Fexample.org%2F%23%3E%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0APREFIX+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%0APREFIX+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0APREFIX+rel%3A+%3Chttp%3A%2F%2Frelations.example.com%2F%3E%0A%0A++++SELECT+%3Fstation+%3Flabel+%3Flat+%3Flon+%3FADDRESS+%3FFREE_BIKES+%3FEMPTY_SLOTS+%3FTOTAL_SLOTS+%3FLAST_UPDATE+%3FLAST_UPDATE+%3FCB_PAYMENT+%3FZIP_CODE+%3FCOMMUNE%0A++++WHERE+%7B%0A++%09+++%3Fstation+a+%3Fid.+%0A++++++%3Fstation++rdfs%3Alabel+%3Flabel.%0A++++++%3Fstation++geo%3Alat+%3Flat.%0A++++++%3Fstation++geo%3Alon+%3Flon.%0A++++++%3Fstation++rel%3AADDRESS+%3FADDRESS.%0A++++++%3Fstation++rel%3AFREE_BIKES+%3FFREE_BIKES.%0A++++++%3Fstation++rel%3AEMPTY_SLOTS+%3FEMPTY_SLOTS.%0A++++++%3Fstation++rel%3ATOTAL_SLOTS+%3FTOTAL_SLOTS.%0A++++++%3Fstation++rel%3ALAST_UPDATE+%3FLAST_UPDATE.%0A++++++%3Fstation++rel%3ACB_PAYMENT+%3FCB_PAYMENT.%0A++++++%3Fstation++rel%3AZIP_CODE+%3FZIP_CODE.%0A++++++%3Fstation++rel%3ACOMMUNE+%3FCOMMUNE.%0A++++FILTER+(regex(str(%3FZIP_CODE)%2C+%22%5E69%22))%0A++%7D%0A`
        );
      } else if (Name == "Saint-Etienne") {
        // this.mymap.setView([45.439695, 4.3871779], this.mymap.getZoom(), {
        //   animate: true,
        //   pan: {
        //     duration: 2
        //   }
        // });
        // setTimeout(() => {
        //   if (this.mymap.getZoom() <= 7 || this.mymap.getZoom() > 10) {
        //     this.mymap.setZoom(10);
        //     console.log(this.mymap.getZoom());
        //   }
        // }, 2100);
        this.mymap.flyTo([45.439695, 4.3871779], 10, {
          animate: true,
          duration: 1
        });
        this.make_request(
          `query=PREFIX+ex%3A+%3Chttp%3A%2F%2Fexample.org%2F%23%3E%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0APREFIX+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%0APREFIX+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0APREFIX+rel%3A+%3Chttp%3A%2F%2Frelations.example.com%2F%3E%0A%0A++++SELECT+%3Fstation+%3Flabel+%3Flat+%3Flon+%3FADDRESS+%3FFREE_BIKES+%3FEMPTY_SLOTS+%3FTOTAL_SLOTS+%3FLAST_UPDATE+%3FLAST_UPDATE+%3FCB_PAYMENT+%3FZIP_CODE+%3FCOMMUNE%0A++++WHERE+%7B%0A++%09+++%3Fstation+a+%3Fid.+%0A++++++%3Fstation++rdfs%3Alabel+%3Flabel.%0A++++++%3Fstation++geo%3Alat+%3Flat.%0A++++++%3Fstation++geo%3Alon+%3Flon.%0A++++++%3Fstation++rel%3AADDRESS+%3FADDRESS.%0A++++++%3Fstation++rel%3AFREE_BIKES+%3FFREE_BIKES.%0A++++++%3Fstation++rel%3AEMPTY_SLOTS+%3FEMPTY_SLOTS.%0A++++++%3Fstation++rel%3ATOTAL_SLOTS+%3FTOTAL_SLOTS.%0A++++++%3Fstation++rel%3ALAST_UPDATE+%3FLAST_UPDATE.%0A++++++%3Fstation++rel%3ACB_PAYMENT+%3FCB_PAYMENT.%0A++++++%3Fstation++rel%3AZIP_CODE+%3FZIP_CODE.%0A++++++%3Fstation++rel%3ACOMMUNE+%3FCOMMUNE.%0A++++FILTER+(regex(str(%3FZIP_CODE)%2C+%22%5E42%22))%0A++%7D%0A`
        );
      }
    },
    test() {
      // console.log("Done  khedama!");
    }
  },
  mounted() {
    this.mymap = L.map("mapid");
    this.mymap.setView([48.864716, 2.349014], 7);

    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const tiles = L.tileLayer(tileUrl, { attribution });
    tiles.addTo(this.mymap);
    // load data on exploring the map

    if (this.selectedCity) {
      // console.log(this.selectedCity);
    }

    // test
    // // fin test
    // this.make_request(`query=PREFIX ex: <http://example.org/#>
    // PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    // PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    // PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    // PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    // PREFIX rel: <http://relations.example.com/>

    // SELECT ?label ?lat ?lon ?ADDRESS ?FREE_BIKES ?EMPTY_SLOTS ?TOTAL_SLOTS ?LAST_UPDATE ?LAST_UPDATE ?CB_PAYMENT ?ZIP_CODE ?COMMUNE
    // WHERE {
    //   ?station  rdfs:label ?label.
    //   ?station  geo:lat ?lat.
    //   ?station  geo:lon ?lon.
    //   ?station  rel:ADDRESS ?ADDRESS.
    //   ?station  rel:FREE_BIKES ?FREE_BIKES.
    //   ?station  rel:EMPTY_SLOTS ?EMPTY_SLOTS.
    //   ?station  rel:TOTAL_SLOTS ?TOTAL_SLOTS.
    //   ?station  rel:LAST_UPDATE ?LAST_UPDATE.
    //   ?station  rel:CB_PAYMENT ?CB_PAYMENT.
    //   ?station  rel:ZIP_CODE ?ZIP_CODE.
    //   ?station  rel:COMMUNE ?COMMUNE.
    // }`);

    // setInterval(() => {
    //   this.markers.forEach(marker => {
    //     this.mymap.removeLayer(marker);
    //   });
    //   this.markers = [];
    //   this.make_request(`query=PREFIX ex: <http://example.org/#>
    // PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    // PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    // PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    // PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    // PREFIX rel: <http://relations.example.com/>

    // SELECT ?label ?lat ?lon ?ADDRESS ?FREE_BIKES ?EMPTY_SLOTS ?TOTAL_SLOTS ?LAST_UPDATE ?LAST_UPDATE ?CB_PAYMENT ?ZIP_CODE ?COMMUNE
    // WHERE {
    //   ?station  rdfs:label ?label.
    //   ?station  geo:lat ?lat.
    //   ?station  geo:lon ?lon.
    //   ?station  rel:ADDRESS ?ADDRESS.
    //   ?station  rel:FREE_BIKES ?FREE_BIKES.
    //   ?station  rel:EMPTY_SLOTS ?EMPTY_SLOTS.
    //   ?station  rel:TOTAL_SLOTS ?TOTAL_SLOTS.
    //   ?station  rel:LAST_UPDATE ?LAST_UPDATE.
    //   ?station  rel:CB_PAYMENT ?CB_PAYMENT.
    //   ?station  rel:ZIP_CODE ?ZIP_CODE.
    //   ?station  rel:COMMUNE ?COMMUNE.
    // }`);
    // }, 120000); // each 13 second after updating data in the server.
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li {
  display: inline;
  list-style: none; /* pour enlever les puces sur IE7 */
  margin: 10px;
}
#mapid {
  height: 400px;
  /* margin-left: 30%; */
  margin-right: 10%;
}
</style>
