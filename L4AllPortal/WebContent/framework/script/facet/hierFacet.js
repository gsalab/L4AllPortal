/*==================================================
 *  widget lista gerarchica
 *==================================================
 */

hierFacet = function(containerElmt,expression, solr) {
    this._id_div = containerElmt;
    this._type = "hierFacet";
    this._solrServer = solr;
    this._expression = expression;
    this._selectedValues = [];
    this._excludedValues = [];
    this._topselectedValues = [];
    this._settings = {}; //conterrà i valori delle propietà indicate sotto
    SettingsUtilities._internalCollectSettings(this._id_div, hierFacet._settingSpecs, this._settings); //carica i valori delle variabili!
    
    this._davedere = []; 
    this._currentSort = this._settings.defaultSortMode;
    this._currentView = this._settings.defaultRendering;
    
    this.initUI();
};

hierFacet._settingSpecs = {
    "widgetClass":       { type: "text" , defaultValue:""}, //Etichetta mostrata nel titolo del facet
    "facetLabel":       { type: "text" },
	"facetDescription":       { type: "text" , defaultValue:"" },
	"facetDescriptionWhy":       { type: "text" , defaultValue:"" },
    "collapsible":      { type: "boolean", defaultValue: false }, //ok
    "collapsed":        { type: "boolean", defaultValue: false },
    "histo":            { type: "boolean", defaultValue: true}, //ok
    "histo_maxwidth":   {type:"number", defaultValue: 100}, //ok
    "histo_height":   {type:"number", defaultValue: 15}, //ok
    "histo_selected_color":   {type:"text", defaultValue: "blue"}, //ok
    "showNumber":       { type: "boolean", defaultValue: true}, //ok
    "separator":        { type: "boolean", defaultValue: true },   //ok
    "prediction":        { type: "boolean", defaultValue: true }, 
    //"showMissing":      { type: "boolean", defaultValue: false },
    //"missingLabel":     { type: "text" },
    "cat":        { type: "text", defaultValue: "" }, //valore del field CAT degli oggetti che definiscono la gerarchia
    "groupby":           { type: "text", defaultValue: "inside_s" }, //field che descrive la gerarchia (figlio di...)
    
    //parametri per il sort 
    "enableSort":       { type: "boolean", defaultValue: false },
    "defaultSortMode":         { type: "text", defaultValue: "value" }, 
    "fixedOrd":         { type: "text", defaultValue: null }, /*fix order non va d'accrdo con enableSort=true (con la rotazione dei criteri di sort)*/
    "allwaysLast":         { type: "text", defaultValue: "Non definito" }, 
     
    //parametri per lo stil di visualizzazione 
     "changeRendering":      { type: "boolean", defaultValue: false },
     "defaultRendering":     { type: "text",  defaultValue: "absolute" },

    //parametri per usare valori di valori di relazioni 1:1
    "foreignObject": {type:"text", defaultValue: null},
    "foreignLabel": {type:"text", defaultValue: null},
    
    //Operatore logico per la query
    "conj":    { type: "text", defaultValue:"or"},
    "changeConj":     { type: "boolean", defaultValue: false },
        //TO DO: implementare questi
        //"disableAND":     { type: "boolean", defaultValue: false },
        //"disableOR":   { type: "boolean", defaultValue: false },
        //"disableONE": { type: "boolean", defaultValue: false },
        
     //altre funzionalità:
    "enableSelectAll":       { type: "boolean", defaultValue: false}, //permetti di selezionare tutti gli elementi
    "refraso":           { type: "boolean", defaultValue: false} // refraso
};

/*Inizializzazione del facet*/
hierFacet.prototype.initUI = function(){
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
    
    if(this._settings.changeConj){ //!ATTENZIONE!: ora mette l'immaginetta della congiunzione solo il parametro √® TRUE
        var str="#"+ this._id_div + " .facet-header";
        var path = "framework/script/images/"+this._settings.conj+".png";
		// WS per spostare posizione widget 1611
		$(str +' #collapseImg').after('<img class="conj" src="'+path+'"></img>');
		// FINE WS per spostare posizione widget 1611 
       // $(str).append('<img class="conj" src="'+path+'"></img>');
        
        str = str + ' img.conj';
        $(str).click(function(){
            var str="#"+ self._id_div + " .facet-header img.conj";
            
            var s="#"+ self._id_div + " .facet-value-selected";
            var simg= "#"+ self._id_div + " .facet-value-selected  img";
            $(simg).attr('src','framework/script/images/no-check.png');
            $(s).removeClass('facet-value-selected');
            s="#"+ self._id_div + " .facet-value-excluded";
		    simg= "#"+ self._id_div + " .facet-value-excluded  img";
		    $(simg).attr('src','framework/script/images/no-check.png');
		    $(s).removeClass('facet-value-excluded');

            //ordine one->or->and->one
            if(self._settings.conj=='one'){
                self._settings.conj='or';
                self._settings.prediction=true;
            }
            else if(self._settings.conj=='or'){
                self._settings.conj='and';
                self._settings.prediction=false;
            }
            else if(self._settings.conj=='and'){
                self._settings.conj='one';
                self._settings.prediction=true;
            }
            
            $(str).attr('src',"framework/script/images/"+self._settings.conj+".png");
            self._clearSelections();
            
        });
    }
    
    if(this._settings.changeRendering){ //!ATTENZIONE!: ora mette l'immaginetta della congiunzione solo il parametro √® TRUE
        var str="#"+ this._id_div + " .facet-header";
        var path = "framework/script/images/"+this._settings.defaultRendering+".png";
		// WS per spostare posizione widget 1611
		$(str +' #resetwdg').before('<img class="changeview" src="'+path+'"></img>');
		// FINE WS per spostare posizione widget 1611 
        //$(str).append('<img class="changeview" src="'+path+'"></img>');
        
        str = str + ' img.changeview';
        $(str).click(function(){
            var body = '#'+ self._id_div + ' .facet-body';
            
           if (self._currentView=='absolute'){ 
                self._currentView = 'percentage'; 
                $(body).removeClass('absoluteView');
                $(body).addClass('percentView');
                $(body).html(self._htmlPercentage);
            }
            else if (self._currentView=='percentage'){  
                self._currentView = 'absolute'; 
                $(body).removeClass('percentView');
                $(body).addClass('absoluteView');
                $(body).html(self._htmlRelative);
            }
            
            var selImg = '#'+ self._id_div + ' .facet-header img.changeview';
            $(selImg).attr('src','framework/script/images/'+self._currentView+'.png');
            
            
            self._notifyCollection();
             //sendUpdateRequest(); //chima la funz per la nuova richiesta ajax a solr //UNISALENTO
        });
        
    }
    
    //aggiugne evento di chiusura della gerarchia alla chiusura del widget
    var coll = '#'+ self._id_div + ' #collapseImg';
    $(coll).click(function(){
        var body =  '#'+ self._id_div + ' .facet-body';
            if($(body).css('display')=='block'){
                var bottoncini = '#'+ self._id_div + ' ul.l0 .hier.open';
                $(bottoncini).trigger('click');
            }
    });
    
    if(this._settings.enableSort){
            var s = '#' + this._id_div + " .facet-header";
			// WS per spostare posizione widget 1611
			$(s +' #resetwdg').before('<img class="sort" src="framework/script/images/'+ this._currentSort +'.png" title="Strategia di ordinamento"></img>');
			// FINE WS per spostare posizione widget 1611 
            //$(s).append('<img class="sort" src="framework/script/images/'+ this._currentSort +'.png" title="Strategia di ordinamento"></img>');
            s  = '#' + this._id_div + " .facet-header .sort";
            $(s).click(function(){ self.changeSort();
            
            });
    }
    
    
    this._loadHier();
}


