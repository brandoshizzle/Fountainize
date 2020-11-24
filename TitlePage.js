// Title page function
function addTitlePage(tpInfo){
  var body = DocumentApp.getActiveDocument().getBody();
  var topSpaces = 15;
  
  // Add title page
  body.insertPageBreak(0);
  body.insertParagraph(0, tpInfo.contact4).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  body.insertParagraph(0, tpInfo.contact3).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  body.insertParagraph(0, tpInfo.contact2).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  body.insertParagraph(0, tpInfo.contact1).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  for(var i = 0; i < 17; i++){
    body.insertParagraph(0, "").setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  }
  body.insertParagraph(0, tpInfo.author).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.insertParagraph(0, '').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.insertParagraph(0, 'by').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.insertParagraph(0, '').setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  if(tpInfo.subtitle !== ""){
    body.insertParagraph(0, tpInfo.subtitle).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    topSpaces = topSpaces - 1;
  }
  body.insertParagraph(0, tpInfo.title.toUpperCase()).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  for(var i = 0; i < topSpaces; i++){
    body.insertParagraph(0, "").setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  }
  
  storeSettings('tpInfo', tpInfo);
}

// Remove title page
function removeTitlePage(){
  
  // Find first page break and delete everything up to that
  var body = DocumentApp.getActiveDocument().getBody();
  var PBindex;
  for(var i = 0; i < body.getNumChildren(); i++){
    var p = body.getChild(i);
    // But make sure they haven't deleted the page themselves! If so, expect a scene header somewhere before the first page break
    var sceneText = p.asParagraph()
    sceneText = sceneText.getText().toUpperCase();
    var sceneConditions = [
      sceneText.substr(0,4) === 'INT.', // 1. Starts with 'int.' or 'ext.'
      sceneText.substr(0,4) === 'EXT.',
      !isNaN(parseInt(sceneText.substr(0,1))) && (sceneText.indexOf('INT.') > -1 || sceneText.indexOf('EXT.') > -1)
    ];
    if(matches(sceneConditions)){
      // Assume they've deleted thepage themselves and only delete up to the scene header
      PBindex = i - 1;
//      prompt('Its a match');
      break
    }
    
    // If we find a page break before we find a scene header, delete up to that
    if(p.findElement(DocumentApp.ElementType.PAGE_BREAK)){
      PBindex = i;
      break;
    };
  }
  
  for(var i = 0; i < PBindex + 1; i++){
    body.removeChild(body.getChild(0)); 
  }
  
}