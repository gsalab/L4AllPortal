FacetUtilities = new Object();

/*
*funzione comune a tutti i facet per costruire il frame (header e body)
*body: vuoto, verrà completato dalla funzione specifica per ogni facet
*header: facetLabel + clarAll selection + apri/chiudi (gli altri aggiunti in caso di bisogno)
*/
FacetUtilities.constructFacetFrame = function(id_div, facetLabel,collapsible, headerSep, facetDescription, facetDescriptionWhy) { //headerSep=true mette separatore <hr> sotto il titolo
    var selet = '#'+ id_div;
    $(selet).addClass('facet');
    
    var hr="<hr>";
    if(!headerSep){hr="";};
    
    var html = "<div class='facet-header'>" 
            
            + ((collapsible) ?
                "<img src='framework/script/images/less.png' class='facet-header-collapse' id='collapseImg' title='Chiudi' />" :
                "") 
// PATCH D.T.: rimosso id='clear' class='clear' per la corratta visualizzazione dell'icona
            + "<img src='framework/script/images/clear_filters.png'  title='Reset' id='resetwdg' class='resetwdg'/>"   // WS per spostare posizione widget 1611: inserito ID
            + "</div>" 
            //+ "<div class='facet-header-title' oncontextmenu=\"javascript:alert('success!');return false;\">" + facetLabel 
			+ "<div oncontextmenu=\"ReplaceContentInContainer('"+ facetLabel.replace(/'/g, "&#39;") +"', '"+ facetDescriptionWhy +"');return false;\" onMouseOut=\"ReplaceContentInContainer('"+ facetLabel.replace(/'/g, "&#39;") +"', '"+ facetDescription +"');\" class='facet-header-title'>" + facetLabel 			
			+ "<div id='"+ facetLabel.replace(/'/g, "&#39;") +"' class='facet-header-mouseover'>"+ facetDescription +"</div>" + "</div>"
            + hr
            + "<div id='facet_body' class='facet-body'></div>"
            + "<div class='end'></div>" ;
    
    $(selet).append(html);    

    if (collapsible) {
        var tmp = selet + " .facet-header-collapse";
        $(tmp).click(function() {
            FacetUtilities.toggleCollapse(selet);
        });
    }
    
    var htmlRef = '<span class="facet_refraso" facet="'+facetLabel+'">'+facetLabel+' (<span class="values"></span>)</span>';
    $('.refraso').append(htmlRef);
};


FacetUtilities.toggleCollapse = function(id) {
    var seletBody = id + " .facet-body";
    var seletImg = id + " img.facet-header-collapse";
    if ($(seletBody).css('display') != "none") {
        $(seletBody).css('display','none');
        $(seletImg).attr('src', 'framework/script/images/more.png');
        $(seletImg).attr('title','Apri');
    } else {
        $(seletBody).css('display','block');
        $(seletImg).attr('src', 'framework/script/images/less.png');
        $(seletImg).attr('title','Chiudi');
    }
};