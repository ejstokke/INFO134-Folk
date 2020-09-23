function navigate(buttonValue) {
  var dividers = document.getElementsByTagName('div');
  for (var i = 0; i < dividers.length; i++) {
    dividers[i].className = "hidden";
  }
  var visible = document.getElementById(buttonValue);
  visible.className = "visible";
}
