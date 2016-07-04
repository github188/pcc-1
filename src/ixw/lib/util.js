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