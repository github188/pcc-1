(function(){
/*var url=baseUrl +"/list.json";
var data=JSON.stringify(params);
$.ajax({
	type: "GET",
	url: url,
	data: "",
	dataType:"json",
	contentType: "application/json;charset=utf-8",
	beforeSend : function(XHR){
		XHR.setRequestHeader("if-Modified-Since", "0");
	},
	success: function(msg){
		if(msg.retCode==1){
			var type = params.sortInfo.substring(5);
			if(type!==""&& $XP(msg.data, "items",[])){
				$XP(msg.data, "items",[]).sort(function(a, b){
					return $XP($XP(b, type+"Usage", {}), "used", 0) - $XP($XP(a, type+"Usage", {}), "used", 0);
				});
			}
			cbFn(msg.data);
		}else{
			commonFailFn(msg, failFn);
		}
	},
	complete : function(XHR, TS){
		XHR = null;
	},
	error:function(msg){
		CCS.Dialog.alert("报错：连接服务器异常");
		if(IX.isFn(failFn)) failFn();
	}
});
return;*/
IX.ns("PCC.Global");

var baseUrl = PCC_BaseUrl + "/sim";
var imgUrl = PCC_BaseUrl + "/src/images";

IXW.ajaxEngine.init({
	ajaxFn : jQuery.ajax,
	baseUrl : baseUrl,
	imgUrl : imgUrl
});

IXW.urlEngine.mappingUrls([
["uploadJob", "/uploadJob.html"],
["backgroundImg", "/bg.jpg", "img"],
["rightbgImg", "/right-bg.png", "img"],
["cpubgImg", "/cpu-bg.png", "img"],
["lengendImg", "/lengend.png", "img"],
["pieChartImg", "/circle.png", "img"],
["refreshImg", "/refreshLoading.gif", "img"],
["processStatusImg", "/refreshLoading.gif", "img"]
]);
PCC.Global.baseUrl = baseUrl;
PCC.Global.fileUploadUrl = IXW.urlEngine.genUrl("uploadJob");
PCC.Global.backgroundUrl = IXW.urlEngine.genUrl("backgroundImg");
PCC.Global.rightbgUrl = IXW.urlEngine.genUrl("rightbgImg");
PCC.Global.cpubgUrl = IXW.urlEngine.genUrl("cpubgImg");
PCC.Global.lengendUrl = IXW.urlEngine.genUrl("lengendImg");
PCC.Global.refreshIntervalUrl = IXW.urlEngine.genUrl("refreshImg");
PCC.Global.processStatusUrl = IXW.urlEngine.genUrl("processStatusImg");
PCC.Global.algorithmNodeFileUploadUrl = baseUrl + "/algorithmNodeFile.html";
PCC.Global.alertorUrl = imgUrl + "/alert.mp3";

IXW.ajaxEngine.mappingUrls("common", [
["session", "/sessionData.json", "", "GET", "form"]
]);

PCC.Global.entryCaller = function(name, params, cbFn, failFn){
	var remotefile = null;
	switch(name){
	case "login"://params : {username, password}
		if (params.username == "admin" && params.password == "123456")
			remotefile = baseUrl + "/sessionData.json";
		else
			remotefile = baseUrl + "/failLogin.json";
		break;
	case "logout":
		//return cbFn();
		var url=baseUrl +"/logout.json";
		$.ajax({
			type: "GET",
			url: url,
			data:"",
			dataType:"json",
			contentType: "application/json;charset=utf-8",
			beforeSend : function(XHR){
				XHR.setRequestHeader("if-Modified-Since", "0");
			},
			success: function(msg){
				//if(msg.retCode==1){

					cbFn(msg.data);
				//}else{
					//commonFailFn(msg, failFn);
				//}
			},
			complete : function(XHR, TS){
				XHR = null;
			},
			error:function(msg){
				CCS.Dialog.alert("报错：连接服务器异常");
			}
		});

		return;
	}
	IX.Net.loadFile(remotefile, function(txt){
		var ret = JSON.parse(txt);
		if (ret.retCode != 1)
			IX.isFn(failFn)?failFn(ret) : alert(ret.err);
		else
			cbFn(ret.data);
	});
};

/*CCS.Global.commonCaller = IXW.ajaxEngine.createCaller("common",[
"common-session"
]);*/
PCC.Global.commonCaller = function(name, params, cbFn, failFn){
	switch(name){
		case "session"://params : {}
			/*var url=serviceUrl +"/user/session.do";
			$.ajax({
				type: "GET",
				url: url,
				data:"",
				dataType:"json",
				contentType: "application/json;charset=utf-8",
				success: function(msg){
					if(msg.retCode==1){
						cbFn(msg.data);
					}else{
						commonFailFn(msg, failFn);
					}
				},
				complete : function(XHR, TS){
					XHR = null;
				},
				error:function(msg){
					CCS.Dialog.alert("报错：连接服务器异常");
				}
			});*/
			return cbFn({
				"id" : 1,
				"name" : "管理员"
			});
	}
};

function randomInt(maxV){return Math.floor(Math.random()*maxV);}
PCC.Global.overviewCaller = function(name, params, cbFn, failFn){
/*	xmlhttp = null;
	xmlhttp = create();
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState ==4 && xmlhttp.status == 200){
			cbFn(JSON.parse(xmlhttp.responseText).data);
			xmlhttp = null;
		}
	}*/
	switch(name){
	case "getOverView":
		/*
		params : {}
		return : {
			cpu : [{all, used, free, fault, time}]  //time: "11:42:15"
			mem : [{all, used, free, fault, time}]
			node : [{all, used, free, fault, time}]
			flow : [{down, up, time}]
			job : [{task, work, time}]
		}
		*/
		return setTimeout(function(){cbFn(Test.getOverView());},500);
	}
};
//计算节点
PCC.Global.nodeCaller = function(name, params, cbFn, failFn){
	switch(name){
	case "listNodes":
		/* 进入计算节点页面
		params :{
			pageNo, pageSize, key(搜索字符), sortInfo[{name,ifDown},...](根据那一项排序//space、ip、cpu、mem单项排序), status  //update 2015-12-31
		}
		cbFn({
			total :,
			items :[{id,_no,name,ip, cpu: {total, usable, used, percent}, mem: {total,used}, gpu{hasGpu(1/0), percent}, folw{flowT, flowR}, status},
					......]
		})
		*/
		return setTimeout(function(){cbFn(Test.listStorageNodes(params));},200);
	case "deleteStorageNodes":
		/** 删除计算节点
			params: {ids: [id1,...]}
		*/
		return cbFn(Test.deleteStorageNodes(params));
	case "getNodeInfo":
	/** 获取计算节点信息
			params: {id: nodeId}
			cbFn({name, cpuType, cpuClockSpeed, cpu, mem, os, broadband, addTime})
	*/
	return cbFn(Test.getNodeInfo(params));
	case "getNodeName":
	/** 获取计算节点名称
			params: {id: nodeId}
			cbFn(name)
	*/
	return cbFn(Test.getNodeName(params));
	case "listJobs4Node":
		/* 点击计算节点进入作业情况页面
		params :{
			id : nodeId, 
			pageNo, pageSize, sortInfo{name,ifDown}, algorithm, group		//update 2015-12-31
		}
		cbFn({
			total,
			items :[{id,_no,type, algorithm, group, user, 
				tasks: [{
					taskNum : 001,
					process : 30 (int),
					resource : 2,
					mem : 1000  (M),
					dealTime : 1000  (ms)
				},...]},
			]
		})
		*/
		return setTimeout(function(){cbFn(Test.listJobs4Node(params));},200);
	case "listServices4Node":
		/** 进入服务情况页面
			params: {
				id: nodeId, 
				pageNo, pageSize
			}
			cbFn({
				total: ,
				items: [{
					id : "servcie-" + i,
					_no : int,
					name : str,
					handleNum : int,
					waitNum : int
				},...]
			})
		*/
		return setTimeout(function(){cbFn(Test.listServices4Node(params));},200);
	case "listChannels4StorageNode": 
	/* 
		params :{
			id : storageNodeId,
			pageNo, pageSize
		}
		return :{
			total :,
			items :[{id,_no,channelName,recycle, cycleType, status},
					......]
		}
		*/
		return setTimeout(function(){cbFn(Test.listChannels4StorageNode(params));},200);
	case "getStorageNode":
		/*
		params :{
			id : storageNodeId
		}
		return : {id, name, os, cpu, ip, status}
		*/
		return setTimeout(function(){cbFn(Test.getStorageNode(params));},200);
	}
};
//作业服务
PCC.Global.jobCaller = function(name,params,cbFn,failFn){
	var paramsData = "PFS://192.168.11.118.9000/admin/admin:/IndexTest/15 沿东街北二环口20130419061200000.mbf:0:19500";
	switch(name){
	case "listCurrentJobs":
		/**
			params: {key, sortInfo: [], pageNo, pageSize, algorithm, group}
			cbFn({
				total,
				items: [{
					id, _no, name, process, priority, status, submitTime, waitTime, handleTime, resource, algorithm, group, user
				}...]
			})
		*/
		return setTimeout(function(){cbFn(Test.listJobs(params));},200);
	case "addJob":
	/*新建作业
		params : {algorithm, param}
		cbFn({id ：newId})
	*/
		return cbFn(Test.addJob(params));
	case "listHistoryJobs":
		/**
			params: {key, sortInfo: [], pageNo, pageSize, algorithm, group, status, from, to}
			cbFn({
				total,
				items: [{
					id, _no, name, process, priority, status, submitTime, waitTime, handleTime, resource, algorithm, group, user
				}]
			})
		*/
		return setTimeout(function(){cbFn(Test.listJobs(params));},200);
	case "listServices":
		/**

		*/
		return setTimeout(function(){cbFn(Test.listServices4Node(params));},200);
	case "listNodes4Job":
		return setTimeout(function(){cbFn(Test.listNodes4Job(params));},200);
	case "listNodes4Service":
		return setTimeout(function(){cbFn(Test.listNodes4Service(params));},200);
	case "getParams":
		return setTimeout(function(){cbFn(paramsData);}, 200);
	case "getAlgoAndGroup":
		/* 从计算节点进入作业情况，获取算法模块和群组名称下拉框信息
		params :{id}
		return : {
			algorithm: [{id, name},...],
			group: [{id, name},...]
		}
		*/
		return setTimeout(function(){cbFn(Test.getAlgoAndGroup(params));},200);
	case "getJobName":
		return setTimeout(function(){cbFn(Test.getJobName(params));},200);
	case "getJobNameAndProcess":
		return setTimeout(function(){cbFn(Test.getJobNameAndProcess(params));},200);
	case "getServiceName":
		return setTimeout(function(){cbFn(Test.getServiceName(params));},200);
	case "getAlgoritms":
	/** 
		params: 
		cbFn({algorithm : [{id, name}, ...]})
	*/
		return cbFn(Test.getAlgoritms(params));
	case "getPrompt" : 
		return setTimeout(function(){cbFn(Test.getPrompt(params));},200);
	}
};
//系统日志
PCC.Global.sysCaller = function(name,params,cbFn,failFn){
	switch(name){
	case "listLogs":
		/*
		params :{
			type : "alarm"/msg/operation,
			from : "timeInSec",
			to : "timeInSec",
			pageNo, pageSize, key
		}
		return : {
			total: ,
			items : [{id,_no,detail,date},......]
		}
		*/
		return setTimeout(function(){cbFn(Test.listLogs(params));},200);
	case "getPrompt" : 
		/**导航上报警提示
			return {
				alarmNum: 2
			}
		*/
		return setTimeout(function(){cbFn(Test.getPrompt(params));},200);
	}
};
//算法模块
PCC.Global.algorithmCaller = function(name, params, cbFn, failFn){
	switch (name) {
	case "getAlgorithms":
		/*	
			params: {pageNo, pageSize}
			cbFn({total, items: [{
				id : "alogorithm-" +idx,
				_no : idx<9 ? "0" +(idx+1):(idx+1),
				name : "算法组名称"+idx,
				algorithmNums : Math.floor(Math.random() * idx) + 3
			}]});
		*/
		return setTimeout(function(){cbFn(Test.getAlgorithms(params));}, 200);
		break;
	case "getAlgorithmNodes":
		/*	
			params: {id}
			cbFn({total, items: [{
				id : "alogorithm-" +idx,
				_no : idx<9 ? "0" +(idx+1):(idx+1),
				name : "算法组名称"+idx,
				version: "1." + (_idx<9 ? "0" +(_idx+1):(_idx+1))
			}]});
		*/
		return setTimeout(function(){cbFn(Test.getAlgorithmNodes(params));}, 200);
		break;
	case "getAlgorithmName":
		/*
			params: {id}
			cbFn(name)
		*/
		return setTimeout(function(){cbFn(Test.getAlgorithmName(params));}, 200);
		break;
	case "deleteAlgorithms":
		/*
			params: {ids: []}
		*/
		return setTimeout(function(){cbFn(Test.deleteAlgorithms(params));}, 200);
		break;
	case "deleteAlgorithmNodes":
		/*
			params: {id, ids: []}
		*/
		return setTimeout(function(){cbFn(Test.deleteAlgorithmNodes(params));}, 200);
		break;
	case "addAlgorithm":
		/*
			params: {name}
		*/
		return setTimeout(function(){cbFn(Test.addAlgorithm(params));}, 200);
		break;
	case "editAlgorithm":
		/*
			params: {id, name}
		*/
		return setTimeout(function(){cbFn(Test.editAlgorithm(params));}, 200);
		break;
	case "addAlgorithmNode":
		/*
			params: {tkey, id, name, algorithm_file}
		*/
		return setTimeout(function(){cbFn(Test.addAlgorithmNode(params));}, 200);
		break;
	case "editAlgorithmNode":
		/*
			params: {id, nodeId, name, algorithm_file}
		*/
		return setTimeout(function(){cbFn(Test.editAlgorithmNode(params));}, 200);
		break;
	case "getAlgorithmDetails":
		/*
			params: {id, nodeId}
			cbFn({algorithmName, algorithmNodeName, algorithmDetails})
		*/
		return setTimeout(function(){cbFn(Test.getAlgorithmDetails(params));}, 200);
		break;
	}
};
//群组用户
PCC.Global.groupCaller = function(name, params, cbFn, failFn){
	switch (name) {
	case "getGroups":
		/*	
			params: {pageNo, pageSize}
			cbFn({
				maxQuota,
				total, 
				items: [{
					id : "alogorithm-" +idx,
					_no : idx<9 ? "0" +(idx+1):(idx+1),
					name : "群组名称"+idx,
					quota : 12,
					using : 10,
					taskNum : 3,
					groupUsers : 3
				}]
			});
		*/
		return setTimeout(function(){cbFn(Test.getGroups(params));}, 200);
		break;
	case "getGroupUsers":
		/*	
			params: {id, pageNo, pageSize}
			cbFn({
				maxQuota,
				total, 
				items: [{
					id : "alogorithm-" +idx,
					_no : idx<9 ? "0" +(idx+1):(idx+1),
					name : "用户名称"+idx,
					quota : 12,
					using : 10,
					taskNum : 3
				}]
			});
		*/
		return setTimeout(function(){cbFn(Test.getGroupUsers(params));}, 200);
		break;
	case "getGroupName":
		/*
			params: {id}
			cbFn(name)
		*/
		return setTimeout(function(){cbFn(Test.getGroupName(params));}, 200);
		break;
	case "deleteGroups":
		/*
			params: {ids: []}
		*/
		return setTimeout(function(){cbFn(Test.deleteGroups(params));}, 200);
		break;
	case "deleteGroupUsers":
		/*
			params: {id, ids: []}
		*/
		return setTimeout(function(){cbFn(Test.deleteGroupUsers(params));}, 200);
		break;
	case "addGroup":
		/*
			params: {name, quota}
		*/
		return setTimeout(function(){cbFn(Test.addGroup(params));}, 200);
		break;
	case "editGroup":
		/*
			params: {id, name, quota}
		*/
		return setTimeout(function(){cbFn(Test.editGroup(params));}, 200);
		break;
	case "addGroupUser":
		/*
			params: {id, name, quota}
		*/
		return setTimeout(function(){cbFn(Test.addGroupUser(params));}, 200);
		break;
	case "editGroupUser":
		/*
			params: {id, userId, name, quota}
		*/
		return setTimeout(function(){cbFn(Test.editGroupUser(params));}, 200);
		break;
	}
};
//系统日志
PCC.Global.logCaller = function(name, params, cbFn, failFn){
	switch(name){
	case "getLogs":
		/**
			params: {pageNo, pageSize, status, from, to}
			return : {
				total,
				items: [{
					_no,
					id,
					type,
					detail,
					status,
					date
				}...]
			}
		*/
		return setTimeout(function(){cbFn(Test.getLogs(params));}, 200);
		break;
	case "handleAlarms":
		/**
			params: {ids:[id1,...]}
		*/
		return setTimeout(function(){cbFn(Test.handleAlarms(params));}, 200);
		break;
	}
};
})();