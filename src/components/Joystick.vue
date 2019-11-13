<template>
  <!-- quasarcade -->
  <div class="outside" :style="getOutsideStyle()">
    <q-card
      @mouseenter="activateJoystick"
      @mouseleave="deactivateJoystick"
      ref="joybounds"
      v-touch-pan.prevent.mouse="handlePan"
      :style="getBoundsStyle()"
      class="custom-area cursor-move text-white shadow-2 relative-position row flex-center"
    >
      <q-tooltip
        :value="false"
        @input="
          val => {
            !val ? (isDragging = val) : null;
          }
        "
        anchor="bottom middle"
        self="top middle"
      >{{ fakePos }}</q-tooltip>
      {{showindex ? index : ''}}
      <!-- <div v-if="showInfo" class="custom-info">
        <span>{{ name }}</span>
      </div>
      <div v-if="showInfo" v-show="panning" class="touch-signal">
        <q-icon name="touch_app" />
      </div>-->
    </q-card>
    <q-card
      v-show="alt"
      :style="getGamepadWrapperStyle()"
      class="gamepad-wrapper"
      @mouseenter="activateJoystick"
      @mouseleave="deactivateJoystick"
    >
      <div
        class="gamepad-button"
        v-for="(gamepadBtn, i) in gamepadButtons"
        :key="i"
        @click="sendFromButton(gamepadBtn.coords)"
      >
        <q-icon v-if="settings.size > 20" :name="gamepadBtn.icon" :size="currentIconSize" />
      </div>
    </q-card>
    <div class="controller" v-show="!alt" :style="getControllerStyle()">
      <!-- <q-tooltip v-model="isDragging">{{fakePos}}</q-tooltip> -->
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data: () => ({
    gamepadButtons: [
      {
        icon: "mdi-arrow-top-left",
        coords: [-200, -200]
      },
      {
        icon: "mdi-arrow-up",
        coords: [0, -200]
      },
      {
        icon: "mdi-arrow-top-right",
        coords: [200, -200]
      },
      {
        icon: "mdi-arrow-left",
        coords: [-200, 0]
      },
      {
        icon: "mdi-plus",
        coords: [0, 0]
      },
      {
        icon: "mdi-arrow-right",
        coords: [200, 0]
      },
      {
        icon: "mdi-arrow-bottom-left",
        coords: [-200, 200]
      },
      {
        icon: "mdi-arrow-down",
        coords: [0, 200]
      },
      {
        icon: "mdi-arrow-bottom-right",
        coords: [200, 200]
      }
    ],
    info: null,
    showInfo: false,
    panning: false,
    active: false,
    isDragging: false,
    isHover: false,
    showTooltip: false,
    dirty: false,
    size: 200,
    padding: 10,
    showindex: false,
    realCoords: {
      x: null,
      y: null
    },
    joyCoords: {
      x: null,
      y: null
    },
    showController: false,
    centerPoint: 20,
    controllerSize: 20,
    isMounted: false
  }),
  props: {
    name: String,
    color: {
      type: String,
      default: "#fff"
    },
    index: {
      type: Number
    },
    background: {
      type: String,
      default: "var(--q-color-primary)"
    }
  },
  computed: {
    ...mapGetters("settings", ["settings"]),
    app() {
      return this.$root.$children[0];
    },
    joyPos() {
      return `[${this.realCoords.x}, ${this.realCoords.y}]`;
    },
    fakePos() {
      return `[${this.joyCoords.x}, ${this.joyCoords.y}]`;
    },
    storeSize() {
      return this.settings.size;
    },
    storeSizeLock() {
      return this.settings.sizeLock;
    },
    alt() {
      return this.app.alt;
    },
    hasDrag() {
      return this.app.activeJoystick.dragging;
    },
    currentIconSize() {
      if (this.settings.size > 80) return "xl";
      else if (this.settings.size > 60) return "lg";
      else if (this.settings.size > 40) return "md";
      else if (this.settings.size > 20) return "sm";
      else return "xs";
    }
  },
  watch: {
    storeSize(val) {
      if (!this.settings.sizeLock) {
        this.calculateSize();
      }
    },
    hasDrag(val) {
      if (this.name !== this.app.activeJoystick.name && this.isHover) {
        console.log(`${val} ? ${this.app.activeJoystick.name} : ${this.name}`);
        this.active = true;
      }
    },
    active(state) {
      if (state) {
        this.app.hasActiveJoystick = true;
        this.app.activeJoystick.x = this.joyCoords.x;
        this.app.activeJoystick.y = this.joyCoords.y;
        this.app.activeJoystick.name = this.name;
        this.app.activeJoystick.dragging = this.isDragging;
      }
    },
    storeSizeLock(val) {
      if (!val) {
        this.calculateSize();
      }
    },
    joyPos(x) {
      this.getNewJoyPos();
    },
    isDragging(state) {
      if (state) {
        this.active = true;
        this.showTooltip = state;
      } else {
        if (!this.isHover) {
          this.active = false;
          this.app.activeJoystick.dragging = false;
          this.app.hasActiveJoystick = false;
        } else {
          if (this.app.activeJoystick.name == this.name) {
            this.app.activeJoystick.dragging = false;
          }
        }
      }
    }
  },
  mounted() {
    this.isMounted = true;
    // this.init();
    window.addEventListener("resize", () => {
      this.calculateSize();
    });
  },
  methods: {
    activateJoystick(evt) {
      this.isHover = true;
      if (evt.type == "mouseenter" && !this.app.activeJoystick.dragging) {
        if (
          !this.app.activeJoystick.name &&
          !this.app.activeJoystick.dragging
        ) {
          this.isHover = true;
          this.active = true;
        }
      } else if (evt.type == "mouseenter") {
        if (this.app.activeJoystick.name == this.name) {
          this.isHover = true;
          this.active = true;
        } else {
          if (!this.app.activeJoystick.dragging) {
            this.isHover = true;
            this.active = true;
          }
        }
      }
      this.app.hasActiveJoystick = true;
    },
    deactivateJoystick() {
      this.isHover = false;
      if (!this.app.activeJoystick.dragging) {
        this.active = false;
        this.isHover = false;
        this.app.activeJoystick = {
          name: null,
          x: null,
          y: null,
          dragging: false
        };
        this.app.hasActiveJoystick = false;
      } else {
        if (!this.isHover) {
          this.active = false;
        }
      }
    },
    init(pos) {
      this.showController = false;
      this.calculateSize();
      setTimeout(() => {
        this.setPosition(pos[0], pos[1]);
        this.showController = true;
      }, 1);
      // this.setPosition();
    },
    // Reset Joystick to Origin pose ([0, 0])
    reset() {
      this.calculateSize();
      this.setPosition(0, 0);
    },
    sendFromButton(coords) {
      // console.log(coords);
      // this.calculateSize();
      // this.setPosition(200, 0);
      this.setPosition(Number(coords[0]), Number(coords[1]));
    },

    // Set controller position to Joystick equivalent range [-200 to 200] for each axis
    setPosition(x, y) {
      if (this.alt) {
        this.app.activeJoystick.x = x;
        this.app.activeJoystick.y = y;
        this.$emit("update", {
          name: this.name,
          x: x,
          y: y
        });
      }
      this.dirty = true;
      try {
        let size = this.getBoundsSize(this.$refs.joybounds.$el).width;
        let offset = size / 2;
        let ratio = offset / 200;
        this.realCoords.x = x * ratio + offset;
        this.realCoords.y = y * ratio + offset;
      } catch (err) {
        // This currently fires on window changes when Joystick isn't rendered
        // Once mounted, errors are caught even when Joystick isn't currently in view
        // This should be better, maybe via watching parent element size
      }
    },
    getPosition() {
      return {
        x: this.joyCoords.x,
        y: this.joyCoords.y
      };
    },
    calculateNewSize(size) {
      this.size = size * 0.8;
      this.padding = (size - this.size) / 2;
      this.controllerSize = size - this.size;
      this.centerPoint = this.size / 2;
      // Handle window resizing by centering if unmodified
      if (this.dirty) {
        this.joyCoords.x !== null && this.joyCoords.y !== null
          ? this.setPosition(this.joyCoords.x, this.joyCoords.y)
          : this.setPosition(0, 0);
      } else {
        this.realCoords.x = this.centerPoint;
        this.realCoords.y = this.centerPoint;
      }
    },
    // Recalculate Joystick dimensions by the parent HTML element
    calculateSize(size) {
      if (arguments.length > 0) {
        this.size = size;
      } else {
        this.size = this.getParentSize() - this.getParentSize() / 5;
      }
      this.padding = (this.getParentSize() - this.size) / 2;
      this.controllerSize = this.getParentSize() - this.size;
      this.centerPoint = this.size / 2;
      // Handle window resizing by centering if unmodified
      if (this.dirty) {
        this.joyCoords.x !== null && this.joyCoords.y !== null
          ? this.setPosition(this.joyCoords.x, this.joyCoords.y)
          : this.setPosition(0, 0);
      } else {
        this.realCoords.x = this.centerPoint;
        this.realCoords.y = this.centerPoint;
      }
    },
    // Handle inline CSS styles for wrapper, bounds and controller
    getOutsideStyle() {
      if (this.isMounted)
        return `
        padding: ${this.padding}px;
        width: ${this.size + this.padding * 2}px;
        height: ${this.size + this.padding * 2}px
      `;
      else return ``;
    },
    // Override CSS within calculated inline style to ensure sizing is correct
    getBoundsStyle() {
      return `
        width: ${this.size}px;
        height: ${this.size}px;
        background-color: var(--color-${
          this.active ? "selection" : "checkbox-disabled"
        });
        cursor: grab${this.isDragging ? "bing" : ""};
      `;
      // background-color: ${this.background || "#ff0000"}
    },
    getGamepadWrapperStyle() {
      return `
        width: ${this.size}px;
        height: ${this.size}px;
        z-index: 20;
      `;
      // background-color: ${this.background || "#ff0000"}
    },
    getControllerStyle() {
      return `
        opacity: ${this.showController ? (this.isDragging ? ".5" : "1") : "0"};
        width: ${this.controllerSize}px;
        height: ${this.controllerSize}px;
        z-index: 10;
        left: ${this.realCoords.x}px;
        top: ${this.realCoords.y}px;
        cursor: grab${this.isDragging ? "bing" : ""};
        background-color: #fff`;
    },
    handlePan({ evt, ...info }) {
      this.info = info;
      this.dirty = true;
      this.getRealControllerPosition(
        this.getParentOffset(this.$refs.joybounds.$el),
        info
      );
      if (info.isFirst) this.panning = true;
      else if (info.isFinal) this.panning = false;
      this.$emit("update", {
        name: this.name,
        x: this.joyCoords.x,
        y: this.joyCoords.y
      });
      this.isDragging = !info.isFinal;
    },
    getParentOffset(el) {
      var _x = 0;
      var _y = 0;
      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
      }
      return { top: _y, left: _x };
    },
    getRealControllerPosition(parent, info) {
      try {
        let left = (parent.left - info.position.left) * -1;
        let top = (parent.top - info.position.top) * -1;
        this.realCoords.x =
          left > 0
            ? left < this.$refs.joybounds.$el.offsetWidth
              ? left
              : this.$refs.joybounds.$el.offsetWidth
            : 0;
        this.realCoords.y =
          top > 0
            ? top < this.$refs.joybounds.$el.offsetHeight
              ? top
              : this.$refs.joybounds.$el.offsetWidth
            : 0;
      } catch (err) {
        // No need for error. This nullifies when dragging outside bounds of element
      }
    },
    // Determine where controller is on a scale of [-200 - 200] by current position within bounds
    getNewJoyPos() {
      let size = this.getBoundsSize(this.$refs.joybounds.$el).width;
      let offset = size / 2;
      let ratio = offset / 200;
      this.joyCoords.x = Math.round((this.realCoords.x - offset) / ratio);
      this.joyCoords.y = Math.round((this.realCoords.y - offset) / ratio);
    },
    getParentSize() {
      return this.$el && this.$el.parentNode
        ? this.$el.parentNode.clientWidth
        : "0";
    },
    getBoundsSize(elt) {
      return {
        width: elt.offsetWidth,
        height: elt.offsetHeight
      };
    }
  }
};
</script>

