<template>
  <div class="home">
    <router-link to="/">
      <div id="nav">
        <b-button rounded style size="is-small" icon-left="arrow-left" icon-pack="fas">Map</b-button>
      </div>
    </router-link>

    <div class="container">
      <div class="columns">
        <div class="column">
          <div class="card">
            <div class="title">Station: {{label}}</div>

            <div>
              <div class="slotsInfo">
                <img class="bg-img-slotsInfo" :src="imgSrc" />
                <div class="panelInfo">
                  <div class="freebikes">
                    <img
                      title="free bike"
                      src="https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_velo_circle_green.png"
                    />

                    <p style="font-size:30px; ">{{FREE_BIKES}}</p>
                  </div>-
                  <div class="parkingslot">
                    <p style="font-size:30px; ">{{EMPTY_SLOTS}}</p>
                    <img
                      title="parking slot"
                      src="https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_parking_circle_grey.png"
                    />
                  </div>
                </div>
                <span class="last_update">Mise à jour il y'a {{LAST_UPDATE}} mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <blockquote>
        <p>
          <b>Note:</b>
          Le payement par carte est: (accepted or not) !{{CB_PAYMENT}}
        </p>
      </blockquote>
    </div>
    <div>
      <span class="icon has-text-info">
        <i class="fas fa-map-marker-alt"></i>
        <b>Adresse:</b>
        <p>{{ADDRESS}}</p>
      </span>
      <span class="icon has-text-info">
        <i class="fas fa-map-marker-alt"></i>
        <b>Code Postal:</b>
        <p>{{ZIP_CODE}}</p>
      </span>
    </div>
    <div class="container">
      <div class="columns">
        <div class="column">
          <div class="card">
            <p class="description">Le VéliVert, comment ça marche ?</p>
            <div class="o-video">
              <iframe
                src="https://www.youtube.com/embed/7ucBKUVPdWw"
                style="max-height:%;"
                width="560"
                frameborder="0"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2>Description:</h2>
        <p>
          VÉLIVERT, LE VÉLO DE SAINT-ÉTIENNE MÉTROPOLE !
          Une mobilité complémentaire aux transports en commun, est ainsi proposée.
          De nombreuses pistes cyclables sont disponibles dans l’agglomération.
          Vous pouvez aussi utiliser les voies bus.
          Un cadenas est inclus dans le vélo.
          Vous n’avez plus qu’à pédaler...
          N’hésitez plus et partez à l’assaut du territoire en compagnie de vos partenaires mobilité et tourisme !
        </p>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

// import Home from '@/components/Home.vue'
import "leaflet/dist/leaflet.css";
import moment from "moment";

