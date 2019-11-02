<template>
  <div class="home">
    <div id="nav">
      <b-tooltip position="is-right" label="Map">
        <router-link to="/">
          <b-button
            class="button is-primary is-outlined"
            style
            size="is-small"
            icon-left="arrow-left"
            icon-pack="fas"
          ></b-button>
        </router-link>
      </b-tooltip>
    </div>

    <div class="container">
      <div class="columns">
        <div class="column" style="margin-bottom: -80px; margin-top: -9%;">
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

                    <p>{{FREE_BIKES}} Libres Vélos</p>
                  </div>&#9830;
                  <div class="parkingslot">
                    <p>{{EMPTY_SLOTS}} Quais Vides</p>
                    <img
                      title="parking slot"
                      src="https://www.velivert.fr/sites/all/themes/smoove_bootstrap/images/icon_parking_circle_grey.png"
                    />
                  </div>
                </div>

                <span class="last_update">
                  <i class="fas fa-clock"></i>
                  Mis à jour il y'a {{LAST_UPDATE}} mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="columns">
        <div class="column">
          <div class="card">
            <ul class="postalInfoDiv">
              <li>
                <span class="icon has-text">
                  <i class="fas fa-map-marker-alt"></i>
                </span>
                <p>{{ADDRESS}}</p>
              </li>

              <li>
                <span class="icon has-text">
                  <i class="fas fa-globe"></i>
                </span>
                <p>{{COMMUNE}}, {{ZIP_CODE}}</p>
              </li>

              <li>
                <span class="icon has-text-info">
                  <i class="fas fa-info-circle"></i>
                </span>
                <p>Le Payement Par Carte Bancaire 💳{{is_CB_accepted}}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="columns">
        <div class="column" style="margin-top: -8%;">
          <div class="card">
            <p class="description">{{companyName}}, comment ça marche ?</p>
            <div v-html="videoIntegrationCode" class="o-video">
              <!-- <iframe :src="videoSrc" style="max-height:%;" width="560" frameborder="0"></iframe> -->
            </div>
            <div class="companyDescription">
              <h2>{{companyName}}</h2>
              <p>{{companyDesc}}</p>
            </div>
          </div>
        </div>
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
      companyName: "",
      companyDesc: ``,
      ZIP_CODE: "",
      COMMUNE: "",
      ADDRESS: "",
      label: "",
      FREE_BIKES: 0,
      EMPTY_SLOTS: 0,
      LAST_UPDATE: null,
      CB_PAYMENT: 0, // initalized as No,
      is_CB_accepted: "",
      imgSrc: "https://velov.grandlyon.com/assets/img/home/accueil-une-bg.jpg",
      videoIntegrationCode: `<iframe></iframe>`
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
        this.COMMUNE = this.stationData[0].COMMUNE.value;

        if (this.CB_PAYMENT == 0) {
          this.is_CB_accepted = ` N'est Pas Accepté 🥺`;
        } else if (this.CB_PAYMENT == 1) {
          this.is_CB_accepted = ` Est Accepté 😃`;
        }
        var now = moment(new Date()).unix(); //todays date
        var diff = (now - this.LAST_UPDATE) / 60;
        this.LAST_UPDATE = Math.floor(diff);
        // lyon
        if (this.ZIP_CODE.match("^69")) {
          this.imgSrc =
            "https://velov.grandlyon.com/assets/img/home/accueil-une-bg.jpg";
          this.videoIntegrationCode = `<iframe width="1404" height="519" src="https://www.youtube.com/embed/M-uldPeekkE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          this.companyName = `Le Vélo'v`;
          this.companyDesc = `Vélo'v désigne un système de vélos en libre-service mis en place dans la métropole de Lyon et géré par l'entreprise JCDecaux depuis le 19 mai 2005. C'est le nom sous lequel JCDecaux exploite son système Cyclocity à Lyon et Villeurbanne.`;
        }

        //sainte
        else if (this.ZIP_CODE.match("^42")) {
          this.imgSrc =
            "https://www.velivert.fr/sites/default/files/stationvelivert.jpg";
          this.videoIntegrationCode = `<iframe width="817" height="489" src="https://www.youtube.com/embed/7ucBKUVPdWw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          this.companyName = "Le VéliVert";
          this.companyDesc = `Une mobilité complémentaire aux transports en commun, est ainsi proposée.
                De nombreuses pistes cyclables sont disponibles dans l’agglomération.
                Vous pouvez aussi utiliser les voies bus.
                Un cadenas est inclus dans le vélo.
                Vous n’avez plus qu’à pédaler...
                N’hésitez plus et partez à l’assaut du territoire en compagnie de vos partenaires mobilité et tourisme !`;
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
  width: 90%;
  height: 90%;
  position: absolute;
  margin: 2px 5%;

  top: 0;
  left: 0;
  border-radius: 4px;
  border: Solid 4px;
  border-color: rgb(212, 199, 199);
}
div.home {
  background: #f0ecec;
  max-height: 100%;
  margin: 10px 10px;
}

div#nav {
  text-align: left;
  position: sticky;
  top: 50px;
  z-index: 2;
  padding-left: 2px;
  padding-top: 0.4%;
}
p.description {
  text-align: center;
  font: italic 35px/59px "Lobster Two";
  font-weight: 700;
  color: #393938;
  background: beige;
  border-radius: 10px;
}

div.slotsInfo {
  background-repeat: no-repeat;
  position: relative;
  padding: 0px;
}

img.bg-img-slotsInfo {
  opacity: 1;
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bold;
  padding: 15px 15px;
  padding-bottom: 10px;
  position: absolute;
  top: 40%;
  left: 50%;
  /* bottom:20%; */
  transform: translate(-50%, -50%);
  background-color: #ffffffc7;
  border-radius: 10px;
  margin: 0 auto;
}
div.panelInfo:hover{
  background: #0d0e0bc7;
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
  color: #1a8000e8;
  font-size: 30px;
}
.parkingslot p {
  margin-right: 5px;
  color: grey;
  font-size: 30px;
}
div.title {
  /* Station: XXX*/
  text-align: center;
  font: italic 35px/59px "Lobster Two";
  font-weight: 700;
  color: #393938;
  background: beige;
  margin: 0;
  padding: 0;
  border-radius: 10px;
}
div.card {
  margin: 50px;
  border-radius: 4px;
  background: beige;
}
span.last_update {
  text-align: center;
  display: block;
  margin: 0 auto;
  padding: 10px 10px;
  width: 35%;
  border-radius: 10px;
  border: solid #f4f4f4 2px;
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  background-color: #a4f99873;
  /* box-shadow: 0 0 20px black; */
}

.postalInfoDiv {
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  border-radius: 4px;
  background-color: #98baf9fc;
  /* white-space: nowrap; */
  /* width: 1000px; */
  max-width: 100%;
  margin: 0 auto;
  position: relative;
}

.postalInfoDiv li {
  /* width: 50%; */
  text-align: left;
  padding: 8px;
}
.postalInfoDiv li p {
  display: inline-block;
  margin-left: 10px;
}
.companyDescription {
  width: 90%;
  margin: 0 auto;
  border-left: 10px solid darkslateblue;
  border-radius: 5px;
}
.companyDescription h2 {
  text-align: center;
  font: italic 25px/39px "Lobster Two";
  font-weight: 700;
  color: #393938;
  padding-left: 5%;
  padding-right: 5%;
}
.companyDescription p {
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  color: black;
  padding-bottom: 5px;

  text-align: center;
  line-height: 30px;
  font-weight: 200;
}
@media screen and (max-width: 900px) {
  .freebikes p {
    font-size: 15px;
  }
  .parkingslot p {
    font-size: 15px;
  }
  .freebikes img {
    width: 1em;
  }
  .parkingslot img {
    width: 1em;
  }
}
@media screen and (max-width: 550px) {
  .freebikes p {
    font-size: 10px;
  }
  .parkingslot p {
    font-size: 10px;
  }
  div.panelInfo {
    transform: translate(-50%, -60%);
    top: 32%;
  }
}
</style>