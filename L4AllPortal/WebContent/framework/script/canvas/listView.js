/*Script (oggetto) che costruisce il canvas Lista */


//Classe, con gli attrubuti che servono per gestire il suo stato
listView = function(containerElmt,expression) {
    this._id_div = containerElmt; //l'id del div che contiene il canvas
    this._settings = {}; //conterrà i valori delle propietà indicate sotto
    SettingsUtilities._internalCollectSettings(this._id_div, listView._settingSpecs, this._settings); //carica i valori delle variabili (vedi script /utils/)
    this._highLight = this._settings.hexpressions.split(','); //fields che vengono usati come highlight
    this._highLabels = this._settings.hlabel.split(','); //etichette da assegnare agli highlight
    this._colors = this._settings.colors.split(','); //colori da usare per gli highlight
    this._mapsColors = []; //conterrà la mappatura valore del filed->colore
    this._objects = {}; //conterrà gli oggetti e tutte le loro proprietà
    this._shapes = this._settings.shapeIcon.split(','); //forme da usare per gli highlight (nome del file senza l'estensione .png)
    for(var s=0; s<this._shapes.length; s++){
        this._shapes[s]= "framework/script/images/shape/"+this._shapes[s]+".png";
    }
    
    this._htmlHigh ="";
    this._htmlCanvas ="";
    
    //variabili di stato:
    this._currentHighlight = 0;  //highlight corrente
    
};

/*Tutti i parametri che permettono di personalizzare il canvas:
vengono definiti quando si istnazia il canvas come attributi del nodo html. Se nn dovessero essere dichiarati si usa il valore di defualt
(chiamato script in /utils/)
*/
listView._settingSpecs = {
    //parametri per lo schema del canvas
    "label": {type: "text", defaultValue: "List View"}, //etichetta del canvas (quella che verrà mostrata nel menu a tendina della scelta del canvas)
    "raw": { type: "int", defaultValue: null }, //numero di righe del mosaico
    "col": { type: "int", defaultValue: 1 }, //numero di colonne del mosaico
    "legendaColore": { type: "text", defaultValue: "" }, //etichetta della legenda del colore
    "legendaShape": { type: "text", defaultValue: "Shape:" }, //etichetta della legenda delle forme
    "sortby": { type: "text", defaultValue: null }, //filed su cui effetuare il sorting (es per ordinare per anno)
    "etichettaIcone": { type: "text", defaultValue: "id" }, //filed su cui effetuare il sorting (es per ordinare per anno)
    
    //parametri per highlight
    "hexpressions": { type: "text", defaultValue: "" }, //field che verranno usati per gli highlight
    "hlabel": { type: "text", defaultValue: "" }, //etichette degli highlight - NB: stesso ordine di quelli sopra
    "colors": { type: "text", defaultValue: "#625477,#A17FBA,#65AFB7,#60AF60,#D6E281,#FFC673,#FFE473,#ffffff" }, //colori per gli highlight
    
    //parametri per forma
    "shape": { type: "text", defaultValue: null }, //field da usare per la forma della tessera del mosaico
    "shapeIcon": { type: "text", defaultValue: "circle,square,pentagon,hexagon,triangle" },
    
    //eventuale lens da associare
    "lenstype": { type: "text", defaultValue: null }, //tipo di lens da associare agli elementi
    "sortby": { type: "text", defaultValue: "label"}
};

/*Funzione chiamata da mainApi per recuperare l'eventuale criterio di ordinamento da inserire nella query a SOLR*/
listView.prototype.sortBy = function(){
    ret="";
    if(this._settings.sortby!=null){
        ret="&sort="+this._settings.sortby +" asc";
    }
    return ret;
}

