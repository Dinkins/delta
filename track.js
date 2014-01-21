var iterated = false,
  change_map = {},
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
  myObserver = new MutationObserver (mutationHandler),
  att_filter = new Array ('style'),
  obsConfig  = {childList: false, characterData: false, attributes: true, subtree: false, attributeFilter: att_filter},
  page_target = document.querySelectorAll('*'),
  record = true; 

//context script message handler
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
      if(request.greeting === "TRIGGER OBSERVER")
      {
        if (record)
        {
          //start monitoring
          Array.prototype.slice.call(page_target).forEach(
            function(target, index, arr) {
              myObserver.observe(target, obsConfig);
            });
          record = false; 
        }
        else
        {
          Array.prototype.slice.call(page_target).forEach(
              function(target, index, arr) {
                myObserver.disconnect();
              });
          record = true; 
        }
        sendResponse({active_flag: record, count: Object.keys(change_map).length});
      }

      if(request.greeting === "GET CHANGES")
      { 
        if(Object.keys(change_map).length === 0)
        {
          alert('Delta has not observed any changes on this page.'); 
          return;
        } 
        sendResponse({css: createStringFromHashMap()});
      }

      if(request.greeting === "WRITE CHANGES")
      {
        if(Object.keys(change_map).length === 0)
        {
          alert('Delta has not observed any changes on this page.'); 
          return;
        } 
        writeFileAndForceDownload(createStringFromHashMap());
      }
      
      if(request.greeting === "COUNT AND ACTIVE")
      {
        sendResponse({active_flag: record, count: Object.keys(change_map).length});
      }
});

//mutation handler for changes to dom elements
function mutationHandler (mutationRecords) 
{
  mutationRecords.forEach(function (mutation) 
  {
      var target = mutation.target; 
      if(target.id)
      {
        change_map["#" + target.id] =target.getAttribute("style");
      }
      else
      {
        var path = createNodePath(target, "");
        change_map[path] = target.getAttribute("style");
      }
      sendBadgeCount();
  });
}

function sendBadgeCount()
{
  chrome.runtime.sendMessage({count: Object.keys(change_map).length, active_flag: record}, function(response) {
});
}

function createNodePath(node, constructed_path)
{
  var loop_node = node; 
  var constructed_path = ""; 
  while (loop_node.nodeName !== "#document")
  {
      if(loop_node.nodeName === "BODY" || loop_node.nodeName === "HTML")
      {
        constructed_path = assemblePathString(loop_node.localName, constructed_path);
      }
      else if(loop_node.id)
      {
        constructed_path = assemblePathString("#"+ loop_node.id, constructed_path);
      }
      else if (loop_node.getAttribute("class"))
      {
        constructed_path = assemblePathString(styleClassNames(loop_node.getAttribute("class")), constructed_path); 
      }
      else
      {
        constructed_path = assemblePathString(loop_node.localName + ":nth-child(" + findElementIndex(loop_node) + ")", constructed_path);
      }
      iterated = true; 
      loop_node = loop_node.parentNode; 
  }  
  return constructed_path;    
}



//createNodePath helper methods
function styleClassNames(class_string)
{
  var modified_class_string = "";
  if(class_string.indexOf(" ") !== -1)
  {
    var skrangs = class_string.split(" ");
    for (var i = 0; i < skrangs.length; i++)
    {
      modified_class_string = modified_class_string.concat("." + skrangs[i]);
    }
    return modified_class_string; 
  }
  else
  {
     return "."+class_string;
  }
}

function assemblePathString(to_concat, path)
{
  if(!iterated)
  {
    return to_concat; 
  }
  else
  {
    return to_concat.concat(" ", path);
  }
}

function findElementIndex(node)
{
   var i=1;
   while(node.previousSibling)
    {
        node = node.previousSibling;
        if(node.nodeType === 1){
            i++;
        }
    }
   return i;   
}

function createStringFromHashMap()
{
  var css_string = new String();
  var first_bracket = "\n{\n";
  var last_bracket = "\n}\n";

  if (change_map.size === 0)
  {
    return null; 
  }

  for(key in change_map)
  {
    if(change_map.hasOwnProperty(key))
    {
      css_string = css_string + key + first_bracket + breakStyleChangesAndFormat(change_map[key]) + last_bracket;
    }    
  }
  return css_string; 
}

function breakStyleChangesAndFormat(style_string)
{
 
  var style_array = style_string.replace(/^[\r\n]+|\.|[\r\n]+$/g, "").split(';');
  var formatted_string_with_style= "";
  for (var i = 0; i< style_array.length; i++)
  {
     if(style_array[i] != "")
      {
        formatted_string_with_style = formatted_string_with_style + style_array[i] + ";\n"; 
      }
  }
  return formatted_string_with_style; 
}

//write css to file and download
function writeFileAndForceDownload(css_styles)
{
  var formatted_title = document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + "-deltastyles.css";
      window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
        fs.root.getFile(formatted_title, {create: true}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
               fileWriter.onerror = function(e) {
                    alert("An error occured while writing this file.");
                    return; 
                };
                var blob = new Blob([css_styles], {type : "text/plain;charset=UTF-8"});
                var a = document.createElement('a');
                fileWriter.addEventListener("writeend", function() {
                        a.href = window.URL.createObjectURL(blob);
                        a.download = formatted_title;
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click(); 
                        delete a;
                }, false);
                fileWriter.write(blob);
            }, function() {});
        }, function() {});
    }, function() {});
}
