//var fuori dall'oggetto per comodità di non doversi trascinare this nelle chiamate degli Overlay (gli oberlay sono oggetti a sè!)
var hColors;
var hValues;
var needUpdateLegenda = true;

//oggetto della mappa con i vari attibuti per lo stato e la costruzione
mapView = function(containerElmt,expression) {
    this._id_div = containerElmt;
    this._settings = {}; //conterrà i valori delle propietà indicate sotto
    SettingsUtilities._internalCollectSettings(this._id_div, mapView._settingSpecs, this._settings); //carica i valori delle variabili!
    this._currentProxyValues;
    this._proxyValues=[];
    this._contatore=0; 
    this._aperta=0; 
    this.colors = this._settings.colors.split(',');
    this._markersArray=[];
    this._map;
    this._openCall=0;
    this._geoRef ={};
    this._responseData = {};
    
    //HighLight
    this._highLight = this._settings.hexpressions.split(',');
    this._highLabels = this._settings.hlabel.split(',');
    
    //Proxy di aggregazione sulla mappa (città o regione)
    this._proxy = this._settings.proxy.split(',');
    this._proxyLabels = this._settings.proxyLabel.split(',');
    this._proxyZoom = this._settings.proxyZoom.split(',');
    
    //variabili dello stato della mappa
    this._currentHighlight = 0; 
    this._currentProxy = 0;
};

mapView._settingSpecs = {
    //parametri costruzione dela mappa
    "mapWidth": { type: "text", defaultValue: "100%" }, //larghezza della mappa rispetto al contenutore
    "mapCenterLat": { type: "text", defaultValue: "-34.397"}, //lat centro della mappa
    "mapCenterLng": { type: "text", defaultValue: "150.644"}, //lng centro della mappa
    "mapZoom": { type: "int", defaultValue: 6 }, //zoom di defualt
    
    //parametri di personalizzazioen dello stile della mappa
    "label": {type: "text", defaultValue: "Map view"}, //label da mostrare nel menu dei canvas
    "legendaColore": { type: "text", defaultValue: "" }, //etichetta per la legenda colore
    "hexpressions": { type: "text", defaultValue: "" }, //field che guideranno gli highlight. Attenzione: per nessun highlight (solo per mappa a Pallini) usare valore none
    "hlabel": { type: "text", defaultValue: "" }, //etichette degli highlight
    "colors": { type: "text", defaultValue: "#FF3300,#A17FBA,#65AFB7,#60AF60,#D6E281,#FFC673,#FFE473,#ffffff" }, //colori per highlight
    "lenstype": { type: "text", defaultValue: null }, //tipo di lens da associare agli elementi (ATTENZIONE: in questo canvas c'è un ulteriore livello di dettaglio a livello di proxy aggregante)
    "overlay": { type: "text", defaultValue: "pie"}, //tipo di overlay sulla mappa
    "overlay3D": { type: "boolean", defaultValue: "true"}, //overlay 3d (in base al valore sarà diversa la chiamata alle libr dei grafici)
    
    //parametri di aggregazione
    "proxy": { type: "text", defaultValue: "" }, //quale field usare come proxy (es. regione e provincia): la cosa migliore è avere i valori direttamente nel dataset
    "proxyLabel": { type: "text", defaultValue: ""}, //etichetta dei proxy
    "proxyZoom": { type: "text", defaultValue: ""}, //zoom della mappa per il proxy (stesso ordine)
    "proxyLookUp": { type: "text", defaultValue: "area" }, //elemento ch contiene le info delle aree geografiche proxy (lat,lng, etichette...)
    "lat": { type: "text", defaultValue: "lat" }, //nome del field che contiene la latitudine
    "lng": { type: "text", defaultValue: "lng" } //nome del field che contiene la longitudine
};


mapView.prototype.sortBy = function(){ //QUESTA funzione nn serve per questo tipo di canvas perchè nn c è un criterio di ordinamento
    return "";
}

//quali field serve caricare per disegnare la mappa (prima chiamata)
mapView.prototype.fieldParams = function(){
  var ret = [];
  ret.push('id');
  ret.push('label');
  for(var y=0; y<this._highLight.length; y++){
     var tmp = this._highLight[y].split('.');
     if(tmp.length > 1) ret.push(tmp[1]);
     else ret.push(this._highLight[y]);
  }
  for(var y=0; y<this._proxy.length; y++){
     var tmp = this._proxy[y].split('.');
     if(tmp.length > 1) ret.push(tmp[1]);
     else ret.push(this._proxy[y]);
  }
  return ret;
}

