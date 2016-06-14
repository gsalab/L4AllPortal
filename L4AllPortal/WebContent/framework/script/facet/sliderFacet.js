/*==================================================
 *  sliderFacet
 *==================================================
 */


sliderFacet = function(containerElmt,expression) {
    this._id_div = containerElmt;
    this._type = "sliderFacet";
    this._expression = expression;
    this._selectedValues = [];
    this._exceptValues = []; 
    this._arrayValori = [];   
    this._sliderValues = {};
    this._settings = {}; //conterrà i valori delle propietà indicate sotto
    SettingsUtilities._internalCollectSettings(this._id_div, sliderFacet._settingSpecs, this._settings); //carica i valori delle variabili!
    this._sliderSx = {};
    this._sliderDx = {};
    
    this.initUI();
};

sliderFacet._settingSpecs = {
    "facetLabel":       { type: "text" },
	"facetDescription":       { type: "text" , defaultValue:"" },
	"facetDescriptionWhy":       { type: "text" , defaultValue:"" },
    "scroll":           { type: "boolean", defaultValue: true },
    "height":           { type: "text" },
    "precision":        { type: "float", defaultValue: 1 },
    "histogram":        { type: "boolean", defaultValue: true },
    "maxHeightHisto":           { type: "int", defaultValue: 40 }, //altezza dell'istogramma
    "extraHeight":           { type: "int", defaultValue: 20 },    //altezza per arrivare a coprire tutta l'altezza del body (se si cambia il carattere, potrebbe servire cambiare questo parametro)
    "sottrai":           { type: "int", defaultValue: 2000 },      //valore da sottrarre (es. 2011 -> 11)
    "width":            { type: "int", defaultValue: false },   
    "horizontal":       { type: "boolean", defaultValue: true },
    "inputText":        { type: "boolean", defaultValue: true },
    "collapsible":       { type: "boolean", defaultValue: true },
    "collapsed":       { type: "boolean", defaultValue: false },
    "separator":        { type: "boolean", defaultValue: true },
    "refraso":          { type: "boolean", defaultValue: false },
    "prediction":          { type: "boolean", defaultValue: true },
    "foreignObject": {type:"text", defaultValue: null},
    "foreignLabel": {type:"text", defaultValue: null}
    
};

sliderFacet.prototype.initUI = function(){
    FacetUtilities.constructFacetFrame(this._id_div, this._settings.facetLabel,this._settings.collapsible, this._settings.separator, this._settings.facetDescription, this._settings.facetDescriptionWhy);
}

sliderFacet.prototype.getExpression = function(){
 return this._expression; 
}

sliderFacet.prototype.getForeignObject = function(){
 if(this._settings.foreignObject!=null && this._settings.foreignLabel!=null) return this._settings.foreignObject+"%"+this._settings.foreignLabel;
 else return null;
}