///////////////////////////////////////////////////////////////////////////////////////
//Funzioni per il sorting dei dati
///////////////////////////////////////////////////////////////////////////////////////
/*rotazione del criterio di sorting*/
hierFacet.prototype.changeSort = function(){
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
		 if(this._settings.fixedOrd!=null){ // se è impostato un ordinamneot di default allora si accende la possibilita di ordinarlo altrimenti no
         	this._currentSort='fixed';
		 }else{
			 this._currentSort='value';
		 }
     }
     else if(this._currentSort == 'fixed'){
		 this._currentSort='value';
     }
	  // WS 1911 controllo ordinamento numerico crescente, alfabetico e fixed FINE
//     else if(this._currentSort == 'alphabetic'){
//         this._currentSort='value';
//     }
     sel = "#" + this._id_div + ' .facet-header .sort';
     $(sel).attr('src',"framework/script/images/"+ this._currentSort +".png");
     this.sort();
}

/*funzione di sorting*/
hierFacet.prototype.sort = function(){
    var comparator = null;
    var self = this;
    var ul = $("#" + this._id_div + " .facet-body ul").get();
    
    for(var cUl=0; cUl<ul.length; cUl++){
        
        var selLi ="";   
        if($(ul[cUl]).hasClass('l0')){ selLi = "#" + this._id_div + " .facet-body .l0 > li"} 
        else { 
            selLi= "#" + this._id_div + " [val='" + $(ul[cUl]).parent().attr('val') +"'] ."+ $(ul[cUl]).attr('class')+" > li";
        }
        var nodes = $(selLi).get();
         if(this._currentSort == 'alphabetic'){
            comparator = function (a, b) {
                var x = $(a).children('.label').html().toUpperCase(); 
                var y = $(b).children('.label').html().toUpperCase();
                if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                if ( x < y ) {return -1;}
                if ( x > y) {return 1;}
                return 0;
            }
         }
        else if(this._currentSort == 'value'){
            comparator = function (a, b) {
                    var x = $(a).children('.label').html().toUpperCase(); 
                    var y = $(b).children('.label').html().toUpperCase();
                    if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                    if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                    if (parseInt($(a).children('.facet-count').html()) > parseInt($(b).children('.facet-count').html())) {return -1;}
                    if (parseInt($(a).children('.facet-count').html()) < parseInt($(b).children('.facet-count').html())) {return 1;}
                    return 0;
            }
        }
		//
		//WS 1911 ordinamento crescente numerico
		//
		else if(this._currentSort == 'valueCres'){
			comparator = function (a, b) {
                    var x = $(a).children('.label').html().toUpperCase(); 
                    var y = $(b).children('.label').html().toUpperCase();
                    if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                    if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                    if (parseInt($(a).children('.facet-count').html()) < parseInt($(b).children('.facet-count').html())) {return -1;}
                    if (parseInt($(a).children('.facet-count').html()) > parseInt($(b).children('.facet-count').html())) {return 1;}
                    return 0;
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
                    var x = $(a).children('.label').html().toUpperCase(); 
                    var y = $(b).children('.label').html().toUpperCase();
                    if(x == self._settings.allwaysLast.toUpperCase()) {return 1};
                    if(y == self._settings.allwaysLast.toUpperCase()) {return -1};
                    if (getFixedIndex(x) < getFixedIndex(y)) {return -1;}
                    if (getFixedIndex(x) > getFixedIndex(y)) {return 1;}
                    return 0;
            }
        }
         nodes.mergeSort(comparator);
         for(var r=0; r<nodes.length; r++){
             $(ul[cUl]).append(nodes[r]); //appende i singoli nodi riordinati
        } 
     }
     
         sel = "#" + this._id_div + ' .facet-body .facet-value';
         var self=this;
         //$(sel).click(function(){self._manageClick(this);}); //aggiunge evento di selezione
} 
///////////////////////////////////////////////////////////////////////////////////////


//funz per caricare oggetti, se i valori del widget vengono da relazioni 1:1
hierFacet.prototype.getForeignObject = function(){
 if(this._settings.foreignObject!=null && this._settings.foreignLabel!=null) return this._settings.foreignObject+"%"+this._settings.foreignLabel;
 else return null;
}


