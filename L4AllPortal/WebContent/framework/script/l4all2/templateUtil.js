/*
 * TemplateType
 */
TemplateType=function(){};
TemplateType.SAVE_SESSION = "SaveSession";
TemplateType.LOAD_SESSION = "LoadSession";
TemplateType.CARRELLO = "Carrello";
TemplateType.DATASET = "DataSet";
TemplateType.LOGIN = "Login";
TemplateType.WDGPDF = "WidgetPDF";
TemplateType.LINK_PUBBLICO = "LinkPubblico";
TemplateType.SWITCHER = "Switcher";

/*
 * TemplateContext
 */
TemplateContext=function(){
	this._hTemplate = {};
};

TemplateContext.START_ELEM = '<body>';
TemplateContext.END_ELEM = '</body>';

// FINAL
TemplateContext.prototype.loadTemplate=function(templateType){
	var timestamp = "";//new Date().getTime();
	if(this._hTemplate[templateType]==null){
		var url = 'framework/template/template'+templateType+'.xhtml?t='+timestamp;
		$.log('Loading template <'+url+'>...');
		var data = $.ajax({
		   type: "GET",
		   url: url,
		   dataType: "xml",
		   processData: false,
		   async: false
		}).responseText;
		var startIdx=data.indexOf(TemplateContext.START_ELEM)+TemplateContext.START_ELEM.length;
		var endIdx=data.indexOf(TemplateContext.END_ELEM);
		this._hTemplate[templateType] = data.substring(startIdx,endIdx);
	};
	   
	return this._hTemplate[templateType];
};

/*
 * TemplateTransformation
 */
TemplateTransformation=function(templateType){
	this._transformation=templateContext.loadTemplate(templateType).slice();
	this._param={};
};

// FINAL
TemplateTransformation.prototype.addParam=function(name, value){
	this._param[name]=value;	
};

// FINAL
TemplateTransformation.prototype.getResult=function(){
	for(var prop in this._param){
		this._transformation=this._transformation.split('$'+prop+'$').join(this._param[prop]);
	};
	return this._transformation;
};

var templateContext = new TemplateContext();