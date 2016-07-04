(function(){
IX.ns("Test");
function convertTickToDate(tick){return new Date(tick*1000);}
var formatDate = function(tick, withTime){
	if (!tick)
		return "";
	return IX.Date.format(convertTickToDate(tick), withTime?"":"Date");
};
function getPagedData(arr, pageNo, pageSize){
	return {
		total : arr.length,
		items : IX.partLoop(arr, pageNo* pageSize, pageNo*pageSize + pageSize, [], function(acc, item){
			// item.status =randomInt(2);
			acc.push(item); return acc;
		})
	};
}
function randomInt(maxV){return Math.floor(Math.random()*maxV);}
var startTime = 1422000000000;
var storageNode = [];
var jobs = [];
var jobs4Node = [];
var services = [];
var nodes4Job = [];
var nodes4Service = [];
var channel = [];
var segment = [];
var log = [];

var algorithms = [{id : 1, name : "视频摘要"}, {id : 0, name : "区域入侵"}];
var groups = [{id : 1, name : "ICP"}, {id : 0, name : "PVA"},  {id : 3, name : "PVD"}];


//storageNode
for (i=0; i<25; i++){
	var status = Math.floor(Math.random()*100) % 2;
	storageNode.push({
		id :  "storageNode-"+i,
		_no : i<9 ? "0" +(i+1):(i+1),
		name : "节点"+ (i+1),
		ip : "192.168.18." + i,
		os : "windows",
		cpu : {total : 100, usable : 80, used : 50, percent : Math.floor(Math.random()*100)},
		mem : {total: 102400*1024, used: Math.floor(Math.random()*102400*1024)},
		gpu : {hasGpu : status, percent : Math.floor(Math.random()*100)},
		flow : {flowT : 200, flowR : 300},
		joinTime : startTime + + i * 10000000,
		status : status == 1? 0: 1
	});
}
var NumOfClusters = storageNode.length;
//jobs4Node
for(i=0; i< 10; i++){
	var taskInfo=[];
	for(var j=0; j<randomInt(5)+1; j++){
		taskInfo.push({
			taskNum : "000" + j,
			process : Math.floor(Math.random()*100),//{isPercent : j%2==0? 1 : 0, percent : "30%"},
			resource : 2,
			mem : 1000,
			dealTime : 1000
		});
	}
	jobs4Node.push({
		id : "task-" +i,
		_no : i<9 ? "0" +(i+1):(i+1),
		name : "作业" + i,
		tasks : taskInfo,
		algorithm : "视频摘要及索引",
		group : ["ICP","PVA","PVD"][Math.floor(Math.random()*3)],
		user : "用户" + i
	});
}
//servcies
for(i=0; i< 15; i++){
	services.push({
		id : "servcie-" + i,
		_no : i<9 ? "0" +(i+1):(i+1),
		name : "服务"+ i,
		handleNum : i,
		waitNum : i + randomInt(10)
	});
}
//jobs
for(i=0; i<23; i++){
	jobs.push({
		id : "job-"+i,
		_no : i<9 ? "0" +(i+1):(i+1),
		name : "作业"+i,
		process : [Math.floor(Math.random()*100), -1, -2][Math.floor(Math.random()*3)],
		priority : [0, 1, 2][Math.floor(Math.random()*3)],
		status : i%3 ===2 ? 1 : 0,
		submitTime : startTime + + i * 10000000,
		waitTime : randomInt(4500000000),
		handleTime : randomInt(4500000000),
		resource : [randomInt(30), -1][Math.floor(Math.random()*2)],
		algorithm : "区域入侵",
		group : "PVA",
		user : "用户" + i
	});
}
var jobsLen = jobs.length;
//nodes4Job
for(i=0; i< 10; i++){
	var taskInfo=[];
	for(var j=0; j<randomInt(5)+1; j++){
		taskInfo.push({
			taskNum : "000" + j,
			process : Math.floor(Math.random()*100),//{isPercent : j%2==0? 1 : 0, percent : "30%"},
			resource : 2,
			mem : 1000,
			dealTime : 1000
		});
	}
	nodes4Job.push({
		id : "task-" +i,
		_no : i<9 ? "0" +(i+1):(i+1),
		name : "作业" + i,
		ip : "192.168.0"+i,
		tasks : taskInfo
	});
}
//nodes4Service
for(i=0; i< 10; i++){

	nodes4Service.push({
		id : "node-" +i,
		_no : i<9 ? "0" +(i+1):(i+1),
		name : "计算节点" + i,
		handleNum :Math.floor(Math.random()*100),
		waitNum : Math.floor(Math.random()*100),
	});
}

//segment
for(i=0;i<80;i++){
	segment.push({
		id : "segment-" +i,
		_no : i<9 ? "0" +(i+1):(i+1),
		name : "锁定录像"+i,
		size : "30M",
		frameCount : 5,
		beginTime : startTime + + i * 10000000,
		endTime : startTime + + i * 10000000,
		period : 24 *3600000 + 600000 * i
	});
}
//log
for (i=0; i<50; i++)
	log.push({
		id :  "log"+i,
		_no : i<9 ? "0" +(i+1):(i+1),
		type : i %3 ? "alarm" : i%2 ? "msg" : "operation",
		detail : "操作详情操作详情操作详情操作详情操作详情操作详情操作详情操作详情操作详情操作详{1}情操作详情操作详情操作详情操作详情"+i + "{124444444444444334}",
		date: startTime + i * 10000,
		user:{id : 1,name : "张无忌"}
	});
Test.listStorageNodes = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 35;
	var _storageNode = IX.loop(storageNode, [], function(acc, item){
			acc.push(item);
		return acc;
	});
	return getPagedData(_storageNode, pageNo, pageSize);
};
Test.deleteStorageNodes = function(params){
	var ids = [];
	IX.iterate(params.ids, function(id){
		storageNode = IX.Array.remove(storageNode, id, function(a,b){
			if (a == b.id ) 
				ids.push(a);
			return (a == b.id);
		});
	});
	return;
};
Test.getNodeInfo = function(params){
	var id = params.id.split("-")[1];
	return {
		name : storageNode[id].name,
		cpuType : "333ss",
		cpuClockSpeed : "2.5GHZ",
		cpu : "4核/8线程",
		mem : "4GB",
		os : "windows Server 2008",
		broadband : "100Mbps",
		addTime : "2016-06-06 16:23:30"
	};
};
Test.getNodeName = function(params){
	var id = params.id.split("-")[1];
	return 	 storageNode[id].name;
};
Test.listJobs4Node = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 35;
	var _jobs4Node = IX.loop(jobs4Node, [], function(acc, item){
			acc.push(item);
		return acc;
	});
	return getPagedData(_jobs4Node, pageNo, pageSize);
};
Test.listServices4Node = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 35;
	var _services = IX.loop(services, [], function(acc, item){
			acc.push(item);
		return acc;
	});
	return getPagedData(_services, pageNo, pageSize);
};
Test.getAlgoAndGroup = function(){
	return IX.clone({
		"algorithm" : algorithms,
		"group" : groups
	});
};
Test.getAlgoritms = function(){
	return {
		"algorithm" : [].concat(algorithms[1], algorithms[2])
	};
};
Test.listJobs = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 35;
	var _jobs = IX.loop(jobs, [], function(acc, item){
			acc.push(item);
		return acc;
	});
	return getPagedData(_jobs, pageNo, pageSize);
};
Test.addJob = function(params){
	jobs.push({
		id : "job-"+jobsLen,
		_no : jobsLen,
		name : "作业"+jobsLen,
		process : [Math.floor(Math.random()*100), -1, -2][Math.floor(Math.random()*3)],
		priority : [0, 1, 2][Math.floor(Math.random()*3)],
		status : i%3 ===2 ? 1 : 0,
		submitTime : startTime + + i * 10000000,
		waitTime : randomInt(4500000000),
		handleTime : randomInt(4500000000),
		resource : [randomInt(30), -1][Math.floor(Math.random()*2)],
		algorithm : "区域入侵",
		group : "PVA",
		user : "用户" + i
	});
};
Test.listNodes4Job = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 35;
	var _nodes4Job = IX.loop(nodes4Job, [], function(acc, item){
			acc.push(item);
		return acc;
	});
	return getPagedData(_nodes4Job, pageNo, pageSize);
};
Test.listNodes4Service = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 35;
	var _nodes4Service = IX.loop(nodes4Service, [], function(acc, item){
			acc.push(item);
		return acc;
	});
	return getPagedData(_nodes4Service, pageNo, pageSize);
};
Test.getJobName = function(params){
	var id = params.id.split("-")[1];
	return jobs[id].name;
};
Test.getJobNameAndProcess = function(params){
	var id = params.id.split("-")[1];
	return {
		name : jobs[id].name,
		process : jobs[id].process
	};
};
Test.getServiceName = function(params){
	var id = params.id.split("-")[1];
	return services[id].name;
};
Test.listLogs = function(params){
	var type = params.type,
		from = params.from || null,
		to = params.to || null;

	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 35;
	var _log = IX.loop(log, [], function(acc, item){
		if ((item.type == type) &&(!from || item.date >= from) && (!to  || item.date <= to)) 
			acc.push(item);
		return acc;
	});
	return getPagedData(_log, pageNo, pageSize);
};
Test.getPrompt = function(params){
	return {
		alarmNum : 0,
   		msgNum : 6
	};
};

