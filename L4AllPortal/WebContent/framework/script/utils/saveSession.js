/*
    Script che contiene le funzioni per la gestione del salvataggio della sessessione di esplorazione (lo stato dei facet).
    Ogni widget nella sua implementazione ha un metodo che restituisce un oggetto di tipo facetSnapshot, e un altro metodo che ripristina
    lo stato partendo da un oggetto facetSnapshot
*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// OGGETTI PER IL SALVATAGGIO DELLA SESSIONE
///////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*Oggetto con le informazioni di base dello stato di un widget
        number: l'indice nel array facets[]
        div_id: l'id del div che contiene il widget
        selectedValues: i valori selezionati al momento dello snapshot (eventualmente NULL)
        excludedValues: i valori che devono essere esclusi dai risultati
        view: lo stile di rendering della distribuzione: absolute, relative, percentage
        conj: l'operatore logico da usare nella query: AND, OR, ONE
        sortBy: strategia di ordinamento
        collapsed: widget aperto o chiuso (booleano)
    !! PER AGGIUGERE EVENTUALI PROPIETà FUTURE SPECIFICHE PER UN TIPO DI WIDGET, SI POSSONO AGGIUNGERE
     NUOVI METODI USANDO PROTOTYPE, EVITANDO DI DOVER MODIFICARE QUESTO COSTRUTTTORE COMUNE!!
         facetSnapshot.prototype.nuovometodo= function() {
            ....
          } 
    */
    function facetSnapshot(number ,div_id, type, selectedValues, excludedValues, view, conj, sortBy, collapsed) {
        this.number = number;
        this.div_id = div_id;
        this.type = type;
        this.selectedValues = selectedValues;
        this.excludedValues = excludedValues;
        this.view = view;
        this.conj = conj;
        this.sortBy = sortBy;
        this.collapsed = collapsed;
    } 
    
    /*Oggetto con le informazioni della sessione salvata
        label:etichetta
        dataSalvataggio: data di quando salvare
        numeroOggetti: numero di oggetti dello stato
        note: note dettate dall'utente in fase di salvataggio
        facetArray: un array di oggetti di tipo facetSnapshot
    */
    
    function sessione(label,note,data, numero) {
        this.label = label;  
        this.dataSalvataggio= data;
        this.numeroOggetti=numero;
        this.note = note;
        this.facetArray = new Array(); 
    }
    sessione.prototype.addFacet= function(item) {
        this.facetArray[this.facetArray.length] = item;
      }     
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// D.T. START
// buildSessione(label, note)
// funzione per costruire l'oggetto sessione a partire dai facets
buildSessione = function(label, note, itemType) {
	var s = new sessione(label, note, new Date() , $('#view .viewTop .count .inner a').html()); //oggetto della sessione
	var facets = null;
	if (itemType != null)
		facets = Application.getContestoByItemType(itemType).getFacets();
	else 
		facets = Application.getContestoAttuale().getFacets();
    for(var f=0; f<facets.length; f++){ //per ogni widget aggiungi lo stato attuale (oggetto di tipo facetSnapshot)
        try{
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var tmpSnap = facets[f].getSnapshot(f); //CHIAMATA ALLA FUNZIONE DEL WIDGET
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if(tmpSnap!=null){
                s.addFacet(tmpSnap);
            }
        }catch(err){
            alert("Impossibile salvare snapshot del parametro " + facets[f]._id_div + "\n ToDo: implimentare motodo getSnapshot() per il tipo di facet");
        }finally{
            
        }
    }
    return s;
}

ripristinaSessione = function(stringaSessione) {
    var campiSessione = stringaSessione.split('$$');
    var session = new sessione(campiSessione[0],campiSessione[3],campiSessione[1], campiSessione[2]);
    for(var cs=4; cs<campiSessione.length; cs++){
        campiFacet= campiSessione[cs].split('&&');
        // D.T. Begin - aggiunto il parametro per i valori esclusi
        session.addFacet(new facetSnapshot(campiFacet[0],campiFacet[1],campiFacet[2],campiFacet[3],campiFacet[4],campiFacet[5],campiFacet[6],campiFacet[7],campiFacet[8]));
    	// D.T. End
    }
    
    ripristinaFacets(session);        
}

