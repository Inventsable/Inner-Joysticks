var activeItem = getActiveComp();

// Need some manner of finding Joysticks and ensuring their id/name/index is correct
//
//   If done only in id, this would mean users will accidentally alter other layers
//   if they recently created new layers.
//
//   Joystick should ensure that the layer is indeed a joystick prior to setting value
//   This would be heavy to do, may want to rely on static layer count discrimination
//
//   Could settle for layer.nullLayer [BOOL] as shorthand check
//
//   If layer count is the same, assume this is safe. If not, doublecheck current layer.
//
// Need to pass in [x, y] data on checkForJoysticks() to return initial value
//
function init() {
  app.activeViewer.setActive();
  activeItem = getActiveComp();
  // var check = checkForJoysticks();

  // testJoystick([7, 5, 1], [200, -200]);

  return true;
}

function checkForJoysticks(config) {
  activeItem = getActiveComp();
  config = JSON.parse(config);
  var result = 0;
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
            // console.log(`Found Bounds at ${layer.name}`);
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
                  check = /joystickLimit/gm.test(nnnnprop.expression);
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
  data = JSON.parse(data);
  let layer = activeItem.layer(data.name);
  let newpos = [data.x, data.y, 0];
  let pos = layer.position;
  pos.setValue(newpos);
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
