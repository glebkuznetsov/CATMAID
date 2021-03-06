/* -*- mode: espresso; espresso-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set softtabstop=2 shiftwidth=2 tabstop=2 expandtab: */

initObjectTree = function (pid) {

  // id of object tree
  object_tree_id = "#tree_object";

  $("#refresh_object_tree").click(function () {
    $("#tree_object").jstree("refresh", -1);
  });

  $(object_tree_id).jstree({
    "core": {
      "html_titles": false
    },
    "plugins": ["themes", "json_data", "ui", "crrm", "types", "dnd", "contextmenu"],
    "json_data": {
      "ajax": {
        "url": "model/tree.object.list.php",
        "data": function (n) {
          // depending on which type of node it is, display those
          // the result is fed to the AJAX request `data` option
          return {
            "pid": pid,
            "parentid": n.attr ? n.attr("id").replace("node_", "") : 0
          };
        },
        "success": function (e) {
          if (e.error) {
            alert(e.error);
          }
        }
      },
      "progressive_render": true
    },
    "ui": {
      "select_limit": 1,
      "select_multiple_modifier": "ctrl",
      "selected_parent_close": "deselect"
    },

    "themes": {
      "theme": "classic",
      "url": "widgets/themes/kde/jsTree/classic/style.css",
      "dots": false,
      "icons": true
    },
    "contextmenu": {
      "items": function (obj) {
        var id_of_node = obj.attr("id");
        var type_of_node = obj.attr("rel");
        var menu = {};
        if (type_of_node === "root") {
          menu = {
            "create_group": {
              "separator_before": false,
              "separator_after": false,
              "label": "Create group",
              "action": function (obj) {
                att = {
                  "state": "open",
                  "data": "group",
                  "attr": {
                    "rel": "group",
                    "relname": "part_of"
                  }
                };
                this.create(obj, "inside", att, null, true);
              }
            },
            "rename_root": {
              "separator_before": true,
              "separator_after": false,
              "label": "Rename root",
              "action": function (obj) {
                this.rename(obj);
              }
            }
          };
        } else if (type_of_node === "group") {
          menu = {
            "create_group": {
              "separator_before": false,
              "separator_after": false,
              "label": "Create group",
              "action": function (obj) {
                att = {
                  "state": "open",
                  "data": "group",
                  "attr": {
                    "rel": "group",
                    "relname": "part_of"
                  }
                };
                this.create(obj, "inside", att, null, true);
              }
            },
            "create_neuron": {
              "separator_before": false,
              "separator_after": false,
              "label": "Create neuron",
              "action": function (obj) {
                att = {
                  "state": "open",
                  "data": "neuron",
                  "attr": {
                    "rel": "neuron",
                    "relname": "part_of"
                  }
                };
                this.create(obj, "inside", att, null, true);
              }
            },
            "rename_group": {
              "separator_before": true,
              "separator_after": false,
              "label": "Rename group",
              "action": function (obj) {
                this.rename(obj);
              }
            },
            "remove_group": {
              "separator_before": false,
              "icon": false,
              "separator_after": false,
              "label": "Remove group",
              "action": function (obj) {
                this.remove(obj);
              }
            }
          };
        } else if (type_of_node === "neuron") {
          menu = {
/*
					"create_skeleton" : {
						"separator_before"	: false,
						"separator_after"	: false,
						"label"				: "Create skeleton",
						"action"			: function (obj) {
							att = { "state": "open",
									"data": "skeleton",
									"attr" : {"rel" : "skeleton", "relname" : "model_of" }
								};
							this.create(obj, "inside", att, null, true);
						}
					},*/
            "rename_neuron": {
              "separator_before": true,
              "separator_after": false,
              "label": "Rename neuron",
              "action": function (obj) {
                this.rename(obj);
              }
            },
            "remove_neuron": {
              "separator_before": false,
              "icon": false,
              "separator_after": false,
              "label": "Remove neuron",
              "action": function (obj) {
                this.remove(obj);
              }
            },
            "ccp": false
          };
        } else if (type_of_node === "skeleton") {
          menu = {
            "goto_parent": {
              "separator_before": false,
              "separator_after": false,
              "label": "Go to root node",
              "action": function (obj) {

                var skelid = obj.attr("id").replace("node_", "");
                requestQueue.register("model/skeleton.root.get.php", "POST", {
                  pid: project.id,
                  skeletonid: skelid
                }, function (status, text, xml) {
                  if (status === 200) {
                    if (text && text !== " ") {
                      var e = $.parseJSON(text);
                      if (e.error) {
                        alert(e.error);
                      } else {
                        // go to node
                        project.moveTo(e.z, e.y, e.x);

                        // activate the node with a delay
                        window.setTimeout("project.selectNode( " + e.root_id + " )", 1000);

                      }
                    }
                  }
                });

              }
            },
            "show_treenode": {
              "separator_before": false,
              "separator_after": false,
              "label": "Show treenode table",
              "action": function (obj) {
                // deselect all (XXX: only skeletons? context?)
                this.deselect_all();
                // select the node
                this.select_node(obj);

                project.showDatatableWidget("treenode");
                // datatables grabs automatically the selected skeleton
                oTable.fnDraw();
              }
            },
            "show_connectortable": {
              "separator_before": false,
              "separator_after": false,
              "label": "Show connector table",
              "action": function (obj) {
                // deselect all (XXX: only skeletons? context?)
                this.deselect_all();
                // select the node
                this.select_node(obj);

                project.showDatatableWidget("connector");
                // datatables grabs automatically the selected skeleton
                connectorTable.fnDraw();
              }
            },
            "rename_skeleton": {
              "separator_before": true,
              "separator_after": false,
              "label": "Rename skeleton",
              "action": function (obj) {
                this.rename(obj);
              }
            },
            "remove_skeleton": {
              "separator_before": false,
              "icon": false,
              "separator_after": false,
              "label": "Remove skeleton",
              "action": function (obj) {
                this.remove(obj);
              }
            }
          };
        }
        return menu;
      }

    },
    "crrm": {
      "move": {
        "always_copy": false,
        "check_move": function (m) {

          // valid moves (class - class)
          valid_moves = {
            "group": ["root", "group"],
            // part_of
            "neuron": ["group"],
            // part_of
            "skeleton": ["neuron"] // model_of
          };

          // http://snook.ca/archives/javascript/testing_for_a_v

          function oc(a) {
            var o = {}, i;
            for (i = 0; i < a.length; i++) {
              o[a[i]] = '';
            }
            return o;
          }

          srcrel = m.o.attr("rel"); // the node being moved
          dstrel = m.r.attr("rel"); // the node moved to
          if ( oc(valid_moves[srcrel]).hasOwnProperty(dstrel) ) {
            return true;
          }
          else {
            return false;
          }
        }
      }
    },
    "types": {
      "max_depth": -2,
      "max_children": -2,
      "valid_children": ["group"],
      "types": {
        // the default type
        "default": {
          "valid_children": "none"
          //"select_node"	: false,
          //"open_node"	: true,
          //"close_node"	: true,
          //"create_node"	: true,
          //"delete_node"	: true
        },
        "root": {
          "icon": {
            "image": "widgets/themes/kde/jsTree/neuron/root.png"
          },
          "valid_children": ["group"],
          "start_drag": false,
          "select_node": false,
          "delete_node": false,
          "remove": false
        },
        "group": {
          "icon": {
            "image": "widgets/themes/kde/jsTree/neuron/group.png"
          },
          "valid_children": ["group", "neuron"],
          "start_drag": true,
          "select_node": false
        },
        "neuron": {
          "icon": {
            "image": "widgets/themes/kde/jsTree/neuron/neuron.png"
          },
          "valid_children": ["skeleton"],
          "start_drag": true,
          "select_node": true
        },
        "skeleton": {
          "icon": {
            "image": "widgets/themes/kde/jsTree/neuron/skeleton.png"
          },
          "valid_children": "none",
          "start_drag": true,
          "select_node": true
        },
        "modelof": {
          "icon": {
            "image": "widgets/themes/kde/jsTree/neuron/modelof.png"
          },
          "select_node": function () {
            return false;
          },
          "valid_children": ["skeleton"],
          "start_drag": false
        }
      }
    }
  });

  // handlers
  //	"inst" : /* the actual tree instance */,
  //	"args" : /* arguments passed to the function */,
  //	"rslt" : /* any data the function passed to the event */,
  //	"rlbk" : /* an optional rollback object - it is not always present */
  $(object_tree_id).bind("loaded.jstree", function (event, data) {
    // console.log("Object tree loaded.");
  });

  $(object_tree_id).bind("before.jstree", function (e, data) {
    var node_description, message;
    if (data.func === "remove") {
      if (data.args.length > 1) {
        // I don't think multiple selections are possible, but just
        // in case:
        node_description = "multiple objects";
      } else {
        node_description = data.args[0].text().replace(/^\W+/,'').replace(/\W+$/,'');
      }
      message = "Do you really want to remove '"+node_description+"'?";
      if (!confirm(message)) {
        e.stopImmediatePropagation();
        return false;
      }
    }
  });

  $(object_tree_id).bind("deselect_node.jstree", function (event, data) {
    var key;
    id = data.rslt.obj.attr("id").replace("node_", "");
    type = data.rslt.obj.attr("rel");

    // deselection only works when explicitly done by ctrl
    // we get into a bad state when it gets deselected by selecting another node
    // thus, we only allow one selected node for now
    // remove all previously selected nodes (or push it to the history)
    for (key in project.selectedObjects.tree_object) {
      if(project.selectedObjects.tree_object.hasOwnProperty(key)) {
        // FIXME: use splice(1,1) instead
        delete project.selectedObjects.tree_object[key];
      }
    }

    project.selectedObjects.selectedneuron = null;

    // deselect skeleton
    if (type === "skeleton") {
      project.selectedObjects.selectedskeleton = null;
    }

  });

  $(object_tree_id).bind("select_node.jstree", function (event, data) {
    var key;
    id = data.rslt.obj.attr("id").replace("node_", "");
    type = data.rslt.obj.attr("rel");

    // remove all previously selected nodes (or push it to the history)
    for (key in project.selectedObjects.tree_object) {
      if(project.selectedObjects.tree_object.hasOwnProperty(key)) {
        // FIXME: use splice(1,1) instead
        delete project.selectedObjects.tree_object[key];
      }
    }


    project.selectedObjects.tree_object[id] = {
      'id': id,
      'type': type
    };

    if (type === "neuron") {
      project.selectedObjects.selectedneuron = id;
    } else if (type === "skeleton") {
      project.selectedObjects.selectedskeleton = id;
    }


  });

  $(object_tree_id).bind("create.jstree", function (e, data) {

    mynode = data.rslt.obj;
    data = {
      "operation": "create_node",
      "parentid": data.rslt.parent.attr("id").replace("node_", ""),
      "classname": data.rslt.obj.attr("rel"),
      "relationname": data.rslt.obj.attr("relname"),
      "objname": data.rslt.name,
      "pid": pid
    };

    $.ajax({
      async: false,
      type: 'POST',
      url: "model/instance.operation.php",
      data: data,
      dataType: 'json',
      success: function (data2) {
        // update node id
        mynode.attr("id", "node_" + data2.class_instance_id);
      }
    });

  });

  $(object_tree_id).bind("rename.jstree", function (e, data) {
    $.post("model/instance.operation.php", {
      "operation": "rename_node",
      "id": data.rslt.obj.attr("id").replace("node_", ""),
      "title": data.rslt.new_name,
      "pid": pid
    }, null);
  });

  $(object_tree_id).bind("remove.jstree", function (e, data) {
    treebefore = data.rlbk;
    // check if there are any subelements related to the object tree
    // part_of and model_of relationships
    $.post("model/instance.operation.php", {
      "operation": "has_relations",
      "relationnr": 2,
      "relation0": "part_of",
      "relation1": "model_of",
      "id": data.rslt.obj.attr("id").replace("node_", ""),
      "pid": pid
    }, function (retdata) {
      var parsedReply = $.parseJSON(retdata);
      if (parsedReply === "True") {
        alert("Object Treenode has child relations. (Re-)move them before you can delete it.");
        $.jstree.rollback(treebefore);
        return false;
      } else {

        $.post("model/instance.operation.php", {
          "operation": "remove_node",
          "id": data.rslt.obj.attr("id").replace("node_", ""),
          "title": data.rslt.new_name,
          "pid": pid,
          "rel": data.rslt.obj.attr("rel")
        }, function (retdata) {
          // need to deactive any currently active node
          // in the display. if the active treenode would
          // be element of the deleted skeleton, the
          // active node would become invalid
          activateNode(null);
          project.updateNodes();

          var g = $('body').append('<div id="growl-alert" class="growl-message"></div>').find('#growl-alert');
          g.growlAlert({
            autoShow: true,
            content: 'Object tree element' + data.rslt.obj.text() + ' removed.',
            title: 'SUCCESS',
            position: 'top-right',
            delayTime: 2500,
            onComplete: function() { g.remove(); }
          });

        });
        return true;
      }

    });

  });

  $(object_tree_id).bind("move_node.jstree", function (e, data) {

    src = data.rslt.o;
    ref = data.rslt.r;

    // the relationship stays the same (otherwise it would not be
    // a valid move), thus we only have to change the parent
    $.ajax({
      async: false,
      type: 'POST',
      url: "model/instance.operation.php",
      data: {
        "operation": "move_node",
        "src": src.attr("id").replace("node_", ""),
        "ref": ref.attr("id").replace("node_", ""),
        "pid": pid
      },
      success: function (r, status) {
        var parsedReply = $.parseJSON(r);
        if (parsedReply !== "True") {
          $.jstree.rollback(data.rlbk);
        }
      }
    });
  });

};

