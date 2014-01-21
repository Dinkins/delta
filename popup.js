/**
*
* Delta methods and listeners
*
**/

//extension right click menu setup
chrome.contextMenus.create({"id": "write", "title": "Write css changes to file", onclick: writeChangesToFile});
chrome.contextMenus.create({"id": "copy", "title": "Copy css changes to clipboard", onclick: copyChangesToClipboard});

//fire when delta icon is clicked
chrome.browserAction.onClicked.addListener(function(tab) {
	toggleNodeMonitoring("TRIGGER OBSERVER");
});

function toggleNodeMonitoring(message)
{   
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		 chrome.tabs.sendMessage(tabs[0].id, {greeting: message}, function(response) {
		 	if(response !== undefined)
		 	{
		 		if (response.hasOwnProperty('css')) 
		 			{
		 				setClipboardText(response.css);
		 				return;
		 			}
		 		else if (response.hasOwnProperty('active_flag') !== undefined) 
		 			{
		 				changeIconAndSetBadge(tabs[0].id, response.count, response.active_flag);
		 			}
		 	}
		 });
	});	 
}

//fire when we get a message
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
 	if(request.hasOwnProperty('active_flag')) 
 		{
 			changeIconAndSetBadge(sender.tab.id, request.count, request.active_flag);
 		}
  });

//fire when someone uses the keyboard shortcuts
chrome.commands.onCommand.addListener(function(command){
	if(command === "deltatoggle")
	{
		toggleNodeMonitoring("TRIGGER OBSERVER");
	}

});

//tell delta to write
function writeChangesToFile()
{
	toggleNodeMonitoring("WRITE CHANGES");
}
//tell delta to copy
function copyChangesToClipboard()
{
	 toggleNodeMonitoring("GET CHANGES");
} 

/**
*
* self explanatory utility methods
*
**/
function setClipboardText(css)
{
	//hack to copy things to the clipboard via exec
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
	if (number_changes > 0)
	{
		chrome.browserAction.setBadgeText({text: number_changes.toString(), tabId: tabid});
	} 
	setIcon(active_flag, tabid);
}

function setIcon(active_flag, id)
{
	
	if(active_flag === false) //backwards because flag is changed after observer start/stop
	{
		chrome.browserAction.setIcon({path: "images/delta48_active.png", tabId: id});
	}
	else
	{
		chrome.browserAction.setIcon({path: "images/delta48.png", tabId: id}); 
	}
}