//costruzione dello slider
sliderFacet.prototype.facetBody = function(data,num){
      
 var self=this;
 var values_histogram = {};
 var body = '#'+ this._id_div + ' .facet-body';
 $(body).parent().addClass('sliderFacet');
 $(body).css('height',(this._settings.maxHeightHisto+this._settings.extraHeight)+'px'); //forza l'altezza del body visto che tutto quello che viene dopo è in float!
 
   
  var html_val= '';
  var num_val= data.length/2;
  var divWidth = $(body).parent().css('width');
  divWidth = divWidth.slice(0,divWidth.length-2);
  var span_size= (divWidth-2) /(num_val); //è stato necessario aggiungere questo -2 per correggere l'errore di approssimazione
  span_size = (parseInt(span_size*100))/100;
  
  
  this._sliderSx["label"] = data[0]; this._sliderSx["bar"] = 0; this._sliderSx["defaultbar"] = 0; this._sliderSx["position"] = -4; this._sliderSx["selettore"] = '#'+ this._id_div + ' .handleSx';
  this._sliderDx["label"] = data[data.length-2]; this._sliderDx["bar"] = num_val; this._sliderDx["default"] = num_val; this._sliderDx["position"] = (span_size*num_val)-4; this._sliderDx["selettore"] = '#'+ this._id_div + ' .handleDx';
  
  $(body).append('<div class="handle handleSx"><img src="framework/script/images/slider-handle.jpg"></img></div>');
  $(body).append('<div class="handle handleDx"><img src="framework/script/images/slider-handle.jpg"></img></div>');
  
  $(body).css('position','relative');
  $(this._sliderDx.selettore).css('left', (this._sliderDx.position)+'px');
  $(this._sliderSx.selettore).css('left', (this._sliderSx.position)+'px');
  $(this._sliderSx.selettore).css('top', (this._settings.maxHeightHisto+6) +'px');
  $(this._sliderDx.selettore).css('top', (this._settings.maxHeightHisto+6) +'px');
  
  /**************************************************DRAG & DROP******************************************************/
  var x0 = parseInt($(this._sliderSx.selettore).offset().left);
  var y0 = parseInt($(this._sliderSx.selettore).offset().top);
  var x1 = parseInt($(this._sliderDx.selettore).offset().left);
  var y1 = parseInt($(this._sliderDx.selettore).offset().top);
  this._sliderSx.selettore['x']=x0;
  this._sliderSx.selettore['y']=y0;
  this._sliderDx.selettore['x']=x1;
  this._sliderDx.selettore['y']=y1;
  
  $(this._sliderSx.selettore).draggable({
                                        cursor: 'move',
                                        containment : [x0,y0,x1,y1],
                                        stop: handleDragStop
                                        });
                                        
  $(this._sliderDx.selettore).draggable({
                                        cursor: 'move',
                                        containment : [x0,y0,x1,y1],
                                        stop: handleDragStop
                                        });
  var self = this;
  function handleDragStop( event, ui ) {
      var offsetXPos = parseInt( ui.offset.left );
      var offsetYPos = parseInt( ui.offset.top );
      
      var posizione =  Math.round((offsetXPos - x0)/ span_size);
      
      //ToDo: raffinare la posizione
      
      
      if($(this).hasClass('handleSx')){ self._sliderSx.bar=posizione; }
      else if($(this).hasClass('handleDx')){self._sliderDx.bar=posizione-1;}
      
       var cont = 0;
       self._selectedValues = [];
      for(i in self._sliderValues){
            if(cont < self._sliderSx.bar || cont > self._sliderDx.bar ){
                var node = '#'+ self._id_div + ' .facet-slidervalue[title="'+self._sliderValues[i].val+'"]';
                $(node).removeClass('facet-slidervalue-selected');
            }
            else{
                var node = '#'+ self._id_div + ' .facet-slidervalue[title="'+self._sliderValues[i].val+'"]';
                $(node).addClass('facet-slidervalue-selected');
                self._selectedValues.push(self._sliderValues[i].val);
            }
            cont++;    
      }
      
      self._notifyCollection();
      sendUpdateRequest();
  }
  /*******************************************************************************************************************/

  var cnt=0; 
  var maxCount=0;
  
  for(var i=0; i< data.length; i++){ //prima lettura per leggere i valori
    this._sliderValues[data[i]] = { val: data[i] , count : data[i+1], on : true};   //SCRIVE IN UN OGGETTO TUTTI I VALORI
    if(data[i+1]>maxCount) maxCount = data[i+1];
    this._selectedValues.push(data[i]); //a differenza degli altri, questo va per deselezione!
    i++;
  }
  
  for( v in this._sliderValues){ //costruzione del body
    this._arrayValori.push(v);
    var num = parseInt(this._sliderValues[v].val) - this._settings.sottrai;
    if(num < 0){num = 100 - num;} //corregge 1995 -> -5 in 95
    
    html_val += '<div class="facet-slidervalue facet-slidervalue-selected" style="width:'+ span_size +'px" title="'+this._sliderValues[v].val+'">';
    
    var height = this._sliderValues[v].count/maxCount*this._settings.maxHeightHisto;
    var width = span_size -1;
    var offset = this._settings.maxHeightHisto-height;
    
    /***********************************************histogramma********************************************************************/
    html_val += '<div class="histobar" style="height:'+this._settings.maxHeightHisto+'px;">'
                    +'<div class="inner" style="height:'+height+'px; top:'+offset+'px;">'
                    +'</div>'
                +'</div>';
    
    /***********************************************segmento********************************************************************/
    
    html_val += '<div class="segment"></div>';
    
    /***********************************************etichetta********************************************************************/
    if(num<10){html_val+='<div class="valueLabel"><a>0'+num+'</a></div>'; cnt++;}
    else{html_val+='<div class="valueLabel"><a>'+num+'</a></div>'; cnt++;}
    
    html_val += '</div>';
    /***************************************************************************************************************/  
    
   }
 
  $(body).append(html_val);
  $(body).css('font-size','84%');
 
    var values =  '#'+ this._id_div + ' .facet-body .facet-slidervalue';
    $(values).click(function(){
      self._manageClick(this);
    });

    var self = this;
    var str = '#'+ this._id_div +' .resetwdg';
    $(str).unbind();
    $(str).click(function(){self._clearSelections();});
    $('#top .float .clearAll').click(function(){  self._clearSelections();}); //QUESTO EVENTO andrà solo quando ci sarà l'iconcina del resetAll!
//***************************************************************

var str0 = '#'+ this._id_div +' .facet-header-collapse';
if(this._settings.collapsed) $(str0).trigger('click');

}

