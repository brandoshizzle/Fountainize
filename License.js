var productCodeLifetime = 'fountainize-lifetime';
var productCodeSub = 'fountainize-sub';

function isLicenseValid(){
  const userProps = PropertiesService.getUserProperties();
  const allProps = userProps.getProperties();
  if('license' in allProps){
    return isLicenseCurrent(allProps.license);
  } else {
    return false;
  }
}

function isLicenseCurrent(license){
  const notValid = license.refunded || license.subscription_cancelled_at === null || license.subscription_failed_at === null || license.dispute_won;
  return !notValid;
}

function getLicense(){
  const userProps = PropertiesService.getUserProperties();
  const allProps = userProps.getProperties();
  if('license' in allProps){
    return allProps.license;
  } else {
    return false;
  }
}

function removeLicense(){
  const userProps = PropertiesService.getUserProperties();
  const allProps = userProps.deleteProperty("license")
}

function checkLicenseKey(licenseKey){
  
  // Because payload is a JavaScript object, it is interpreted as
  // as form data. (No need to specify contentType; it automatically
  // defaults to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')
  var options = {
      'method' : 'post',
      'payload' : {
        'product_permalink': 'fountainize-sub',
        'license_key': licenseKey
      }
    };
  
  try{
    // Try subscription
    var response = UrlFetchApp.fetch('https://api.gumroad.com/v2/licenses/verify', options);
    var json = response.getContentText();
    var code = response.getResponseCode();
    var data = JSON.parse(json);
    if(data.uses > 3){
      // Warning message
    }
    const userProps = PropertiesService.getUserProperties();
    userProps.setProperty('license', JSON.stringify(data.purchase));
    return data;
  } catch (e){
    try{
      // Try one-time
      options.payload.product_permalink = "fountainize-lifetime";
      var response = UrlFetchApp.fetch('https://api.gumroad.com/v2/licenses/verify', options);
      var json = response.getContentText();
      var code = response.getResponseCode();
      var data = JSON.parse(json);
      if(data.uses > 3){
        // Warning message
      }
      const userProps = PropertiesService.getUserProperties();
      userProps.setProperty('license', JSON.stringify(data.purchase));
      return data;
    } catch (e){
      return {success: 'false'}
    }
    
  }
  
}