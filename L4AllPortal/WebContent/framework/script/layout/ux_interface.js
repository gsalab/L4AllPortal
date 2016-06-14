/*  WS Questo script contiene tutto quello che riguarda le interfacce di interazione utente:
    -login / registrazione
*/

var accordionType = "";

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// INIZIO gestione LOGIN / REGISTRAZIONE
//////////////////////////////////////////////////////////////////////////////////////////////////////////
createShowOverlay = function() {
	if ($("#showOverlay").length == 0) {
		var rwl = document.createElement('div'); 
        rwl.id= "showOverlay"; 
        rwl.className= "showOverlay"; 
        $('body').append(rwl);
		$('#showOverlay').append('<div class="opaco"></div>');
   		$('#showOverlay .opaco').css('width',$('body').css('width'));
    	$('#showOverlay .opaco').css('height',screen.height + "px");
		$('#showOverlay .opaco').css('background-color','rgba(255,255,255, 0.5)');
	}
} 
showLogin = function(){
   createShowOverlay();
	
	if (typeof templateContext != "undefined") {
		var template = new TemplateTransformation(TemplateType.LOGIN);
		template.addParam('loginURL', Constants.Service.LOGIN_URL);
		template.addParam('registrationURL', Constants.Service.REGISTRATION_URL);
		template.addParam('passwordRecoveryURL', Constants.Service.PASSWORD_RECOVERY_URL);
		$('#showOverlay').append(template.getResult());
		//return 
	}

}
hideLogin = function(){
	$('#showOverlay').remove();
}

showRegistrationForm = function(resetField){
	$('.checkWait').css('display','none');
	
	$('#loginStatus').html('');
	
	$('.loginForm').css('display','none');
	$('.recuperaForm').css('display','none');
	$('.registrationForm').css('display','table');
	$('.alertMustLogin').css('display','none');
	
	if(resetField){
		$(':text, :password').val('');
	}
	
	$('.loginTitle').html('Registrati<div class="loginClose"><a href="javascript:hideLogin()">X</a></div>');
	$('.loginFooter').html('Possiedi un account? <a href="javascript:showLoginForm(true);">Login</a>');
}
showRecuperaForm = function(resetField){
	$('.checkWait').css('display','none');
	
	$('#loginStatus').html('');
	
	$('.loginForm').css('display','none');
	$('.recuperaForm').css('display','table');
	$('.registrationForm').css('display','none');
	$('.alertMustLogin').css('display','none');
	
	if(resetField){
		$(':text').val('');
	}
	$('.loginTitle').html('Recupera password<div class="loginClose"><a href="javascript:hideLogin()">X</a></div>');
	$('.loginFooter').html('Possiedi un account? <a href="javascript:showLoginForm(true);">Login</a>');
}
showLoginForm = function(resetField){
	$('.checkWait').css('display','none');
	
	$('#loginStatus').html('');
	
	$('.loginForm').css('display','table');
	$('.recuperaForm').css('display','none');
	$('.registrationForm').css('display','none');
	$('.alertMustLogin').css('display','none');
	
	if(resetField){
		$(':text, :password').val('');
	}

	$('.loginTitle').html('Login<div class="loginClose"><a href="javascript:hideLogin()">X</a></div>');
	$('.loginFooter').html('Non sei ancora registrato? <a href="javascript:showRegistrationForm(true);">Registrati</a> <br>Password dimenticata? <a href="javascript:showRecuperaForm(true);">Recupera</a>');
}
waitLogin=function(){
	$('.loginForm').css('display','none');
	$('.registrationForm').css('display','none');
	$('.recuperaForm').css('display','none');
	$('.checkWait').css('display','table');
}
loginSuccessfully=function(){
  hideLogin();
  var username=jQuery.parseJSON(RestInterface.user);
  $.log(RestInterface.user.getNome());
  $('#bannerLogin').hide(0);
  $('#welcomMessage').html("benvenuto: "+RestInterface.user.getFullName());
  $('#bannerLogout').show().click(logout);
  $.cookie("login_l4all", RestInterface.user.getEmail(), { expires: 10, path: '/' });
  $.cookie("password_l4all", RestInterface.user.getPassword(), { expires: 10, path: '/' });
  SessionProxy.setManager(RestSessionManager);
  
  $(".ui-state-disabled").unbind();
  $( ".tabs" ).tabs("enable", 1);
  $( ".tabs" ).tabs("enable", 2);
  $( ".tabs" ).tabs("enable", 3);
}
loginFailed=function(message){
	showLoginForm(false);
  	$('#loginStatus').html(message);
}
regFailed=function(message){
	showRegistrationForm(false);
	$('#regStatus').html(message);
}
recuperoFailed=function(message){
	showRecuperaForm(false);
	$('#recuperoStatus').html(message);
}
recuperoSuccessfully=function(message){
	showRecuperaForm(false);
	$('#recuperoStatus').html(message);
}

