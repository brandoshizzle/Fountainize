var doc;
var body;
var pArray;
var charList = [];
var version = 10;

var Style = function(iLeft, iRight, uCase, lAbove){
  this.iLeft = iLeft;
  this.iRight = iRight;
  this.uCase = uCase;
  this.lAbove = lAbove;
};

// Format Names (left indent, right indent, uppercase, lines above)
// https://screenwriting.io/what-is-standard-screenplay-format/
var scene = new Style(0,0,true, 2);
var sceneWithNumbers = new Style(-0.5,0,true, 2);
var dialogue = new Style(1.0, 1.5, false, 0);
var character = new Style(2.0, 0, true, 1);
var action = new Style(0, 0, false, 1);
var paranthetical = new Style(1.5, 1.9, false, 0);
var transition = new Style(0, 0, true, 1);
var centered = new Style(-0.5, 0, false,1);

//var scene = new Style(0,0,true, 2);
//var sceneWithNumbers = new Style(-0.5,0,true, 2);
//var dialogue = new Style(1.4, 1.3, false, 0);
//var character = new Style(2.7, 0, true, 1);
//var action = new Style(0, 0, false, 1);
//var paranthetical = new Style(2.1, 1.9, false, 0);
//var transition = new Style(0, 0, true, 1);
//var centered = new Style(-0.5, 0, false,1);

var firstEl;

// MAIN FUCTION
// Goes through entire document and determines what formatting each element should have
// The STYLIZE function applies the formatting
function convert(type, sceneNumbers, autoFontsMargins, endPunctuationMeansNotChar) {
  charList = getCharsFromStorage();
  const licenseValid = isLicenseValid();
  const charLimit = licenseValid ? 15 : 5;
  const elementLimit = 800;
  var sceneNum = 1;
  
  doc = DocumentApp.getActiveDocument();
  body = doc.getBody();
  type = type || 'whole';
  
  if(autoFontsMargins){
    docSetUp();
  }
  
  // Get all body and paragraphs from the document
  if(type === 'whole'){
    pArray = body.getParagraphs();
  } else {
    // If they selected just an area, get that selection
    try{
      var selection = doc.getSelection();
      var rangeArray = selection.getSelectedElements();
    } catch(e){
      DocumentApp.getUi().alert(
        "No Selection",
        'Please highlight a section to format or switch to "Whole" formatting under Options.',
        DocumentApp.getUi().ButtonSet.OK);
      return;
    }
    pArray = [];
    
    for(var i = 0; i < rangeArray.length; i++){
      pArray[i] = rangeArray[i].getElement();
      // Helps fix partial selections - makes partial element the real element, its parent
      if(typeof pArray[i].getText === "function"){
        if(pArray[i].getText() === pArray[i].getParent().getText()){
          pArray[i] = pArray[i].getParent();
        }
      }
    }
    pArray.unshift(elAbove(pArray[0]));
  }
  
  var pStyle = ''; // Defining the style of the previous element
  firstEl = true;
  
  // If on free license, check if body is too long
  if(!licenseValid){
    const bodyElementCount = body.getParagraphs().length;
    if(bodyElementCount > elementLimit && elementLimit > -1){
      DocumentApp.getUi().alert(
        "Exceeded Element Limit",
        "Looks like your script is getting pretty long (" + bodyElementCount + " elements). Fountainize Free limits your script to 800 elements (dialogue, characters, etc). Upgrade to Pro for unlimited length!",
        DocumentApp.getUi().ButtonSet.OK);
      return false;
    }
  }
  // Loop through all elements!
  for(var i = 0; i < pArray.length; i++){
    var el = pArray[i];
    var text = el.getText();
    
    // Skip over it if it's an empty line OR not a paragraph element
    if(!text){
      continue; 
    }
    
    // Skip over it if it's centered
    if(el.getAlignment() === DocumentApp.HorizontalAlignment.CENTER){
      continue;
    }
    
    // Set the line spacing according to standards (have to do this per-paragraph for some reason)
    el.setLineSpacing(0.86);
    
    //prompt(text);
    
    // SCENE HEADER
    var sceneText = text.toUpperCase();
    var sceneConditions = [
      sceneText.substr(0,4) === 'INT.', // 1. Starts with 'int.' or 'ext.'
      sceneText.substr(0,4) === 'EXT.',
      !isNaN(parseInt(text.substr(0,1))) && (sceneText.indexOf('INT.') > -1 || sceneText.indexOf('EXT.') > -1)
    ];
    
    var intPos = sceneText.indexOf('INT.') > -1 ? sceneText.indexOf('INT.') : 999999999;
    var extPos = sceneText.indexOf('EXT.') > -1 ? sceneText.indexOf('EXT.') : 999999999;
    var firstMatch = Math.min(intPos, extPos);
    
    if(matches(sceneConditions)){
      if(sceneNumbers){
        var newSceneHeader = sceneNum + "\t" + sceneText.substring(firstMatch);
        el.setText(newSceneHeader);
        el = stylize(el, sceneWithNumbers);
        sceneNum = sceneNum + 1;
      } else {
        var newSceneHeader = sceneText.substring(firstMatch);
        el.setText(newSceneHeader);
        el = stylize(el, scene);
      }
      pStyle = 'scene';
      continue;
    }
    
    // PARANTHETICAL
    // 1. Starts with a bracket
    if(text.substr(0,1) === '('){
      el = stylize(el, paranthetical);
      pStyle = 'paranthetical';
      continue;
    }
    
    // CENTERED TEXT
    // Bookended by >/<
    if(text.substr(0,1) === '>' && text.substr(text.length - 1, 1) === '<'){
      el.setText(text.substr(1, text.length - 2));
      el = stylize(el, centered);
      el.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      pstyle = 'action';
      continue;
    }
    
    // DIALOGUE
    // 1. Previous style was character OR
    // 2. Previous style was paranthetical OR
    // 3. The indentation matches the expected indentation for dialogue (for previously processed dialogue)
    if(pStyle === 'character' || pStyle === 'paranthetical' || el.getIndentStart()/72 === dialogue.iLeft){
      el = stylize(el, dialogue);
      pStyle = 'dialogue';
      continue;
    }
    
    // TRANSITION
    // 1. Ends in " to:", " in:", or "out:"
    var endString = text.substring(text.length - 5).toLowerCase()
    if(endString === ' to:' || endString === ' in:' || endString === 'out:'){
      el = stylize(el, transition);
      el.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
      pStyle = 'transition';
      continue;
    }
    
    // CHARACTER
    // 1. All uppercase and doesn't start with 'int.' or 'ext.'
    // 2. Matches a shorthand character
    // Works with any bracket text ex. (V.O.), (CONT'D)
    
    // Check if it matches a shorthand, if so replace the text
    var upperText = text.toUpperCase();
    // Remove bracketed text first
    const firstBracket = upperText.indexOf("(");
    var charNoBrackets = upperText;
    var charBracketsOnly = "";
    if(firstBracket > -1){
      charNoBrackets = upperText.substring(0,firstBracket - 1);
      charBracketsOnly = upperText.substring(firstBracket - 1);
      //      DocumentApp.getUi().alert(charNoBrackets + ", " + charBracketsOnly);
    }
    
    for(var j = 0; j < charList.length; j++){
      if(charNoBrackets == charList[j].sh){
        const newText = charList[j].name + charBracketsOnly;
        el.setText(newText);
        break;
      }
    }
    
    // Is is in all uppercase?
    if(upperText === text){
      const lastChar = upperText.slice(-1);
      if(!(endPunctuationMeansNotChar && (lastChar === "." || lastChar === "!" || lastChar === "?" || lastChar === "-"))){
        el = stylize(el, character);
        pStyle = 'character';
        if(charList.length < charLimit){
          // Add the character to the charList
          addToCharList(charNoBrackets);
        }
        continue;
      }
    }
    
    
    
    // ACTION
    // Basically anything else.
    el = stylize(el, action);
    
  } // End of element looping
  
  setCharsToStorage(charList)
  return charList;
} // End of convert function