/*Algorithm & Group   --by yezhi*/
var AlgorithmsHT = IX.IListManager();
IX.iterate("0".multi(50).split(""), function(item, idx){
	var obj = {
		id : "算法组名称-" +idx,
		_no : idx<9 ? "0" +(idx+1):(idx+1),
		name : "算法组名称"+idx,
		algorithmNums : Math.floor(Math.random() * idx) + 3
	};
	var nodeHT = IX.IListManager();
	IX.iterate("0".multi(obj.algorithmNums).split(""), function( _item, _idx){
		var occ = {
			id: "" + _idx,
			_no: _idx<9 ? "0" +(_idx+1):(_idx+1),
			name: "算法名称"+_idx,
			version: "1." + (_idx<9 ? "0" +(_idx+1):(_idx+1)),
			fileName: "算法文件"+IX.id()+".npkf",
			algorithmDetails: ("详情"+_idx).multi(100)
		};
		nodeHT.register(occ.id, occ);
	});
	obj.numOptions = nodeHT;
	AlgorithmsHT.register(obj.id, obj);
});
Test.getAlgorithms = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 20;
	return getPagedData(AlgorithmsHT.getAll(), pageNo, pageSize);
};
Test.getAlgorithmNodes = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 20;
	return getPagedData(AlgorithmsHT.get(params.id).numOptions.getAll(), pageNo, pageSize);
};
Test.getAlgorithmName = function(params){
	return AlgorithmsHT.get(params.id).name;
};
Test.deleteAlgorithms = function(params){
	IX.iterate(params.ids, function(item){
		AlgorithmsHT.remove(item);
	});
};
Test.deleteAlgorithmNodes = function(params){
	var arr = AlgorithmsHT.get(params.id).numOptions;
	IX.iterate(params.ids, function(item){
		arr.remove(item);
	});
};
Test.addAlgorithm = function(params){
	var _length = AlgorithmsHT.getAll().length;
	var obj = {
		id : "alogorithm-" +_length,
		_no : _length<9 ? "0"+(_length+1):(_length+1),
		name : params.name,
		algorithmNums : 0
	};
	AlgorithmsHT.register(obj.id, obj);
};
Test.editAlgorithm = function(params){
	var obj = AlgorithmsHT.get(params.id);
	obj.name = params.name;
	AlgorithmsHT.unregister(obj.id);
	AlgorithmsHT.register(obj.id, obj);
};
Test.addAlgorithmNode = function(params){
	var node = AlgorithmsHT.get(params.id);
	var nodeHT = node.numOptions;
	var newId = nodeHT.getAll().length;
	nodeHT.register(newId, {
		id : newId,
		_no: newId<9 ? "0" +(newId+1):(newId+1),
		name: params.name,
		version: "1." + (newId<9 ? "0" +(newId+1):(newId+1)),
		fileName: "算法文件"+IX.id()+".npkf"
	});
};
Test.editAlgorithmNode = function(params){
	var node = AlgorithmsHT.get(params.id);
	var nodeHT = node.numOptions;
	var cloneNode = nodeHT.get(params.nodeId);
	nodeHT.unregister(params.nodeId);
	nodeHT.register(params.nodeId, IX.inherit(cloneNode, {
		name: params.name,
		fileName: "算法文件"+IX.id()+".npkf"
	}));
};
Test.getAlgorithmDetails = function(params){
	var node = AlgorithmsHT.get(params.nodeId);
	var nodeHT = node.numOptions;
	var nodeDetails = nodeHT.get(params.id);
	return {
		algorithmName: nodeDetails.name,
		algorithmNodeName: node.name,
		algorithmDetails: nodeDetails.algorithmDetails
	};
};

