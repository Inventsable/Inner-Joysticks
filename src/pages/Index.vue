<template>
  <q-page>
    <!-- <indicator direction="left-center" :auto="true" target="#eye-button" /> -->
    <q-pull-to-refresh @refresh="refresh">
      <div
        class="q-pa-md"
        v-if="step == 1"
        style="display: flex; justify-content: center; align-items: flex-end; flex-wrap: wrap; height: 100%;"
      >
        <div class="q-mb-md">
          <slottie />
        </div>
        <div class="text-h6 flex flex-center" style="width: 100%;">
          TRY THIS
        </div>
        <span>
          Click and drag down any where in the panel to refresh your joysticks.
          The panel can't read when you add new joysticks or switch comps, so
          you'll need to refresh for them to appear.
        </span>
      </div>
    </q-pull-to-refresh>
    <div
      v-if="step > 1"
      class="absolute-bottom q-pa-md"
      style="display: flex; justify-content: flex-end; width: 100%;"
    >
      <q-btn
        v-if="step > 1"
        flat
        color="primary"
        @click="previousStep"
        label="Back"
        class="q-mx-sm"
      />
      <q-btn
        @click="nextStep"
        color="primary"
        :label="step === 3 ? `Let's go` : 'Got it'"
      />
      <!-- @click="$refs.stepper.next()" -->
    </div>
  </q-page>
</template>

<script>
export default {
  components: {
    sadface: require("src/assets/sadLogo.vue").default,
    slottie: require("src/components/slottie.vue").default,
    indicator: require("src/components/Indicator.vue").default
  },
  data: () => ({
    step: 1
  }),
  computed: {
    app() {
      return this.$root.$children[0];
    }
  },
  watch: {
    step(val) {
      this.app.tutorialStep = val;
    }
  },

  mounted() {
    if (this.$route.name == "Home") {
      this.$router.push({ name: "Joystick" });
    }
  },
  methods: {
    nextStep() {
      this.step = this.step < this.max ? this.step + 1 : this.isDone();
    },
    previousStep() {
      this.step = this.step - 1;
    },
    isDone() {
      console.log("Done!");
      return 1;
    },
    refresh(done) {
      setTimeout(() => {
        this.step = 2;
        done();
      }, 1000);
    },
    getStepperStyle() {
      // height: calc(${this.step == 1 ? "74vh" : "76vh - 20px"});
      return `
      
      `;
    }
  }
};
</script>

<style>
.main-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}
.text-center {
  display: flex;
  justify-content: center;
}

.full-step {
  width: 100%;
  height: 76vh;
}

.q-stepper__header {
  display: none;
}

.q-stepper {
  background: var(--color-bg);
  color: var(--color);
}
</style>
