<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-bar>
        <q-icon :name="currentActiveIcon" />
        <div class="toolbar-title">{{titleAnno}}</div>
        <q-space />
        <div
          v-if="app.hasActiveJoystick"
          class="q-pl-sm"
          style="display: flex; justify-content: center"
        >
          <span>{{app.hasActiveJoystick ? '[' : ''}}</span>
          <span
            class="centered"
            style="width: 50px"
          >{{app.hasActiveJoystick ? `${app.activeJoystick.x}` : ''}}</span>
          <span>{{app.hasActiveJoystick ? '|' : ''}}</span>
          <span
            style="width: 50px"
            class="centered"
          >{{app.hasActiveJoystick ? `${app.activeJoystick.y}` : ''}}</span>
          <span>{{app.hasActiveJoystick ? ']' : ''}}</span>
        </div>
        <q-btn
          dense
          flat
          :to="{ name: 'Home' }"
          icon="home"
          :style="isActiveStyle($route.name == 'Home')"
        />
        <q-btn
          dense
          flat
          :to="{ name: 'Joystick' }"
          icon="mdi-google-controller"
          :style="isActiveStyle($route.name == 'Joystick')"
        />
        <q-btn
          dense
          flat
          :to="{ name: 'Slider' }"
          icon="mdi-tune"
          :style="isActiveStyle($route.name == 'Slider')"
        />
      </q-bar>
    </q-header>

    <q-footer>
      <q-bar>
        <div class="q-pl-sm" style="width: 30%;">
          <q-slider :readonly="sizeLock" v-model="size" :min="20" :max="100" label />
        </div>
        <q-btn
          dense
          flat
          :style="isActiveStyle(sizeLock)"
          :icon="sizeLock ? 'mdi-lock' : 'mdi-lock-open'"
          @click="toggleSizeLock"
        >
          <tooltipper
            :msg="sizeLock ? `${properControllerName} size locked` : `${properControllerName} size not locked`"
          />
        </q-btn>
        <q-space></q-space>
        <q-btn-dropdown
          auto-close
          dense
          flat
          color="primary"
          :icon="currentHorizontalIcon"
          dropdown-icon
        >
          <tooltipper :msg="`Row alignment is ${alignHorizontal}`" />
          <q-btn
            dense
            flat
            @click="alignHorizontal = 'flex-start'"
            icon="mdi-format-horizontal-align-left"
            :style="isActiveStyle(alignHorizontal == 'flex-start')"
          />
          <q-btn
            dense
            flat
            @click="alignHorizontal = 'center'"
            icon="mdi-format-horizontal-align-center"
            :style="isActiveStyle(alignHorizontal == 'center')"
          />
          <q-btn
            dense
            flat
            @click="alignHorizontal = 'flex-end'"
            icon="mdi-format-horizontal-align-right"
            :style="isActiveStyle(alignHorizontal == 'flex-end')"
          />
        </q-btn-dropdown>
        <q-btn-dropdown
          v-if="showExtendedAlign"
          auto-close
          dense
          flat
          color="primary"
          :icon="currentVerticalIcon"
          dropdown-icon
        >
          <q-btn
            dense
            flat
            @click="alignVertical = 'flex-start'"
            icon="mdi-format-vertical-align-top"
            :style="isActiveStyle(alignVertical == 'flex-start')"
          />
          <q-btn
            dense
            flat
            @click="alignVertical = 'center'"
            icon="mdi-format-vertical-align-center"
            :style="isActiveStyle(alignVertical == 'center')"
          />
          <q-btn
            dense
            flat
            @click="alignVertical = 'flex-end'"
            icon="mdi-format-vertical-align-bottom"
            :style="isActiveStyle(alignVertical == 'flex-end')"
          />
        </q-btn-dropdown>
        <q-btn
          dense
          flat
          @click="toggleHideController"
          :icon="`mdi-eye${isHiddenController ? '-off' : ''}`"
        >
          <tooltipper
            :msg="isHiddenController ? `Auto-hide comp ${currentControllerName}s` : `Don't hide ${currentControllerName}s`"
          />
        </q-btn>
        <q-btn dense flat @click="toggleFlexDirection" :icon="currentDirectionIcon">
          <tooltipper :msg="`Flex is ${flexDirection}`" />
        </q-btn>
        <q-btn dense flat @click="toggleFlexReverse" icon="mdi-arrow-up-down">
          <tooltipper :msg="`${flexReverse ? 'Reversed' : 'Normal'}`" />
        </q-btn>
        <q-btn dense flat @click="app.launchModal()" icon="mdi-settings">
          <tooltipper msg="Open settings modal" />
        </q-btn>
      </q-bar>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import getExtVersion from "src/utils/main/getExtVersion";