///////////////////////////////////////////////////////////////////////////////////////*
//FUNZIONE PER CARICARE LA GERACHIA DEL FACET: FA UNA RICHIESTA A SOLR PER RICEVERE GLI 
//OGGETTI DI TIPO XXX E COSTRUISCE IL MENUA A SCOMPARSA (FINO A 3 LIVELLI)
//ES: NAZIONE->MACROAREA->REGIONE->PROVINCIA
////////////////////////////////////////////////////////////////////////////////////////
hierFacet.prototype._loadHier = function(){
 var strData = '&q='+this._settings.cat + '&wt=json&rows=1000&fl=id,label,'+this._settings.groupby;

 var self = this;
 var str ="#"+this._id_div + " .facet-body";
 $(str).parent().addClass("hierFacet");
 $(str).append('<ul class="l0"></ul>');
 var hier = {};
 
 $.ajax({ 
      url: this._solrServer,
      data: strData,
      dataType: 'jsonp',
      success: buildHier,
      jsonp: 'json.wrf'
    });
     //costruisce la gerarchia
     function buildHier(data){
        var ids = [];
                  
         /************livello zero della gerarchia***************************************/
         for(var c=0; c<data.response.docs.length; c++){
             if(eval('data.response.docs[c].'+self._settings.groupby) == null){
                 var dest = "#"+self._id_div + " .facet-body ul.l0";
                 var html = '<li val="'+data.response.docs[c].id+'" label="'+data.response.docs[c].label+'"><img  class="hier closed" src="framework/script/images/more.png"/><img class="check" src="framework/script/images/no-check.png"></img><div class="label" val="'+data.response.docs[c].id+'">'+data.response.docs[c].label+'</div></li>';
                 $(dest).append(html);
                 ids.push(c);
                 hier[data.response.docs[c].id] = {};
             }
         }
         for(var r=0; r<ids.length; r++){
             data.response.docs.splice((ids[r]-r),1);
         }
         ids=[];
         
        /************livello uno della gerarchia***************************************/
        for( i in hier){
            var dest = "#"+self._id_div + " .facet-body ul.l0  li[val='"+i+"']";
             $(dest).append('<ul class="l1"></ul>');
            for(var c=0; c<data.response.docs.length; c++){
             if(eval('data.response.docs[c].'+self._settings.groupby) == i){
                 var dest = "#"+self._id_div + " .facet-body ul.l0  li[val='"+i+"'] ul.l1";
                 var html = '<li val="'+data.response.docs[c].id+'" label="'+data.response.docs[c].label+'"><img  class="hier closed" src="framework/script/images/more.png"></img><img class="check" src="framework/script/images/no-check.png"></img><div class="label" val="'+data.response.docs[c].id+'">'+data.response.docs[c].label+'</div></li>';
                 $(dest).append(html);
                 ids.push(c);
                 hier[i][data.response.docs[c].id] = {};
             }
            }
             for(var r=0; r<ids.length; r++){
                 data.response.docs.splice((ids[r]-r),1);
             }
             ids=[]; 

         /************livello due della gerarchia***************************************/
             for( q in hier[i]){
                var dest = "#"+self._id_div + " .facet-body  li[val='"+q+"']";
                $(dest).append('<ul class="l2"></ul>');
                for(var c=0; c<data.response.docs.length; c++){
                 if(eval('data.response.docs[c].'+self._settings.groupby) == q){
                     var dest = "#"+self._id_div + " .facet-body  li[val='"+q+"'] ul.l2";
                     var html = '<li val="'+data.response.docs[c].id+'" label="'+data.response.docs[c].label+'"><img  class="hier closed" src="framework/script/images/more.png"></img><img class="check" src="framework/script/images/no-check.png"></img><div class="label" val="'+data.response.docs[c].id+'">'+data.response.docs[c].label+'</div></li>';
                     $(dest).append(html);
                     ids.push(c);
                     hier[i][q][data.response.docs[c].id] = {};
                 }
                }
                 for(var r=0; r<ids.length; r++){
                     data.response.docs.splice((ids[r]-r),1);
                 }
                 ids=[]; 
             
        /************livello tre della gerarchia***************************************/
                 for( w in hier[i][q]){
                    var dest = "#"+self._id_div + " .facet-body  li[val='"+w+"']";
                    $(dest).append('<ul class="l3"></ul>');
                    for(var c=0; c<data.response.docs.length; c++){
                     if(eval('data.response.docs[c].'+self._settings.groupby) == w){
                         var dest = "#"+self._id_div + " .facet-body  li[val='"+w+"'] ul.l3";
                         var html = '<li val="'+data.response.docs[c].id+'" label="'+data.response.docs[c].label+'"><img  class="check" src="framework/script/images/no-check.png"></img><div class="label" val="'+data.response.docs[c].id+'">'+data.response.docs[c].label+'</div></li>';
                         $(dest).append(html);
                         ids.push(c);
                         hier[i][q][w][data.response.docs[c].id] = {};
                     }
                    }
                     for(var r=0; r<ids.length; r++){
                         data.response.docs.splice((ids[r]-r),1);
                     }
                     ids=[]; 
                 }                 
             }
        }  
      
      /***********************************EVENTO DI APERTURA E CHIUSURA DEI LIVELLI**************************************/
       var st= '#'+self._id_div + " .hier";
       $(st).click(function(){
            var str =  'li[val="'+$(this).parent().attr('val')+'"] > ul';  
              
            if($(this).hasClass('closed')){
                $(this).removeClass('closed');
                $(this).addClass('open');
                $(this).attr('src','framework/script/images/less.png');
                $(str).css('display','block');
                
            }
            else{
                $(this).removeClass('open');
                $(this).addClass('closed');
                $(this).attr('src','framework/script/images/more.png');
                $(str).css('display','none');
            }
        });
        /******************************************************************************************************************/
        
        var st0= '#'+self._id_div + " ul.l0 ul";
        $(st0).css('display','none'); //all'inizio chiude tutto
        
        var li = '#'+self._id_div + " .facet-body li";
        $(li).addClass('facet-value');
        $(li).css('display','none');
     }
     
}



//restituisce i l field del widget
hierFacet.prototype.getExpression = function(){ 
 return this._expression; 
}