//costruzione della mappa
mapView.prototype.buildCanvas = function(data){
  
  var centro = new google.maps.LatLng(parseFloat(this._settings.mapCenterLat), parseFloat(this._settings.mapCenterLng));
  var zoom = this._settings.mapZoom;
  
  //controlla se c'è uno stato salvato
  if($.cookie(this._id_div) != null) {
    var arr = $.cookie(this._id_div).split('%');
    centro =  new google.maps.LatLng(parseFloat(arr[0]), parseFloat(arr[1]));
    zoom = parseInt(arr[2]);
    this._currentHighlight = parseInt(arr[4]);
    this._currentProxy = parseInt(arr[3]);
    $.cookie(this._id_div, null);
  }
                
                                            
  this._geoRefReq(); //carica le informazioni di georeferenziazione delle aree
  
  //menu degli highlight
  if(this._highLabels.length > 0){
      ul = '<span class="label">Highlight by: </span><span class="currentSelection"><span>'+this._highLabels[this._currentHighlight]+'</span><img class="arrow" src="framework/script/images/arrowdown.png"></span><ul>';
      for(var c=0; c< this._highLabels.length; c++){
            ul += '<li val="'+c+'">'+this._highLabels[c]+'</li>';
      }
      ul += '</ul>';
      $('#view .viewTop .highlight').append(ul);
      $('#view .viewTop .highlight .currentSelection').click(function(){ //apri chiudi menu
              var ul = '#view .viewTop .highlight .currentSelection + ul';
              if($(ul).css('display')=='none'){ 
                  $(ul).css('display','block')
                  autoChiudi = function() { $(ul).css('display','none') }
                  setTimeout('autoChiudi()', 2000);
                  }
              else $(ul).css('display','none')
          });
      
          $('#view .viewTop .highlight li').click(function(){ //apri chiudi menu
             var ul = '#view .viewTop .highlight .currentSelection + ul';
             $(ul).css('display','none');
             $('#view .viewTop .highlight .currentSelection > span').html(self._highLabels[$(this).attr('val')]);
             self.changeColorCode($(this).attr('val'));
          });
  }
  
  //menu dei proxy
  if(this._proxyLabels.length > 0){
      ul = '<span class="label"> by: </span><span class="currentSelection"><span>'+this._proxyLabels[this._currentProxy]+'</span><img class="arrow" src="framework/script/images/arrowdown.png"></span><ul>';
      for(var c=0; c< this._proxyLabels.length; c++){
            ul += '<li val="'+c+'">'+this._proxyLabels[c]+'</li>';
      }
      ul += '</ul>';
      $('#view .viewTop .highlight').before('<div class="proxy"> </div>');
      $('#view .viewTop .proxy').append(ul);
      $('#view .viewTop .proxy .currentSelection').click(function(){ //apri chiudi menu
              var ul = '#view .viewTop .proxy .currentSelection + ul';
              if($(ul).css('display')=='none') {
                  $(ul).css('display','block');
                  autoChiudi = function() { $(ul).css('display','none') }
                  setTimeout('autoChiudi()', 2000);
              }
              else $(ul).css('display','none')
          });
      
          $('#view .viewTop .proxy li').click(function(){ //apri chiudi menu
             var ul = '#view .viewTop .proxy .currentSelection + ul';
             $(ul).css('display','none');
             $('#view .viewTop .proxy .currentSelection > span').html(self._proxyLabels[$(this).attr('val')]);
             self.changeProxy($(this).attr('val'));
          });
  }  
  
  
  var map_legenda = document.createElement('div');
  map_legenda.id= "map_legenda";
  map_legenda.className= "legendaColore";
  if($('#refraso').get()[0]!=null) $('#refraso').before(map_legenda);
  else $('#view').append(map_legenda);
  
  var map_canvas = document.createElement('div');
  map_canvas.id= "map_canvas";
 if($('#refraso').get()[0]!=null) $('#refraso').before(map_canvas);
  else $('#view').append(map_canvas);
  
  $('#view .viewTop ').css('z-index','1000');
  $('#map_legenda').css('width','100%');
  $('#map_canvas').css('width','100%');
  
  var h = window.innerHeight - 200;
  $('#map_canvas').css('height', h +'px');
    
  var self = this;
  
  //funz di inizializzazione della mappa
  function initialize(c, z) {
        var myOptions = {
          zoom: z,
          center: c,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          panControl: false,
          zoomControl: false,
          zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL},
          mapTypeControl: false,
          scaleControl: false,
          scrollwheel: false,
          streetViewControl: false,
          disableDoubleClickZoom: true,
          overviewMapControl: true
        };
        self.map = new google.maps.Map(document.getElementById('map_canvas'),myOptions);
   }
    initialize(centro, zoom);
    
    
    //TIMEOUT PER VERIFICARE CHE ABBIA CARICATO LE GEOREFERENZIAZIONI
    checkPendingRequestGeo = function() {
        if ($.active > 0) { setTimeout("checkPendingRequestGeo()",20);} else {
            self.addMarkers(data);
        }
    }
    checkPendingRequestGeo();
}

//////////////////////////////////////////////////////////////
//Funzine per caricare le georeferenziazioni delle aree:
//-recuepera i parametri dalle personalizzazioni:
//      this._settings.proxyLookUp: valore "cat" degli oggetti di SOLR che contengono le info delle aree
//      this._settings.lat: field che contiene le info di lat
//      this._settings.lng: filed che contiene le info di lng
//////////////////////////////////////////////////////////////
/*invia chiamata a solr*/
mapView.prototype._geoRefReq = function(){ 
   var strData = "wt=json&rows=10000&q="+ this._settings.proxyLookUp+"&fl=id,label,"+this._settings.lat+","+this._settings.lng
   var self = this;
   this._openCall++;
   $.ajax({
      url: solrServer,
      data: strData,
      dataType: 'jsonp',
      success: function (data) {
            self._loadGeoRef(data);
        },
      jsonp: 'json.wrf'
    });
}

