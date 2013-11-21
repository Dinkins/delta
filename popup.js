var record = true; 
var parent = chrome.contextMenus.create({"id": String(Date.now()), "title": "Write CSS Changes To File"});
chrome.tabs.executeScript(null, {file: "track.js"});

chrome.browserAction.onClicked.addListener(function(tab) {
	if(record)
	{		
		toggleNodeMonitoring("START");
		console.log(record);
		record = false; 
	}
	else
	{
		toggleNodeMonitoring("STOP");
		console.log("stopped");
		record = true; 
	}
});

//listen for notifiication to write out file
chrome.contextMenus.onClicked.addListener(function ()
{
  		//send a message to write the file out and return it back 
  		toggleNodeMonitoring("WRITE");
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "write")
      sendResponse({farewell: "goodbye"});
  });

//helper methods
function toggleNodeMonitoring(message)
{
	console.log('method called');
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {greeting: message});
		});
}