export default {
  name: "MyLayout",
  components: {
    drawer: require("components/panel/Drawer.vue").default,
    toolbar: require("components/panel/Toolbar.vue").default,
    tooltipper: require("components/panel/tooltipper.vue").default
  },
  data: () => ({
    leftDrawerOpen: false,
    showExtendedAlign: false
  }),
  watch: {
    sizeLock(state) {
      console.log(`Locked: ${state}`);
    }
  },
  computed: {
    ...mapGetters("settings", ["settings"]),
    app() {
      return this.$root.$children[0];
    },
    activeJoystick() {
      return this.app.activeJoystick.name;
    },
    activeSlider() {
      return this.app.activeSlider.name;
    },
    activeController() {
      if (this.$route.name == "home") return false;
      else if (this.$route.name == "Joystick" && this.app.hasActiveJoystick)
        return this.app.activeJoystick.name;
      else if (this.$route.name == "Slider" && this.app.hasActiveSlider)
        return this.app.activeSlider.name;
      else return false;
    },
    extVersion() {
      return getExtVersion();
    },
    currentHorizontalIcon() {
      if (/start/.test(this.settings.alignHorizontal))
        return "mdi-format-horizontal-align-left";
      else if (/end/.test(this.settings.alignHorizontal))
        return "mdi-format-horizontal-align-right";
      else return "mdi-format-horizontal-align-center";
    },
    currentVerticalIcon() {
      if (/end/.test(this.settings.alignVertical))
        return "mdi-format-vertical-align-bottom";
      else if (/start/.test(this.settings.alignVertical))
        return "mdi-format-vertical-align-top";
      else return "mdi-format-vertical-align-center";
    },
    currentDirectionIcon() {
      if (/row/.test(this.settings.flexDirection))
        return "mdi-border-horizontal";
      else return "mdi-border-vertical";
    },
    currentActiveIcon() {
      if (this.$route.name == "home") return "home";
      else if (this.$route.name == "Joystick")
        return this.app.hasActiveJoystick
          ? "mdi-google-controller"
          : "mdi-google-controller-off";
      else if (this.$route.name == "Slider")
        return this.app.hasActiveSlider ? "mdi-tune" : "mdi-tune";
    },
    currentControllerName() {
      return this.$route.name.toLowerCase();
    },
    properControllerName() {
      return this.currentControllerName.replace(/^\w/, c => c.toUpperCase());
    },
    titleAnno() {
      if (this.$route.name !== "home") {
        return this.activeController
          ? this.activeController
          : `No ${this.currentControllerName}`;
      } else {
        return "Home";
      }
    },
    isHiddenController() {
      if (this.$route.name == "home") return false;
      else if (this.$route.name == "Joystick")
        return this.settings.hideJoysticks;
      else if (this.$route.name == "Slider") return this.settings.hideSliders;
    },
    size: {
      get() {
        return this.settings.size;
      },
      set(value) {
        this.setSize(value);
      }
    },
    sizeLock: {
      get() {
        return this.settings.sizeLock;
      },
      set(value) {
        this.setSizeLock(value);
      }
    },
    alignVertical: {
      get() {
        return this.settings.alignVertical;
      },
      set(value) {
        this.setAlignVertical(value);
      }
    },
    alignHorizontal: {
      get() {
        return this.settings.alignHorizontal;
      },
      set(value) {
        this.setAlignHorizontal(value);
      }
    },
    flexDirection: {
      get() {
        return this.settings.flexDirection;
      },
      set(value) {
        this.setFlexDirection(value);
      }
    },
    flexReverse() {
      return this.settings.flexReverse;
    },
    hideJoysticks() {
      return this.settings.hideJoysticks;
    },
    hideSliders() {
      return this.settings.hideSliders;
    }
  },
  methods: {
    ...mapActions("settings", [
      "setSize",
      "setSizeLock",
      "setAlignVertical",
      "setAlignHorizontal",
      "setFlexDirection",
      "toggleSizeLock",
      "toggleFlexReverse",
      "toggleFlexDirection",
      "toggleHideJoysticks",
      "toggleHideSliders"
    ]),
    toggleHideController() {
      if (this.$route.name == "home") return null;
      else if (this.$route.name == "Joystick") this.toggleHideJoysticks();
      else if (this.$route.name == "Slider") {
        this.toggleHideSlider();
      }
    },
    isActiveStyle(state) {
      return `
        color: var(--color-${state ? "selection" : "default"});
      `;
    }
    // toggleSizeLockClick() {
    //   this.toggleSizeLock();
    // }
  }
};
</script>

<style>
.q-layout__section--marginal {
  user-select: none;
  cursor: default;
  background-color: var(--color-header-border);
}

@media screen and (max-width: 260px) {
  .toolbar-title {
    display: none;
  }
}
</style>
