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