logout=function(){
	if (RestInterface.user != null) {
		var email = RestInterface.user.getEmail();
		var cok = $.cookie("login_l4all");
		if (cok != null) {
			$.cookie("login_l4all", null, { expires: 10, path: '/' });
		}
		cok = $.cookie("password_l4all");
		if (cok != null) {
			$.cookie("password_l4all", null, { expires: 10, path: '/' });
		}
		$('#bannerLogin').show();
		$('#welcomMessage').html("");
		$('#bannerLogout').hide();
		location.reload();
	}
   $( ".tabs" ).tabs("disabled", 1);
   $( ".tabs" ).tabs("disabled", 2);
   $( ".tabs" ).tabs("disabled", 3);
}

showRegisterReminderWindow = function () {
	
	showLogin();
	
	$('.checkWait').css('display','none');
	
	$('#loginStatus').html('');
	
	$('.loginForm').css('display','none');
	$('.recuperaForm').css('display','none');
	$('.registrationForm').css('display','none');
	$('.alertMustLogin').css('display','block');
	
	$('.loginTitle').html('Attenzione<div class="loginClose"><a href="javascript:hideLogin()">X</a></div>');	
	
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FINE gestione LOGIN / REGISTRAZIONE
//////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// INIZIO gestione TAB GENERICO
//////////////////////////////////////////////////////////////////////////////////////////////////////////
loadingSuccessfully=function(){
	
	if (SessionProxy.dataReady()) {
		updateListaCaricamento();
		updateListaSalvataggio();
	}
}

/* Questa funzione viene chiamata all'ingresso in un determinato accordion */
/* param num: index dell'accordion appena aperto                           */
accordionChanged=function(num) {
	var q_solr_array = q_solr.split(',');
	accordionType = q_solr_array[num];
	
	$.log("accordionType = " + accordionType);
	
	$("img.open-close-accordion").attr("src", "img/open-accordion.png");
	$("#tools-"+accordionType+" img.open-close-accordion").attr("src", "img/close-accordion.png");
	
	updateCarrello();
	//Application.passaAlContesto(num);
	
	//sendUpdateRequest();
}
/* Questa funzione viene chiamata all'ingresso in un determinato tab */
/* param id: id del tab appena aperto                                */
tabChanged=function(id) {
	tabNum = id.substring(5,6);
	$.log("tabNum = " + tabNum);
	switch (tabNum) {
		case "2":
		case "3":
			SessionProxy.loadSessioniSalvate();
			break;
		case "4":
			updateCarrello(); 
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FINE gestione TAB GENERICO
//////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// INIZIO gestione TAB SALVATAGGIO
//////////////////////////////////////////////////////////////////////////////////////////////////////////
updateListaSalvataggio=function(){
	var q_solr_arr = q_solr.split(',');
	for (var q = 0; q < q_solr_arr.length; q++) {
		$("#save_"+q_solr_arr[q]+" .treeview").ready(function() {
			$("#save_"+q_solr_arr[q]+" .treeview").jstree({
				"plugins" : ["themes","json_data","ui","crrm","types"]
				,"json_data": {
					"data": SessionProxy.toJsTreeModel()
				}
				,"types": {
					"max_depth": 1,
					
					"use_data": true,
					"valid_children" : ["cartella-open"], // indica a quali nodi si associoano le regole
					"types" : {
						"cartella-open" : {
							"valid_children" : ["informazioni", "luogo"],
							"icon" : { 
								"image" : "img/icon/folder-open.png" 
							}
						},
						// impostazione icona per documenti
						"informazioni" : {
							"valid_children" : "none",
							"icon" : { 
								"image" : "img/icon/ico-documenti.png" 
							}
						},
						// impostazione icona per luoghi
						"luogo" : {
							"valid_children" : "none",
							"icon" : { 
								"image" : "img/icon/ico-luoghi.png" 
							}
						},
						"experience" : {
							"valid_children" : "none",
							"icon" : { 
								"image" : "img/icon/ico-documenti.png" 
							}
						}
					}
				}
			}).bind("select_node.jstree", function (e, data) {
				var itemType = jQuery.attr(data.rslt.obj[0],"rel");
				var name = jQuery.attr(data.rslt.obj[0],"name");
				
				if (name == null || typeof name == "undefined" || name.length == 0)
					name = jQuery(data.rslt.obj[0]).text().trim();
				
				if (itemType=="cartella-open") {
					jQuery("#save_"+accordionType+" input[name='selected-group']").val(name);
				} else { 
					alert("Selezionare un gruppo per il salvataggio o crearne uno nuovo");
					jQuery("#save_"+accordionType+" input[name='selected-group']").val();
				}
			}).bind("create.jstree", function (e, data) {
				$.log("Nuovo gruppo: "+data.rslt.name);
				
			});
		});
	}
}

// funzione per creare un nuovo gruppo di salvataggi
nuovoGruppo = function() {
	$("#save_"+accordionType+" .treeview").jstree("create", null, "after",{"state":"closed",data:"Nuovo gruppo"});
}
// D.T End
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FINE gestione TAB SALVATAGGIO
//////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// INIZIO gestione TAB CARICAMENTO
//////////////////////////////////////////////////////////////////////////////////////////////////////////
updateListaCaricamento = function() {
	var q_solr_arr = q_solr.split(',');
	for (var q = 0; q < q_solr_arr.length; q++) {
		$("#load_"+q_solr_arr[q]+" .treeview").ready(function() {
			$("#load_"+q_solr_arr[q]+" .treeview").jstree({
				"plugins" : ["themes","json_data","ui","types"]
				,"json_data": {
					"data": SessionProxy.toJsTreeModel()
				}
				,"types": {
					"use_data": true,
					"valid_children" : ["cartella-open"], // indica a quali nodi si associoano le regole
					"types" : {
						"cartella-open" : {
							"valid_children" : ["informazioni", "luogo"],
							"icon" : { 
								"image" : "img/icon/folder-open.png" 
							}
						},
						// impostazione icona per documenti
						"informazioni" : {
							"valid_children" : "none",
							"icon" : { 
								"image" : "img/icon/ico-documenti.png" 
							}
						},
						// impostazione icona per luoghi
						"luogo" : {
							"valid_children" : "none",
							"icon" : { 
								"image" : "img/icon/ico-luoghi.png" 
							}
						},
						"experience" : {
							"valid_children" : "none",
							"icon" : { 
								"image" : "img/icon/ico-documenti.png" 
							}
						}
					}
				}
			}).bind("select_node.jstree", function (e, data) { 
				fillLoadingForm(data);
			});
			//caricaConfBtn();
		});
	}
}

fillLoadingForm=function(data) {
	var id = jQuery.attr(data.rslt.obj[0],"id");
	var type = jQuery.attr(data.rslt.obj[0],"entity");
	var itemType = jQuery.attr(data.rslt.obj[0],"rel");
	
	$.log("type: " + type);
	$.log("itemType: " + itemType);
	
	var selected = null;
	if (type == "query")
		selected = RestInterface.getSimpleQueryById(id);
	else if (type == "wishlist") 
		selected = RestInterface.getWishlistById(id);
		
	$.log("selected node:");
	$.log(selected);
	
	if (selected != null) {
		var title = selected.titolo; 
		var note = selected.note;
		
		$("#load_"+accordionType+" .label").val(title);
		$("#load_"+accordionType+" .note").val(note);
		if (type == "query") {
			var num = selected.numOggetti;
			var sessioneSerializzata = title + "$$" + "DATA" + "$$" + num + "$$" + note + "$$" + selected.querySolr;
			$("#load_"+accordionType+" .query-solr").val(sessioneSerializzata);
			$("#load_"+accordionType+" .query-id").val(id);
			$("#load_"+accordionType+" .num-elem").val(num);
		} else if (type=="wishlist") {
			var exp_ids = selected.expId;
			$("#load_"+accordionType+" .wishlist-id").val(id);
			$("#load_"+accordionType+" .type").val(itemType);
			$("#load_"+accordionType+" .exp_ids").val(exp_ids);
		}
		
		//ML init aggiunto per la gestione dei bottoni in base al tipo di scelta
		caricaConfBtn(type);
		//ML end 

	}
}

caricaQuery=function() {
	var stringaSessione = $("#load_"+accordionType+" .query-solr").val();
	
	$.log(stringaSessione);
	if (stringaSessione.length > 0) {
		ripristinaSessione(stringaSessione);
		sendUpdateRequest(); //forza update dell'interfaccia: DOPO AVER RIPRISTINATO TUTTI I VALORI INVIA LA QUERY A SOLR, per evitare di mandare n chiamate parziali
	} else {
		alert("Selezionare cosa caricare");
	}
}

deleteQuery=function() {
	var sessionId = $("#load_"+accordionType+" .query-id").val();
	
	$.log(sessionId);
	if (sessionId.length > 0) {
		SessionProxy.deleteSessione(sessionId);
	} else {
		alert("Selezionare l'elemento da cancellare");
	}
}

deleteSuccessfully=function() {
	RestInterface.reload = true;
	SessionProxy.loadSessioniSalvate();
}

caricaWishlist=function() {
	var ww = $("#load_"+accordionType+" .type").val();
	var values = $("#load_"+accordionType+" .exp_ids").val();
	
	if (values.length > 0)
		values = values.split(',');
	
	if (ww.length > 0) {
		for(ww in wishList) { wishList[ww]=values};
		$( ".tabs" ).tabs("select", "#tabs-4_"+accordionType);
		updateCarrello();
	} else {
		alert("Selezionare cosa caricare");
	}
}

deleteWishlist=function() {
	var wishId = $("#load_"+accordionType+" .wishlist-id").val();
	
	$.log(wishId);
	if (wishId.length > 0) {
		SessionProxy.deleteWishlist(wishId);
	} else {
		alert("Selezionare l'elemento da cancellare");
	}
}

caricaConfBtn=function(type) {
	switch (type) {
		case "query":
			$('.btn-applica, .btn-delete, .btn-link').removeClass("btn-disabled");
			$('.btn-applica, .btn-delete, .btn-link').removeAttr("disabled");
			$('.btn-sostiuisci, .btn-unisci,.btn-sottrai, .btn-pdf').addClass("btn-disabled");
			$('.btn-sostiuisci, .btn-unisci, .btn-sottrai, .btn-pdf').attr("disabled", "disabled");
			$("#load_"+accordionType+" .btn-applica").unbind();
			$("#load_"+accordionType+" .btn-applica").click(caricaQuery);
			$("#load_"+accordionType+" .btn-delete").unbind();
			$("#load_"+accordionType+" .btn-delete").click(deleteQuery);
			break
		
		case "wishlist":
			$('.btn-applica, .btn-pdf').addClass("btn-disabled");
			$('.btn-applica, .btn-pdf').attr("disabled", "disabled");
			$('.btn-sostiuisci, .btn-unisci, .btn-sottrai, .btn-link, .btn-delete').removeClass("btn-disabled");
			$('.btn-sostiuisci, .btn-unisci, .btn-sottrai, .btn-link, .btn-delete').removeAttr("disabled");
			$("#load_"+accordionType+" .btn-applica").unbind();
			$("#load_"+accordionType+" .btn-applica").click(caricaWishlist);
			$("#load_"+accordionType+" .btn-delete").unbind();
			$("#load_"+accordionType+" .btn-delete").click(deleteWishlist);
			break
			
		default:
			$('.btn-applica, .btn-sostiuisci, .btn-unisci, .btn-sottrai, .btn-link, .btn-pdf').addClass("btn-disabled");
			$('.btn-applica, .btn-sostiuisci, .btn-unisci, .btn-sottrai, .btn-link, .btn-pdf').attr("disabled", "disabled");
			break
	}
}

restoreWishlist = function() {
	SessionProxy.restoreWishlist();
}

fondiWishlist = function() {
	SessionProxy.fondiWishlist();
}

sottraiWishlist = function() {
	SessionProxy.sottraiWishlist();
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FINE gestione TAB CARICAMENTO
//////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// INIZIO gestione TAB CARRELLO
//////////////////////////////////////////////////////////////////////////////////////////////////////////
updateCarrello = function() {
	$("#save_"+accordionType+" input[name='num-carrello']").val(wishList[accordionType].length);
	
	$("#carrello_"+accordionType+" .treeview").ready(function() {
		$("#carrello_"+accordionType+" .treeview").jstree({
			"plugins" : ["themes","json_data","ui","checkbox","types"]
			,"json_data": {
				"data": SessionProxy.toJsTreeModelWishlist(wishList[accordionType], accordionType)
			}
			,"types": {
				"max_depth": 1,
				"use_data": true,
				"valid_children" : [accordionType],
				"types" : {
					// impostazione icona per documenti
					"informazioni" : {
						"valid_children" : "none",
						"icon" : { 
							"image" : "img/icon/ico-documenti.png" 
						}
					},
					// impostazione icona per luogo
					"luogo" : {
						"valid_children" : "none",
						"icon" : { 
							"image" : "img/icon/ico-luoghi.png" 
						}
					},
					"experience" : {
						"valid_children" : "none",
						"icon" : { 
							"image" : "img/icon/ico-documenti.png" 
						}
					}
				}
			}
		}).bind("select_node.jstree", function (e, data) { 
			//fillLoadingForm(data);
		});
	});
}

aggiornaCarrello = function () {
	if (!confirm("Eliminare gli elementi non selezionati e mantenere solo quelli selezionati?"))
		return;
	
	var checked_ids = getSelezioneCarrello();
    
    wishList[accordionType] = checked_ids;
    updateCarrello();
    /*
    var unchecked_ids = []; 
    $("#carrello_"+accordionType+" .treeview").jstree("get_unchecked",null,true).each (
    function () { 
        unchecked_ids.push(this.id); 
    });*/
}

unisciAllaSelezione = function () {
	if (!confirm("Aggiungere gli elementi selezionati alla ricerca?"))
		return;
		
	var checked_ids = getLabelSelezioneCarrello();
	
	var facet = Application.getContestoByItemType(accordionType).getFacetById("facet_IndiceAnalitico_"+accordionType);
	
	if (facet == null)
		return;
		
	for (var i = 0; i < checked_ids.length; i++) {
		if (facet._selectedValues.indexOf(checked_ids[i]) < 0)
			facet._selectedValues.push(checked_ids[i]);
			
		var index;
		if ((index = facet._excludedValues.indexOf(checked_ids[i])) >= 0)
			facet._excludedValues.splice(index, 1);
	}
	
	sendUpdateRequest();
}

sostituisciAllaSelezione = function () {
	if (!confirm("Sostituire gli elementi selezionati all'attuale ricerca?"))
		return;
		
	var checked_ids = getLabelSelezioneCarrello();
	
	var facet = Application.getContestoByItemType(accordionType).getFacetById("facet_IndiceAnalitico_"+accordionType);
	
	if (facet == null)
		return;
	
	facet._selectedValues = checked_ids;
	for (var i = 0; i < checked_ids.length; i++) {
		var index;
		if ((index = facet._excludedValues.indexOf(checked_ids[i])) >= 0)
			facet._excludedValues.splice(index, 1);
	}
	/*	
	for (var i = 0; i < checked_ids.length; i++) {
		var index;
		if ((index = facet._selectedValues.indexOf(checked_ids[i])) > 0)
			facet._selectedValues.splice(index, 1);
	}*/
	
	sendUpdateRequest();
}

getSelezioneCarrello=function() {
	var checked_ids = []; 
    $("#carrello_"+accordionType+" .treeview").jstree("get_checked",null,true).each (
    function () { 
        checked_ids.push(this.id); 
    });
    
    return checked_ids;
}

getLabelSelezioneCarrello=function() {
	var checked_ids = []; 
    $("#carrello_"+accordionType+" .treeview").jstree("get_checked",null,true).each (
    function () { 
        checked_ids.push(this.innerText.trim()); 
    });
    
    return checked_ids;
}

saveCarrello = function() {
	$("#tabs-"+ accordionType).tabs("select", "#tabs-2_"+ accordionType);
	$("#tabs-2_"+accordionType+" #cosa_wishlist_"+accordionType).attr("checked","checked");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FINE gestione TAB SALVATAGGIO
//////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// INIZIO gestione STAMPA STATO WIDGET
//////////////////////////////////////////////////////////////////////////////////////////////////////////
showWidgetState = function(){
   createShowOverlay();
	
	
	if (typeof templateContext != "undefined") {
		var template = new TemplateTransformation(TemplateType.WDGPDF);
/*		template.addParam('loginURL', Constants.Service.LOGIN_URL);
		template.addParam('registrationURL', Constants.Service.REGISTRATION_URL);
		template.addParam('passwordRecoveryURL', Constants.Service.PASSWORD_RECOVERY_URL);*/
		$('#showOverlay').append(template.getResult());
		//return 
	}

	var selectedWDG=new Array();
	$('#refraso .body').children().each(function(index) {
		
		var className = $(this).attr('class');
		//alert(className)
		var idwdg= className.split(/\s+/g);
		
		//alert(className[1])
		if(idwdg[1]){
			selectedWDG.push(idwdg[1]);
		};
	});
	$('#facet_top').clone().appendTo('#showOverlay .widgetPdfContent');
	
	$('#showOverlay #facet_top .facet-body').css("display", "block");
	//$('#banner #facet_top .facet-header').css("display", "none");

	$('#showOverlay #facet_top #facet_right, #showOverlay #facet_top #facet_left #facet_center').children().css("display", "none");
	for(i=0; i<selectedWDG.length; i++){
		
		$('#showOverlay #facet_top #'+selectedWDG[i]).css("display", "block");
	}

	$('#printWidgetPDF').click(printWidgetPDF);
}

printWidgetPDF=function(){
	var url = restServer + "/l4all-servlet/pdf";
		
	html = '<?xml version="1.0" encoding="UTF-8"?>'
	+'<html><head>	<link rel="stylesheet" type="text/css" href="'+appUrl+'/style/layout.css"/>'
	+'<link rel="stylesheet" type="text/css" href="'+appUrl+'/style/l4all.css"/>'
	+'<link rel="stylesheet" type="text/css" href="'+appUrl+'/theme/css/ux_interface.css"/>'
	+'<link rel="stylesheet" type="text/css" href="'+appUrl+'/framework/css/facet.css"/>'
	//+'<link rel="stylesheet" type="text/css" href="'+appUrl+'/l4all/style/l4all.css"/>'
	+'</head><body>'+fixXHTML($('#showOverlay .widgetPdfContent ').html())+'</body></html>';
	
	$("#widgetPdfForm textarea").val(html);
	$("#widgetPdfForm").submit();
	
	/*$.ajax({
      url: url,
      type: "POST",
      data: {"html": html },
      success: printWidgetPDFSuccess,
      error: printWidgetPDFError
    });*/
}

printWidgetPDFSuccess = function(data, textStatus, jqXHR) {
	
}

printWidgetPDFError = function(data, textStatus, jqXHR) {
	
}

fixXHTML = function(html) {
	return fixXHTML_img(fixXHTML_hr(html));
}

fixXHTML_img=function(html) {
	var xhtml = "";
	var IMG_OPEN_TAG = "<img";
	var IMG_CLOSE_TAG = "</img>";
	var IMG_SRC_ATTR = 'src="';
	
	while(html.length > 0) {
		if (html.indexOf(IMG_OPEN_TAG) < 0) {
			xhtml += html;
		 
			html = "";
		} else {
			var pos = html.indexOf(IMG_OPEN_TAG);
			var pos_close = html.indexOf(">", pos);
			
			xhtml += (html.substring(0, pos_close+1) + IMG_CLOSE_TAG).replace(IMG_SRC_ATTR, IMG_SRC_ATTR + appUrl + '/');
			html = html.substring(pos_close+1);
		}
	}
	
	return xhtml;
}

fixXHTML_hr=function(html) {
	var xhtml = "";
	var HR_OPEN_TAG = "<hr>";
	var HR_CLOSE_TAG = "</hr>";
	
	while(html.length > 0) {
		if (html.indexOf(HR_OPEN_TAG) < 0) {
			xhtml += html;
		 
			html = "";
		} else {
			var pos = html.indexOf(HR_OPEN_TAG);
			var pos_close = pos + HR_OPEN_TAG.length - 1;
			
			xhtml += html.substring(0, pos_close+1) + HR_CLOSE_TAG;
			html = html.substring(pos_close+1);
		}
	}
	
	return xhtml;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FINE gestione STAMPA STATO WIDGET
//////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////
// GESTIONE GENERAZIONE LINK PUBBLICO //
////////////////////////////////////////
generaLinkPubblico=function() {
	var s = buildSessione("Link condiviso", "");
	var string = generaSessioneSerializzata(s);
	$.log("parametro condivisione link:");
	$.log(string);
	
	createShowOverlay();
	
	if (typeof templateContext != "undefined") {
		var template = new TemplateTransformation(TemplateType.LINK_PUBBLICO);
		template.addParam('LINK', appUrl + "?s=" + encodeURIComponent(string));
		$('#showOverlay').append(template.getResult());
		
		/*$("#link-pubblico-url").focus(function(){
		    // Select input field contents
		    this.select();
		});*/
	}
}

/////////////////////////////////////////////
// SOSTITUZIONE DEGLI ELEMENTI DELL'INDICE //
/////////////////////////////////////////////
aggiornaSelezione = function(mode) {
	var facet = getIndexFacet();
	var snapshot = facet.getSnapshot(-1);
	
	if (snapshot != null) {
		var itemType = Application.getContestoAttuale().getItemType();
		var ids = $("#load_"+itemType+" .exp_ids").val();
		
		switch (mode) {
			case "SOSTITUISCI": sostituisciSelezione(snapshot, ids); break;
			case "UNISCI": unisciSelezione(snapshot, ids); break;
			case "SOTTRAI": sottraiSelezione(snapshot, ids); break;
		}
		
		$.log("snapshot: ");
		$.log(snapshot);
		
		facet.restoreSnapshot(snapshot);
		sendUpdateRequest();
	}
}

sostituisciSelezione = function(snapshot, ids) {
	var selectedValues = [];
		
	if (isNaN(ids)) {
		var ids_arr = ids.split(",");
		
		for (a = 0; a < ids_arr.length; a++) {
			selectedValues.push(getMosaicLabel(ids_arr[a]));
		}
	} else  
		selectedValues.push(getMosaicLabel(ids));
	
	snapshot.selectedValues = selectedValues.join('%%');
	snapshot.excluedValues = null;
}

unisciSelezione = function(snapshot, ids) {
	var selectedValues = snapshot.selectedValues.split('%%');
	
	if (isNaN(ids)) {
		var ids_arr = ids.split(",");
		
		for (a = 0; a < ids_arr.length; a++) {
			var title = getMosaicLabel(ids_arr[a]);
			if (selectedValues.indexOf(title) < 0)
				selectedValues.push(title);
		}
	} else {
		var title = getMosaicLabel(ids);
		if (selectedValues.indexOf(title) < 0)
			selectedValues.push(title);
	}
	
	snapshot.selectedValues = selectedValues.join("%%");
	snapshot.excluedValues = null;
}

sottraiSelezione = function(snapshot, ids) {
	
	var newSelArray = [];
	
	if (isNaN(ids)) {
		var ids_arr = ids.split(",");
		
		for (a = 0; a < ids_arr.length; a++) {
			var title = getMosaicLabel(ids_arr[a]);
			if (snapshot.selectedValues.indexOf(title) < 0)
				newSelArray.push(title);
		}
	} else {
		var title = getMosaicLabel(ids);
		if (snapshot.selectedValues.indexOf(title) < 0)
			newSelArray.push(title);
	}
	
	if (newSelArray.length == 0)
		snapshot.selectedValues = null;
	else 
		snapshot.selectedValues = newSelArray.join("%%");
	snapshot.excluedValues = null;
}

getIndexFacet=function() {
	var facets = Application.getContestoAttuale().getFacets();
	
	for (f = 0; f < facets.length; f++) {
		if (facets[f]._settings.index) {
			return facets[f];
		}
	}
	
	alert ("Non e' presente nessun widget di tipo Indice.");
	return null;
}

getMosaicLabel = function(id) {
	if ($(".viewContainer [idobj='"+id+"']").length > 0) {
		return $(".viewContainer [idobj='"+id+"']").attr("title");
	}
}

aggiungiSelezioneAttualeAWishlist = function() {
	var idsOn=[];
    var tipo;
    
    tipo = accordionType;
    
    var wishnow = wishList[tipo];
    if(wishnow.length>0){
        /*Chiede se mantenere gli elementi correnti della lista o se fare il merge*/
        var x=window.confirm("Mantenere l'attuale contenuto della wishlist?");
        if(!x){
            wishnow=new Array();
            wishList[tipo]= new Array();
        }
   } 
       
    for ( i in last_query_values) if(last_query_values[i].id != null && last_query_values[i].id != ""){ 
        var add=true;
        for(var c=0; c<wishnow.length; c++){
            if(last_query_values[i].id == wishnow[c]) {add=false; break;}
        }
        if(add) wishList[tipo].push(last_query_values[i].id);
    }
     wishList[tipo] = wishList[tipo].sort();
     
     updateCarrello();
}

svuotaWishlist = function() {
	for(ww in wishList) wishList[ww]=new Array();
	updateCarrello();
}

extractWishListToPdf = function(){
    var titolo = "Elementi estratti dal carrello";
    titolo = prompt("Download del PDF degli elementi del carrello\n\nTitolo del documento:",titolo);
    if (titolo == null || titolo.length == 0) return;
    
    var idsOn=[];
    tipo = accordionType;
    for ( i in wishList[tipo]) if(wishList[tipo][i].id != null && wishList[tipo][i].id != "") idsOn.push(wishList[tipo][i].id);
    var refraso = $('#refraso .body').html();
    refraso = refraso.replace(/<[^>]*>/g,"");
    for(ww in wishList[tipo]){
        var url = PDFservlet+'?titolo='+titolo+'&refraso='+ refraso +'&idEsperienze=' + idsOn;
        //alert('la formattazione dei PDF non è ancora completata');
        window.open(url,'Downlaod PDF');
   }
    
}

for(ww in wishList) wishList[ww]=new Array();
if (!String.prototype.trim) {
  String.prototype.trim=function() {
	return this.replace(/^\s+|\s+$/, '');
  }
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

TaxonomySwitcher={
	_taxonomy: "",
	
	_init: function() {
		var html = "";
		if (typeof templateContext != "undefined") {
	    	var template = new TemplateTransformation(TemplateType.SWITCHER);
	    	
	    	html = template.getResult();
	    }
	    if (html.length > 0) {
	    	$("#taxonomy-switcher").html(html);
	    }
	    
	    TaxonomySwitcher._taxonomy = q_solr.split(',')[0];
	    
	    // bunding del click sullo switcher
	    $("#taxonomy-selector").click(TaxonomySwitcher.switchTaxonomy);
	    $(".synch-canvas").click(TaxonomySwitcher.switchTaxonomy);
	},
	
	switchTaxonomy: function() {
		if (TaxonomySwitcher._taxonomy == "informazioni") {
			$("#taxonomy-selector").attr("src", "theme-comfit/images/switcher-luoghi.png")
			$("#taxonomy-switcher [itemType='informazioni']").removeClass("selected");
			$("#taxonomy-switcher [itemType='luogo']").addClass("selected");
			TaxonomySwitcher._taxonomy = "luogo";
			$("#synch-canvas-informazioni").attr("src", "img/unsynch-canvas.png");
			$("#synch-canvas-luogo").attr("src", "img/synch-canvas.png");
			
			Application.passaAlContesto(1);
		} else {
			$("#taxonomy-selector").attr("src", "theme-comfit/images/switcher-doc.png")
			$("#taxonomy-switcher [itemType='luogo']").removeClass("selected");
			$("#taxonomy-switcher [itemType='informazioni']").addClass("selected");
			TaxonomySwitcher._taxonomy = "informazioni";
			$("#synch-canvas-informazioni").attr("src", "img/synch-canvas.png");
			$("#synch-canvas-luogo").attr("src", "img/unsynch-canvas.png");
			
			Application.passaAlContesto(0);
		}
		
		sendUpdateRequest();
	}
};

linkToType = function(itemType) {
	if (linkToItemType == itemType) {
		$("#link-"+linkToItemType).attr("src", "img/open-chain.png");
		linkToItemType = "";
		
		return;
	}
	
	if (linkToItemType.length > 0) {
		// rimuove la vecchia selezione
		$("#link-"+linkToItemType).attr("src", "img/open-chain.png");
	}
	
	linkToItemType = itemType;
	$("#link-"+linkToItemType).attr("src", "img/closed-chain.png");
	
	sendUpdateRequest();
}