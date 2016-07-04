(function(){
IX.ns("PCC.Util");

function convertTickToDate(tick){return new Date(tick *1);}
PCC.Util.formatDate = function(tick,isMS, type){
	if (!tick)
		return "";
	var millSeconds = "000"+convertTickToDate(tick).getMilliseconds();
	if(isMS)
		return IX.Date.format(convertTickToDate(tick)) + ":"+millSeconds.substring(millSeconds.length-3);
	else
		return IX.Date.format(convertTickToDate(tick), type);
};
var BIn = {
	"T" : 1024*1024*1024*1024,
	"G" : 1024*1024*1024,
	"M" : 1024*1024,
	"K" : 1024
};
PCC.Util.formatUnit = function(value, total){
	value= value*1;
	if(total){
		if(total/BIn.T>1){
			return Math.round(100*value/BIn.T)/100 + " TB";
		}else if(total/BIn.G>1){
			return Math.round(100*value/BIn.G)/100 + " GB";
		}else if(total/BIn.M>1){
			return Math.round(100*value/BIn.M)/100 + " MB";
		}else if(total/BIn.K>1){
			return Math.round(100*value/BIn.K)/100 + " KB";
		}else{
			return value + "B";
		}
	}else{
		if(value/BIn.T>1){
			return Math.round(100*value/BIn.T)/100 + " TB";
		}else if(value/BIn.G>1){
			return  Math.round(100*value/BIn.G)/100 + " GB";
		}else if(value/BIn.M>1){
			return  Math.round(100*value/BIn.M)/100 + " MB";
		}else if(value/BIn.K>1){
			return  Math.round(100*value/BIn.K)/100 + " KB";
		}else{
			return value + "B";
		}
	}
	//return (value.length > 5) ? ((value/1024).toFixed(4) + "T") : (value + "G");
};
PCC.Util.formatFlow = function(flow){
	flow = flow *1;
	if(flow > 1024){
		return Math.round(flow/1024) + "MB/s";
	}else{
		return flow + "KB/s";
	}
};
PCC.Util.formatPeroid = function(tick, type){
	var millSecInDay = 24 * 3600 *1000;
	var millSecInHour = 3600 * 1000;
	var millSecInMin = 60*1000;
	var millSecInSec = 1000;
	tick = tick*1;//convertTickToDate(tick);
	var day = tick > millSecInDay ? parseInt(tick/millSecInDay) : 0;
	var hour = parseInt((tick-day *millSecInDay)/millSecInHour);
	var min = (tick-day *millSecInDay)>millSecInHour ? parseInt((tick-day*millSecInDay-hour*millSecInHour)/millSecInMin) : 0;
	var sec=parseInt((tick-day*millSecInDay-hour*millSecInHour-min*millSecInMin)/millSecInSec);
	var millSec = parseInt(tick%millSecInSec);
	var strDay = day >0 ? day + "脤矛" : "";
	var strHour = hour >0 ? hour + "脨隆脢卤": day > 0 ? "0脨隆脢卤":"";
	var strMin = min >0 ? min+"路脰": (day >0 || hour >0) ?"0路脰": "";
	var strSec = sec > 0 ? sec+"脙毛" : (day >0 || hour >0 || min > 0) ?"0脙毛": "";
	var strMillSec = millSec + "潞脕脙毛";
	if(type === "hour"){
		return strDay + strHour;
	}else if(type === "time"){
		var strH = hour > 9 ? hour : "0" + hour;
		var strM = min > 9 ? min : "0" + min;
		var strS = sec > 9 ? sec : "0" + sec;
		return  strH + ":" + strM + ":" + strS;
	}else{
		return strDay + strHour + strMin + strSec + strMillSec;
	}
};

var CommonQueryInterval = 5000; // 5 seconds
PCC.Util.PeriodicChecker = function(checkFn, interval){
	var isStarted = false;
	var intv = interval || CommonQueryInterval;
	var timers = null;
	function _query(){
		function _imitationInterval(){
			timers = setTimeout(function(){
				if(isStarted) _query();
			}, intv);
		}
		checkFn(_imitationInterval);
	}
	return {
		start : function(){
			if (!isStarted) _query();
			isStarted = true;
		},
		stop : function(){
			isStarted = false;
			clearTimeout(timers);
		}
	};
};

})();
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
(function(){
var GridModel = IXW.Lib.GridModel;
var ColumnModelBase = GridModel.ColumnModelBase;
var registerColumnModel= GridModel.registerColumnModel;

var formatDate = PCC.Util.formatDate;
var formatPeroid = PCC.Util.formatPeroid;
var formatFlow = PCC.Util.formatFlow;

var AllocatHTML= '<span class="rate {rateClz}">{allocated}/{total}</span><span class="allocatbg"><div class="silderbar {clz}" style = "width:{width}"></div><div class="rates"></div></span><span class="percent">{rate}%</span>';
var ProcessHTML= '<span class="rate {rateClz}"></span><span class="allocatbg"><div class="silderbar {clz}" style = "width:{width}"></div><div class="rates"></div></span><span class="percent">{rate}%</span>';
var BInTB = 1024*1024*1024*1024;
var MBInGB = 1024;
function getAllcationCellTplData(name, item){
	var html = "";
	var percent = null;
	if (name == "mem"){
		var total = $XP(item[name], "total", 0);  
		percent = $XP(item[name], "used", 0);
		total = Math.round(100*total/MBInGB)/100;
		percent =  Math.round(100*percent/MBInGB)/100;
		var rate = total === 0?0:Math.round((100 * percent / total));
		html = AllocatHTML.replaceByParams({
			rateClz : rate>90 ? "higher" : rate > 70 ? "high" : "",
			clz : rate>90 ? "higher" : rate > 70 ? "high" : "",
			width : rate + "%",
			allocated : percent,
			total : total,
			rate : rate
		});
	}else{
		var hasGpu = $XP(item.gpu, "hasGpu", 0);
		percent = $XP(item.gpu, "percent", 0);
		if(hasGpu){
			html = ProcessHTML.replaceByParams({
				rateClz : percent>90 ? "higher" : percent > 70 ? "high" : "",
				clz : percent>90 ? "higher" : percent > 70 ? "high" : "",
				width : percent + "%",
				rate : percent
			});
		}else{
			html = "<span class='pic-noGpu'></span>";
		}
	}
	return{
		name: name,
	    html : html,
	    value : percent,
	    title : "",
		longClz : ""
	};
}
function getAllocationColumn(name, title){
	var column = new ColumnModelBase({name : name, title : title});
	column.getCellTpldata = function(item){return getAllcationCellTplData(name, item);};
	return column;
}

function getCPUColumn(name, title){
	var column = new ColumnModelBase({name : name, title : title});
	column.getCellTpldata = function(item){
		var cpuInfo = $XP(item, "cpu", {});
		var total = $XP(cpuInfo, "total",0);
		var usable = $XP(cpuInfo, "usable",0);
		var used = $XP(cpuInfo, "used", 0);
		var percent = $XP(cpuInfo, "percent", 0);
		var html = "<span class='cpuInfo'>"+total+"/"+usable+"/"+used +"<div class='cputip hide'><em></em><span><span class='text'>总量：</span>"+total+
		"</span><span><span class='text'>可用：</span>"+usable+"</span><span><span class='text'>已使用：</span>"+used+"</span></div></span><span>使用率: "+percent+"</span>";
		return {
			name : name,
			html : html,
			value : "",
			title : "",
			longClz : ""
		};
	};
	return column;
}
var AllStatus = {
	node : {
		1 : "正常",
		0 : "故障"
	},
	job : {
		1 : "成功",
		0 : "失败"
	}
};
var speed = {
	flow : ["flowT", "flowR"],
	rwSpeed : ["rSpeed", "wSpeed"]
};
var cycleType = {
	0 : "不循环录像",
	1 : "以最后一帧为周期",
	2 : "以当前时间为周期"
};

function getStatusColumn(type, title){
	var Status = AllStatus[type];
	var column = new ColumnModelBase({name : "status", title : title});
	column.getCellTpldata = function(item){
		var status = $XP(item, "status", "");
		var clz = "";
		if(status === 0){
			clz = "twinkleStatus";
		}else{
			clz = "";
		}
		return{
			name : "status",
			html : '<span class="' + clz + '">' + Status[status] + '</span>',
			value : status,
			title : "",
			longClz : ""
		};
	};
	return column;
}
function getFlowColumn(type, title){
	var column = new ColumnModelBase({name : type, title : title, isSort : false});
	column.getCellTpldata = function(item){
		var flow = $XP(item, type, {});
		var flowT = formatFlow($XP(flow, speed[type][0], 0)); //KB/s
		var flowR = formatFlow($XP(flow, speed[type][1], 0));
		return {
			name : type,
			html :"<div class='flowSpeed first'><span class='pic-up'></span>"+flowT +"</div><div class='flowSpeed'><span class='pic-down'></span>"+ flowR + "</div>",
			title : "",
			longClz : "longName"
		};
	};
	return column;
}
function getType(name, title){
	var column = new ColumnModelBase({name : name, title : title});
	column.getCellTpldata = function(item){
		var type = $XP(item, "cycleType", 0);
		return {
			name : name,
			html : cycleType[type],
			title : cycleType[type],
			longClz : "longName"
		};
	};
	return column;
}
function getTimeColumn(name, title, isMS){//是否精确到毫秒，否，则精确到秒
	var column = new ColumnModelBase({name : name, title : title});
	column.getCellTpldata = function(item){
		var value = formatDate(IX.encodeTXT($XP(item, name, "")), isMS);
		return {
			name : name,
			html : value,
			value : value,
			title : "",
			longClz : ""
		};
	};
	return column;
}
function getPeriod(name, title, type){
	var column = new ColumnModelBase({name : name, title : title});
	column.getCellTpldata = function(item){
		var value = formatPeroid(IX.encodeTXT($XP(item, name)), type);
		return {
			name : name,
			html : value,
			value : value,
			title : "",
			longClz : "longName"
		};
	};
	return column;
}

function getOptDetail(name, title) {
	var column = new ColumnModelBase({name : name, title : title});
	var reg1 = /{[1,2]}/; var reg2 = /{\d+}$/;
	column.getCellTpldata = function(item){
		var value = $XP(item, name, "");
		var match1, match2;
		if(reg1.test(value)){
			match1=  parseInt(value.match(reg1)[0].substring(1,2));
			value = value.replace(reg1, cycleType[match1]);
		}
		if(reg2.test(value)){
			match2 = value.match(reg2)[0];
			match2 = match2.substring(1, match2.length -1);
			value = value.replace(reg2, formatPeroid(match2, "hour"));
		}
		return {
			name : name,
			html : value,
			value : value,
			title : value,
			longClz : "longName"
		};
	};
	return column;

}
var taskTitleTpl = new IX.ITemplate({tpl : [
	'<ul>',
		'<li class="col-task-num">任务编号</li>',
		'<li class="col-task-process">进度</li>',
		'<li class="col-task-resource">资源数</li>',
		'<li class="col-task-mem">内存</li>',
		'<li class="col-task-dealTime">处理时间</li>',
	'</ul>'
]});
var taskCell4JobTpl = new IX.ITemplate({tpl : [
	'<tpl id="subCells">',
		'<ul class="{clz}">',
			'<li class="col-task-num">{taskNum}</li>',
			'<li class="col-task-process">{process}</li>',
			'<li class="col-task-resource">{resource}</li>',
			'<li class="col-task-mem">{mem}</li>',
			'<li class="col-task-dealTime">{dealTime}</li>',
		'</ul>',
	'</tpl>'
]});
var taskInfoHdrHTMLs = {
	task : taskTitleTpl.renderData()
};
function getProcess(value){
	return ProcessHTML.replaceByParams({
		rateClz : value>90 ? "higher" : value > 70 ? "high" : "",
		clz : value>90 ? "higher" : value > 70 ? "high" : "",
		width : value + "%",
		rate : value
	});
}
function getHtml4Task(item, typeName){
	var tasks = $XP(item, "tasks", []);
	var allTasks = IX.map(tasks, function(task, index){
		return {
			clz : index === tasks.length-1 ? "last" : "",
			taskNum : task.taskNum,
			process : Number(task.process) ===-1 ? "处理中" : getProcess(Number(task.process)),
			resource : task.resource,
			mem : task.mem,
			dealTime : formatPeroid(task.dealTime, "time")
		};
	});
	return taskCell4JobTpl.renderData("", {
		subCells : allTasks
	});
}
function getTaskColumnModel(typeName){
	return {
		getTitleTpldata : function(){return {
			name : "task",
			html : taskInfoHdrHTMLs[typeName],
			hideClz : "hide"
		};},
		getCellTpldata : function(item){return{
			name : "task",
			html : getHtml4Task(item, typeName),
			title : "",
			longClz : ""
		};}
	};
}

function getProcessColumn(name, title){
	var column = new ColumnModelBase({name : name, title : title});
	var process={
		"-1" : "处理中",
		"-2" : "排队中"
	};
	column.getCellTpldata = function(item){
		var value = item[name];
		var html = "";
		if(value <0) html = process[value];
		else html = getProcess(value);
		return {
			name : name,
			html : html,
			value : value,
			title : "",
			longClz : "longName"
		};
	};
	return column;
}

IX.iterate([
["_checkbox", function(){return {
		getTitleTpldata : function(){ return {
			html :"<a data-href='$ixw.grid.col' data-key='_check'><span class='checkbox'></span></a>",
			name : "_check",
			hideClz : "hide",
			sortClz : "invisible"
		};},
		getCellTpldata : function(item){
		 return {
			name : "_check",
			html : "<span class='checkbox "+$XP(item, "ischecked", "")+"'></span>",
			value : "",
			title : "",
			longClz : ""
		};}
};}],
["_no", "序号"],
["nodeName", function(){
	var column  = new ColumnModelBase({name : "name", title : "节点名称"});
	column.getCellTpldata = function(item){
		return {
			name : "name",
			html : $XP(item, "name", ""),
			value : $XP(item, "name", ""),
			title : $XP(item, "name", ""),
			longClz : "longName"
		};
	};
	return column;
}],
["ip", {name : "ip", title : "IP", isSort : true}],
["cpuUsage", function(){
	return getCPUColumn("cpu", "CPU使用情况(核)");
}],
["memUsage", function(){
	return getAllocationColumn("mem", "内存使用情况(GB)");
}],
["gpuUsage", function(){
	return getAllocationColumn("gpu", "GPU使用情况");
}],
["flow", function(){
	return getFlowColumn("flow", "网络流量");
}],
["nodeStatus", function(){
	return getStatusColumn("node", "状态");
}],
["jobName", {name : "name", title: "作业名称", isLongStr : true}],
["taskInfo", function(){
	return getTaskColumnModel("task");
}],
["taskNo", "任务编号"],
["process", function(){
	return getProcessColumn("process", "进度");
}],
["resource", function(){
	var column = new ColumnModelBase({name : "resource", title : "资源数"});
	column.getCellTpldata = function(item){
		var value = $XP(item, "resource", 0) < 0 ? "-" : $XP(item, "resource", 0);
		return {
			name : "resource",
			html : value,
			value : value,
			title : value,
			longClz : ""
		};
	};
	return column;
}],
["mem", "内存"],
["handleTime", function(){
	return getPeriod("handleTime", "处理时间", "time");
}],
["algorithm", "算法模块"],
["algorithmsName", {name : "name", title: "算法组名称", isLongStr : true}],
["algorithmName", {name : "name", title: "算法模块名称", isLongStr : true}],
["algorithmNum", {name : "algorithmNums", title: "算法模块数量", isLongStr : true}],
["version", {name : "version", title: "版本", isLongStr : true}],

["group", "群组名称"],
["groupName", {name : "name", title: "群组名称", isLongStr : true}],
["userName", {name : "name", title: "用户名称", isLongStr : true}],
["groupNum", {name : "groupNums", title: "算法模块数量", isLongStr : true}],
["quota", {name : "quota", title: "资源配额情况(核)", isLongStr : true}],
["using", {name : "using", title: "资源使用情况(核)", isLongStr : true}],
["taskNum", {name : "taskNum", title: "正在处理任务数", isLongStr : true}],


["user", "用户名称"],
["serviceName", {name : "name", title : "服务名称", isLongStr : true}],
["handleNum", "处理任务数量"],
["waitNum", "排队任务数量"],
["priority", function(){
	var priorityHT = {
		0 : "低",
		1 : "中",
		2 : "高"
	};
	var column  = new ColumnModelBase({name : "priority", title : "优先级"});
	column.getCellTpldata = function(item){
		var value = priorityHT[$XP(item, "priority", "")];
		return {
			name : "priority",
			html : value,
			value : value,
			title : value,
			longClz : "longName"
		};
	};
	return column;
}],
["submitTime", function(){
	return getTimeColumn("submitTime", "提交时间", false);
}],
["waitTime", function(){
	return getPeriod("waitTime", "等待时间", "time");
}],
["jobStatus", function(){
	return getStatusColumn("job", "状态");
}],
["computeNode", {name : "name", title : "计算节点", isLongStr : true}],
["segEndTime", function(){
	return getTimeColumn("endTime", "结束时间", false);
}],
["period", function(){
	return getPeriod("period", "时长");
}],
["alarmType", {name : "type", title : "报警种类", isLongStr : true}],
["alarmDetail", {name : "detail", title : "报警详情", isLongStr : true}],
["alarmStatus", function(){
	var statusHT = {
		0 : "未处理",
		1 : "已处理"
	};
	var column  = new ColumnModelBase({name : "status", title : "状态"});
	column.getCellTpldata = function(item){
		var value = statusHT[$XP(item, "status", "")];
		return {
			name : "status",
			html : value,
			value : value,
			title : value,
			longClz : "longName"
		};
	};
	return column;
}],
["alarmDate", function(){
	return getTimeColumn("date", "报警时间", false);
}],
["msgType", {name : "type", title : "消息类型", isLongStr : true}],
["msgDetail", {name : "detail", title : "消息详情", isLongStr : true}],
["msgDate", function(){
	return getTimeColumn("date", "消息时间", false);
}],
["operationDetail", function(){
	return getOptDetail("detail", "操作详情", true);
}],
["operationDate", function(){
	return getTimeColumn("date", "操作时间", false);
}]
], function(col){
	var name = col[0], fn = col[1];
	registerColumnModel(name, IX.isFn(fn)?fn : function(){
		return new ColumnModelBase(IX.isString(fn)?{name : name, title : fn} : fn);
	});
});
})();
(function () {
var globalActionConfig = IXW.Actions.configActions;
var instHT = {};
function getInst(el){
	var  gridEl = $XH.ancestor(el, "ixw-grid");
	if (!gridEl)return null;
	return instHT[gridEl.id];
}

globalActionConfig([["ixw.grid.col", function(params, el){
	var inst = getInst(el);
	if (!inst) return;
	inst.colAction(params.key, el);
}], ["ixw.grid.cell", function(params, el){
	var inst = getInst(el);
	var ulEl = $XH.ancestor(el, "row");
	if (!inst || !ulEl) return;
	inst.cellAction(ulEl.id, params.key, el);
}], ["ixw.grid.action", function(params, el){
	var inst = getInst(el);
	var ulEl = $XH.ancestor(el, "row");
	if (!inst || !ulEl || $XH.hasClass(el,"disable")) return;
	inst.rowAction(ulEl.id, params.key, ulEl);
}]]);


var t_grid = new IX.ITemplate({tpl: [
	'<div id="{id}" class="ixw-grid {clz}">',
		'<ul class="hdr">','<tpl id="header">',
			'<li class="col-{name}">',
				'<span>{html}</span>',
				'<a data-href="$ixw.grid.col" data-key="{name}">',
					'<span class="pic- {hideClz}"></span>',
				'</a>',
			'</li>',
		'</tpl>',
		'<li class="col-actions {actionClz}">',
			'<span>操作</span>',
			'<a data-href="$ixw.grid.col" data-key="actions">',
				'<span class="pic- hide"></span>',
			'</a>',
		'</li>',
		'</ul>',
		'<div class="body" id="itemList">','<tpl id="rows">',
			'<ul id="{id}" class="row {clz}">','<tpl id="cells">',
				'<li class="col-{name}" style="height : {height}px; line-height:{height}px;">',
					'<a class="cell {longClz}" data-href="$ixw.grid.cell" data-key="{name}" data-value="{value}" title = "{title}">{html}</a>',
				'</li>',
			'</tpl>',
				'<li class="col-actions invisible {actionClz}">',
					'<tpl id="actions">',
					'<a class="act-{name} {disableClz}" data-href="$ixw.grid.action" data-key="{name}" title="{title}">{html}</a>',
				'</tpl>','</li>',
			'</ul>',
		'</tpl>','</div>',
	'</div>',
	'<img id="refreshLoading" class="loading hide" src="{imgUrl}">',
'']});


IX.ns("IXW.Lib");
/** cfg : {
	container : //required if use show function
	id,		// optional

	pageSize : 20,  // optional
	rowModel : function(rowData, colModels)// default is RowModelBase

	columns : [name],
	actions  : [[name, function(rowModel, rowEl){}], ...
	dataLoader :function(params, cbFn)
	}
 */
IXW.Lib.Grid = function(cfg){
	var container = $XP(cfg,  "container");
	var id = cfg.id || IX.id();
	var actionHT = IX.loop(($XP(cfg, "actions", []).concat($XP(cfg, "moreActions",[]))), {}, function(acc, act){
		acc[act[0]] = act[2];
		return acc;
	});
	var model = new IXW.Lib.GridModel(id, cfg);

	function _show(){
		var el = $X(container);
		if(!el) return;
		el.innerHTML = t_grid.renderData("", model.getTpldata());
	}
	function _refresh(onlyData, applyHover){
		var bodyEl = $XH.first($X(id), "body");
		if (!bodyEl || onlyData) return;
		var tpldata = model.getTpldata();
		jQuery($X(bodyEl)).find(".row").unbind("mouseenter").unbind("mouseleave");
		jQuery($X(bodyEl)).find(".cpuInfo").unbind("mouseenter").unbind("mouseleave");
		bodyEl.innerHTML = IX.map(tpldata.rows, function(rowData){
			return t_grid.renderData("rows", rowData);
		}).join("");
		if(IX.isFn(applyHover)) applyHover();
	}
	var self = {
		getHTML : function(){
			return t_grid.renderData("", model.getTpldata());
		},
		getId : function(){return id;},
		getModel : function(){return model;},
		show :function(){model.load(0, _show);},
		refresh : function(onlyData, applyHover){_refresh(onlyData, applyHover);},
		colAction : function(name, colEl){
			// to be overrided;
		},
		cellAction : function(rowId, name, cellEl){
			// to be overrided;
		},
		rowAction : function(rowId, actionName, rowEl){
			actionHT[actionName](model.getRow(rowId), rowEl);
		}
	};
	instHT[id] = self;
	return self;
};
})();
(function () {var t_okcancel = new IX.ITemplate({tpl: [
	'<a class="btn okbtn">确定</a>',
	'<a class="btn cancelbtn">取消</a>',
'']});
var t_editbtns = new IX.ITemplate({tpl: [
	'<a class="btn okbtn">编辑</a>',
	'<a class="btn cancelbtn">关闭</a>',
'']});
var t_alertbtns = new IX.ITemplate({tpl: [
	'<a class="btn confirmbtn">确定</a>',
'']});
var t_commonDialog = new IX.ITemplate({tpl: [
	'<div class="content">{content}</div>',
	'<div class="btns">{btns}</div>',
'']});

var dialog = null, dialogAlert = null;
var dialogCfg = null, dialogCfgAlert = null; // {content(), btns(), okFn(fn), bindOn()}

var okcancelHTML = t_okcancel.renderData("", {});
var editbtnsHTML = t_editbtns.renderData("", {});
var alertbtnsHTML = t_alertbtns.renderData();
function prevent(e){
	IX.Util.Event.preventDefault(e);
}
function clickOnBtn(e){
	var btnEl = $XH.ancestor(e.target, "btn");
	if (!btnEl) return;
	if ($XH.hasClass(btnEl, "cancelbtn")){
		IX.unbind(document.body, {
			mousewheel : prevent
		});
		return dialog.hide();
	}
	if ($XH.hasClass(btnEl, "confirmbtn")){
		IX.unbind(document.body, {
			mousewheel : prevent
		});
		return dialog.hide();
	}
	if($XH.hasClass(btnEl, "disable"))
		return;
	if($XH.hasClass(btnEl, "exportbtn")){
		var exportFn = $XF(dialogCfg, "exportFn");
		exportFn();
		return;
	}
	var okFn = $XF(dialogCfg, "okFn");
	okFn(function(){
		IX.unbind(document.body, {
			mousewheel : prevent
		});
		dialog.hide();
	}, function(){
		$XH.addClass(btnEl, "disable");
	});
}
function clickOnBtn4Alert(e){
	var btnEl = $XH.ancestor(e.target, "btn");
	if (!btnEl) return;
	var okFn = $XF(dialogCfgAlert, "okFn");
	okFn(function(){dialogAlert.hide();});
}

function dialogBodyRefresh(bodyEl){
	var content = dialogCfg.content;
	if (IX.isFn(content))
		content =content();
	var btns = dialogCfg.btns;
	if (IX.isEmpty(btns))
		btns = okcancelHTML;
	else if(IX.isFn(btns))
		btns = btns();

	bodyEl.className = "ixw-body " + dialogCfg.clz;
	bodyEl.innerHTML = t_commonDialog.renderData("", {
		content : content,
		btns : btns
	});
	IX.bind($XH.first(bodyEl, "btns"), {
		click : clickOnBtn
	});
	var bindOn = $XF(dialogCfg, "bindOn");
	bindOn($XH.first(bodyEl, "content"));
}
function dialogBodyRefresh4Alert(bodyEl){
	var content = dialogCfgAlert.content;
	if (IX.isFn(content))
		content =content();
	var btns = dialogCfgAlert.btns;
	if (IX.isEmpty(btns))
		btns = okcancelHTML;
	else if(IX.isFn(btns))
		btns = btns();

	bodyEl.className = "ixw-body " + dialogCfgAlert.clz;
	bodyEl.innerHTML = t_commonDialog.renderData("", {
		content : content,
		btns : btns
	});
	IX.bind($XH.first(bodyEl, "btns"), {
		click : clickOnBtn4Alert
	});
	var bindOn = $XF(dialogCfgAlert, "bindOn");
	bindOn($XH.first(bodyEl, "content"));
}
/** cfg :{
	dialogClz
	content,
	btns,
	okFn,
	bindOn
 * }
 */
function showDialog(cfg){
	if (!dialog)
		dialog = new IXW.Lib.ModalDialog({
			id : "nv-dialog",
			bodyRefresh : dialogBodyRefresh
		});
	dialogCfg = cfg;
	dialog.show();
}
function showDialogAlert(cfg){
	if (!dialogAlert)
		dialogAlert = new IXW.Lib.ModalDialog({
			id : "nv-dialogAlert",
			bodyRefresh : dialogBodyRefresh4Alert
		});
	dialogCfgAlert = cfg;
	dialogAlert.show();
}
IX.ns("PCC.Dialog");
PCC.Dialog.show = showDialog;
PCC.Dialog.hide = function(){if (dialog)dialog.hide();};

var t_confirm = new IX.ITemplate({tpl: [
	'<div class="title">{title}</div>',
	'<div class="area confirm">',
		'<div class="msg">{msg}</div>',
	'</div>',
'']});
var t_alert = new IX.ITemplate({tpl: [
	'<div class="title">错误提示</div>',
	'<div class="area alert">',
		'<div class="msg">{msg}</div>',
	'</div>',
'']});
var t_postComment = new IX.ITemplate({tpl: [
	'<div class="title">备注</div>',
	'<div class="area"><div><textarea id="commentArea"></textarea></div></div>',
'']});

PCC.Dialog.confirm = function(title,msg, okFn){showDialog({
	clz : "confirmDialog",
	content : function(){
		return t_confirm.renderData("", {title : IX.encodeTXT(title),msg: IX.encodeTXT(msg)});
	},
	okFn : function(cbFn, btndisableFn){
		if(IX.isFn(btndisableFn)) btndisableFn();
		okFn(cbFn);
	}
});};
PCC.Dialog.alert = function(msg, cbFn){showDialogAlert({
	clz : "alertDialog",
	content : function(){
		return t_alert.renderData("", {msg: msg ?msg.replaceAll("\n", "<br>") : ""});
	},
	btns : alertbtnsHTML,
	okFn : function(hidecbFn){
		hidecbFn();
		if(IX.isFn(cbFn)) cbFn();
	}
});};


var postCommentHTML = t_postComment.renderData("", {});
function _tryPostComment(okFn, cbFn){
	var comment = $X('commentArea').value;
	// if(IX.isEmpty(comment)){
	// 	alert("请输入备注信息！");
	// 	return;
	// }
	okFn(comment);
	cbFn();
}
PCC.Dialog.postComment = function (okFn){showDialog({
	clz : "commentDialog",
	content : postCommentHTML,

	okFn : function(cbFn){_tryPostComment(okFn, cbFn);}
});};
})();
(function () {
var globalActionConfig = IXW.Actions.configActions;

var dialog = null;
function hideDialog(){if (dialog)dialog.hide();}
var dialogCfg = null; 

var t_modal = new IX.ITemplate({tpl: [
	'<div class="head">{title}</div>',
	'<div class="content">{content}</div>',
	'<div class="foot">',
		'<div class="l btns">','<tpl id="lbtns">',
			'<a class="btn {name}btn" data-href="$nvdialog-click" data-key="{name}">{text}</a>',
		'</tpl>','</div>',
		'<div class="r btns">','<tpl id="rbtns">',
			'<a class="btn {name}btn" data-href="$nvdialog-click" data-key="{name}">{text}</a>',
		'</tpl>','</div>',
	'</div>	',
'']});
var t_confirm = new IX.ITemplate({tpl: [
	'<div class="area confirm"><div class="msg">{msg}</div></div>',
'']});

var CommonBtns = {
	left : [],
	right : [{name:"ok", text: "确定"}, {name:"cancel", text:"取消"}] 
};
globalActionConfig([["nvdialog-click",function(params,el){
	var action = params.key;
	if (action === "cancel")
		return hideDialog();
	var disableFn;
	if(action === "ok")	disableFn = function(){$XH.addClass(el, "disable");};
	$XF(dialogCfg, "listen." + action)(disableFn);
}],["ixw.alert.close", function(params, el){
	jQuery($XH.ancestor(el, "ixw-alert")).removeClass("animate-shake");
	jQuery("#IXW-alert").fadeOut();
}]]);
function dialogBodyRefresh(bodyEl){
	bodyEl.className = "ixw-body nv-dialog " + $XP(dialogCfg, "clz", "");
	bodyEl.innerHTML = t_modal.renderData("", {
		title : $XP(dialogCfg, "title", ""),
		content : $XP(dialogCfg, "content", ""),
		lbtns : $XP(dialogCfg, "btns.left", CommonBtns.left),
		rbtns : $XP(dialogCfg, "btns.right", CommonBtns.right)
	});
	$XF(dialogCfg, "afterShow")(bodyEl);
	var bindOn = $XF(dialogCfg, "bindOn");
	bindOn($XH.first(bodyEl, "content"));
}

function showDialog(cfg){
	dialogCfg = cfg;
	if (jQuery(".confirmLogin").length !== 0)
		return;
	if (!dialog)
		dialog = new IXW.Lib.ModalDialog({
			id : "nv-dialog",
			bodyRefresh : dialogBodyRefresh
		});
	dialog.show();
}

IX.ns("NV.Dialog");
/* {
	clz
	title : 
	content: 
	btns: {left: [{name,text}], right:[{name, text}]} // default CommonBtns;
	listen: {
		btnname : function()
	},
	afterShow : function(bodyEl)
 }*/
NV.Dialog.show = showDialog;
NV.Dialog.hide = hideDialog;
NV.Dialog.confirm = function(title, msg, okFn){ showDialog({
	title : IX.encodeTXT(title),
	content : t_confirm.renderData("", {msg: msg}),
	listen : { ok : function(){okFn(hideDialog);} }
});};

NV.Dialog.confirm4login = function(title, msg, btns, okFn){ 
	showDialog({
		title : IX.encodeTXT(title),
		clz: "confirmLogin",
		btns : btns,
		content : t_confirm.renderData("", {msg: msg}),
		listen : { ok : function(){okFn(hideDialog);} }
	});
};

NV.Dialog.alert = function(content){
	var alert = IXW.Lib.alert(content);
	$XH.addClass($XH.first(alert, "ixw-alert"), "animate-shake");
};
})();
(function () {

var t_dropdownBox = new IX.ITemplate({tpl: [
	'<span class="dropdown">',
		'<input type="hidden" id="{inputId}" class="{inputClz}" type="text" value="{key}">',
		'<button type="button" class="dropdown-toggle {clz}" data-toggle="dropdown">',
			'<span class="value">{value}</span>',
			'<span class="drop-pic"></span>',
		'</button>',
		'<ul class="dropdown-menu {clz}">','<tpl id="availRsrcs">',
			'<li class="dropdown-item" title="{title}"><a data-href="${action}" data-type="{type}" data-key="{key}">{html}</a></li>',
		'</tpl>','</ul>',
	'</span>',
'']});

//下拉框
/*
填写默认值，若baseInfo中有定义，则覆盖默认值，可以避免baseInfo没有该值，导致不能正确渲染。
baseInfo : 每个下拉框类别基础的信息
*/
function isInputNull(el, dropdownEl){
	var value = el.value;
	$XH[value ? "removeClass" : "addClass"](dropdownEl, "requiredMark");
	return value;
}
function bindonDropdown(el){
	var dropdownEl = $XH.first($XH.ancestor(el, "dropdown"), "dropdown-toggle");
	IX.bind(dropdownEl, {
		blur : function(e){
			setTimeout(function(){isInputNull(el, dropdownEl);}, 150);
		}
	});
}
function prevent(e){
	IX.Util.Event.preventDefault(e);
}
function bindOnMouseWheel(contentEl){
	IX.bind(document.body, {
		mousewheel : prevent
	});
	var dropdownMenu = jQuery(contentEl).find("ul.dropdown-menu");
	IX.map(dropdownMenu, function(item){
		IX.bind(item, {
			mousewheel : function(e){
				e = e || window.event;
				IX.Util.Event.stopPropagation(e);
				var delta = 0;
				if(e.wheelDelta){
					delta = e.wheelDelta;
				}else if(e.detail){
					delta = e.detail;
				}
				var scrollTop = $XH.getScroll(item).scrollTop;
				var innerHeight = jQuery(item).innerHeight();
				if((scrollTop === 0 && delta > 0) || (innerHeight +scrollTop >=item.scrollHeight && delta <0)){
					IX.Util.Event.preventDefault(e);
					return false;
				}
			}
		});
	});
}
var globalActionConfig = IXW.Actions.configActions;

function getRsrcHTML(type,baseInfo, data, action, ifObject){
	var availRsrc = IX.map(data, function(item){
		var name = "", key="";
		if(action || ifObject){
			name = $XP(item, "name", "");
			key = $XP(item, "id", "");
		}else{
			name = item;
		}
		return {
			html : name,
			title : name,
			key : key,
			type : type,
			action : action ? action : "dropdownBox.chose"
	};});
	var clz = $XP(baseInfo, "clz", "");
	return t_dropdownBox.renderData("",IX.inherit({
		inputId : "",
		clz : clz,
		value : "",
		key : "",
	},baseInfo, {
		availRsrcs : availRsrc
	}));
}
globalActionConfig([["dropdownBox.chose", function(params, el){
	var dropdownEl = $XH.ancestor(el, "dropdown");
	if(!dropdownEl) return;
	var value = el.innerHTML === "空" ? "" :el.innerHTML;
	var key = $XD.dataAttr(el, "key", "");
	var valueEl = $XH.first($XH.first(dropdownEl, "dropdown-toggle"), "value");
	var inputEl = $XD.first(dropdownEl, "input");
	inputEl.value = key;
	valueEl.innerHTML = value;
}]]);


IX.ns("PCC.inputBox");
PCC.inputBox.dropdownBox = function(){
	return {
		getDropdownBoxHTML : getRsrcHTML,
		bindOnMouseWheelAndHover : bindOnMouseWheel,
		bindonDropdown : bindonDropdown,
		isInputNull : isInputNull
	};
};

})();
(function () {
var globalActionConfig = IXW.Actions.configActions;
var RowModelBase = IXW.Lib.GridModel.RowModelBase;
var ixwPages = IXW.Pages;
var ixwOptions = IXW.Lib.Options;
var uilib = PCC.UILib;

var t_pagin = new IX.ITemplate({tpl: [
	'<div id="{id}-indics" class="l">','<tpl id="indics">',
		'从<span>{stx}</span>到<span>{endx}</span>/共<span>{pagex}</span>条数据',
	'</tpl>','</div>',
	'<div class="r">显示 <div class="page">',
		'<div class="dropdown">',
			'<a class="changePage dropdown-toggle" data-toggle="dropdown">',
				'<span id="curPage" class="pagesizeList">{pageInfo}</span>',
				'<span class="pgFrame"><span class="pic-pg"></span></span>',
			'</a>',
			'<ul class="dropdown-menu">','<tpl id="dropdownPg">',
				'<li id = "{id}"><a class="pagesizeList" data-href="$nvgrid.changePageSize" data-key="{nvgridId}" id = "{id}">{html}</a></li>','</tpl>',
			'</ul>',
		'</div></div></div>',
	'<div class="m">{paginHTML}</div>',
'']});

var PagesizeList = [
{id : "page-0",value : 20, text : "每页20条"},
{id : "page-1",value : 50, text : "每页50条"},
{id : "page-2",value : 100, text : "每页100条"},
{id : "page-3",value : 200, text : "每页200条"}
];
var currentPageSize = PagesizeList[0];
var pageSizeChangeListeners = {};
globalActionConfig([["nvgrid.changePageSize",function(params,el){
	var liEl = el.parentNode;
	// if ($XH.hasClass(liEl, "disabled"))
	// 	return;
	var _el = $XH.ancestor(liEl, "dropdown");
	var curpsEl = $XH.first($XD.first(_el, "a"), "pagesizeList");
	curpsEl.innerHTML = el.text;

	var index = el.id.split("-").pop();
	$XH.removeClass($X(currentPageSize.id),"hide");
	currentPageSize = PagesizeList[index];
	$XH.addClass($X(currentPageSize.id),"hide");
	var fn = pageSizeChangeListeners[params.key];
	if (IX.isFn(fn))
		fn(PagesizeList[index].value);
}], ["status.chose", function(params, el){
	var key = params.key;
	var type = $XD.dataAttr(el, "type", "");
	var dropdownEl = $XH.ancestor(el, "dropdown");
	if(!dropdownEl) return;
	var value = el.innerHTML === "空" ? "" :el.innerHTML;
	var valueEl = $XH.first($XH.first(dropdownEl, "dropdown-toggle"), "value");
	var inputEl = $XD.first(dropdownEl, "input");
	inputEl.value = value;
	valueEl.innerHTML = value;
	tryExecuteTool("filter", [{type : type, key : key}]);
}]]);
function getDropdownPg(id){
	return IX.map(PagesizeList,function(item){
		return {
			nvgridId : id,
			id : item.id,
			html : item.text
		};
	});
}

function NVPagination(id){
	var inst = new IXW.Lib.Pagination({
		id : id + "-pagin",
		total : 0,
		current : 0
	});
	var tpldata = {
		id : id,
		indics: [{stx : 0,endx : 0, pagex : 0}],
		paginHTML : inst.getHTML(),
		pageInfo : currentPageSize.text,
		dropdownPg : getDropdownPg(id)
	};
	var curPageNo = 0;
	return {
		getHTML : function(){return t_pagin.renderData("", tpldata);},
		bind : function(pageNoChangedFn, pageSizeChangeFn){
			inst.bind(pageNoChangedFn);
			pageSizeChangeListeners[id] = function(pageSize){
				pageSizeChangeFn(curPageNo, pageSize);
			};
		},
		jump : inst.jump,
		refresh : function(totalPages, currentPageNo, itemNum, totalNum, onlyData){
			inst.apply(currentPageNo, totalPages, onlyData);
			tpldata.paginHTML = inst.getHTML();
			curPageNo = currentPageNo;
			var stx = currentPageNo * currentPageSize.value;
			tpldata.indics = [{stx : itemNum >0 ?stx+1 :stx, endx : stx + itemNum, pagex : totalNum}];
			var el = $X(id + "-indics");
			if (!onlyData && el) el.innerHTML = t_pagin.renderData("indics", tpldata.indics[0]);
		},
		getCurPageNo : function(){return curPageNo +1;}
	};
}

var t_grid = new IX.ITemplate({tpl: [
'<div id="{id}" class="nv-grid {gridClz}">',
	'<div id="{id}-body" class="grid-body">{gridHTML}</div>',
	'<div id="{id}-foot" class="footbar">{paginHTML}</div>',
'</div>',
'']});
var t_pageVhost = new IX.ITemplate({tpl: [
	'<div id="gridContainer" class="nobuttonPage"><img id="refreshLoading" class="loading" src="{imgUrl}"></div>',
'']});


/** cfg : {
	container : //required
	id, // optional

	clz : gridClz,
	usePagination : false; default true;
	
	rowModel : function(rowData, colModels), //optional
	// pageSize : 25, default 20
	columns : [name],
	actions : [[name, function(rowModel, rowEl)]]
	dataLoader : function(params, cbFn)
	onselect : function(),
	clickOnRow : function(rowId)
}
 */
function GridBase(cfg){
	var container = $XP(cfg,  "container");
	var id = cfg.id || IX.id();

	var tools = $XP(cfg, "tools", []);
	var usePagination = $XP(cfg, "usePagination", true);
	var dataLoader = $XF(cfg, "dataLoader");
	var clickOnRow = $XF(cfg, "clickOnRow");
	var onselect = $XF(cfg, "onselect");
	var sortParams = [];
	var searchKey = "";
	var itemPageName = $XP(cfg, "itemPageName", "");
	var selectedItems = [];//保存选中的id，翻页后，再翻回来，也能保持选中。
	var curPageNo =0;

	var grid = new IXW.Lib.Grid(IX.inherit(cfg, {
		id : id + "-grid",
		pageSize : currentPageSize.value,
		rowModel : RowModelBase,
		//selectedIds : selectedIds,
		dataLoader : function(params, cbFn){
			dataLoader(IX.inherit(params, {
				sortInfo : sortParams,//JSON.stringify(sortParams),
				key : searchKey
			}), cbFn);
		}
	}));
	var model = grid.getModel();

	function applyHover(){
		jQuery($X(container)).find(".row").hover(function(){
			$XH.addClass(this, "hover");
			$XH.removeClass($XH.first(this,"col-actions"),"invisible");
		}, function(){
			$XH.removeClass(this, "hover");
			$XH.addClass($XH.first(this,"col-actions"),"invisible");
		});
		$XH.addClass($X(currentPageSize.id),"hide");
		jQuery($X(container)).find(".cpuInfo").hover(function(){
			//var cpuInfoPanel = initCPUPanel();
			//cpuInfoPanel.trigger(el);
			$XH.removeClass($XH.first(this, "cputip"), "hide");
		},function(){
			$XH.addClass($XH.first(this, "cputip"), "hide");
		});
	}
	var pagin =	null;
	function afterLoaded(pageNo, items, onlyData){
		var total = model.getDataModel().getTotal();
		grid.refresh(onlyData, applyHover);
		if(pagin)
			pagin.refresh(model.getPageCount(), pageNo, items.length,total, onlyData);

	}
	function loadPage(pageNo, clickBtnRefreshFn){
		/*跨页选择*/
		/*if(pagin) curPageNo = pagin.getCurPageNo();
		if(curPageNo){
			var ids = IX.map(getSelectedRows(), function(rowModel){
				return rowModel.getId();
			});
			var pages = [];
			if(selectedItems.length > 0){
				for(var i =0; i< selectedItems.length; i++){
					pages = pages.concat(selectedItems[i].page);
					if(selectedItems[i].page *1 === curPageNo){
						selectedItems[i].value = ids;
					}
				}
				var strpages = pages.join(",") + ",";
				if(strpages.indexOf(curPageNo + ",") <0) selectedItems.push({page : curPageNo, value : ids});
			}else{
				selectedItems.push({page : curPageNo, value : ids});
			}
			model.setSelectedItems(selectedItems);
		}*/
		model.load(pageNo, function(items){
			afterLoaded(pageNo, items);
			if(! ($X('refreshLoading'))) return;
			jQuery(".ixw-grid").removeClass("opcity");
			$XH.addClass($X('refreshLoading'), "hide");
			if(IX.isFn(clickBtnRefreshFn)) clickBtnRefreshFn();
			onselect();
			if(jQuery("#itemList").find(".checkbox").length){
				var isChoseAll = true;
				var choseAllEl = jQuery("#gridContainer").find(".hdr .checkbox")[0];
				jQuery("#itemList").find(".checkbox").each(function(){
					if (!$XH.hasClass(this, "selected")) isChoseAll = false;
				});
				$XH[isChoseAll ? "addClass" : "removeClass"](choseAllEl, "selected");
			}
			PCC.Env.onResize4Body();
		});
	}
	function getSelectedRows(){
		var selectedCells = jQuery("#" + id + "-grid").find(".row .selected");
		return IX.map(selectedCells, function(el){
			var _el = $XH.ancestor(el, "row");
			return model.getRow(_el.id);
		});
	}
	grid.colAction = function(name, colEl){
		if (name == "_check"){
			var $el = jQuery(colEl);
			var ifSelectAll = !$el.find(".checkbox").hasClass("selected");
			var $checkboxs = jQuery(colEl).parents(".ixw-grid").find(".col-_check .checkbox");
			$checkboxs[ifSelectAll?"addClass":"removeClass"]("selected");
			onselect();
		} else { //sort
			var ifDown = !$XH.first(colEl, "up");
			if(ifDown)
				$XH.addClass($XH.first(colEl, "pic-") , "up");
			else
				$XH.removeClass($XH.first(colEl, "pic-") , "up");
			if(name.indexOf('allocated') > -1)
				name = 'sort_'+name.substring(9);
			sortParams = IX.Array.remove(sortParams, name, function(elem,item){
				return item.name == name;
			});
			/*if(ifDown)
				sortParams = name;
			else
				sortParams = "";*/
			sortParams.push({name : name, ifDown : ifDown});
			loadPage(0);
		}
	};
	grid.cellAction = function(rowId, cellName, cellEl){
		if (cellName == "_check"){
			$XH.toggleClass($XH.first(cellEl, "checkbox"), "selected");
			var isChoseAll = true;
			jQuery("#itemList").find(".checkbox").each(function(){
				if (!$XH.hasClass(this, "selected")) isChoseAll = false;
			});
			var choseAllEl = jQuery("#gridContainer").find(".hdr .checkbox")[0];
			$XH[isChoseAll ? "addClass" : "removeClass"](choseAllEl, "selected");
			onselect();
		} else {
			clickOnRow(rowId, cellName, cellEl);
		}
	};

	if (usePagination){
		pagin = new NVPagination(id);
		pagin.bind(loadPage, function(pageNo, pageSize){
			model.resetPage(0, pageSize, function(items){
				afterLoaded(0, items);
				PCC.Env.onResize4Body();
			});
		});
	}
	function _show(items, refreshIntetvalFn){
		var el = $X(container);
		if (!el)
			return;
		if(!$XH.hasClass(document.body, itemPageName) && itemPageName!=="") return;
		afterLoaded(0, items, true);
		el.innerHTML = t_grid.renderData("", {
			id : id,
			gridClz : $XP(cfg, "clz", ""),
			gridHTML : grid.getHTML(),
			paginHTML : pagin?pagin.getHTML() : ""
		});
		PCC.Env.onResize4Body();
		applyHover();
		if(IX.isFn(refreshIntetvalFn)) refreshIntetvalFn();
	}

	return {
		getModel : function(){return model;},
		getSelectedRows : getSelectedRows,
		setSelectedIdsNull : function(){
			jQuery("#" + id + "-grid").find(".selected").removeClass("selected");
			selectedItems = [];
			model.setSelectedItems([]);
		},
		show: function(refreshFn){model.load(0, _show, refreshFn);},
		search : function(key){
			if (key == searchKey)
				return;
			searchKey = key;
			loadPage(0, function(){
				jQuery('#gridContainer .col-_check .checkbox').removeClass("selected");
				jQuery('#gridTools .chkEnable').addClass("disable");
				selectedItems = [];
				model.setSelectedItems([]);
			});
		},
		refresh : function(pageNo, clickBtnRefreshFn){
			if (pagin) pagin.jump(pageNo, clickBtnRefreshFn);
			else loadPage(0, clickBtnRefreshFn, pageNo);
		},
		getCurPageNo : function(){return pagin.getCurPageNo();}
	};
}

IX.ns("PCC.Grid");
PCC.Grid.NVGrid = GridBase;

PCC.Grid.CommonGrid = function(container, cfg){
	$X(container).innerHTML = t_pageVhost.renderData("", {imgUrl : PCC.Global.refreshIntervalUrl});
	PCC.Env.onResize4Body();
	return new GridBase(IX.inherit({container : container},cfg.grid));
};
PCC.Grid.currentGrid = null;

var t_MutiTools = new IX.ITemplate({tpl: [
	'<div>',
		'<div class="l dtzone {dtzoonClz}">时间筛选：{dtHTML}</div>',
		'<a class="btn-filter {dtzoonClz}" data-href="$nvgrid.clickTool" data-key="dtp-filter" data-from="{from}" data-to="{to}"></a>',
		'<div class="dttext {dtzoonClz} hidden">',
			'<span class="from"></span>-<span class="to"></span><a data-href="$nvgrid.clearDpt" class="pic-"></a>',
		'</div>',
		'<div class="r search {searchClz}">',
			'<input type="text" placeHolder="请输入检索内容">',
			'<a class="r pic-search" data-href="$nvgrid.search"></a>',
		'</div>',
	'</div>',
	'<div>',
		'<tpl id="btns">',
			'<a class="btn-{name} {clz}" data-href="$nvgrid.clickTool" data-key="{name}" {dtfromto}>{text}</a>',
		'</tpl>',
		'<tpl id="filter">','<div class="r {clz}"><span class="text">{filterName}：</span>{filterHTML}</div>','</tpl>',
	'</div>',
'']});
var t_tools = new IX.ITemplate({tpl: [
	'<div class="l dtzone {dtzoonClz}">时间筛选：{dtHTML}</div>',
	'<tpl id="btns">',
		'<a class="btn-{name} {clz}" id="{id}" data-href="$nvgrid.clickTool" data-key="{name}" {dtfromto}>{text}</a>',
	'</tpl>',
	'<div class="dttext {dtzoonClz} hidden"><span class="from"></span>-<span class="to"></span><a data-href="$nvgrid.clearDpt" class="pic-"></a></div>',
	'<div class="r search {searchClz}">',
		'<input type="text" placeHolder="请输入检索内容">',
		'<a class="r pic-search" data-href="$nvgrid.search"></a>',
	'</div>',
	'<tpl id="filter">','<div class="r {clz}"><span class="text">{filterName}：</span>{filterHTML}</div>','</tpl>',
'']});

var dropdownBox = PCC.inputBox.dropdownBox();
var statusInfo = {
	node : [{id:-1, name : "全部"},{id:1, name : "正常"},{id:0, name : "故障"}],
	channel : [{id:-1, name : "全部"},{id:1, name : "正常"},{id:0, name : "异常"}],
	disk : [{id:-1, name : "全部"},{id:1, name : "正常"},{id:0, name : "故障"}],
	log : [{id: -1, name: "全部"}, {id: 1, name: "已处理"}, {id: 0, name: "未处理"}]
};
var AllBtns = {
	"refresh" : false,
	"delete" : true,
	"edit" : true,
	"compare" : true,
	"add" : false,
	"lock" : false,
	"unlock" : true,
	"filter" : true,
	"import" : false,
	"stop": true,
	"submit":true,
	"handle": true
};
var AllFilters = {
	"status" : "状态",
	"algorithm" : "算法模块",
	"group" : "群组名称"
};
var btnsTexts = {
	"import" : "导入",
	"stop" : "停止",
	"submit" : "提交作业"
};
function getLogDpts(filterData){
	var html = "", seprate = "";
	var datePickTriggers = IX.map([
		{type : "from", label : ""},
		{type : "to", label : ""}
	], function(cfg){
		var type = cfg.type;
		var value = $XP(filterData, type, "");
		var dpt = new IXW.Lib.DatePickTrigger(IX.inherit(cfg, {
			id: "dtp-"+type,
			value : value ? parseInt(value / 1000) : "",
			dataAttrs : [["key", type]],
			onchange : function(newValue, inputEl){
				var key = inputEl.id.split("-")[1];
				jQuery('.btn-filter[data-key="dtp-filter"]').attr("data-"+key, newValue * 1000);
			}
		}));
		seprate = type === "from"? "-" : "";
		html += dpt.getHTML() + seprate;
		return dpt;
	});
	return html;
}
function getFilters(name, moduleType, filterData){
	if(name === "status")
		return dropdownBox.getDropdownBoxHTML(name, {inputId : "status", value : "全部"}, statusInfo[moduleType], "status.chose");
	else
		return dropdownBox.getDropdownBoxHTML(name,{inputId : name, value : "全部"}, $XP(filterData, name, []), "status.chose");

}
function getTriggersHTML(filterData){
	var datePickTriggersHTML = "";
	//if(moduleType === "logs")
		datePickTriggersHTML += getLogDpts(filterData);
	return datePickTriggersHTML;
}
function showGridTools(container, cfg, filterData, second){
	var el = $X(container);
	var clz = "";
	if (!el)
		return;
	var type = $XP(cfg, "type", "");
	var btns = IX.map($XP(cfg, "buttons", []), function(name){
		return {
			name : name,
			clz : AllBtns[name]?"chkEnable disable":"",
			id : name === "import" ? "uploadFile" : "",
			dtfromto : name === "filter" ? "data-from = '' data-to=''":"",
			text : btnsTexts[name] || ""
		};
	});
	var filters = IX.map($XP(cfg, "filter", []), function(item){
		return {
			clz : item,
			filterName : AllFilters[item],
			filterHTML : getFilters(item, type, filterData)
		};
	});
	var ifEnableSearch = $XP(cfg, "search");
	var ifEnableDt = $XP(cfg, "dpt");
	var ifEnableStatus = $XP(cfg, "status");
	
	if(second === "history"){
		el.innerHTML = t_MutiTools.renderData("", {
			btns : btns,
			clz : AllBtns.more ? "chkEnable disable":"",
			searchClz : ifEnableSearch?"":"hidden",

			dtzoonClz : ifEnableDt?"":"hidden",
			dtHTML : getTriggersHTML(filterData),
			filter : filters,
			from : $XP(filterData, "from", 0),
			to : $XP(filterData, "to", 0)
			//statusClz : ifEnableStatus ? "" : "hidden",
			//statusFilterHTML : getStatusFilter(type)
		});
	}else{
		el.innerHTML = t_tools.renderData("", {
			btns : btns,
			clz : AllBtns.more ? "chkEnable disable":"",
			searchClz : ifEnableSearch?"":"hidden",

			dtzoonClz : ifEnableDt?"":"hidden",
			dtHTML : "",
			filter : filters
			//statusClz : ifEnableStatus ? "" : "hidden",
			//statusFilterHTML : getStatusFilter(type)
		});
	}
	
	if (ifEnableSearch){
		var inputEl = jQuery(el).find(".search input");
		inputEl.bind("keydown", function(e){
			if (e.which == 13 && !IX.isEmpty(this.value)){
				inputEl.blur();
				tryExecuteTool("search", [this.value]);
			}
		});
		inputEl.bind("blur", function(){
			tryExecuteTool("search", [this.value]);
			jQuery(el).find(".search").removeClass("click");
		});
		inputEl.bind("focus", function(){
			jQuery(el).find(".search").addClass("click");
		});
	}
	if($XP(cfg, "upload", false)){
		new uilib.FileUploadBtn("uploadFile", function(){
			//jQuery('#gridMask').width(0);
			//jQuery('#gridMask').height(0);
			//_refresh();
		}, null, function(){
			//jQuery('#gridMask').width(jQuery("#Grid").width()) ;
			//jQuery('#gridMask').height(jQuery("#Grid").height()) ;
		});
	}
}
function tryExecuteTool(fname, args){
	var currentGrid = PCC.Grid.currentGrid;
	if (!currentGrid || !(fname in currentGrid))
		return;
	var fn = currentGrid[fname];
	if (IX.isFn(fn))
		fn.apply(null, args);
}

globalActionConfig([["nvgrid.clickTool", function(params, el){
	if ($XH.hasClass(el,"disable")) return;
	if (params.key == "dtp-filter"){
		var fromValue = $XD.attr(el, "data-from");
		var toValue = $XD.attr(el, "data-to");
		if (fromValue > toValue)
			return alert("起始时间应小于结束时间");
		return tryExecuteTool(params.key, [{type: "from", key: fromValue}, {type: "to", key: toValue}]);
	}
	tryExecuteTool(params.key, [el]);
}],["nvgrid.search", function(params, el){
	var inputEl = $XD.first(el.parentNode, "input");
	tryExecuteTool("search", [inputEl.value]);
}],["nvgrid.clearDpt", function(params, el){
	$XH.addClass($XH.ancestor(el, "dttext"),"hidden");
	IX.map(jQuery("#gridTools .ixw-dpt input"), function(item){
		item.value = "";
	});
	var aFilterEl = $XH.first($XH.ancestor(el, "grid-tools"), "btn-filter");
	$XD.setDataAttr(aFilterEl, "from", 0);
	$XD.setDataAttr(aFilterEl, "to", 0);
	$XH.addClass(aFilterEl, "disable");
	tryExecuteTool("filter", ["",{from :0, to : 0}]);
}]]);

IX.ns("PCC.GridTools");
PCC.GridTools.showTools = showGridTools;
PCC.GridTools.enableTools = function(container, ifEnable, arrbtnStatus){
	jQuery($X(container)).find(".chkEnable")[ifEnable?"removeClass":"addClass"]("disable");
	if(arrbtnStatus)
		IX.map(arrbtnStatus, function(btn){
			if(btn) jQuery($X(container)).find(".btn-"+btn+".chkEnable").removeClass("disable");
		});
};

var t_pathNav = new IX.ITemplate({tpl: [
	'<div class="showNode">','<tpl id="paths">',
		'<a class="{clz}" data-href= "{href}">{text}</a>',
		'<div class="node-space"></div>',
	'</tpl>','<tpl id="curpath">',
		'<div>{text}</div>',
	'</tpl>','</div>',
'']});

var navPathTexts = {
	"jobs" : "作业服务",
	"job" : "作业管理",
	"current": "当前作业",
	"history" : "历史作业",
	"service" : "服务管理",
	"nodes" : "计算节点",
	"channels" : "录像管理",
	"logs" : "系统日志"
};
var navPathHrefs = {
	"nodes" : "nodes",
	"jobs" : "jobs",
	"job" : "jobs",
	"current": "jobs",
	"history" : "job-history",
	"service" : "job-service"
};
function showPathNav(container, moduleArr, subName){
	var paths = [];
	IX.map(moduleArr, function(module, index){
		paths.push({text : navPathTexts[module],clz : index ===0 ? "name": "", href : ixwPages.createPath(navPathHrefs[module])});
	});
	if(subName){
		paths.push({text : subName, href : ""});
	}
	var curpath = paths.length >0 ? [paths.pop()]:[];
	if($X(container)){
		$X(container).innerHTML = t_pathNav.renderData("", {
			paths : paths,
			curpath : curpath
		});
	}
}
IX.ns("PCC.PathNav");
PCC.PathNav.showPathNav = showPathNav;
})();
(function () {
var globalActionConfig = IXW.Actions.configActions;
var UTCInterval = new Date().getTimezoneOffset() * 60000; //millsec
var cancelIntervalFn = "";
var refreshIntervalFn = "";
function getMaxDayInCurrentMonth(from){
	var date = null;
	if (from !== undefined){
		date = new Date(from * 1000);
	}else{
		date = new Date();
	}
	var nextMonthFirstDay=new Date(date.getFullYear(),date.getMonth() + 1,1);
	date = new Date(nextMonthFirstDay.getTime()-1000);
	var date1 = new Date(0);
	return date.getDate();
}
var SecInDay = 24*3600;
var MilliSecInDay = SecInDay*1000;
function getBaseDate4FirstDay(xType){
	var date = new Date();
	var ms = date.getTime() ;
	ms = ms - (ms % MilliSecInDay);
	var d = xType==="month"?(date.getDate() -1):(xType==="week"?(date.getDay()=== 0 ? 6 : date.getDay()-1):0);
	date = new Date(ms - d * MilliSecInDay  + UTCInterval);
	return date;
}
function getDate4FirstDay(xType){
	var date = getBaseDate4FirstDay(xType);
	return [date.getFullYear(), date.getMonth(), date.getDate()];
}
function getSecTime4FirstDay(xType){
	var date = getBaseDate4FirstDay(xType);
	return Math.round(date.getTime()/1000);
}
function getSecTime4LastDay(){
	var date = new Date();
	return Math.round(date.getTime()/1000);
}

function getPrevSecTime4FirstDay(xType, from){
	var date = new Date(from*1000);
	var ms = date.getTime();
	if (xType === "month"){
		date = new Date(date.getFullYear(), date.getMonth()-1, 1);
	}else if(xType === "week"){
		date = new Date(from*1000 - 7*MilliSecInDay);
	}else{
		date = new Date(from*1000 -MilliSecInDay);
	}
	return Math.round(date.getTime()/1000);
}
function getPrevSecTime4LastDay(from){
	var date = new Date(from * 1000-1000);
	return Math.round(date.getTime()/1000);
}
function getNextSecTime4FirstDay(to){
	var date = new Date(to * 1000 + 1000);
	return Math.round(date.getTime()/1000);
}
function getNextSecTime4LastDay(xType, to){
	var date = new Date(to*1000);
	if (xType === "month"){
		date = new Date(date.getFullYear(), date.getMonth()+2, 1);
		date = new Date(date.getTime() - 1000);
	}else if(xType === "week"){
		date = new Date(to*1000 + 7*MilliSecInDay);
	}else{
		date = new Date(to*1000 +MilliSecInDay);
	}
	var curDate = new Date(), time = 0;
	if(date.getTime() > curDate.getTime()) {time =curDate.getTime()/1000;}else {time = date.getTime()/1000;}
	return Math.round(time);
}
function getJumpedDate4FirstDay(xType, from){
	var date = new Date(from*1000);
	return [date.getFullYear(), date.getMonth(), date.getDate()];
}
Highcharts.setOptions({
	symbols: ['circle', 'circle', 'circle', 'circle'],
	colors: ['#72D1EE', '#CCE7F6', '#4b5d69', '#9fdbea'],
	lang:{
		loading: '加载中...',
		months: '一月,二月,三月,四月,五月,六月,七月,八月,九月,十月,十一月,十二月'.split(','),
		shortMonths: '1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月'.split(','),
		weekdays: '周日,周一,周二,周三,周四,周五,周六'.split(","),
		decimalPoint: '.',
		numericSymbols: ['k', 'M', 'G', 'T', 'P', 'E'], // SI prefixes used in axis labels
		resetZoom: '回复原始图表',
		resetZoomTitle: '回复原始图表',
		thousandsSep: ' '
	},
	chart: {zoomType: ''},
	title: {text: null},
	legend: {enabled: false},
	credits: { enabled: false },
	plotOptions: {
		areaspline: { fillOpacity: 0.8 },
		series: {
			marker: { enabled: false},
			lineWidth: 0
		}
    },
	tooltip: {
		shared: true,
		valueSuffix : "%",
		crosshairs:[{color:"#E0E0E0"}]
	}
});

var XAxisConfig = {
	"month" : {
		type: 'datetime',
		endOnTick : true,
		labels: { step:2 },
		lineWidth:4,
		showLastLabel : false,
		dateTimeLabelFormats: { day : '%Y-%m-%d'}
	},
	"week"  :{
		type: 'datetime',
		endOnTick : false,
		labels: { step:2 },
		lineWidth:4,
		showLastLabel : false,
		dateTimeLabelFormats: { day : '%Y-%m-%d<br>%A'}
	},
	"24h" : {
		type: 'datetime',
		endOnTick : false,
		labels: { step:1 },
		lineWidth:4,
		showLastLabel : false,
		dateTimeLabelFormats: { day : '%Y-%m-%d<br>%A', hour: '%H:%M'}
	}
};
function getPlotLines(intv){
	var plotLines = [], i=0;
	for(i=1; i<=10;i++)
		plotLines.push({
			color: '#EEEEEE',
			dashStyle: 'solid',
			value : i* intv,
			width: 1
		});
	return plotLines;
}
var YAxisConfig = {
	"resource" : {
		title: {text: "使用率"},
		labels : {format:"{value}%"},
		min:0,
		max:100,
		tickInterval: 10,
		plotLines : getPlotLines(10),
		lineColor: "#D8D8D8",
		lineWidth : 1
	},
	"flow" : {
		min:0,
		max : 100,
		title : {text : "带宽"},
		labels : {format: "{value}Kbps"},
		tickInterval : 10,
		plotLines : getPlotLines(10),
		lineColor: "#D8D8D8",
		lineWidth : 1
	}
};
var TBinKB = 1024 * 1024 * 1024 * 1024;
var GBinKB = 1024 * 1024 * 1024;
var MBinKB = 1024 * 1024;
var KBinKB = 1024;
function calYAxis4Flow(data){
	var flowData=data;
	var maxY = 100, unity = "", base = 1, i =0;
	var maxNum =Math.max.apply(Math, flowData);
	
	var n = Math.max(2, Math.floor(Math.log10(maxNum))), y = Math.pow(10, n);
	if (maxNum > y)
		maxY = Math.ceil(maxNum / y) * y;

	if (n >= 12) {
		maxY  = maxY / 1000000000000;
		unity = "T";
		base = TBinKB;
	} else if (n>=9){
		maxY  = maxY / 1000000000;
		unity = "G";
		base = GBinKB;
	} else if (n>=6){
		maxY  = maxY / 1000000;
		unity = "M";
		base = MBinKB;
	}else if (n>=3){
		maxY  = maxY / 1000;
		unity = "K";
		base = KBinKB;
	}
	if (base !== 1)
		for (i = 0; i < flowData.length; i++)
			flowData[i]=Math.ceil(100* flowData[i] / base) / 100;

	return {
		max : maxY,
		unity : unity,
		data : flowData
	};
}

function getSeriesDataItem(xType, name, intv, arr, from, strJump){
	var _arr = [];
	var firstDay = [], maxDay = 0;
	if(strJump === "prev"){
		firstDay = getJumpedDate4FirstDay(xType, from);
		maxDay = getMaxDayInCurrentMonth(from);
	}else if(strJump === "next"){
		firstDay = getJumpedDate4FirstDay(xType, from);
		maxDay = getMaxDayInCurrentMonth(from);
	}else{
		firstDay = getDate4FirstDay(xType);
		maxDay = getMaxDayInCurrentMonth();
	}
	var utcTick = Date.UTC.apply(null, firstDay);
	var len = xType=="24h"?1: (xType=="week"?7:maxDay);
	len =  len * SecInDay / Math.max(intv, 1);
	for (var i =0; i<len; i++)
		_arr.push(i>=arr.length? null : arr[i]);
	return {
		type:"areaspline",
		name : name,
		pointStart : utcTick,
		pointInterval : intv * 1000,
		data : _arr
	};
}
function format4FlowChart(data, strJump){
	var yaxisDataR = calYAxis4Flow(data.flowR);
	var yaxisDataT = calYAxis4Flow(data.flowT);
	var max = 0, unity = "";
	if (yaxisDataR.max > yaxisDataT.max){
		max = yaxisDataR.max;
		unity = yaxisDataR.unity + "bps";
	}else{
		max = yaxisDataT.max;
		unity = yaxisDataT.unity + "bps";
	}
	var intv = max/10;
	return {
		tooltip : {valueSuffix : unity},
		xAxis: XAxisConfig[data.xType],
		yAxis : {
			min:0,
			max : max,
			title : {text : "带宽"},
			labels : {format: "{value}" + unity},
			tickInterval : intv,
			plotLines : getPlotLines(intv),
			lineColor: "#D8D8D8",
			lineWidth : 1
		},
		series : [
			getSeriesDataItem(data.xType, "上行", data.intv, calYAxis4Flow(data.flowT).data, data.from, strJump),
			getSeriesDataItem(data.xType, "下行", data.intv, calYAxis4Flow(data.flowR).data, data.from, strJump)
		]
	};
}

function format4Resources(data, strJump){
	return {
        xAxis: XAxisConfig[data.xType],
        yAxis: YAxisConfig[data.srcType],
        series: [
        	getSeriesDataItem(data.xType, "CPU", data.intv, data.cpu, data.from, strJump),
        	getSeriesDataItem(data.xType, "内存", data.intv, data.mem, data.from, strJump)
        ]
    };
}

var t_area = new IX.ITemplate({tpl: [
'<div class="nv-chart">',
	'<div class="nvc-type minitor">',
		'<a class="actived" data-href="$nvcharts.pick" data-key="resource">资源使用率</a>',
		'<a data-href="$nvcharts.pick" data-key="flow">网络流量</a>',
	'</div>',
	'<div class="nvc-type stat">',
		'<a class="actived" data-href="$nvcharts.pick" data-key="host">主机</a>',
		'<a data-href="$nvcharts.pick" data-key="vhost">虚拟机</a>',
	'</div>',
	'<div class="nvc-date">',
		'<a data-href="$nvcharts.pick" data-key="24h">近24h</a>',
	  	'<a class="actived" data-href="$nvcharts.pick" data-key="week">本周</a>',
		'<a data-href="$nvcharts.pick" data-key="month">本月</a>',
	'</div>',
	'<div class="nvc-area"></div>',
	'<div class="nvc-foot">',
		'<span class="cpu"></span><span class="cpu-txt">CPU</span>',
		'<span class="mem"></span><span class="mem-txt">内存</span>',
	'</div>',
	'<div class="chartbtn prev"><a data-href="$nvChart.jump" data-key="prev" data-value=""></a></div>',
	'<div class="chartbtn next hide"><a data-href="$nvChart.jump" data-key="next" data-value=""></a></div>',
'</div>',

'']});


var loader = IX.emptyFn;
IXW.Actions.configActions([["nvcharts.pick", function(params, el){
	if ($XH.hasClass(el, "actived") && $XH.hasClass(el, "curActived"))
		return;

	var pNode = el.parentNode;
	$XH.removeClass($XH.first(pNode, "actived"), "actived");
	$XH.removeClass($XH.first(pNode, "curActived"), "curActived");
	$XH.addClass(el, "actived");

	var _el = $XH.ancestor(el, "nv-chart");
	var _type = $XD.dataAttr($XH.first(jQuery(_el).find(".nvc-type.actived")[0], "actived"), "key");
	var _date = $XD.dataAttr($XH.first($XH.first(_el, "nvc-date"), "actived"), "key");

	$XH[_type=="flow"?"addClass":"removeClass"]($XH.first(_el, "nvc-foot"), "hide");
	if (_type === "flow"){
		jQuery(".cpu-txt").html("上行");
		jQuery(".mem-txt").html("下行");
	}else if(_type === "resource"){
		jQuery(".cpu-txt").html("CPU");
		jQuery(".mem-txt").html("内存");
	}
	var from = getSecTime4FirstDay(_date);
	var to  = getSecTime4LastDay(_date);
	if(_type === "host" || _type === "vhost"){
		loader("resource", _date, _type, from, to, "", refreshIntervalFn, cancelIntervalFn);
	}else{
		loader(_type, _date, "", from, to, "", refreshIntervalFn, cancelIntervalFn);
	}
}],["nvChart.jump", function(params, el){
	var key = params.key;
	var module = "";
	var _el = $XH.ancestor(el, "nv-chart");
	var _type = $XD.dataAttr($XH.first($XH.first(_el, "nvc-type"), "actived"), "key");
	var _date = $XD.dataAttr($XH.first($XH.first(_el, "nvc-date"), "actived"), "key");
	if(_type === "host" || _type === "vhost"){
		_type = "resource";
		module = _type;
	}
	$XH[_type=="flow"?"addClass":"removeClass"]($XH.first(_el, "nvc-foot"), "hide");
	if (key === "prev"){
		var from = parseInt($XD.dataAttr(el, "value"));
		var prevFrom = getPrevSecTime4FirstDay(_date, from);
		var prevTo = getPrevSecTime4LastDay(from);
		loader(_type, _date, module, prevFrom,prevTo,key, "", cancelIntervalFn);
	}else if (key === "next"){
		var to = parseInt($XD.dataAttr(el, "value"));
		var nextFrom = getNextSecTime4FirstDay(to);
		var nextTo = getNextSecTime4LastDay(_date, to);
		loader(_type, _date, module, nextFrom,nextTo,key, refreshIntervalFn, cancelIntervalFn);
	}
}]]);

IX.ns("PCC.Chart");
/** cfg :{
	container:areaContainers
	dataLoader:function(params, cbFn)
} */
PCC.Chart.NVCharts = function(cfg){
	var chart = null;
	var container = $XP(cfg,  "container");
	var chartType = $XP(cfg, "type", "");
	var module = "";
	if(chartType === "stat") module = "host";
	var el = $X(container);
	if (!el)
		return;
	var from = 0;
	var to = 0;
	from = getSecTime4FirstDay("week");
	to = getSecTime4LastDay("week");
	var date = new Date(from * 1000);
	var dataLoader = $XF(cfg, "dataLoader");
	refreshIntervalFn = $XF(cfg, "refreshIntervalFn");
	cancelIntervalFn = $XF(cfg, "cancelIntervalFn");
	var nowSrcType = "", nowxType = "", nowModule = "";
	loader = function(srcType, xType, module, from, to, strJump,refreshIntervalFn,cancelIntervalFn){
		$XD.setDataAttr(jQuery(".prev a")[0], "value", from);
		$XD.setDataAttr(jQuery(".next a")[0], "value", to);
		var el = $XH.first(jQuery(".nvc-date")[0], "actived");
		if (new Date(to*1000).getDate() === new Date().getDate()){
			jQuery(".next").addClass("hide");
			$XH.addClass(el, "curActived");
		}else{
			jQuery(".next").removeClass("hide");
			$XH.removeClass(el, "curActived");
		}
		dataLoader({
			module : module,
			srcType : srcType,
			xType : xType,
			from : from,
			to : to
		}, function(data){
			var chartCfg = (data.srcType === "flow"? format4FlowChart : format4Resources)(IX.inherit(data, {from:from, to: to}), strJump);
			chart =jQuery($X(container)).find(".nvc-area").highcharts(chartCfg);
			nowSrcType = srcType;
			nowxType = xType;
			nowModule = module;
			if(IX.isFn(cancelIntervalFn)) cancelIntervalFn();
			if(IX.isFn(refreshIntervalFn)) refreshIntervalFn();
		});

	};

	$X(container).innerHTML = t_area.renderData();
	if(chartType) jQuery(".nvc-type." + chartType).addClass("actived");
	loader("resource", "week", module, from, to, "", refreshIntervalFn, cancelIntervalFn);
	return {
		refresh : function(){
			var from = getSecTime4FirstDay(nowxType);
			var to = getSecTime4LastDay(nowxType);
			$XD.setDataAttr(jQuery(".prev a")[0], "value", from);
			$XD.setDataAttr(jQuery(".next a")[0], "value", to);
			//loader(nowSrcType, nowxType, from, to, "");
			dataLoader({
				module : nowModule,
				srcType : nowSrcType,
				xType : nowxType,
				from : from,
				to : to
			}, function(data){
					var seriesData = (data.srcType === "flow"? format4FlowChart : format4Resources)(IX.inherit(data, {from:from, to: to}), "").series;
					chart.series[0].setData(seriesData[0].data, true, true);
					chart.series[1].setData(seriesData[1].data, true, true);
			});
		}
	};
};
})();
(function () {var t_login = new IX.ITemplate({tpl: [
	'<div class="bg login-bg"><img src="{background}"></div>',
	'<div class="container">',
		'<ul id="loginDialog" class="l">',
			'<li class="title">视频云计算管理平台</li>',
			'<li>',
				'<span class="pic-user"></span>',
				'<input type="text" id="account" tabindex="1">',
				'<label id="account-p">请输入用户名</label>',
			'</li>',
			'<li>',
				'<span class="pic-psd"></span>',
				'<input type="password" id="password" tabindex="2">',
				'<label id="password-p">请输入密码</label>',
			'</li>',
			'<li class="btn">',
				'<a id="submit" tabindex="3" data-href="$login">登录</a>',
			'</li>',
		'</ul>',
		'<div class="r rightBg" id="right-bg"><img src="{rightBack}"></div>',
	'</div>',
	'<div class="footer">',
		'<div class="copy">',
			'<div class="logo"></div>',
			'<div>东方网力科技股份有限公司</div>',
			'<div class="copy-small">NetPosa Technologies Ltd</div>',
		'</div>',
	'</div>',
'']});

function saveUserInfoCookie(){
	var username = $X('account').value;
	var password = $X('password').value;
	jQuery.cookie("account", username);
	jQuery.cookie("password", password);
}
function clearCookie(){
	jQuery.cookie("account", "", { expires: -1 });
	jQuery.cookie("password", "", { expires: -1 });
}
var ixwPages = IXW.Pages;
IXW.Actions.configActions([["login", function(){
	var username = $X('account').value;
	var password = $X('password').value;
	PCC.Global.entryCaller("login", {
		username :username,
		password : password
	}, function(data){
		saveUserInfoCookie();
		PCC.Env.resetSession(data);
		ixwPages.load("");
	});
}]]);
function onResize4Body(){
	var screenY = document.documentElement.clientHeight-75;
	var elY = parseInt(jQuery("#loginDialog").css("height"));
	var marginY = Math.round((screenY - elY)/2);
	var marginTop = Math.round((screenY - 658)/2);
	jQuery("#loginDialog").css("marginTop" , marginY+"px");
	jQuery("#right-bg").css("marginTop" , marginTop+"px");
}

IX.ns("PCC.Entry");
PCC.Entry.clearCookie = clearCookie;
PCC.Entry.init = function(pageCfg, pageParams, cbFn){
	//if (PCC.Env.hasSession() || jQuery.cookie("account")){
	//}
	PCC.Env.resetSession({id : 1, name : jQuery.cookie("account")});
	ixwPages.load("");
	return;
	// document.body.innerHTML = t_login.renderData("",{
	// 	background: PCC.Global.backgroundUrl,
	// 	rightBack : PCC.Global.rightbgUrl
	// });
	// onResize4Body();
	// $Xw.bind({"resize" : onResize4Body});
	// var aEl = $X("submit");
	// jQuery('#account-p').bind("click",function(){
	// 	jQuery('#account').focus();
	// });
	// jQuery('#password-p').bind("click",function(){
	// 	jQuery('#password').focus();
	// });
	// jQuery('#account').bind("keydown", function(e){
	// 	if ( e.which == 13)
	// 		$X('password').focus();
	// });
	// jQuery('#password').bind("keydown", function(e){
	// 	if ( e.which == 13)
	// 		ixwPages.jump(aEl);
	// });
	// jQuery('#account').bind("focus", function(){
	// 	var liEl = $XD.ancestor($X('account'), "li");
	// 	$XH.addClass(liEl, "focus");
	// 	jQuery('#account-p').hide();
	// });
	// jQuery('#account').bind("blur", function(){
	// 	var liEl = $XD.ancestor($X('account'), "li");
	// 	$XH.removeClass(liEl, "focus");
	// 	if(this.value.length === 0){
	// 		jQuery('#account-p').show();
	// 	}
	// });
	// jQuery('#password').bind("focus", function(){
	// 	var liEl = $XD.ancestor($X('password'), "li");
	// 	$XH.addClass(liEl, "focus");
	// 	jQuery('#password-p').hide();
	// });
	// jQuery('#password').bind("blur", function(){
	// 	var liEl = $XD.ancestor($X('password'), "li");
	// 	$XH.removeClass(liEl, "focus");
	// 	if(this.value.length === 0){
	// 		jQuery('#password-p').show();
	// 	}
	// });
};
})();
(function () {
IX.ns("PCC.ErrPage");
PCC.ErrPage.init = function(pageCfg, pageParams, cbFn){
	document.body.innerHTML = "ERROR";

};
})();
(function () {
var overCaller = PCC.Global.overviewCaller;
var periodic = PCC.Util.PeriodicChecker;
var Duration = 3; //3sec
var checker = null;
var model = null;
var cpuChart, memChart, nodeChart;

var constKeys = ["fault", "used", "free"];
var textConst = {
	mem: ["故障内存", "使用内存", "未使用内存"],
	node: ["故障节点", "使用节点", "未使用节点"]
};
var colorArr = ["#f24f79","#10b9f7", "#78858c"];

var options = {
	cpu : {
		title: {
			subtext: "CPU使用记录",
			subtextStyle: {
				color: "#78858c",
				fontFamily: "宋体",
				fontSize: 12
			},
			left: "9%",
			top: 0
		},
		grid: {
			right: "12%"
		},
		tooltip: {
			trigger: 'axis',
			formatter: "{b}<br />{a}{c}%",
			axisPointer: {lineStyle: {color: "#afa"}}
		},
		legend: {
			right: "12%",
			top: 27,
			// selectedMode : false,
		    data:[{
		    	name: "当前使用百分比：",
		    	icon: "image://../src",
		    	textStyle: {
		    		color: "#78858c",
		    		fontSize: 12,
		    		fontFamily: "宋体"
		    	}
		    }]
		},
		xAxis: [{
	        type: 'category',
	        boundaryGap: false,
	        splitLine: {show: false},
	        nameTextStyle: {color: "#343f43"},
	        axisLabel: {show: false},
            axisTick: {show: false}
		}],
		yAxis: [{
	        type: 'value',
	        position:"right",
	        splitLine: {show:false},
	        nameTextStyle: {
	        	color: "#0ebaf7",
	        	fontFamily: "宋体",
	        	fontSize: 12
	        },
	        axisLabel: {
	        	formatter: '{value} %',
	        	textStyle: {color: "#78858c"}
	        },
            axisTick: {show:false},
            max: 100,
            min: 0
	    },{
	        type: 'value',
	        position:"right",
	        nameTextStyle: {color: "#343f43"},
	        axisLine: {show: false},
	        splitLine: {show: false},
            axisTick: {show: false},
            axisLabel: {show: false}
		}],
		animationEasingUpdate: "circularOut",
		series: [{
	        name:'当前使用百分比：',
	        type:'line',
	        lineStyle: {normal: {color: "#0ebaf7"}},
	        itemStyle: {
	        	normal: {color: "#0ebaf7", borderWidth: 1}
	        }
		}]
	},
	mem : {
		tooltip: {
		    trigger: 'item',
		    formatter: "{b}: {c} ({d}%)"
		},
	    color: colorArr,
	    series: [{
            name: "",
            type: 'pie',
            radius: ['50%', '70%'],
            itemStyle: {
            	normal: {
            		borderColor: "#343f43",
            		borderWidth: 3
            	}
            }
	    }]
	},
	node : {
		tooltip : {
			trigger: "item",
			formatter: "{b}: {c}%",
			position: function(point, params, dom){
				return [point[0]+10, point[1]-40];
			}
		},
		grid: {
			left: "12%",
			top: "15%"
		},
		xAxis: [{
	        type: 'category',
	        splitLine: {show: false},
	        nameTextStyle: {color: "#343f43"},
	        axisLabel: {show: false},
            axisTick: {show: false},
            axisLine: {lineStyle: {color: "#3d464a"}}
		}],
		yAxis: [{
	        type: 'value',
	        splitLine: {show:false},
	        nameTextStyle: {
	        	color: "#0ebaf7",
	        	fontFamily: "宋体",
	        	fontSize: 12
	        },
	        axisLine: {lineStyle: {color: "#3d464a"}},
	        axisLabel: {
	        	formatter: '{value} %',
	        	textStyle: {color: "#78858c"}
	        },
            axisTick: {show:false},
            max: 100,
            min: 0
		},{
	        type: 'value',
	        splitLine: {show:false},
	        axisLine: {lineStyle: {color: "#3d464a"}},
	        axisLabel: {
	        	formatter: '{value}',
	        	textStyle: {color: "#78858c"}
	        },
            axisTick: {show:false},
            min: 0
	    }],
		series: [{
			type: "bar",
			barMaxWidth: 100,
			barMinHeight: 2,
			label: {
                normal: {
                    show: true,
                    position: 'top',
                    formatter: "{c}%",
                    textStyle: {fontSize: 14, fontWeight: "bold", fontFamily: "Arial"}
                }
            }
		}]
	}
};

function DataModel(data){
	var modelData = IX.clone(data);
	var cpuArr = [], memArr = [], nodeArr = [];

	function _getTplData(){
		IX.iterate(modelData.cpu, function(cpu, idx){
			cpuArr.push({
				name: cpu.usage + "%",
				value : cpu.usage,
				time: new Date(cpu.time).toLocaleTimeString().replace(/^\D*/, "")
			});
			if (cpuArr.length > 60)
				cpuArr.shift();
		});
		memArr = IX.map(textConst.mem, function(text, idx){return {name: text, value: modelData.mem[constKeys[idx]]};});
		nodeArr = IX.map(textConst.node, function(text, idx){
			var value = modelData.node[constKeys[idx]];
			return {
				name: text, 
				value: value,
				percent: Math.round(modelData.node[constKeys[idx]] / modelData.node.all * 100)
			};
		});
		var lastCpu = modelData.cpu[modelData.cpu.length-1];
		return {
			cpu : IX.loop(cpuArr, {time: [],value: []}, function(obj, item, idx){
				obj.name = item.name;
				obj.value.push(item.value);
				obj.time.push(item.time);
				return obj;
			}),
			mem : memArr,
			node : {
				all: modelData.node.all,
				arr: nodeArr
			},
			flow : modelData.flow,
			job : modelData.job,
			const : {
				allCpu : lastCpu.all,
				usedCpu : lastCpu.used,
				freeCpu : lastCpu.free,
				faultCpu : lastCpu.fault,
				allMem : modelData.mem.all,
				memItems : IX.map(constKeys, function(key, idx){
					return {clz: "icon-"+key, text: textConst.mem[idx]};
				}),
				node: {
					all: modelData.node.all,
					items: IX.map(nodeArr, function(node, idx){
						return {
							clz: constKeys[idx],
							text: node.name,
							value: node.value
						};
					})
				},
				flow : modelData.flow,
				job : modelData.job
			}
		};
	}
	return {
		getTplData : _getTplData,
		refresh : function(data){modelData = IX.clone(data);},
		destory: function(){
			modelData = null;
			cpuArr = []; 
			memArr = [];
			nodeArr = [];
		}
	};
}

/*
	cfg : {
		container,
		getTplData : function(defaultOption, data){}
	}
*/
function PccCharts(cfg){
	var key = $XP(cfg, "container", "body");
	var el = $X(key);
	var groupChart = echarts.init(el);
	var defaultOption = options[key];
	var getTplData = $XF(cfg, "getTplData");
	return {
		show: function(data){
			groupChart.setOption(getTplData(defaultOption, data));
		}
	};
}

var t_overview = new IX.ITemplate({tpl: [
	'<div class="p-overview">',
		'<div class="left-bottom">',
			'<div class="panels cpu">',
				'<div class="title"><div class="title-cpu"></div></div>',
				'<div class="division"></div>',
				'<div class="container-body">',
					'<div class="cpu-left"></div>',
					'<div id="cpu" class="cpu-right"></div>',
					'<div class="cpu-bg"></div>',
				'</div>',
			'</div>',
		'</div>',
		'<div class="left-bottom">',
			'<div class="panels mem">',
				'<div class="title"><div class="title-mem"></div></div>',
				'<div class="division"></div>',
				'<div class="container-body">',
					'<div id="mem"></div>',
					'<div class="mem-bg"></div>',
					'<div class="mem-legend"></div>',
				'</div>',
			'</div>',
		'</div>',
		'<div class="left-bottom">',
			'<div class="panels node">',
				'<div class="title"><div class="title-node"></div></div>',
				'<div class="division"></div>',
				'<div class="container-body">',
					'<div id="node" class="node-left"></div>',
					'<div class="node-bg"></div>',
					'<div class="node-right"></div>',
				'</div>',
			'</div>',
		'</div>',
		'<div class="panels both">',
			'<div class="left-bottom">',
				'<div class="flow">',
					'<div class="title"><div class="title-flow"></div></div>',
					'<div class="division"></div>',
					'<div id="flow"></div>',
				'</div>',
			'</div>',
			'<div class="left-bottom">',
				'<div class="job">',
					'<div class="title"><div class="title-job"></div></div>',
					'<div class="division"></div>',
					'<div id="job"></div>',
				'</div>',
			'</div>',
		'</div>',
	'</div>',
'']});

var t_cpuConst = new IX.ITemplate({tpl: [
'<div class="cpu-all">',
	'<span class="all">{allCpu}</span>',
	'<span>/核</span>',
'</div>',
'<div>CPU总量</div>',
'<div class="cpu-bottom">',
	'<div class="cpu-used">',
		'<div class="public">{usedCpu}</div>',
		'<div class="text">被使用</div>',
	'</div>',
	'<div class="cpu-free">',
		'<div class="public">{freeCpu}</div>',
		'<div class="text">未使用</div>',
	'</div>',
	'<div class="cpu-fault">',
		'<div class="public">{faultCpu}</div>',
		'<div class="text">不可用</div>',
	'</div>',
'</div>',
'']});

var t_memConst = new IX.ITemplate({tpl: [
'<div class="public">内存总量</div>',
'<div class="all-mem">{allMem}</div>',
'<div class="unit">/GB</div>',
'']});

var t_memLegend = new IX.ITemplate({tpl: [
'<div>',
	'<tpl id="memItems">','<span class="{clz}"></span>{text}','</tpl>',
'</div>',
'']});

var t_nodeConst = new IX.ITemplate({tpl: [
'<span class="all">{all}</span>',
'<div class="text">计算节点总量</div>',
'<div class="node-bottom">','<tpl id="items">',
	'<div class="node-{clz}">',
		'<div class="lt">',
			'<span class="icon-pic"></span>{text}',
		'</div>',
		'<div class="public">{value}</div>',
	'</div>','</tpl>',
'</div>',
'']});

var t_flowConst = new IX.ITemplate({tpl: [
'<div class="public {clz}">',
	'<div>',
		'<span class="icon"></span>',
		'<span class="value">{value}</span>',
		'<span class="unit">Mbps</span>',
	'</div>',
	'<div class="text">{text}</div>',
'</div>',
'']});

var t_jobConst = new IX.ITemplate({tpl: [
'<div class="public {clz}">',
	'<div class="outside">',
		'<div class="inside">',
			'<span class="value">{value}</span>',
		'</div>',
	'</div>',
	'<div class="text">{text}</div>',
'</div>',
'']});

var constData = {
	flow : {
		renderData: t_flowConst.renderData,
		clz : ["up", "down"],
		text: ["上行流量", "下行流量"]
	},
	job : {
		renderData: t_jobConst.renderData,
		clz : ["task", "work"],
		text : ["处理服务任务数量", "处理作业数量"]
	}
};

function cpuChartShow(data){
	if (!cpuChart) 
		cpuChart = new PccCharts({
			container : "cpu",
			getTplData : function(defaultOption, data){
				var option = IX.clone(defaultOption);
				option.yAxis[0].name = data.name;
				option.xAxis[0].data = data.time;
				option.series[0].data = data.value;
				return option;
			}
		});
	cpuChart.show(data);
}

function memChartShow(data){
	if (!memChart) 
		memChart = new PccCharts({
			container : "mem",
			getTplData : function(defaultOption, data){
				var option = IX.clone(defaultOption);
				option.series[0].data = data;
				option.series[0].label = {
					normal : {formatter: "{b} {c} /GB \n 百分比 {d} %"}
				};
				return option;
			}
		});
	memChart.show(data);
}

function nodeChartShow(data){
	if (!nodeChart)
		nodeChart = new PccCharts({
			container : "node",
			getTplData : function(defaultOption, data){
				var option = IX.clone(defaultOption);
				option.xAxis[0].data = IX.map(textConst.node, function(name){
					return name;
				});
				option.series[0].name = "百分比";
				option.yAxis[1].max = data.all;
				if (data.all == 1)
					option.yAxis[1].splitNumber = 1;
				option.series[0].data = IX.map(data.arr, function(item, idx){
					return {
						name: item.name,
						value: item.percent,
						itemStyle: {normal: {color: colorArr[idx]}}
					};
				});
				return option;
			}
		});
	nodeChart.show(data);
}

function _getFlowOrJobData(data, obj, idx, key){
	var unit = "MB/S";
	if (key == "flow" && data > 1024) {
		data = (data/1024).toFixed(2);
		unit = "GB/S";
	}
	var theKey = obj.clz[idx];
	return {
		clz : theKey,
		value : data[theKey],
		text : obj.text[idx]
	};
}

function showConst(tplData){
	jQuery(".cpu-left").get(0).innerHTML = t_cpuConst.renderData("", tplData.const);
	jQuery(".mem-bg").get(0).innerHTML = t_memConst.renderData("", tplData.const);
	jQuery(".mem-legend").get(0).innerHTML = t_memLegend.renderData("", tplData.const);
	jQuery(".node-right").get(0).innerHTML = t_nodeConst.renderData("", tplData.const.node);
	function _showBoth(keys){
		IX.iterate(keys, function(key){
			jQuery("#"+key).get(0).innerHTML = IX.loop("0".multi(2).split(""), "", function(html, item, idx){
				html += constData[key].renderData("", _getFlowOrJobData(tplData[key], constData[key], idx, key));
				return html;
			});
		});
	}
	_showBoth(["flow", "job"]);
}

function processData(data){
	if (!model) 
		model = new DataModel(data);
	else 
		model.refresh(data);
	var tplData = model.getTplData();
	showConst(tplData);
	cpuChartShow(tplData.cpu);
	memChartShow(tplData.mem);
	nodeChartShow(tplData.node);
}

function getData2Show(cbFn){
	overCaller("getOverView", {}, function(data){
		if (!$XH.hasClass(document.body, "overview")) return;
		processData(data);
		cbFn();
	});
}

function resizeFn(){
	var $body = jQuery("#body");
	var bodyWidth = jQuery("#body").width();
	var $cpubg = jQuery(".cpu-bg");
	var $membg = jQuery(".mem-bg");
	if (bodyWidth >= 1620 ) {
		jQuery(".p-overview").width(1630).height(840);
		$body.removeClass("centre").removeClass("small");
	}else if (bodyWidth <= 1290) {
		jQuery(".p-overview").width(1135).height(569);
		$body.removeClass("centre").addClass("small");
	}else {
		jQuery(".p-overview").width(1320).height(660);
		$body.addClass("centre").removeClass("small");
	}
	var containerWidth = jQuery(".p-overview").width() - 22;
	var containerHeight = jQuery(".p-overview").height() - 14;
	var averageWidth = Math.floor(containerWidth / 10);
	var averageHeight = Math.floor(containerHeight / 2);
	jQuery(".panels").width(averageWidth*5).height(averageHeight);
	var bothHeight = averageHeight+3;
	jQuery(".node").width(averageWidth*6);
	jQuery(".both").width(averageWidth*4+11).height(bothHeight);
	var balance = Math.floor(bothHeight / 3);
	jQuery(".flow").width(averageWidth*4).height(balance);
	jQuery(".job").width(averageWidth*4).height(bothHeight - balance - 14);
	$cpubg.css({
		backgroundImage : 'url('+PCC.Global.cpubgUrl+')',
		backgroundSize : $cpubg.width()+"px"+" "+$cpubg.height()+"px"
	});
}

function switchOut(){
	cpuChart = null; memChart = null; nodeChart = null;
	if (model) model.destory();
	checker.stop();
	jQuery("#body").removeClass("centre").removeClass("small");
}

IX.ns("PCC.Overview");
PCC.Overview.init = function(pageCfg, pageParams, cbFn){
	pageCfg.switchOut = switchOut;
	$X('body').innerHTML = t_overview.renderData("",{});
	if (!checker)
		checker = new periodic(function(fn){
			getData2Show(fn);
		}, 3000);
	checker.start();
	// checker.stop();
	resizeFn();
};
})();
(function () {
var caller = PCC.Global.nodeCaller;
var filterCaller = PCC.Global.jobCaller;
var ixwPages = IXW.Pages;
var globalActionConfig = IXW.Actions.configActions;
var pccDialog = NV.Dialog;
var showDialog = NV.Dialog.show;
var hideDialog = NV.Dialog.hide;

var values = null;
var updateGridInterval = null;

//针对没有按钮的列表
var GridCfgs = {
	job : {
		clz : "nodeJobGrid",
		columns : ["_no","jobName","taskInfo","algorithm","group","user"]
	},
	service : {
		clz : "nodeServiceGrid",
		columns : ["_no", "serviceName","handleNum","waitNum"]
	}
};
var  InfoTexts = {
	job : {
		listCaller : "listJobs4Node"
	},
	service : {
		listCaller : "listServices4Node"
	}
};
function refreshGrid(grid,pageNo){
	var body = document.documentElement;
	var screenY = body.clientHeight - $X('gridContainer').offsetTop;
	var screenX = body.clientWidth - 280;
	jQuery(".ixw-grid").addClass("opcity");
	$X('refreshLoading').style.top = screenY/2-24 + "px";
	$X('refreshLoading').style.left = screenX/2 -24  + "px";
	$XH.removeClass($X('refreshLoading'), "hide");
	grid.refresh(pageNo);
}

var t_page = new IX.ITemplate({tpl: [
	'<div id="gridTools" class="grid-tools"></div>',
	'<div id="gridContainer"><img id="refreshLoading" class="loading" src="{imgUrl}"></div>',
	'<div class="test"></div>',
'']});
var t_cpu = new IX.ITemplate({tpl: [
	'<div class="area">',
		'<div>',
			'<span class="label">可用线程数</span><input id="usableCPU"><span class=\'mark\'>*</span><span class="mark">{used}-{total}</span>',
		'</div>',
	'</div>',
'']});

function initCPUPanel(){
	return new IXW.Lib.PopTrigger({
		id : "cpuInfoPanel",
		position : "top",
		triggerMode : "",
		ifKeepPanel : function(target){return true;},
		bodyRefresh : function(bodyEl, triggerEl){

		}
	});
}
function ifInArrayStatus(status,  arr){
	var isDisabled = false;
	IX.map(arr, function(item){
		if(status === item){
			isDisabled = true;
		}
	});
	return isDisabled;
}
function getDisableActs(rowData){
	var deleteNodes;
	var status = rowData.status;
	deleteNodes = ifInArrayStatus(status, [0]);
	return {
		"delete" : deleteNodes
	};
}
function bindOnValue(used, total){
	var usableCPUEl = $X("usableCPU");
	IX.bind(usableCPUEl, {
		blur : function(){
			$XH[usableCPUEl.value ? "removeClass":"addClass"](usableCPUEl, "requiredMark");
			$XH[usableCPUEl.value > total ||  usableCPUEl.value < used? "addClass" : "removeClass"](usableCPUEl, "requiredMark");
		},
		keypress : function(e){
			var value = usableCPUEl.value;
			if(e.keyCode<48 || e.keyCode>57){
				e.returnValue = false;
			}
		},
		keyup : function(e){
			usableCPUEl.value = usableCPUEl.value.replace(/\D/g, '');
		}
	});
}
function _cpuOkFn(nodeId, grid){
	var usableCPUEl = $X("usableCPU");
	if($XH.hasClass(usableCPUEl,"requiredMark") || !usableCPUEl.value){
		$XH.addClass(usableCPUEl, "requiredMark");
		return;
	}
	caller("editUsableCPU", {id : nodeId, usableCPU : usableCPUEl.value}, function(){
		refreshGrid(grid);
	});
}
function showNodes(cbFn){
	$X('body').innerHTML = t_page.renderData("", {imgUrl : PCC.Global.refreshIntervalUrl});
	var options = {status : 2};
	var grid = new PCC.Grid.NVGrid(IX.inherit({
		container : "gridContainer",
		clz : "nodeGrid",
		columns : [ "_checkbox", "_no", "nodeName","ip","cpuUsage", "memUsage", "gpuUsage", "flow", "nodeStatus"],
		actions : [["delete", "删除", function(rowModel){
			pccDialog.confirm("删除节点", "确认删除" + rowModel.get("name")+"吗？", function(cbFn){
				caller("deleteStorageNodes", {ids : [rowModel.getId()]}, function(){
					cbFn();
					grid.refresh();
				});
			});
		}], ["config", "资源配置", function(rowModel){
			var cpuInfo = rowModel.get("cpu");
			var used = $XP(cpuInfo, "used");
			var total = $XP(cpuInfo, "total");
			showDialog({
				title : "资源配置",
				content : t_cpu.renderData("", {used : used, total : total}),
				listen : {
					ok : function(){
						var nodeId = rowModel.getId();
						_cpuOkFn(nodeId, grid);
					}
				},
				bindOn : function(contentEl){
					bindOnValue(used, total);
				}
			});
		}]],
		dataLoader : function(params, cbFn){
			caller("listNodes", IX.inherit(params, options), cbFn, function(){
				switchOut();
			});
		},
		clickOnRow : function(rowId, cellName, cellEl){
			ixwPages.load(ixwPages.createPath("node-info", {id : rowId}));
		},
		onselect : function(){
			var ids = [];
			IX.map(grid.getSelectedRows(), function(rowModel){
				if(rowModel.get("status")) ids.push(rowModel.getId());
			});
			PCC.GridTools.enableTools("gridTools",ids.length>0);
			//var ids = grid.getModel().getSelectedIds();
			/*var curpageIds = IX.map(grid.getSelectedRows(), function(rowModel){
				return rowModel.getId();
			});
			var curpage = grid.getCurPageNo();
			var items = grid.getModel().getSelectedItems();
			var ids = [];
			for(var i=0; i< items.length; i++){
				if(items[i].page === curpage) items[i].value = curpageIds;
				ids.concat(items[i].value);
			}*/
			//ids = distinct(ids.concat(curpageIds));
			//PCC.GridTools.enableTools("gridTools",ids.length>1, ids.length>0);
		},
		ifactionsEnable : function(rowData){
			return getDisableActs(rowData);
		},
		itemPageName : "nodes"
	}));
	PCC.Grid.currentGrid = {
		refresh :function(){
			refreshGrid(grid);
		},
		"delete" : function(){
			var ids = [];
			var names = "";
			IX.map(grid.getSelectedRows(), function(rowModel){
				if(rowModel.get("status")){
					ids.push(rowModel.getId());
					names = names +rowModel.get("name") + "、" ;
				}
			});
			if(names) names = names.substring(0, names.length-1);
			pccDialog.confirm("删除节点", "确认删除"+names+"吗？", function(cbFn){
				caller("deleteStorageNodes", {ids : ids}, function(){
					cbFn();
					grid.setSelectedIdsNull();
					grid.refresh();
				});
			});
		},
		filter : function(_options){
			var type = $XP(_options, "type", "status");
			var value = $XP(_options, "key", "");
	
			options[type] = value;

			//options = _options;
			refreshGrid(grid,0);
		},
		search : function(value){
			grid.search(value);
		}
	};
	//PCC.PathNav.showPathNav("pathNav", "nodes");
	PCC.GridTools.showTools("gridTools", {
		buttons: ["refresh", "delete"],
		type : "node",
		search : true,
		filter : ["status"]
	});
	PCC.Env.onResize4Body();
	grid.show(/*function(){
		updateGridInterval = setInterval(grid.refresh, 5000);
	}*/);
	cbFn();
}

var t_nodeInfo = new IX.ITemplate({tpl: [
	'<div class="first"><span class="label">CPU类型</span><span class="value">{cpuType}</span></div>',
	'<div><span class="label">CPU主频</span><span class="value">{cpuClockSpeed}</span></div>',
	'<div><span class="label">CPU处理器</span><span class="value">{cpu}</span></div>',
	'<div><span class="label">内存</span><span class="value">{mem}</span></div>',
	'<div><span class="label">操作系统</span><span class="value">{os}</span></div>',
	'<div><span class="label">宽带</span><span class="value">{broadband}</span></div>',
	'<div><span class="label">添加时间</span><span class="value">{addTime}</span></div>',
'']});
var t_subpage = new IX.ITemplate({tpl: [
'<div class="p_node">',
	'<div id="pathNav"></div>',
	'<div class="card-switch titlebar">',
		'<a class="{infoActiveClz}" data-href="{infoHref}"><span>节点信息</span></a>',
		'<a class="{jobActiveClz}" data-href="{jobHref}"><span>作业情况</span></a>',
		'<a class="{serviceActiveClz}" data-href="{serviceHref}"><span>服务情况</span></a>',
		'<a class="{monitorActiveClz} hide" data-href="{monitorHref}"><span>统计分析</span></a>',
	'</div>',
	'<div id="gridTools" class="grid-tools {toolClz}"></div>',
	'<div id="gridBody" class="{gridBodyClz}"><div id="gridContainer" class="nobuttonPage"></div></div>',
'</div>',
'']});

function _showGrid(container, type, _params, name){
	var  textInfo = InfoTexts[type], gridCfg = GridCfgs[type];
	var options = {algorithm : 2, group : 2};
	var grid =  new PCC.Grid.CommonGrid(container, {
		grid : IX.inherit(gridCfg, {
			dataLoader : function(params, cbFn){
				caller(textInfo.listCaller, IX.inherit(_params, params, options), cbFn, function(){
					switchOut();
				});
			}
		}),
		itemPageName : type
	});
	PCC.Grid.currentGrid = {
		filter : function(_options){
			var type = $XP(_options, "type", "status");
			var value = $XP(_options, "key", "");
	
			options[type] = value;
			refreshGrid(grid, 0);
		}
	};
	PCC.PathNav.showPathNav("pathNav", ["nodes"], name);
	if(type === "job"){
		filterCaller("getAlgoAndGroup", _params, function(filterData){
			PCC.GridTools.showTools("gridTools", {
				type : type,
				filter : ["group", "algorithm"]
			}, filterData);
		});
	}

	grid.show(/*function(){
		updateGridInterval = setInterval(grid.refresh, 5000);
	}*/);

}
function _showNodeInfo(nodeId, type, cbFn){
	$X('body').innerHTML = t_subpage.renderData("",{
		infoActiveClz : type === "info" ? "active" : "",
		infoHref : ixwPages.createPath("node-info", {id : nodeId}),
		jobActiveClz : type === "job" ? "active" : "",
		jobHref : ixwPages.createPath("node-job", {id : nodeId}),
		serviceActiveClz : type === "service" ? "active" : "",
		serviceHref : ixwPages.createPath("node-service", {id : nodeId}),
		monitorActiveClz : type === "monitor" ? "active" : "",
		monitorHref : ixwPages.createPath("node-monitor", {id : nodeId}),
		toolClz : type ==="service" || type === "info" ? "hide" : "",
		gridBodyClz : type === "info" ? "nodeInfo" : ""
	});
	if(type === "monitor"){

	}else if(type === "info"){
		caller("getNodeInfo", {id : nodeId}, function(nodeInfo){
			PCC.PathNav.showPathNav("pathNav", ["nodes"], $XP(nodeInfo, "name", ""));
			$X('gridBody').innerHTML = t_nodeInfo.renderData("", {
				cpuType : $XP(nodeInfo, "cpuType", ""),
				cpuClockSpeed : $XP(nodeInfo, "cpuClockSpeed", ""),
				cpu : $XP(nodeInfo, "cpu", ""),
				mem : $XP(nodeInfo, "mem", ""),
				os : $XP(nodeInfo, "os", ""),
				broadband : $XP(nodeInfo, "broadband", ""),
				addTime : $XP(nodeInfo, "addTime", "")
			});
		});
	}else{
		caller("getNodeName", {id : nodeId}, function(name){
			_showGrid("gridContainer", type, {id : nodeId}, name);
		});
	}

}
function switchOut(){
	if(!updateGridInterval) return;
	clearInterval(updateGridInterval);
	updateGridInterval=null;
}
IX.ns("PCC.Node");
PCC.Node.init = function(pageCfg, pageParams, cbFn){
	pageCfg.switchOut = switchOut;
	var pageName = pageCfg.name;
	var nodeId = $XP(pageParams,"id");
	switch(pageName){
	case "nodes":
		showNodes(cbFn);
		break;
	case "node-info":
		_showNodeInfo(nodeId, "info", cbFn);
		break;
	case "node-job":
		_showNodeInfo(nodeId, "job", cbFn);
		break;
	case "node-service":
		_showNodeInfo(nodeId, "service", cbFn);
		break;
	case "storagenode-monitor":
		//_showStorageNodeInfo(storageNodeId, "monitor", cbFn);
		break;
	}
};
})();
(function () {
var showDialog = NV.Dialog.show;
var hideDialog = NV.Dialog.hide;
var dropdownBox = PCC.inputBox.dropdownBox();
var globalActionConfig = IXW.Actions.configActions;
var caller = PCC.Global.jobCaller;

var jobCfg = {
	algorithm : {inputId : "dlgAlgorithm", inputClz : "required"}
};

var t_job = new IX.ITemplate({tpl: [
	'<div class="area">',
		'<div>',
			'<span class="label">算法模块</span>{algorithmHTML}<span class=\'mark\'>*</span>',
		'</div>',
		'<div>',
			'<span class="label">作业参数</span><span></span><textarea id="param" class="required"></textarea><span class=\'mark\'>*</span>',
		'</div>',
	'</div>',
'']});

globalActionConfig([["jobDialog.chose",function(params, el){
	var dropdownEl = $XH.ancestor(el, "dropdown");
	if(!dropdownEl) return;
	var value = el.innerHTML === "空" ? "" :el.innerHTML;
	var key = params.key;
	var valueEl = $XH.first($XH.first(dropdownEl, "dropdown-toggle"), "value");
	var inputEl = $XD.first(dropdownEl, "input");
	inputEl.value = value;
	valueEl.innerHTML = value;
}]]);
var from =0, to=0;

function isInputNull(inputEl, aEl){
	var value = inputEl.value;
	$XH[value ? "removeClass":"addClass"](aEl, "requiredMark");
}
function bindOnValve(contentEl){
	dropdownBox.bindOnMouseWheelAndHover(contentEl);
	var inputs = jQuery(contentEl).find("input.required");
	IX.map(inputs, function(el){
		dropdownBox.bindonDropdown(el);
	});
	var textareas = jQuery(contentEl).find("textarea.required");
	IX.map(textareas, function(textarea){
		IX.bind(textarea, {
			blur : function(){
				$XH[textarea.value ? "removeClass" : "addClass"](textarea, "requiredMark");
			}
		});
	});
}

function vertifyRequired(){
	var flag = true,value = "";
	var inputEl = jQuery(".area input.required")[0];
	var dropdownEl = $XH.first($XH.ancestor(inputEl, "dropdown"), "dropdown-toggle");
	var inputValue = dropdownBox.isInputNull(inputEl, dropdownEl);
	if(inputValue ==="") flag = false;
	IX.map(jQuery(".area textarea.required"), function(el){
		if(el.value === ""){
			flag = false;
		}
		$XH[el.value=== "" ? "addClass" : "removeClass"](el, "requiredMark");
	});
	return flag;
}
function exportFn(){
	var flag = vertifyRequired();
	if(flag){
		var algorithm = $X('dlgAlgorithm').value;
		var param = $X('param').value;
		var $form = jQuery('<form id="form" action="/job/download" method="POST" style="display:none"></form>');
		$form.append(jQuery('<input type="text" name="algorithm" value="' + algorithm + '">'))
			.append(jQuery('<input type="text" name="param" value="' + param + '">'))
			.append(jQuery('<input type="submit">'))
			.appendTo(jQuery("#body"));
		$form.submit();
	}
}
function submitJob(okFn, btndisableFn){
	var flag = vertifyRequired();
	if(flag){
		var algorithm = $X('dlgAlgorithm').value;
		var param = $X('param').value;
		if(IX.isFn(btndisableFn)) btndisableFn();
		okFn({
			algorithm : algorithm,
			param : param
		}, function(){
			hideDialog();
		});
	}
}

IX.ns("PCC.jobDialog");
PCC.jobDialog.addJob = function(okFn){
	caller("getAlgoritms", {}, function(data){
		showDialog({
			//clz : "jobDialog",
			title : "新建作业",
			content : t_job.renderData("",{
				algorithmHTML : dropdownBox.getDropdownBoxHTML("",jobCfg.algorithm, data.algorithm,"jobDialog.chose", true)
			}),
			listen : {
				ok : function(btndisableFn){submitJob(okFn, btndisableFn);},
				export : exportFn
			},
			btns : {
				left : [],
				right : [{name:"ok", text: "确定"}, {name:"export", text:"导出"}, {name:"cancel", text:"取消"}] 
			},
			bindOn : function(contentEl){
				bindOnValve(contentEl);
			}
		});
	});
};

})();
(function () {
var caller = PCC.Global.jobCaller;
var ixwPages = IXW.Pages;
var globalActionConfig = IXW.Actions.configActions;
var pccDialog = NV.Dialog;
var jobDialog = PCC.jobDialog;

var values = null;
var updateGridInterval = null;

//针对没有按钮的列表
var GridCfgs = {
	current : {
		clz : "currentJobGrid",
		columns :[ "_checkbox","_no","jobName","process","priority","submitTime","waitTime","handleTime","resource","algorithm","group","user"],
		tools : {
			buttons: ["add", "import", "stop", "delete"],
			type : "job",
			search : true,
			upload : true,
			filter : ["group", "algorithm"]
		}
	},
	history  : {
		clz : "historyJobGrid",
		columns : [ "_checkbox","_no","jobName","jobStatus","submitTime","waitTime","handleTime","resource","algorithm","group","user"],
		tools : {
			buttons: ["refresh", "submit"],
			type : "job",
			search : true,
			dpt : true,
			filter : ["status","group", "algorithm"]
		}
	},
	service : {
		clz : "jobServiceGrid",
		columns : ["_no","serviceName","handleNum","waitNum"]
	},
	node : {
		clz : "jobNodeGrid",
		columns : ["_no","computeNode","ip","taskInfo"]
	},
	node4Service : {
		clz : "jobServiceNodeGrid",
		columns : ["_no","computeNode","handleNum","waitNum"]
	}
};
var InfoTexts = {
	current : {
		listCaller : "listCurrentJobs"
	},
	history : {
		listCaller : "listHistoryJobs"
	},
	service : {
		listCaller : "listServices"
	},
	node : {
		listCaller : "listNodes4Job"
	},
	node4Service : {
		listCaller : "listNodes4Service"
	}
};

var Options = {
	current : {
		algorithm: -1,
		group : -1
	},
	history : {
		algorithm: -1,
		group : -1,
		status: -1
	},
	service : {},
	node : {}
};
function refreshGrid(grid,pageNo){
	var body = document.documentElement;
	var screenY = body.clientHeight - $X('gridContainer').offsetTop;
	var screenX = body.clientWidth - 280;
	jQuery(".ixw-grid").addClass("opcity");
	$X('refreshLoading').style.top = screenY/2-24 + "px";
	$X('refreshLoading').style.left = screenX/2 -24  + "px";
	$XH.removeClass($X('refreshLoading'), "hide");
	grid.refresh(pageNo);
}

var t_page = new IX.ITemplate({tpl: [
	'<div class="card-first">',
		'<a class="{jobActiveClz}" data-href="{jobHref}">作业管理</a>',
		'<a class="{serviceActiveClz}" data-href="{serviceHref}">服务管理</a>',
	'</div>',
	'<div class="card-second">',
		'<a class="{curActiveClz}" data-href="{curHref}">当前作业</a>',
		'<a class="{historyActiveClz}" data-href="{historyHref}">历史作业</a>',
	'</div>',
	'<div id="gridTools" class="grid-tools"></div>',
	'<div id="gridContainer"><img id="refreshLoading" class="loading" src="{imgUrl}"></div>',
'']});

function ifInArrayStatus(status, arr){
	var isDisabled = false;
	IX.map(arr, function(item){
		if(status === item){
			isDisabled = true;
		}
	});
	return isDisabled;
}
function getEnableabledBtns(selectedRows){
	var process = "", arrbtnStatus=[];
	var stop, deleteJobs;
	IX.map(selectedRows, function(rowModel){
		process = rowModel.get("process");
		if(!stop) stop = !ifInArrayStatus(process, [-2]);
		if(!deleteJobs) deleteJobs = ifInArrayStatus(process, [-2]);
	});
	if(stop) arrbtnStatus.push("stop");
	if(deleteJobs) arrbtnStatus.push("delete");
	return arrbtnStatus;
}
function getDisableActs(rowData){
	var deleteNodes;
	var process = rowData.process;
	deleteNodes = ifInArrayStatus(process, [-2]);
	return {
		"delete" : deleteNodes
	};
}
function showJobs(first, second, cbFn){
	$X('body').innerHTML = t_page.renderData("", {
		jobActiveClz : first ==="job" ? "active" :"",
		jobHref : ixwPages.createPath("jobs"),
		serviceActiveClz : first ==="service" ? "active" : "",
		serviceHref : ixwPages.createPath("job-service"),
		curActiveClz : second === "current" ? "active" : first === "service"? "hide" : "",
		curHref : ixwPages.createPath("jobs"),
		historyActiveClz : second === "history" ? "active" : first === "service"? "hide" : "",
		historyHref : ixwPages.createPath("job-history"),
		imgUrl : PCC.Global.refreshIntervalUrl
	});
	var options = Options[second];
	var textInfo = InfoTexts[second], gridCfg = GridCfgs[second];
	var toDate = new Date().getTime();
	var dtpDate = {
		from : toDate - 90*24*60*60*1000,
		to: toDate
	};
	if (second == "history")
		options = IX.inherit(options, dtpDate);
	var grid = new PCC.Grid.NVGrid(IX.inherit(gridCfg,{
		container : "gridContainer",
		actions : second === "current"?[["delete", "删除", function(rowModel){
			pccDialog.confirm("删除作业", "确认删除" + rowModel.get("name")+"吗？", function(){
				caller("deleteJobs", {ids : [rowModel.getId()]}, function(){
					grid.refresh();
				});
			});
		}], ["stop", "停止", function(rowModel){
			caller("stopJobs", {ids : [rowModel.getId()]}, function(){
				grid.refresh();
			});
		}], ["priority", "优先", function(rowModel){
			caller("priorityJob", {id : rowModel.getId()}, function(){grid.refresh();});
		}]] : [["submit", "提交作业", function(rowModel){
			caller("submitJobs", {ids : [rowModel.getId()]}, function(){grid.refresh();});
		}]],
		dataLoader : function(params, cbFn){
			caller(textInfo.listCaller, IX.inherit(params, options), cbFn, function(){
				switchOut();
			});
		},
		clickOnRow : function(rowId, cellName, cellEl){
			var rowModel = grid.getModel().getRow(rowId);
			var process = rowModel.get("process");
			if(process === -2)
				ixwPages.load(ixwPages.createPath("job-"+second+"-param", {id : rowId}), function(){
					//jQuery(".card-switch .computeNode").addClass("hide");
					return true;
				});
			else
				ixwPages.load(ixwPages.createPath("job-"+second+"-node", {id : rowId}));
		},
		onselect : function(){
			var ids = [];
			if(second === "current"){
				ids = IX.map(grid.getSelectedRows(), function(rowModel){
					return rowModel.getId();
				});
				var btnStatus = getEnableabledBtns(grid.getSelectedRows());
				PCC.GridTools.enableTools("gridTools",false, btnStatus);
			}else{
				ids = IX.map(grid.getSelectedRows(), function(rowModel){
					return rowModel.getId();
				});
				PCC.GridTools.enableTools("gridTools",ids.length>0);
			}
			//var ids = grid.getModel().getSelectedIds();
			/*var curpageIds = IX.map(grid.getSelectedRows(), function(rowModel){
				return rowModel.getId();
			});
			var curpage = grid.getCurPageNo();
			var items = grid.getModel().getSelectedItems();
			var ids = [];
			for(var i=0; i< items.length; i++){
				if(items[i].page === curpage) items[i].value = curpageIds;
				ids.concat(items[i].value);
			}*/
			//ids = distinct(ids.concat(curpageIds));
			//PCC.GridTools.enableTools("gridTools",ids.length>1, ids.length>0);
		},
		ifactionsEnable : function(rowData){
			return getDisableActs(rowData);
		},
		itemPageName : first + "-" + second
	}));
	PCC.Grid.currentGrid = {
		add : function(){
			jobDialog.addJob(function(jobData, fn){
				caller("addJob", jobData, function(){
					grid.refresh(0);
					fn();
				},fn);
			});
		},
		refresh :function(){
			refreshGrid(grid);
		},
		stop : function(){
			var ids = [], names = "";
			IX.map(grid.getSelectedRows(), function(rowModel){
				if(rowModel.get("process") !== -2){
					ids.push(rowModel.getId());
					names = names +rowModel.get("name") + "、" ;
				}
			});
			if(names) names = names.substring(0, names.length-1);
			pccDialog.confirm("停止作业", "确认停止"+names+"吗？", function(fn){
				caller("stopJobs", {ids : ids}, function(){
					grid.refresh();
					fn();
				}, fn);
			});
		},
		"delete" : function(){
			var ids = [];
			var names = "";
			IX.map(grid.getSelectedRows(), function(rowModel){
				if(rowModel.get("process") === -2){
					ids.push(rowModel.getId());
					names = names +rowModel.get("name") + "、" ;
				}
			});
			if(names) names = names.substring(0, names.length-1);
			pccDialog.confirm("删除作业", "确认删除"+names+"吗？", function(fn){
				caller("deleteJobs", {ids : ids}, function(){
					grid.refresh();
					fn();
				}, fn);
			});
		},
		submit : function(){
			var ids = IX.map(grid.getSelectedRows(), function(rowModel){
				return rowModel.getId();
			});
			caller("submitJobs", {ids : ids}, function(){
				refreshGrid(grid);
			});
		},
		filter : function(_options){
			var type = $XP(_options, "type", "");
			var value = $XP(_options, "key", "");
			options[type] = value;
			refreshGrid(grid,0);
		}
	};
	if(first === "job"){
		caller("getAlgoAndGroup", {}, function(filterData){
			for (var a in filterData){
				filterData[a].unshift({id: -1, name: "全部"});
			}
			if (second == "history") 
				filterData = IX.inherit(filterData, dtpDate);
			PCC.GridTools.showTools("gridTools", gridCfg.tools, filterData, second);
		});
	}
	if (second === "history")
		PCC.Grid.currentGrid = IX.inherit(PCC.Grid.currentGrid, {
			"dtp-filter": function(){
				IX.iterate(arguments, function(date){
					var type = $XP(date, "type", "");
					var value = $XP(date, "key", "");
					options[type] = value;
				});
				refreshGrid(grid,0);
			}
		});
	PCC.Env.onResize4Body();
	grid.show(/*function(){
		updateGridInterval = setInterval(grid.refresh, 5000);
	}*/);
	cbFn();
}

var t_subpage = new IX.ITemplate({tpl: [
'<div class="p_node">',
	'<div id="pathNav"></div>',
	'<div class="card-switch titlebar" >',
		'<a class="computeNode {nodeActiveClz}" data-href="{nodeHref}"><span>计算节点</span></a>',
		'<a class="{paramActiveClz}" data-href="{paramHref}"><span>作业参数</span></a>',
	'</div>',
	'<div id="gridTools" class="r grid-tools"></div>',
	'<div id="gridBody"><div id="gridContainer" class="nobuttonPage"></div></div>',
'</div>',
'']});

function _showGrid(container, jobType, type, _params, name){
	var  textInfo = InfoTexts[type], gridCfg = GridCfgs[type];
	var options = {status : 2};
	var grid =  new PCC.Grid.CommonGrid(container, {
		grid : IX.inherit(gridCfg, {
			dataLoader : function(params, cbFn){
				caller(textInfo.listCaller, IX.inherit(_params, params, options), cbFn, function(){
					switchOut();
				});
			}
		}),
		itemPageName : type
	});
	
	grid.show(/*function(){
		updateGridInterval = setInterval(grid.refresh, 5000);
	}*/);

}
function _showJobInfo(jobId, jobType, type, cbFn){
	var isQueue;
	if(IX.isFn(cbFn)) isQueue = cbFn();
	var getNameCaller = jobType === "service" ? "getServiceName" : isQueue || (type === "param" && jobType !=="history") ? "getJobNameAndProcess" : "getJobName";
	caller(getNameCaller, {id : jobId}, function(name){
		if(getNameCaller === "getJobNameAndProcess") {
			var process = $XP(name, "process", 0);
			isQueue = process === -2;
			name = $XP(name, "name", 0);
		}
		$X('body').innerHTML = t_subpage.renderData("",{
			nodeActiveClz : isQueue ? "hide" : type === "node" || type === "node4Service" ? "active" : "",
			nodeHref : ixwPages.createPath("job-"+jobType+"-node", {id : jobId}),
			paramActiveClz : type === "param" ? "active" : type === "node4Service" ? "hide" : "",
			paramHref : ixwPages.createPath("job-"+jobType+"-param", {id : jobId})
		});
		if(jobType === "service")
			PCC.PathNav.showPathNav("pathNav", ["jobs", "service"], name);
		else
			PCC.PathNav.showPathNav("pathNav", ["jobs","job", jobType], name);

		//cbFn();
		if(type === "monitor"){

		}else if(type === "param"){
			caller("getParams", {id : jobId}, function(data){
				if(!$X('gridContainer')) return;
				$X('gridContainer').innerHTML = '<div class="container-data" id="website">'+data+'</div><div class="button"><a>复制...</a></div>';
				var clipboard = new Clipboard(".button", {
				    target: function() {
				        return document.querySelector('#website');
				    }
				});
				clipboard.on('success', function(e) {
			        alert("作业参数复制成功！");
			    });

			    clipboard.on('error', function(e) {
			        alert("作业参数复制失败！");
			    });
			});
		}else{
			_showGrid("gridContainer", jobType, type, {id : jobId}, name);
		}
	});
}
function switchOut(){
	if(!updateGridInterval) return;
	clearInterval(updateGridInterval);
	updateGridInterval=null;
}
IX.ns("PCC.Job");
PCC.Job.init = function(pageCfg, pageParams, cbFn){
	pageCfg.switchOut = switchOut;
	var pageName = pageCfg.name;
	var jobId = $XP(pageParams,"id");
	switch(pageName){
	case "jobs":
		showJobs("job","current",cbFn);
		break;
	case "job-history":
		showJobs("job","history",cbFn);
		break;
	case "job-service":
		showJobs("service","service",cbFn);
		break;
	case "job-current-node":
		_showJobInfo(jobId, "current", "node", cbFn);
		break;
	case "job-current-param":
		_showJobInfo(jobId, "current", "param", cbFn);
		break;
	case "job-history-node":
		_showJobInfo(jobId, "history", "node", cbFn);
		break;
	case "job-history-param":
		_showJobInfo(jobId, "history", "param", cbFn);
		break;
	case "job-service-node":
		_showJobInfo(jobId, "service", "node4Service", cbFn);
		break;
	}
};
})();
(function () {
var caller = PCC.Global.algorithmCaller;
var ixwPages = IXW.Pages;
var globalActionConfig = IXW.Actions.configActions;
var showDialog = NV.Dialog.show;
var hideDialog = NV.Dialog.hide;
var pccDialog = NV.Dialog;
var uploadedCbHT = new IX.IListManager();

var t_page = new IX.ITemplate({tpl: [
	'<div class="{clz}">',
		'<a class="name" data-href="algorithms">算法模块</a>',
		'<div class="node-space"></div>',
		'<div class="algorithm-name" data-id="{id}">{algorithmName}</div>',
	'</div>',
	'<div id="gridTools" class="grid-tools"></div>',
	'<div id="gridContainer"></div>',
'']});

var t_nodePage = new IX.ITemplate({tpl: [
	'<div class="{clz}">',
		'<a class="name" data-href="algorithms">算法模块</a>',
		'<div class="node-space"></div>',
		'<a class="algorithm-name" data-id="{id}" data-href="algorithm/{id}">{algorithmName}</a>',
		'<div class="node-space"></div>',
		'<div class="algorithm-nodeName" data-id="{nodeId}">{algorithmNodeName}</div>',
	'</div>',
	'<div id="container">{algorithmDetails}</div>',
'']});

var t_algorithms = new IX.ITemplate({tpl: [
	'<div class="area">',
		'<div>',
			'<span class="label">算法组名称:</span><input id="algorithmName" class="" value="{algorithmName}"><span class=\'mark\'>*</span>',
		'</div>',
	'</div>',
'']});

var t_algorithm = new IX.ITemplate({tpl: [
'<form action="{url}" method="POST" enctype="multipart/form-data" id="algorithmNode_form" name="algorithmNode_form" target="algorithmNode_frame">',
	'<div class="area">',
		'<div>',
			'<span class="label">算法模块名称:</span><input id="algorithmName" name="name" value="{algorithmName}"><span class=\'mark\'>*</span>',
		'</div>',
		'<div>',
			'<input type="hidden" id="{id}" name="id" value="{id}">',
			'<input type="hidden" nodeId="{nodeId}" name="nodeId" value="{nodeId}">',
			'<span class="label">添加算法模块:</span>',
			'<span class="relative_file">',
				'<a class="updata_file">选择文件</a>',
				'<input type="file" id="algorithm_file" class="required" name="algorithm_file">',
				'<input type="hidden" name="tkey" value ="{tkey}" id="tkey"/>',
			'</span><span class=\'mark\'>*</span>',
			'<div class="txt {clz}"><span id="fileName">{fileName}</span><a class="close" data-href="$clean.file"></a></div>',
		'</div>',
	'</div>',
	'<iframe name="algorithmNode_frame" id="algorithmNode_frame" style="display:none" src="about:blank"></iframe>',
'</form>',
'']});

var grid = null;

var GridCfgs = {
	current : {
		clz : "algorithmGrid",
		columns :[ "_checkbox","_no","algorithmsName","algorithmNum"],
		tools : {
			buttons: ["refresh", "add", "delete"],
			type : "algorithm",
			search : true,
			upload : false
		}
	},
	node : {
		clz : "algorithmNodeGrid",
		columns : ["_checkbox","_no","algorithmName","version"],
		tools : {
			buttons: ["refresh", "add", "delete"],
			type : "algorithm",
			search : true,
			upload : false
		}
	}
};

globalActionConfig([["clean.file", function(params, el){
	jQuery("#algorithm_file").val("");
	jQuery(".txt").addClass("title-disabled");
}]]);

function refreshGrid(grid,pageNo){
	var body = document.documentElement;
	var screenY = body.clientHeight - $X('gridContainer').offsetTop;
	var screenX = body.clientWidth - 280;
	jQuery(".ixw-grid").addClass("opcity");
	$X('refreshLoading').style.top = screenY/2-24 + "px";
	$X('refreshLoading').style.left = screenX/2 -24  + "px";
	$XH.removeClass($X('refreshLoading'), "hide");
	grid.refresh(pageNo);
}

function _algorithmOkFn(isAdd, id){
	var name = $X("algorithmName").value;
	if (IX.isEmpty(name)) return;
	caller(isAdd ? "addAlgorithm" : "editAlgorithm", IX.inherit({name: name}, isAdd ? {} : {id: id}), function(){
		hideDialog();
		refreshGrid(grid);
	});
}

function submitAlgorithmFile(tkeyName, cbFn){
	var formEl = $X('algorithmNode_form');
	uploadedCbHT.register(tkeyName, function(retData){
		switch(retData.retCode){
		case 0 :
			alert(retData.err);
			break;
		case -1 :
			PCC.Env.clearSession();
			break;
		default:
			return cbFn(retData.data);
		}
	});
	formEl.submit();
}

function _algorithmNodeOkFn(isAdd, keyName){
	var name = $X("algorithmName").value;
	if (IX.isEmpty(name)) return;
	submitAlgorithmFile(keyName, function(ret){
		hideDialog();
		refreshGrid(grid);
	});
}

function renderBody(isNode, gridCfg, algorithmName, algorithmId){
	$X('body').innerHTML = t_page.renderData("", {
		clz : isNode ? "showNode" : "title-disabled",
		id : algorithmId,
		algorithmName :  algorithmName
	});
	PCC.GridTools.showTools("gridTools", gridCfg.tools, {});
}

function fileChange(){
	var fileEl = $X('algorithm_file');
	if (!fileEl) return;
	jQuery(fileEl).bind("change", function(e){
		jQuery(".txt").removeClass("title-disabled");
		jQuery("#fileName").html(fileEl.value.split('\\').pop());
	});
}

function addOrEditGrid(isNode, rowModel, rowEl, isAdd){
	var tkeyName = IX.id();
	var html = isNode ? t_algorithm.renderData("", {
		id: jQuery(".algorithm-name").attr("data-id"),
		nodeId: rowModel ? rowModel.getId() : "",
		tkey: tkeyName,
		fileName: rowModel ? rowModel.get("fileName") : "",
		url: PCC.Global.algorithmNodeFileUploadUrl+"?tkey=" + tkeyName,
		clz: isAdd ? "title-disabled" : "",
		algorithmName: rowModel ? rowModel.get("name") : ""
	}) : t_algorithms.renderData("", {
		algorithmName: rowModel ? rowModel.get("name") : ""
	});
	showDialog({
		title: isNode ? (isAdd ? "新建算法" : "编辑算法") : (isAdd ? "新建算法组" : "编辑算法组"),
		content: html,
		listen : {ok : function(){
			if (isNode) 
				_algorithmNodeOkFn(isAdd, tkeyName);
			else
				_algorithmOkFn(isAdd, (rowModel ? rowModel.getId() : ""));
		}}
	});
	fileChange();
}

function showAlgorithm(cbFn, rowId){
	var isNode = (rowId !== undefined && rowId !== 0);
	var gridCfg = GridCfgs[isNode ? "node" : "current"];
	if (isNode) {
		if (grid) {
			renderBody(isNode, gridCfg, grid.getModel().getRow(rowId).get("name"), rowId);
		} else {
			renderBody(isNode, gridCfg, rowId, rowId);
		}
	} else {
		renderBody(isNode, gridCfg, "", "");
	}
	function deletedNodes(name, params, cbFn){
		caller(name, params, function(){
			grid.refresh();
			cbFn();
		});
	}

	grid = new PCC.Grid.NVGrid(IX.inherit(gridCfg, {
		container : "gridContainer",
		actions : [["edit", "编辑", function(rowModel, rowEl){
			addOrEditGrid(isNode, rowModel, rowEl, false);
		}], ["delete", "删除", function(rowModel){
			pccDialog.confirm("删除", "确认删除" + rowModel.get("name")+"吗？", function(cbFn){
				var name = isNode ? "deleteAlgorithmNodes" : "deleteAlgorithms";
				var params = isNode ? {id: rowId, ids: [rowModel.getId()]} : {ids : [rowModel.getId()]};
				deletedNodes(name, params, cbFn);
			});
		}]],
		dataLoader : function(params, cbFn){
			var name = isNode ? "getAlgorithmNodes" : "getAlgorithms";
			var param = isNode ? {id: rowId} : {};
			caller(name, IX.inherit(params, param), cbFn, function(){
				// switchOut();
			});
		},
		clickOnRow : function(rowId, cellName, cellEl){
			if ($XH.hasClass(document.body, "algorithm-node"))
				return ixwPages.load(ixwPages.createPath("algorithm-node-details", {id: jQuery(".algorithm-name").attr("data-id"), nodeId : rowId}));
			ixwPages.load(ixwPages.createPath("algorithm-node", {id : rowId}));
		},
		onselect : function(){
			var ids = [];
			IX.map(grid.getSelectedRows(), function(rowModel){
				if(rowModel) ids.push(rowModel.getId());
			});
			PCC.GridTools.enableTools("gridTools",ids.length>0);
		}
	}));
	PCC.Grid.currentGrid = {
		refresh :function(){
			refreshGrid(grid);
		},
		"delete" : function(){
			var ids = [];
			IX.map(grid.getSelectedRows(), function(rowModel){
				if (rowModel)
					ids.push(rowModel.getId());
			});
			pccDialog.confirm("删除", "确认删除这"+ids.length+"个吗？", function(cbFn){
				var name = isNode ? "deleteAlgorithmNodes" : "deleteAlgorithms";
				var params = isNode ? {id: rowId, ids: ids} : {ids : ids};
				deletedNodes(name, params, cbFn);
			});
		},
		add : function(){
			addOrEditGrid(isNode, "", "", true);
		}
	};
	PCC.Env.onResize4Body();
	grid.show(/*function(){
		updateGridInterval = setInterval(grid.refresh, 5000);
	}*/);
	cbFn();
}

function showDetails(cbFn, id, nodeId){
	grid = null;
	caller("getAlgorithmDetails", {id: id, nodeId: nodeId}, function(data){
		$X('body').innerHTML = t_nodePage.renderData("", {
			clz : "showNode",
			id : nodeId,
			nodeId : id,
			algorithmName : data.algorithmNodeName,
			algorithmNodeName : data.algorithmName,
			algorithmDetails : data.algorithmDetails
		});
	});
}

IX.ns("PCC.Algorithm");
PCC.Algorithm.FileUploadedCB = function(tkey, retData){
	var fn = uploadedCbHT.get(tkey); 
	fn(retData);
};

PCC.Algorithm.init = function(pageCfg, pageParams, cbFn){
	switch (pageCfg.name) {
		case "algorithms":
			showAlgorithm(cbFn);
			break;
		case "algorithm-node":
			showAlgorithm(cbFn, pageParams.id);
			break;	
		case "algorithm-node-details":
			showDetails(cbFn, pageParams.nodeId, pageParams.id);
			break;
	}
};
})();
(function () {
var caller = PCC.Global.groupCaller;
var ixwPages = IXW.Pages;
var globalActionConfig = IXW.Actions.configActions;
var showDialog = NV.Dialog.show;
var hideDialog = NV.Dialog.hide;
var pccDialog = NV.Dialog;
var PeriodicChecker = PCC.Util.PeriodicChecker;



var t_page = new IX.ITemplate({tpl: [
	'<div class="{clz}">',
		'<a class="name" data-href="groups">群组用户</a>',
		'<div class="node-space"></div>',
		'<div class="group-name" data-id="{id}">{groupName}</div>',
	'</div>',
	'<div id="gridTools" class="grid-tools"></div>',
	'<div id="gridContainer"></div>',
	'<div id="pie">',
		'<div id="quota" class="pcc-pie"></div>',
		'<div id="using" class="pcc-pie"></div>',
	'</div>',
'']});

var t_groups = new IX.ITemplate({tpl: [
	'<div class="area">',
		'<div>',
			'<span class="label">{titleName}</span><input id="groupName" class="" value="{groupName}"><span class=\'mark\'>*</span>',
		'</div>',
		'<div>',
			'<span class="label">资源配额:</span><input id="quotaId" class="" value="{quota}"><span class=\'mark\'>*</span>',
		'</div>',
	'</div>',
'']});


var grid = null;
var checker = null;
var quotaPie = null;
var usingPie = null;

var GridCfgBase = {
	usePagination: false,
	tools : {
		buttons: ["add", "delete"],
		type : "group",
		search : true,
		upload : false
	}
};
var GridCfgs = {
	current : {
		clz : "groupGrid",
		columns :[ "_checkbox", "_no", "groupName", "quota", "using", "taskNum"]
	},
	node : {
		clz : "groupUserGrid",
		columns : ["_checkbox", "_no", "userName", "quota", "using", "taskNum"]
	}
};

function PccPie(cfg){
	var el = $X($XP(cfg, "container", "body"));
	var key = $XP(cfg, "key", "pie");
	var title = $XP(cfg, "title", "数据饼图");
	var groupChart = echarts.init(el);
	var defaultOption = {
	    tooltip: {
	        trigger: 'item',
	        formatter: "{b}: {c} ({d}%)"
	    },
	    color: ["#1ce4c1", "#4bcdf2", "#f6c570", "#f34e79", "#c96eb9"],
	    title: {
	    	text: title,
	    	left: "center"
	    },
	    series: [{
            name: key,
            type:'pie',
            radius: ['45%', '70%'],
            itemStyle: {
            	normal: {
            		borderColor: "#fff",
            		borderWidth: 2
            	}
            }
	    }]
	};
	function _getOption(data){
		var maxValue = $XP(data, "maxQuota", {});
		var optionKey = key;
		var arr = IX.map(data.items, function(item, idx){
			var value = item[optionKey];
			maxValue -= value;
			return {value: value, name: item.name + ":" + value};
		});
		if (maxValue > 0) {
			arr.unshift({
				value: maxValue, 
				name: "未使用:" + maxValue
			});
			if (!IX.Array.isFound("#d4d4d4", defaultOption.color))
				defaultOption.color.unshift("#d4d4d4");
		} else {
			if (IX.Array.isFound("#d4d4d4", defaultOption.color))
				defaultOption.color.shift();
		}
		defaultOption.series[0].data = arr;
		return defaultOption;
	}
	return {
		show: function(data){
			groupChart.setOption(_getOption(data));
		},
		refresh: function(data){
			var option = IX.inherit({animation: false}, _getOption(data));
			groupChart.setOption(option);
		}
	};
}

function addOrEditGrid(isNode, rowModel, rowEl, isAdd){
	var html = t_groups.renderData("", {
		titleName : isNode ? "用户名称:" : "群组名称:",
		groupName : rowModel ? rowModel.get("name") : "",
		quota : rowModel ? rowModel.get("quota") : ""
	});
	var id = jQuery(".group-name").attr("data-id");
	var cfg4Dialog = !isNode ? (isAdd ? {name: "新建群组", 
			callerName: "addGroup", params: {}} : {name: "编辑群组", 
			callerName: "editGroup", params: {id: rowModel.get("id")}}) : (isAdd ? {name: "新建用户", 
			callerName: "addGroupUser", params: {id: id}} : {name: "编辑用户", 
			callerName: "editGroupUser", params: {id: id, userId: rowModel.get("id")}});
	showDialog({
		title: cfg4Dialog.name,
		content: html,
		listen : {ok : function(){
			var name = $X("groupName").value;
			var quota = $X("quotaId").value;
			if (IX.isEmpty(name && quota)) return;
			caller(cfg4Dialog.callerName, IX.inherit({name: name, 
				quota: quota}, cfg4Dialog.params), function(){
				hideDialog();
				grid.refresh();
			});
		}}
	});
}

function renderBody(isNode, gridCfg, groupName, groupId){
	$X('body').innerHTML = t_page.renderData("", {
		clz : isNode ? "showNode" : "title-disabled",
		id : groupId,
		groupName :  groupName
	});
	PCC.GridTools.showTools("gridTools", gridCfg.tools, {});
}

function _checkFn(cbFn){
	grid.refresh();
	cbFn();
}

function showGroup(cbFn, rowId){
	var isNode = (rowId !== undefined && rowId !== 0);
	var gridCfg = IX.inherit(GridCfgBase, GridCfgs[isNode ? "node" : "current"]);
	if (isNode) {
		if (grid) {
			renderBody(isNode, gridCfg, grid.getModel().getRow(rowId).get("name"), rowId);
		} else {
			caller("getGroupName", {id: rowId}, function(data){
				renderBody(isNode, gridCfg, data, rowId);
			});
		}
	} else {
		renderBody(isNode, gridCfg, "", "");
	}
	function deletedNodes(name, params, cbFn){
		caller(name, params, function(){
			grid.refresh();
			cbFn();
		});
	}

	grid = new PCC.Grid.NVGrid(IX.inherit(gridCfg, {
		container : "gridContainer",
		actions : [["edit", "编辑", function(rowModel, rowEl){
			addOrEditGrid(isNode, rowModel, rowEl, false);
		}], ["delete", "删除", function(rowModel){
			pccDialog.confirm("删除", "确认删除" + rowModel.get("name")+"吗？", function(cbFn){
				var name = isNode ? "deleteGroupUsers" : "deleteGroups";
				var params = isNode ? {id: rowId, ids: [rowModel.getId()]} : {ids : [rowModel.getId()]};
				deletedNodes(name, params, cbFn);
			});
		}]],
		dataLoader : function(params, cbFn){
			var name = isNode ? "getGroupUsers" : "getGroups";
			var param = isNode ? {id: rowId} : {};
			caller(name, IX.inherit(params, param), function(data){
				cbFn(data);
				$X("gridContainer").style.height = "250px";
				if (!quotaPie) {
					quotaPie = new PccPie({
						container: "quota",
						key: "quota",
						title: "资源分配情况"
					});
					quotaPie.show(data);
				} else {
					quotaPie.refresh(data);
				}
				
				if (!usingPie) {
					usingPie = new PccPie({
						container: "using",
						key: "using",
						title: "资源使用情况"
					});
					usingPie.show(data);
				} else {
					usingPie.refresh(data);
				}
			});
		},
		clickOnRow : function(rowId, cellName, cellEl){
			if ($XH.hasClass(document.body, "group-user"))
				return;
			ixwPages.load(ixwPages.createPath("group-user", {id : rowId}));
		},
		onselect : function(){
			var ids = [];
			IX.map(grid.getSelectedRows(), function(rowModel){
				if(rowModel) ids.push(rowModel.getId());
			});
			PCC.GridTools.enableTools("gridTools",ids.length>0);
		}
	}));
	PCC.Grid.currentGrid = {
		"delete" : function(){
			var ids = [];
			IX.map(grid.getSelectedRows(), function(rowModel){
				if (rowModel)
					ids.push(rowModel.getId());
			});
			pccDialog.confirm("删除", "确认删除这"+ids.length+"个吗？", function(cbFn){
				var name = isNode ? "deleteGroupUsers" : "deleteGroups";
				var params = isNode ? {id: rowId, ids: ids} : {ids : ids};
				deletedNodes(name, params, cbFn);
			});
		},
		add : function(){
			addOrEditGrid(isNode, "", "", true);
		}
	};
	PCC.Env.onResize4Body();
	grid.show(/*function(){
		updateGridInterval = setInterval(grid.refresh, 5000);
	}*/);
	checker = new PeriodicChecker(_checkFn);
	checker.start();
	cbFn();
}
function switchOut(currentContext, nextContext){
	quotaPie = null;
	usingPie = null;
	if (checker) checker.stop();
}

IX.ns("PCC.Group");	
PCC.Group.init = function(pageCfg, pageParams, cbFn){
	pageCfg.switchOut = switchOut;
	switch (pageCfg.name) {
		case "groups":
			showGroup(cbFn);
			break;
		case "group-user":
			showGroup(cbFn, pageParams.id);
			break;
	}
};
})();
(function () {
var caller = PCC.Global.logCaller;
var pccDialog = NV.Dialog;

var t_page = new IX.ITemplate({tpl: [
'<div id="gridTools" class="grid-tools"></div>',
'<div id="gridContainer"></div>',
'']});

function refreshGrid(grid,pageNo){
	var body = document.documentElement;
	var screenY = body.clientHeight - $X('gridContainer').offsetTop;
	var screenX = body.clientWidth - 280;
	jQuery(".ixw-grid").addClass("opcity");
	$X('refreshLoading').style.top = screenY/2-24 + "px";
	$X('refreshLoading').style.left = screenX/2 -24  + "px";
	$XH.removeClass($X('refreshLoading'), "hide");
	grid.refresh(pageNo);
}

function switchOut(){
	
}

function showLog(cbFn){
	$X("body").innerHTML = t_page.renderData("", {});
	var toDate = new Date().getTime();
	var dtpDate = {
		from : toDate - 90*24*60*60*1000,
		to: toDate
	};
	var options = IX.inherit({status: -1}, dtpDate);
	var tools = {
		buttons: ["handle"],
		type : "log",
		search : true,
		dpt : true,
		filter : ["status"]
	};
	var grid = new PCC.Grid.NVGrid({
		clz : "logGrid",
		columns : [ "_checkbox","_no", "alarmDetail", "alarmStatus", "alarmDate"],
		tools : tools,
		container : "gridContainer",
		dataLoader : function(params, cbFn){
			caller("getLogs", IX.inherit(params, options), cbFn, function(){
				switchOut();
			});
		},
		onselect : function(){
			var ids = [];
			IX.map(grid.getSelectedRows(), function(rowModel){
				if(!rowModel.get("status")) ids.push(rowModel.getId());
			});
			PCC.GridTools.enableTools("gridTools",ids.length>0);
		}
	});
	PCC.Grid.currentGrid = {
		handle: function(){
			var ids = [];
			IX.map(grid.getSelectedRows(), function(rowModel){
				if(!rowModel.get("status"))
					ids.push(rowModel.getId());
			});
			pccDialog.confirm("处理报警", "确认处理这些报警吗？", function(cbFn){
				caller("handleAlarms", {ids : ids}, function(){
					grid.setSelectedIdsNull();
					grid.refresh();
					pccDialog.hide();
				});
			});
		},
		filter : function(_options){
			var type = $XP(_options, "type", "");
			var value = $XP(_options, "key", "");
			options[type] = value;
			refreshGrid(grid,0);
		},
		"dtp-filter": function(){
			IX.iterate(arguments, function(date){
				var type = $XP(date, "type", "");
				var value = $XP(date, "key", "");
				options[type] = value;
			});
			refreshGrid(grid,0);
		}
	};
	PCC.GridTools.showTools("gridTools", tools, IX.inherit({
		status: []
	}, dtpDate), "history");
	PCC.Env.onResize4Body();
	grid.show(/*function(){
		updateGridInterval = setInterval(grid.refresh, 5000);
	}*/);
	cbFn();
}
IX.ns("PCC.Log");
PCC.Log.init = function(pageCfg, pageParams, cbFn){
	pageCfg.switchOut = switchOut;
	PCC.Env.clearAlarmNum();
	showLog(cbFn);
};
})();
(function () {
var isFoundInArray = IX.Array.isFound;
var ixwPages = IXW.Pages;
var ixwActions = IXW.Actions;
var overviewTransform = IX.CSSVendorName + 'transform:scale({deg});';
var caller = PCC.Global.sysCaller;
var checker = null;
var audioEl = null;
var count = 0;

var t_page = new IX.ITemplate({tpl: [
	'<div class="topnav">',
		'<div class="l logo"><a href="#" class="pic-logo">',
			'<span>视频云计算</span>',
		'</a></div>',
		'<div class="r">',
			'<a class="link hide" data-href="{}"><span class="pic-message"></span></a>',
			'<a class="link" data-href="{alarmHref}"><span class="pic-alarm"></span><span class="num">{alarmNum}</span><audio id="audio" src="{src}"></audio></a>',
			'<a class="link open" data-href="$pcc.toggleVoice" data-key="open"><span class="pic-voice"></span></a>',
			'<a class="profile"><span class="pic-avatar"></span><span class="text">{username}</span></a>',
			'<span class="rborder"></span>',
			'<a class="link" data-href="$logout"><span class="logout"></span></a>',
		'</div>',
	'</div>',
	'<nav>',
		'<ul class="top">','<tpl id="nav">','<li id="nav-{name}" class="{clz}">',
			'<a data-href="{navHref}">',
				'<span class="nav-{name}"></span><span>{text}</span><span class="r ico-arrow"></span>',
			'</a>',
		'</li>','</tpl>','</ul>',
		'<div class="copyright">',
			'<span>当前版本号：1.0</span>',
		'</div>',
	'</nav>',
	'<div id="body"></div>',
	'<div class="pg-footer"></div>',
'']});

var isLogout = false;
function SessionManager(data){
	var sessionData = data;
	var userName = $XP(data, "name", "");
	var userId = $XP(data, "id", null);
	var enabledModules = $XP(data, "modules", []);

	return {
		hasAuth : function(){return userId !== null;},
		getUserName : function(){return userName;},
		getUserId : function(){return userId;},
		isLogout : function(){return isLogout;},
		checkIfModuleEnabled : function(module){ return isFoundInArray(module, enabledModules);}
	};
}
var sessionMgr = new SessionManager();

var NavItems = [
["overview", "系统概况"],
["nodes",  "计算节点"],
["jobs",   "作业服务"],
["algorithms",   "算法模块"],
["groups",   "群组用户"],
// ["statics",   "统计分析"],
["logs",   "系统日志"]
];
var DefaultNav = "nodes";
function NavManager(focusedNavName){
	var focused = focusedNavName || DefaultNav;
	function _getNavItemTplData(name, item){
		return {
			name : name,
			text : item[1],
			clz : (focused == name ? "active": ""),
			navHref : ixwPages.createPath(name)
		};
	}
	function _focus(itemName){
		if (itemName !=="overview"){
			var lastChar = itemName.charAt(itemName.length-1);
			if (lastChar !== "s") itemName = itemName + "s";//作用是得到class为active的nav(详情页返回的itemName都是去掉s后的)
		}
		var el = $X('nav-' + itemName) ;
		if (itemName == focused || !el)
			return;
		$XH.removeClass($X("nav-" + focused), "active");
		focused = itemName;
		$XH.addClass(el, "active");
	}

	function enableHover(){
		jQuery("nav li").hover(function(){
			$XH.addClass(this, "hover");
		}, function(){
			$XH.removeClass(this, "hover");
		});
	}

	return {
		getRenderData : function(){ return IX.loop(NavItems, [], function loopNavItem(acc, item){
			var name = item[0];
			/*if (name == "home" || sessionMgr.checkIfModuleEnabled(name))*/
				acc.push(_getNavItemTplData(name, item));
			return acc;
		});},
		enableHover : enableHover,
		focus : _focus
	};
}
var navMgr = new NavManager();

function clearSession(){
	sessionMgr = new SessionManager();
	isLogout = true;
	IXW.Pages.load("entry");
}
function startSession(data){
	sessionMgr = new SessionManager(data);
	var alarmNum = 0;
	document.body.innerHTML = t_page.renderData("",{
		nav : navMgr.getRenderData(),
		alarmHref : ixwPages.createPath("logs"),
		src : PCC.Global.alertorUrl,
		alarmNum : alarmNum,
		username : $XP(data, "name", "")
	});
	/*caller("getPrompt", {},function(promptData){
		alarmNum = $XP(data, "alarmNum", 0);
		var numEl = jQuery(".topnav .num");
		numEl.html(alarmNum);
		numEl[alarmNum ? "removeClass" : "addClass"]("hide");
	});*/
	navMgr.enableHover();
	function _checkerFn(cbFn){
		caller("getPrompt", {}, function(data){
			var alarmNum = $XP(data, "alarmNum", 0);
			var numEl = jQuery(".topnav .num");
			numEl.html(parseInt(alarmNum) + count);
			if (alarmNum && jQuery(".topnav .open").length > 0 && audioEl) {
				audioEl.play();
				setTimeout(function(){audioEl.pause();}, 1000);
			}
			cbFn();
		}, function(){
			checker.stop();
		});
	}
	if (!checker)
		checker = new PCC.Util.PeriodicChecker(_checkerFn, 1000);
	checker.start();
}
function switchout(){

}
var PagesConfiurations = IX.map([
//{type?, name+, path?, bodyClz?, needAuth?},
{type: "ErrPage", name: "401", bodyClz: "exception", needAuth : false},
{type: "ErrPage", name: "404", bodyClz: "exception", needAuth : false},

{name: "overview", isDefault: true, bodyClz:"overview"},

{type: "Node", name: "nodes", bodyClz:"nodes"},
{name: "node-info", path: "node/{id}/info", bodyClz : "nodeInfo"},
{name: "node-job", path: "node/{id}/jobs", bodyClz : "nodeJob"},
{name: "node-service", path: "node/{id}/services", bodyClz:"nodeService"},
{name: "node-monitor", path: "storagenode/{id}/monitor", bodyClz: "nodeMonitor"},

{type: "Job", name: "jobs", bodyClz:"job-current"},
{name: "job-current", path: "job/currentJobs",bodyClz:"currentJob"},
{name: "job-current-node", path: "job/current/{id}/nodes",bodyClz:"node"},
{name: "job-current-param", path: "job/current/{id}/param",bodyClz:"param"},
{name: "job-history", path : "job/historyJobs", bodyClz:"job-history"},
{name: "job-history-node", path: "job/history/{id}/nodes",bodyClz:"node"},
{name: "job-history-param", path: "job/history/{id}/params",bodyClz:"param"},
{name : "job-service", path : "job/services", bodyClz:"service-service"},
{name : "job-service-node", path : "job/service/{id}/nodes", bodyClz:"node"},

{type: "Algorithm", name: "algorithms", bodyClz:"algorithm"},
{name: "algorithm-node", path: "algorithm/{id}", bodyClz:"algorithm-node"},
{name: "algorithm-node-details", path: "algorithm/{id}/node/{nodeId}", bodyClz:"algorithm-node-details"},

{type: "Group", name: "groups", bodyClz:"group"},
{name: "group-user", path: "group/{id}", bodyClz:"group-user"},

/*{type: "Stat", name: "statics"},

{name : "log-msg", path : "log/msg", bodyClz:"msg"},
{name : "log-operation", path : "log/operation", bodyClz:"operation"},*/
{type: "Log", name: "logs", bodyClz:"logs"},

{name: "entry", bodyClz: "entry", needAuth : false}
], function(item){
	var name = item.name;
	var moduleName = name.split("-")[0];
	var className = item.type || moduleName.capitalize();
	return IX.inherit({
		initiator : "PCC." + className + ".init",
		path : name,

		nav : "service",
		navItem : moduleName,

		needAuth : true
	}, item);
});

ixwActions.configActions([["logout", function(){
	if (!window.confirm("确认是否退出?"))
		return;
	//CCS.Global.entryCaller("logout", {}, function(){
		PCC.Entry.clearCookie();
		clearSession();
		switchout();
	//});
}], ["pcc.toggleVoice", function(params, el){
	if($XH.hasClass(el,"open")){
		$XH.removeClass(el,"open");
		$XH.addClass(el,"mute");
	}else if($XH.hasClass(el,"mute")){
		$XH.removeClass(el,"mute");
		$XH.addClass(el,"open");
	}
}]]);

function loadSession(pageFn){
	//CCS.Global.commonCaller("session", {}, function(data){
		//if (!data || !data.id)
			//return ixwPages.load("entry");
		//startSession(data);
		//pageFn();
	//});
	if(!jQuery.cookie("account"))
		return ixwPages.load("entry");
	startSession({id : 1, name : jQuery.cookie("account")});
	pageFn();
}
function onResize4Body(){
	var bodyHeight =document.documentElement.clientHeight;
	var height = 0;
	var bodyWidth = document.documentElement.clientWidth;
	var bodyPadding = 0, topnavH = 50, cardH = 48;
	if($X('gridContainer')){
		var infoH = 125, pathH = 50, toolH = 55, pgH = 45;
		if($XH.first($XD.first($X('body'), "div"), "info")){
			if($XH.hasClass($X('gridContainer'), "nobuttonPage")){
				cardH = 68;
				height = bodyHeight-pathH -topnavH - infoH - cardH  - pgH;
				jQuery("#gridContainer").height(height + pgH);
			}else{
				height = bodyHeight -topnavH-pathH - infoH - cardH - toolH  - pgH ;
				jQuery("#gridContainer").height(height  + pgH);
			}
		}else{
			toolH = 69;pathH = 0;
			height = bodyHeight -topnavH-pathH- toolH-40 -70;
			jQuery("#gridContainer").height(height+ pgH);
		}
		if($XH.first($X('gridContainer'), "nv-grid")){
			jQuery("#gridContainer").height("auto");
			var grid = jQuery("#body .ixw-grid");
			if(jQuery("#itemList").height() < height-44){
				grid.height(height);
			}else{
				grid.height("auto");
			}
		}
	}else if($XH.first($X('body'), "p_stat")){
		height = bodyHeight - topnavH - bodyPadding - cardH;
		if(height < 570) height = 570;
		jQuery($XH.first($XH.first($X('body'), "p_stat"), "active")).height(height);
	}
}
function onScroll4Body(){
	if($X('compare')){
		var scrollLeft = $Xw.getScreen().scroll[0];
		if(scrollLeft){
			jQuery(".detail-time").css({left:-scrollLeft + "px"});
		}else{
			jQuery(".detail-time").css({left:0});
		}
	}
}
IX.ns("PCC.Env");
PCC.Env.init = function(){
	ixwPages.listenOnClick(document.body);
	ixwPages.configPages(PagesConfiurations, function(pageName, pageCfg){
		return !$XP(pageCfg, "needAuth", true) || sessionMgr.hasAuth();
	});

	IXW.Navs.register("service", function(cfg){
		navMgr.focus(cfg.navItem || "");
	});

	loadSession(function(){
		ixwPages.start();
	});
};
PCC.Env.isMe = function(userId){return userId === sessionMgr.getUserId();};
PCC.Env.isLogout = function(){return sessionMgr.isLogout();};
PCC.Env.reloadSession = function(){
	loadSession(function(){
		ixwPages.reload();
	});
};
PCC.Env.clearSession = clearSession;
PCC.Env.hasSession = function(){return sessionMgr.hasAuth();};
PCC.Env.resetSession = function(data){startSession(data);};
PCC.Env.clearAlarmNum = function(){
	count = 0;
	jQuery(".topnav .num").html(count);
};
PCC.Env.onResize4Body = onResize4Body;

var appInitialized = false;
PCC.init = function(){
	if (appInitialized)
		return;
	appInitialized = true;
	$Xw.bind({"resize" : onResize4Body});
	$Xw.bind({"scroll" : onScroll4Body});
	PCC.Env.init();
};
})();