/*
*FUNZIONE PER SISTEMARE IL BODY DEL FACET (NASCONDE I PEZZI NON NECESSARI E CALCOLA I NUMERI DI OGNI LIVELLO)
*
*Attenzione: la struttura del dataset per i field che guidano un widget gerarchico è leggermente diversa da quelli classici a lista
*perchè nasceva il problema di gestire il calcolo della cardinalità dei nodi padri nei casi di widget a valore non esclusivo:
*per questo motivo nel field deve essere presente il nodo foglia (ovvero id dell'oggetto della gerarchia) e tutti i nodi padre della foglia:
*es: per le aree geografiche: servono gli id: della provincia, della regione, macro area geografica, della nazione (per una gerarchia alla p).
*/
hierFacet.prototype.facetBody = function(data,num){
    
    var self = this;
    for(var t=0; t<data.length; t++){
        var str= 'li[val="'+data[t].replace(/"/g, '\\"')+'"]';
        
        var ul = 'li[val="'+data[t].replace(/"/g, '\\"')+'"] > ul';
        if($(ul).get().length > 0) $(ul).before('<div class="facet-count"> '+data[t+1]+'</div>');
        else $(str).append('<div class="facet-count"> '+data[t+1]+'</div>');
        $(str).css('color','black'); //queste due righe di css correggono un problema con Chrome e Safari
        $(str).css('display','block');//che nn renderizzavano correttamente i facet gerarchici alla prima costr dell'interfaccia
        
        t++;    
    }
    
    var str = "#"+this._id_div+ ' ul:empty';
    var values = $(str).get();
    for(var t=0; t<values.length; t++){
        var str0 = "#"+this._id_div+ ' li[val="'+$(values[t]).parent().attr('val')+'"] img.hier';
        $(values[t]).parent().addClass('leaf');
        $(str0).remove();
        $(values[t]).remove();
    }
    
    
    var mainUl = '#'+self._id_div+ ' ul.l0 > li';
    
    //var clear = '#'+self._id_div+ ' .facet-header img.clear'; WS 2111 modificato perche modiifcata la classe clear in resetwdg
	var clear = '#'+self._id_div+ ' .facet-header img.resetwdg';
    $(clear).click(function(){
        self._clearSelections();
    });

 var tuttiSpan = '#'+self._id_div+ ' ul.l0  li  div';
 var tuttiCheck = '#'+self._id_div+ ' ul.l0  li .check';
 $(tuttiSpan).click(function(){self._manageClick($(this).parent())}); //aggiunta dell'evento di click agli span e alle immaginette
 $(tuttiCheck).click(function(){self._manageClick($(this).parent())});
 
 var str0 = '#'+ this._id_div +' .facet-header-collapse';
 if(this._settings.collapsed) $(str0).trigger('click');
 
 this.sort();
 
}

//funzione che verifica se una valore è gia selezionato
hierFacet.prototype._isSelected = function(value){
    var ret = false;
    var s= '#' + this._id_div + ' li[val="'+value+'"]';

    if($(s).hasClass('facet-parentvalue-selected') || $(s).hasClass('facet-value-selected')) ret = true;
    return ret;
}

//funzione che verifica se una valore è gia escluso
hierFacet.prototype._isExcluded = function(value){
    var ret = false;
    var s= '#' + this._id_div + ' li[val="'+value+'"]';

    if($(s).hasClass('facet-parentvalue-excluded') || $(s).hasClass('facet-value-excluded')) ret = true;
    return ret;
}

//funzione che si occupa della generazione del refraso
hierFacet.prototype._notifyCollection = function(){
var self = this;
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
            if(html=='') $('#refraso .body').append('<span class="default">'+refraso[itemType].all+'</span>');
        }
        else{
            var val= '#refraso .body';
            $('#refraso .body .default').remove();
            var str= '<span class="'+this._settings.widgetClass+' '+this._id_div+'"><span class="label">'+this._settings.facetLabel+': </span><span class="values">';
           
            
            this._davedere= [];
            this._daNonVedere= [];
            isParentSelected = function(val){ //NON SI PUO' BASARE IL REFRASO SU I VALORI SELEZIONATI, ALTRIMENTI LA GERARCHIA SALTA
                    var s= '#' + self._id_div + ' li[val="'+val+'"]';
                                        
                    if($(s).parent().parent().hasClass('facet-parentvalue-selected')){
                        var newval = $(s).parent().parent().attr('val');
                        if(isParentSelected(newval)){ //questa ricorsione permette di scrivere il nodo padre "piݠalto"
                            return true;
                        }
                        else{
                            self._davedere.push($(s).parent().parent().attr('label')); 
                            return true;
                        }    
                    } 
                    else return false;
            };
            
            isParentExcluded = function(val){ 
                    var s= '#' + self._id_div + ' li[val="'+val+'"]';
                                        
                    if($(s).parent().parent().hasClass('facet-parentvalue-excluded')){
                        var newval = $(s).parent().parent().attr('val');
                        if(isParentExcluded(newval)){ //questa ricorsione permette di scrivere il nodo padre "piu' alto"
                            return true;
                        }
                        else{
                            self._daNonVedere.push($(s).parent().parent().attr('label')); 
                            return true;
                        }    
                    } 
                    else return false;
            };
            
            for(var y=0; y<this._selectedValues.length; y++){
                  if(!isParentSelected(this._selectedValues[y])){
                      var s= '#' + this._id_div + ' li[val="'+this._selectedValues[y]+'"]';
                      this._davedere.push($(s).attr('label'));
                  }
            }
            
            for(var y=0; y<this._excludedValues.length; y++){
                  if(!isParentExcluded(this._excludedValues[y])){
                      var s= '#' + this._id_div + ' li[val="'+this._excludedValues[y]+'"]';
                      this._daNonVedere.push($(s).attr('label'));
                  }
            }
            
            this._davedere.sort();
            this._daNonVedere.sort();
            
            for(var y=0; y<this._davedere.length; y++){
                if(y==0){
                    str = str + "<span>"+this._davedere[y]+"</span>";
                }
                else if(this._davedere[y]!=this._davedere[y-1]){
                    str = str + "<span class='conj'> or </span>"+"<span>"+this._davedere[y]+"</span>";
                    //if(y<this._davedere.length-1){str = str + "<span class='conj'> or </span>";}
                }  
            }
            
             for(var y=0; y<this._daNonVedere.length; y++){
                if(y==0) {
                	if (this._davedere.length > 0)
                		str = str + "<span class='conj'> not </span>";
                    str = str + "<span>"+this._daNonVedere[y]+"</span>";
                }
                else if(this._daNonVedere[y]!=this._daNonVedere[y-1]){
                    str = str + "<span class='conj'> not </span>"+"<span>"+this._daNonVedere[y]+"</span>";
                    //if(y<this._davedere.length-1){str = str + "<span class='conj'> or </span>";}
                }  
            }
            
            str = str + '</span></span>';
            if($(val).html()!=""){str = '<span class="and"> AND </span> '+ str}
            $(val).append(str);
        }      
    }
    
  $('#refraso .body .and + .and').remove();
}