/*Call back: salva i valori nella variabile this._geotRef: da qui verranno presi per costruire gli overlay*/
mapView.prototype._loadGeoRef = function(data){ 
   for(var d=0; d<data.response.docs.length; d++){
      var id = data.response.docs[d].id;
      id = id.replace("-","")
      var lat = eval('data.response.docs[d].'+this._settings.lat);
      var lng = eval('data.response.docs[d].'+this._settings.lng);
      var label = data.response.docs[d].label;
      this._geoRef[id] = {
          "lat":lat,
          "lng":lng,
          "label":label
      };
    }
    this._openCall--;
    if( this._openCall==0)  $(document).ready(function(){ stoploader();})
}
//////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////
//Una volta costruita la mappa (vuota), si inizia con la costruzione degli
//overlay
//////////////////////////////////////////////////////////////
/*la prima chiamata di costruzione dei marker richiede di trovare i valori dei proxy:
servirà inviare per ogni valore del proxy una chiamata a SOLR per ricevere la distribuzione 
degli highlight al suo interno (facet), visto che la chiamata principale (data) contiene la 
situazione complessiva del dataset
*/
mapView.prototype.addMarkers = function(data){
    startloader();
    //Funzione per trovare tutti i valori del proxy: per ogni valore verrà fatta una chiamata a SOLR
    function getPossibleValuesFor(prop){
        var tmp=[];
        var tmp0=[];
        for(var d=0; d<data.length; d++){
                var r = eval('data[d].'+prop);
                if(r.constructor.toString().indexOf("function Array()") != -1) {
                    for(var r0=0; r0<r.length; r0++){
                        tmp.push(r[r0]);
                    }
                }
                tmp.push(r);
        }
        tmp = tmp.sort();
        tmp0.push(tmp[0]);
        for(var d=1; d<tmp.length; d++){
            if(tmp[d]!=tmp[d-1]) tmp0.push(tmp[d]);    
        }
        return tmp0;
    }
    
    //per evitare di dover ripetere questa operazione in passaggi successivi, cerca già i valori di tutti proxy
    for(var z=0; z<this._proxy.length; z++){
        this._proxyValues[z] = getPossibleValuesFor(this._proxy[z]); //possibili valori
    }    
    
    this._currentProxyValues =  this._proxyValues[this._currentProxy]; //possibili valori
    this._openCall=0; //contatore per contare le chiamate inviate
    this._responseData = {}; //variabile dove sono salvati temporanemente i vari risultati delle query
    for( var v=0; v<this._currentProxyValues.length; v++){
       this._openCall++;
       this.sendProxyRequest(this._proxy[this._currentProxy], this._currentProxyValues[v]); //CHIAMATE A SOLR
   }
}

/////////////////////////////////////////////////////////////////////////////////////////////
//CHIAMATA AJAX PER LE INFO SPECIFICHE PER UN AREA GEOGRAFICA (UN VALORE DEL PROXY)
/////////////////////////////////////////////////////////////////////////////////////////////
/*Chiamata Ajax*/
mapView.prototype.sendProxyRequest = function(proxy,value){ //i parametri della chiamata sono recuperati da mainApi.js
    var strData = query_params.join('&');
    var self = this;
    strData = strData + '&fl=id,label&proxy='+value+'&fq='+proxy+":"+value; //aggiungi il filtro per il valore del proxy specifico (chiamata 1 di N)
    strData = strData + "&"+ getFQParams().join('&'); //par di filtraggio
    if(this._highLight[this._currentHighlight]!='none') strData = strData + '&facet.field='+this._highLight[this._currentHighlight]+'&facet.sort='+this._highLight[this._currentHighlight]+':index'; //valori facet solo per l'highlight corrente
    $.ajax({
      url: solrServer,
      data: strData,
      dataType: 'jsonp',
      success: function (data) {
            self.storeData(data);
            },
      jsonp: 'json.wrf'
    });
}

/*La callback che salva temporaneamente le risposte, e quando sono arrivate tutte chiama la funzione di analisi*/
mapView.prototype.storeData = function(data){
    var pValue= data.responseHeader.params.proxy; 
    this._responseData[pValue] = data;
    var self = this;
    this._openCall--; if(this._openCall==0) $(document).ready(function(){self.analyzeData();});
}

/*Funzione di analisi che legge le varie risposte: aspettando che tutte le risposte siano arrivate prima
di iniziare a disegnare gli overlay, permette di rendere degli effetti relativi tra el varie aree 
(es cerchio proporzionale al numero di elementi dell'area).*/
mapView.prototype.analyzeData = function(){    
    var max_num=0;
    var min_num=100000000000;
    
    for( i in this._responseData){
        var num = this._responseData[i].response.numFound;
        if (num<min_num && num>0) min_num=num;
        if (num>max_num) max_num=num;
    }
    
    for( i in this._responseData){
        this.buildMarker(this._responseData[i], min_num, max_num, this._responseData[i].response.numFound); //chimata alla costruzione del'overlay
    }
    
    $(document).ready(function(){stoploader(); });
}

