// $(function()
// {	

// 	$('.onoffswitch-checkbox').on('click', function()
// 	{
// 		if($(this).is(':checked'))
// 		{
// 			console.log('switch on');
// 		}
	
// 		chrome.tabs.executeScript(null, {file: "jquery.js"}, function(){
// 		   	chrome.tabs.executeScript(null, {file: "track.js"});
// 		});

//     	console.log('executed script');
// 	});
// });

var record = false; 

chrome.browserAction.onClicked.addListener(function(tab) {
	if(record)
	{
		//stop recording mutation events
	}
	else
	{
		//start recording mutation events
		chrome.tabs.executeScript(null, {file: "jquery.js"}, function(){
		   	chrome.tabs.executeScript(null, {file: "track.js"});
		});
	}
});