/////////////////////////////////////////////////////////////////////////////////////////
//funzioni varie per gestire le selezioni:
/////////////////////////////////////////////////////////////////////////////////////////

//funzione per eliminare le selezioni
hierFacet.prototype._clearSelections = function(){ 
    
    var mainUl = '#'+this._id_div+ ' ul.l0 > li';
    var children = $(mainUl).get();
   
    for(var y=0; y<children.length; y++){
       if($(children[y]).hasClass('leaf')){
            this._removeLeafSelection($(children[y]));
            this._removeLeafExclusion($(children[y]));
        }
        else{
        	this._removeParentSelection($(children[y]));
            this._removeParentExclusion($(children[y]));
        }
    }
    this._notifyCollection();
     sendUpdateRequest(); //chima la funz per la nuova richiesta ajax a solr
}

/*****************************************PER NODI FOGLIA***************************************/
hierFacet.prototype._removeLeafSelection = function(node){
    var self = this;
    var value=$(node).attr('val');
    $(node).removeClass('facet-value-selected');
    $(node).removeClass('facet-value-excluded');
    var tmp = '#'+self._id_div + ' [val="'+$(node).attr('val')+'"] img';
    $(tmp).attr('src','framework/script/images/no-check.png');
    this._removeOnlyParentSelection(node);
    for(var i=0; i<this._selectedValues.length;i++ ){ 
        if(this._selectedValues[i]==value)
           this._selectedValues.splice(i,1); 
    } 
    for(var i=0; i<this._excludedValues.length;i++ ){ 
        if(this._excludedValues[i]==value)
           this._excludedValues.splice(i,1); 
    } 
}
hierFacet.prototype._removeLeafExclusion = function(node){
    var self = this;
    var value=$(node).attr('val');
    $(node).removeClass('facet-value-excluded');
    var tmp = '#'+self._id_div + ' [val="'+$(node).attr('val')+'"] img';
    $(tmp).attr('src','framework/script/images/no-check.png');
    this._removeOnlyParentExclusion(node);
    for(var i=0; i<this._excludedValues.length;i++ ){ 
        if(this._excludedValues[i]==value)
           this._excludedValues.splice(i,1); 
    } 
}
hierFacet.prototype._addLeafSelection = function(node,bool){
    var self = this;
    var label=$(node).attr('val');
    if(bool)self._selectedValues.push(label);
    $(node).addClass('facet-value-selected');
    var tmp = '#'+self._id_div + ' [val="'+$(node).attr('val')+'"] img';
    $(tmp).attr('src','framework/script/images/black-check.png');
}
hierFacet.prototype._addLeafExclusion = function(node,bool){
    var self = this;
    var label=$(node).attr('val');
    if(bool)self._excludedValues.push(label);
    $(node).addClass('facet-value-excluded');
    var tmp = '#'+self._id_div + ' [val="'+$(node).attr('val')+'"] img';
    $(tmp).attr('src','framework/script/images/excluded-check.png');
}
/***********************************************************************************************/

/*****************************************PER NODI PADRE***************************************/
hierFacet.prototype._removeParentSelection = function(node){
   var self = this;
   var value=$(node).attr('val');
   for(var i=0; i<this._selectedValues.length;i++ ){ 
        if(this._selectedValues[i]==value){
            this._selectedValues.splice(i,1); 
        }
   }
    
   $(node).removeClass('facet-parentvalue-selected');
   var check = '#'+ self._id_div + ' li[val="'+$(node).attr('val')+'"] > .check';
   $(check).attr('src','framework/script/images/no-check.png');
   this._removeOnlyParentSelection(node);
    
   var str = '#'+ self._id_div + ' li[val="'+$(node).attr('val')+'"] > ul > li';
   var children = $(str).get();
    
    for(var c=0; c<children.length; c++){ /*chiamate ricorsive per i figli*/
        if($(children[c]).hasClass('leaf')){
            this._removeLeafSelection($(children[c]));
            
        }
        else{
            this._removeParentSelection($(children[c]));
        }
    }
}

hierFacet.prototype._removeParentExclusion = function(node){
   var self = this;
   var value=$(node).attr('val');
   for(var i=0; i<this._excludedValues.length;i++ ){ 
        if(this._excludedValues[i]==value){
            this._excludedValues.splice(i,1); 
        }
   }
    
   $(node).removeClass('facet-parentvalue-excluded');
   var check = '#'+ self._id_div + ' li[val="'+$(node).attr('val')+'"] > .check';
   $(check).attr('src','framework/script/images/no-check.png');
   this._removeOnlyParentExclusion(node);
    
   var str = '#'+ self._id_div + ' li[val="'+$(node).attr('val')+'"] > ul > li';
   var children = $(str).get();
    
    for(var c=0; c<children.length; c++){ /*chiamate ricorsive per i figli*/
        if($(children[c]).hasClass('leaf')){
            this._removeLeafExclusion($(children[c]));
            
        }
        else{
            this._removeParentExclusion($(children[c]));
        }
    }
}

