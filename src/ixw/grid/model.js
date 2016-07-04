(function(){

/** def : {
	name : ""	
	title : ""
  }
 */
function isInArray(arr, val){
	var str = "," + arr.join(",") + ",";
	return str.indexOf(","+val+",") !==-1;
}
function distinct(arr){
	var ret = [], obj={}, len = arr.length;
	for(var i=0; i<len; i++){
		var val = arr[i];
		if(!obj[val]){
			obj[val] = 1;
			ret.push(val);
		}
	}
	return ret;
}
function ColumnModelBase(def){
	var name = $XP(def, "name"), title = $XP(def, "title", name), isLongStr = $XP(def, "isLongStr"), isSort = $XP(def, "isSort");
	return {
		getTitleTpldata : function(){ return {
			html : IX.encodeTXT(title),
			name : name,
			hideClz : isSort ? "" : "hide",
			sortClz : "up"
		};},
		getCellTpldata : function(item, liHieght){return {
			name : name,
			height : liHieght,
			html : IX.encodeTXT($XP(item, name, "")),
			value : IX.encodeTXT($XP(item, name, "")),
			title : isLongStr ? IX.encodeTXT($XP(item, name, "")) : "",
			longClz : isLongStr ? "longName" : ""

		};}
	};
}

function RowModelBase(rowData, colModels,actions,moreActions, ifactionsEnable){
	var id = rowData.id;
	var tasks = rowData.tasks;
	var liHieght = 34;
	if(IX.isArray(tasks)){
		liHieght = liHieght * tasks.length;
	}
	if(IX.isFn(ifactionsEnable)){
		var obj = ifactionsEnable(rowData);
		if(obj)
			IX.map(actions, function(item){
				if(item.length >3) item.pop();
				if((item[0] ==="delete" || item[0]==="priority") && !obj.delete) 
					item.push("disable");
				 else if(item[0]==="stop" && obj.delete)
					 item.push("disable");
			});
	}
	function getCellsTpldata(liHieght){
		return IX.map(colModels, function(colModel){
			return colModel.getCellTpldata(rowData, liHieght);
		});
	}
	function getActionsTpldata(){
		return IX.loop(actions,[],function(acc,item){
			acc.push({
				name : item[0],
				title : item[1],
				html : "",
				disableClz : item.length > 3 ? item[3] : ""
			});
			return acc;
		});
	}

	var tpldata = {
		id : id,
		clz : "",
		actionClz : actions.length >0 ? "" : "hide",
		cells : getCellsTpldata(liHieght),
		actions : getActionsTpldata()//[{name:"delete", html:""},{name:"poweron", html:""},] //TODO:
	};
	return {
		getId : function(){return id;},
		get : function(attrName){return $XP(rowData, attrName);},
		refresh : function(_rowData){
			rowData = _rowData;
			tpldata.cells = getCellsTpldata();
		},
		getTpldata : function(){return tpldata;}
	};
}

var columnModelHT = {};
IX.ns("IXW.Lib");
/** cfg : {
	pageSize : 20, 

	rowModel : function(rowData, colModels)// default is RowModelBase
	columns : [name], 
	actions  : [["name", function(rowModel, rowEl){}], ...]
	dataLoader : function(params, cbFn)
	}
 */
IXW.Lib.GridModel = function(id, cfg){
	var clz =  $XP(cfg, "clz", "");
	var pageSize = $XP(cfg, "pageSize", 20);
	var RowModel = $XP(cfg, "rowModel", RowModelBase);
	var dataLoader = $XF(cfg, "dataLoader");
	var colModels = IX.map($XP(cfg, "columns", []), function(colName){
		return (colName in columnModelHT)?(new columnModelHT[colName]()): null;
	});
	var actions = $XP(cfg, "actions", []);
	var ifactionsEnable = $XF(cfg, "ifactionsEnable");
	var moreActions = $XP(cfg,"moreActions",[]);
	var selectedItmes = [];
	var selectedIds =[];
	var liHieght = 34;

	var tpldata = {
		clz : clz,
		id : id,
		header : IX.map(colModels, function(m){
			return m.getTitleTpldata();}),
		actionClz : actions.length >0 ? "" : "hide",
		rows : [],
		imgUrl : PCC.Global.refreshIntervalUrl
	};
	var dataModel = new IX.IPagedManager(function(item){
		var selectedCells = jQuery("#" + id).find(".row .selected");
		/*跨页选择*/
		/*var curSelectedIds =  IX.map(selectedCells, function(el){
			var _el = $XH.ancestor(el, "row");
			return _el.id;
		});
		selectedIds =[];
		for(var i=0; i< selectedItmes.length; i++){
			selectedIds = selectedIds.concat(selectedItmes[i].value);
		}
		selectedIds = distinct(selectedIds.concat(curSelectedIds));*/
		selectedIds =  IX.map(selectedCells, function(el){
			var _el = $XH.ancestor(el, "row");
			return _el.id;
		});
		if (isInArray(selectedIds, item.id)){
			item.ischecked = 'selected';
		}else{
			item.ischecked = '';
		}
		return new RowModel(item, colModels,actions,moreActions, ifactionsEnable);
	}, null, dataLoader);

	function _load(pageNo, cbFn,refreshFn){
		dataModel.load(pageNo, pageSize, function(rowModels){
			tpldata.rows = IX.map(rowModels, function(row){
				return row.getTpldata();
			});
			cbFn(rowModels, refreshFn);
		});
	}
	return {
		getDataModel : function(){return dataModel;},
		getTpldata : function(){return tpldata;},
		getPageCount : function(){
			return Math.ceil(dataModel.getTotal()/pageSize);
		},
		resetPage : function(_pageNo, _pageSize, cbFn){
			//var idx = Math.floor(pageSize *  _pageNo/_pageSize);
			pageSize = _pageSize;
			//_load(idx, cbFn);
			_load(_pageNo, cbFn);
		},
		load : function(pageNo, cbFn, refreshFn){_load(pageNo, cbFn, refreshFn);},
		getRow : function(rowId){return dataModel.get(rowId);},
		getFirst : function(){return dataModel.getFirst();},
		setSelectedItems : function(value){selectedItmes = value;},
		getSelectedItems : function(){return selectedItmes;},
		getSelectedIds : function(){ return selectedIds;},
		addItems : function(data){
			dataModel.addItems($XP(data, "ids", []));
		},
		removeItems : function(data){
			dataModel.removeItems($XP(data, "ids",[]));
		}
	};
};
IXW.Lib.GridModel.RowModelBase = RowModelBase;
IXW.Lib.GridModel.ColumnModelBase = ColumnModelBase;
IXW.Lib.GridModel.registerColumnModel = function(name, modelClz){
	columnModelHT[name] = modelClz;
};

})();