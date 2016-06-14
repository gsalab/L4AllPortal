function Constants(){};

Constants.Service = function (){};
Constants.Service.BASE_SERVICE_URL = "/l4all-rest";
Constants.Service.LOGIN_URL = Constants.Service.BASE_SERVICE_URL + "/login/json";
Constants.Service.REGISTRATION_URL = Constants.Service.BASE_SERVICE_URL + "/registration/json";
Constants.Service.SIMPLE_QUERY_URL = Constants.Service.BASE_SERVICE_URL + "/simplequery/json";
Constants.Service.WISHLIST_URL = Constants.Service.BASE_SERVICE_URL + "/wishlist/json";
Constants.Service.PASSWORD_RECOVERY_URL = Constants.Service.BASE_SERVICE_URL + "/password-recovery/json";

Constants.Login = function (){};
Constants.Login.EMAIL_FIELD = "login-email";
Constants.Login.PASSWORD_FIELD = "login-password"; 

Constants.PasswordRecovery = function (){};
Constants.PasswordRecovery.EMAIL_FIELD = "password-recovery-email";

Constants.Registration = function (){};
Constants.Registration.NOME_FIELD = "registrazione-nome";
Constants.Registration.COGNOME_FIELD = "registrazione-cognome";
Constants.Registration.EMAIL_FIELD = "registrazione-email";
Constants.Registration.PASSWORD_FIELD = "registrazione-password";
Constants.Registration.CONFERMA_PASSWORD_FIELD = "registrazione-conferma-password"; 

Constants.SimpleQuery = function (){};
Constants.SimpleQuery.USER_ID_FIELD = "simplequery-user-id";
Constants.SimpleQuery.TITLE_FIELD = "simplequery-titolo";
Constants.SimpleQuery.NOTE_FIELD = "simplequery-note";
Constants.SimpleQuery.QUERY_SOLR_FIELD = "simplequery-querysolr";
Constants.SimpleQuery.NUM_OGGETTI_FIELD = "simplequery-num-oggetti";
Constants.SimpleQuery.JSON_RESULT_FIELD = "simplequery-json-result";
Constants.SimpleQuery.TAGS_FIELD = "simplequery-tags";

Constants.LoadSimpleQuery = function (){};
Constants.LoadSimpleQuery.USER_ID_FIELD = "load-simplequery-user-id";

Constants.DeleteSimpleQuery = function (){};
Constants.DeleteSimpleQuery.USER_ID_FIELD = "delete-simplequery-user-id";
Constants.DeleteSimpleQuery.SIMPLE_QUERY_ID_FIELD = "delete-simplequery-id";

Constants.Wishlist = function (){};
Constants.Wishlist.USER_ID_FIELD = "wishlist-user-id";
Constants.Wishlist.TITLE_FIELD = "wishlist-titolo";
Constants.Wishlist.NOTE_FIELD = "wishlist-note";
Constants.Wishlist.TYPE_FIELD = "wishlist-type";
Constants.Wishlist.EXP_ID_FIELD = "wishlist-exp-id";
Constants.Wishlist.JSON_CONTENT_FIELD = "wishlist-json-content";
Constants.Wishlist.TAGS_FIELD = "wishlist-tags";

Constants.LoadWishlist = function (){};
Constants.LoadWishlist.USER_ID_FIELD = "load-wishlist-user-id";

Constants.DeleteWishlist = function (){};
Constants.DeleteWishlist.USER_ID_FIELD = "delete-wishlist-user-id";
Constants.DeleteWishlist.WISHLIST_ID_FIELD = "delete-wishlist-id";

UserContext = function(data) {
	this._json = data;
	
	this._userId = data.user.userId;
	this._nome = data.user.nome;
	this._cognome = data.user.cognome;
	this._email = data.user.email;
	this._password = data.user.password;
	
	this.getUserId=function(){return this._userId;};
	this.getNome=function(){return this._nome;};
	this.getCognome=function(){return this._cognome;};
	this.getEmail=function(){return this._email;};
	this.getPassword=function(){return this._password;};
	this.getFullName=function(){return this._nome + " " + this._cognome;};
};

