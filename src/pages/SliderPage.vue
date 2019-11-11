<template>
  <q-pull-to-refresh :disable="app.hasActiveJoystick" @refresh="refresh">
    <q-page>
      <!-- <q-scroll-area class="q-scroll-area" style="width: 100%; height: 100%;"> -->
      <div v-if="!hasError">
        <q-list class="q-pt-lg" dense>
          <q-item v-for="(slider, i) in sliders" :key="i">
            <q-item-section side>
              <q-item-label>{{slider.name}}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-slider v-model="slider.value" :min="slider.min" :max="slider.max" color="primary" />
            </q-item-section>
            <q-item-section side>
              <q-input
                v-model.number="slider.value"
                color="primary"
                style="max-width: 30px;"
                :rules="sliderRules"
                @input="strictifyInput(slider, ...arguments)"
                @blur="correctInput(slider, ...arguments)"
                dense
                hide-bottom-space
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <!-- </q-scroll-area> -->
      <div v-if="hasError" class="centered q-pt-lg">
        <sadface />
        <span style="width: 100%;" class="text-center q-pt-xl">No joysticks detected. Please refresh</span>
      </div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "PageIndex",
  components: {
    "quasar-logo": require("src/assets/quasarLogo.vue").default,
    sadface: require("src/assets/sadLogo.vue").default
  },
  computed: {
    ...mapGetters("settings", ["settings"]),
    app() {
      return this.$root.$children[0];
    },
    size() {
      return this.settings.size;
    },
    alignHorizontal() {
      return this.settings.alignHorizontal;
    },
    alignVertical() {
      return this.settings.alignVertical;
    },
    flexReverse() {
      return this.settings.flexReverse;
    },
    config() {
      return {
        hideSliders: this.settings.hideSliders
      };
    }
  },
  watch: {
    size(num) {
      console.log(num);
    }
  },
  data: () => ({
    // sliderRules: [
    //   val => (val !== null && val !== "") || "",
    //   val => (val >= slider.min && val <= slider.max) || ""
    // ],
    sliderRules: [],
    sliders: [
      {
        name: "Test1",
        min: 0,
        max: 100,
        value: 50
      },
      {
        name: "Test2",
        min: -100,
        max: 100,
        value: 50
      }
    ],
    isMounted: false,
    hasError: false
  }),
  async mounted() {
    await this.app.runCS("init()");
    let result = await this.scanForSliders();
    // this.initJoysticks();
  },
  methods: {
    ...mapActions("settings", ["setSize"]),
    strictifyInput(slider, change) {
      let num = Number(change) || 0;
      // if (num >= slider.min && num <= slider.max) {
      //   console.log("Good");
      // } else {
      //   if (num < slider.min) slider.value = slider.min;
      //   if (num > slider.max) slider.value = slider.max;
      //   console.log("Bad");
      // }
    },
    correctInput(slider, change) {
      let num = Number(slider.value) || 0;
      if (num < slider.min) slider.value = slider.min;
      else if (num > slider.max) slider.value = slider.max;
    },
    async refreshSliders() {
      this.hasError = false;
      this.app.loading = true;
      this.joysticks = [];
      let result = await this.scanForSliders();
      // if (!this.hasError) this.initJoysticks();
      this.app.loading = false;
    },
    getArcadeStyle() {
      return `
        display: flex;
        justify-content: ${this.alignHorizontal};
        align-items: ${this.alignVertical};
        width: 100%;
        height: 100%;
        
        flex-wrap: wrap;
        flex-direction: ${this.settings.flexDirection}${
        this.settings.flexReverse ? "-reverse" : ""
      };
      `;
    },
    getJoystickWrapperStyle() {
      if (!this.settings.sizeLock)
        return `
          width: ${this.settings.size}%;
          height: ${this.settings.size}%;
        `;
      else return ``;
    },
    // initJoysticks() {
    //   this.joysticks.forEach(joystick => {
    //     let target = this.$refs[`${joystick.name}el`][0];
    //     target.init([joystick.x, joystick.y]);
    //   });
    // },
    async scanForSliders() {
      // let result = await this.app.runCS(
      //   `checkForJoysticks('${JSON.stringify(this.config)}')`
      // );
      console.log("Scan here");
      // let data = JSON.parse(result);
      // if (result.length) {
      //   return this.createJoysticks(result);
      // } else {
      //   this.hasError = true;
      // }
    },
    refresh(done) {
      this.refreshSliders().then(() => {
        done();
      });
    }
  }
};
</script>

<style>
.q-scroll-area {
  display: flex;
  flex-grow: 1;
}

.centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.q-field__native,
.q-field__prefix,
.q-field__suffix {
  color: var(--color-default);
}

.q-item__section--side,
.q-field__bottom {
  color: var(--color-default);
}

.q-field__native,
.q-field__prefix,
.q-field__suffix {
  border-bottom-color: red !important;
}

.q-slider__track-container {
  opacity: 1;
}
</style>
