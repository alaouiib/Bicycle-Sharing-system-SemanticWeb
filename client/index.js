var vm = new Vue({
  el: "#app",
  data: {
    a: "working",
    list: [],
    features: [],
    mymap: null,
    markers: []
  },
  //  "Accept-Encoding: gzip, deflate, br" -H "Accept-Language: en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar-MA;q=0.6,ar;q=0.5" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8"  -H "Referer: http://localhost:3030/dataset.html?tab=query^&ds=/Project_data2" -H "X-Requested-With: XMLHttpRequest" -H "Connection: keep-alive" --data "query=PREFIX+ex^%^3A+^%^3Chttp^%^3A^%^2F^%^2Fexample.org^%^2F^%^23^%^3E^%^0APREFIX+rdfs^%^3A+^%^3Chttp^%^3A^%^2F^%^2Fwww.w3.org^%^2F2000^%^2F01^%^2Frdf-schema^%^23^%^3E^%^0APREFIX+geo^%^3A+^%^3Chttp^%^3A^%^2F^%^2Fwww.w3.org^%^2F2003^%^2F01^%^2Fgeo^%^2Fwgs84_pos^%^23^%^3E^%^0APREFIX+xsd^%^3A+^%^3Chttp^%^3A^%^2F^%^2Fwww.w3.org^%^2F2001^%^2FXMLSchema^%^23^%^3E^%^0APREFIX+rdf^%^3A+^%^3Chttp^%^3A^%^2F^%^2Fwww.w3.org^%^2F1999^%^2F02^%^2F22-rdf-syntax-ns^%^23^%^3E^%^0APREFIX+rel^%^3A+^%^3Chttp^%^3A^%^2F^%^2Frelations.example.com^%^2F^%^3E^%^0A^%^0ASELECT+^%^3Faddress+^%^3Flat+^%^3Flon++^%^0AWHERE+^%^7B^%^0A++^%^3Flabel+rel^%^3AADDRESS+^%^3Faddress.^%^0A++^%^3Flabel+geo^%^3Alat+^%^3Flat.^%^0A++^%^3Flabel+geo^%^3Alon+^%^3Flon.^%^0A^%^7D^%^0A^%^0ALIMIT+100" --compressed
  methods: {
    async make_request(query) {
      const res = await axios.post(
        "http://localhost:3030/TestTripleStore/sparql",
        query
      );
      let vars = res.data.head.vars; //  features requested
      let result = res.data.results.bindings; // results
      this.list = result;
      this.features = vars;
      //   console.log(this.list);

      for (let result = 0; result < this.list.length; result++) {
        let lat = this.list[result].lat.value;
        let lon = this.list[result].lon.value;
        let ADDRESS = this.list[result].ADDRESS.value;
        let FREE_BIKES = this.list[result].FREE_BIKES.value;
        let label = this.list[result].label.value;
        var myIcon = L.icon({
          iconUrl:
            `https://www.velivert.fr/sites/default/files/markers/vert-${FREE_BIKES}.png`,
          iconSize: [50, 40],
          iconAnchor: [25, 20]
        });
        const marker = L.marker([lat, lon], { icon: myIcon}).addTo(this.mymap);
        this.mymap.createPane("labels");
        this.mymap.getPane('labels').style.zIndex = 650;

        marker.bindPopup(
          `<b>Adresse: </b>${ADDRESS} <br> <b>velos disponibles:</b> ${FREE_BIKES}<br> <b>Nom:</b> ${label}`
        );
        
        this.markers.push(marker);
      }
    }
  },
  mounted() {
    let flag = true;
    this.mymap = L.map("mapid");
    if (flag) {
      this.mymap.setView([45.7696005888254260, 4.8376084367310748], 7);
      flag = false;
    }
    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const tiles = L.tileLayer(tileUrl, { attribution });
    tiles.addTo(this.mymap);
    // this.markers.forEach(element => {
    //     element.onclick = ()=>{
    //         mymap.setView([lat, lon], mymap.getZoom());
    //     }
    // });
  }
});
//   fetch("http://localhost:3030/Project_data2/sparql", {"credentials":"omit","headers":{"accept":"application/sparql-results+json,*/*;q=0.9","accept-language":"en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar-MA;q=0.6,ar;q=0.5","content-type":"application/x-www-form-urlencoded; charset=UTF-8","sec-fetch-mode":"cors","sec-fetch-site":"same-origin","x-requested-with":"XMLHttpRequest"},"referrer":"http://localhost:3030/dataset.html?tab=query&ds=/Project_data2","referrerPolicy":"no-referrer-when-downgrade","body":"query=PREFIX+ex%3A+%3Chttp%3A%2F%2Fexample.org%2F%23%3E%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0APREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0APREFIX+xsd%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%0APREFIX+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0APREFIX+rel%3A+%3Chttp%3A%2F%2Frelations.example.com%2F%3E%0A%0ASELECT+%3Faddress+%3Flat+%3Flon++%0AWHERE+%7B%0A++%3Flabel+rel%3AADDRESS+%3Faddress.%0A++%3Flabel+geo%3Alat+%3Flat.%0A++%3Flabel+geo%3Alon+%3Flon.%0A%7D%0A%0ALIMIT+100","method":"POST","mode":"cors"});
