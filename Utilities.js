// Used to include js and style files as html
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
  .getContent();
}

// Function used in replacing text
function rex(text){
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // http://stackoverflow.com/a/3561711/1677912
}

// Function to show things to you. For debugging
function prompt(text){
  var result = DocumentApp.getUi().alert(
    "Here's what you wanted to see",
    text,
    DocumentApp.getUi().ButtonSet.OK);
}

function matches(conditions){
  for(var i = 0; i < conditions.length; i++){
    if(conditions[i]){
      return true;
    }
  }
}