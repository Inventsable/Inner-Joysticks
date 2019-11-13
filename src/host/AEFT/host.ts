var activeItem = getActiveComp();

function init() {
  app.activeViewer.setActive();
  activeItem = getActiveComp();
  return true;
}

function scanStringForSliderData(data) {
  if (/BEGIN\sSLIDER\sCODE/gm.test(data)) {
    let sliderControls = [];
    let sliderNameRX = /var\scontrl\s\=\sthisComp\.layer\(\"(.*)\"\)\;/gm;
    if (sliderNameRX.test(data)) {
      let sliderName = data.match(sliderNameRX)[1];
      let sliderControllerRX = /var\scontrlCurVal\d{1,}\s\=\scontrl\(\"(.*)\"\)\((\d{1,})\)/gm;
      if (sliderControllerRX.test(data)) {
        let controllerMatches = data.match(sliderControllerRX);
        console.log("Matching:");
        console.log(controllerMatches);
        // controllerMatches.forEach(match => {
        //   let slider = {
        //     layer: sliderName,
        //     prefix: match[0],
        //     ind: match[1],
        //     suffix: "ADBE Slider Control-0001"
        //   };
        //   sliderControls.push(slider);
        // });
      } else {
        console.log(`No match for controllers`);
      }
    } else {
      console.log(`No match for name`);
    }
  } else {
    return false;
  }
}

function checkForSliders(config) {
  // This is wrong. Slider prop data could come from any prop, need to fully recurse.

  activeItem = getActiveComp();
  console.log(`Checking ${activeItem.name} for sliders`);
  config = JSON.parse(config);
  var joysticks = [];
  if (
    activeItem != null &&
    activeItem instanceof CompItem &&
    activeItem.layers.length > 0
  ) {
    for (var i = 1; i <= activeItem.layers.length; i++) {
      var layer = activeItem.layers[i];
      console.log(`Layer name: ${layer.name}`);
      for (var fx = 1; fx <= layer.numProperties; fx++) {
        var prop = layer.property(fx);
        for (var fx2 = 1; fx2 <= prop.numProperties; fx2++) {
          var prop2 = prop.property(fx2);
          // console.log(prop2.name);
          if (prop2.name == "Position" && !/text/i.test(prop.matchName)) {
            if (prop2.expression) {
              console.log(prop2.expression);
              let check = scanStringForSliderData(prop2.expression);
              console.log(check);
            } else {
              console.log("No expression");
            }
          }
        }
      }
    }
  }
}

function checkForJoysticks(config) {
  activeItem = getActiveComp();
  config = JSON.parse(config);
  var joysticks = [];
  if (
    activeItem != null &&
    activeItem instanceof CompItem &&
    activeItem.layers.length > 0
  ) {
    for (var i = 1; i <= activeItem.layers.length; i++) {
      var layer = activeItem.layers[i];
      for (var fx = 1; fx <= layer.numProperties; fx++) {
        var prop = layer.property(fx);
        if (prop.name == "Effects") {
          for (var n = 1; n <= prop.numProperties; n++) {
            var nprop = prop.property(n);
            if (nprop.name == "joystickLimit") {
              if (config.hideJoysticks) layer.enabled = false;
              joysticks.push({
                layer: layer.name,
                props: [i, fx, n],
                pos: [layer.position.value[0], layer.position.value[1]]
              });
            }
          }
        } else if (prop.name == "Contents") {
          let check = checkifJoystickBounds(prop);
          if (check) {
            if (config.hideJoysticks) layer.enabled = false;
          }
        }
      }
    }
  }
  return JSON.stringify(joysticks);
}

function checkifJoystickBounds(prop) {
  let check = false;
  for (var n = 1; n <= prop.numProperties; n++) {
    var nprop = prop.property(n);
    if (nprop.numProperties) {
      for (var nn = 1; nn <= nprop.numProperties; nn++) {
        var nnprop = nprop.property(nn);
        if (nnprop.numProperties)
          for (var nnn = 1; nnn <= nnprop.numProperties; nnn++) {
            var nnnprop = nnprop.property(nnn);
            if (nnnprop.numProperties) {
              for (var nnnn = 1; nnnn <= nnnprop.numProperties; nnnn++) {
                var nnnnprop = nnnprop.property(nnnn);
                if (nnnnprop.expression) {
                  // check = /joystickLimit/gm.test(nnnnprop.expression);
                  check = /\/{5}begin\slimit\scode\/{6}/gim.test(
                    nnnnprop.expression
                  );
                  // console.log(nnnnprop.expression);
                }
              }
            }
          }
      }
    }
  }
  return check;
}

function setJoystick(data) {
  // This should double-check comp name or layer count before sending
  // Otherwise this will throw an error or move the wrong layer

  data = JSON.parse(data);
  let layer = activeItem.layer(data.name);
  if (layer) {
    let newpos = [data.x, data.y, 0];
    let pos = layer.position;

    if (pos.numKeys < 1) {
      pos.setValue(newpos);
    } else {
      // console.log(activeItem.time);
      pos.setValueAtTime(activeItem.time, newpos);
    }
  } else {
    // Send CSEVent telling the panel there's been an error, layer name not found.
  }
}

// Thanks @UQg
// https://forums.adobe.com/message/9829278#9829278
function activateCompViewer() {
  // setActive is supposed (guide) to return a Boolean, but in practice it returns nothing, therefore this doesnt work:
  // return app.activeViewer && app.activeViewer.type===ViewerType.VIEWER_COMPOSITION && app.activeViewer.setActive();
  var A =
    app.activeViewer && app.activeViewer.type === ViewerType.VIEWER_COMPOSITION;
  if (A) app.activeViewer.setActive();
  return A;
}
function getActiveComp() {
  var comp; // the returned quantity
  var X = app.project.activeItem; // the initial activeItem
  var selComp =
    app.project.selection.length === 1 &&
    app.project.selection[0].typeName === "Composition"
      ? app.project.selection[0]
      : null; // the unique selected comp, or null
  var temp;

  if (X instanceof CompItem) {
    if (selComp === null) {
      comp = X;
    } else if (selComp !== X) {
      comp = null; // ambiguity : the timeline panel is active, X is the front comp, but another comp is selected
    } else {
      // X and selComp coincide

      X.selected = false;
      temp = app.project.activeItem;
      X.selected = true;

      if (temp === null) {
        // the project panel is active and the active item was initially a selected comp
        // if that comp is already opened in a viewer and is the front comp, return the comp, else : ambiguity
        comp = activateCompViewer() && app.project.activeItem === X ? X : null;
      } else {
        // deselecting the comp didnt change the activeItem : the timeline panel is active, and the active item was the front comp, that happened to be also selected.
        comp = X;
      }
    }
  } else {
    comp = activateCompViewer() ? app.project.activeItem : null;
  }
  return comp;
}

// function findActiveIndex(item) {
//   let result = null;
//   app.project.items.forEach(entry => {
//     if (item == entry) return entry;
//   });
// }
