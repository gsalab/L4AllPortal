//////////////////////////////////////////////////////////
// Questo file estende alcune funzioni del file lens.js //
//////////////////////////////////////////////////////////

function buildNodeExt(datiCustom, idField) {
	var str = '';
    str = "<ul>";
     
    for(var b=0; b<datiCustom.length; b++){
       if (datiCustom[b].cat.indexOf("luogo") >= 0) {
	       str= str + "<li class='luogo'>";
	       str= str + "<div class='nome-luogo' title='"+datiCustom[b].label+"'>"+datiCustom[b].label+"&nbsp;-&nbsp;</div>";
	       
	       str = str + getIconaCarrello(datiCustom[b], "luogo");
           
	       str= str + "<div class='stars'></div>";
	       str = str + "<div style='clear:both'></div>";
	       str = str + "<div class='abstract' style='display:none'>"+datiCustom[b].Testo_breve_ITA+"</div>";
	       
	       str= str + "</li>";
       } if (datiCustom[b].cat.indexOf("informazione") >= 0) {
	       str= str + "<li class='informazione'>";
	       str= str + "<div class='nome-informazione' title='"+datiCustom[b].label+"'>"+datiCustom[b].label+"&nbsp;-&nbsp;</div>";
	       
	       str = str + getIconaCarrello(datiCustom[b], "informazione");
	       
	       str= str + "<div class='link'>";
           str= str + "&nbsp;-&nbsp;<a class='apriLink' href='"+datiCustom[b].Link+"'  title='Apri link' target='_blank'><img src='framework/script/images/play_little.png' /></a>";
           str= str + "</div>";
           
	       str= str + "<div class='stars'></div>";
	       str = str + "<div style='clear:both'></div>";
	       str = str + "<div class='abstract' style='display:none'>"+datiCustom[b].Testo_breve_ITA+"</div>";
	       
	       str= str + "</li>";
       }
       
    }    
              
    str = str + "</ul>";
    return str;   
}

function getIconaCarrello(data, itemTyme) {
	var isWish = false; //verifica che sia un elemento della wishlist attuale
   for(var wl=0; wl<wishList[itemTyme].length; wl++){
   if(wishList[itemTyme][wl]==data.id) {isWish = true; break;}
   }
   if(isWish) return '<img class="wishListBott remove" type="'+itemTyme+'" val="'+data.id+'" title="Rimuovi dal carrello" src="framework/script/images/transparent.gif"/>'
   else return '<img class="wishListBott add" type="'+itemTyme+'" val="'+data.id+'" title="Aggiungi al carrello" src="framework/script/images/transparent.gif"/>';
   
}

function bindTitoloOggettoEsterno() {
	$(".nome-luogo").click(function (){
		$(this).siblings(".abstract").toggle(200);
	});
}