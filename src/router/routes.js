const routes = [
  {
    path: "/",
    component: () => import("layouts/Panel.vue"),
    children: [
      { path: "", name: "Home", component: () => import("pages/Index.vue") },
      {
        path: "/joysticks",
        name: "Joystick",
        component: () => import("pages/JoystickPage.vue")
      },
      {
        path: "/sliders",
        name: "Slider",
        component: () => import("pages/SliderPage.vue")
      }
    ]
  },
  {
    path: "/modal",
    name: "Modal",
    component: () => import("layouts/Modal.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/ModalScreen.vue")
      }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