/*funzione che gestisce il click di selezione/deselezione*/
sliderFacet.prototype._manageClick = function(node){ /***************************************************/
    
    if(this._isSelected($(node).attr('title'))){
        this._removeSelection($(node).attr('title'));
        $(node).removeClass('facet-slidervalue-selected');
    }
    else{
       this._selectedValues.push($(node).attr('title'));
       
       for(var i=0; i<this._exceptValues.length;i++ ){ 
        if(this._exceptValues[i]==$(node).attr('title'))
        this._exceptValues.splice(i,1);
       } 
       
       $(node).addClass('facet-slidervalue-selected'); 
    }
    this._notifyCollection();
    sendUpdateRequest();
}

//funz che controlla se un valore è selezionato
sliderFacet.prototype._isSelected = function(value){
    var ret = false;
    for(var c=0; c<this._selectedValues.length; c++){
        if(this._selectedValues[c]==value){ret = true};
    }
    return ret;
}

//funz che si occupa di calcolare il refraso
sliderFacet.prototype._notifyCollection = function(){
    if(this._settings.refraso && $('#refraso .body').length > 0){
    	  var itemType = Application.getContestoAttuale().getItemType();
    	
          var val= '#refraso .body .'+this._id_div;
          var val1 = val + ' + .and';
          var val2= '#refraso .body .and:first-child';
          var val3= '#refraso .body .and:last-child';
          $(val).remove();
          $(val1).remove();
          $(val2).remove();
          $(val3).remove();
        if(this._exceptValues.length==0){
            $('#refraso .body:empty').append('<span class="default">'+refraso[itemType].all+'</span>');
            var html = $('#refraso .body').html(); 
            html=html.replace(/ /g,"");
            if(html=='') $('#refraso .body').append('<span class="default">'+refraso[itenType].all+'</span>');            
        }
        else{
            var val= '#refraso .body';
            $('#refraso .body .default').remove();
            var str= '<span class="'+this._id_div+'"><span class="label">'+this._settings.facetLabel+': </span><span class="values">';
            
            str = str + "<span> from "+this._arrayValori[this._sliderSx.bar]+"</span>";
            str = str + "<span> to "+this._arrayValori[this._sliderDx.bar-1]+"</span>";
            str = str + "<span> except (</span>";
            this._exceptValues.sort();
            for(var y=0; y<this._exceptValues.length; y++){
                str = str + "<span>"+this._exceptValues[y]+"</span>";
                if(y<this._exceptValues.length-1){str = str + "<span>, </span>";}   
            }
            
            str = str + ')</span></span>';
            if($(val).html()!=""){str = '<span class="and"> AND </span> '+ str}
            $(val).append(str);
        }      
    }
    
      $('#refraso .body .and + .and').remove();
}

