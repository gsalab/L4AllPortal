////////////////////////////////////////////////////////////////////////////////////////////////////////
//Script principale per la creazione di interfacce esplorative:
// -carica gli altri script
//-legge il dom quali elementi (widget,canvas,lens,proprietà) sono stati istanziati nel DOM per costruire l'intefaccia
//-contiene le chiamate di costruzione e di update a SOLR
//-contiene la gestione del passaggio tra canvas
////////////////////////////////////////////////////////////////////////////////////////////////////////
 
var startAperte=0;
var solrServer;
var restServer;
var appUrl;

var q_solr = null; //parametro q di Solr: oggetti su cui valutare la Query
//var facets = new Array();
var canvas = new Array();
var canvasSec = new Array(); // Canvas visualizzati nel pannello secondario
var lens = {};
var currentCanvasIndex = 0;
var secondaryCanvasIndex = 0;
var last_query_values;

/*Varivaili per wishlist*/
var wishList = {};
var enableWishList;

/*Varivaili per salvataggio esplorazione*/
var enableSave;

/*variabili per la modalità online/offline*/
var enableOffline;

/*variabili per la esportazione pdf*/
var enablePDF;
var PDFservlet;

// WS INIT 1211
/*variabili per la modalità online/offline*/
var enableLogin;
// WS END 1211

var online = true;
var loadAttrTitle=false;

/*oggetti esterni che vengono salvati in memoria per recuperare i valori delle propr per le relazioni 1:1 (es Narrazione->Area geogradica)*/
var foreignObjects = {};
var query_params = [
     'wt=json'
    ,'rows=10000'
    ,'facet=true'
    ];

var refraso = null;

var resultList = {};  // Memorizza gli id degli elementi trovati per ogni tipo di tassonomia
var linkToItemType = "";
var crossFields = [];
loadScripts();


