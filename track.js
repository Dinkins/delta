var iterated = false; 
var change_map = {};
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var myObserver = new MutationObserver (mutationHandler);
var att_filter = new Array ('style'); //need to filter style changes only
var obsConfig  = {childList: false, characterData: false, attributes: true, subtree: false, attributeFilter: att_filter};
var page_target = document.querySelectorAll('body *');
var record = true; 

//listen for start/stop tracking message from the extension

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
      if(request.greeting === "TRIGGER OBSERVER")
      {
        if (record)
        {
          //start monitoring
          Array.prototype.slice.call(page_target).forEach(function(target, index, arr) {
          myObserver.observe(target, obsConfig);
          });
          record = false; 
        }
        else
        {
          //stop just fucking stop
          Array.prototype.slice.call(page_target).forEach(function(target, index, arr) {
          myObserver.disconnect();
           });
          record = true; 
        }
      }
      if(request.greeting === "GET CHANGES")
      {
        sendResponse({farewell: createStringFromHashMap()});
      }
      if(request.greeting ==="WRITE CHANGES")
      {
          writeFileAndForceDownload(createStringFromHashMap());
      }
});


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
        var path = killTrailingComma("body," + createNodePath(target, ""));
        change_map[path] = target.getAttribute("style");
      }
      console.log(change_map);
  });
}

function createNodePath(node, constructed_path)
{
  var loop_node = node; 
  var constructed_path = ""; 
  while (loop_node.nodeName != "BODY")
  {
      if(loop_node.id)
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
    return to_concat.concat(",", path);
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

function killTrailingComma(path)
{
  if(path.charAt(path.length -1) === ",")
  {
    return path.substring(0, path.length-1); 
  }
  else
  {
    return path; 
  }
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
  console.log(css_string);
  return css_string; 
}

function breakStyleChangesAndFormat(style_string)
{
 
  var style_array = style_string.replace(/^[\r\n]+|\.|[\r\n]+$/g, "").split(';');
  var formatted_string_with_style= "";
  for (var i = 0; i< style_array.length; i++)
  {
     if(style_array[i] != "")formatted_string_with_style = formatted_string_with_style + style_array[i] + ";"; 
  }
  return formatted_string_with_style; 
}

//write css to file and download
function writeFileAndForceDownload(css_styles)
{
  console.log(css_styles);
  var formatted_title = document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + "-deltastyles.css";
      window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
        fs.root.getFile(formatted_title, {create: true}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
               fileWriter.onerror = function(e) {
                    console.log('Write failed: ' + e.toString());
                };
                var blob = new Blob([css_styles], {type : "text/plain;charset=UTF-8"});
                var a = document.createElement('a');
                fileWriter.addEventListener("writeend", function() {
                        a.href = window.URL.createObjectURL(blob);
                        a.download = formatted_title;
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click(); //this is probably the key - simulating a click on a download link
                        delete a;
                }, false);
    
                fileWriter.write(blob);
            }, function() {});
        }, function() {});
    }, function() {});
}
