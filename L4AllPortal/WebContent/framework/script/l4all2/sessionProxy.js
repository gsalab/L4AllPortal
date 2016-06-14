SessionProxy = {
	
	_manager: null,
	
	setManager: function(manager) {
		this._manager = manager;
	}
	
	,loadSessioniSalvate: function() {
		this._manager.loadSessioniSalvate();
	}
	
	,hasSessioniSalvate: function() {
		return this._manager.hasSessioniSalvate();
	}
	
	,getSessioniSalvate: function() {
		return this._manager.getSessioniSalvate();
	}
	
	,salvaSessione: function(s, group, type) {
		this._manager.salvaSessione(s, group, type);
	}
	
	,deleteSessione: function(sesisonId) {
		this._manager.deleteSession(sesisonId);
	}
	
	,salvaWishlist: function(label, note, wishlist, type, itemType, group) {
		this._manager.salvaWishlist(label, note, wishlist, type, itemType, group);
	}
	
	,deleteWishlist: function(wishId) {
		this._manager.deleteWishlist(wishId);
	}
	
	,restoreWishlist: function(type, ids) {
		this._manager.restoreWishlist(type, ids);
	}
	
	,fondiWishlist: function(type, ids) {
		this._manager.fondiWishlist(type, ids);
	}
	
	,sottraiWishlist: function(type, ids) {
		this._manager.sottraiWishlist(type, ids);
	}
	
	,toJsTreeModel:function() {
		return this._manager.toJsTreeModel();
	}
	
	,toJsTreeModelWishlist: function(wishlist, itemType) {
		return this._manager.toJsTreeModelWishlist(wishlist, itemType);
	}
	
	,dataReady: function() {
		return this._manager.dataRedy();
	}
}

CookieSessionManager = {
	hasSessioniSalvate: function() {
		return $.cookie('sessioniSalvate') != null;
	}
	
	,loadSessioniSalvate: function() {
		
	}
	
	,getSessioniSalvate: function() {
		return $.cookie('sessioniSalvate');
	}
	
	,dataRedy: function() {
		return true;
	}
	
	,salvaSessione: function (s) {
		/*
        *Questo tipo di salvataggio (COMMENTATO) usa la libreria GSerializer per serializzare un oggetto in una stringa XML: è molto
        *comodo riuscire a recuperare direttamente l'oggetto, TUTTAVIA LA SERIALIZZAZIONE DELLO STATO DEI FACET PORTA AD
        *AVERE UNA STRINGA DI CIRCA 15K CARATTERI, BEN OLTRE I 4K CHE POSSONO ESSERE SALVATI COME COOKIE.
        *-> se si decidesse di salvare serverside i profili, de comentatere le prossime righe
        */
        //var serializer = new ONEGEEK.GSerializer();
       // var salvataggio = serializer.serialize( s, 'sessione');
       
       
       /*Questo salvataggio è una soluzione per superare il limite della serializzazione, ma richiede di scrivere
          a mano il parser del salvataggio:
          $$->separa i campi dell'oggetto sessione
          &&->separa i i campi dell'oggetto facetSnapshot
       */
       var salvataggio = generaSessioneSerializzata(s);
        
        //scrive cookie della sessione
        if(salvataggio.length > 3999) alert('Impossibile salvare il profilo - un cookie non può superare i 4000 caratteri ('+salvataggio.length+')');
        else {
        	$.cookie(label, salvataggio, { expires: 365, path: '/' }); //ATTENZIONE: quando si cancella un cookie bisogna mettere le stesse parametrizzazioni di expires e path
	        if( $.cookie(label)!=null){ //verifica che il cookie sia stato salvato
	            //aggiunge il salvataggio alla lista dei salvataggi:
	            //ToDo: manca il controllo che esista già un salvataggio con lo stesso nome: ora verrebbe sovrascritto e comparirebbe 2 volte nell'elenco
	            var sessioniSalvate = $.cookie('sessioniSalvate');  
	            if(sessioniSalvate!=null) sessioniSalvate = sessioniSalvate + "^" + label;
	            else sessioniSalvate = label; 
	            $.cookie('sessioniSalvate', sessioniSalvate, { expires: 365, path: '/' });
	        }
	        else alert('Impossibile salvare il profilo, è stato raggiunto il massimo di cookie permesso dal browser');
		        
	        //ATTENZIONE: usare i cookies impone un forte vincolo: NON SI POSSONO AVERE + 30 COOKIE (numero variabile da browser a browser) PER UN SINGOLO DOMINIO
	        //QUESTO SIGNIFICA CHE NON SI POSSON AVERE PIù DI 28 SALVATAGGI
	        //ToDo: passare al salvataggio remoto delle sessioni e delle wishlist usando la serializzazione descritta sopra!
        }
        //$('#reviewSaveList .containerS .close').trigger('click'); //forza chiusura della maschera
		
        
	}
	
	,deleteSessione: function (sessionId) {}
	
	,salvaWishlist: function(label, note, wishnow) {
		if( wishnow.length>0){ //per non sprecare cookie, salva solo wish non vuote!
           var str = wishnow[0]; //stringa che conterrà la sequenza di id separati da ","
           for(var w=1; w<wishnow.length; w++){str = str +","+wishnow[w];}
           str= label + "$£"+ note + "$£" + str; //assembla il cookie
           $.cookie(label,str, { expires: 365, path: '/' }); //salvalo
           
           var wishSaved = $.cookie('wishSaved'); //il cookie con i salvataggi di wishlist fino ad ora
           if(wishSaved==null || wishSaved==""){ $.cookie('wishSaved',label, { expires: 365, path: '/' });}
           else{
              var cook =  $.cookie('wishSaved').split('$£');
              var exist=false;
              for(var c=0; c<cook.length; c++){
                  if(cook[c].toUpperCase() == label.toUpperCase()){ exist=true; break;}
              }
              
              if(!exist) {
                  newwishSaved = $.cookie('wishSaved')+"$£"+label;
                  $.cookie('wishSaved', newwishSaved, { expires: 365, path: '/' });
              }
           }
       }
	}
	
	,deleteWishlist: function (wishId) {
		
	}
	
	,restoreWishlist: function () {
		var key = $('.containerW .contSave .bottomS .sin li[n="'+$(this).attr('n')+'"]').attr('val');
        var values = $.cookie(key).split('$£')[2].split(',');
        
        for(ww in wishList){ wishList[ww]=values}
                    
        $('.containerW .contSave .close').trigger('click');
        $('.containerW > .close').trigger('click');
        $('.exportWishList').trigger('click');
	}
	
	,toJsTreeModel:function() {
		
	}
	
	,toJsTreeModelWishlist: function(wishlist, itemType) {
		
	}
}

