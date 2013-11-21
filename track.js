var iterated = false; 
var change_map = new Map();
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var myObserver = new MutationObserver (mutationHandler);
var att_filter = new Array ('style'); //need to filter style changes only
var obsConfig  = {childList: false, characterData: false, attributes: true, subtree: false, attributeFilter: att_filter};
var page_target = document.querySelectorAll('body *');

console.log('injected');
alert('injected');

//listen for start/stop tracking message from the extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) 
  {
    console.log('received a message');
    if(request.greeting === "STOP")
    {
      Array.prototype.slice.call(page_target).forEach(function(target, index, arr) {
        myObserver.disconnect();
      });
    }
    else if(request.greeting === "START")
    {
      Array.prototype.slice.call(page_target).forEach(function(target, index, arr) {
        myObserver.observe(target, obsConfig);
      });
      console.log("started");
    }
    else if(request.greeting === "WRITE")
    {
      createStringFromHashMap();
    }
  }
);



function mutationHandler (mutationRecords) 
{
  mutationRecords.forEach(function (mutation) 
  {
      var target = mutation.target; 
      if(target.id)
      {
        change_map.put(target.id, target.getAttribute("style"));
      }
      else
      {
        var path = "body," + createNodePath(target, "");
        change_map.put(killTrailingComma(path), target.getAttribute("style"));
        
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
        constructed_path = assemblePathString(loop_node.localName + " [" + findElementIndex(loop_node) + "]", constructed_path);
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
  var css_string;
  var first_bracket = "\n{";
  var last_bracket = "}";

  if (change_map.size === 0)
  {
    return null; 
  }

  for(var i = 0; i++ < change_map.size; change_map.next())
  {
    css_string.concat(change_map.key() + first_bracket + breakStyleChangesAndFormat(change_map.hash(change_map.key())) + last_bracket);

  }

  return css_string; 
}

function breakStyleChangesAndFormat(style_string)
{
  var style_array = style_string.split(';');
  var semicolon = ";";
  var formatted_string_with_style = new String(); 
  for (var i = 0; i< style_array.length i++)
  {
    formatted_string_with_style.concat(style_array[i], semicolon, "\n");
  }
  console.log(formatted_string_with_style);
  return formatted_string_with_style; 
}

//Javascript Hashmap Implementation borrowed from this stackexchange post: http://stackoverflow.com/questions/368280/javascript-hashmap-equivalent
function Map(linkItems) {
    this.current = undefined;
    this.size = 0;

    if(linkItems === false)
        this.disableLinking();
}
Map.noop = function() {
    return this;
};
Map.illegal = function() {
    throw new Error("illegal operation for maps without linking");
};
Map.from = function(obj, foreignKeys) {
    var map = new Map;

    for(var prop in obj) {
        if(foreignKeys || obj.hasOwnProperty(prop))
            map.put(prop, obj[prop]);
    }

    return map;
};
Map.prototype.disableLinking = function() {
    this.link = Map.noop;
    this.unlink = Map.noop;
    this.disableLinking = Map.noop;
    this.next = Map.illegal;
    this.key = Map.illegal;
    this.value = Map.illegal;
    this.removeAll = Map.illegal;

    return this;
};
Map.prototype.hash = function(value) {
    return (typeof value) + ' ' + (value instanceof Object ?
        (value.__hash || (value.__hash = ++arguments.callee.current)) :
        value.toString());
};
Map.prototype.hash.current = 0;
Map.prototype.get = function(key) {
    var item = this[this.hash(key)];
    return item === undefined ? undefined : item.value;
};
Map.prototype.put = function(key, value) {
    var hash = this.hash(key);
    if(this[hash] === undefined) {
        var item = { key : key, value : value };
        this[hash] = item;

        this.link(item);
        ++this.size;
    }
    else this[hash].value = value;
    return this;
};
Map.prototype.remove = function(key) {
    var hash = this.hash(key);
    var item = this[hash];
    if(item !== undefined) {
        --this.size;
        this.unlink(item);

        delete this[hash];
    }
    return this;
};
Map.prototype.removeAll = function() {
    while(this.size)
        this.remove(this.key());

    return this;
};
Map.prototype.link = function(item) {
    if(this.size == 0) {
        item.prev = item;
        item.next = item;
        this.current = item;
    }
    else {
        item.prev = this.current.prev;
        item.prev.next = item;
        item.next = this.current;
        this.current.prev = item;
    }
};
Map.prototype.unlink = function(item) {
    if(this.size == 0)
        this.current = undefined;
    else {
        item.prev.next = item.next;
        item.next.prev = item.prev;
        if(item === this.current)
            this.current = item.next;
    }
};
Map.prototype.next = function() {
    this.current = this.current.next;
};
Map.prototype.key = function() {
    return this.current.key;
};
Map.prototype.value = function() {
    return this.current.value;
};


