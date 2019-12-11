<template>
  <div>
    <b-steps
      v-model="activeStep"
      :animated="isAnimated"
      :has-navigation="hasNavigation"
      :icon-prev="prevIcon"
      :icon-next="nextIcon"
      @change="changedStep"
    >
      <b-step-item label="Example fichier.json" :clickable="isStepsClickable">
        <h1 class="title has-text-centered">Example fichier.json</h1>
        <div class="container1">
          <b-tooltip
            label="Example du ficher Json à fournir !"
            type="is-dark"
            always
          >
            <img
              class="jsonExample"
              src="../../public/images/jsonExample.png"
              alt="json file example"
            />
          </b-tooltip>
          <b-tooltip
            label="Description du ficher Json à fournir !"
            type="is-dark"
            always
          >
            <img
              class="jsonDescription"
              src="../../public/images/jsonDescription.png"
              alt="json file description"
            />
          </b-tooltip>
        </div>
        <b-field  label="Ajouter le lien vers la source des données: (JSON)">
          <div class="container2">
            <b-input
              icon-pack="fas"
              icon="link"
              v-model="url"
              placeholder="URL"
              type="url"
            ></b-input>
          </div>
        </b-field>
      </b-step-item>

      <b-step-item label="Setup" :type="{ 'is-success': isSetupSuccess }">
        <h1 class="title has-text-centered">Setup</h1>
        <div class="mapFileContainer table-container">
          <table class="table">
            <thead>
              <tr>
                <th align="center">code_postale</th>
                <th align="center">commune</th>
                <th align="center">name</th>
                <th align="center">address</th>
                <th align="center">position</th>
                <th align="center">available_bikes</th>
                <th align="center">available_bike_stands</th>
                <th align="center">banking</th>
                <th align="center">status</th>
                <th align="center">last_update</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td align="center">
                  <div class="select">
                    <b-select v-model="code_postale">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="commune">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="name">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="address">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="position">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="available_bikes">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="available_bike_stands">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="banking">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="status">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
                <td align="center">
                  <div class="select">
                    <b-select v-model="last_update">
                      <option v-for="(column, index) in columns" :key="index">
                        {{ column }}
                      </option>
                    </b-select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-step-item>
      <b-step-item
        label="Finish"
        :type="{ 'is-success': isFinishSuccess }"
        :clickable="isStepsClickable"
        disabled
      >
        <h1 class="title has-text-centered">Finish</h1>
        <div class="finishContainer">
          <b-message type="is-success" has-icon>
            Station Ajouté Avec succès !
          </b-message>
        </div>
        <router-link to="/">Retourner a la page d'accueil</router-link>
      </b-step-item>

      <template
        v-if="customNavigation"
        slot="navigation"
        slot-scope="{ previous, next }"
      >
        <b-button
          outlined
          type="is-danger"
          icon-pack="fas"
          icon-left="backward"
          :disabled="previous.disabled"
          @click.prevent="previous.action"
        >
          Retourner
        </b-button>
        <b-button
          outlined
          type="is-success"
          icon-pack="fas"
          icon-right="forward"
          :disabled="next.disabled"
          @click.prevent="next.action"
        >
          Continuer
        </b-button>
      </template>
    </b-steps>
  </div>
</template>
<script>
export default {
  data() {
    return {
      activeStep: 0,
      showSocial: false,
      isAnimated: true,
      hasNavigation: true,
      customNavigation: false,
      prevIcon: "chevron-left",
      nextIcon: "chevron-right",
      isStepsClickable: false,
      isSetupSuccess: false,
      isFinishSuccess: false,
      url: "",
      columns: { test: "test" },
      code_postale: "",
      commune: "",
      name: "",
      address: "",
      position: "",
      banking: "",
      status: "",
      last_update: "",
      available_bikes: "",
      available_bike_stands: "",
      notified: false,
      fileKeys: {},
      cityName: ""
    };
  },
  async updated() {
    if (!this.notified) {
      if (
        this.code_postale &&
        this.commune &&
        this.name &&
        this.address &&
        this.position &&
        this.banking &&
        this.status &&
        this.last_update &&
        this.available_bikes &&
        this.available_bike_stands
      ) {
        this.notified = true;
        this.$buefy.snackbar.open({
          message: "cliquer sur next pour continuer !",
          type: "is-success",
          duration: 60000
        });
      }
    }
  },
  async mounted() {
    this.cityName = this.$route.query.cityName;
  },
  methods: {
    async changedStep(index) {
      if (index == 1) {
        try {
          var response = await fetch(this.url);
          var data = await response.json();
          var fileKeys = Object.keys(data[0]);
          this.columns = fileKeys;
          this.isSetupSuccess = true;
        } catch (error) {
          console.error(error);
          setTimeout(() => {
            this.$buefy.snackbar.open({
              message: "Veuillez verifier le lien introduit !",
              type: "is-warning",
              position: "is-top"
            });
            this.activeStep -= 1;
          }, 500);
        }
      }
      if (index == 2) {
        if (this.notified) {
          this.fileKeys = {
            code_postale: this.code_postale,
            commune: this.commune,
            name: this.name,
            address: this.address,
            position: this.position,
            banking: this.banking,
            status: this.status,
            last_update: this.last_update,
            available_bikes: this.available_bikes,
            available_bike_stands: this.available_bike_stands
          };
          console.log(this.fileKeys);

          var send = await fetch("http://localhost:3000/createNewCity", {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
              fileKeys: this.fileKeys,
              url: this.url,
              cityName: this.cityName
            })
          });
          var res = await send.json();
          console.log(res);
          this.isFinishSuccess = true;
        } else {
          console.log("oups !");
          this.$buefy.snackbar.open({
            message: "Veuillez remplir toute les colonnes !",
            type: "is-warning",
            position: "is-top"
          });
          setTimeout(() => {
            this.activeStep = 1;
          }, 500);
        }
      }
    }
    // async removeOption(x) {
    //   console.log(x);
    //   console.log(this.code_postale);

    //   this.columns.splice(this.columns.indexOf(x), 1);
    // //   console.log(this.columns);
    // }
  }
};
</script>
<style scoped>
.container1 {
  margin: 10px;
  margin-top: 50px;
  margin-bottom: 50px;

  display: flex;
  justify-content: space-around;
}
.jsonExample {
  border: dotted 2px gray;
  border-radius: 10px;
  height: 46%;
}
.jsonDescription {
  border: dotted 2px gray;
  border-radius: 10px;
}
.container2 {
  margin: 0 auto;
  width: 70%;
}
.mapFileContainer {
  border-radius: 10px;
}
.finishContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