var GroupsHT = IX.IListManager();
function newData4Groups(){
	IX.iterate("0".multi(5).split(""), function(item, idx){
		var quota = [32, 36, 25, 20, 30][idx];
		var obj = {
			id : "group-" +idx,
			_no : idx<9 ? "0" +(idx+1):(idx+1),
			name : "群组名称"+idx,
			quota : quota,
			using : quota - Math.floor(Math.random() * 5),
			taskNum : Math.floor(Math.random() * 5) + 1,
			groupUsers : Math.floor(Math.random() * idx) + 2
		};
		var UsersHT = IX.IListManager();
		IX.iterate("0".multi(obj.groupUsers).split(""), function( _item, _idx){
			var occ = {
				id: "" + _idx,
				_no: _idx<9 ? "0" +(_idx+1):(_idx+1),
				name: "用户"+_idx,
				quota: quota,
				using: Math.floor(quota) - 5,
				taskNum : Math.floor(Math.random() * 6)
			};
			UsersHT.register(occ.id, occ);
		});
		obj.numOptions = UsersHT;
		GroupsHT.register(obj.id, obj);
	});
}
newData4Groups();
Test.getGroups = function(params){
	newData4Groups();
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 20;
	return IX.inherit({maxQuota: 183}, getPagedData(GroupsHT.getAll(), pageNo, pageSize));
};
Test.getGroupUsers = function(params){
	newData4Groups();
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 20;
	var group = GroupsHT.get(params.id);
	return IX.inherit({maxQuota: 183}, getPagedData(group.numOptions.getAll(), pageNo, pageSize));
};
Test.getGroupName = function(params){
	return GroupsHT.get(params.id).name;
};

