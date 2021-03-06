/** 
 * Test for Bug 493881: Changes to legacy HTML color properties before the BODY is loaded
 * should be ignored. Additionally, after BODY loads, setting any of these properties to undefined 
 * should cause them to be returned as the string "undefined".
 */

SimpleTest.waitForExplicitFinish();

var legacyProps = ["fgColor", "bgColor", "linkColor", "vlinkColor", "alinkColor"];
var testColors = ["blue", "silver", "green", "orange", "red"];
var rgbTestColors = ["rgb(255, 0, 0)", "rgb(192, 192, 192)", "rgb(0, 128, 0)", "rgb(255, 165, 0)", "rgb(255, 0, 0)"];
var idPropList = [ {id: "plaintext", prop: "color"},
                   {id: "plaintext", prop: "background-color"},
                   {id: "nonvisitedlink", prop: "color"},
                   {id: "visitedlink", prop: "color"} ];
var initialValues = [];

function setAndTestProperty(prop, color) {
  var initial = document[prop];
  document[prop] = color;
  is(document[prop], initial, "document[" + prop + "] not ignored before body");
  return initial;
}

/**
 * Attempt to set legacy color properties before BODY exists, and verify that such
 * attempts are ignored.
 */
for (var i = 0; i < legacyProps.length; i++) {
  initialValues[i] = setAndTestProperty(legacyProps[i], testColors[i]);
}

/**
 * After BODY loads, run some more tests.
 */
addLoadEvent( function() {
  // Verify that the legacy color properties still have their original values.
  for (var i = 0; i < legacyProps.length; i++) {
    is(document[legacyProps[i]], initialValues[i], "document[" + legacyProps[i] + "] altered after body load");
  }
  
  // Verify that legacy color properties applied before BODY are really ignored when rendering.
  // Save current computed style colors for later use.
  for (i = 0; i < idPropList.length; i++) {
    var style = window.getComputedStyle(document.getElementById(idPropList[i].id), null);
    var color = style.getPropertyValue(idPropList[i].prop);
    idPropList[i].initialComputedColor = color;
    isnot(color, rgbTestColors[i], "element rendered using before-body style");
  }
  // XXX: Can't get links to visually activate via script events, so can't verify
  // that the alinkColor property was not applied.
  
  // Verify that setting legacy color props to undefined after BODY loads will cause them
  // to be read as the string "undefined".
  for (var i = 0; i < legacyProps.length; i++) {
    document[legacyProps[i]] = undefined;
    is(document[legacyProps[i]], "undefined", 
      "Unexpected value of " + legacyProps[i] + " after setting to undefined");
  }
  
  // Verify that setting legacy color props to undefined did not affect rendering 
  // (computed styles).
  for (i = 0; i < idPropList.length; i++) {
    var style = window.getComputedStyle(document.getElementById(idPropList[i].id), null);
    var color = style.getPropertyValue(idPropList[i].prop);
    is(color, idPropList[i].initialComputedColor, 
      "element's style changed by setting legacy prop to undefined");
  }

  // Mark the test as finished.
  setTimeout(SimpleTest.finish, 0);
});
