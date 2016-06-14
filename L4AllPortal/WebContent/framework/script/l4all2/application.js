Application = {
	_contesti: [],
	_contestoAttuale: 0,
	_initFacetsEnum: 0,
	
	addContesto: function(contesto) {
		this._contesti.push(contesto);
	},
	
	getContestoAttuale: function() {
		if (this._contesti != null && this._contesti.length > this._contestoAttuale)
			return this._contesti[this._contestoAttuale];
	},
	
	getContestoSecondario: function () {
		if (this._contesti != null && this._contesti.length > 0) {
			var numContesti = this._contesti.length;
			return this._contesti[(this._contestoAttuale + 1) % numContesti];
		}
	},
	
	getContestoByItemType: function(itemType) {
		for (var i = 0; i < this._contesti.length; i++) {
			if (this._contesti[i].getItemType() == itemType) {
				return this._contesti[i];
			};
		};
	},
	
	passaAlContesto: function(index) {
		if (index > this._contesti.length)
			return null;
			
		if (index == this._contestoAttuale)
			return this.getContestoAttuale();
		
		// crea l'oggetto sessione per poter tornare alla 
		// selezione dei widget fatta al momento del cambio di contesto
		if (this.getContestoAttuale() != null) {
			this.getContestoAttuale().freezeSession();
		}
		
		if (this.getContestoSecondario() != null) {
			this.getContestoSecondario().freezeSession();
		}
		
		this._contestoAttuale=index;
		itemType = this.getContestoAttuale().getItemType();
		$('#refraso').html('<span class="body"><span class="default">'+refraso[itemType].all+'</span></span>');
		ripristinaFacets(this.getContestoAttuale().getSession());
		
		canvas[currentCanvasIndex]._settings.lenstype=this.getContestoSecondario().getItemType();
		canvas[currentCanvasIndex].rebuildCanvas = true;
		
		canvasSec[secondaryCanvasIndex]._settings.lenstype=this.getContestoSecondario().getItemType();
		canvasSec[secondaryCanvasIndex].rebuildCanvas = true;
		$('#titolo-pannello-secondario').html(this.getNomePannelloSecondario());
		
		return this.getContestoAttuale();
	},

	// Restituisce il nome per il pannello secondario	
	getNomePannelloSecondario: function() {
		var type = this.getContestoSecondario().getItemType();
		
		switch (type) {
			case "luogo": return "Luoghi";
			case "informazioni": return "Informazioni";
			default: return "Luoghi";
		};
	},
	
	// Imposta i parametri di ricerca prima della chiamata a SOLR.
	// query_params è un array associatigo a livello globale
	updateQueryParams: function(contesto) {
		var done = false;
		for (var i=0; i<query_params.length; i++) {
			if (query_params[i].indexOf("q=") == 0) { 
				query_params[i] = 'q=' + contesto.getItemType();
				done = true;
				break;
			}
		} 
		if (!done) {
			query_params.push('q=' + contesto.getItemType());
		}
		
		// setta l'ordinamento dei facet di tipo Slider
		for (var j = 0; j < contesto.getFacets().length; j++) {
			var facet = contesto.getFacets();
			if (facet._type == 'Slider') {
	            query_params.push('f.'+facet.expression+'.facet.sort=index'); //in questo modo gli slider sono gia ordinati
	        }
		}
	}
}

Contesto = function(itemType) {
	this._itemType = itemType;
	this._session = null;
	this._selezioni = wishList[this._itemType];
	this._facets = new Array();
	this._facetsReady = false;
	
	this.getItemType= function() {return this._itemType;};
	this.getSession=function() {return this._session;};
	this.freezeSession=function() {
		this._session = buildSessione(this._itemType, "Salvataggio per cambio contesto", this._itemType);
	};
	this.getFacets= function() {return this._facets;};
	this.setFacetsReady=function(ready) {this._facetsReady=ready; Application._initFacetsEnum = Application._initFacetsEnum -1;}; 
	this.isFacetsReady = function() {return this._facetsReady};
	// Ritorna l'array di wishlist globale relativo alla tipologia del contesto corrente
	this.getWishlist=function(){return this._selezioni};
}

Contesto.prototype.getFacetById = function(idFacet) {
	for (var i = 0; i < this._facets.length; i++) {
		if (this._facets[i]._id_div == idFacet)
			return this._facets[i];
	}
	
	return null;
}