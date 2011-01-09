/* 
 * A connector node object
 * Copy-and-Paste from Node
 */
ConnectorNode = function(
  id,     // unique id for the node from the database
  paper,  // the raphael paper this node is drawn to
  r,      // radius
  x,      // the x coordinate in pixel coordinates
  y,      // y coordinates 
  z,      // z coordinates
  zdiff)  // the different from the current slices
{ 
  // the database treenode id
  this.id = id;
  // this object should be used for synapses, for now only location
  this.type = "location";
  
  // state variable whether this node is already synchronized with the database
  this.needsync = false;
  
  // local screen coordinates relative to the div
  // pixel coordinates
  this.x = x;
  this.y = y;
  this.z = z;
  this.zdiff = zdiff;
  this.paper = paper;
  
  // set of presynaptic treenodes
  this.pregroup =  new Object();
  
  // set of postsynaptic treenodes
  this.postgroup = new Object();
  
  // prefixed radius for now
  this.r = r;
  
  // local variables, only valid in the scope of a node
  // and not accessible to the outisde
  var ox = 0, oy = 0;
  // the raphael node objects, one for display, the other
  // slightly bigger one for dragging
  var c, mc;

  // the node fill color depending on its distance for the
  // current slice
  var fillcolor;
  if(zdiff == 0)
   fillcolor = "rgb(208, 156, 46)";
  else if(zdiff == 1)
   fillcolor = "rgb(0, 0, 255)";
  else if(zdiff == -1)
   fillcolor = "rgb(255, 0, 0)";
   
  // if the zdiff is bigger than zero we do not allow
  // to drag the nodes
  if(this.zdiff == 0)
    this.rcatch = r + 8;
  else
    this.rcatch = 0;

  // XXX: update the parent node of this node
  // update parent's children array
  /*
  this.updateParent = function(par)
  {
    // par must be a Node object
    this.parent = par;
    // update reference to oneself
    this.parent.children[id] = this;
  }*/
  
  // update the parent if it exists
  /*
  if ( this.parent != null ) {
    // if parent exists, update it
    this.updateParent(parent);
  }*/
  
  // update the local x,y coordinates
  // updated them for the raphael object as well
  this.setXY = function(xnew, ynew)
  {
    this.x = xnew;
    this.y = ynew;
    c.attr({cx: this.x, cy: this.y});
    mc.attr({cx: this.x, cy: this.y});
    this.draw();
  }
  
  // set to default fill color
  this.setDefaultColor = function()
  {
      c.attr({fill: fillcolor});
  }
          
  // the accessor method for the display node
  this.getC = function(){ return c; }
  
  // create a raphael circle object
  c = this.paper.circle( this.x, this.y, this.r ).attr({
        fill: fillcolor,
        stroke: "none",
        opacity: 1.0
        });
        
  // a raphael circle oversized for the mouse logic
  mc = this.paper.circle( this.x, this.y, this.rcatch).attr({
        fill: "rgb(0, 1, 0)",
        stroke: "none",
        opacity: 0
        });
        

  // add a reference to the parent container node in the
  // raphael object in order to being able for the drag event handler
  // to do something sensible
  mc.parentnode = this;
  
  // an array storing the children Node objects of the this node
  // this.children = new Object();
  
  // XXX: delete all objects relevant to this node
  // such as raphael DOM elements and node references
  // javascript's garbage collection should do the rest
  this.deleteall = function()
  {
    // test if there is any child of type ConnectorNode
    // if so, it is not allowed to remove the treenode
    /*for ( var i = 0; i < children.length; ++i ) {
      if( children[i] instanceof ConnectorNode ) {
        console.log("not allowed to delete treenode with connector attached. first remove connector.")
        return;
      }
    }
    */
    // remove the parent of all the children
    for ( var i = 0; i < this.children.length; ++i ) {
      this.children[ i ].line.remove();
      this.children[ i ].removeParent();
    }
    // remove the raphael svg elements from the DOM
    c.remove();
    mc.remove();
    if(this.parent != null) {
      this.removeLine();
      // remove this node from parent's children list
      for ( var i in this.parent.children) {
        if(this.parent.children[i].id == id)
         delete this.parent.children[i];
      }
    }
  }
  
  /* 
   * XXX: delete the node from the database and removes it from
   * the current view and local objects
   * 
   */
  this.deletenode = function()
  {
    requestQueue.register(
      "model/treenode.delete.php",
      "POST",
      {
        pid : project.id,
        tnid : this.id
      },
      function(status, text, xml)
      {
        if ( status != 200 )
        {
          alert("The server returned an unexpected status ("+status+") "+
                  "with error message:\n"+text);
        }
        return true;
      });

    // remove the parent of all the children
    for ( var i in this.children) {
      this.children[ i ].removeLine();
      this.children[ i ].removeParent();
    }
    // remove the raphael svg elements from the DOM
    c.remove();
    mc.remove();
    this.removeLine();
    
    if(this.parent != null) {
      // remove this node from parent's children list
      for ( var i in this.parent.children) {
        if(this.parent.children[i].id == id)
         delete this.parent.children[i];
      }
    }
  }
  
  // remove the raphael line to the parent
  this.removeLine = function()
  {
    line.remove();
  }
  
  // remove the parent node
  /*
  this.removeParent = function()
  { 
    delete this.parent;
    this.parent = null;
  }*/
  
  // updates the raphael path coordinates
  this.drawLine = function(to_id, pre)
  {          
      var line = this.paper.path();
      if(pre) {
        line.attr( {path: [ [ "M", c.attrs.cx, c.attrs.cy ], 
                            [ "L", this.pregroup[to_id].getC().attrs.cx, this.pregroup[to_id].getC().attrs.cy ] ],
                     "stroke-width": 2, "stroke-linecap": "round",
                     "stroke": "rgb(255, 100, 255)",
                    } );    
      } else {
        line.attr( {path: [ [ "M", c.attrs.cx, c.attrs.cy ], 
                            [ "L", this.postgroup[to_id].getC().attrs.cx, this.postgroup[to_id].getC().attrs.cy ] ],
                     "stroke-width": 2, "stroke-linecap": "round",
                     "stroke": "rgb(100, 100, 255)",
                    } );   
      }
     return line;
  }
  
  this.preLines = new Object();
  this.postLines = new Object();
  
  this.updateLines = function() {
    
    for(var i in this.preLines) {
      this.preLines[i].remove();
    }

    for(var i in this.postLines) {
      this.postLines[i].remove();
    }

    // re-create
    for(var i in this.pregroup) {
      var l = this.drawLine(this.pregroup[i].id, true);
      this.preLines[this.pregroup[i].id] = l;
    }

    for(var i in this.postgroup) {
      var l = this.drawLine(this.postgroup[i].id, false);
      this.postLines[this.postgroup[i].id] = l;
    }

    
  }
  
  
  // draw function to update the paths from the children
  // and to its parent  
  this.draw = function() {
    
    // delete lines and recreate them with the current list
    this.updateLines();
      
  }
  
  /*
   * event handlers
   */
  
  mc.dblclick(function (e) {
    if(e.shiftKey) // zoom in
      slider_s.move( -1 );
    else // zoom out
      slider_s.move( 1 );
    // update position
    // var m = ui.getMouse( e );   
    // XXX: how to propagate the offsets to physical coordinates
    // and apply moveTo. Need to know current scale and cannot invoke
    // svgOverlay event handler methods here (no reference)
    /*
    var phys_x = pix2physX(m.offsetX);
    var phys_y = pix2physY(m.offsetY);
    var phys_z = project.coordinates.z;
    project.moveTo( project.coordinates.z, phys_y, phys_x );
    console.log("scale", project.focusedStack.screenCoordinates().s);
    */
  });
  
  mc.click(function (e) {
    // return some log information when clicked on the node
    // this usually refers here to the mc object
    /*
    console.log("----------");
    console.log("correct id", this.parentnode.id);
    console.log("activated node", this.parentnode);
    console.log("handler object", this);
    console.log("its pre", this.pregroup);
    console.log("its post", this.postgroup);
    console.log("its coords", this.parentnode.x, this.parentnode.y, this.parentnode.z);
    console.log("-----------");
    */
    if(e.ctrlKey && e.shiftKey ){
      this.parentnode.deletenode();
    } else if (e.shiftKey) {
      if(atn != null ) { 
        // connected activated treenode or connectornode
        // to existing treenode or connectornode

        alert("You want to connect an active treenode with this location!");
        // is the connection pre or postsynaptic?
        // XXX: add another connector.create or class_instanstance create giving 
        // location and treenode id
        console.log("active node id", atn.id, "to current location id", this.parentnode.id);
        
      } else {

        
      }
    }
    else {
      //console.log("Try to activate node");
      // activate this node
      activateNode( this.parentnode );
      // stop propagation of the event
      e.stopPropagation();
    }
  });

  mc.move = function( dx, dy )
  {
    this.parentnode.x = ox + dx;
    this.parentnode.y = oy + dy;
    c.attr({cx: this.parentnode.x,cy: this.parentnode.y});
    mc.attr({cx: this.parentnode.x,cy: this.parentnode.y});
    this.parentnode.draw();
  }
  mc.up = function()
  {
    c.attr({opacity:1});
    this.parentnode.needsync = true;
  }
  mc.start = function()
  {
    // as soon you do something with the node, activate it
    activateNode( this.parentnode );
    ox = mc.attr("cx");
    oy = mc.attr("cy");
    c.attr({opacity:0.7});
  }
  mc.drag( mc.move, mc.start, mc.up );
}