<template>
  <div class="home">
    ID: {{ID}}<br>
    ADDRESS: {{ADDRESS}}<br>
    Name: {{label}}<br>
    <div class="container">
    <div class="columns">
      <div class="column">

    <div class="card">
  <div class="card-image">
      <!-- <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image"> -->
      
  <div class="o-video">
  <iframe src="https://www.youtube.com/embed/Kch8n4tcOZQ" allowfullscreen></iframe>
</div>

  </div>
  <div class="card-content">
    <div class="media">
      <div class="media-left">
        <figure class="image is-48x48">
          <img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">
        </figure>
      </div>
      <div class="media-content">
        <p class="title is-4">John Smith</p>
        <p class="subtitle is-6">@johnsmith</p>
      </div>
    </div>

    <div class="content">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Phasellus nec iaculis mauris. <a>@bulmaio</a>.
      <a href="#">#css</a> <a href="#">#responsive</a>
      <br>
      <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
    </div>
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
      ADDRESS:'',
      label:''
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
        console.log(this.label)
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
  border: 0;
}

</style>