// STYLIZE
// This function applies the proper formatting to each element
// based on what the main function decided
function stylize(el, style){
  
  // Set the margins
  el.setIndentFirstLine(style.iLeft * 72);
  el.setIndentStart(style.iLeft * 72);
  el.setIndentEnd(style.iRight * 72);
  
  // Uppercase if appropriate
  if(style.uCase){
    var text = el.getText();
    el.setText(text.toUpperCase());
  }
  
  // Apply proper spacing between the element and the one above it
  // Go up through elements until you hit a non-empty one. See if that was enough elements
  var numSpacesAbove = firstEl ? 0 : style.lAbove;
  var j = -1;
  for(var i = 1; i <= numSpacesAbove; i++){
    if(elAbove(el, i).getText() !== ''){ // If we hit some text too early, add some elements.
      for(j = 0; j < numSpacesAbove + 1 - i; j++){
        body.insertParagraph(body.getChildIndex(el), '');
      }
      break;
    }
  }
  
  // If we haven't added lines, there might be too many lines
  //  if(j === -1){
  //    // Remove lines that are empty above the amount we want
  //    while(elAbove(el, style.lAbove + 1).getText() == '' && elAbove(el, style.lAbove + 1).findElement(DocumentApp.ElementType.PAGE_BREAK) === -1){
  //      body.removeChild(elAbove(el, style.lAbove + 1));
  //    }
  //  }
  
  firstEl = false;
  return el;
} // End of STYLIZE function