RestSessionManager = {
	hasSessioniSalvate: function() {
		return RestInterface.simpleQueryList != null;
	}
	
	,loadSessioniSalvate: function() {
		RestInterface.doLoadSimpleQuery();
		RestInterface.doLoadWishlist();
	}
	
 	,getSessioniSalvate: function() {
		var snapshots=[], k=0;
		var queries = RestInterface.simpleQueryList.queries;
		for (var i = 0; i < queries.length; i++) {
			snapshots[k++] = queries[i].titolo;
		}
		return snapshots.join('^');
	}
	
	,dataRedy: function() {
		var result = RestInterface.queryListReady && RestInterface.wishlistReady;
		
		if (result)
			RestInterface.reload = false;
		
		return result;
	}
	
	,salvaSessione: function(s, group, type) {
		var salvataggio=[], k=0;
		for(var a=0; a<s.facetArray.length;a++){
			salvataggio[k++] = serializeFacet(s.facetArray[a]);
		}
		RestInterface.doSaveSimpleQuery(group, s.label, s.note, s.numeroOggetti, salvataggio.join("$$"), type);
	}
	
	,salvaWishlist: function(label, note, wishlist, type, itemType, group) {
		RestInterface.doSaveWishlist(label, note, wishlist.join(','), type, itemType, group);
	}
	
	,deleteSession: function(sissionId) {
		RestInterface.doDeleteSimpleQuery(sissionId);
	}
	
	,deleteWishlist: function(wishId) {
		RestInterface.doDeleteWishlist(wishId);
	}
	
	,restoreWishlist: function(type, ids) {
		var type = $("#load_"+accordionType+" .type").val();
		var ids = $("#load_"+accordionType+" .exp_ids").val();
		
		if (ids.length == 0)
			return;
			
		if (type in wishList) {wishList[type] = ids.split(',');}
		
		$("#tabs-"+ type).tabs("select", "#tabs-4_"+ type);
	}
	
	,fondiWishlist: function() {
		var type = $("#load_"+accordionType+" .type").val();
		var ids = $("#load_"+accordionType+" .exp_ids").val();
		
		if (ids.length == 0)
			return;
			
		if (type in wishList) {
			var id_arr = ids.split(',');
			
			for (var i = 0; i < id_arr.length; i++) {
				if (wishList[type].indexOf(id_arr[i]) < 0)
					wishList[type].push(id_arr[i]);
			}
		}
		
		$("#tabs-"+ type).tabs("select", "#tabs-4_"+ type);
	}
	
	,sottraiWishlist: function(type, ids) {
		var type = $("#load_"+accordionType+" .type").val();
		var ids = $("#load_"+accordionType+" .exp_ids").val();
		
		if (ids.length == 0)
			return;
			
		if (type in wishList) {
			var newWishlist=[];
			var id_arr = ids.split(',');
			
			for (var i = 0; i < wishList[type].length; i++) {
				if (id_arr.indexOf(wishList[type][i]) < 0)
					newWishlist.push(wishList[type][i]);
			}
			wishList[type] = newWishlist;
		}
		
		$("#tabs-"+ type).tabs("select", "#tabs-4_"+ type);
	}
	
	,toJsTreeModel:function() {
		var result =[];
		
		this._insertSimpleQuery(result);
		this._insertWishlist(result);
		
		$.log("loading json in tree: ");
		$.log(result);
		return result;
	}
	
	,toJsTreeModelWishlist: function(wishlist, itemType) {
		var result =[];
		
		for (var i = 0; i < wishlist.length; i++) {
			var idobj = wishlist[i];
			var title = $(".mosaicCell[idobj='"+idobj+"']").attr("title");
			
			result.push(this._createData(title, wishlist[i], itemType));
		}
		
		$.log("loading json in tree: ");
		$.log(result);
		return result;
	}
	
	,_insertSimpleQuery: function(result) {
		
		var restLoadingModel = RestInterface.simpleQueryList;
		
		if (restLoadingModel.numRisultati == 1) {
			
			var current = restLoadingModel.queries;
			
			this._parseSimpleQuery(result, current);
		} else {
			for (var i = 0; i < restLoadingModel.numRisultati; i++) {
				var current = restLoadingModel.queries[i];
				
				this._parseSimpleQuery(result, current);
			}
		}
	}
	
	,_parseSimpleQuery: function(result, current) {
		var group = this._getOrCreateGroup(result, current.tag.value);
			
		var titolo = current.titolo + " (" + current.numOggetti + ")";
		
		var  obj = this._createData(titolo, current.simpleQueryId, current.type, "query");
		
		group.children.push(obj);
	}
	
	,_insertWishlist: function(result) {
		
		var restLoadingModel = RestInterface.wishlist;
		
		if (restLoadingModel.numRisultati == 1) {
			var current = restLoadingModel.wishlist;
			
			this._parseWishlist(result, current);
			
		} else {
			for (var i = 0; i < restLoadingModel.numRisultati; i++) {
				var current = restLoadingModel.wishlist[i];
				
				this._parseWishlist(result, current);
			}
		}
	}
	
	,_parseWishlist: function(result, current) {
		var group = this._getOrCreateGroup(result, current.tag.value);
		
		var titolo = current.titolo;
		if (isNaN(current.expId)) {
			titolo += " (" + current.expId.split(',').length + ")";
		} else 
			titolo += " (1)";
		
		var obj = this._createData(titolo, current.wishlistId, current.itemType, "wishlist");
		
		group.children.push(obj);
	}
	
	,_getOrCreateGroup: function (result, val) {
		for (var i = 0; i < result.length; i++) {
			var group = result[i];
			
			if (group.data == val)
				return group;
		}
		
		// crea un nuovo gruppo e lo inserisce nei risultati
		var group = this._createData(val, val, "cartella-open", null, "open");
		result.push(group);
		
		group.children = [];
		
		return group;
	}
	
	,_createData: function (titolo, id, rel, entity, state) {
		var obj = {};
		
		obj.data = titolo;
		
		if (typeof state != "undefined")
			obj.state = state;
		 
		obj.attr = {};
		obj.attr.name = titolo;
		obj.attr.id = id;
		obj.attr.rel = rel;
		obj.attr.entity = entity;
		
		return obj;
	}
}

serializeFacet = function(f) {
	return f.number + "&&" +
             f.div_id + "&&" +
              f.type + "&&" +
               f.selectedValues + "&&" +
                // D.T. Begin - aggiunti i valori esclusi 
                f.excludedValues + "&&" +
                // D.T. End
                 f.view + "&&" +
                  f.conj + "&&" +
                   f.sortBy + "&&" +
                    f.collapsed;
}