hierFacet.prototype._removeOnlyParentSelection = function(node){ //A DIFFERENZA DELLA FUNZ SOPRA, CAMBIA SOLO LA CROCETTA (con RICORSIONE VERSO L'ALTO)
   var self = this;
   
   var parent = $(node).parent().parent();
     
   if($(parent).hasClass('facet-parentvalue-selected')){
       var fatto = false;
       var value = $(parent).attr('val');
       for(var i=0; i<this._selectedValues.length;i++ ){ 
            if(this._selectedValues[i]==value){
                this._selectedValues.splice(i,1); 
                fatto=true;
            }
        }
        if(fatto){
             var figli = $('li[val="'+$(parent).attr('val')+'"] li.facet-value-selected .facet-count').get(); 
             for (var k=0; k<figli.length; k++ ){
               this._selectedValues.push($(figli[k]).parent().attr('val'));
             }
        }
       
        $(parent).removeClass('facet-parentvalue-selected');
        var check = '#'+ self._id_div + ' li[val="'+$(parent).attr('val')+'"] > .check';
        $(check).attr('src','framework/script/images/no-check.png');
        this._removeOnlyParentSelection(parent);
   }
   
}

hierFacet.prototype._removeOnlyParentExclusion = function(node){ //A DIFFERENZA DELLA FUNZ SOPRA, CAMBIA SOLO LA CROCETTA (con RICORSIONE VERSO L'ALTO)
   var self = this;
   
   var parent = $(node).parent().parent();
     
   if($(parent).hasClass('facet-parentvalue-excluded')){
       var fatto = false;
       var value = $(parent).attr('val');
       for(var i=0; i<this._excludedValues.length;i++ ){ 
            if(this._excludedValues[i]==value){
                this._excludedValues.splice(i,1); 
                fatto=true;
            }
        }
        if(fatto){
             var figli = $('li[val="'+$(parent).attr('val')+'"] li.facet-value-excluded .facet-count').get(); 
             for (var k=0; k<figli.length; k++ ){
               this._excludedValues.push($(figli[k]).parent().attr('val'));
             }
        }
       
        $(parent).removeClass('facet-parentvalue-excluded');
        var check = '#'+ self._id_div + ' li[val="'+$(parent).attr('val')+'"] > .check';
        $(check).attr('src','framework/script/images/no-check.png');
        this._removeOnlyParentExclusion(parent);
   }
   
}

hierFacet.prototype._addParentSelection = function(node){
    var self = this;
    
    var label=$(node).attr('val');
    self._selectedValues.push(label);
    
    $(node).addClass('facet-parentvalue-selected');
    var check = '#'+ self._id_div + ' li[val="'+$(node).attr('val')+'"] > .check';
    $(check).attr('src','framework/script/images/black-check.png');
     
    var str = '#'+ self._id_div + ' li[val="'+$(node).attr('val')+'"] > ul > li';
    var children = $(str).get();
    
    if(this._settings.conj!='and' && this._settings.conj!='one'){
        for(var c=0; c<children.length; c++){ //chiamate ricorsive per i figli
            if($(children[c]).hasClass('leaf')){
                if(!this._isSelected($(children[c]).attr('val'))){
                    this._addLeafSelection($(children[c]),false);
                }
            }
            else{
                this._addParentSelection($(children[c]));
            }
        }
    }
}

hierFacet.prototype._addParentExclusion = function(node){
    var self = this;
    
    var label=$(node).attr('val');
    self._excludedValues.push(label);
    
    $(node).addClass('facet-parentvalue-excluded');
    var check = '#'+ self._id_div + ' li[val="'+$(node).attr('val')+'"] > .check';
    $(check).attr('src','framework/script/images/excluded-check.png');
     
    var str = '#'+ self._id_div + ' li[val="'+$(node).attr('val')+'"] > ul > li';
    var children = $(str).get();
    
    if(this._settings.conj!='and' && this._settings.conj!='one'){
        for(var c=0; c<children.length; c++){ //chiamate ricorsive per i figli
            if($(children[c]).hasClass('leaf')){
                if(!this._isExcluded($(children[c]).attr('val'))){
                    this._addLeafExclusion($(children[c]),false);
                }
            }
            else{
                this._addParentExclusion($(children[c]));
            }
        }
    }
}
/***********************************************************************************************/

/******************FUNZIONE PER GESTIRE SELEZIONE E  DESELEZIONE DEGLI ELEMENTI*****************/
hierFacet.prototype._manageClick = function(node){ 
    
    var self = this;
    function clearIfOne(){
        if(self._settings.conj=='one'){
            var mainUl = '#'+self._id_div+ ' ul.l0 > li';
            var children = $(mainUl).get();
            for(var y=0; y<children.length; y++){
               if($(children[y]).hasClass('leaf')){
                    self._removeLeafSelection($(children[y]));
                    self._removeLeafExclusion($(children[y]));
                }
                else{
                    self._removeParentSelection($(children[y]));
                    self._removeParentExclusion($(children[y]));
                }
            }
        }
    }
    
    
    function manageNode(node){ //RISCRITTA DISTINGUENDTO TRA DUE FUNZIONI: SELEZIONA NODO E DESELEZIONA NODO
        var label=$(node).attr('val');
        if($(node).hasClass('leaf')){
            if(self._isSelected(label)){
                clearIfOne();
                self._removeLeafSelection(node);
                self._addLeafExclusion(node,true); 
            } else if(self._isExcluded(label)){
            	clearIfOne();
            	self._removeLeafExclusion(node,true);
            } else {
                clearIfOne();
                self._addLeafSelection(node,true); 
            }
        }
        else{
            if($(node).hasClass('facet-parentvalue-selected')){
                clearIfOne();
                self._removeParentSelection(node);
                self._addParentExclusion(node);
            }
            else if ($(node).hasClass('facet-parentvalue-excluded')){
            	clearIfOne();
                self._removeParentExclusion(node);
            } else {
                clearIfOne();
                self._addParentSelection(node);
            }
        }
    }
    
    manageNode(node);
    this._notifyCollection();
    sendUpdateRequest(); //chima la funz per la nuova richiesta ajax a solr
}
/**************************************************************************************************************************************/
/////////////////////////////////////////////////////////////////////////////////////////