Test.deleteGroups = function(params){
	IX.iterate(params.ids, function(item){
		GroupsHT.remove(item);
	});
};
Test.deleteGroupUsers = function(params){
	var arr = GroupsHT.get(params.id).numOptions;
	IX.iterate(params.ids, function(item){
		arr.remove(item);
	});
};
Test.addGroup = function(params){
	var _length = GroupsHT.getAll().length;
	var obj = {
		id : "group-" +_length,
		_no : _length<9 ? "0"+(_length+1):(_length+1),
		name : params.name,
		quota : params.quota,
		using : 0,
		taskNum : 0,
		groupUsers : 0
	};
	GroupsHT.register(obj.id, obj);
};
Test.editGroup = function(params){
	var obj = GroupsHT.get(params.id);
	obj.name = params.name;
	obj.quota = params.quota;
	GroupsHT.unregister(obj.id);
	GroupsHT.register(obj.id, obj);
};
Test.addGroupUser = function(params){
	var node = GroupsHT.get(params.id);
	var nodeHT = node.numOptions;
	var newId = nodeHT.getAll().length;
	nodeHT.register(newId, {
		id : newId,
		_no: newId<9 ? "0" +(newId+1):(newId+1),
		name: params.name,
		quota: params.quota,
		using: 0,
		taskNum : 0
	});
};
Test.editGroupUser = function(params){
	var node = GroupsHT.get(params.id);
	var nodeHT = node.numOptions;
	var cloneNode = nodeHT.get(params.userId);
	nodeHT.unregister(params.userId);
	nodeHT.register(params.userId, IX.inherit(cloneNode, {
		name: params.name,
		quota: params.quota
	}));
};


