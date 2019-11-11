<template>
  <q-pull-to-refresh :disable="app.hasActiveJoystick" @refresh="refresh">
    <q-page>
      <!-- <q-scroll-area class="q-scroll-area" style="width: 100%; height: 100%;"> -->
      <div v-if="!hasError" :style="getArcadeStyle()">
        <div
          class="joystick-wrapper"
          :style="getJoystickWrapperStyle()"
          v-for="(joystick, i) in joysticks"
          :key="i"
        >
          <joystick
            :ref="`${joystick.name}el`"
            @update="updateCoords"
            :name="joystick.name"
            :index="i+1"
          />
          <!-- :background="joystick.color" -->
        </div>
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
    joystick: require("src/components/Joystick.vue").default,
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
        hideJoysticks: this.settings.hideJoysticks
      };
    }
  },
  watch: {
    size(num) {
      console.log(num);
    }
  },
  data: () => ({
    canResize: true,
    canDrag: true,
    joysticks: [],
    isMounted: false,
    hasError: false
  }),
  async mounted() {
    await this.app.runCS("init()");
    let result = await this.scanForJoysticks();
    this.initJoysticks();
  },
  methods: {
    ...mapActions("settings", ["setSize"]),
    async refreshJoysticks() {
      this.hasError = false;
      this.app.loading = true;
      this.joysticks = [];
      let result = await this.scanForJoysticks();
      if (!this.hasError) this.initJoysticks();
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
    initJoysticks() {
      this.joysticks.forEach(joystick => {
        let target = this.$refs[`${joystick.name}el`][0];
        target.init([joystick.x, joystick.y]);
      });
    },
    async scanForJoysticks() {
      let result = await this.app.runCS(
        `checkForJoysticks('${JSON.stringify(this.config)}')`
      );
      console.log(result);
      // let data = JSON.parse(result);
      if (result.length) {
        return this.createJoysticks(result);
      } else {
        this.hasError = true;
      }
    },
    refresh(done) {
      this.refreshJoysticks().then(() => {
        done();
      });
    },
    async updateCoords(data) {
      this.app.activeJoystick.x = data.x;
      this.app.activeJoystick.y = data.y;
      // console.log(data);

      await this.app.runCS(`setJoystick('${JSON.stringify(data)}')`);
      // console.log(this.$refs.eye);
      // this.$refs.eye.setJoystick(data.name, data.x, data.y);
    },
    createJoysticks(data) {
      const self = this;
      this.joysticks = data.map((joy, i) => {
        return {
          x: joy.pos[0],
          y: joy.pos[1],
          name: joy.layer,
          color: "#ff0000"
        };
      });
      console.log(this.joysticks);
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

.main-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.arcade {
  position: relative;
  padding: 20px;
  width: 100%;
  height: 90vh;
}
.arcade-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}
</style>