/*Costruzione del singolo overlay ed eventuale update della legende dei colori */
mapView.prototype.buildMarker = function(data, min, max,size){
    var pValue= data.responseHeader.params.proxy; 
    try{
        var label= eval('this._geoRef.'+pValue+'.label').toString();
        
        //prepara la var che con i dati relativi all'area che verrò poi elaborata dal metodo per la costruzione della rappresentazione interna dell'overlay
        var arrayData = new Array();
        if(this._highLight[this._currentHighlight]!='none') arrayData = eval('data.facet_counts.facet_fields.'+this._highLight[this._currentHighlight]);
        else {
            arrayData.push("");
            arrayData.push(size);
        }
        
        var idObj=[];
        var labObj=[];
        
        //salva i nquesta variabile gli ID degli elementi appartenenti all'area
        for(var p=0; p< data.response.docs.length ;p++){
            idObj.push(data.response.docs[p].id);
            labObj.push(data.response.docs[p].label);
        }   
        
        //eventuale update della legenda (seseguito solo 1 volta a goni cambio di highlight)     
        if(needUpdateLegenda){
            needUpdateLegenda=false;
            if(this._highLight[this._currentHighlight]!='none'){
                html="<span>"+this._settings.legendaColore+"</span>";
                for(var t=0; t<arrayData.length; t++){
                    html= html + '<span style="color:'+this.colors[t/2]+'">'+arrayData[t]+'</span>';
                    t++;
                }
            }
            else html="";
            $('#map_legenda').html(html);
        }
        var Latlng = new google.maps.LatLng(lat,lng);
         
        var overlay=null;
        
        /*calcola la posizione geografica*/
        var lat= parseFloat(eval('this._geoRef.'+pValue+'.lat'));
        var lng= parseFloat(eval('this._geoRef.'+pValue+'.lng'));
        var swBound = new google.maps.LatLng(lat-0.001, lng-0.001);
        var neBound = new google.maps.LatLng(lat+0.001, lng+0.001);
        var bounds = new google.maps.LatLngBounds(swBound, neBound);
        
        /*prepara l'array dei colori nel formato richiesto dalle librerie dei grafici di google*/
        var col=[];
        for(var c=0; c<this.colors.length; c++){
           var r= this.colors[c];
           r=r.replace('#','');
           col.push(r);    
        }
        
        /*In base al tipo di overlay specificato nei parametri, istanzia (e crea) l'overlay usando la classe relativa
        
        ATTENZIONE: per aggiungere nuovi tipi di overlay, scrivere le classi e i metodi dell'overlay (vedi esempi sotto) e aggiungere qui
        la mappatura tra il valore del parametro e la classe da chiamare
        */
        if(this._settings.overlay=='pie') overlay = new pieChartIMGOverlay(bounds, pValue,arrayData,col.join('%7C'), this.map, this._settings.overlay3D,label,idObj,labObj, min, max,size,this._settings.lenstype);
        else if(this._settings.overlay=='histo') overlay = new HistoOverlay(bounds, pValue,arrayData,col.join('%7C'), this.map, this._settings.overlay3D,label,idObj,labObj, min, max,size,this._settings.lenstype);
        else if(this._settings.overlay=='palle') overlay = new palleOverlay(bounds, pValue,arrayData,col.join('%7C'), this.map, this._settings.overlay3D,label,idObj,labObj, min, max,size,this._settings.lenstype);
        
        this._markersArray.push(overlay);  //aggiunge il marker creato all'array che contiene i marker della mappa
     } catch(err){ //MESSA TRY CATCH PERCHè IN FASE DI IMPLEMENTAZIONE C'ERANO DEI PROBLEMI CON I NOMI DELLE AREE SVIZZERE: NON GLI PIACEVA LA NOTAZIONE CH-ZZZ
         //alert(pValue)
     }
     finally{ //this._openCall--; if(this._openCall==0)  $(document).ready(function(){stoploader(); })
     }
}

mapView.prototype.displayCanvas = function(data){
    //ALTRA FUNZIONE CHE IN QUESTO CANVAS NON SERVE, MA PER RIMANERE IN LINEA CON GLI ALTRI CANVAS è DICHIARATO COME FUNZIONE VUOTA
    
}