/* A function that takes an array of ids starting from the root id
 * and ending in any given node,
 * and walks the array opening each child node as requested.
 */
var openTreePath = function(treeOb, path) {
  if (path.length < 1) return;
  // Invoke the open_node method on the jstree instance of the treeOb DOM element:
  treeOb.jstree("open_node", $("#node_" + path[0]), function() { openTreePath(treeOb, path.slice(1)) }, false );
  if (1 == path.length) {
    // Set the skeleton node (the last id) as selected:
    treeOb.jstree("deselect_all");
    treeOb.jstree("select_node", $('#node_' + path[0]));
  }
};

var requestOpenTreePath = function(treenode) {
  // Check if the node is already highlighted
  if ($('#node_' + treenode.skeleton_id + ' a').hasClass('jstree-clicked')) {
    return;
  }
  // Else, highlight it:
  $.ajax({
    async: true,
    type: 'POST',
    url: "model/tree.object.expand.php",
    data: { "skeleton_id" : treenode.skeleton_id,
            "pid" : project.id },
    success: function (r, status) {
               r = $.parseJSON(r);
               if (r['error']) {
                 alert("ERROR: " + r['error']);
               } else {
                 var treeOb = $('#tree_object');
                 openTreePath(treeOb, r);
               }
             }
  });
};

// Refresh the Object Tree if it is visible.
var refreshObjectTree = function() {
  if ($('#object_tree_widget').css('display') === "block") {
    $("#tree_object").jstree("refresh", -1);
  }
};

