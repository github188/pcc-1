(function(){
IX.ns("PCC.UILib");

var UploadClz = null;
function _init(){
	if (UploadClz)
		return;
	UploadClz = IXW.Lib.FileUploader;
	if (!PCC.Global.fileUploadUrl)
		return alert("没有配置上传路径，文件无法上传");
	UploadClz.init(PCC.Global.fileUploadUrl);
}

/**  
 * id :  dom btn ID, // required
 */
PCC.UILib.FileUploadBtn= function(id, afterLoaded, url, disabelAddbtnFn,failFn){
	_init();
	var fileUploader = null, ifUploading = false;
	function onchangeFn(fileEl){
		var file = (fileEl && "files" in fileEl) ? fileEl.files[0] : null;
		var name = "";
		if(file !== null){
			name = file.name;
		}else{
			name = fileEl.value;
		}


		if(fileEl && !name ==="json")
			return alert("这里只能上传后缀名为json的文件，请重新选择符合条件的文件后重新上传。");
		ifUploading = true;
		if(IX.isFn(disabelAddbtnFn)) disabelAddbtnFn();
		fileUploader.submit(function(data){
			ifUploading = false;
			afterLoaded(data);
		});
	}
	var cfg = {
		trigger : id,
		onchange : onchangeFn
	};
	if (IX.isString(url))
		cfg.fileUploadURL = url;
	fileUploader = new UploadClz(cfg);

	return {
		ifUploading : function(){return ifUploading;}
	};
};
})();