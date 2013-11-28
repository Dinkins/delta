chrome.contextMenus.create({"id": String(Date.now()), "title": "Write CSS Changes To File"});


chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	toggleNodeMonitoring("TRIGGER OBSERVER");
});});



// listen for notifiication to write out file
chrome.contextMenus.onClicked.addListener(function ()
{
  		toggleNodeMonitoring("GET CHANGES");
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	console.log(request);
  });

//helper methods
function toggleNodeMonitoring(message)
{ 
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		 chrome.tabs.sendMessage(tabs[0].id, {greeting: message}, function(response) {
		 	//console.log(response);
		 });
	});	
}