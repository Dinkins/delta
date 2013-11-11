var record = true; 

chrome.browserAction.onClicked.addListener(function(tab) {
	if(record)
	{
		chrome.tabs.executeScript(null, {file: "track.js"});
		record = false; 
	}
	else
	{
		chrome.runtime.sendMessage({greeting: "STOP"}, function(response) {
		});
		record = true; 
	}
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //message listener
  });