//////////- OVERLAY TORTE- con API chart image///////////
function pieChartIMGOverlay(bounds, id, arrayData,colors, map, enable3D,label,idObj,labObj,min,max, size,lenstype){
  this.bounds_ = bounds;
  this.map_ = map;
  this.arrayData = arrayData;
  this.div_ = null;
  this.id="overlay_"+id;
  this.enable3D = enable3D;
  this.colors=colors;
  this.label=label;
  this.setMap(map);
  this.idObj = idObj;
  this.labObj = labObj;
  this.min = min;
  this.max = max;
  this.size = size;
  this.lenstype = lenstype;
  //alert(this.min + " " + this.max + " "  + this.size);
}
/////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////
//Overlay a TORTE
/////////////////////////////////////////////////////////////////////////////////////////////
/*dichiarazione oggetto come overlay di googleMap*/
pieChartIMGOverlay.prototype = new google.maps.OverlayView();
/*metodo per la costruzione dell'overlay*/
pieChartIMGOverlay.prototype.onAdd = function() {
  //contenitore
  var div = document.createElement('DIV');
  div.style.border = "none";
  div.style.borderWidth = "0px";
  div.style.position = "absolute";
 
  //calcolo dei valore per la richiesta alle api chart.googleapis.com
  maxW2d = 120; minW2d = 40;
  maxW3d = 120; minW3d = 70;
  razio3d = 1.33333;
  ratio2d = 1
  range = this.max-this.min;
  
  var w;
  var h;
  if(this.enable3D) {
      w = parseInt((this.size/ this.max ) * maxW3d);
      if(w< minW3d) w = minW3d;
      h = parseInt(w / razio3d);
  }else{
      w = parseInt((this.size/ this.max ) * maxW2d);
      if(w< minW2d) w = minW2d;
      h = parseInt(w / razio2d);
  }
  var tot=0; var vals = []; for(var n=0; n<this.arrayData.length; n++){var tmp = parseInt(this.arrayData[n+1]); vals.push(tmp); tot= tot + tmp;n++} for(var n=0; n<vals.length; n++){vals[n]= parseInt(vals[n]*100/tot);} perc=vals.join(',');
  if(this.enable3D) {
      D3="p3"; size= w+"x"+h;
  } else {
      D3="p"; size= w+"x"+h;
  }
  col=this.colors;

  //crea l'elemento
  var img = document.createElement("img");
  img.src = "https://chart.googleapis.com/chart?cht="+D3+"&chs="+size+"&chd=t:"+perc+"&chco="+col+"&chf=bg,s,ffffff00&chma=0,0,0,0";
  img.id = "img_"+this.id;
  img.title=this.label;
  img.style.position = "relative";
  if(this.enable3D) {img.style.left = "-"+(parseInt(w/2))+"px"; img.style.top = "-"+(parseInt(h/2))+"px";} else {img.style.left = "-45px"; img.style.top = "-45px";}
  div.appendChild(img);
  this.div_ = div;
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div);
  var self=this;
}

/*metodo per disegnare l'overlay*/
pieChartIMGOverlay.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
  var div = this.div_;
  div.style.left = sw.x + 'px';
  div.style.top = ne.y + 'px';
  div.style.width = (ne.x - sw.x) + 'px';
  div.style.height = (sw.y - ne.y) + 'px';
  //div.style.backgroundColor = 'yellow';
  
  var self=this;
  var sel = "#img_"+this.id;
  $(sel).click(function(){ openDetail(self.label, self.idObj, self.labObj,self.arrayData,self.colors,self.lenstype);});
}

/*metodo per eliminare l'overlay*/
pieChartIMGOverlay.prototype.onRemove = function() {
    var sel = "#img_"+this.id;
    $(sel).unbind();
    this.div_.parentNode.removeChild(this.div_);
    this._div=null;
}
/////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////
//Overlay a Histogrammi
/////////////////////////////////////////////////////////////////////////////////////////////
function HistoOverlay(bounds, id, arrayData,colors, map, enable3D,label,idObj,labObj,min,max, size, lenstype){
  this.bounds_ = bounds;
  this.map_ = map;
  this.arrayData = arrayData;
  this.div_ = null;
  this.id="overlay_"+id;
  this.enable3D = enable3D;
  this.colors=colors;
  this.label=label;
  this.setMap(map);
  this.idObj = idObj;
  this.labObj = labObj;
  this.min = min;
  this.max = max;
  this.size = size;
  this.lenstype = lenstype;
}

HistoOverlay.prototype = new google.maps.OverlayView();
HistoOverlay.prototype.onAdd = function() {
  //contenitore
  var div = document.createElement('DIV');
  div.style.border = "none";
  div.style.borderWidth = "0px";
  div.style.position = "absolute";
 
  //calcolo dei valore per la richiesta alle api chart.googleapis.com
  
  maxW2d = 130; minW2d = 40;
  maxW3d = 130; minW3d = 70;
  razio3d = 1.33333;
  ratio2d = 1
  range = this.max-this.min;
  
  var w;
  var h;
  
  if(this.enable3D) {
      w = parseInt((this.size/ this.max ) * maxW3d);
      if(w< minW3d) w = minW3d;
      h = parseInt(w / razio3d);
  }else{
      w = parseInt((this.size/ this.max ) * maxW2d);
      if(w< minW2d) w = minW2d;
      h = parseInt(w / razio2d);
  }
  
  
 var tot=0; var vals = []; for(var n=0; n<this.arrayData.length; n++){
     var tmp = parseInt(this.arrayData[n+1]); 
     vals.push(tmp); if(tmp>tot)tot= tmp;n++
  } 
  
  for(var n=0; n<vals.length; n++){vals[n]= parseInt(vals[n]*100/tot);} perc=vals.join(',');
  if(this.enable3D) {
      D3="p3"; size= w+"x"+h;
  } else {
      D3="p"; size= w+"x"+h;
  }
  col=this.colors;

  //crea l'elemento
  var img = document.createElement("img");
  if(tot%2 != 0) tot++;
  img.src = "https://chart.googleapis.com/chart?cht=bhs&chs=120x70&chxt=x&chxr=0,0,"+tot+"&chxs=0,000000&chbh=a,5&chd=t:"+perc+"&chco="+col+"&chf=bg,s,ffffff00&chma=0,0,0,0";
  
  img.style.width = w + "px";
          
  img.id = "img_"+this.id;
  img.title=this.label;
  img.style.position = "relative";
  img.style.left = "-"+(parseInt(w/2))+"px"; img.style.top = "-"+(parseInt(h/2))+"px";
  div.appendChild(img);
  this.div_ = div;
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div);
  var self=this;
}

