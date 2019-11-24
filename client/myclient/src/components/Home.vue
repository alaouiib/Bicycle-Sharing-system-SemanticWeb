<template>
  <div class="body">
    <div class="wrapper">
      <div class="flex-container">
        <div class="cities">
          <div
            v-for="(city, index) in cities"
            @click="selected(city)"
            class="box"
            :key="index"
          >
            <a @click="deleteItem(index)" class="delete is-small"></a>

            <img :src="boxImages[index]" alt="" />
            <p>{{ city.toUpperCase() }}</p>
          </div>
          <div
            :class="{ addCity, isHidden }"
            @click="
              isActive = !isActive;
              isInputDisabled = true;
              isHidden = true;
            "
          >
            <span class="icon addButton is-large">
              <i class="fas fa-plus-circle"></i>
            </span>
          </div>
          <b-message
            type="is-success"
            title="Ajouter ville:"
            :active.sync="isActive"
            aria-close-label="Close message"
            @close="isInputDisabled = !isInputDisabled"
          >
            <form @submit.prevent="addCity(selectedCity)">
              <input
                style="width:200px;"
                class="input is-focused"
                type="text"
                v-model="selectedCity"
                placeholder="Ajouter ville:"
              />
              <button style="margin-left:5px;" class="button">
                <span class="icon is-small">
                  <i class="fas fa-plus"></i>
                </span>
              </button>
            </form>
          </b-message>
        </div>
        <div class="map">
          <div class="searchInput" v-if="!isInputDisabled">
            <input
              @keyup="searchStation"
              class="input is-rounded"
              type="text"
              placeholder="Trouver station par Nom"
              v-model="stationTemp"
              :disabled="isInputDisabled"
            />
          </div>
          <div id="mapid" class="one"></div>
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

  data() {
    return {
      a: "working",
      list: [],
      features: [],
      mymap: null,
      markers: [],
      selectedCity: "",
      cities: ["saint-etienne", "lyon"],
      isActive: false,
      boxImages: [
        "https://citymapper.com/static/data/resources/switch-region-dude-chulapo@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-ahbeng@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-ayrton@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-aztec@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-barcelonagirl@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-birmingham@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-vasco@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-vespa@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-windywendy@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-yankees@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-dragonboat@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-ayrton@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-aztec@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-carabinier@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-rifthack@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-seattle@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-stockholm@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-timmy@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-top-hat@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-vancouver@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-vasco@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-vespa@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-windywendy@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-yankees@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-dragonboat@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-ayrton@2x.png",
        "https://citymapper.com/static/data/resources/switch-region-dude-aztec@2x.png"
      ],
      hover: true,
      possibleCities: [
        "Amiens",
        "Besançon",
        "Brisbane",
        "Cergy-Pontoise",
        "creteil",
        "Cordoue",
        "Dublin",
        "Gijon",
        "Goteborg",
        "Kazan",
        "Lillestrøm",
        "Ljubljana",
        "Luxembourg",
        "Lyon",
        "Marseille",
        "Mulhouse",
        "Namur",
        "Nancy",
        "Nantes",
        "Rouen",
        "Santander",
        "Seville",
        "Toulouse",
        "Toyama",
        "Valence",
        "Vienne",
        "Vilnius"
      ],
      stationTemp: "",
      isInputDisabled: true,
      isHidden: false
      // boxImageSrc: ''
    };
  },
  methods: {
    async searchStation(e) {
      // console.log(e.key);
      console.log(this.stationTemp);
      let stationFound = this.list.filter(station => {
        // console.log(station.label.value);
        return (
          station.ADDRESS.value
            .toLowerCase()
            .includes(this.stationTemp.toLowerCase()) ||
          station.station.value
            .toLowerCase()
            .includes(this.stationTemp.toLowerCase())
        );
      });
      // console.log(stationFound[0].ADDRESS.value);
      if (stationFound.length > 0) {
        this.markers.forEach(marker => {
          this.mymap.removeLayer(marker); // this: here refers to the map object
        });
        this.markers = [];
        stationFound.forEach(station => {
          var myIcon;
          if (
            station.FREE_BIKES.value == 0 ||
            station.FREE_BIKES.value == 1 ||
            station.FREE_BIKES.value == 2
          ) {
            myIcon = L.icon({
              iconUrl: `https://www.velivert.fr/sites/default/files/markers/rouge-${station.FREE_BIKES.value}.png`,
              iconSize: [40, 34],
              iconAnchor: [20, 17]
            });
          } else {
            // create new icons with photoshop
            if (station.FREE_BIKES.value <= 30) {
              myIcon = L.icon({
                iconUrl: `https://www.velivert.fr/sites/default/files/markers/vert-${station.FREE_BIKES.value}.png`,
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
          const marker = L.marker([station.lat.value, station.lon.value], {
            icon: myIcon
          }).addTo(this.mymap);
          // this.mymap.createPane("labels");
          // this.mymap.getPane("labels").style.zIndex = 650;
          let id = station.station.value.replace("http://example.org/#", "");
          // console.log('test id sss',id);

          let LAST_UPDATE = moment
            .unix(station.LAST_UPDATE.value)
            .format("DD/MM/YYYY à HH:mm:ss"); // YYYY-MM-DDTHH:mm:ss

          marker.bindPopup(
            `
          <div class='body'><p class='popuptitle'>${id}</p>
          <b>Adresse: </b>${station.ADDRESS.value} <br>
          <img title="free bike" class="freebikes"  src='https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_velo_circle_green.png'/> <p style = "font-size:13px; display:inline-block;">${station.FREE_BIKES.value}</p>
          <img title="parking slot" class="parkingslot" src='https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_parking_circle_grey.png'/> <p style = "font-size:13px; display:inline-block;">${station.EMPTY_SLOTS.value}</p><br>
           <b>Le:</b> ${LAST_UPDATE}<br>
           <a class ="more"  href="/station/${id}"> More Info > </a>
           </div>
          <style>
          img.freebikes{
          margin-left:10%;
          display:inline;
          margin-bottom:-5px;
          width: 20px;
          height : 20px;
          }
          img.parkingslot{
          margin-left:33%;
          display:inline;
          margin-bottom:-5px;
          width: 20px;
          height : 20px;
          }

          p.popuptitle{
            text-align:center;
            border:dashed 0.4px;
            border-radius: 10px;
            font-weight: bold;
            display:relative;
            font-style: italic;
            font-variant: small-caps;
          }
          a.more {
            display:block;
            border-radius: 5px;
            color:green;
            text-align:center;
            text-decoration: none!important;
            width:45%;
            margin:0 auto;
          }
          a.more:hover {
            color: black!important;
            background:#f4f4f4;
          }
          </style>`
          );
          this.markers.push(marker);
        });
      } else {
        console.log("station pas existante !");
      }
    },
    async deleteItem(index) {
      this.cities.splice(index, 1);
      localStorage.setItem("cities", JSON.stringify(this.cities));
    },
    async make_request(query, zoom) {
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
        this.mymap.flyTo(
          [
            this.list[Math.floor(this.list.length / 2)].lat.value,
            this.list[Math.floor(this.list.length / 2)].lon.value
          ],
          zoom,
          {
            animate: true,
            duration: 1
          }
        );
        let ADDRESS = this.list[result].ADDRESS.value;
        let ZIP_CODE = this.list[result].ZIP_CODE.value;
        let FREE_BIKES = this.list[result].FREE_BIKES.value;
        let EMPTY_SLOTS = this.list[result].EMPTY_SLOTS.value;

        let label = this.list[result].label.value
          .replace(/#/gi, "")
          .replace("-", "");
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
          `
          <div class='body'><p class='popuptitle'>${label}</p>
          <b>Adresse: </b>${ADDRESS} <br>
          <img title="free bike" class="freebikes"  src='https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_velo_circle_green.png'/> <p style = "font-size:13px; display:inline-block;">${FREE_BIKES}</p>
          <img title="parking slot" class="parkingslot" src='https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_parking_circle_grey.png'/> <p style = "font-size:13px; display:inline-block;">${EMPTY_SLOTS}</p><br>
           <b>Le:</b> ${LAST_UPDATE}<br>
           <a class ="more"  href="/station/${ID}"> More Info > </a>
           </div>
          <style>
          img.freebikes{
          margin-left:10%;
          display:inline;
          margin-bottom:-5px;
          width: 20px;
          height : 20px;
          }
          img.parkingslot{
          margin-left:33%;
          display:inline;
          margin-bottom:-5px;
          width: 20px;
          height : 20px;
          }

          p.popuptitle{
            text-align:center;
            border:dashed 0.4px;
            border-radius: 10px;
            font-weight: bold;
            display:relative;
            font-style: italic;
            font-variant: small-caps;
          }
          a.more {
            display:block;
            border-radius: 5px;
            color:green;
            text-align:center;
            text-decoration: none!important;
            width:45%;
            margin:0 auto;
          }
          a.more:hover {
            color: black!important;
            background:#f4f4f4;
          }
          </style>`
        );
        this.markers.push(marker);
      }
    },
    async addCity(cityName) {
      const loadingComponent = this.$buefy.loading.open();

      this.isHidden = false;
      if (this.cities.indexOf(cityName) == -1) {
        cityName = cityName.toLowerCase();
        var cityItem = this.possibleCities.filter(city => {
          return city.toLowerCase() == cityName;
        });
        console.log(this.cities);

        if (cityItem.length > 0) {
          this.cities.push(cityName);
          this.selectedCity = "";
          // console.log(cityName);
          this.isActive = !this.isActive;
          localStorage.setItem("cities", JSON.stringify(this.cities));
          // fetch data from server
          var requestData = await this.$axios.get(
            `http://localhost:3000/createCity?newCity_name=${cityName}`
          );
          setTimeout(() => {
            loadingComponent.close();
            this.$buefy.snackbar.open(
              `${cityName.toUpperCase()} est ajouté avec success !`
            );
          }, 500);
        } else {
          this.isHidden = true;
          setTimeout(() => {
            loadingComponent.close();
            this.$buefy.snackbar.open({
              message: `${cityName.toUpperCase()} n'est pas encore supporté 🥺`,
              type: "is-warning",
              position: "is-top"
            });
          }, 500);
        }
      } else {
        this.$buefy.snackbar.open(
          `${cityName.toUpperCase()} Est deja dans la liste des villes !`
        );
      }
    },
    async selected(Name) {
      // console.log(Name);
      this.isInputDisabled = false;
      this.stationTemp = "";
      this.markers.forEach(marker => {
        this.mymap.removeLayer(marker); // this: here refers to the map object
      });
      this.markers = [];

      if (Name == "lyon") {
        let flag = -1;
        let requestDone = false;
        let queryLyon = encodeURIComponent(`PREFIX ex: <http://example.org/#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rel: <http://relations.example.com/>

    SELECT ?station ?label ?lat ?STATUS ?lon ?ADDRESS ?FREE_BIKES ?EMPTY_SLOTS ?TOTAL_SLOTS ?LAST_UPDATE ?LAST_UPDATE ?CB_PAYMENT ?ZIP_CODE ?COMMUNE
    WHERE {
  	  ?station a geo:SpatialThing.
      ?station  rdfs:label ?label.
      ?station  geo:lat ?lat.
      ?station  geo:lon ?lon.
      ?station  rel:ADDRESS ?ADDRESS.
      ?station  rel:FREE_BIKES ?FREE_BIKES.
      ?station rel:EMPTY_SLOTS ?EMPTY_SLOTS.
      ?station  rel:TOTAL_SLOTS ?TOTAL_SLOTS.
      ?station  rel:LAST_UPDATE ?LAST_UPDATE.
      ?station  rel:STATUS ?STATUS.
	   ?station rel:CB_PAYMENT ?CB_PAYMENT.
      ?station  rel:ZIP_CODE ?ZIP_CODE .
      ?station  rel:COMMUNE ?COMMUNE.
      FILTER (regex(str(?ZIP_CODE),"^69[0-9]+"))
      }
      ORDER BY DESC(?lat)
      LIMIT 100
  `);

        this.make_request(`query=${queryLyon}`, 10);
        this.mymap.on("zoomend", function(e) {
          // console.log(this.getZoom());
          let zoom = this.getZoom();
          if (zoom > 11) {
            queryLyon = encodeURIComponent(`PREFIX ex: <http://example.org/#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rel: <http://relations.example.com/>

    SELECT ?station ?label ?lat ?STATUS ?lon ?ADDRESS ?FREE_BIKES ?EMPTY_SLOTS ?TOTAL_SLOTS ?LAST_UPDATE ?LAST_UPDATE ?CB_PAYMENT ?ZIP_CODE ?COMMUNE
    WHERE {
  	  ?station a geo:SpatialThing.
      ?station  rdfs:label ?label.
      ?station  geo:lat ?lat.
      ?station  geo:lon ?lon.
      ?station  rel:ADDRESS ?ADDRESS.
      ?station  rel:FREE_BIKES ?FREE_BIKES.
      ?station rel:EMPTY_SLOTS ?EMPTY_SLOTS.
      ?station  rel:TOTAL_SLOTS ?TOTAL_SLOTS.
      ?station  rel:LAST_UPDATE ?LAST_UPDATE.
      ?station  rel:STATUS ?STATUS.
	   ?station rel:CB_PAYMENT ?CB_PAYMENT.
      ?station  rel:ZIP_CODE ?ZIP_CODE .
      ?station  rel:COMMUNE ?COMMUNE.
      FILTER (regex(str(?ZIP_CODE),"^69[0-9]+"))
      }
      ORDER BY DESC(?lat)
      `);

            //  this.make_request(`query=${queryLyon}`);
            flag = 1;
            requestDone = true;
            console.log("zoom 13 depasse", flag);
          }
        });
        if (!requestDone) {
          var inerval = setInterval(() => {
            if (flag == 1) {
              console.log("make request here");
              this.make_request(`query=${queryLyon}`, this.mymap.getZoom());
              flag = -1;
              clearInterval(inerval);
            }
          }, 100);
        } else {
          console.log("request already done !");
        }

        // to do: load just 100 stations, map.onZoom load more stations
      } else if (Name == "saint-etienne") {
        let querySainte = encodeURIComponent(`PREFIX ex: <http://example.org/#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rel: <http://relations.example.com/>

    SELECT ?station ?label ?lat ?STATUS ?lon ?ADDRESS ?FREE_BIKES ?EMPTY_SLOTS ?TOTAL_SLOTS ?LAST_UPDATE ?LAST_UPDATE ?CB_PAYMENT ?ZIP_CODE ?COMMUNE
    WHERE {
  	  ?station a geo:SpatialThing.
      ?station  rdfs:label ?label.
      ?station  geo:lat ?lat.
      ?station  geo:lon ?lon.
      ?station  rel:ADDRESS ?ADDRESS.
      ?station  rel:FREE_BIKES ?FREE_BIKES.
      ?station rel:EMPTY_SLOTS ?EMPTY_SLOTS.
      ?station  rel:TOTAL_SLOTS ?TOTAL_SLOTS.
      ?station  rel:LAST_UPDATE ?LAST_UPDATE.
      ?station  rel:STATUS ?STATUS.
	   ?station rel:CB_PAYMENT ?CB_PAYMENT.
      ?station  rel:ZIP_CODE ?ZIP_CODE .
      ?station  rel:COMMUNE ?COMMUNE.
  FILTER (regex(str(?ZIP_CODE),"^42[0-9]+"))
  }`);
        this.make_request(`query=${querySainte}`, 10);
      } else {
        let flag = -1;
        let requestDone = false;
        let queryNewCity = encodeURIComponent(`PREFIX ex: <http://example.org/#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rel: <http://relations.example.com/>

    SELECT ?station ?label ?lat ?STATUS ?lon ?ADDRESS ?FREE_BIKES ?EMPTY_SLOTS ?TOTAL_SLOTS ?LAST_UPDATE ?LAST_UPDATE ?CB_PAYMENT ?ZIP_CODE ?COMMUNE
    WHERE {
  	  ?station a geo:SpatialThing.
      ?station  rdfs:label ?label.
      ?station  geo:lat ?lat.
      ?station  geo:lon ?lon.
      ?station  rel:ADDRESS ?ADDRESS.
      ?station  rel:FREE_BIKES ?FREE_BIKES.
      ?station rel:EMPTY_SLOTS ?EMPTY_SLOTS.
      ?station  rel:TOTAL_SLOTS ?TOTAL_SLOTS.
      ?station  rel:LAST_UPDATE ?LAST_UPDATE.
      ?station  rel:STATUS ?STATUS.
	    ?station   rel:CB_PAYMENT ?CB_PAYMENT.
      ?station  rel:ZIP_CODE ?ZIP_CODE .
      ?station  rel:COMMUNE ?COMMUNE.
  FILTER regex(str(?COMMUNE),"${Name}")
  }
  LIMIT 150`);

        this.make_request(`query=${queryNewCity}`, 10);
        this.mymap.on("zoomend", function(e) {
          // console.log(this.getZoom());
          let zoom = this.getZoom();
          if (zoom > 11) {
            queryNewCity = encodeURIComponent(`PREFIX ex: <http://example.org/#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rel: <http://relations.example.com/>

    SELECT ?station ?label ?lat ?STATUS ?lon ?ADDRESS ?FREE_BIKES ?EMPTY_SLOTS ?TOTAL_SLOTS ?LAST_UPDATE ?LAST_UPDATE ?CB_PAYMENT ?ZIP_CODE ?COMMUNE
    WHERE {
  	  ?station a geo:SpatialThing.
      ?station  rdfs:label ?label.
      ?station  geo:lat ?lat.
      ?station  geo:lon ?lon.
      ?station  rel:ADDRESS ?ADDRESS.
      ?station  rel:FREE_BIKES ?FREE_BIKES.
      ?station  rel:EMPTY_SLOTS ?EMPTY_SLOTS.
      ?station  rel:TOTAL_SLOTS ?TOTAL_SLOTS.
      ?station  rel:LAST_UPDATE ?LAST_UPDATE.
      ?station  rel:STATUS ?STATUS.
	    ?station  rel:CB_PAYMENT ?CB_PAYMENT.
      ?station  rel:ZIP_CODE ?ZIP_CODE .
      ?station  rel:COMMUNE ?COMMUNE.
      FILTER regex(str(?COMMUNE),"${Name}")
      }
      ORDER BY DESC(?lat)
      `);
            //  this.make_request(`query=${queryLyon}`);
            flag = 1;
            requestDone = true;
            console.log("zoom 13 depasse", flag);
          }
        });
        if (!requestDone) {
          var inerval2 = setInterval(() => {
            if (flag == 1) {
              console.log("make request here");
              this.make_request(`query=${queryNewCity}`, this.mymap.getZoom());
              flag = -1;
              clearInterval(inerval2);
            }
          }, 100);
        } else {
          console.log("request already done !");
        }
      }
    },
    test() {
      // console.log("Done  khedama!");
    }
  },
  mounted() {
    if (JSON.parse(localStorage.getItem("cities")).length > 0) {
      this.cities = JSON.parse(localStorage.getItem("cities"));
      // console.log(this.cities);
    } else {
      console.log("empty ");
    }

    this.mymap = L.map("mapid");
    this.mymap.setView([48.864716, 2.349014], 7);

    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const tiles = L.tileLayer(tileUrl, { attribution });
    tiles.addTo(this.mymap);
    // load data on exploring the map
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

.body {
  background: #f4f4f4;
}
.wrapper {
  width: 100%;
  max-width: 1050px;
  margin: 0 auto;
}
.flex-container {
  display: flex;
  background: white;
  flex-wrap: wrap;
  justify-content: space;
  background: #f4f4f4;
  margin-left: -30px;
  padding: 20px;
}

.cities {
  display: flex;
  flex-wrap: wrap;
  width: 400px;
  margin-left: -3%;
  /* max-width: 100%; */
  justify-content: space-around;
  /* margin-top: 5px; */

  /* justify-content: start; */
}
a.delete {
  margin-top: -20%;
  margin-left: 100%;
}
.isHidden {
  display: none;
}
div.box {
  height: 130px;
  /* background: rgb(178, 231, 218); */
  flex-basis: 120px;
  background-repeat: no-repeat;
  position: relative;
  background: #c6f5cc;
  /* text-align: justify; */
}
div.box:hover {
  background-color: rgba(107, 145, 160, 0.26);
}

div.box img {
  height: 80px;
  width: 100%;
  display: inline-block;
  margin-top: -38px;
}

div.box p {
  color: rgb(92, 65, 65);
  /* background: red; */
  width: 90%;
  font-size: smaller;
  margin-top: -4px;

  /* margin: 20px auto; */
}

div.addCity {
  height: 130px;
  flex-basis: 110px;
  border: dashed 2px #66a4e3;
  border-radius: 6px;
}
div.addCity:hover {
  background: rgba(107, 145, 160, 0.26);
}
.addButton {
  margin: 40px auto;
}
.map {
  display: flex;
  flex-wrap: wrap;

  /* justify-content: flex-start; */
}
#mapid {
  height: 400px;
  z-index: 0;
  border-radius: 6px;
  border: dotted white 2px;
  flex: 1 0 650px;
  margin-left: 30px;
}
.searchInput {
  flex: 1 0 350px;
  margin-left: 167px;
  margin-top: -8px;
  margin-bottom: 2px;
}
</style>
