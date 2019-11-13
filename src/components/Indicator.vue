<template>
  <div class="wrapper">
    <div
      class="indicate"
      v-for="(targ, i) in targs"
      :key="i"
      :style="getIndicatorStyle(targ)"
    ></div>
  </div>
</template>

<script>
export default {
  name: "indicate",
  props: {
    target: String,
    direction: String,
    auto: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    targs: []
  }),
  mounted() {
    console.log("Indicator mounted");
    console.log(this.target);
    let targEl = document.querySelectorAll(this.target);
    console.log(targEl);
    targEl.forEach((targ, i) => {
      let targPos = this.findTargetPosition(targ);
      this.targs.push(targPos);
    });
    console.log(this.targs);
    console.log(`${this.width} x ${this.height}`);
    console.log("Indicator");
  },
  computed: {
    width() {
      return this.$el.offsetWidth;
    },
    height() {
      return this.$el.offsetHeight;
    },
    offsetX() {
      if (/left/.test(this.direction)) return 0;
      else if (/right/.test(this.direction)) return this.width;
      else if (/center/.test(this.direction)) return this.width / 2;
    },
    offsetY() {
      if (/top/.test(this.direction)) return 0;
      else if (/bottom/.test(this.direction)) return this.height;
      else if (/center/.test(this.direction)) return this.height / 2;
    }
  },
  methods: {
    findTargetPosition(el) {
      console.log(el);
      var _x = 0;
      var _y = 0;
      var _w = 0;
      var _h = 0;
      _w = el.offsetWidth;
      _h = el.offsetHeight;
      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;

        el = el.offsetParent;
      }
      return {
        top: _y,
        left: _x,
        width: _w,
        height: _h
      };
    },
    getIndicatorStyle(targ) {
      let str = `
        top: ${this.auto ? targ.top : targ.top - this.offsetY}px;
        left: ${this.auto ? targ.left : targ.left - this.offsetX}px;
      `;
      str += this.auto
        ? `
        width: ${targ.width}px;
        height: ${targ.height}px;
      `
        : "";
      return str;
    }
  }
};
</script>

<style>
.indicate {
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 2px solid red;
  position: absolute;
  z-index: 99999;
}
</style>