/*Funzione che raccoglie restituisce tutti i field che sono richiesti per costruire il canvas, in modo tale che siano
inclusi nel parametro "fl" della chiamata a SOLR*/
listView.prototype.fieldParams = function(){
  var ret = [];
  ret.push('id');
  ret.push('label');
  
  if(this._settings.shape != null) {
       var tmp = this._settings.shape.split('.');
       if(tmp.length > 1) ret.push(tmp[1]);
       else ret.push(this._settings.shape);
 }
  
  for(var y=0; y<this._highLight.length; y++){
     var tmp = this._highLight[y].split('.');
     if(tmp.length > 1) ret.push(tmp[1]);
     else ret.push(this._highLight[y]);
  }
  return ret;
}

/*Funzione che viene chiamata per la costruzione e computazione iniziale del Canvas*/
listView.prototype.buildCanvas = function(data){
   var self= this; //per accedere agli attributi dell'oggetto anche in funzioni interne
   
   //TENTA IL RIPRISTINO DELLO STATO DI UNA PRECEDENTE UTILIZZO DEL CANVAs (cerca nei cookie)
   //in questo caso l'unica variabile è l'highlight
   if($.cookie(this._id_div)!=null){
       this._currentHighlight = parseInt($.cookie(this._id_div));
       $.cookie(this._id_div,null);
    }
   
   /*COSTRUISCE il menu a tendina degli HIGHLIGHT*/
   if(this._highLabels.length > 0){
      ul = '<span class="label">Highlight by: </span><span class="currentSelection"><span>'+this._highLabels[this._currentHighlight]+'</span><img class="arrow" src="framework/script/images/arrowdown.png"></span><ul>';
      for(var c=0; c< this._highLabels.length; c++){
            ul += '<li val="'+c+'">'+this._highLabels[c]+'</li>';
      }
      ul += '</ul>';
      this._htmlHigh = ul;
  }  
  
  //Legge tutti gli oggetti e fa la mappatura tra filed e colore (o forma)
  var contShape=0;
  var mapShape = {};
  var contColor= [] 
   
  for(var a=0; a<this._highLight.length; a++){
    this._mapsColors[a] = {} //crea l'oggetto dove verrà salvata la mappatura valore->codice_colore
    contColor.push(0); //aggiunge all'array un elemento per ogni highlight
  } 
   
  for(var d=0; d<data.length; d++){
      var obj = {} //oggetto che conterrà tutte le info per un oggetto
      
      /*MAPPATURA DELLA FORMA*/
      var tmpShape = this._settings.shape.split('.');
      if(tmpShape.length > 1) { //se si usa un valore che è un filed di un oggetto esterno in relazione 1:1 con il principale, 
      //cerca il valore della label tra i valori caricati per costrure i widgets -ATTENZIONE CHE QUESTO POTREBBE NON ESISTERE IN ALCUNI CASI... QUINDI FALLIREBBE
      //IL CONSIGLIO, ANCHE PER VELOCIZZARE è DI USARE SEMPRE DEI FIELD CONTENUTI NELL'OGGETTO PRINCIPALE, SENZA FARE DEI RIMANDI A RELAZIONI 1:1
      //questo giochetto è stato implementato perchè far modificare il json per faculty of informatics (gestito in outsourcing) richiedeva più tempo che implementare questo trucchetto
         v = tmpShape[1];
         var exp = "[expression='"+tmpShape[0]+"']";
         var sel = exp + " [title='"+eval('data[d].'+ eval('v'))+"']";
         var v1 = $(sel).parent().parent().attr('label');
         if(mapShape[v1] == null){
              mapShape[v1] = this._shapes[contShape];
              if(contShape!=(this._shapes.length-1)){contShape++;}
         }
         obj['shape'] = mapShape[v1];
      }
      else{ //GENERALEMENTE SI ENTRA QUI!
          if(mapShape[ eval('data[d].'+this._settings.shape)] == null){ //usa la funzione eval per interpretare il valore del filed nell'oggetto e creare la sua controparte nell'oggetto mapShape
              mapShape[ eval('data[d].'+this._settings.shape)] = this._shapes[contShape];
              if(contShape!=(this._shapes.length-1)){contShape++;}
          }
          obj['shape'] = mapShape[ eval('data[d].'+this._settings.shape)];
      }
      
      /*MAPPATURA DEGLI HIGHLIGHT*/
      for(var a=0; a<this._highLight.length; a++){
          var tmp0 = this._highLight[a].split('.');
          var v = '';
          
          if(tmp0.length > 1) { //STESSO GIOCHETTO FATTO SOPRA PER RECUPERARE LE LABEL DALLE RELAZIONI 1:1
              v = tmp0[1];
              var exp = "[expression='"+tmp0[0]+"']";
              var sel = exp + " [title='"+eval('data[d].'+ eval('v'))+"']";
              var v1 = $(sel).parent().parent().attr('label');
              
              if(this._mapsColors[a][ v1 ] == null){
                  this._mapsColors[a][ v1 ] = this._colors[contColor[a]];
                  if(contColor[a]!=(this._colors.length-1)){contColor[a]++;}
              }
              obj[v] = this._mapsColors[a][ v1];
          }
          else {
              v = this._highLight[a];
              if(this._mapsColors[a][ eval('data[d].'+ eval('v'))] == null){
                  this._mapsColors[a][ eval('data[d].'+eval('v'))] = this._colors[contColor[a]];
                  if(contColor[a]!=(this._colors.length-1)){contColor[a]++;}
                  //alert( "Highlight " + this._highLight[a] +" : " + eval('data[d].'+this._highLight[a]) + " " + this._mapsColors[a][ eval('data[d].'+this._highLight[a])]);
              }
              obj[v] = this._mapsColors[a][ eval('data[d].'+eval('v'))];
          }                    
      }
      
      this._objects[eval('data[d].id')] = obj; //SALVA L'OGGETTO IN QUESTA VAR CHE SERVIRà NELLE FASI SUCCESSIVE PER RECUPERARE IL COLORE ASSOCIATO A UN ELEMENTO PER 
      //UN DETERMINATO HIGHLIGHT

  }
  
  
  /*COSTRUISCE LEGENDA DEI COLORI*/
  var legC = '<div class="legendaColore"> <span>'+this._highLabels[this._currentHighlight]+': </span> <span>'+this._settings.legendaColore+'</span>';
  for(i in this._mapsColors[this._currentHighlight]){
    legC = legC + '<span style="color:'+this._mapsColors[this._currentHighlight][i]+'">'+ i +'</span>'; 
  } 
  legC = legC + '</div>';
  
  /*COSTRUISCE LEGENDA DELLE FORME*/
  var legS = '<div class="legendaShape"> <span>'+this._settings.legendaShape+'</span>';
  for(i in mapShape){
      if(i!="undefined") legS = legS + '<span><img src="'+mapShape[i]+'"/>'+ i +'</span>'; 
      else legS = legS + '<span><img src="'+mapShape[i]+'"/>'+ "None" +'</span>';
  } 
  legS = legS + '</div>';
    
  /*VIA CON LA COSTRUZIONE DELLA LISTA
  NB: anche questo itera su ogni elemento: per accelerare si potrebbe risparmiare un ciclo e mettere anche questa parte nel ciclo sopra dove si 
  fa la mappatura delle forme e dei colori, ma poi il codice diventerebbe super complicato
  
  Idea del mosaico (refuso del mosaicview):
  il concetto delle forme non è di inserire le forme colorate, che richiederebbe avere n*m forme (n colori, m tipi di forme), ma di creare dei quadrati con
  lo sfondo colorato via CSS e di sovrapporre un immagine png che sia il "complementare" della forma: la trasparenza deve essere la forma desiderata, mente tutto
  quello che non è forma (area esterna) deve essere dello stesso colore dello sfondo del mosaico, in modo tale da andare a coprire il background colorato.
  ATTENZIONE: ora i mosaici hanno come colore di sfondo #DBDBDB, se si vuole cambiare colore bisogna rifare le forme (file .png)
   */
  var html = '<div class="viewContainer">';
  /* D.T. 10/01/2013 BEGIN */
  var itemType = Application.getContestoSecondario().getItemType();
  //resultList[itemType] = [];
  /* END */
  
  for(var d=0; d<data.length; d++){
        var C = eval('(this._objects[data[d].id]).'+this._highLight[this._currentHighlight]); //il colore delle cella
        var S = this._objects[eval('data[d].id')].shape; //la forma della cella

    html = html+ '<div idObj="'+data[d].id+'" class="mosaicCell listView on" title="'+eval('data[d].'+this._settings.etichettaIcone).replace(/"/g, '&quot;')+'" colorCode="'+ C +'"> '+eval('data[d].'+this._settings.etichettaIcone)+' </div>'; //i css le faranno flottare in modo tale che vadano a capo da sole
    /* D.T. 10/01/2013 BEGIN */
    //resultList[itemType].push(data[d].id);
    /* END */
  }
  html = html + '</div>';
  //this._htmlCanvas = legC + html + legS;
  this._htmlCanvas =  html + legC + legS; //WS spostata la legenda in basso
}

//Seconda parte della generazione del mosaico
listView.prototype.displayCanvas = function(data){
    var self=this;
    /*DISPLAY  e evento di click DELL MENU DEGLI HIGHLIGHT*/
    if(this._highLabels.length > 1){
          $('#viewSecond .viewTop .highlight').html(this._htmlHigh);
          $('#viewSecond .viewTop .highlight .currentSelection').click(function(){ //apri chiudi menu
              var ul = '#viewSecond .viewTop .highlight .currentSelection + ul';
              if($(ul).css('display')=='none') {
                  $(ul).css('display','block');
                  autoChiudi = function() { $(ul).css('display','none') }
                  setTimeout('autoChiudi()', 2000);
              }
              else $(ul).css('display','none')
          });
      
          $('#viewSecond .viewTop .highlight li').click(function(){ //apri chiudi menu
             var ul = '#viewSecond .viewTop .highlight .currentSelection + ul';
             $(ul).css('display','none');
//             self.changeColorCode($(this).attr('val'));
          });
      }

     /*display del corpo del canvas  - ATTENZIONE: le righe qui sotto vanno a posizionare il canvas al posto giusto in base ai casi*/
     if($('#viewSecond #refraso').get()[0]!=null) $('#viewSecond #refraso').before(this._htmlCanvas); 
     else $('#viewSecond').append(this._htmlCanvas);
     
     /*
      * D.Tramis: nel canvas a lista non sono necessari i colori
      */
      /*
     for(i in this._mapsColors[this._currentHighlight]){ //sistema colori
            var sel = '#viewSecond .mosaicCell.on[colorcode="'+this._mapsColors[this._currentHighlight][i]+'"]';  
            $(sel).css('background-color',this._mapsColors[this._currentHighlight][i]);  
     }  
  	*/
      var val = 50;
  
      /*si calcola la grandezza delle celle per rispettare i vincoli del numero di Colonne( andando a fissare il numero di righe
      non si riuscirebbe + ad metteregli elementi sempre allo stesso posto... perchè si aumenterebbe il numero di colonne e quindi gli 
      elementi potrebbero shiftare nelle righe sopra*/
      /*
      * D.Tramis: nel canvas a lista non è necessario adattare le dimensioni delle celle
      */
      /*if(this._settings.raw!=null){
      }
      else if(this._settings.col!=null){
          var w = $('#viewSecond').css('width');
          w = w.slice(0,w.length-2);
          w = w-30;
          val=parseInt(w/this._settings.col);
          val= val - 2;
      }
      $('#viewSecond .mosaicCell').css('width',val+'px');
      $('#viewSecond .mosaicCell').css('height',val+'px');
      */
      
      //evento per l'apertura delle lens
      if(self._settings.lenstype!=null) {
      	lenstype = self._settings.lenstype;
      } else if (Application.getContestoSecondario().getItemType() != null)
        lenstype = Application.getContestoSecondario().getItemType();
      if (lenstype != null) $('#viewSecond .mosaicCell').click(function(){ sendLensRequest($(this).attr('idobj'), lenstype)});
}

/*funzione chiamata in fase di uscita del canvas:
 -se lo stato è diverso da quello iniziale, salva lo stato come cookie
 -cancella dal dom le sue componenti
*/
listView.prototype.releaseCanvas = function(){
   if(this._currentHighlight != 0){
       //var x=window.confirm("Salvare lo stato del mosaico?");   //evnetuale prompt di richiesta di salvataggio
       if(true){  $.cookie(this._id_div, this._currentHighlight); }
    }
    this._currentHighlight = 0;
    $('#viewSecond .viewTop .highlight .currentSelection').unbind();
    $('#viewSecond .viewTop .highlight li').unbind();
    $('#viewSecond .viewTop .highlight').html('');
    $('#viewSecond .legendaColore').remove();
    $('#viewSecond .viewContainer').remove();
    $('#viewSecond .legendaShape').remove();
}

/*Funzione chiamata per fare l'update del canvas: molto + leggera di quella iniziale! */
listView.prototype.updateCanvas = function(data){
  var self= this;
  $('#viewSecond .mosaicCell').removeClass('on'); //spegni tutto
  $('#viewSecond .mosaicCell').unbind(); //togli gli eventi delle lens
  $('#viewSecond .mosaicCell').css('background-color','inherit'); //sfondo neutro
  
  /* D.T. 10/01/2013 BEGIN */
  var itemType = Application.getContestoSecondario().getItemType();
  resultList[itemType] = [];
  /* END */
  
  for(var d=0; d<data.length; d++){ //riaccendi solo quelle della lista!
    var sel = '#viewSecond .mosaicCell[idobj="'+data[d].id+'"]';
//    $(sel).addClass('on');
//    $(sel).css('background-color',$(sel).attr('colorCode'));
    $(sel).click(function(){ 
       sendLensRequest($(this).attr('idobj'), itemType);
    });
    /* D.T. 10/01/2013 BEGIN */
    if ($("[role='linkTaxonomy']").length > 0) {
    	var idField = $("[role='linkTaxonomy'][itemType='"+itemType+"']").attr("idField");
    
    	resultList[itemType].push(eval("data[d]."+idField+"[0]"));
    }
    /* END */
  }
}

/*Funzione per il cambio del codice colore: recupera dall'oggetto con tutte le mappature il giusto codice colore e lo asegna via css*/
listView.prototype.changeColorCode = function(index){
  if(this._currentHighlight != index){
        this._currentHighlight = index;
        var nodes = $('#viewSecond .viewContainer .mosaicCell').get();
        for(var t=0; t<nodes.length; t++){
            var id= $(nodes[t]).attr('idobj');
            var tmp = this._highLight[index].split('.');
            var C = '';
            if(tmp.length>1)  {
                C = this._objects[id][tmp[1]]
            }         
            else C = this._objects[id][this._highLight[index]];
            $(nodes[t]).attr('colorCode',C)
            if($(nodes[t]).hasClass('on'))$(nodes[t]).css('background-color',C);
        }
        
        //aggiorna il menu
        $('#viewSecond .highlight .currentSelection > span').html(this._highLabels[index]);
        
        //aggiorna la legenda
		var legC = "<span>"+this._highLabels[this._currentHighlight]+": </span>";
        legC = legC + '<span>'+this._settings.legendaColore+'</span>';
		
        for(i in this._mapsColors[this._currentHighlight]){
            legC = legC + '<span style="color:'+this._mapsColors[this._currentHighlight][i]+'">'+ i +'</span>'; 
        } 
        $('#viewSecond .legendaColore').html(legC);
    }
}