<template>
  <q-page>
    <div class="absolute-center">
      <sadface />
      <span style="width: 100%;" class="text-center q-pt-xl">I have no content yet</span>
    </div>
  </q-page>
</template>

<script>
export default {
  components: {
    sadface: require("src/assets/sadLogo.vue").default
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
</style>