//funzione calcolare i vincoli del facet: parametro FQ della richiesta relativo al widget
hierFacet.prototype.getRestriction = function(){
    
    var str="";
    /*
    *To Do: se si vuole aggiungere anche la previsione ai facet, serve usare la notazione {!tag=dt} dopo "fq=..." e {!ex=dt} dopo "facet.field=..." 
    */
    if(this._selectedValues.length>0 && this._excludedValues.length==0){
                
        if(this._selectedValues.length==1){
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}'+this._expression+':"'+this._selectedValues[0]+'"';
            else str= 'fq='+this._expression+':"'+this._selectedValues[0]+'"';
        }
        else{
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}('+this._expression+':"'+this._selectedValues[0]+'"';
            else str='fq='+this._expression+'('+this._expression+':"'+this._selectedValues[0]+'"';
            for(var f=1; f<this._selectedValues.length; f++){
                var t='';
                if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
                else t='OR';
                str= str + " "+t+" "+  this._expression+':"'+this._selectedValues[f]+'"';
                /*
                *To Do: cambiando la stringa qui sopra fanno query con AND o OR 
                */
            }
            str = str + ')';
        }
    } else if(this._selectedValues.length==0 && this._excludedValues.length>0){ 
    	if(this._excludedValues.length==1){
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}'+this._expression+':(NOT "'+this._excludedValues[0]+'")';
            else str= 'fq='+this._expression+':(NOT "'+this._excludedValues[0]+'")';
        }
        else{
            if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}('+this._expression+':(NOT "'+this._excludedValues[0]+'"';
            else str='fq='+this._expression+'('+this._expression+':(NOT "'+this._excludedValues[0]+'"';
            t='NOT';
            for(var f=1; f<this._excludedValues.length; f++){
                //var t='';
                //if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
                //else t='OR';
                str= str + " "+t+" " +  this._expression+':"'+this._excludedValues[f]+'"';
                /*
                *To Do: cambiando la stringa qui sopra fanno query con AND o OR 
                */
            }
            str = str + '))';
        }
    } else if(this._selectedValues.length>0 && this._excludedValues.length>0){
    	if(this._settings.prediction) str='fq={!tag=d'+this._expression+'}('+this._expression+':"'+this._selectedValues[0]+'"';
        else str='fq='+this._expression+'('+this._expression+':"'+this._selectedValues[0]+'"';
        var t='';
        for(var f=1; f<this._selectedValues.length; f++){
            if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
            else t='OR';
            //t='AND';
            str= str + " "+t+" " +  this._expression+':"'+this._selectedValues[f]+'"';
        }
        t='NOT';
        str= str + " "+t+" " +  this._expression+':"'+this._excludedValues[0]+'"';
        for(var f=1; f<this._excludedValues.length; f++){
            //if(this._settings.conj=="and" || this._settings.conj=="AND") t= 'AND';
            //else t='NOT';
            str= str + " "+t+" " +  this._expression+':"'+this._excludedValues[0]+'"';
        }
        str = str + ')';
    }
    return str;
    
}

hierFacet.prototype.getEmptyRestriction = function(){
	return 'fq={!tag=d'+this._expression+'}'+this._expression+':*';
}

//predizione
hierFacet.prototype.getPrediction = function(){
   var str = null;
   if(this._settings.prediction){str='facet.field={!ex=d'+this._expression+'}'+this._expression}
   else str='facet.field='+this._expression;
   //if(this._settings.prediction){str='facet.field={!ex=d'+this._expression+'}'+this._expression+'&facet.sort='+this._expression+':index'}
   //else str='facet.field='+this._expression+'&facet.sort='+this._expression+':index'
   return str;
}

//funzione per selezionare tutto
hierFacet.prototype.selectAll = function(){
    sel = "#" + this._id_div + ' .l0 > .facet-value';
    var values = $(sel).get();
    online=false;
    while( this._settings.conj != 'or'){
        $("#" + this._id_div + ' .facet-header .conj').trigger('click');
    }
    for(var v=0; v<values.length; v++){
        if($(values[v]).css('display')!='none'  && !$(values[v]).hasClass('facet-value-selected') && !$(values[v]).hasClass('facet-parentvalue-selected') ){
            $(values[v]).children('.check').trigger('click');
        }
    }
    online=true;
    sendUpdateRequest();
    
}