ripristinaFacets=function(session) {
	try {
		var facets = Application.getContestoAttuale().getFacets();
		for(var sf=0; sf<session.facetArray.length; sf++){
            var index = session.facetArray[sf].number;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            facets[index].restoreSnapshot(session.facetArray[sf]); //CHIAMATA ALLA FUNZIONE DI RESTORE NEI SINGOLO WIDGET
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        }
        
        $('#reviewSaveList .containerS .close').trigger('click'); //forza chiusura della maschera
    }catch(err){
       alert('ToDo: implementare il metodo restoreSnapshot(snapshot) nei facet');
    }finally{
        
    }
}

generaSessioneSerializzata = function(s) {
	var salvataggio = s.label + "$$" + s.dataSalvataggio + "$$" + s.numeroOggetti + "$$" + s.note;
    for(var a=0; a<s.facetArray.length;a++){
        salvataggio = salvataggio + "$$" + serializeFacet(s.facetArray[a]);
    }
    return salvataggio;
}
// D.T. END

//funzione che costruisce la finestra di review dei salvataggi
manageSaveExploration = function(){
    if($('#reviewSaveList').get().length>0){ $('#reviewSaveList').html(""); rwl=$('#reviewSaveList');} //svuota eventuali finestre di salvataggio esistenti else la crea
    else { 
        rsl = document.createElement('div'); 
        rsl.id= "reviewSaveList"; 
        rsl.className= "reviewSaveList"; 
        $('body').append(rsl);
    }
    
    $('#reviewSaveList').append('<div class="opaco"></div>'); //il div opaco sta dietro ed è semitrasparente
    $('#reviewSaveList .opaco').css('width',$('body').css('width')); 
    $('#reviewSaveList .opaco').css('height',screen.height + "px");
    
    $('#reviewSaveList').append('<div class="containerS"></div>'); //questo div conterrà il contenuto della maschera di salvataggio
    
    var cB = '<img class="close" title="Torna all\'esplorazione" src="framework/script/images/close.png"/>'; //bottoncino di chiusura
    $('#reviewSaveList .containerS').append(cB);
    
    var left = parseInt((parseInt($('body').css('width'))-(parseInt($('#reviewSaveList .containerS').css('width')))-40)/2);
    $('#reviewSaveList .containerS').css('left',left+'px'); //posiziona finestra al centro
    
    $('#reviewSaveList .containerS .close').click(function(){  $('#reviewSaveList').remove()}); //evento di chiusurta
    
    /*la maschera è divisa in top (dove si salva) e bottom dove si vedono i salvataggi: left è la lista, right è il dettaglio*/
    $('#reviewSaveList .containerS').append('<div class="top"></div> <hr/> <div class="bottom"><div class="sx"/><hr class="vertical"/><div class="dx"/></div>');
    
    
    
    /*FORM-like per l'input dei dati del salvataggio*/
    $('#reviewSaveList .containerS .top').append("<h3 class='h'> Salva sessione corrente:</h3>"+
            " <div><form id='save'>"+
                "<span>Titolo: </span><input class='label' accept-charset = 'UTF-8' size=42 type='text' name='saveLabel'/>"+
                "<br/>"+
                "<span>Note: </span><textarea class='note' accept-charset = 'UTF-8' NAME='note' cols=40 rows=6></textarea>"+
                "<br/>"+
                 "<button type='button' onclick='save()'> <span>Salva</span> </button>"+
            "</form></div> ");
	
	
	
	
   //costruzione della parte inferiore della maschera: review e gestione dei salvataggi (e restore)
   if(SessionProxy.hasSessioniSalvate()){ //se ci sono salvataggi... se il cookie esiste
        var snapshots = SessionProxy.getSessioniSalvate().split('^'); //recupera le label dei singol cookie
        var ul = "<h3>Esplorazioni salvate: <img class='clearCookies' title='Elimina tutti i salvataggi' src='framework/script/images/clear_filters.png' /></h3><ul class='snapshots'>";
        for(var s=0; s<snapshots.length; s++){ //costruisci la lista
            ul = ul + "<li n='"+s+"' val='"+snapshots[s]+"'><span>"+snapshots[s]+"</span></li>";
        }
        ul = ul + "</ul>";
        $('#reviewSaveList .containerS .bottom .sx').append(ul);
    
        /*funzione per costruire la sezione di dettaglio di un salvataggio*/
        function snapshotDetail(index){
            var stringaSessione = $.cookie(snapshots[index]);
            if(stringaSessione!=null){
                //RECUPERO DELLA SESSIONE SE SI USASSE SERIALIZZAZIONE
                //var serializer = new ONEGEEK.GSerializer(); 
                //var session = serializer.deserialize(sessionXML);
                
                //Parsa la stringa di salvataggio
                var campiSessione = stringaSessione.split('$$');
                var session = new sessione(campiSessione[0],campiSessione[3],campiSessione[1], campiSessione[2]); //crea oggetto sessione
                /*Le righe che seguono servono solo per il ripristino: in questo momento sono superflue perchè non vogliamo le info sullo stato dei singoli facet
                ma solo le info generali del salvataggio
                for(var cs=4; cs<campiSessione.length; cs++){
                    campiFacet= campiSessione[cs].split('&&');
                    session.addFacet(new facetSnapshot(campiFacet[campiFacet[0],campiFacet[1],campiFacet[2],campiFacet[3],campiFacet[4],campiFacet[5],campiFacet[6],campiFacet[7]));
                }
                */
                
                //costruisci html del dettaglio
                $('#reviewSaveList .containerS .bottom .dx .snapshotDetail').remove();
                $('#reviewSaveList .containerS .bottom .sx ul li.selected').removeClass('selected');
                $('#reviewSaveList .containerS .bottom .sx ul li[n="'+index+'"]').addClass('selected');
                
                var html = "<div class='snapshotDetail'>";
                 html = html + '<img val="'+session.label+'" class="delSnapshot" title="Elimina salvataggio" src="framework/script/images/close.png"/>';
                 html = html + "<div><span>Salvataggio: </span><span>"+session.label+"</span><span> ("+session.numeroOggetti+" items)</span></div>";
                 html = html + "<div><span>Data: </span><span>"+session.dataSalvataggio+"</span></div>";
                 html = html + "<div><span>Note: </span><span>"+session.note+"</span></div>";
                 html = html + "<div val='"+session.label+"' class='ripristina'>RIPRISTINA</div>";
                 html = html + "</div>";
                
                $('#reviewSaveList .containerS .bottom .dx').append(html);
                
                /*EVENTO DI RIPRISTINO DI UN SALVATAGGIO*/
                 $('#reviewSaveList .containerS .bottom .dx .ripristina').click(function(){
                    ripristina(this);
                });
            }
        }/*fine della funzione di costruzione del dettaglio*/
        
        snapshotDetail(0); //di default apri dettaglio del primo della lista
        
        
        /*EVENTO APERTURA DETTAGLIO SALVATAGGIO quando si clicca su un elemento della lista (uso dell'attrivuto n per il numero da passare alla funzione snapshotDetail)*/
        $('#reviewSaveList .containerS .bottom .sx ul li').click(function(){ snapshotDetail($(this).attr('n')); });
        
        /*EVENTO DI CANCELLAZIONE DI TUTTI I SALVATAGGI*/
        $('#reviewSaveList .containerS .bottom .sx .clearCookies').click(function(){
           var snapshots = $.cookie('sessioniSalvate').split('^');
           for( var q=0; q<snapshots.length; q++){ $.cookie(snapshots[q], null, { path: '/' });  }
           $.cookie('sessioniSalvate', null, { path: '/' });
           $('#reviewSaveList .containerS .close').trigger('click'); //forza chiusura della maschera
        });
        
        
        /*funzione per il ripristino dello stato*/
        ripristina = function(node){
            
            var ck = $(node).attr('val');
            var stringaSessione = $.cookie(ck);
            //RECUPERO DELLA SESSIONE SE SI USASSE SERIALIZZAZIONE
            //var serializer = new ONEGEEK.GSerializer();
            //var session = serializer.deserialize(sessionXML);
            if (stringaSessione != null) {
            	ripristinaSessione(stringaSessione);
            	sendUpdateRequest(); //forza update dell'interfaccia: DOPO AVER RIPRISTINATO TUTTI I VALORI INVIA LA QUERY A SOL, per evitare di mandare n chiamate parziali
            }
        }
        
        /*EVENTO DI CANCELLAZIONE DI UNO SPECIFICO SALVATAGGIO*/
        $('#reviewSaveList .containerS .bottom .dx .delSnapshot').click(function(){
            var ck = $(this).attr('val');
            
            var sessioniSalvate = $.cookie('sessioniSalvate');//cacellalo dal cookie con i nomi dei salvataggi
            if(sessioniSalvate!=null){
                 sessioniSalvate = sessioniSalvate.replace("^"+ck+"^","^"); //se è in mezzo alla stringa
                 sessioniSalvate = sessioniSalvate.replace("^"+ck,""); //se è l'utlimo
                 sessioniSalvate = sessioniSalvate.replace(ck+"^",""); //se è il primo
                 sessioniSalvate = sessioniSalvate.replace(ck,"");
            }
            if(sessioniSalvate!="") $.cookie('sessioniSalvate', sessioniSalvate, { expires: 365, path: '/' });
            else $.cookie('sessioniSalvate', null, { path: '/' });
            
            $.cookie(ck, null, { expires: 365, path: '/' });
            $('#reviewSaveList .containerS .close').trigger('click'); //forza chiusura della maschera
            $('.saveExploration').trigger('click'); //forza riapertura           
        });
    }else{ //se non ci sono salvataggi
        var html = "<div class='snapshotDetail'>";
             html = html + "<h3>Nessun salvataggio disponibile</h3>"
             html = html + "</div>";
            $('#reviewSaveList .containerS .bottom .sx').append(html);
    }
}