RestInterface = {

	user: null, 			// verra' inizializzato nella success della login
	simpleQueryList: null,  // verra' inizializzato nella success della load
	queryListReady: false,  // verra' valorizzato a true nella success della load
	wishlist: null,         // verra' inizializzato nella success della load
	wishlistReady: false,   // verra' valorizzato a true nella success della load
	reload: true,           // indica se la lista salvataggi deve essere aggiornata
	
	getSimpleQueryById: function(id) {
		if (RestInterface.simpleQueryList == null)
			return null;
		
		if (RestInterface.simpleQueryList.numRisultati == 1) {
			if (RestInterface.simpleQueryList.queries.simpleQueryId == id)
				return RestInterface.simpleQueryList.queries;
		} else {
			for (var i = 0; i < RestInterface.simpleQueryList.numRisultati; i++) {
				var current = RestInterface.simpleQueryList.queries[i];
				if (current.simpleQueryId == id) 
					return current;
			}
		}
		
		return null;
	},
	
	getWishlistById: function(id) {
		if (RestInterface.wishlist == null)
			return null;
		
		if (RestInterface.wishlist.numRisultati == 1) {
			if (RestInterface.wishlist.wishlist.wishlistId == id)
				return RestInterface.wishlist.wishlist;
		} else {
			for (var i = 0; i < RestInterface.wishlist.numRisultati; i++) {
				var current = RestInterface.wishlist.wishlist[i];
				if (current.wishlistId == id) 
					return current;
			}
		}
		
		return null;
	},
	
	/* LOGIN */
	doLogin:function(func) {
		var email = $("#"+Constants.Login.EMAIL_FIELD).val();
		var password = $("#"+Constants.Login.PASSWORD_FIELD).val();
		
		// enchrypt password
		password = hex_md5(password);
		
		$.log("email: " + email);
		$.log("password: " + password);
		
		this.sendLogin(email, password);
		
	},
	
	sendLogin: function(email, password) {
		$.ajax({
	      url: restServer + Constants.Service.LOGIN_URL,
	      data: {"email": email, "password": password},
	      success: RestInterface.loginSuccess ,
	      error: RestInterface.loginError
	    });
	},
	
	loginSuccess: function(data, textStatus, jqXHR,funv) {
		RestInterface.user = new UserContext(data);
		$.log("user:");
		$.log(RestInterface.user);
		loginSuccessfully();
		//alert(funv)
	},
	
	loginError: function(jqXHR, textStatus, errorThrown) {
		loginFailed(jqXHR.responseText);
	},


	/* PASSWORD RECOVERY */
	doRicordaPassword:function() {
		var email = $("#"+Constants.PasswordRecovery.EMAIL_FIELD).val();
		
		$.log("email: " + email);
		
		$.ajax({
	      url: restServer + Constants.Service.PASSWORD_RECOVERY_URL,
	      data: {"email": email},
	      success: RestInterface.passwordRecoverySuccess,
	      error: RestInterface.passwordRecoveryError
	    });
	},
	
	passwordRecoverySuccess: function(data, textStatus, jqXHR) {
		recuperoSuccessfully(jqXHR.responseText);
	},
	
	passwordRecoveryError: function(jqXHR, textStatus, errorThrown) {
		recuperoFailed(jqXHR.responseText);
	},
	
	/* REGISTRATION */
	doRegistration: function() {
		var nome = $("#"+Constants.Registration.NOME_FIELD).val();
 		var cognome = $("#"+Constants.Registration.COGNOME_FIELD).val();
		var email = $("#"+Constants.Registration.EMAIL_FIELD).val();
		var password = $("#"+Constants.Registration.PASSWORD_FIELD).val();
		var confirm_password = $("#"+Constants.Registration.CONFERMA_PASSWORD_FIELD).val();
		
		// enchrypt password
		password = hex_md5(password);
		confirm_password = hex_md5(confirm_password);
		
		$.log("nome: " + nome);
		$.log("cognome: " + cognome);
		$.log("email: " + email);
		$.log("password: " + password);
		$.log("confirm_password: " + confirm_password);
		
		$.ajax({
	      url: restServer + Constants.Service.REGISTRATION_URL,
	      type: "POST",
	      data: {"nome": nome, "cognome": cognome,
	      		"email": email, "password": password, "conferma-password": confirm_password},
	      success: RestInterface.registrationSuccess,
	      error: RestInterface.registrationError
	    });
	},
	
	registrationSuccess: function(data, textStatus, jqXHR) {
		RestInterface.user = new UserContext(data);
		$.log("user:");
		$.log(RestInterface.user);
		loginSuccessfully();
	},
	
	registrationError: function(jqXHR, textStatus, errorThrown) {
		regFailed(jqXHR.responseText);
	},
	
	/* SIMPLE QUERY */
	doSaveSimpleQuery: function(group, label, note, num, salvataggio, type) {
		var user_id = this.user.getUserId();
		var json_results = "";//$("#"+Constants.SimpleQuery.JSON_RESULT_FIELD).val();
		var tags = group;//$("#"+Constants.SimpleQuery.TAGS_FIELD).val();
		
		$.log("user_id: " + user_id);
		$.log("titolo: " + label);
		$.log("note: " + note);
		$.log("query_solr: " + salvataggio);
		$.log("type: " + type);
		$.log("num_oggetti: " + num);
		$.log("json_results: " + json_results);
		$.log("tags: " + tags);
		
		var url = restServer + Constants.Service.SIMPLE_QUERY_URL + "/" + user_id;
		$.ajax({
	      url: url,
	      type: "POST",
	      data: {"titolo": label,
	      		 "note": note, 
	      		 "query-solr": salvataggio,
	      		 "type": type, 
	      		 "num-oggetti": num,
	      		 "json-result": json_results,
	      		 "tags": tags
	      },
	      success: RestInterface.saveSimpleQuerySuccess,
	      error: RestInterface.saveSimpleQueryError
	    });
	},
	
	saveSimpleQuerySuccess: function(data, textStatus, jqXHR) {
		
		$.log("simple query id:" + data.simpleQuery.simpleQueryId);
		
		RestInterface.reload = true;
		
		SessionProxy.loadSessioniSalvate();
	},
	
	saveSimpleQueryError: function(jqXHR, textStatus, errorThrown) {
		alert(jqXHR.responseText);
	},
	
	doLoadSimpleQuery: function() {
		var user_id = this.user.getUserId();
		
		$.log("user_id: " + user_id);
		
		if (RestInterface.reload) {
			RestInterface.queryListReady = false;
			var url = restServer + Constants.Service.SIMPLE_QUERY_URL + "/" + user_id;
			$.ajax({
		      url: url,
		      success: RestInterface.loadSimpleQuerySuccess,
		      error: RestInterface.loadSimpleQueryError
		    });
		} else {
			loadingSuccessfully();
		}
	},
	
	loadSimpleQuerySuccess: function(data, textStatus, jqXHR) {
		
		$.log("numero risultati:" + data.simpleQueryList.numRisultati);
		
		RestInterface.simpleQueryList = data.simpleQueryList;
		RestInterface.queryListReady = true;
		
		loadingSuccessfully();
	},
	
	loadSimpleQueryError: function(jqXHR, textStatus, errorThrown) {
		alert(jqXHR.responseText);
	},
	
	doDeleteSimpleQuery: function(simplequeryId) {
		var user_id = this.user.getUserId();
		//var simplequeryId = $("#"+Constants.DeleteSimpleQuery.SIMPLE_QUERY_ID_FIELD).val();
		
		$.log("user_id: " + user_id);
		$.log("simplequeryId: " + simplequeryId);
	
		var url = restServer + Constants.Service.SIMPLE_QUERY_URL + "/" + user_id;
		
		if (simplequeryId.length > 0)
			url += "/" + simplequeryId;
			
		$.ajax({
	      url: url,
	      type: "DELETE",
	      success: RestInterface.deleteSimpleQuerySuccess,
	      error: RestInterface.deleteSimpleQueryError
	    });
	},
	
	deleteSimpleQuerySuccess: function(data, textStatus, jqXHR) {
		
		deleteSuccessfully();
	},
	
	deleteSimpleQueryError: function(jqXHR, textStatus, errorThrown) {
		alert(jqXHR.responseText);
	},
	
	/* Wishlist */
	doSaveWishlist: function(label, note, wishlist, type, itemType, group) {
		var user_id = this.user.getUserId();
		var titolo = label;
 		var note = note;
		var exp_id = wishlist;
		var json_content = "";
		var tags = group;
		
		$.log("user_id: " + user_id);
		$.log("titolo: " + titolo);
		$.log("note: " + note);
		$.log("type: " + type);
		$.log("itemType: " + itemType);
		$.log("exp_id: " + exp_id);
		$.log("json_content: " + json_content);
		$.log("tags: " + tags);
	
		var url = restServer + Constants.Service.WISHLIST_URL + "/" + user_id;
		$.ajax({
	      url: url,
	      type: "POST",
	      data: {"titolo": titolo,
	      		 "note": note, 
	      		 "type": type, 
	      		 "itemType": itemType,
	      		 "exp-id": exp_id,
	      		 "json-content": json_content,
	      		 "tags": tags
	      },
	      success: RestInterface.saveWishlistSuccess,
	      error: RestInterface.saveWishlistError
	    });
	},
	
	saveWishlistSuccess: function(data, textStatus, jqXHR) {
		
		$.log("wishlist id:" + data.wishlist.wishlistId);
		RestInterface.reload = true;
		
		SessionProxy.loadSessioniSalvate();
	},
	
	saveWishlistError: function(jqXHR, textStatus, errorThrown) {
		alert(jqXHR.responseText);
	},
	
	doLoadWishlist: function() {
		var user_id = this.user.getUserId();
		
		$.log("user_id: " + user_id);
	
		if (RestInterface.reload) {
			RestInterface.wishlistReady = false;
			var url = restServer + Constants.Service.WISHLIST_URL + "/" + user_id;
			$.ajax({
		      url: url,
		      success: RestInterface.loadWishlistSuccess,
		      error: RestInterface.loadWishlistError
		    });
		} else {
			loadingSuccessfully();
		}
	},
	
	loadWishlistSuccess: function(data, textStatus, jqXHR) {
		
		$.log("numero risultati:" + data.wishlistList.numRisultati);
		
		RestInterface.wishlist = data.wishlistList;
		RestInterface.wishlistReady = true;
		
		loadingSuccessfully();
	},
	
	loadWishlistError: function(jqXHR, textStatus, errorThrown) {
		alert(jqXHR.responseText);
	},
	
	doDeleteWishlist: function(wishlistId) {
		var user_id = this.user.getUserId();
		//var wishlistId = $("#"+Constants.DeleteWishlist.WISHLIST_ID_FIELD).val();
		
		$.log("user_id: " + user_id);
		$.log("wishlistId: " + wishlistId);
	
		var url = restServer + Constants.Service.WISHLIST_URL + "/" + user_id;
		
		if (wishlistId.length > 0)
			url += "/" + wishlistId;
			
		$.ajax({
	      url: url,
	      type: "DELETE",
	      success: RestInterface.deleteWishlistSuccess,
	      error: RestInterface.deleteWishlistError
	    });
	},
	
	deleteWishlistSuccess: function(data, textStatus, jqXHR) {
		
		deleteSuccessfully();
	},
	
	deleteWishlistError: function(jqXHR, textStatus, errorThrown) {
		alert(jqXHR.responseText);
	}
};