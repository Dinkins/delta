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

// map initialisation from existing object
// doesn't add inherited properties if not explicitly instructed to:
// omitting foreignKeys means foreignKeys === undefined, i.e. == false
// --> inherited properties won't be added
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

// overwrite in Map instance if necessary
Map.prototype.hash = function(value) {
    return (typeof value) + ' ' + (value instanceof Object ?
        (value.__hash || (value.__hash = ++arguments.callee.current)) :
        value.toString());
};

Map.prototype.hash.current = 0;

// --- mapping functions

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

// only works if linked
Map.prototype.removeAll = function() {
    while(this.size)
        this.remove(this.key());

    return this;
};

// --- linked list helper functions

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

// --- iterator functions - only work if map is linked

Map.prototype.next = function() {
    this.current = this.current.next;
};

Map.prototype.key = function() {
    return this.current.key;
};

Map.prototype.value = function() {
    return this.current.value;
};

//constructs node path for storage in map
function recursePath(node, constructed_path)
{
  console.log(node.nodeName);

  var iterated = false; 
  var loop_node = node; 
  var constructed_path = ""; 
  while (loop_node.nodeName != "BODY")
  {
      if(loop_node.id)
      {
        var id = loop_node.id;
        console.log("id is" + id); 
        constructed_path = assemblePathString(id, constructed_path)
        // var new_path = id.concat(",", constructed_path); 
      }
      else if (loop_node.getAttribute("class"))
      {
        var classes = loop_node.getAttribute("class");
        console.log("classes are" + classes);
        constructed_path= classes + "," + constructed_path; 
        // var new_path = classes.concat(",", constructed_path);
      }
      else
      {
        var node_position = findElementIndex(loop_node);
        var vague_path = loop_node.localName + " [" + node_position + "]"; 
        console.log("path is " + vague_path);
        constructed_path = vague_path + "," + constructed_path; 
        // var new_path = vague_path.concat(",", constructed_path);
      }
      iterate ++; 
    loop_node = loop_node.parentNode; 
    console.log(loop_node);
  }
    
  console.log("looped through" + iterate + " levels");
  console.log("path is" + constructed_path);
  return constructed_path; 

   
}

//finish string assembly method
//read over fily system api
//look at minimalist wordpress/tumblr themes

function assemblePathSting(to_concat, path)
{

  if(!iterated)
  {
    //if this is the first iteration don't add a comma
    return to_concat; 
  }
  else
  {
    return to_concat.concat(",", path);
  }

}

//finds the index of the element
function findElementIndex(node)
{
  var index = 1;
   var i=1;
    while(node.previousSibling)
    {
        node = node.previousSibling;
        if(node.nodeType === 1){
            i++;
        }
    }
    return i;
  console.log("element is in position " + index);
  return index; 
}




  var change_map = new Map();
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var myObserver = new MutationObserver (mutationHandler);
  var att_filter = new Array ('style'); //need to filter style changes only
  var obsConfig  = {childList: false, characterData: false, attributes: true, subtree: false, attributeFilter: att_filter};
  
  var page_target = $('body *');
  page_target.each(function(){
  	myObserver.observe(this, obsConfig);
  });

  function mutationHandler (mutationRecords) 
  {
    console.info ("mutationHandler:");

    mutationRecords.forEach (function (mutation) 
    {
        var target = mutation.target; 
        if(target.id)
        {
          //this is easy, we know what this node is called
          console.log(target.id + " changed its style value");
          change_map.put(target.id, target.getAttribute("style"));
        }
        else{
          var path = "body," + recursePath(target, "");
          console.log("path method result is: " + path);
          console.log("putting this into the map: " +  path);
          change_map.put(path, target.getAttribute("style"));        }
          console.log(change_map);
    });
  }




