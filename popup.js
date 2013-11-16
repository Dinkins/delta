var record = true; 
console.log(parent);

chrome.browserAction.onClicked.addListener(function(tab) {
	if(record)
	{
		chrome.tabs.executeScript(null, {file: "track.js"});
		toggleNodeMonitoring("START");
		record = false; 
	}
	else
	{
		toggleNodeMonitoring("STOP");
		record = true; 
	
	}
});

//helper methods
function toggleNodeMonitoring(message)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {greeting: message});
		});
}