////////////////////////////////////////////////////////////////////////////////////////////////////////
//Load script del framework
////////////////////////////////////////////////////////////////////////////////////////////////////////
function loadScripts(){
    var timestamp = new Date().getTime();
    
    function loadfile(filename, filetype){
        if (filetype=="js"){ //if filename is a external JavaScript file
          
          var str = '<script src="'+filename+'?t='+timestamp+'" type="text/javascript" charset="utf-8"><\/script>';
          //$("head").append(str);
          document.write(str);
         }
         else if (filetype=="css"){ //if filename is an external CSS file
          
          var fileref=document.createElement("link")
              fileref.setAttribute("rel", "stylesheet")
              fileref.setAttribute("type", "text/css")
              fileref.setAttribute("href", filename)
             
              document.getElementsByTagName("head")[0].appendChild(fileref);
          }      
         
     }
    
    //script dei Canvas 
    var available_canvas = [
    "framework/script/canvas/mosaicView.js",
    "framework/script/canvas/thumbView.js",
    "framework/script/canvas/listView.js",
    "framework/script/canvas/mapView.js"
    ]
    //script dei Facet
    var available_facets = [
    "framework/script/facet/hierFacet.js",
    "framework/script/facet/cloudFacet.js",
    "framework/script/facet/sliderFacet.js"
    ]
    //eventuali fogli CSS
    var stylesheets = [
    "framework/css/facet.css",
    "framework/css/save.css",
    "framework/css/loader.css",
    "framework/css/slider.css",
    "framework/css/view.css",
    "framework/css/lens.css",
    "framework/css/mosaic.css",
    "framework/css/thumb.css",
    "framework/css/map.css",
    "framework/script/utils/fancybox/jquery.fancybox-1.3.4.css",
    /* WS Begin */
	"style/layout-container.css",
	"style/ui-theme/jquery-ui-1.9.2.custom.css", // stili jquery UI, tab e accordion
    "framework/css/ux_interface.css" //stili elementi di interfaccia utente, layout di pagine, finestra login ecc
    /* W End */

    ]
    //altri script vari
    var scripts = [
    "framework/script/utils/jquery.cookie.js",
    //"http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/jquery-ui.min.js", ws modificato con la 1.9.1 per compatibilità con jquery UI Tabs
	"http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.1/jquery-ui.min.js",
    "framework/script/utils/settings.js",
    "framework/script/utils/saveSession.js",
    "framework/script/utils/facetUtilities.js",
    "framework/script/utils/mergeSort.js",
    "framework/script/utils/gserializer.js",
    "framework/script/utils/lens.js",
    "framework/script/utils/jQuerytubeplayer.js",
    "framework/script/utils/fancybox/jquery.fancybox-1.3.4.pack.js",
    "style/attrTitle.js"
    /* DT Begin */
    ,"framework/script/utils/jquery_logger.js"
    ,"framework/script/utils/jquery.jstree.js"
    ,"framework/script/l4all2/md5-min.js"
    ,"framework/script/l4all2/restInterface.js"
    ,"framework/script/l4all2/application.js"
    ,"framework/script/l4all2/templateUtil.js"
    ,"framework/script/l4all2/sessionProxy.js"
    /* DT End */
    /* WS Begin */
	,"framework/script/utils/jquery.layout.js" //libreria per layout a pnnelli
	,"framework/script/layout/layout_container.js"  //elementi di interfaccia utente, layout di pagine, finestra login ecc
    ,"framework/script/layout/ux_interface.js"  //elementi di interfaccia utente, layout di pagine, finestra login ecc
    /* W End */
    ]
    
    for(var l=0; l<scripts.length; l++){loadfile(scripts[l],"js");}
    for(var s=0; s<available_canvas.length; s++){loadfile(available_canvas[s],"js");}
    for(var f=0; f<available_facets.length; f++){loadfile(available_facets[f],"js");}
    for(var c=0; c<stylesheets.length; c++){loadfile(stylesheets[c],"css");}
    
    // Caricamento di script aggiuntivi
    for(var l=0; l<customScript.length; l++){loadfile(customScript[l],"js");}
   
    google.load("visualization", "1", {packages:["corechart"]}); 
    
    loadfile("framework/script/utils/lastLoad.js","js");
    function waitForFnc(){
      if(typeof lastLoad == "undefined"){
        window.setTimeout(waitForFnc,50);
      }
      else{

        loadComponentsFromDom();
		 //WS ML inzio
		 createLayout(); // creo il layout a pannelli
		 accordionType = q_solr.split(',')[0];
		 // WS ML Fine 
      }
    }
    //waitForFnc();
    
    var winW = 0, winH = 0;
    if (document.body && document.body.offsetWidth) {
     winW = document.body.offsetWidth;
     winH = document.body.offsetHeight;
    }
    if (document.compatMode=='CSS1Compat' &&
        document.documentElement &&
        document.documentElement.offsetWidth ) {
     winW = document.documentElement.offsetWidth;
     winH = document.documentElement.offsetHeight;
    }
    if (window.innerWidth && window.innerHeight) {
     winW = window.innerWidth;
     winH = window.innerHeight;
    }

    if(winW<= '999') alert('Attenzione, per la visione è consigliata una dimensione della finestra >1280. Il valore minimo è 1024');
    else if(winW<= '1250') loadfile("style/fix1024.css","css");
    
    $(document).ready(function(){ waitForFnc();})

    //$(document).ready(function(){ loadComponentsFromDom();})
}
////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////
//Legge il dom per capire:
// -quali widget
// -quali canvas
// -quali funzioni del framework attivare
////////////////////////////////////////////////////////////////////////////////////////////////////////
function loadComponentsFromDom(){
    
    $('body').prepend('<div id ="loader"><div id ="loaderBack"></div><div id="loaderCont"><div><img alt="loader" src="theme/images/loader.gif" /> <span>Loading...</span></div></div></div>');
    
	    
    /*Load del parametro enableWishList: definisce se attivare la funzione wishlist*/
    enablePDF = $('[role="collection"]').attr('enablePDF');
    if(enablePDF==null || enablePDF=="false"){enablePDF=false}
    else {
        $('#banner .float').prepend('<img  class="exAll" title="Scaricare il PDF della selezione attuale" src="theme/images/pdf.png">');
        PDFservlet = $('[role="collection"]').attr('pdfServlet');
    }
    
     /*Evento per il download del PDF della selezione corrente*/
        $('.exAll').click(function(){
            var titolo = "Elementi estratti dal portale";
            titolo = prompt("Download del PDF della selezione attuale\n\nTitolo del documento:",titolo);
            if (titolo == null || titolo.length == 0) return;
            
            var idsOn=[];
            for ( i in last_query_values) if(last_query_values[i].id != null && last_query_values[i].id != "") idsOn.push(last_query_values[i].id);
            var refraso = $('#refraso .body').html();
            refraso = refraso.replace(/<[^>]*>/g,"");
            for(ww in wishList){
                var url = PDFservlet+'?titolo='+titolo+'&refraso='+ refraso +'&idEsperienze=' + idsOn;
                //alert('la formattazione dei PDF non è ancora completata');
                window.open(url,'Downlaod PDF');
           }
            
        });  
    
    
    //WS INIT 1211
    /*Load del parametro enableOffline: definisce se attivare la funzione di navigazione OffLine: nn mandare la richiesta a ogni interazione utente, ma solo a comando*/
    enableLogin = $('[role="collection"]').attr('enableLogin');
    if(enableLogin==null){enableLogin=false}
    else $('#banner .float').after('<div id="bannerLogin" class="enableLogin"><img  title="Login" src="theme/images/login.png"></div><div id="bannerLogout" class="bannerMsg" style="display:none;">-  LOGOUT</div><div id="welcomMessage" class="bannerMsg">&nbsp;</div>');
	
	//WS END 1211
    
    /*Load del parametro che dice quanti valori massimo devono essere gestiti da SOLR per ogni facet: es 'facet.limit=200'*/
    var facetLimit = $('[role="collection"]').attr('facetLimit');
    if(facetLimit==null){query_params.push('facet.limit=200');}
    else query_params.push('facet.limit='+parseInt(facetLimit));
    
    /*Load del parametro loadAttrTitle: se true carica  e applica i testi delle descrizioni*/
    loadAttrTitle = $('[role="collection"]').attr('loadAttrTitle');
    if(loadAttrTitle==null){loadAttrTitle=false}    
    
    
    /*Load URL Server Solr*/
    solrServer = ($('[role="solr_url"]').attr('value'));
    
    /* Load URL Server REST */
    restServer = ($('[role="rest_url"]').attr('value'));
    if (typeof restServer == 'undefined' || restServer.length == 0)
    	restServer = "/l4allapp";
    
    appUrl = ($('[role="application_url"]').attr('value'));
    if (typeof restServer == 'undefined' || restServer.length == 0)
    	restServer = "/l4all2";
		
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Parsa il DOM per trovare eventuali LENS e salva i template dei nodi html
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    var dom_lens = $('[role="lens"]').get();
    for(var l=0; l<dom_lens.length; l++){
        computeLensTemplate(dom_lens[l]);
    }
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nel caso in cui nella lens ci fossero dei valori riferiti a relazioni 1:1 nel dataset,
    // carica in memoria gli oggetti esterni (i puntati), per potervi poi accedere in fase di costruzione
    // lens per recuperare la proprietà. Seguirà una richiesta a SOLR per recuperare i dati
    // -t: il tipo di oggetto
    // -l: la propr da inserire
    // ATTENZIONE: limite attuale 1 field solo per tipo di oggetto
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    var tmp = $('[role="lens"] [show]');
    for( var w=0; w<tmp.length; w++){
        var t = $(tmp[w]).attr('show').split('.')[0];
        var l = $(tmp[w]).attr('show').split('.')[1];
        this.foreignObjects[eval('t')]={"label" : l, "data" : null};
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Parsa il DOM per trovare quali CANVAS UTILIZARE 
    // - usa l'attributo viewClass per capire di che tipo di canvas si tratta
    // ATTENZIONE!!: per aggiungere nuovi canvas:
    //   1) Aggiungere lo script sopra nella lista di script da caricare
    //   2) Aggiungere qui sotto la mappatura del valore dell'attrivuto viewClass
    //////////////////////////////////////////////////////////////////////////////////////////////////////// 
    var dom_canvas = $('#view [role="canvas"]').get();
    for(var c=0; c<dom_canvas.length; c++){
        if ($(dom_canvas[c]).attr('viewClass')=='MosaicView'){ canvas.push(new mosaicView($(dom_canvas[c]).attr('id')));}
        else if ($(dom_canvas[c]).attr('viewClass')=='ThumbView'){ canvas.push(new thumbView($(dom_canvas[c]).attr('id')));}
        else if ($(dom_canvas[c]).attr('viewClass')=='ListView'){ canvas.push(new listView($(dom_canvas[c]).attr('id')));}
        else if ($(dom_canvas[c]).attr('viewClass')=='MapView'){ canvas.push(new mapView($(dom_canvas[c]).attr('id')));}
        $.cookie($(dom_canvas[c]).attr('id'),null); //cancella eventuali cookie con i salvataggi di precedenti stati del canvas
    } 
    
    // D.T. Start
    dom_canvas = $('#viewSecond [role="canvas"]').get();
    for(var c=0; c<dom_canvas.length; c++){
        if ($(dom_canvas[c]).attr('viewClass')=='MosaicView'){ canvasSec.push(new mosaicView($(dom_canvas[c]).attr('id')));}
        else if ($(dom_canvas[c]).attr('viewClass')=='ThumbView'){ canvasSec.push(new thumbView($(dom_canvas[c]).attr('id')));}
        else if ($(dom_canvas[c]).attr('viewClass')=='ListView'){ canvasSec.push(new listView($(dom_canvas[c]).attr('id')));}
        else if ($(dom_canvas[c]).attr('viewClass')=='MapView'){ canvasSec.push(new mapView($(dom_canvas[c]).attr('id')));}
        $.cookie($(dom_canvas[c]).attr('id'),null); //cancella eventuali cookie con i salvataggi di precedenti stati del canvas
    }
    
    /*Load del parametro q: il tipo di oggetto principale*/
    q_solr = ($('[role="collection"]').attr('itemTypes'));
    
    var q_solr_arr = q_solr.split(',');
    for (var q = 0; q < q_solr_arr.length; q++) {
    	var contesto = new Contesto(q_solr_arr[q]);
    	
    	// fa uno snapshot iniziale utile per il passaggio agli altri contesti la prima volta
    	//contesto.freezeSession();
    	
    	Application.addContesto(contesto);
    }
    //Application.passaAlContesto(0);
    
    $("#facet-switcher input[type='radio']").click(function() {
    	switchContext($(this).val());
    });
    // query_params.push('q='+q_solr);
    
    $("#facet-switcher input[value='0']").attr('checked', true);
    // D.T. End
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Parsa il DOM per trovare quali WIDGET UTILIZARE 
    // - usa l'attributo facetClass per capire di che tipo di widget si tratta
    // ATTENZIONE!!: per aggiungere nuovi canvas:
    //   1) Aggiungere lo script sopra nella lista di script da caricare
    //   2) Aggiungere qui sotto la mappatura del valore dell'attrivuto facetClass
    //////////////////////////////////////////////////////////////////////////////////////////////////////// 
    var dom_facets = $('[role="facet"]').get();
    for(var c=0; c<dom_facets.length; c++){
    	
    	var newFacet = null;
        if ($(dom_facets[c]).attr('facetClass')=='Cloud') {
        	newFacet = new cloudFacet($(dom_facets[c]).attr('id'),$(dom_facets[c]).attr('expression')); 
        	
        }
        else if ($(dom_facets[c]).attr('facetClass')=='Hierarchical') {
        	newFacet =  new hierFacet($(dom_facets[c]).attr('id'),$(dom_facets[c]).attr('expression'),solrServer)
        	
        }
        // DEPRECATO: else if ($(dom_facets[c]).attr('facetClass')=='List'){ facets.push(new listFacet($(dom_facets[c]).attr('id'),$(dom_facets[c]).attr('expression')));}
        else if ($(dom_facets[c]).attr('facetClass')=='Slider') {
        	newFacet = new sliderFacet($(dom_facets[c]).attr('id'),$(dom_facets[c]).attr('expression'));
        	
        }
        
        //facets.push(newFacet);
        
        var itemType = $(dom_facets[c]).attr('itemType');
        var contestFacets = null;
        
        if (typeof itemType != 'undefined')
        	contestFacets = Application.getContestoByItemType(itemType).getFacets();
        else 
        	contestFacets = Application.getContestoAttuale().getFacets();
        
        contestFacets.push(newFacet);
        
        //se il facet mostra il valore di una relazione 1:1, registra nella variabile degli oggetti esterni
        //il tipo di oggetto da caricare e il field da caricare
        /* D.T Begin - utilizzo l'oggetto newFacet  
        if(facets[facets.length-1].getForeignObject()!=null){
            var tmp = facets[facets.length-1].getForeignObject();
            var str = facets[facets.length-1].getForeignObject().split('%');
            this.foreignObjects[eval('str[0]')]={"label" : str[1], "data" : null}; 
        } */
        
        if(newFacet.getForeignObject()!=null){
        	
            var tmp = newacet.getForeignObject();
            var str = newFacet.getForeignObject().split('%');
            $.log("new foreignObjects: " + str[1]);
            this.foreignObjects[eval('str[0]')]={"label" : str[1], "data" : null}; 
        }
        
        // D.T End
                
        if($(dom_facets[c]).attr('facetClass')=='Slider'){
            query_params.push('f.'+$(dom_facets[c]).attr('expression')+'.facet.sort=index'); //in questo modo gli slider sono gia ordinati
        }
    }
    
    for(var t in  this.foreignObjects){ foreignObjectRequest(t, this.foreignObjects[t].label);}
    
    
    for (var q = 0; q < q_solr_arr.length; q++) {
    	var itemType = q_solr_arr[q];
    	
	    // D.T. Begin - carica i contenuti dei tab
	    // TAB1: WIDGET
	    // TAB1: SALVATAGGIO
	    $('#tabs-2_'+itemType).html(getSaveTemplate(itemType));
		$("#save_"+itemType+" .treeview").ready(function() {
			$("#save_"+itemType+" .treeview").jstree({
				"plugins" : ["themes","html_data"],
				// each plugin you have included can have its own config object
				"core" : { "initially_open" : [ "phtml_1" ] }
			});
		})
		
		// TOOLBAR + EVENTI TAB1: WIDGET
		$('#facet-toolbar_'+itemType).append('<img  class="enableWidgetPdf" title="Stampa selezione parametri" src="theme/images/pdf.png"  style="border-left:0.5px dotted #757575;">')
		
		/*Load del parametro enableOffline: definisce se attivare la funzione di navigazione OffLine: nn mandare la richiesta a ogni interazione utente, ma solo a comando*/
	    enableOffline = $('[role="collection"]').attr('enableOffline');
	    if(enableOffline==null){enableOffline=false}
	    else $('#facet-toolbar_'+itemType).append('<img  class="enableOffline online" title="Passa a modalità Offline" src="theme/images/online.png">');
		
	    $('#facet-toolbar_'+itemType+' .enableOffline').click(function(){OnOff(itemType);});
		$('#facet-toolbar_'+itemType+' .enableWidgetPdf').click(function(){showWidgetState();});
		
		/*Load del parametro enableSave: definisce se attivare la funzione di salvataggio dell'esplorazione attuale*/
	    enableSave = $('[role="collection"]').attr('enableSave');
	    if(enableSave==null || enableSave=="false"){
	    	enableSave=false;
	    	$('#save_'+itemType+' .btn-save').attr("disabled","disabled");
	    }
	    
	    // TAB3: CARICAMENTO
	    $('#tabs-3_'+itemType).html(getLoadTemplate(itemType));
		$("#load_"+itemType+" .treeview").ready(function() {
			$("#load_"+itemType+" .treeview").jstree({
				"plugins" : ["themes","html_data"],
				// each plugin you have included can have its own config object
				"core" : { "initially_open" : [ "phtml_1" ] }
			});
		});
		
		// TOOLBAR + EVENTI TAB3: GESTIONE
		//$('#load_'+itemType+' .btn-applica').click(function(){ alert("da implementare")});
		$('#load_'+itemType+' .btn-sostiuisci').click(restoreWishlist);
		$('#load_'+itemType+' .btn-unisci').click(fondiWishlist);
		$('#load_'+itemType+' .btn-sottrai').click(sottraiWishlist);
		$('#load_'+itemType+' .btn-link').click(generaLinkPubblico);
		$('#load_'+itemType+' .btn-pdf').click(function(){ alert("da implementare")});
		$('#load_'+itemType+' .btn-svuota').click(function(){ alert("da implementare")});
		
		// TAB4: CARRELLO
		$('#tabs-4_'+itemType).html(getCarrelloTemplate(itemType));
		$("#carrello_"+itemType+" .treeview").ready(function() {
			$("#carrello .treeview").jstree({
				"plugins" : ["themes","html_data","checkbox"],
				// each plugin you have included can have its own config object
				"core" : { "initially_open" : [ "phtml_1" ] }
			});
		});
		
		// TOOLBAR + EVENTI TAB4: CARRELLO
		/*Load del parametro enableWishList: definisce se attivare la funzione wishlist*/
	    enableWishList = $('[role="collection"]').attr('enableWishList');
	    if(enableWishList==null || enableWishList=="false"){enableWishList=false}
	    //else $('#banner .float').prepend('<img  class="exportWishList" title="Wishlist/Esportazione" src="theme/images/export.png">');
		else $('#carrello-toolbar').prepend('<img  class="exportWishList" title="Wishlist/Esportazione" src="theme/images/ico-btn-antecarr.png"  style="border-left:0.5px dotted #757575;">'); //WS riposizionato il bottone all'interno del tab carrello
		
		$('#carrello-toolbar_'+itemType).prepend("<img class='exWish' title='Scarica il PDF del carrello' src='theme/images/pdf.png' style='border-left:0.5px dotted #757575;'/>");
		$('#carrello-toolbar_'+itemType).prepend("<img class='clearWish' title='Svuota carrello' src='theme/images/ico-tool-svuotacarrello.png'  style='border-left:0.5px dotted #757575;'/>");
		
		$('#carrello-toolbar_'+itemType+' .clearWish').click(svuotaWishlist);
	    
	    $('#carrello-toolbar_'+itemType+' .exWish').click(extractWishListToPdf);
		$('#carrello-toolbar_'+itemType+' .exportWishList').click(reviewWishList);
		
		$('#carrello_'+itemType+' .btn-aggiorna').click(aggiornaCarrello);
		$('#carrello_'+itemType+' .btn-unisci').click(unisciAllaSelezione);
		$('#carrello_'+itemType+' .btn-sostiuisci').click(sostituisciAllaSelezione);
		$('#carrello_'+itemType+' .btn-salva').click(saveCarrello);
		$('#carrello_'+itemType+' .addAll').click(aggiungiSelezioneAttualeAWishlist);
    }
    
	//verifica che la funzione di REFRASO DELLA SELZIONE SIA ATTIVATA
	refraso=[];
	$('[role="enableRefraso"]').each(function() {
		var refraso_string = $(this).attr('string');
	    var refraso_all = $(this).attr('all');
	    var itemType = $(this).attr('itemType');
	    if(refraso_string!=null && refraso_all!=null){
	        refraso[itemType] = {};
	        refraso[itemType]["legenda"]=refraso_string;
	        refraso[itemType]["all"]= refraso_all;
	    }
	});
	var q;
	for (q = 0; q < q_solr_arr.length; q++) {
		
		var itemType = q_solr_arr[q];
	    
    	Application.getContestoByItemType(itemType).freezeSession();
    }
    Application._initFacetsEnum = q - 1;
    Application.passaAlContesto(0);
	
    // D.T. End
    
    // D.T. Begin - inizializzazione manager delle sessioni/wishlist
    SessionProxy.setManager(CookieSessionManager);
    // D.T. End
    
    
    
	// TOOLBAR + EVENTI GENERALE
    $('#banner .float .saveExploration').click(function(){ manageSaveExploration();});
	$('#banner .enableLogin').click(function(){ showLogin();});	
	
	TaxonomySwitcher._init();
	
	var links = $('[role="linkTaxonomy"]').get();
	for (var i = 0; i < links.length; i++)
	{
		var crossFieldsAttr = $(links[i]).attr("crossFields");
		$.log("crossFields = " + crossFieldsAttr);
		if (typeof crossFieldsAttr == "string" && crossFieldsAttr.length > 0) {
			crossFields = crossFieldsAttr.split(",");
		}
	}
	
	fixCanvasHeight();
	fixSecondaryCanvasHeight();
	
	checkPendingRequest(); //questa funz serve per verificare che non ci siano ancora chiamate pendenti a SOLR (es Oggetti esterni) che potrebbero compromettere
    //il resto della costruzione dell'interfaccia
    //Quando ha verificato, parte la prima chiamata a SOLR per la costruzione dell'interfaccia (widget + canvas)
	
	$(window).resize(function() {fixCanvasHeight(); fixSecondaryCanvasHeight();} );
}

function fixCanvasHeight() {
	var window_height = $(window).height();
	var banner_height = $("#banner").height();
	
	$("#view").height(window_height-banner_height - 20);
}

function fixSecondaryCanvasHeight() {
	var window_height = $(window).height();
	var banner_height = $("#titolo-pannello-secondario").height();
	
	$("#viewSecond").height(window_height-banner_height - 20);
}

// D.T Begin - funzione per creare un nuovo gruppo
function getSaveTemplate(itemType) {
	if (typeof templateContext != "undefined") {
    	var template = new TemplateTransformation(TemplateType.SAVE_SESSION);
    	
    	template.addParam("ITEM_TYPE", itemType);
    	return template.getResult();
    }
}

function getLoadTemplate(itemType) {
	if (typeof templateContext != "undefined") {
    	var template = new TemplateTransformation(TemplateType.LOAD_SESSION);
    	
    	template.addParam("ITEM_TYPE", itemType);
    	return template.getResult();
    }
}

function getCarrelloTemplate(itemType) {
	if (typeof templateContext != "undefined") {
    	var template = new TemplateTransformation(TemplateType.CARRELLO);
    	
    	template.addParam("ITEM_TYPE", itemType);
    	return template.getResult();
    }
}

function getDataSetTemplate() {
	if (typeof templateContext != "undefined") {
    	var template = new TemplateTransformation(TemplateType.DATASET);
    	
    	return template.getResult();
    }
}

function checkPendingRequest() {
    if ($.active > 0) { 
    	setTimeout(checkPendingRequest,20); 
    } else {
    	sendFirstRequest();
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
//Funzioni per mostrare/nascondere il loader che viene messo in primo piano per evitare che
//altre interazion utenti facciano impazzire il portale
//ToDo: verificare perchè in IE il loader nn sempre viene visualizzato
////////////////////////////////////////////////////////////////////////////////////////////////////////

function stoploader(){
  startAperte--;
  if(startAperte<1){
  startAperte=0;    
  document.getElementById('loader').style.display = 'none';
  }
}
//start del loader
function startloader(){
  startAperte++;
  document.getElementById('loader').style.display = 'block';
}
////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////
//CHIAMATA A SOLR PER CARICARE GLI OGGETTI ESTERNI (QUELLI DELLE RELAZIONI 1:1)
//
//La sua callback per salvare i valori
//ATTENZIONE!!:questo tipo di salvataggio che va a popolare gli oggetti {} usando ogg['xxx']=valore causa notevoli
//rallentameti di Javascript. Per migliorare la soluzione bisognerebbe provare far creare questi oggetti a una 
//servlet esterna che si prensa carico di questa "aggregazione".
////////////////////////////////////////////////////////////////////////////////////////////////////////
function foreignObjectRequest(type,label){
    var strData = "wt=json&rows=10000&q="+type+"&val="+label+"&fl=id,"+label;
    /* DT Begin */
    $.log("[foreignObjectRequest()] strData = " + strData);
    /* DT End */
    
    $.active++;
    $.ajax({
      url: solrServer,
      data: strData,
      dataType: 'jsonp',
      success: saveForaignObj,
      jsonp: 'json.wrf'
    });
}

function saveForaignObj(data){
    var tmp = {};
    var l = data.responseHeader.params.val;
    //non di salva l'oggetto ritornato dal JSON ma foreignObjects['tipo_oggetto'].data['id_oggetto'] = 'etichetta'
        
    for(var g=0; g<data.response.docs.length; g++){
        tmp[eval('data.response.docs[g].id')]= eval("data.response.docs[g]."+l);
    }
    foreignObjects[eval('data.responseHeader.params.q')].data = tmp;
    $.active--;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
//PRIMA CHIAMATA PER LA COSTRUZIONE: si differenzia dalle chiamate di update per il lavoro della funzione
// callback: in questo caso si occupa di costruire e computere tutto il DOM del canvas e dei widget
////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendFirstRequest(){
	Application.updateQueryParams(Application.getContestoAttuale());
    var strData = query_params.join('&');
    
    /* DT Begin */
    $.log("[sendFirstRequest()] strData = " + strData);
    /* DT End */
    
    //la predizione consiste nel costruire la query di SOLR in modo tale che nel calcolo
    //dei facet vengano presi in considerazione anche gli elementi che nn soddisfano il vincolo
    //sul field specifico: IMPORTANTE PER STIMARE I VALORI POTENZIALI NEL CASO DI OR
    var queryPrediction = [];
    var facets = Application.getContestoAttuale().getFacets();
    for(var p=0; p< facets.length; p++){
        var tmp = facets[p].getPrediction();
        if(tmp!=null) queryPrediction.push(tmp);
    }
    var strPrediction = queryPrediction.join('&');
    
    var canvas_query_params = getQueryParamsWithLiskIds(canvas[currentCanvasIndex]); //RECUPERA DAL CANVAS ATTUALE I FIELD DI SOLR CHE SERVONO PER LA SUA COSTRUZIONE
    
    if(queryPrediction.length>0){ strData = strData + '&' + strPrediction };
    if(canvas_query_params.length>0){strData = strData + "&fl="+canvas_query_params.join(',')}
    if(canvas[currentCanvasIndex].sortBy()!=null){
        strData = strData + canvas[currentCanvasIndex].sortBy();
    }
    /*INVIA LA CHIAMATA AJAX*/
    $.ajax({
      url: solrServer,
      data: strData,
      dataType: 'jsonp',
      success: buildPage,
      jsonp: 'json.wrf'
    });
}

function sendSecondaryCanvasFirstRequest(){
	Application.updateQueryParams(Application.getContestoSecondario());
    var strData = query_params.join('&');
    
    /* DT Begin */
    $.log("[sendSecondaryCanvasFirstRequest()] strData = " + strData);
    /* DT End */
    
    //la predizione consiste nel costruire la query di SOLR in modo tale che nel calcolo
    //dei facet vengano presi in considerazione anche gli elementi che nn soddisfano il vincolo
    //sul field specifico: IMPORTANTE PER STIMARE I VALORI POTENZIALI NEL CASO DI OR
    var queryPrediction = [];
    var facets = Application.getContestoSecondario().getFacets();
    for(var p=0; p< facets.length; p++){
        var tmp = facets[p].getPrediction();
        if(tmp!=null) queryPrediction.push(tmp);
    }
    var strPrediction = queryPrediction.join('&');
    
    var canvas_query_params = getQueryParamsWithLiskIds(canvasSec[secondaryCanvasIndex]); //RECUPERA DAL CANVAS ATTUALE I FIELD DI SOLR CHE SERVONO PER LA SUA COSTRUZIONE
    
    if(queryPrediction.length>0){ strData = strData + '&' + strPrediction };
    if(canvas_query_params.length>0){strData = strData + "&fl="+canvas_query_params.join(',')}
    if(canvasSec[secondaryCanvasIndex].sortBy()!=null){
        strData = strData + canvasSec[secondaryCanvasIndex].sortBy();
    }
    /*INVIA LA CHIAMATA AJAX*/
    $.ajax({
      url: solrServer,
      data: strData,
      dataType: 'jsonp',
      success: buildSecondaryCanvas,
      jsonp: 'json.wrf'
    });
}

function getQueryParamsWithLiskIds(canvas) {
	var canvas_query_params = canvas.fieldParams();
	links = $('[role="linkTaxonomy"]').get();
	for (var i = 0; i < links.length; i++)
	{
		var idField = $(links[i]).attr("idField");
		$.log("idField = " + idField);
		canvas_query_params.push(idField);
	}
	
	return canvas_query_params;
}

//la callback di sendFirstRequest
function buildPage(data){
  var num = data.response.numFound;
  var htmlWidth = $('html').css('width');
  htmlWidth = htmlWidth.slice(0,(htmlWidth.length-2));
  viewWidth = htmlWidth;
  
  var middleEast = $('.middle-east');
  if (middleEast != null && middleEast.length > 0)
  	viewWidth -= middleEast.width() +36;
  	
  var outerEast = $('.outer-east');
  if (outerEast != null && outerEast.length > 0)
  	viewWidth -= outerEast.width() +12;
  
  if(htmlWidth<=1250) viewWidth -= 395;
  var ul="";
  if(canvas.length > 0){
      ul = '<span class="label">Canvas: </span><span class="currentSelection">'+canvas[0]._settings.label+'<img class="arrow" src="theme/images/arrowdown.png"></span><ul>';
      for(var c=0; c<canvas.length; c++){
            ul += '<li val="'+c+'">'+canvas[c]._settings.label+'</li>';
      }
      ul += '</ul>';
  }
  $('#view').css('width', viewWidth+'px');
  $('#banner').css('width', viewWidth+'px');
  $('#view').prepend(
        '<div class="viewTop">'
            +'<div class="count"><div class="inner"><a>'+data.response.numFound+'</a></div></div>'
            +'<div class="selection">'+ul+'</div>'
            +'<div class="highlight"></div>'
			
        +'</div>'); 
  
  var itemType = Application.getContestoAttuale().getItemType();
  $('#save_'+itemType+' input[name="num-selezione"]').val(data.response.numFound);
  
  var facets = Application.getContestoAttuale().getFacets();
	for(var f=0; f<facets.length; f++){
	    if(facets[f].getExpression()!=null){
	    var facet_values = eval('data.facet_counts.facet_fields.'+facets[f].getExpression()); //VARIABILE CON I VALORI DA PASSARE AL FACET
	    ////////////////////////////////////////////////////////////////////////////////////////////////////////
	    //COSTRUZIONE DEL SINGOLO WIDGET
	    facets[f].facetBody(facet_values,num);
	    ////////////////////////////////////////////////////////////////////////////////////////////////////////
	    }
	}
  Application.getContestoAttuale().setFacetsReady(true);
  
 //VARIABILE CON I VALORI DA PASSARE AL CANVAS
 last_query_values= data.response.docs; //questa var verrà usata anche per capire quali elementi sono visualizzati
 
 ///////////////////////////////////////////////////////////////////////////////
 //COSTRUZIONE DEL CANVAS
 canvas[currentCanvasIndex].buildCanvas(last_query_values);
 canvas[currentCanvasIndex].displayCanvas(); 
 
 ///////////////////////////////////////////////////////////////////////////////
    
 if(canvas.length > 1){ //sistema il menu a tendina dei canvas disponibili
          $('#view .viewTop .selection .currentSelection').click(function(){ //apri chiudi menu
              var ul = '#view .viewTop .selection .currentSelection + ul';
              if($(ul).css('display')=='none') {
                  $(ul).css('display','block');
                  autoChiudi = function() { $(ul).css('display','none') }
                  setTimeout('autoChiudi()', 2000);
              }
              else $(ul).css('display','none')
          });
      
          $('#view .viewTop .selection li').click(function(){ //apri chiudi menu
             var ul = '#view .viewTop .selection .currentSelection + ul';
             $(ul).css('display','none');
             changeView($(this).attr('val')); //CHIAMATA ALLA FUNZIONE CHE REGOLA IL PASSAGGIO TRA CANVAS (sotto)
          });
      }      
          
  if(refraso!=null){
  		var itemType = Application.getContestoAttuale().getItemType();
        $('#view').append('<div id="refraso"><span class="body"><span class="default">'+refraso[itemType].all+'</span></span></div>');
  } 
  
  
  if(loadAttrTitle){ loadAttrTitleFunction(); }
  
  /*Evento del clear all che sfrutta la modalità offline per evitare di fare N chiamate inutili a SOLR (notevole risparmi di tempo)*/
  $('#facet-toolbar_'+itemType+' .clearAll').click(function(){
      online=false;
      var defaultString =  $('#refraso .body .default').html();
      var facets = Application.getContestoAttuale().getFacets();
      for(var f=0; f<facets.length; f++){facets[f]._clearSelections();}
      online=true;
      var itemType = Application.getContestoAttuale().getItemType();
      $('#refraso .body').html('<span class="default">'+refraso[itemType].all+'</span>');
      sendUpdateRequest();
  });
  
  // invia la richeista SOLR per costruire il canvas secondario
  if (canvasSec.length > 0) {
  	sendSecondaryCanvasFirstRequest();
  } else {
	  if (Application._initFacetsEnum >= 0) {
	  	  Application.passaAlContesto(Application._initFacetsEnum); 
	  	  sendUpdateRequest();
	  } else {
	  	stoploader();
	  	manageQueryString();
	  }
  }
} 

function buildSecondaryCanvas(data){
  var num = data.response.numFound;
  
  var facets = Application.getContestoSecondario().getFacets();
	for(var f=0; f<facets.length; f++){
	    if(facets[f].getExpression()!=null){
	    var facet_values = eval('data.facet_counts.facet_fields.'+facets[f].getExpression()); //VARIABILE CON I VALORI DA PASSARE AL FACET
	    ////////////////////////////////////////////////////////////////////////////////////////////////////////
	    //COSTRUZIONE DEL SINGOLO WIDGET
	    facets[f].facetBody(facet_values,num);
	    ////////////////////////////////////////////////////////////////////////////////////////////////////////
	    }
	}
  Application.getContestoSecondario().setFacetsReady(true);
  
 //VARIABILE CON I VALORI DA PASSARE AL CANVAS
 last_query_values= data.response.docs; //questa var verrà usata anche per capire quali elementi sono visualizzati
 
 ///////////////////////////////////////////////////////////////////////////////
 //COSTRUZIONE DEL CANVAS SECONDARIO 
 
 if (canvasSec.length > 0) {
 	canvasSec[secondaryCanvasIndex].buildCanvas(last_query_values);
 	canvasSec[secondaryCanvasIndex].displayCanvas();
 } 
 ///////////////////////////////////////////////////////////////////////////////
    
//  if(refraso!=null){
//  		var itemType = Application.getContestoAttuale().getItemType();
//        $('#view').append('<div id="refraso"><span class="body"><span class="default">'+refraso[itemType].all+'</span></span></div>');
//  } 
  
//  if(loadAttrTitle){ loadAttrTitleFunction(); }
  
  stoploader();
  manageQueryString();
  
} 
////////////////////////////////////////////////////////////////////////////////////////////////////////

function manageQueryString() {
	sessionParamString = getParameterByName("s");
	$.log("querystring param s = " + sessionParamString);
	
	if (sessionParamString.length > 0) {
		ripristinaSessione(sessionParamString);
		sendUpdateRequest();
	}
}

/*Funzione ausiliaria per la generazione della stringa dei parametro fq che definisce i vincoli della ricerca*/
function getFQParams(contesto){
    var res = [];
    var facets = contesto.getFacets();
    for(var f=0; f<facets.length; f++){
        var tmp = facets[f].getRestriction();
        tmp = tmp.replace('&','%26');
        
    	if(linkToItemType.length > 0 && linkToItemType != contesto.getItemType() && resultList[linkToItemType] != null) {
        	
        	var linkRestriction = "";
        	for (var i = 0; i < resultList[linkToItemType].length; i++) {
        		for (var j = 0; j < crossFields.length; j++) {
        			var crossField = crossFields[j];
        			linkRestriction += crossField + ":" + resultList[linkToItemType][i];
        			linkRestriction += " OR ";
        		}
        	}
        	// rimuove l'ultimo " OR "
        	if (linkRestriction.length > 4) {
        		linkRestriction = linkRestriction.substring(0, linkRestriction.length -4);
        	}
        	if (linkRestriction.length > 0) {
        		if(tmp!=null && tmp!="") {
        			tmp += " AND (";
        		}else{
        			tmp += facets[f].getEmptyRestriction() + " AND (";
        		}
        		
        		tmp += linkRestriction + ")";
        		
        	}
        }
    	if(tmp!=null && tmp!="") {
        	res.push(tmp);
    	}
        
  }
    $.log("RESTRICTION: "+res);
    
    
    
    
    return res;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//Chiamate di UPDATE: la callback chiama le funzioni di update dei widget e facet, che dove possibile
//lavorano in modalità accendi/spegni invece di dover ricomputare da zero tutto il dom
////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendUpdateRequest(){
    if(online){
    	// D.T. Begin
    	Application.updateQueryParams(Application.getContestoAttuale());
    	var facets = Application.getContestoAttuale().getFacets();
    	// D.T. End
    	startloader();
        var strData = query_params.join('&');
        var queryPrediction = [];
        for(var p=0; p< facets.length; p++){
            var tmp = facets[p].getPrediction();
            if(tmp!=null) queryPrediction.push(tmp);
        }
        var strPrediction = queryPrediction.join('&');
        /* DT Begin */
	    $.log("[sendUpdateRequest()] strPrediction = " + strPrediction);
	    /* DT End */
        var canvas_query_params = getQueryParamsWithLiskIds(canvas[currentCanvasIndex]); 
        if(queryPrediction.length>0){ strData = strData + '&' + strPrediction };
        if(canvas_query_params.length>0){strData = strData + "&fl="+canvas_query_params.join(',')}
        
        /*Novita rispetto alla chiamata precedente: qui ci sono i parametri che definiscono i vincoli della query*/
        var fqParams = getFQParams(Application.getContestoAttuale());
        if(fqParams.length>0){ strData = strData + "&" + fqParams.join('&');}
        if(canvas[currentCanvasIndex].sortBy()!=null){
            strData = strData + canvas[currentCanvasIndex].sortBy();
        }
        $.ajax({
          url: solrServer,
          data: strData,
          dataType: 'jsonp',
          success: updatePage,
          jsonp: 'json.wrf'
        });
        
        if (canvasSec.length > 0) {
		  	sendSecondaryCanvasUpdateRequest();
		}
    }
}

function sendSecondaryCanvasUpdateRequest(){
    if(online){
    	// D.T. Begin
    	Application.updateQueryParams(Application.getContestoSecondario());
    	var facets = Application.getContestoSecondario().getFacets();
    	// D.T. End
    	startloader();
        var strData = query_params.join('&');
        var queryPrediction = [];
        for(var p=0; p< facets.length; p++){
            var tmp = facets[p].getPrediction();
            if(tmp!=null) queryPrediction.push(tmp);
        }
        var strPrediction = queryPrediction.join('&');
        /* DT Begin */
	    $.log("[sendUpdateRequest()] strPrediction = " + strPrediction);
	    /* DT End */
        var canvas_query_params = getQueryParamsWithLiskIds(canvasSec[secondaryCanvasIndex]); 
        if(queryPrediction.length>0){ strData = strData + '&' + strPrediction };
        if(canvas_query_params.length>0){strData = strData + "&fl="+canvas_query_params.join(',')}
        
        /*Novita rispetto alla chiamata precedente: qui ci sono i parametri che definiscono i vincoli della query*/
        var fqParams = getFQParams(Application.getContestoSecondario());
        if(fqParams.length>0){ strData = strData + "&" + fqParams.join('&');}
        if(canvasSec[secondaryCanvasIndex].sortBy()!=null){
            strData = strData + canvasSec[secondaryCanvasIndex].sortBy();
        }
        $.ajax({
          url: solrServer,
          data: strData,
          dataType: 'jsonp',
          success: updateSecondaryCanvas,
          jsonp: 'json.wrf'
        });
    }
}

//callback dell'update
function updatePage(data){
   var num = data.response.numFound; 
   var facets = Application.getContestoAttuale().getFacets();
   var itemType = Application.getContestoAttuale().getItemType();
   
   for(var f=0; f<facets.length; f++){
        if(facets[f].getExpression()!=null){
        	var facet_values = eval('data.facet_counts.facet_fields.'+facets[f].getExpression()); //VARIABILE CON I VALORI DA PASSARE AL FACET
        	if (Application.getContestoAttuale().isFacetsReady())
        		facets[f].facetUpdate(facet_values,num);
        	else
        		facets[f].facetBody(facet_values,num);
        }
  }
  Application.getContestoAttuale().setFacetsReady(true);
  
  var canvas_values = data.response.docs; //VARIABILE CON I VALORI DA PASSARE AL CANVAS
  last_query_values = canvas_values;
  $('#tmp').html(data.response.numFound);
  
  $('.viewTop .count .inner a').html(canvas_values.length);
  $('#save_'+itemType+' input[name="num-selezione"]').val(canvas_values.length);
  
  // D.T Begin - necessario ricostruire il canvas se si cambia tassonomia
  if (canvas[currentCanvasIndex].rebuildCanvas) {
  	canvas[currentCanvasIndex].releaseCanvas();
  	canvas[currentCanvasIndex].buildCanvas(last_query_values);
  	canvas[currentCanvasIndex].displayCanvas();
  	canvas[currentCanvasIndex].rebuildCanvas = false;  
  } else { 
  	canvas[currentCanvasIndex].updateCanvas(canvas_values);
  }
  
  if (Application._initFacetsEnum >= 0) {
  	 Application.passaAlContesto(Application._initFacetsEnum); 
  	 sendUpdateRequest();
  } else {
     $(document).ready(function(){ stoploader(); });
  }
  // D.T End
} 

//callback dell'update del canvas secondario
function updateSecondaryCanvas(data){
   var num = data.response.numFound; 
   
   var facets = Application.getContestoSecondario().getFacets();
   var itemType = Application.getContestoSecondario().getItemType();
   
   for(var f=0; f<facets.length; f++){
        if(facets[f].getExpression()!=null){
        	var facet_values = eval('data.facet_counts.facet_fields.'+facets[f].getExpression()); //VARIABILE CON I VALORI DA PASSARE AL FACET
        	if (Application.getContestoSecondario().isFacetsReady())
        		facets[f].facetUpdate(facet_values,num);
        	else
        		facets[f].facetBody(facet_values,num);
        }
  }
  Application.getContestoSecondario().setFacetsReady(true);
  
  var canvas_values = data.response.docs; //VARIABILE CON I VALORI DA PASSARE AL CANVAS
  last_query_values = canvas_values;
//  $('#tmp').html(data.response.numFound);
  
//  $('.viewTop .count .inner a').html(canvas_values.length);
//  $('#save_'+itemType+' input[name="num-selezione"]').val(canvas_values.length);
  
  // D.T Begin - necessario ricostruire il canvas se si cambia tassonomia
  if (canvasSec[secondaryCanvasIndex].rebuildCanvas) {
  	canvasSec[secondaryCanvasIndex].releaseCanvas();
  	canvasSec[secondaryCanvasIndex].buildCanvas(last_query_values);
  	canvasSec[secondaryCanvasIndex].displayCanvas();
  	canvasSec[secondaryCanvasIndex].rebuildCanvas = false;  
  } else { 
  	canvasSec[secondaryCanvasIndex].updateCanvas(canvas_values);
  }
  
  $(document).ready(function(){ stoploader(); });
  
  // D.T End
} 
////////////////////////////////////////////////////////////////////////////////////////////////////////

/*Funzione per il passaggio ad altro canvas*/
function changeView(index){
    if(currentCanvasIndex!=index){
        canvas[currentCanvasIndex].releaseCanvas(); //rimuove il canvas precedente
        currentCanvasIndex = index;
        $('.viewTop .selection .currentSelection').html(canvas[currentCanvasIndex]._settings.label + '<img class="arrow" src="theme/images/arrowdown.png">');
        sendNewCanvasRequest();
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//Chiamate di Passaggio a nuovo canvas: usata quando si cambia il canvas per recuperare tutti i dati che 
//servono per costruire da zero un canvas
////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendNewCanvasRequest(){
	// D.T. Begin
	Application.updateQueryParams(Application.getContestoAttuale());
	// D.T. End
    startloader();
    var strData = query_params.join('&');    
    /* DT Begin */
    $.log("[sendNewCanvasRequest()] strData = " + strData);
    /* DT End */
    var canvas_query_params = getQueryParamsWithLiskIds(canvas[currentCanvasIndex]); 
    if(canvas_query_params.length>0){strData = strData + "&fl="+canvas_query_params.join(',')}
    if(canvas[currentCanvasIndex].sortBy()!=null){
        strData = strData + canvas[currentCanvasIndex].sortBy();
    }
    $.ajax({
      url: solrServer,
      data: strData,
      dataType: 'jsonp',
      success: newCanvas,
      jsonp: 'json.wrf'
    });
}

//callback
function newCanvas(data){
  $('.lens.built').remove();
  var canvas_values = data.response.docs; //VARIABILE CON I VALORI DA PASSARE AL CANVAS
  canvas[currentCanvasIndex].buildCanvas(canvas_values); //costruisci il canvas da zero
  canvas[currentCanvasIndex].displayCanvas();
  stoploader();
  
  checkPendingRequestU = function() {
    if ($.active > 0) { setTimeout("checkPendingRequestU()",20); } else { sendUpdateRequest();} //chiama l'update per portarlo nello stato attuale della selezione
  }
  checkPendingRequestU();
}  
 
////////////////////////////////////////////////////////////////////////////////////////////////////////

// D.T. Begin - switch tra contesti

function switchContext(index) {
	var contesto = Application.passaAlContesto(index);
	
	$.log("Passo al contesto "+contesto.getItemType());
}

// D.T. End

/*Funzione per il passaggio tra modalita ONLINE E OFFLINE*/
function OnOff(itemType){    
    
    if($('#facet-toolbar_'+itemType+' .enableOffline').hasClass('online')){
        $('#facet-toolbar_'+itemType+' .enableOffline').removeClass('online');
        $('#facet-toolbar_'+itemType+' .enableOffline').addClass('offline');
        $('#facet-toolbar_'+itemType+' .enableOffline').attr('src','theme/images/offline.png');
        $('#facet-toolbar_'+itemType+' .enableOffline').attr('title','Passa a modalità Online');
        online=false;
        alert('Attenzione!\n\nNella modalità offline il Canvas e i parametri non sono sincronizzati.\n\nPer riattivare la sincronizzazione tornare in modalità Online');
    }
    else if($('#facet-toolbar_'+itemType+' .enableOffline').hasClass('offline')){
        $('#facet-toolbar_'+itemType+' .enableOffline').removeClass('offline');
        $('#facet-toolbar_'+itemType+' .enableOffline').addClass('online');
        $('#facet-toolbar_'+itemType+' .enableOffline').attr('src','theme/images/online.png');
        $('#facet-toolbar_'+itemType+' .enableOffline').attr('title','Passa a modalità Offline');
        online=true;
        alert('Attenzione!\n\nIn caso di risultato nullo usare i bottoni Reset dei parametri per eliminare le selezioni fatte.');
        sendUpdateRequest();
    }

}

// WS INIT 1112
////////////////////////////////////////////////////////////////////////////////////////////////////////

/*Funzione per il passaggio tra modalita ONLINE E OFFLINE*/
function loginWS(){    
	showLogin();
}

/*Verifica dei cookie di login*/
$(document).ready(function() {
	if (RestInterface.user == null) {
		var email = "";
		var password = "";
		var cok = $.cookie("login_l4all");
		if (cok != null) {
			email = cok;
			$.log("last login email: " + email);
		}
		cok = $.cookie("password_l4all");
		if (cok != null) {
			password = cok;
			$.log("last login password: " + password);
		}
		if (email.length > 0 && password.length  > 0) {
			$.log("automatic login: " + email + " - " + password);
			RestInterface.sendLogin(email, password);
		}
	}
});
// WS END 1112

// Funzione per leggere i parametri della query string
function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}