/**------  overview -----*/
var allCpu = 400;
var allMem = 500;
var allNode = 800;
var arr = [];
for (var i = 60; i >= 0; i--) {
	arr.push(i);
}
function random4Use(num, now){
	return IX.map(arr, function(item, idx){
		var random = Number((idx%3 ==1 ? "+" : "-") + Math.round(Math.random() * 100));
		var fault = Math.round(Math.random() * 20);
		var mean = Math.round(num / 5);
		return {
			all : num + random,
			used : num + random - mean *2 ,
			free : mean * 2 - fault,
			fault : fault,
			time : new Date(now - 1000 * item).getTime()
		};
	});
}
function random4Two(type, key1, key2, now){
	return IX.map(arr, function(item, idx){
		var obj = {};
		if (type == "flow") {
			obj[key1] = (Math.random() * 1000).toFixed(2); 
			obj[key2] = (Math.random() * 1000).toFixed(2); 
		} else {
			obj[key1] = Math.round(Math.random() * 100);
			obj[key2] = Math.round(Math.random() * 100); 
		}
		obj.time = new Date(now - 1000 * item).toLocaleTimeString().replace(/^\D*/, "");
		return obj;
	});
}

Test.getOverView = function(){
	var now = new Date();
	return {
		cpu : IX.map(random4Use(allCpu, now), function(cpu, idx){
			cpu.usage = Math.floor(Math.random() * 90);
			return cpu;
		}),
		mem : random4Use(allMem, now)[2],
		node : random4Use(allNode, now)[2],
		flow : random4Two("flow", "up", "down", now)[2],
		job : random4Two("", "task", "work", now)[2] 
	};
};

/**---------- logs -----*/
var logs = [];
IX.iterate("o".multi(88).split(""), function(item, idx){
	logs.push({
		id : "log-" +idx,
		_no : idx<9 ? "0"+(idx+1):(idx+1),
		type: ["计算资源不足", "计算节点故障", "作业处理失败"][Math.round(Math.random()*2)],
		status : [1, 0][Math.round(Math.random()*1)],
		date : new Date()-Math.round(Math.random()*100)*1000,
		detail : ["系统存储空间已不足5%，通道“12”录像已停止", "计算节点故障,通道1计算停止","作业54处理失败"][Math.round(Math.random()*2)]
	});
});
Test.getLogs = function(params){
	var pageNo = params.pageNo || 0,
		pageSize = params.pageSize || 20;
	if (params.status === -1)
		return getPagedData(logs, pageNo, pageSize);
	else if (params.status === 0) 
		return getPagedData(IX.loop(logs, [], function(acc, log, idx){
			if (log.status === 0)
				acc.push(log);
			return acc;
		}), pageNo, pageSize);
	else 
		return getPagedData(IX.loop(logs, [], function(acc, log, idx){
			if (log.status === 1)
				acc.push(log);
			return acc;
		}), pageNo, pageSize);
};
Test.handleAlarms = function(params){
	IX.iterate(params.ids, function(id){
		IX.iterate(logs, function(log){
			if (id === log.id)
				log.status = 1;
		});
	});
};
})();