export default {
  name: "stationComponent",
  components: {
    // make new component for each page
  },

  data() {
    return {
      stationData: [],
      ID: "",
      ZIP_CODE: "",
      ADDRESS: "",
      label: "",
      FREE_BIKES: 0,
      EMPTY_SLOTS: 0,
      LAST_UPDATE: null,
      CB_PAYMENT: 0, // initalized as No,
      imgSrc: "https://velov.grandlyon.com/assets/img/home/accueil-une-bg.jpg"
    };
  },
  methods: {},
  mounted() {
    var ID = this.$route.params.id;
    var ZIP_CODE = this.$route.params.ZIP_CODE;
    this.ID = ID;
    this.ZIP_CODE = ZIP_CODE;
    var query = `query=PREFIX+ex%3A+%3Chttp%3A%2F%2Fexample.org%2F%23%3E%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0APREFIX+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%0APREFIX+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0APREFIX+rel%3A+%3Chttp%3A%2F%2Frelations.example.com%2F%3E%0A%0A++++SELECT+%3Fstation+%3Flabel+%3Flat+%3Flon+%3FADDRESS+%3FFREE_BIKES+%3FEMPTY_SLOTS+%3FTOTAL_SLOTS+%3FLAST_UPDATE+%3FLAST_UPDATE+%3FCB_PAYMENT+%3FZIP_CODE+%3FCOMMUNE%0A++++WHERE+%7B%0A++%09++%3Fstation+a+geo%3ASpatialThing.+%0A++++++%3Fstation++rdfs%3Alabel+%3Flabel.%0A++++++%3Fstation++geo%3Alat+%3Flat.%0A++++++%3Fstation++geo%3Alon+%3Flon.%0A+++++%3Fstation++rel%3AADDRESS+%3FADDRESS.%0A++++++%3Fstation++rel%3AFREE_BIKES+%3FFREE_BIKES.%0A++++++%3Fstation+rel%3AEMPTY_SLOTS+%3FEMPTY_SLOTS.%0A++++++%3Fstation++rel%3ATOTAL_SLOTS+%3FTOTAL_SLOTS.%0A+++++%3Fstation++rel%3ALAST_UPDATE+%3FLAST_UPDATE.%0A++++++%3Fstation+rel%3ACB_PAYMENT+%3FCB_PAYMENT.%0A++++++%3Fstation++rel%3AZIP_CODE+%3FZIP_CODE+.%0A++++++%3Fstation++rel%3ACOMMUNE+%3FCOMMUNE.%0A++FILTER+regex(str(%3Fstation)%2C%22${ID}%22)%0A++%7D%0A`;
    this.$axios
      .post("http://localhost:3030/TestTripleStore/sparql", query)
      .then(result => {
        var data = result.data.results.bindings;
        this.stationData = data;
        this.ADDRESS = this.stationData[0].ADDRESS.value;
        this.label = this.stationData[0].label.value;
        this.FREE_BIKES = this.stationData[0].FREE_BIKES.value;
        this.EMPTY_SLOTS = this.stationData[0].EMPTY_SLOTS.value;
        this.LAST_UPDATE = this.stationData[0].LAST_UPDATE.value;
        this.CB_PAYMENT = this.stationData[0].CB_PAYMENT.value;
        var now = moment(new Date()).unix(); //todays date
        var diff = (now - this.LAST_UPDATE) / 60;
        this.LAST_UPDATE = Math.floor(diff);
        // lyon
        if (this.ZIP_CODE.match('^69')) {
          this.imgSrc = 'https://velov.grandlyon.com/assets/img/home/accueil-une-bg.jpg'
          
        }
        //sainte
        else if(this.ZIP_CODE.match('^42')){
          this.imgSrc = 'https://www.velivert.fr/sites/default/files/stationvelivert.jpg'
        }
        // document.write(this.stationData[0].lat.value)
      });

      
    // let vars = res.data.head.vars; //  features requested
    // let result = res.data.results.bindings; // results
  }
};
</script>
<style>
.o-video {
  width: 100%;
  height: 50%;
  position: relative;
  padding-top: 56.25%;
}
.o-video > iframe {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border: dashed 1px;
}
div.home {
  background: #f0ecec;
  max-height: 100%;
  margin: 10px 10px;
}
div#nav {
  text-align: left;
}
p.description {
  text-align: center;
  font: italic 35px/59px "Lobster Two";
  font-weight: 700;
  color: #393938;
  background: beige;
}
blockquote {
  font-style: normal;
  font-size: 16px;
  margin-left: 32px;
  font-family: Consolas, "Times New Roman", Verdana;
  border-left: 4px solid #ccc;
  padding-left: 8px;
}
div.slotsInfo {
  background-repeat: no-repeat;
  position: relative;
  padding: 0px;
}

img.bg-img-slotsInfo {
  opacity: 0.7;
  position: relative;
  height: 50%;
  width: 80%;
  /* margin: -5px auto; */
  margin-top: -2%;
  margin-bottom: -1%;
  border-radius: 4px;
  border: Solid 4px;
  border-color: rgb(212, 199, 199);
}
div.panelInfo {
  font-family: Ubuntu;
  font-weight: bold;
  padding: 15px 15px;
  padding-bottom: 10px;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffffc7;
  border-radius: 10px;
  margin: 0 auto;
}
.freebikes {
  display: inline;
  text-align: left;
}
.parkingslot {
  display: inline;
  text-align: right;
}
.freebikes p {
  margin-left: 10px;
}
.parkingslot p {
  margin-right: 5px;
}
div.title {
  text-align: center;
  font: italic 35px/59px "Lobster Two";
  font-weight: 700;
  color: #393938;
  background: beige;
  margin: 0;
  padding: 0;
}
div.card {
  margin: 40px;
}
span.last_update {
  text-align: center;
  display: block;
  margin: 0 auto;
  width: 30%;
  border-radius: 5px;
  /* box-shadow: 0 0 20px black; */
  border-bottom:crimson 5px;
}
</style>