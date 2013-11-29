chrome.contextMenus.create({"id": "write", "title": "Write CSS Changes To File", onclick: writeChangesToFile});
//chrome.contextMenus.create({"id": "copy", "title": "Copy CSS Changes To Clipboard", onclick: copyChangesToClipboard});

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	toggleNodeMonitoring("TRIGGER OBSERVER");
});});


//helper methods
function toggleNodeMonitoring(message)
{ 
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		 chrome.tabs.sendMessage(tabs[0].id, {greeting: message}, function(response) {
		 	if(response) return response.farewell; 
		 });
	});	
}

function writeChangesToFile()
{
	toggleNodeMonitoring("WRITE CHANGES");
}

// function copyChangesToClipboard()
// {
// 	var styles = toggleNodeMonitoring("GET CHANGES");
// 	//create popup to go here
// } holding off on implementing this until I write popup html