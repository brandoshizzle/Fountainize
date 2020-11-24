// ON OPEN
// Adds options to the Add-on menu
function onOpen(e) {
  var ui = DocumentApp.getUi();
  //  ui.createMenu('Fountainize')
  //  .addItem('Show sidebar', 'showSidebar')
  //  .addItem('Convert markup', 'convert')
  //  .addItem('Set fonts, margins', 'docSetUp')
  //  .addToUi();
  try{
    ui.createAddonMenu()
    .addItem('Show sidebar', 'showSidebar')
    .addItem('Format Script', 'convert')
    .addToUi();
  } catch(e){
    DocumentApp.getUi().alert(
      "Issue creating menu",
      "Google prevented us from starting because we don't have the right permisisons. Please re-install and allow all permissions. Thanks!",
      DocumentApp.getUi().ButtonSet.OK);
  }
  
  // Set version to storage (to test if there's been an update)
  const updateTitle = "Fountainize update!"
  let documentProperties;
  try{
    documentProperties = PropertiesService.getDocumentProperties();
  } catch(e){
    return;
  }
  
  try{
    const pVersion = documentProperties.getProperty('version');
    if(pVersion != version){
      DocumentApp.getUi().alert(
        updateTitle,
        "Here's what's new in version " + version + "\n" + changelog[10],
        DocumentApp.getUi().ButtonSet.OK);
    }
  } catch(e){
    DocumentApp.getUi().alert(
      updateTitle,
      changelog[10],
      DocumentApp.getUi().ButtonSet.OK);
  }
  
  documentProperties.setProperty('version', version);
  monthlyLicenseExpiryCheck();
}

function onInstall(e) {
  onOpen(e);
}

// SHOW SIDEBAR
// Show a 300px sidebar
function showSidebar() {
  const title = isLicenseValid() !== false ? "Fountainize Pro" : "Fountainize (Free)";
  var html = HtmlService.createTemplateFromFile("FountainizeSidebar")
  .evaluate()
  .setTitle(title) // The title shows in the sidebar
  try{
    DocumentApp.getUi().showSidebar(html);
  } catch(e){
    Logger.log(e);
  }
}

const changelog = {
  10: "Added \n" +
  "- in:/out: now format as transitions \n" +
  "Fixed \n" +
  "- Issues with elAbove \n" +
  "- Dialogue in all caps works just fine now \n"
}