HistoOverlay.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
  var div = this.div_;
  div.style.left = sw.x + 'px';
  div.style.top = ne.y + 'px';
  div.style.width = (ne.x - sw.x) + 'px';
  div.style.height = (sw.y - ne.y) + 'px';
  div.style.backgroundColor = 'yellow';
  
  var self=this;
  var sel = "#img_"+this.id;
  $(sel).click(function(){ openDetail(self.label, self.idObj, self.labObj,self.arrayData,self.colors,self.lenstype);});
}



HistoOverlay.prototype.onRemove = function() {
    var sel = "#img_"+this.id;
    $(sel).unbind();
    this.div_.parentNode.removeChild(this.div_);
    this._div=null;
}

/////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////
//Overlay a Pallini
/////////////////////////////////////////////////////////////////////////////////////////////
function palleOverlay(bounds, id, arrayData,colors, map, enable3D,label,idObj,labObj,min,max, size,lenstype){
  this.bounds_ = bounds;
  this.map_ = map;
  this.arrayData = arrayData;
  this.div_ = null;
  this.id="overlay_"+id;
  this.enable3D = enable3D;
  this.colors=colors;
  this.label=label;
  this.setMap(map);
  this.idObj = idObj;
  this.labObj = labObj;
  this.min = min;
  this.max = max;
  this.size = size;
  this.lenstype = lenstype;
  //alert(this.min + " " + this.max + " "  + this.size);
}

palleOverlay.prototype = new google.maps.OverlayView();
palleOverlay.prototype.onAdd = function() {
  //contenitore
  var div = document.createElement('DIV');
  div.style.border = "none";
  div.className = "floatCont";
  div.style.borderWidth = "0px";
  div.style.position = "absolute";
 
  //calcolo dei valore per la richiesta alle api chart.googleapis.com
  
  alpha = 0.7;
  /////////range = this.max-this.min;
  
  var w;
  var h;
  var arrColors = this.colors.split("%7C");
  var tot=0; 
  var vals = []; 
  for(var n=0; n<this.arrayData.length; n++)
  {var tmp = parseInt(this.arrayData[n+1]); vals.push(tmp); tot= tot + tmp;n++} 
  var c0 =0;
  for(var n=0; n<vals.length; n++){
      val0= vals[n];
      w0= 30;
      h0= 30;
      if(this.arrayData.length==2){
           var gap = (this.max - this.min) / 7;
           if(gap==0) gap = 7;
           var delta = parseInt((this.size - this.min)/ gap);
           w0 = 30 + (delta*7);
           h0 = 30 + (delta*7);
      }
      col0= arrColors[n];
      
      if(val0>0){
          c0++;
          var img = document.createElement("img");
          img.src = "http://service.simile-widgets.org/painter/painter?renderer=map-marker&shape=circle&alpha="+alpha+"&width="+w0+"&height="+h0+"&background="+col0+"&label="+val0+"&pin=false&.png"
          img.id = "img_"+this.id+"_"+n;
          img.title=this.label;
          img.style.position = "relative";
          //if(this.enable3D) {img.style.left = "-"+(parseInt(w/2))+"px"; img.style.top = "-"+(parseInt(h/2))+"px";} else {img.style.left = "-45px"; img.style.top = "-45px";}
          div.appendChild(img);
      }
      
  }
  
  this.div_ = div;
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div);
  var self=this;
}

palleOverlay.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
  var div = this.div_;
  
  var w = parseInt($(div).css('width'));
  var h = parseInt($(div).css('height'));
  
  
  div.style.left = (sw.x - w/2) + 'px';
  div.style.top = (ne.y - h/2)  + 'px';
  //div.style.width = (ne.x - sw.x) + 'px';
  //div.style.height = (sw.y - ne.y) + 'px';
  //div.style.backgroundColor = 'yellow';
  
  var self=this;
  var sel = "#img_"+this.id;
  $(div).click(function(){ openDetail(self.label, self.idObj, self.labObj,self.arrayData,self.colors,self.lenstype);});
}

