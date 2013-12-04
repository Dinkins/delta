//extension setup
chrome.contextMenus.create({"id": "write", "title": "Write CSS Changes To File", onclick: writeChangesToFile});
chrome.contextMenus.create({"id": "copy", "title": "Copy CSS Changes To Clipboard", onclick: copyChangesToClipboard});

//chrome event handlers
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	toggleNodeMonitoring("TRIGGER OBSERVER"); //TODO: Remove double tag query here since we're calling it in toggleNodeMonitoring
});});

chrome.tabs.onActivated.addListener(function(activeInfo)
{
	toggleNodeMonitoring("COUNT AND ACTIVE");
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
 	if(request.hasOwnProperty('active_flag')) changeIconAndSetBadge(sender.tab.id, request.count, request.active_flag);
  });

//main toggle methods
function toggleNodeMonitoring(message)
{   
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		 chrome.tabs.sendMessage(tabs[0].id, {greeting: message}, function(response) {
		 	if(response !== undefined)
		 	{
		 		if (response.hasOwnProperty('css')) setClipboardText(response.css);
		 		if (response.hasOwnProperty('active_flag') !== undefined) changeIconAndSetBadge(tabs[0].id, response.count, response.active_flag);
		 	}
		 });
	});	 
}

function writeChangesToFile()
{
	toggleNodeMonitoring("WRITE CHANGES");
}

function copyChangesToClipboard()
{
	 toggleNodeMonitoring("GET CHANGES");
} 

//helper methods
function setClipboardText(css)
{
	var text_vessle = document.createElement("textarea");
    text_vessle.textContent = css;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(text_vessle);
    text_vessle.select();
    document.execCommand('copy');
    body.removeChild(text_vessle);
}

function changeIconAndSetBadge(tabid, number_changes, active_flag)
{
	if (number_changes > 0) chrome.browserAction.setBadgeText({text: number_changes.toString(), tabId: tabid});
	setIcon(active_flag);
}

function setIcon(active_flag)
{
	if(!active_flag) //backwards because flag is changed after observer start/stop
	{
		chrome.browserAction.setIcon({path: "images/delta48_active.png"});
	}
	else
	{
		chrome.browserAction.setIcon({path: "images/delta48.png"});
	}
}

//TODO:
//create keybindings to start and stop monitoring