/*  WS Questo script contiene tutto quello che riguarda le interfacce di interazione utente:
    -login / registrazione
*/


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Funzione che regola la maschera di LOGIN / REGISTRAZIONE
//////////////////////////////////////////////////////////////////////////////////////////////////////////
showLogin = function(){
           var rwl = document.createElement('div'); 
            rwl.id= "showLogin"; 
            rwl.className= "showLogin"; 
            $('body').append(rwl);
			$('#showLogin').append('<div class="opaco"></div>');
       		$('#showLogin .opaco').css('width',$('body').css('width'));
        	$('#showLogin .opaco').css('height',screen.height + "px");
			$('#showLogin .opaco').css('background-color','rgba(255,255,255, 0.5)');
/*			$('#showLogin').css('width',$('body').css('width'));
			$('#showLogin').css('height',screen.height + "px");
			$('#showLogin').css('background-color','rgba(255,255,255, 0.5)');*/
			var html='<div class="formContainer">'+
					 	'<div class="loginTitle">Login<div class="loginClose"><a id="closeLogin" href="javascript:hideLogin();">X</a></div></div>'+
						  '<div class="loginContent">'+
							'<div class="loginForm">'+
							  '<form action="'+Constants.Service.LOGIN_URL+'" method="GET">'+
								'<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
								   '<tr>'+
									'<td colspan="2" class="loginError"><div id="loginStatus"  class="error"></div></td>'+
								  '</tr>'+							  
								  '<tr>'+
									'<td><label class="label" for="login-email">Email:</label></td>'+
									'<td><input name="email" id="login-email" type="text" /></td>'+
								  '</tr>'+
								  '<tr>'+
									'<td>Password:</td>'+
									'<td><input name="password" id="login-password" type="password" /></td>'+
								  '</tr>'+
								  '<tr>'+
									'<td>&nbsp;</td>'+
									'<td align="right"><input type="button" class="loginButton"value="accedi" onclick="javascript:RestInterface.doLogin(); waitLogin();" />'+
									 '</td>'+
								 ' </tr>'+
								'</table>'+
							  '</form>'+
							'</div>'+
							'<div class="registrationForm">'+
							  '<form action="'+Constants.Service.REGISTRATION_URL+'" method="POST">'+
								'<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
								   '<tr>'+
									'<td colspan="2" class="loginError"><div id="regStatus" class="error"></div></td>'+
								  '</tr>'+	
								  '<tr>'+
									'<td>Nome:</td>'+
									'<td><input name="nome" id="registrazione-nome"  type="text"></td>'+
								  '</tr>'+
								  '<tr>'+
									'<td >Cognome:</td>'+
									'<td><input name="cognome" id="registrazione-cognome"  type="text"></td>'+
								  '</tr>'+
								 ' <tr>'+
									'<td>Email:</td>'+
									'<td><input name="email" id="registrazione-email"  type="text"></td>'+
								  '</tr>'+
								  '<tr>'+
									'<td>Password:</td>'+
									'<td><input name="password" id="registrazione-password"  type="password"></td>'+
								  '</tr>'+
								  '<tr>'+
									'<td>Conferma password:</td>'+
									'<td><input name="conferma-password" id="registrazione-conferma-password"  type="password"></td>'+
								  '</tr>'+
								  '<tr>'+
									'<td>&nbsp;</td>'+
									'<td align="right"><input type="button" class="loginButton"value="registrati" onclick="javascript:RestInterface.doRegistration(); waitLogin();" /></td>'+
								 ' </tr>'+
								'</table>'+
							 ' </form>'+
							'</div>'+
							'<div class="recuperaForm">'+
							  '<form action="'+ Constants.Service.PASSWORD_RECOVERY_URL +'" method="POST">'+
								'<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
								   '<tr>'+
									'<td colspan="2" class="loginError"><div id="recuperoStatus" class="error"></div></td>'+
								  '</tr>'+	
								  '<tr>'+
									'<td>Email</td>'+
									'<td><input name="nome" id="password-recovery-email"  type="text"></td>'+
								  '</tr>'+
								  '<tr>'+
									'<td>&nbsp;</td>'+
									'<td align="right"><input type="button" class="loginButton" value="recupera" onclick="javascript:RestInterface.doRicordaPassword(); waitLogin();" /></td>'+
								 ' </tr>'+
								'</table>'+
							 ' </form>'+
							'</div>'+
							'<div class="checkWait">loading...</div>'+
						  '</div>'+
						 ' <div class="loginFooter">Non sei ancora registrato? <a href="javascript:showRegistrationForm(true);">Registrati</a> <br>Password dimenticata? <a href="javascript:showRecuperaForm(true);">Recupera</a></div>'+
						'</div>';
						
			$('#showLogin').append(html);

}
hideLogin = function(){
	$('#showLogin').remove();
}

showRegistrationForm = function(resetField){
	$('.checkWait').css('display','none');
	
	$('#loginStatus').html('');
	
	$('.loginForm').css('display','none');
	$('.recuperaForm').css('display','none');
	$('.registrationForm').css('display','table');
	
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
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FINE Funzione che regola la maschera di LOGIN / REGISTRAZIONE
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// WS //