//////////////////////////////////////////////////////////
//funzione per il salvataggio
//////////////////////////////////////////////////////////
save = function() { 
   
   	var cosa = $('#save_'+accordionType+' input[name="cosa"]:checked').val();
   
    $.log("[save()] cosa = " + cosa);
   	switch (cosa) {
   		case "query": saveQuery();
   			break;
   		case "wishlist": saveWishlist();
   			break;
   		case "risultati": saveSelection();
   			break;
   		default: alert("Selezionare cosa salvare");
   	}
         
} 

saveQuery = function() {
	var label = $('#save_'+accordionType+' .label').val(); //valore della form
    var note = $('#save_'+accordionType+' .note').val();  //valore della form
    var group = $('#save_'+accordionType+' input[name="selected-group"]').val();
    
    if (group.length == 0) {
    	alert ("Selezionare il gruppo in cui salvare");
    	return;
    }
    	
    if (label.length == 0) {
    	alert ("Inserire il nome del salvataggio");
    	return;
    }
    
    var s = buildSessione(label, note);
    
	$.log("[save()] label = " + label);
	$.log("[save()] note = " + note);
	$.log("[save()] group = " + group);
	$.log("[save()] type = " + accordionType);
	
    SessionProxy.salvaSessione(s, group, accordionType);
  
}

saveWishlist = function() {
	saveItemList("wishlist");
}

saveSelection = function() {
	saveItemList("index");
}

saveItemList = function(type) {
	var label = $('#save_'+accordionType+' .label').val();
   	var note = $('#save_'+accordionType+' .note').val();
   	var itemType = accordionType;
   	
   	var group = $('#save_'+accordionType+' input[name="selected-group"]').val();
    
    if (group.length == 0) {
    	alert ("Selezionare il gruppo in cui salvare");
    	return;
    }
    	
    if (label.length == 0) {
    	alert ("Inserire il nome del salvataggio");
    	return;
    }
    
	SessionProxy.salvaWishlist(label, note, wishList[itemType], type, itemType, group);
}