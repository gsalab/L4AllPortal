/*==================================================
 *  cloudFacet
 *==================================================
 */


cloudFacet = function(containerElmt,expression) {
    this._id_div = containerElmt;
    this._type = "cloudFacet";
    this._expression = expression;
    this._selectedValues = [];
    this._excludedValues = [];
    this._settings = {}; //conterrÃ  i valori delle propietÃ  indicate sotto
    SettingsUtilities._internalCollectSettings(this._id_div, cloudFacet._settingSpecs, this._settings); //carica i valori delle variabili!
    
    if(this._settings.conj=='and' || this._settings.conj=='AND') this._settings.prediction=false;
    
    this._htmlRelative='';
    this._htmlAbsolute='';
    this._htmlPercentage='';   
    this._currentView = this._settings.defaultRendering;
    this._currentSort = this._settings.defaultSortMode;
    this._currentOperator = this._settings.conj;
    this.initUI();
};

cloudFacet._settingSpecs = {
    //Parametri per la costruzione del facet
    "facetLabel":       { type: "text" }, //Etichetta mostrata nel titolo del facet
	"facetDescription":       { type: "text" , defaultValue:"" },
	"facetDescriptionWhy":       { type: "text" , defaultValue:"" },
    "widgetClass":       { type: "text" , defaultValue:""}, //Classe del widget (sarï¿½ associata a tutti gli elementi del refraso per colorare i background del colore della classe del widget)
    "separator":        { type: "boolean", defaultValue: true }, //separatore tra il titolo del facet e il corpo
    "collapsible":      { type: "boolean", defaultValue: true }, //possibilitï¿½ di chiuderlo
    "collapsed":        { type: "boolean", defaultValue: false }, //chiuso in principio
    "showNumber":    { type: "boolean", defaultValue: true }, //mostra il numero nella view assolura (mettere false quando gia si sï¿½ che saranno tutti 1)
    "prediction":      { type: "boolean", defaultValue: true },
    
    //altre funzionalitï¿½ del widget
    "enableSelectAll":       { type: "boolean", defaultValue: false}, //attiva la funzionalitï¿½ per la selezioen di tutti i valori del widget
    "refraso":           { type: "boolean", defaultValue: false}, //aggiunge il refraso della selezione corrente

    //Parametri per recupararte le label da oggetti esterni (se valori da relazioni 1:1)
    "foreignObject": {type:"text", defaultValue: null}, //cat dell'oggetto
    "foreignLabel": {type:"text", defaultValue: null}, //valore da caricare 
    
    //Parametri per gli istogrammi (view Assoluta e Percentuale)
    "histo":            { type: "boolean", defaultValue: true}, 
    "histo_maxwidth":   {type:"number", defaultValue: 100}, //larghezza massima in %, MEGLIO TOCCARE DIRETTAMENTE IL CSS
    "histo_height":   {type:"number", defaultValue: 15}, //altezza massima in pixel
    "histo_selected_color":   {type:"text", defaultValue: "blue"},
    
    //Parametri per abilitare e gestire il sorting ("value" o "alphabetic" o "fixed")
    "enableSort":       { type: "boolean", defaultValue: true },
    "defaultSortMode":         { type: "text", defaultValue: "value" }, 
    "fixedOrd":         { type: "text", defaultValue: null }, /*PER IL MOMENTO FIXED LO ESCLUDEREI DALLA ROTAZIONE!*/
    "allwaysLast":         { type: "text", defaultValue: "Non definito" },
    
    //Parametri per gestire il cambio di visualizzazione del facet
    "defaultRendering": { type: "text", defaultValue: "relative"}, //possibili valori: relative, absolute, percent
    "changeRendering":  { type: "boolean", defaultValue: false },
        //TO DO: implementare questi:
        //"disableRELATIVE":     { type: "boolean", defaultValue: false },
        //"disableABSOLUTE":   { type: "boolean", defaultValue: false },
        //"disablePERCENTAGE": { type: "boolean", defaultValue: false },
    
    //PARAMETRI PER IL NUMERO DI "PAROLE MOSTRATE" NELLA VISUALIZZAZIONE RELATIVA (CLOUD)
    "defaultNum":       { type: "int", defaultValue:  10 },
        //TO DO da implementare:
        //"minimumCount":     { type: "int", defaultValue: 1 }, //cardinalitï¿½ minima perchï¿½ un elem sia rappresetato
        //"delta":       { type: "int", defaultValue: 3 }, //di quanto incrementare/ridurre il numero di elementi mostrati su richiesta dell'utente: NB PER IL DELTA SERVE AGG LA VAR CURRENTNUM E RIVEDERE ANCHE IL SALVATAGGIO DELLO STATO
        //"minNum":       { type: "int", defaultValue: 5 }, //limite inferiore del numero di elemementi visualizzabili
        //"maxNum":       { type: "int", defaultValue: 0 }, //limite superiore di numero di elementi visualizzabili
    
    //PARAMETRI PER IL TIPO DI QUERY: AND, OR, XOR O ONE
    "conj":    { type: "text", defaultValue:"or"},
    "changeConj":     { type: "boolean", defaultValue: false },
        //TO DO: implementare questi
        //"disableAND":     { type: "boolean", defaultValue: false },
        //"disableOR":   { type: "boolean", defaultValue: false },
        //"disableONE": { type: "boolean", defaultValue: false }
    "index": {type: "boolean", defaultValue: false}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Gestione del cambio di operatore logico
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*funzione per la rotazione degli operatori logici: ONE,OR,AND*/
cloudFacet.prototype._nextConj = function(){
     //sistema la visualizzazione
    var self = this;
    var s="#"+ self._id_div + " .facet-value-selected";
    var simg= "#"+ self._id_div + " .facet-value-selected  img";
    $(simg).attr('src','framework/script/images/no-check.png');
    $(s).removeClass('facet-value-selected');
    s="#"+ self._id_div + " .facet-value-excluded";
    simg= "#"+ self._id_div + " .facet-value-excluded  img";
    $(simg).attr('src','framework/script/images/no-check.png');
    $(s).removeClass('facet-value-excluded');
    self._selectedValues= [];
    self._excludedValues= [];
    
    //ordine one->or->and->one
    if(self._settings.conj=='one'){
        self._settings.conj='or';
    }
    else if(self._settings.conj=='or'){
        self._settings.conj='and';
    }
    else if(self._settings.conj=='and'){
        self._settings.conj='one';
    }
    this._fixConj();
}

/*funzione per correggere la visualizzazione e la predizione in funz dell'operatore (separata eprchï¿½ usata anche per il ripristino)*/
cloudFacet.prototype._fixConj = function(){
    var self = this;
    if(self._settings.conj=='or'){
        self._settings.prediction=true;
    }
    else if(self._settings.conj=='and'){
        self._settings.prediction=false;
    }
    else if(self._settings.conj=='one'){
        self._settings.prediction=true;
    }
    var str="#"+ self._id_div + " .facet-header img.conj";
    $(str).attr('src',"framework/script/images/"+self._settings.conj+".png");
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Gestione del cambio di stile di visualizzazione del widget
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*funzione per la rotazione dello stile di visualizzazione: relative(cloud), absolute (numeri + histo), percentuale*/
cloudFacet.prototype._nextView = function(){
    var self = this;
    var body = '#'+ self._id_div + ' .facet-body';
            
    if (self._currentView=='relative'){
        self._currentView = 'absolute'; 
    }
    else if (self._currentView=='absolute'){ 
        self._currentView = 'percentage'; 
    }
    else if (self._currentView=='percentage'){  
        self._currentView = 'relative'; 
    } 
     
    this._fixView();
}

cloudFacet.prototype._fixView = function(){
    var self = this;
    var body = '#'+ self._id_div + ' .facet-body';
            
    if (self._currentView=='absolute'){
        $(body).removeClass('relativeView'); $(body).removeClass('percentView');
        $(body).addClass('absoluteView');
        $(body).html(self._htmlAbsolute);
        //self.sort();
    }
    else if (self._currentView=='percentage'){ 
        $(body).removeClass('absoluteView'); $(body).removeClass('relativeView');
        $(body).addClass('percentView');
        $(body).html(self._htmlPercentage);
        //self.sort();
    }
    else if (self._currentView=='relative'){  
        $(body).removeClass('percentView'); $(body).removeClass('absoluteView');
        $(body).addClass('relativeView');
        $(body).html(self._htmlRelative);
    }
    
    for(var q=0; q< self._selectedValues.length; q++){
        var s = '#'+ self._id_div + ' .facet-value[val="'+self._selectedValues[q]+'"]';
        $(s).addClass('facet-value-selected');
    }
    
    for(var q=0; q< self._excludedValues.length; q++){
        var s = '#'+ self._id_div + ' .facet-value[val="'+self._excludedValues[q]+'"]';
        $(s).addClass('facet-value-excluded');
    }
    
    var selImg = '#'+ self._id_div + ' .facet-header img.changeview';
    $(selImg).attr('src','framework/script/images/'+self._currentView+'.png');
    
    var s = '#'+ self._id_div + ' .facet-value-selected img';
    $(s).attr('src','framework/script/images/black-check.png');
    
    s = '#'+ self._id_div + ' .facet-value-excluded img';
    $(s).attr('src','framework/script/images/excluded-check.png');
}

/*Inizializzazione del widget*/
cloudFacet.prototype.initUI = function(){
    FacetUtilities.constructFacetFrame(this._id_div, this._settings.facetLabel,this._settings.collapsible, this._settings.separator, this._settings.facetDescription, this._settings.facetDescriptionWhy);
    var self = this;
    
    if(this._settings.enableSelectAll){
        var s = '#' + this._id_div + " .facet-header";
		// WS per spostare posizione widget 1611
		$(s +' #resetwdg').before('<img class="selectAll" src="framework/script/images/black-check.png" title="Seleziona tutto"></img>');
		// FINE WS per spostare posizione widget 1611 
        //$(s).append('<img class="selectAll" src="framework/script/images/black-check.png" title="Seleziona tutto"></img>');
        s  = '#' + this._id_div + " .facet-header .selectAll";
        $(s).click(function(){ self.selectAll();});
    }
    if(this._settings.changeConj){ //!ATTENZIONE!: ora mette l'immaginetta della congiunzione solo il parametro Ã¨ TRUE
        var str="#"+ this._id_div + " .facet-header";
        var path = "framework/script/images/"+this._settings.conj+".png";
		// WS per spostare posizione widget 1611
		$(str +' #resetwdg').before('<img class="conj" src="'+path+'" title="Tipo di scelta"></img>');
		// FINE WS per spostare posizione widget 1611 
        //$(str).append('<img class="conj" src="'+path+'" title="Tipo di scelta"></img>');
        
        str = str + ' img.conj';
        $(str).click(function(){
            self._nextConj(); 
            self._notifyCollection();
            sendUpdateRequest();
        });
    }
    if(this._settings.changeRendering){ //!ATTENZIONE!: ora mette l'immaginetta della congiunzione solo il parametro Ã¨ TRUE
        var str="#"+ this._id_div + " .facet-header";
        var path = "framework/script/images/"+this._settings.defaultRendering+".png";
		// WS per spostare posizione widget 1611
		$(str +' #resetwdg').before('<img class="changeview" src="'+path+'" title="Visualizzazione corrente"></img>');
		// FINE WS per spostare posizione widget 1611        
		//$(str).append('<img class="changeview" src="'+path+'" title="Visualizzazione corrente"></img>');
        
        str = str + ' img.changeview';
        $(str).click(function(){
            self._nextView();
            self._notifyCollection();
            sendUpdateRequest(); //UNISALENTO
        });
    }
    if(this._settings.enableSort){
            var s = '#' + this._id_div + " .facet-header";
			// WS per spostare posizione widget 1611
			$(s +' #resetwdg').before('<img class="sort" src="framework/script/images/'+ this._currentSort +'.png" title="Strategia di ordinamento"></img>');
			// FINE WS per spostare posizione widget 1611 
            //$(s).append('<img class="sort" src="framework/script/images/'+ this._currentSort +'.png" title="Strategia di ordinamento"></img>');
            s  = '#' + this._id_div + " .facet-header .sort";
            $(s).click(function(){ self.changeSort();});
    }
}

/*Funzione gestire widget che mostrano valori di una relazione 1:1 - Restituisce i tipo di oggetto da caricare in memoria e il field da caricare*/
cloudFacet.prototype.getForeignObject = function(){
 if(this._settings.foreignObject!=null && this._settings.foreignLabel!=null) return this._settings.foreignObject+"%"+this._settings.foreignLabel;
 else return null;
}

/*Restituisce il field del dataset di SOLR del widget*/
cloudFacet.prototype.getExpression = function(){
 return this._expression; 
}

/*Costruzione del corpo del widget*/
cloudFacet.prototype.facetBody = function(data,num){
  var self=this;
  var id = '#'+ this._id_div;
  $(id).addClass('cloudFacet'); //aggiunge la classe
 
   var body = '#'+ this._id_div + ' .facet-body';
   $(body).html("");

/*COSTRUZIONE DELLA VIEW RELATIVA (CLASSICO CLOUD)*/
     var min_value=100000;
     var max_value=0;

     for(var t=0; t<data.length; t++){
         if(data[t] != null && data[t] != ""){
             if(data[t+1]> max_value) max_value=data[t+1];
             if(data[t+1]< min_value) min_value=data[t+1];
         }
         else{
             if(this._settings.showMissing){
                 if(data[t+1] > max_value) max_value=data[t+1];
                 if(data[t+1] < min_value) min_value=data[t+1];
             }
         }
         t=t+1;
     }    
    
    var range = max_value - min_value; if(range==0) range=1;
     for(var t=0; t<data.length; t++){
        if(data[t]!=null && data[t]!=""){
        	
        	var label = data[t];
            if(this._settings.foreignObject!=null){
                label = foreignObjects[this._settings.foreignObject].data[data[at]];
            }
            /* D.T. 16/01/2013 - BEGIN: fix delle label contenenti il carattere '"' */
            var value = label.replace(/"/g, '&quot;');
            /* D.T. 16/01/2013 - END */
            html='<span class="facet-value'+ ((this._isSelected(value))?' facet-value-selected"':'"')+' val="'+value+'">' +label+' </span>';
            $(body).append(html);
        }
        /*else{
            if(this._settings.showMissing){
                data[t]= this._settings.missingLabel;
                html='<span class="facet-value facet-value-label'+ ((this._isSelected(data[t]))?' facet-value-selected"':'"') +' val="'+data[t]+'">' +data[t] +'</span>';
                $(body).append(html);
            }
        }*/
    
        var str='#'+ this._id_div +' .facet-value[val="'+data[t].replace(/"/g, '&quot;')+'"]';
        $(str).css('font-size',Math.ceil(70 + 100 * Math.log(1 + 1.5 * (data[t+1] - min_value) / range)) + "%");
        if(((t/2)> this._settings.defaultNum) && (this._settings.defaultNum!=0)){
             $(str).css('display','none');
        }
        t++;
     }
     
    this._htmlRelative = $(body).html();
    $(body).html('');
	

  
//COSTRUISCE VIEW ASSOLUTA
     var values_histogram = {};
     for(var t=0; t<data.length; t++){
         if(data[t]!=null && data[t]!=""){
            
            var label = data[t];
            if(this._settings.foreignObject!=null){
                label = foreignObjects[this._settings.foreignObject].data[data[t]];
            }
            var value = label.replace(/"/g, '&quot;');
            html='<div class="facet-value'+ ((this._isSelected(label))?' facet-value-selected"':'"') +' val="'+value+'">'
                 +'<div class="facet-value-chackbox"><img src="framework/script/images/no-check.png"></img></div>'
                 +'<div class="facet-value-label">'+label+'</div>'
                 + ((this._settings.showNumber) ? '<div class="facet-count">'+data[(t+1)]+'</div>' : "")  
                 +'<div class="facet-histo"><div class="inner"></div></div>';
            values_histogram[label] = data[(t+1)];
            html = html+ '</div>';
            $(body).append(html);
        }
        t++;
     }
    if(this._settings.histo) this._buildHistogram(values_histogram);
    this._htmlAbsolute = $(body).html();
    $(body).html('');

//COSTRUISCE VIEW PERCENTUALE 
     var values_histogram = {};

     var tot = 0;
     var val_null=0;
     for(var t=0; t<data.length; t++){ //!ATTENZIONE: C'E' QUALCOSA CHE NON VA NEI DATI: il valore nullo va sempre specificato come stringa vuota "". Altrimenti la visione % non ha senso
        if(data[t]=="" || data[t]==null){val_null= val_null + data[(t+1)]}
        else {tot= tot + data[(t+1)];} 
        t++;
     }
          
     for(var t=0; t<data.length; t++){
        var val=  (parseInt((data[(t+1)]/num)*1000))/10;
        var label = data[t];
        var value = label.replace(/"/g, '&quot;');
        if(label==null || label==""){
            //if( !this._settings.showMissing){  NEL CASO DELLA VISIONE A PERCENTUALE, IL VALORE NULLA VA PER FORZA PRESO IN CONSIDERAZIONE! ALTRIMENTI LA SOMMA SAREBBE <100% (OK SE VIENE MAGGIORE DI 100% QUANDO IL FACET Ã¨ MULTIVALORE)
                label = this._settings.missingLabel; 
                html='<div class="facet-value'+ ((this._isSelected(value))?' facet-value-selected"':'"') +' val="'+value+'">'
                     +'<div class="facet-value-chackbox"><img src="framework/script/images/no-check.png"></img></div>'
                     +'<div class="facet-value-label">'+label+'</div>'
                     +'<div class="facet-count">'+val+'%</div>'  
                     +'<div class="facet-histo"><div class="inner"></div></div>';
                
                html = html+ '</div>';
                $(body).append(html);
            //}
        }
        else{
            if(this._settings.foreignObject!=null){
                label = foreignObjects[this._settings.foreignObject].data[data[t]];
            }
            var value = label.replace(/"/g, '&quot;');
            html='<div class="facet-value'+ ((this._isSelected(value))?' facet-value-selected"':'"') +' val="'+value+'">'
                     +'<div class="facet-value-chackbox"><img src="framework/script/images/no-check.png"></img></div>'
                     +'<div class="facet-value-label">'+label+'</div>'
                     +'<div class="facet-count">'+val+'%</div>' 
                     +'<div class="facet-histo"><div class="inner"></div></div>';
                
                html = html+ '</div>';
                $(body).append(html);
        }
        t++;
     }
     
    this._htmlPercentage = $(body).html();
    $(body).html('');

/*SCELTA DI QUALE VIEW MOSTRARE*/
if (this._settings.defaultRendering=='relative'){ 
    $(body).addClass('relativeView');
    $(body).html(this._htmlRelative);
}
else if (this._settings.defaultRendering=='absolute'){ 
    $(body).addClass('absoluteView');
    $(body).html(this._htmlAbsolute);
    var a0 = '#'+ this._id_div +' .facet-count';
    $(a0).css('display','inline');
}
else if (this._settings.defaultRendering=='percentage'){  
     $(body).addClass('percentView');
     $(body).html(this._htmlPercentage);
     var a0 = '#'+ this._id_div +' .facet-count';
     $(a0).css('display','inline');
}

/*GESTIONE EVENTO CLICK*/
var values =  '#'+ this._id_div + ' .facet-body .facet-value';
$(values).click(function(){
    self._manageClick(this);
});

//var str = '#'+ this._id_div +' .clear'; //WS 2111 modificato perche modificata la classe clear in resetwdg
var str = '#'+ this._id_div +' .resetwdg';
$(str).unbind();
$(str).click(function(){self._clearSelections();});
//$('#top .float .clearAll').click(function(){  self._clearSelections();}); //QUESTO EVENTO andrÃ  solo quando ci sarÃ  l'iconcina del resetAll!
//***************************************************************

var str0 = '#'+ this._id_div +' .facet-header-collapse';
if(this._settings.collapsed) $(str0).trigger('click');

this.sort(); 
}

//////////////////////////////////////////////////////////////////////////
//Funzioni per l'aggiornaamento dello stato del portale:
//////////////////////////////////////////////////////////////////////////
/*funzione che gestisce i click sugli elementi*/
// D.T. Begin - modificato per la gestione del terzo stato della selezione 
cloudFacet.prototype._manageClick = function(node){ 
    var label=$(node).attr('val');
    var tristate = true;  // TODO: metterlo in this._settings ???
    
    if (!tristate) {
    	if(this._settings.conj=='one' && !this._isSelected(label)){ //se l'operatore ï¿½ ONE (e nn ï¿½ l'elemento selezionato) deseleziona tutto quello che ï¿½ attualmente selezionato
	        var r = '#' +this._id_div + ' .facet-value-selected';
	        var simg= "#"+ this._id_div + " .facet-value-selected  img";
	        $(simg).attr('src','framework/script/images/no-check.png');
	        $(r).removeClass('facet-value-selected');
	        this._selectedValues=[];
	    }
    	if(this._isSelected(label)){ //se e' selezionato, vai di deselezione
	        this._removeSelection(label);
	        $(node).removeClass('facet-value-selected');
	        var tmp = '#'+this._id_div + ' [val="'+$(node).attr('val')+'"] img';
	        $(tmp).attr('src','framework/script/images/no-check.png');
	    }
	    else { //se nn ï¿½ selezionato, seleziona
	        this._selectedValues.push(label);
	         $(node).addClass('facet-value-selected');
	         var tmp = '#'+this._id_div + ' [val="'+$(node).attr('val')+'"] img';
	         $(tmp).attr('src','framework/script/images/black-check.png');
	    }
    } else {
    	if(this._settings.conj=='one' && !this._isSelected(label) && !this._isExcluded(label)){ //se l'operatore ï¿½ ONE (e nn ï¿½ l'elemento selezionato) deseleziona tutto quello che ï¿½ attualmente selezionato
	        var r = '#' +this._id_div + ' .facet-value-selected';
	        var simg= "#"+ this._id_div + " .facet-value-selected  img";
	        $(simg).attr('src','framework/script/images/no-check.png');
	        $(r).removeClass('facet-value-selected');
	        r = '#' +this._id_div + ' .facet-value-excluded';
	        simg= "#"+ this._id_div + " .facet-value-excluded  img";
	        $(simg).attr('src','framework/script/images/no-check.png');
	        $(r).removeClass('facet-value-excluded');
	        this._selectedValues=[];
	        this._excludedValues=[];
	    }
	    
	    if (this._isSelected(label)) { //se e' selezionato, lo esclude
	    	this._removeSelection(label);
			$(node).removeClass('facet-value-selected');
			this._excludedValues.push(label);
			$(node).addClass('facet-value-excluded');
	        var tmp = '#'+this._id_div + ' [val="'+$(node).attr('val')+'"] img';
	        $(tmp).attr('src','framework/script/images/excluded-check.png');
	    } else if (this._isExcluded(label)) {  // se Ã¨ escluso lo deseleziona
	    	this._removeExcluded(label);
		    $(node).removeClass('facet-value-excluded');
	        var tmp = '#'+this._id_div + ' [val="'+$(node).attr('val')+'"] img';
	        $(tmp).attr('src','framework/script/images/no-check.png');
		} else { //se nn Ã¨ selezionato ne' escluso, seleziona
	        this._selectedValues.push(label);
	        $(node).addClass('facet-value-selected');
	        var tmp = '#'+this._id_div + ' [val="'+$(node).attr('val')+'"] img';
	        $(tmp).attr('src','framework/script/images/black-check.png');
	    }
    }
    
    this._notifyCollection(); //metodo che gestisce il refraso
     sendUpdateRequest(); //richiede nuova chiamata di update per lanciare la query di aggiornamento del portale
}
// D.T. End

// D.T. Begin - funzione per capire se un elemento tristate e' escluso
cloudFacet.prototype._isExcluded = function (value) {
	var ret = false;
    
    for(var c=0; c<this._excludedValues.length; c++){
        if(this._excludedValues[c]==value){ret = true};
    }
    return ret;
}
// D.T. End

/*funzione che verifica se un elemento e' selezionto*/
cloudFacet.prototype._isSelected = function(value){
    var ret = false;
    
    for(var c=0; c<this._selectedValues.length; c++){
        if(this._selectedValues[c]==value){ret = true};
    }
    return ret;
}

/*funzione che gestisce il refraso*/
cloudFacet.prototype._notifyCollection = function(){
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
        if(this._selectedValues.length==0 && this._excludedValues.length==0){
            $('#refraso .body:empty').append('<span class="default">'+refraso[itemType].all+'</span>');
            var html = $('#refraso .body').html();
            html=html.replace(/ /g,"");
            if(html=='') $('#refraso .body').append('<span class="default">'+refraso[itemType].all+'</span>');        }
        else{
            var val= '#refraso .body';
            $('#refraso .body .default').remove();
        
            var str= '<span class="'+this._settings.widgetClass+' '+this._id_div+'"><span class="label">'+this._settings.facetLabel+': </span><span class="values">';
            for(var y=0; y<this._selectedValues.length; y++){
                
                if(this._settings.foreignObject==null){
                    str = str + "<span>"+this._selectedValues[y]+"</span>";
                    if(y<this._selectedValues.length-1){str = str + "<span> "+this._settings.conj.toUpperCase()+" </span>";} 
                }
                else{
                    str = str + "<span>"+ foreignObjects[this._settings.foreignObject].data[this._selectedValues[y]] +"</span>";
                    if(y<this._selectedValues.length-1){str = str + "<span> "+this._settings.conj.toUpperCase()+" </span>";} 
                }  
            }
            
            for(var y=0; y<this._excludedValues.length; y++){
                
                if(this._settings.foreignObject==null){
                    str = str + "<span> NOT "+this._excludedValues[y]+"</span>";
                    if(y<this._excludedValues.length-1){str = str + "<span> "+this._settings.conj.toUpperCase()+" </span>";} 
                }
                else{
                    str = str + "<span> NOT "+ foreignObjects[this._settings.foreignObject].data[this._excludedValues[y]] +"</span>";
                    if(y<this._excludedValues.length-1){str = str + "<span> "+this._settings.conj.toUpperCase()+" </span>";} 
                }  
            }
            
            str = str + '</span></span>';
            if($(val).html()!=""){str = '<span class="and"> AND </span> '+ str}
            $(val).append(str);
        }      
    }
    
     $('#refraso .body .and + .and').remove();
}

/*funzione che elimina tutte le selezioni correnti*/
cloudFacet.prototype._clearSelections = function(){
    this._selectedValues= [];
    this._excludedValues= [];
    //sistema la visualizzazione
    var s="#"+ this._id_div + " .facet-value-selected";
    var simg= "#"+ this._id_div + " .facet-value-selected  img";
    $(simg).attr('src','framework/script/images/no-check.png');
    
    $(s).removeClass('facet-value-selected');
    
    s="#"+ this._id_div + " .facet-value-excluded";
    simg= "#"+ this._id_div + " .facet-value-excluded  img";
    $(simg).attr('src','framework/script/images/no-check.png');
    
    $(s).removeClass('facet-value-excluded');
    
    this._notifyCollection();
    sendUpdateRequest();
}

/*funzione per rimuovere un elemento dalla selezione*/
cloudFacet.prototype._removeSelection = function(value){
    for(var i=0; i<this._selectedValues.length;i++ ){ 
        if(this._selectedValues[i]==value)
        this._selectedValues.splice(i,1); 
    } 
}

/*funzione per rimuovere un elemento tra quelli esclusi*/
cloudFacet.prototype._removeExcluded = function(value){
    for(var i=0; i<this._excludedValues.length;i++ ){ 
        if(this._excludedValues[i]==value)
        this._excludedValues.splice(i,1); 
    } 
}

/*prepara il parametro FQ  di SOLR relativo ai vincoli del facet*/
cloudFacet.prototype.getRestriction = function(){
    var str="";
    /*
    *To Do: se si vuole aggiungere anche la previsione ai facet, serve usare la notazione {!tag=dt} dopo "fq=..." e {!ex=dt} dopo "facet.field=..." 
    */
    if(this._selectedValues.length>0 && this._excludedValues.length==0){
                
        if(this._selectedValues.length==1){
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}'+this._expression+':"'+this._selectedValues[0].replace(/"/g, '\\"')+'"';
            else str= 'fq='+this._expression+':"'+this._selectedValues[0].replace(/"/g, '\\"')+'"';
        }
        else{
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}('+this._expression+':"'+this._selectedValues[0].replace(/"/g, '\\"')+'"';
            else str='fq='+this._expression+'('+this._expression+':"'+this._selectedValues[0].replace(/"/g, '\\"')+'"';
            for(var f=1; f<this._selectedValues.length; f++){
                var t='';
                if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
                else t='OR';
                str= str + " "+t+" " +  this._expression+':"'+this._selectedValues[f].replace(/"/g, '\\"')+'"';
            }
            str = str + ')';
        }
    }
    
    // D.T. Begin - query per i tag da ESCLUDERE
    if(this._excludedValues.length>0 && this._selectedValues.length==0){
                
        if(this._excludedValues.length==1){
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}'+this._expression+':(NOT "'+this._excludedValues[0].replace(/"/g, '\\"')+'")';
            else str= 'fq='+this._expression+':(NOT "'+this._excludedValues[0].replace(/"/g, '\\"')+'")';
        }
        else {
        	if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}('+this._expression+':(NOT "'+this._excludedValues[0].replace(/"/g, '\\"')+'"';
            else str='fq='+this._expression+'('+this._expression+':(NOT "'+this._excludedValues[0].replace(/"/g, '\\"')+'"';
            var t='NOT';
            for(var f=1; f<this._excludedValues.length; f++){
                
                //if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
                //else t='OR';
                str= str + " "+t+" "+ this._expression+':"'+this._excludedValues[f].replace(/"/g, '\\"')+'"';
            }
            str = str + '))';
        }
    }
    
    if (this._selectedValues.length>0 && this._excludedValues.length>0) {
    	if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}('+this._expression+':"'+this._selectedValues[0].replace(/"/g, '\\"')+'"';
        else str='fq='+this._expression+'('+this._expression+':"'+this._selectedValues[0].replace(/"/g, '\\"')+'"';
        var t='';
        for(var f=1; f<this._selectedValues.length; f++){
            if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
            else t='OR';
            //t='AND';
            str= str + " "+t+" "+ this._expression+':"'+this._selectedValues[f].replace(/"/g, '\\"')+'"';
        }
        t='NOT';
        str= str + " "+t+" " +  this._expression+':"'+this._excludedValues[0].replace(/"/g, '\\"')+'"';
        for(var f=1; f<this._excludedValues.length; f++){
            //if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
            //else t='NOT';
            str= str + " "+t+" "+ this._expression+':"'+this._excludedValues[0].replace(/"/g, '\\"')+'"';
        }
        str = str + ')';
    }
    /*
    if (this._selectedValues.length>0 && this._excludedValues.length>0) {
    	if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}('+this._expression+':"'+this._selectedValues[0]+'"';
        else str='fq='+this._expression+'('+this._expression+':"'+this._selectedValues[0]+'"';
        var t='';
        for(var f=1; f<this._selectedValues.length; f++){
            
            //if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
            //else t='OR';
            //t='AND';
            str= str + " "+t+" \+" +'"'+this._selectedValues[f]+'"';
        }
        //t='AND';
        str= str + " "+t+" \-" +'"'+this._excludedValues[0]+'"';
        for(var f=1; f<this._excludedValues.length; f++){
            //if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
            //else t='OR';
            //t='AND';
            str= str + " "+t+" \-" + '"'+this._excludedValues[0]+'"';
        }
        str = str + ')';
    }*/
    // D.T. End
    
    return str;
}

cloudFacet.prototype.getEmptyRestriction = function(){
	return 'fq={!tag=d'+this._expression+'}'+this._expression+':*';
}

/*Restituisce la porzione di parametro SOLR destinato alla predizione (per l'OR, nella computazione
dei facet deve essere inserita anche la parte di elementi che nn soddisfano la richiesta, altrimenti
l'esplorazione sarebbe sempre e solo per scrematura)*/
cloudFacet.prototype.getPrediction = function(){
   var str = null;
   if(this._settings.prediction){str='facet.field={!ex=d'+this._expression+'}'+this._expression}
   else str='facet.field='+this._expression;
   //if(this._settings.prediction){str='facet.field={!ex=d'+this._expression+'}'+this._expression+'&facet.sort='+this._expression+':index'}
   //else str='facet.field='+this._expression+'&facet.sort='+this._expression+':index';
   return str;
}

/*Metodo di update del widget*/
cloudFacet.prototype.facetUpdate = function(data,num){ //UNISALENTO PROBLEMA
	
	$.log("cloudFacet.facetUpdate:" + this._id_div);
	
     var self=this;
     var values_histogram = {};
     var body = '#'+ this._id_div + ' .facet-body';
     var values =  '#'+ this._id_div + ' .facet-body .facet-value';
     $(values).css('display','none');
     this._fixView();
     
//visualizzazione relativa
    if (this._currentView=='relative'){ 
     var self=this;
     var min_value=10000;
     var max_value=0;

     for(var t=0; t<data.length; t++){
         if(data[t] != null && data[t] != ""){
             if(data[t+1] > max_value) max_value=data[t+1];
             if(data[t+1] < min_value) min_value=data[t+1];
         }
         else{
             if(this._settings.showMissing){
                 if(data[t+1] > max_value) max_value=data[t+1];
                 if(data[t+1] < min_value) min_value=data[t+1];
             }
         }
         t=t+1;
     }    
   
     var range = max_value - min_value;
     if (range==0) range=1;
   
     for(var t=0; t<data.length; t++){
        if(data[t+1]>0){
            var str='#'+ this._id_div + ' .facet-value[val="'+data[t].replace(/"/g, '&quot;')+'"]';
            $(str).css('display','inline');
            $(str).css('font-size',Math.ceil(70 + 100 * Math.log(1 + 1.5 * (data[t+1] - min_value) / range)) + "%");
            t++;
        }
     }
    /*A questo punto sono accese tutte le parole valide per la selezione: bisogna fare in modo di lasciare accese solo le top N-parole*/         
    var nSel = $('#'+this._id_div+' .facet-value-selected').get().length;
    var restanti = this._settings.defaultNum - nSel;
    
    var nnSelezionati = $('#'+this._id_div+' .facet-value:not(.facet-value-selected)').get();
     
    comparator = function (a, b) {
                var x = $(a).html().toUpperCase(); 
                var y = $(b).html().toUpperCase();
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if ($(a).css('font-size') > $(b).css('font-size')) {return -1;}
                if ($(a).css('font-size') < $(b).css('font-size')) {return 1;}
    }
    nnSelezionati.mergeSort(comparator); //ordina per cardinalitï¿½ le parole nn selezionare e mostra solo le prime N
    $('#'+this._id_div+' .facet-value:not(.facet-value-selected)').css('display','none');
    for(var h=0; h<restanti; h++){
        try{
        var sel = '#'+this._id_div+' .facet-value[val="'+$(nnSelezionati[h]).attr('val')+'"]';
        $(sel).css('display','inline');
        }catch(err){ }finally{}
    } 
     
    var values =  '#'+ this._id_div + ' .facet-body .facet-value';
    $(values).unbind();
    $(values).click(function(){
      self._manageClick(this);
    });
	
	this.sort(); // ws 1911 inserito il ricalcola 
	}
/*vista assoluta*/
 else if (this._currentView=='absolute'){   
     var self=this;
     var values_histogram = {};
     var body = '#'+ this._id_div + ' .facet-body';
     $(body).addClass('absoluteView');
     
     for(var t=0; t<data.length; t++){
        if(data[t+1]>0){
            var str = '#'+ this._id_div + ' .facet-body .facet-value[val="'+data[t]+'"]';
            var str0 = '#'+ this._id_div + ' .facet-body .facet-value[val="'+data[t]+'"] .facet-count';
            $(str).css('display','block');
            $(str0).html(data[t+1]);
            values_histogram[data[t]] = data[(t+1)];
        }
        t++;
        
     }
     
    if(this._settings.histo) this._buildHistogram(values_histogram);

    var values =  '#'+ this._id_div + ' .facet-body .facet-value';
    var values_selected =  '#'+ this._id_div + ' .facet-body .facet-value-selected';
    if($(values_selected).get().length>0){
        $(values).css('color', 'grey');
        $(values_selected).css('color', 'black');
        
        var a0 = '#'+ this._id_div +' .facet-count';
        //$(a0).css('display','none'); //WS 2111 commentato per rendere visibile snche i valori deselezionati
        a0 = '#'+ this._id_div +' .facet-value-selected .facet-count';
        $(a0).css('display','inline');
    }
    else{
        $(values).css('color', 'black');
        var a0 = '#'+ this._id_div +' .facet-count';
        $(a0).css('display','inline');
    }
    $(values).unbind();
    $(values).click(function(){
      self._manageClick(this);
    });
	
	this.sort(); // ws 1911 inserito il ricalcola 
}
/*vista percentuale*/
else if (this._currentView=='percentage'){  
     var self=this;
     var values_histogram = {};
     var body = '#'+ this._id_div + ' .facet-body';
     $(body).addClass('percentView');

     var tot = 0;
     var val_null=0;
     for(var t=0; t<data.length; t++){
        if(data[t]=="" || data[t]==null){val_null= val_null + data[(t+1)]}
        else {tot= tot + data[(t+1)];} 
        t++;
     }
          
     for(var t=0; t<data.length; t++){
        var val=  (parseInt((data[(t+1)]/num)*1000))/10;
        if(val>0){
            var str = '#'+ this._id_div + ' .facet-body .facet-value[val="'+data[t].replace(/"/g, '&quot;')+'"]';
            var str0 = '#'+ this._id_div + ' .facet-body .facet-value[val="'+data[t].replace(/"/g, '&quot;')+'"] .facet-count';
            $(str).css('display','block');
            $(str0).html(val+"%");
            values_histogram[data[t]] = data[(t+1)];
        }
        t++;
     }
     
    var values =  '#'+ this._id_div + ' .facet-body .facet-value';
    var values_selected =  '#'+ this._id_div + ' .facet-body .facet-value-selected';
    if($(values_selected).get().length>0){
        $(values).css('color', 'grey');
        $(values_selected).css('color', 'black');
        
        var a0 = '#'+ this._id_div +' .facet-count';
        $(a0).css('display','none');
        a0 = '#'+ this._id_div +' .facet-value-selected .facet-count';
        $(a0).css('display','inline');
        
    }
    else {
        $(values).css('color', 'black');
        var a0 = '#'+ this._id_div +' .facet-count';
        $(a0).css('display','inline');
    }
    
    $(values).unbind();
    $(values).click(function(){
      self._manageClick(this);
    });
    }
    
    /*if(this._currentSort=='value' || this._currentSort=='valueCres') */this.sort(); //ricalcola l'ordine dei nodi html solo se ordinamento per valore (altrimenti l'ordine nn cambia!)
}


//funzione per ordinare: in base al tipo di ordinamento, cambia la funzione comparator da passare al mergesort
cloudFacet.prototype.sort = function(){
    var comparator = null;
    var self = this;
    var sel = "#" + this._id_div + ' .facet-body .facet-value';
    $(sel).unbind();
    var nodes = $(sel).get();
   
     if(this._currentSort == 'alphabetic'){
        comparator = function (a, b) {
            if(self._currentView=='relative'){
                var x = $(a).html().toUpperCase(); 
                var y = $(b).html().toUpperCase();
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if (x < y) {return -1;}
                if (x > y) {return 1;}
                return 0;
            }
            else{
                var x = $(a).children('.facet-value-label').html().toUpperCase(); 
                var y = $(b).children('.facet-value-label').html().toUpperCase();
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if ( x < y ) {return -1;}
                if ( x > y) {return 1;}
                return 0;
            }
        }
     }
    
    else if(this._currentSort == 'value'){
        comparator = function (a, b) {
            if(self._currentView=='relative'){
                var x = $(a).html().toUpperCase(); 
                var y = $(b).html().toUpperCase();
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if ($(a).css('font-size') > $(b).css('font-size')) {return -1;}
                if ($(a).css('font-size') < $(b).css('font-size')) {return 1;}
                return 0;

            }
            else{
				
                var x = $(a).children('.facet-value-label').html().toUpperCase(); 
                var y = $(b).children('.facet-value-label').html().toUpperCase();
				
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if (parseInt($(a).children('.facet-count').html()) < parseInt($(b).children('.facet-count').html())) {return 1;}
                if (parseInt($(a).children('.facet-count').html()) > parseInt($(b).children('.facet-count').html())) {return -1;}
                return 0;
            }
        }
    }
	//
	//WS 1911 ordinamento crescente numerico
	//
    else if(this._currentSort == 'valueCres'){
        comparator = function (a, b) {
            if(self._currentView=='relative'){
                var x = $(a).html().toUpperCase(); 
                var y = $(b).html().toUpperCase();
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if ($(a).css('font-size') < $(b).css('font-size')) {return -1;}
                if ($(a).css('font-size') > $(b).css('font-size')) {return 1;}
                return 0;

            }
            else{
                var x = $(a).children('.facet-value-label').html().toUpperCase(); 
                var y = $(b).children('.facet-value-label').html().toUpperCase();
				
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if (parseInt($(a).children('.facet-count').html()) > parseInt($(b).children('.facet-count').html())) {return 1;}
                if (parseInt($(a).children('.facet-count').html()) < parseInt($(b).children('.facet-count').html())) {return -1;}
                return 0;
            }
        }
    }
	//
	//WS 1911 ordinamento crescente numerico FINE
	//
    else if(this._currentSort == 'fixed'){
        comparator = function (a, b) {
            
            getFixedIndex = function(check){
                var ret = 1000000;
				
                var ordine = self._settings.fixedOrd.split(',');
				
                for(var e=0; e<ordine.length; e++){
					
                    if(ordine[e].toUpperCase()== check) ret = e;
                }
                return ret;
            }
            
            if(self._currentView=='relative'){
				//var x = $(a).html().toUpperCase();
				//var y = $(b).html().toUpperCase();
                var x = $(a).attr('val').toUpperCase(); // WS1911 messo il controllo sul val perche sull' html non andava
                var y = $(b).attr('val').toUpperCase(); // WS1911 messo il controllo sul val perche sull' html non andava
				
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if (getFixedIndex(x) < getFixedIndex(y)) {return -1;}
                if (getFixedIndex(x) > getFixedIndex(y)) {return 1;}
				
                return 0;
            }
            else{
                var x = $(a).children('.facet-value-label').html().toUpperCase(); 
                var y = $(b).children('.facet-value-label').html().toUpperCase();
				
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if ( getFixedIndex(x) < getFixedIndex(y) ) {return -1;}
                if ( getFixedIndex(x) > getFixedIndex(y) ) {return 1;}
				
                return 0;
            }
        }
    }
    
     nodes.mergeSort(comparator);
     sel =  "#" + this._id_div + ' .facet-body';     
     for(var r=0; r<nodes.length; r++){$(sel).append(nodes[r]);} //appende i singoli nodi riordinati
          
     sel = "#" + this._id_div + ' .facet-body .facet-value';
     var self=this;
     $(sel).click(function(){self._manageClick(this);}); //aggiunge evento di selezione
} 
    
//funzione per i cambi di ordinamento
cloudFacet.prototype.changeSort = function(){
    var self = this;
    var sel = "#" + this._id_div + ' .facet-body .facet-value';
    $(sel).unbind();
    var nodes = $(sel).get();
    var comparator = null;
    
    //funzioni di comparazione dei nodi html
    if(this._currentSort == 'value'){
         this._currentSort='valueCres';
         
     } 
	 // WS 1911 controllo ordinamento numerico crescente, alfabetico e fixed
     else if(this._currentSort == 'valueCres'){
         this._currentSort='alphabetic';
         
     }
     else if(this._currentSort == 'alphabetic'){
		 if(this._settings.fixedOrd!=null){ // se Ã¨ impostato un ordinamneot di default allora si accende la possibilita di ordinarlo altrimenti no
         	this._currentSort='fixed';
		 }else{
			 this._currentSort='value';
		 }
     }
     else if(this._currentSort == 'fixed'){
		 this._currentSort='value';
     }
	  // WS 1911 controllo ordinamento numerico crescente, alfabetico e fixed FINE
     sel = "#" + this._id_div + ' .facet-header .sort';
     $(sel).attr('src',"framework/script/images/"+ this._currentSort +".png");
     this.sort();
}

//funzione per selezionare tutto
cloudFacet.prototype.selectAll = function(){
    sel = "#" + this._id_div + ' .facet-value';
    var values = $(sel).get();
    online=false;
    while(  this._settings.conj != 'or'){
        $("#" + this._id_div + ' .facet-header .conj').trigger('click');
    }
    for(var v=0; v<values.length; v++){
        if($(values[v]).css('display')!='none'  && !$(values[v]).hasClass('facet-value-selected')){
            $(values[v]).trigger('click');
        }
    }
    online=true;
    sendUpdateRequest();
}

//funzione per costruire gli istrogrammi
cloudFacet.prototype._buildHistogram = function (values_histogram){
    var init = '#'+this._id_div+' .facet-body .facet-value .facet-histo';
    $(init).html('<div class="inner"></div>');
    
    var min_value=0;
    var max_value=0;
    
    for(var q in values_histogram){
        if(values_histogram[q]<min_value){
            min_value=values_histogram[q];
        }
        if((values_histogram[q]>max_value)){
            max_value=values_histogram[q];
        }
    }
    var max_width = this._settings.histo_maxwidth;
    var height = this._settings.histo_height;
    var range= max_value-min_value;
    var scale_factor= max_width / max_value; //fattore di scala: chi ha il valore + alto, occupa tutta la barra (max_width);
    var str = '#'+this._id_div+' .facet-body .facet-value';
    var nodes=$(str).get();
    
    for(var r=0; r<nodes.length; r++){
        if(values_histogram[$(nodes[r]).attr("val")] !=null){
            var width = values_histogram[$(nodes[r]).attr("val")] * scale_factor;
            if(width>0 && width<1){
                width=1;
                }
                
            var histo = '#'+ this._id_div + ' [val="'+$(nodes[r]).attr('val')+'"] .facet-histo .inner';
            $(histo).addClass('bar');
            $(histo).css('width',(width+'%'));
            $(histo).css('height',(height+'px'));
            
            if($(nodes[r]).hasClass('facet-value-selected')){
                $(histo).css('background-color',this._settings.histo_selected_color);
            }
        }
    }
    
    var select= '#'+this._id_div+' .facet-body .facet-value-selected';
    
    if($(select).get().length == 0){
        var h = '#'+this._id_div+' .facet-body .facet-value .facet-histo .inner';
        $(h).css('background-color', this._settings.histo_selected_color); 
    }
    
}

/*Funzione per il salavataggio: restiruisce on oggetto con lo stato del widget*/
cloudFacet.prototype.getSnapshot = function(number){
    var collapsed = false;
    if($('#'+this._id_div + ' .facet-body').css('display')!='none') collapsed=true;
    
    var selection = null;
    if(this._selectedValues.length>0){ 
        selection = this._selectedValues[0];
        for(var t=1; t<this._selectedValues.length;t++){
            selection =  selection + "%%" + this._selectedValues[t];
        }
    }
    
    var exclusions = null;
    if(this._excludedValues.length>0){ 
        exclusions = this._excludedValues[0];
        for(var t=1; t<this._excludedValues.length;t++){
            exclusions =  exclusions + "%%" + this._excludedValues[t];
        }
    }
    
    var snapshot = new facetSnapshot(number,this._id_div,'cloudFacet',selection,exclusions,this._currentView,this._settings.conj,this._currentSort,collapsed);
    return snapshot;
}

/*RIPRISTINO DI UNA SESSIONE DI ESPLORAZIONE dato una snapshsot dello stato del widget al momento del salvataggio*/
cloudFacet.prototype.restoreSnapshot = function(snapshot){
   
   if(snapshot.div_id != this._id_div) return false;
   
   //toglie le selezioni precedenti
    var s="#"+ this._id_div + " .facet-value-selected";
    var simg= "#"+ this._id_div + " .facet-value-selected  img";
    $(simg).attr('src','framework/script/images/no-check.png');
    $(s).removeClass('facet-value-selected');
        
   if(snapshot.selectedValues!='null' && snapshot.selectedValues!=null){
        this._selectedValues = snapshot.selectedValues.split('%%');
        
        //aggiorna la selezioni allo stato dello snapshot
        for(var p=0; p<this._selectedValues.length; p++){
            var node = '#'+this._id_div + ' [val="'+this._selectedValues[p]+'"]';
            $(node).addClass('facet-value-selected');
            var tmp = '#'+this._id_div + ' [val="'+this._selectedValues[p]+'"] img';
            $(tmp).attr('src','framework/script/images/black-check.png');
        }
   }
   else this._selectedValues=[];
   
   if(snapshot.excludedValues!='null' && snapshot.excludedValues!=null){
        this._excludedValues = snapshot.excludedValues.split('%%');
        
        //aggiorna la selezioni allo stato dello snapshot
        for(var p=0; p<this._excludedValues.length; p++){
            var node = '#'+this._id_div + ' [val="'+this._excludedValues[p]+'"]';
            $(node).addClass('facet-value-excluded');
            var tmp = '#'+this._id_div + ' [val="'+this._excludedValues[p]+'"] img';
            $(tmp).attr('src','framework/script/images/excluded-check.png');
        }
   }
   else this._excludedValues=[];
   
   this._currentView = snapshot.view; this._fixView();
   this._settings.conj = snapshot.conj; this._fixConj();
   if(this._currentSort != snapshot.sortBy){ this.changeSort()}
   
   if(snapshot.collapsed=='false') $('#'+this._id_div + ' .facet-body').css('display','none');
   else $('#'+this._id_div + ' .facet-body').css('display','block');
   
   this._notifyCollection();
   
}