<style lang="sass" scoped>
.controller
  position: absolute
  pointer-events: none
  box-shadow: 0 5px 10px rgba(0,0,0,.05), 0 15px 40px rgba(0,0,0,.2);

.outside
  position: relative
  width: 100%
  height: 100%


.custom-area
  position: absolute
  width: 50%
  padding: 8px
  cursor: grab
  transition: background-color 200ms var(--quint) 20ms;

.custom-area:after
  content: ""
  display: block
  padding-bottom: 100%

.custom-info
  font-size: 12px
  user-select: none
  position: absolute
  bottom: 10px
  left: 10px

.touch-signal
  position: absolute
  top: 16px
  right: 16px
  width: 35px
  height: 35px
  font-size: 25px
  border-radius: 50% !important
  text-align: center
  background: rgba(255, 255, 255, .2)

.gamepad-wrapper
  display: grid
  grid-template-rows: 1fr 2fr 1fr
  grid-template-columns: 1fr 2fr 1fr
  grid-gap: 5px
  background-color: var(--color-bg)

.gamepad-button
  display: flex
  justify-content: center
  align-items: center
  transition: all 200ms var(--quint) 20ms
  background-color: var(--color-checkbox-disabled)
  cursor: pointer
  color: var(--color-default)

.gamepad-button:hover
  background-color: var(--color-header)

.gamepad-button:active
  color: var(--color-header)
  background-color: var(--color-selection)
</style>