palleOverlay.prototype.onRemove = function() {
    var sel = "#img_"+this.id;
    $(sel).unbind();
    this.div_.parentNode.removeChild(this.div_);
    this._div=null;
}
///////////////////////////////////////////////////////////////////////////////////////////// 

/*Funzione per il release del Canvas*/
mapView.prototype.releaseCanvas = function(){
   
   var p = this.map.center.toString();
   p = p.replace('(',"");
   p = p.replace(')',"");
   p = p.split(',');
   lat=parseFloat(p[0]);
   lng=parseFloat(p[1]);
   
    //salva lo stato se diverso da quello iniziale
   if(this._currentProxy!=0 || this._currentHighlight!=0 || Math.abs(parseInt(lat)-parseInt(this._settings.mapCenterLat))>1 || Math.abs(parseInt(lng)-parseInt(this._settings.mapCenterLng))>1){
       //var x=window.confirm("Salvare lo stato della mappa?");  
       if(true){ 
           var str = lat + "%" + lng + "%" + this.map.zoom + "%" + this._currentProxy +"%" + this._currentHighlight;
           $.cookie(this._id_div, str);   
       }
   }
   
       this._currentProxy = 0;
       this._currentHighlight = 0; 
       $('#map_canvas').remove();
       $('#map_legenda').remove();
       $('#map_detail').remove();
       $('.viewTop .highlight').html('');
        $('.viewTop .proxy').html('');
        needUpdateLegenda = true;
}






/*Funzione di update del canvas*/
mapView.prototype.updateCanvas = function(data){
    var self=this;
    for(i=0; i<this._markersArray.length; i++){
        this._markersArray[i].setMap(null); //CANCELLA I MARKER ATTUALI
    }
    this._markersArray=[];
    this._openCall=0;
    startloader();
     this._responseData = {};
    for( var v=0; v<this._currentProxyValues.length; v++){
        this._openCall++;
        this.sendProxyRequest(this._proxy[this._currentProxy], this._currentProxyValues[v]); //INVIA LE CHIAMATE PER I VARI VALORI DEI PROXY (LE CALLBACK COSTRUIRANNO IL TUTTO)
    }
}

/*Funzione per il cambio dei colorCode*/
mapView.prototype.changeColorCode = function(index){
    /*if(index ==null){
        alert('ggg');
        this._openCall=0;
        startloader();
        $('#map_detail').remove(); //chiude eventuali finestre di dettaglio
        needUpdateLegenda=true; //forza il ricalcolo della legenda
        for(i=0; i<this._markersArray.length; i++){this._markersArray[i].setMap(null);}
        this._markersArray=[];
         this._responseData = {};
        for( var v=0; v<this._currentProxyValues.length; v++){
            this._openCall++;
            this.sendProxyRequest(this._proxy[this._currentProxy], this._currentProxyValues[v]); //via con l'agiornamento della mappa
        }
    }
    else */if(this._currentHighlight != index){
        this._openCall=0;
        startloader();
        $('#map_detail').remove();
        needUpdateLegenda=true; //forza l'update della legenda colore
        this._currentHighlight = index; 
        for(i=0; i<this._markersArray.length; i++){this._markersArray[i].setMap(null);}
        this._markersArray=[];
         this._responseData = {};
        for( var v=0; v<this._currentProxyValues.length; v++){
            this._openCall++;
            this.sendProxyRequest(this._proxy[this._currentProxy], this._currentProxyValues[v]); //Chiamata di aggiornaento!
        }
    }
}

/*Funzione per il cambio dei proxy*/
mapView.prototype.changeProxy = function(index){
    if(this._currentProxy != index){
       this._openCall=0;
        startloader();
        $('#map_detail').remove();
        this._currentProxy = index; 
        this.map.setZoom(parseInt(this._proxyZoom[index]));
         this._currentProxyValues= this._proxyValues[index];
        for(i=0; i<this._markersArray.length; i++){this._markersArray[i].setMap(null);}
        this._markersArray=[];
        
         this._responseData = {};
        for( var v=0; v<this._currentProxyValues.length; v++){
            this._openCall++;
            this.sendProxyRequest(this._proxy[this._currentProxy], this._currentProxyValues[v]); //Chiamata di aggiornaento!
        }
    }
}