// Set Document margin and font settings 
// https://screenwriting.io/what-is-standard-screenplay-format/
function docSetUp(){
  doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var footer = doc.getFooter();
  if(footer == undefined){
    footer = doc.addFooter();
  }
  
  // Set margins
  body.setMarginTop(72); // 1.0" top margin
  body.setMarginRight(72); // 1.0" right margin
  body.setMarginBottom(72); // 1.0" bottom margin
  body.setMarginLeft(108); // 1.5" left margin
  
  // Set font
  var style = {};
  
  style[DocumentApp.Attribute.FONT_FAMILY] = 'Courier';
  style[DocumentApp.Attribute.FONT_SIZE] = 12;
  style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#000000';
  body.setAttributes(style);
  
  style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] =
    DocumentApp.HorizontalAlignment.RIGHT;
  footer.setAttributes(style);
  try{
    footer.editAsText().setAttributes(style);
  } catch(e){}
}

// EL ABOVE
// Returns the element 'num' elements above the selected one.
// 'num' is optional, if not sent it defaults to 1 (right above)
function elAbove(el, num){
  var i = num || 1;
  var elIndex = 0;
  try {
    elIndex = doc.getBody().getChildIndex(el);
  }
  catch(err) {
    
  }
  
  var aboveIndex = elIndex - i;
  // Don't get element with negative index
  aboveIndex = aboveIndex > -1 ? aboveIndex : 0;
  
  // Try to get the element. If it returns an error (off the page) then return that element.
  try {
    return doc.getBody().getChild(aboveIndex);
  }
  catch(err) {
    return doc.getBody().getChildIndex(doc.getBody().getChild(0));
  }
}

// Store characters array as a document property
function setCharsToStorage(charList){
  try{
    const documentProperties = PropertiesService.getDocumentProperties();
    documentProperties.setProperty('chars', JSON.stringify(charList));
  } catch(e){
    DocumentApp.getUi().alert(
      "Issue saving characters to storage",
      "Looks like we had an issue saving your characters. It is probably a one-time thing, but if this keeps happening try re-installing the add-on or report the issue. Thanks!",
      DocumentApp.getUi().ButtonSet.OK);
  }
  //  documentProperties.setProperty('chars', JSON.stringify([]));
}

// Retrieve characters array from the document properties
function getCharsFromStorage(){
  let charStr = "";
  let chars = [];
  try{
    const documentProperties = PropertiesService.getDocumentProperties();
    charStr = documentProperties.getProperty('chars');
    chars = JSON.parse(charStr);
    if(!chars){
      chars = []; 
    }
  } catch(e){
    DocumentApp.getUi().alert(
      "Issue saving characters to storage",
      "Looks like we had an issue saving your characters. It is probably a one-time thing, but if this keeps happening try re-installing the add-on or report the issue. Thanks!",
      DocumentApp.getUi().ButtonSet.OK);
    chars = []
  }
  return chars || [];
}

function storeSettings(name, value){
  try{
    const documentProperties = PropertiesService.getDocumentProperties();
    const settingsStr = documentProperties.getProperty('doc-settings');
    var settings = JSON.parse(settingsStr);
    settings = settings || {}
    settings[name] = value;
    documentProperties.setProperty('doc-settings', JSON.stringify(settings));
  } catch(e){
    DocumentApp.getUi().alert(
      "Issue getting saved settings",
      "Looks like we had an issue saving your settings. It is probably a one-time thing, but if this keeps happening try re-installing the add-on or report the issue. Thanks!",
      DocumentApp.getUi().ButtonSet.OK);
  }
  
}

function getSettings(name, value){
  try{
    const documentProperties = PropertiesService.getDocumentProperties();
    const settingsStr = documentProperties.getProperty('doc-settings');
    const settings = JSON.parse(settingsStr);
    return settings || {};
  } catch(e){
    DocumentApp.getUi().alert(
      "Issue getting saved settings",
      "Looks like we had an issue getting your saved settings. It is probably a one-time thing, but if this keeps happening try re-installing the add-on or report the issue. Thanks!",
      DocumentApp.getUi().ButtonSet.OK);
  }
  return {};
}

function getCharsFromDOM(DOMcharList){
  setCharsToStorage(DOMcharList);
}

// Check if Character is in charList and add them if not.
// Create a shortcut for them based on the minimum unique letters
// charList = [{name, sh}]
function addToCharList(char){
  // If the name is already on the list, then get the heck out of here man
  if(charList.length > 0){
    for(i = 0; i < charList.length; i++){
      if(charList[i].name === char) {
        return;
      }
    }
  }
  // Okay so it's not on the list. Make a unique shortcut
  var charObj = {};
  charObj.name = char;
  for(j = 1; j < char.length + 1; j++){
    var SHtaken = false;
    var currentShorthand = char.substr(0, j);
    for(k = 0; k < charList.length; k++){
      if(charList[k].sh == currentShorthand){
        SHtaken = true;
        break;
      }
    }
    if(!SHtaken){
      charObj.sh = char.substr(0,j);
      charList.push(charObj);
      break;
    }
  }
  
}

function monthlyLicenseExpiryCheck(){
  // TODO: Get license from storage and see whether it's expired. Update storage if it is.
  // Once per month, check whether it's expired, refunded, or charged back
  
}