//cancella le selezioni (in questo caso riseleziona tutto perchè lo slider funziona al contrario degli altri widget)
sliderFacet.prototype._clearSelections = function(){
    this._selectedValues= [];
    this._exceptValues=[];
    var tmp = '#'+ this._id_div + " .facet-slidervalue";
    $(tmp).addClass('facet-slidervalue-selected');
    for(z in this._sliderValues){
        this._selectedValues.push(this._sliderValues[z].val);
    }
    
    $(this._sliderDx.selettore).css('left', (this._sliderDx.position)+'px');
    this._sliderDx.bar = this._sliderDx.defaultbar;
    $(this._sliderSx.selettore).css('left', (this._sliderSx.position)+'px');
    this._sliderSx.bar = this._sliderSx.defaultbar;
  
    this._notifyCollection();
}

//deselziona un elemento
sliderFacet.prototype._removeSelection = function(value){
    for(var i=0; i<this._selectedValues.length;i++ ){ 
        if(this._selectedValues[i]==value)
        this._selectedValues.splice(i,1);
    } 
    this._exceptValues.push(value); 

}

//funz per ottenre il parametro SOLR per abilitare i volori potenziali
sliderFacet.prototype.getPrediction = function(){
   var str = null;
   if(this._settings.prediction){str='facet.field={!ex=d'+this._expression+'}'+this._expression}
   return str;
}

sliderFacet.prototype.getRestriction = function(){
    var str="";
    if(this._selectedValues.length>0){
        if(this._selectedValues.length==1){
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}'+this._expression+':"'+this._selectedValues[0]+'"';
            else str= this._expression+':"'+this._selectedValues[0]+'"';
        }
        else{
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}('+this._expression+':"'+this._selectedValues[0]+'"';
            else str = 'fq=('+this._expression+':"'+this._selectedValues[0]+'"';
            for(var f=1; f<this._selectedValues.length; f++){
                str= str + "\+OR\+" +  this._expression+':"'+this._selectedValues[f]+'"';
            }
            str = str + ')';
        }
    }
    return str;
}

sliderFacet.prototype.getEmptyRestriction = function(){
	return 'fq={!tag=d'+this._expression+'}'+this._expression+':*';
}

//funzione di update dello slider
sliderFacet.prototype.facetUpdate = function(data,num){
  var maxCount=0;
  
  for(var i=0; i< data.length; i++){ //prima lettura per leggere i valori
    this._sliderValues[data[i]].count = data[i+1];   //SCRIVE IN UN OGGETTO TUTTI I VALORI
    if(data[i+1]>maxCount) maxCount = data[i+1];
    i++;
  }
  
  for(var i=0; i< data.length; i++){ //prima lettura per leggere i valori
    
        
    var height = data[i+1]/maxCount*this._settings.maxHeightHisto;
    var offset = this._settings.maxHeightHisto-height;
    var inner = '#'+this._id_div + ' .facet-slidervalue[title="'+data[i]+'"] .histobar .inner';
    $(inner).css('height',height+'px');
    $(inner).css('top',offset+'px');
    
    var o = '#'+this._id_div + ' .facet-slidervalue[title="'+data[i]+'"] .segment';
    if(data[i+1]==0){
        $(o).css('background-color','white');
    }
    else{
        $(o).css('background-color','blue');
    }
    
    i++;
  }
}



