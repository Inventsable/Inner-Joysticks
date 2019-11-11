import Vue from "vue";
import { LocalStorage } from "quasar";

const state = {
  settings: {
    size: 20,
    sizeLock: false,
    alignVertical: "flex-start",
    alignHorizontal: "flex-start",
    flexDirection: "row",
    flexReverse: false,
    hideJoysticks: true
  }
};

const mutations = {
  setSize(state, value) {
    state.settings.size = value;
  },
  setSizeLock(state, value) {
    state.settings.sizeLock = value;
  },
  setAlignVertical(state, value) {
    state.settings.alignVertical = value;
  },
  setAlignHorizontal(state, value) {
    state.settings.alignHorizontal = value;
  },
  setHideJoysticks(state, value) {
    state.settings.hideJoysticks = value;
  },
  setFlexDirection(state, value) {
    state.settings.flexDirection = value;
  },
  setFlexReverse(state, value) {
    state.settings.flexReverse = value;
    console.log(state.settings.flexReverse);
  },
  setSettings(state, value) {
    Object.assign(state.settings, value);
  }
};

const actions = {
  setSize({ commit, dispatch }, value) {
    commit("setSize", value);
    dispatch("saveSettings");
  },
  setSizeLock({ commit, dispatch }, value) {
    commit("setSizeLock", value);
    dispatch("saveSettings");
  },
  toggleSizeLock({ state, commit, dispatch }) {
    commit("setSizeLock", !state.settings.sizeLock);
    dispatch("saveSettings");
  },
  toggleFlexReverse({ state, commit, dispatch }) {
    commit("setFlexReverse", !state.settings.flexReverse);

    if (state.settings.alignHorizontal == "flex-end")
      commit("setAlignHorizontal", "flex-start");
    else if (state.settings.alignHorizontal == "flex-start")
      commit("setAlignHorizontal", "flex-end");
    dispatch("saveSettings");
  },
  toggleHideJoysticks({ state, commit, dispatch }) {
    commit("setHideJoysticks", !state.settings.hideJoysticks);
    console.log(state.settings.hideJoysticks);
    dispatch("saveSettings");
  },
  toggleFlexDirection({ state, commit, dispatch }) {
    if (state.settings.flexDirection == "row")
      commit("setFlexDirection", "column");
    else commit("setFlexDirection", "row");
    dispatch("saveSettings");
  },
  setAlignVertical({ commit, dispatch }, value) {
    commit("setAlignVertical", value);
    dispatch("saveSettings");
  },
  setAlignHorizontal({ commit, dispatch }, value) {
    commit("setAlignHorizontal", value);
    dispatch("saveSettings");
  },
  setFlexDirection({ commit, dispatch }, value) {
    commit("setFlexDirection", value);
    dispatch("saveSettings");
  },
  getSettings({ commit }) {
    let settings = LocalStorage.getItem("settings");
    if (settings) commit("setSettings", settings);
  },
  saveSettings({ state }) {
    LocalStorage.set("settings", state.settings);
  }
};

const getters = {
  settings: state => {
    return state.settings;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