//funzione per gestire l'update della visualizzazione del widget
hierFacet.prototype.facetUpdate = function(data,num){
    var self = this;
	this._fixView();
	
	$.log("hireFacet.facetUpdate:" + this._id_div);
	
    function displayParent(node){ //funz per mettere in display anche i padri dei nodi foglia attivi
        var parent = $(node).parent().parent();
        if($(parent).hasClass('facet-parentvalue')){
            $(parent).css('display','block');
            displayParent(parent);
        }
    }
    
    var str0= '#' + this._id_div + ' li.facet-value';  
    $(str0).css('display','none'); 
    var str1= '#' + this._id_div + ' li.facet-parentvalue';  
    $(str1).css('display','none');
          
    for(var t=0; t<data.length; t++){ //accende i nodi necessari
        if(data[t+1]>0){
            var str= '#' + this._id_div + ' li[val="'+data[t].replace(/"/g, '\\"')+'"]';
            $(str).css('display','block');
            var count = '#' + this._id_div + ' li[val="'+data[t].replace(/"/g, '\\"')+'"] div.facet-count';
            $(count).html(" "+ data[t+1]);
            displayParent($(str));
        }
        t++;    
    }
    
    var mainUl = '#'+self._id_div+ ' ul.l0 > li';
    var inner = $(mainUl).get();
    
    
    var values =  '#'+ this._id_div + ' .facet-body .facet-value';
    var values_selected =  '#'+ this._id_div + ' .facet-body .facet-value-selected';
    var parentvalues =  '#'+ this._id_div + ' .facet-body .facet-parentvalue';
    var parentvalues_selected =  '#'+ this._id_div + ' .facet-body .facet-parentvalue-selected';
    if($(values_selected).get().length>0 || $(parentvalues_selected).get().length>0){
        $(values).css('color', 'grey');
        $(values_selected).css('color', 'black');
        $(parentvalues).css('color', 'grey');
        $(parentvalues_selected).css('color', 'black');
    }
    else{
        $(values).css('color', 'black');
        $(parentvalues).css('color', 'black');
    }

    
    if(this._currentView == "percentage"){
        var selAll = '#'+ this._id_div + ' .facet-count';
        $(selAll).css('display','none');
        var sel = '#'+ this._id_div + ' .facet-value-selected > .facet-count';
        var sel1 = '#'+ this._id_div + ' .facet-parentvalue-selected > .facet-count';
        var nodes = $(sel).get();
        var nodes1 = $(sel1).get();
        
        nodes = nodes.concat(nodes1);
        
        if(nodes.length ==0){
            var sel = '#'+ this._id_div + ' .facet-count';
            nodes = $(sel).get();
        }
        
        for( i in nodes){
             $(nodes[i]).css("display","inline");  
            var n = parseInt(100*(parseInt($(nodes[i]).html()))/num);
            if(n==0) n="<1";
            //else if(n>100) {n= n-100; n= "+" + n;}
            $(nodes[i]).html( n + "%"  );    
        }
    }
    
    ////////////////////////////////////////////////////////////
    /*per ripristinare i NUMERI POTENZIALI per la visualizzazioen assoluta, commentare la porzione di codice contenuta tra /////*/
    if(this._currentView == "absolute"){
        var selAll = '#'+ this._id_div + ' .facet-count';
        //$(selAll).css('display','none');  //WS 2111 commentato per rendere visibile snche i valori deselezionati
        var sel = '#'+ this._id_div + ' .facet-value-selected > .facet-count';
        var sel1 = '#'+ this._id_div + ' .facet-parentvalue-selected > .facet-count';
        var nodes = $(sel).get();
        var nodes1 = $(sel1).get();
        
        nodes = nodes.concat(nodes1);
        
        if(nodes.length ==0){
            var sel = '#'+ this._id_div + ' .facet-count';
            nodes = $(sel).get();
        }
        
        for( i in nodes){
             $(nodes[i]).css("display","inline");  
        }
    }
    /////////////////////////////////////////////////////
    if(this._currentSort == 'value') this.sort();
}

//corregge la visualizzazione al cambiare dell'operatore logico
hierFacet.prototype._fixConj = function(){
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


//corregge la visualizzazione al cambiare dello stile di visualizzazione
hierFacet.prototype._fixView = function(){
    var self = this;
    var body = '#'+ self._id_div + ' .facet-body';
                        
       if (self._currentView=='percentage'){ 
            $(body).removeClass('absoluteView');
            $(body).addClass('percentView');
            $(body).html(self._htmlPercentage);
        }
        else if (self._currentView=='absolute'){  
            $(body).removeClass('percentView');
            $(body).addClass('absoluteView');
            $(body).html(self._htmlRelative);
        }
    var selImg = '#'+ self._id_div + ' .facet-header img.changeview';
    $(selImg).attr('src','framework/script/images/'+self._currentView+'.png');
}


/*Funzione per il salavataggio: restiruisce on oggetto con lo stato del widget*/
hierFacet.prototype.getSnapshot = function(number){
    var collapsed = false;
    if($('#'+this._id_div + ' .facet-body').css('display')!='none') collapsed=true;
    
    var selection = null;
    if(this._selectedValues.length>0){ 
        selection = this._selectedValues[0];
        for(var t=1; t<this._selectedValues.length;t++){
            selection =  selection + "%%" + this._selectedValues[t];
        }
    }
    var snapshot = new facetSnapshot(number,this._id_div,'hierFacet',selection,null,this._currentView,this._settings.conj,null,collapsed);
    return snapshot;
}

/*RIPRISTINO DI UNA SESSIONE DI ESPLORAZIONE dato una snapshsot dello stato del widget al momento del salvataggio*/
hierFacet.prototype.restoreSnapshot = function(snapshot){
   if(snapshot.div_id != this._id_div) return false;
   
   //toglie le selezioni precedenti
        var s="#"+ this._id_div + " .facet-value-selected";
        var simg= "#"+ this._id_div + " .facet-value-selected  img.check";
        $(simg).attr('src','framework/script/images/no-check.png');
        $(s).removeClass('facet-value-selected');
        
        s="#"+ this._id_div + " .facet-parentvalue-selected";
        simg= "#"+ this._id_div + " .facet-parentvalue-selected  img.check";
        $(simg).attr('src','framework/script/images/no-check.png');
        $(s).removeClass('facet-parentvalue-selected');
   
   if(snapshot.selectedValues!='null' && snapshot.selectedValues!=null){
        this._selectedValues = snapshot.selectedValues.split('%%');
        
        //aggiorna la selezioni allo stato dello snapshot - DISTINGUE SE è PADRE O FOGLIA
        for(var p=0; p<this._selectedValues.length; p++){
            var node = '#'+this._id_div + ' [val="'+this._selectedValues[p]+'"]';
            var checkHier = '#'+this._id_div + ' [val="'+this._selectedValues[p]+'"] li';
            var lis = $(checkHier).get().length;
            
            if(lis==0){
                $(node).addClass('facet-value-selected');
            }
            else{
                $(node).addClass('facet-parentvalue-selected');
                var figliPadre = '#'+this._id_div + ' [val="'+this._selectedValues[p]+'"] > ul > li li';
                var figliFoglia = '#'+this._id_div + ' [val="'+this._selectedValues[p]+'"] > ul > li.leaf';
                $(figliPadre).addClass('facet-parentvalue-selected');
                $(figliFoglia).addClass('facet-value-selected');
            }
            
            
            var tmp = '#'+this._id_div + ' [val="'+this._selectedValues[p]+'"] img.check';
            $(tmp).attr('src','framework/script/images/black-check.png');
        }
   }
   else this._selectedValues=[];
   
   this._currentView = snapshot.view; this._fixView();
   this._settings.conj = snapshot.conj; this._fixConj();
   
   if(snapshot.collapsed=='false') $('#'+this._id_div + ' .facet-body').css('display','none');
   else $('#'+this._id_div + ' .facet-body').css('display','block');
   
   this._notifyCollection();
}