/*Funzione che apre il dettaglio dell'area (aggregato di lens disponibili):
a differenza degli altri canvas, non si apre direttamente la lens, ma si apre uan maschera con la lista di elementi
dell'area: cliccando poi su uno di questi, si apre la schedina*/
openDetail = function (label, idObj, labObj,arrayData,colors,lensType){
    try{
    this._contatore =0;
    this._aperta=0; 
    this._lenstype = lensType;
    var map_detail = document.createElement('div'); map_detail.id= "map_detail"; map_detail.className= "map_detail"; $('#view').append(map_detail);
	
	
    $('#map_detail').append('<div id="top_label_lens" class="top_label_lens">');
	
	
    var cB = "<img class='close' src='framework/script/images/close.png'/>";
    $('#top_label_lens').append(cB);
    $('#map_detail img.close').click(function(){
        $('#map_detail img.close').unbind();
        $('#map_detail .click').unbind();
        $('#map_detail').remove();
    });
    $('#top_label_lens').append('<span class="label">'+label+'</span>');
	
	
	$('#map_detail').append('</div>');
    
    //maschera divisa in settori: dx (top e bottom), sx
    $('#map_detail').append('<div class="data"><div class="sx"><div id="graph" class="up"></div><div class="down"></div></div><div class="dx"><div></div></div><div>');
    var h = parseInt($('#map_detail').css('height'));
     
    var ul="<div>" + "<ul>";
    
    for(var c=0; c<idObj.length; c++){
        ul= ul + "<li val='"+idObj[c]+"' n='"+c+"'><span>"+labObj[c]+"</span>";
        if(wishList[lensType]!=null){
            for(var wl=0; wl<wishList[lensType].length; wl++){
                if(wishList[lensType][wl]==labObj[c]) ul= ul + "<span class='wish'> (in wishlist)</span>"; //INTEGRAZIONE con funzionalità WISHLIST!
            }
        }
        ul= ul + "</li>"; 
        this._contatore++;
    }
    ul = ul + "</ul>"+ "</div>"
    var hup= parseInt(h*0.30);
    var hdown= parseInt(h*0.60);
    $('#map_detail .data .sx .down').html(ul);  
   
    if(arrayData.length>2) addChart(arrayData, "graph", true,colors);
    
    $('#map_detail .data .sx .down li').click(function(){
        updateLens(parseInt($(this).attr('n')));
        });
    
    $('#map_detail .data .dx div').append('<img class="aL" src="framework/script/images/left-arrow.png"/>'+'<img class="aR"src="framework/script/images/right-arrow.png"/>');
   var self=this; 
   /*Funzione per aprire la lens di un elemento dato l'ID*/
   updateLens = function(id){
       startloader();
        self._aperta=id; 
        $('#map_detail .data .sx .down li.selected').removeClass("selected");
        $('#map_detail .data .dx .lens.built').remove();
       
        sendLensRequest(idObj[id], self._lenstype);
        $('#map_detail .data .sx .down li[n="'+id+'"]').addClass('selected');
        checkPendingRequestLens = function() {
            if ($.active > 0) { setTimeout("checkPendingRequestLens()",20);} else {
                $('#map_detail .data .dx div').append($('.lens.built'));
                  checkCss();
                 //$('#map_detail .data .dx .lens.built .buttonDescr').trigger('click');
                 $(document).ready(function(){   stoploader(); })
            }
        }
        
        checkCss = function(){ //correzione css per 1280x800 
            if(window.innerHeight <800) { 
                $('#map_detail').css('height','400px'); 
                
                checkLabel = function(){ //questo script riduce la dimensione del carattere fino a fittare esattamente nello spazio disponibile!
                    var maxWidthLabel = parseInt($('#map_detail').css('width'))*0.3;
                    var wLabel =  parseInt($('#map_detail > .label').css('width'));
                    var fSize = parseInt( $('#map_detail > .label').css('font-size'));
                    fSize = fSize - 1;
                    if(wLabel > maxWidthLabel){
                         $('#map_detail > .label').css('font-size',fSize);
                         checkLabel();
                    }
                }
                
                checkLabel();
                $('#map_detail  .lensexperience .boxes').css('top','10px');
                $('#map_detail  .openOnClick div').css('width','80px');
                $('#map_detail  .openOnClick div').css('padding-top','0px');
                $('#map_detail  .openOnClick img').css('padding-top','-5px');
                $('#map_detail  .down').css('height','145px');
                $('#map_detail  .dx').css('position','relative');
                /* $('#map_detail  .dx').css('top','-20px'); */
                $('#map_detail  .dx').css('height','375px');
                $('#map_detail .lens.built').css('top','5px'); 
                $('#map_detail  .box').css('height','85px');
            } 
        }
        checkPendingRequestLens();
    }
    updateLens(0);
    
    
    $('#map_detail .data .dx div .aL').click(function(){
        if(self._aperta==0) updateLens(self._contatore-1);
        else updateLens(self._aperta-1);
    });
    
    $('#map_detail .data .dx div .aR').click(function(){
        if(self._aperta==self._contatore-1) updateLens(0);
        else updateLens(self._aperta+1);
    });
    
    }catch(err){}finally{}
}

/*FUnzione per aggiungere il grafico torta dello dsitribuzione dell' highlight nell'area geografica*/
addChart = function(arrayData, id, enable3D, colors){
  
  function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'val');
    data.addColumn('number', 'occ');
    for(var w=0; w<arrayData.length; w++){
        data.addRows([[arrayData[w], parseInt(arrayData[w+1])]]);
        w++;
    }
    colors = colors.replace(/%7C/g,',');
    var f = colors.split(",");
    var wh = 200;
    if(window.innerWidth < 1270) wh = 150;
    var options = {
      width: wh, height: wh,
      is3D: enable3D,
      legend : {position:'none'},
      backgroundColor: 'none',
      colors: f,
    };
    var chart = new google.visualization.PieChart(document.getElementById(id));
    chart.draw(data, options);
  }
  
  drawChart();
}