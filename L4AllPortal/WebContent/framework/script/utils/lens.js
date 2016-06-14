/*Questo script contiene tutto quello che riguarda le lens di dettaglio:
    -costruzione automatica di lens per oggetti singoli (denormalizzati) seguendo un template
    -gestione della WISHLIST
    
    ATTENZIONE: la costruzione delle relazioni 1 a MOLTI (es i link per L4ALL) non è ancora stata parametrizzata, ma chiama una funzione hardcoded: buildNodeExt
    ToDo: trovare il modo di parametrizzare anche questa componente
*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//    Funzione che legge un NODO dell'HTML inteso come nodo del template della lens e legge tutti i parametri "content" o "xxx-content"
//    per recuperare quali field del JSON devono essere recuperati per costruire la lens.    
//    CHIAMATA SOLO IN FASE DI APERTUA DEL PORTALE
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function computeLensTemplate(node){
    var obj = $(node).attr('itemtype');
    wishList[obj] = []; //INIZIALIZZA LA WISHLIST PER IL TIPO DI OGGETTO (QUESTO PERMETTE POTENZIALMENTE DI GESTIRE LE WISHLIST DI + TIPI DI OGGETTI CONTEMPORANEAMENTE)
    var properties = [];
    var sorted_properties=[];
    
    /*valori delle proprietà per i CONTENT*/
    var sel = '#' + $(node).attr('id') + " [content]";
    var children = $(sel).get();
    for(var c=0; c<children.length; c++){properties.push($(children[c]).attr('content'));}
    
    /*valori delle proprietà per i SRC-CONTENT*/
    var sel = '#' + $(node).attr('id') + " [src-content]";
    var children = $(sel).get();
    for(var c=0; c<children.length; c++){properties.push($(children[c]).attr('src-content'));}
    
    /*valori delle proprietà per i VAL-CONTENT*/
    var sel = '#' + $(node).attr('id') + " [val-content]";
    var children = $(sel).get();
    for(var c=0; c<children.length; c++){properties.push($(children[c]).attr('val-content'));}
    
    /*valori delle proprietà per i VAL-CONTENT*/
    var sel = '#' + $(node).attr('id') + " [href-content]";
    var children = $(sel).get();
    for(var c=0; c<children.length; c++){properties.push($(children[c]).attr('href-content'));}
    
    /*valori delle proprietà per i YOUTUBE-CONTENT*/
    var sel = '#' + $(node).attr('id') + " [youtube-content]";
    var children = $(sel).get();
    for(var c=0; c<children.length; c++){properties.push($(children[c]).attr('youtube-content'));}
    
    /*valori delle proprietà per i YOUTUBE-CONTENT*/
    var sel = '#' + $(node).attr('id') + " [fancybox-content]";
    var children = $(sel).get();
    for(var c=0; c<children.length; c++){properties.push($(children[c]).attr('fancybox-content'));}
    
    /*valori delle proprietà per i YOUTUBE-CONTENT*/
    var sel = '#' + $(node).attr('id') + " [idField]";
    var children = $(sel).get();
    for(var c=0; c<children.length; c++){properties.push($(children[c]).attr('idField'));}
    
    properties.sort(); //VERIFICA CHE NN CI SIANO DOPPIONI NELLA LISTA DI FIELD DA RICHIEDERE
    if(properties.length>0){
        sorted_properties.push(properties[0]);
        for(var s = 1; s < properties.length; s++){
            if(properties[s]!=properties[s-1]) sorted_properties.push(properties[s]);
        }
    }
    
    lens[eval('obj')]= { "prop": sorted_properties , "node": node}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//    FUNZIONE per l'invio della richiesta AJAX a SOLR, per reuperare i dati di uno specifico elemento (id) di tipo (itemtype) + CALLBACK
//
//    CHIAMATA A OGNI COSTRUZIONE
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendLensRequest(id,itemtype){
    $('.built .closeLens').trigger('click'); //chiude eventuali lens aperte
    var fl = lens[eval('itemtype')].prop.join(',');
    var strData = "wt=json&q="+itemtype+"&fq=id:"+id+"&fl=id,"+fl;
    /* DT Begin */
    $.log("[sendLensRequest()] strData = " + strData);
    /* DT End */
    
    $.ajax({
      url: solrServer, //var di mainAPi
      data: strData,
      dataType: 'jsonp',
      success: buildLens, //callback
      jsonp: 'json.wrf'
    });
}


/*CALLBACK*/
function buildLens(data){ //data è il JSON restituito da SOLR
    var itemtype = data.responseHeader.params.q;
    var id = data.response.docs[0].id;
    var node = lens[eval('itemtype')].node;
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //FUNZIONE PER LA COSTRUZIONE DELLA LENS SECONDO IL TEMPLATE (serie di chiamate ricorsive a se stesso): RIGENERAZIONE DEL HTML SEGUENDO PASSOPASSO IL TEMPLATE
    
    //la condizione "if-exist" costruisce il nodo solo se la risposta di SOLR contiene un valore per quel filed
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function buildNode(n){
    var str = '';
        
    if($(n).attr('if-exist')==null || (eval('data.response.docs[0].'+$(n).attr('if-exist'))!=null && eval('data.response.docs[0].'+$(n).attr('if-exist'))!="") ){ //se c'è il valore
        str = '<' + $(n).get(0).tagName; //recupera il tagname per ricrearlo artificialmente
        
        if($(n).attr('role')!='lens'){ //se è un nodo del template (non la radice del template della lens), RIPORTA NEL NODO GLI ATTRIBUTI ESISTENTI
                if( $(n).attr('id')!=null){ str = str + " id='"+$(n).attr('id')+"'"}
                if( $(n).attr('class')!=null){ str = str + " class='"+$(n).attr('class')+"'";}
                if( $(n).attr('src')!=null){ str = str + " src='"+$(n).attr('src')+"'";}
                if( $(n).attr('href')!=null){ str = str + " href='"+$(n).attr('href')+"'";}
                if( $(n).attr('title')!=null){ str = str + " title='"+$(n).attr('title')+"'";}
                if( $(n).attr('src-content')!=null){
                    if($(n).attr('prefisso')!=null) str = str + " src='"+$(n).attr('prefisso')+eval('data.response.docs[0].'+$(n).attr('src-content'))+"' onerror='ImgError(this);'  ";
                    else str = str + " src='"+eval('data.response.docs[0].'+$(n).attr('src-content'))+"' onerror='ImgError(this);'  "; //richiama la funzione per gestire immagini mancanti
                }
                if($(n).attr('multivalue')==null){ if( $(n).attr('val-content')!=null){str = str + " val='"+eval('data.response.docs[0].'+$(n).attr('val-content'))+"'";} }
                else{ if( $(n).attr('val-content')!=null){str = str + " val='"+eval('data.response.docs[0].'+$(n).attr('val-content')+'[0]')+"'";} }
               
                //attributo che segnala l'apertura di un altra lens (es la lens di una persona)
                if( $(n).attr('openlens')!=null){str = str + " openlens='"+$(n).attr('openlens')+"'";}
                
                if( $(n).attr('href-content')!=null){
                	url = eval('data.response.docs[0].'+$(n).attr('href-content'));
                	if (url.indexOf("http://") != 0)
                		url = "http://" + url;
                	str = str + " href='"+url+"'";
                }
                if( $(n).attr('target')!=null){ str = str + " target='"+$(n).attr('target')+"'";}
                
                //attributo che segnala un contenuto youtube da aprire con il plugin di jQuery
                if( $(n).attr('youtube-content')!=null){
                    var link = eval('data.response.docs[0].'+$(n).attr('youtube-content')).toString();
                    var t = link.split("=");
                    var ref = t[t.length-1];
                    str= str + " class='embedYoutube' youtubeLink='"+ref+"'";
                }
                //oggetti che se cliccati aprono altri oggeti
                if( $(n).attr('openOnClick')=="true"){
                    str= str + " class='openOnClick' dest='"+$(n).attr('dest')+"'";
                    str = str + " closeLabel='"+$(n).attr('closeLabel')+"' ";
                    str = str + " openLabel='"+$(n).attr('openLabel')+"' ";
                    str= str + "><img class='image' src='framework/script/images/"+$(n).attr('type')+".png'><div class='label'>"+$(n).attr('OpenLabel')+"</div";
                    
                }
                if( $(n).attr('hide')=="true"){
                    str = str + " style='display:none' ";
                }
                
                /*
                *Nel momento in cui dovesse essere necessario gestire altri attributi, aggiungerli qui di seguito!
                */
         }
        else { //crea il div principale della lens
            str = str + " class='lens built lens"+$(n).attr('itemType')+"' val='"+data.response.docs[0].id+"'" ;
            selettore = '.lens'+$(n).attr('itemType');
        }
        
        str = str + ">"; //chiudi tag: in questo punto di avra qualcosa di simile a <DIV attr1="xx" attr2="yy"......>
        
        /*
        *Se è il nodo radice (contenitore della lens costruita), aggiunge bottone di chiusura e IL SIMBOLINO DELLA WISHLIST
            "enableCheckList" è la variabile di mainApi che assume il valore ell parametro da indicare nell'index per abilitare la wishlist
        */
        if($(n).attr('role')=='lens'){
            str = str + '<img class="closeLens" src="framework/script/images/close.png"/>';
            if($(n).attr('enableCheckList') == "true"){
                var isWish = false; //verifica che sia un elemento della wishlist attuale
                for(var wl=0; wl<wishList[$(n).attr('itemType')].length; wl++){
                    if(wishList[$(n).attr('itemType')][wl]==data.response.docs[0].id) {isWish = true; break;}
                }
                if(isWish) str = str + '<img class="wishListBott remove" type="'+$(n).attr('itemType')+'" val="'+data.response.docs[0].id+'" title="Rimuovi dal carrello" src="framework/script/images/transparent.gif"/>'
                else str = str + '<img class="wishListBott add" type="'+$(n).attr('itemType')+'" val="'+data.response.docs[0].id+'" title="Aggiungi al carrello" src="framework/script/images/transparent.gif"/>';
            }
        }
        
        var ch = $(n).children().get();
        /*
        *Se ha figli inizia con e chiamate ricorsive..
        */
        if(ch.length>0){
           //////////////////////////////////////////////////////////////////////////////////////////////////////////
           //questo pezzetto  di codice serve per la costruzione delle chiamate 1 a MOLTI che richiede una ulteriore
           //chiamata a SOLR:
           //
           //ATTENZIONE CHE è HARDCODED!!!
           //
           //Attributi usati:
           //-externalObj="true": segnala la necessità di aprire una nuova richiesta a SOLR
           //-idField: il field di dell'oggetto SOLR che contiene gli ID degli oggetti referenziati    esperieza_sSingle" externalCat="link" sortby="zindex_i%20asc
           //-fieldFKey: il field dell'oggetto refernziato da usare come chiave di referenza rispetto all'oggeto principale
           //-fieldFLKey: i file dell'oggetto referenziato da inserire nella response
           //-externalCat: il valore del field "cat" (alias tipo di oggetto) per gli oggetti referenziati
           //-sortby: evenutale parametro di sort da aggiungere alla query si SOLR
           //////////////////////////////////////////////////////////////////////////////////////////////////////////
           if($(n).attr('externalObj')=="true"){ 
                if(eval('data.response.docs[0].'+$(n).attr('idField'))!=null){ 
                     /*costruzione dei vari parametri per aprire la richiesta a Solr*/
                     var ids = eval('data.response.docs[0].'+$(n).attr('idField'));
                     var qParam = $(n).attr('externalCat');
                     var qk = $(n).attr('externalKey');
                     
                     var groupParam = $(n).attr('sortby');
                     var fqParam = $(n).attr('fieldFKey');
                     var fl = $(n).attr('fieldFLKey');
                     var fl = $(n).attr('fieldFLKey');
                     var fq = "&fq=("+qk+":"+ ids[0];
                     for(var k=1; k<ids.length; k++){
                        fq= fq+ " OR "+qk+":"+ids[k];
                     }
                     fq=fq+")";
                     var idField = $(n).attr('idField');
                     
                      var strData = "wt=json&q="+qParam+fq+"&fl=id,"+fl+"&sort="+groupParam;
                       
                      //////////////////////////////////////////////////////////////////////////////////////////////////////////
                      //CALLBACK PER LA COSTRUZIONE HARDCODED DEL NODO
                      ////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                       function buildOggetto(data){
                            var htmlObj = "";
                             
                            htmlObj = htmlObj + buildNodeExt(data.response.docs, idField); //CHIAMATA ALLA FUNZIONE CHE COSTRUISCE IL NODO
                            $('.built .div_link .body.'+idField.toLowerCase()+'').append(htmlObj);
                        
                            //////////////////////////////////////////////////////////////////////////////////////////////////////////
                            //Vari eventi associati agli elementi costruiti per aprire preview&simili
                            //////////////////////////////////////////////////////////////////////////////////////////////////////////
                            bindWishlistBott();
                            bindTitoloOggettoEsterno();
                            
                            /*Apertura della preview del documento (word,pdf,excel) usando il viewer di Google Document in un iframe*/
                            $('.doc .preview').click(function(){
                                var url = $(this).attr('url'); //costruisce il link secondo le specifiche di GDOC
                                url= url.replace(':','%3A');
                                url= url.replace('/','%2F');
                                url='https://docs.google.com/viewer?url='+url+'&embedded=true';
                                $('body').append('<div id="preview"><div class="opaco"></div><div class="contPreview"></div></div>');
                                var winW = 630, winH = 460;
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
                                $('#preview').css("width",winW+"px");
                                $('#preview').css("height",winH+"px");
                                var wFrame= 800;
                                var iframe= '<iframe src="'+url+'" width="'+wFrame+'" height="'+winH+'" style="border:none;"></iframe><div><img class="close" title="Chiudi preview" src="framework/script/images/close.png"/></div>';
                                $('#preview .contPreview').append(iframe);
                                var mLeft= (window.innerWidth-wFrame)/2;
                                $('#preview .contPreview').css('margin-left',mLeft+'px');
                                var lChiudi = wFrame-30;
                                $('#preview .contPreview .close').css('left',lChiudi+'px');
                                $('#preview .contPreview .close').click(function(){
                                    $('#preview').html('');
                                    $('#preview').remove();
                                });
                            });
                            
                            /*X LE NARRAZIONI MULTIMEDIALI: apre un iframe con il player di 1001storia*/
                             $('.linkn .narrazione').click(function(){
                                var url = $(this).attr('url');
                                $('body').append('<div id="preview"><div class="opaco"></div><div class="contPreview"></div></div>');
                                var winW = 630, winH = 460;
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
                                $('#preview').css("width",winW+"px");
                                $('#preview').css("height",winH+"px");
                                var wFrame= 1024;
                                var iframe= '<iframe src="'+url+'" width="'+wFrame+'" height="620" style="border:none;"></iframe><div><img class="close" title="Chiudi narrazione" src="framework/script/images/close.png"/></div>';
                                $('#preview .contPreview').append(iframe);
                                $('#preview .contPreview').append('<div class="pezza"></div>'); //un div pezza per nascondere "chiudi anteprima"
                                var mLeft= (window.innerWidth-wFrame)/2;
                                $('#preview .contPreview').css('margin-left',mLeft+'px');
                                var lChiudi = wFrame-30;
                                $('#preview .contPreview .close').css('left',lChiudi+'px');
                                $('#preview .contPreview .close').click(function(){
                                    $('#preview').html('');
                                    $('#preview').remove();
                                });
                            });
                            
                            /*X gli audio: apre un lettore EMBEDDED: il tag AUDIO non funzionava...*/
                            $('.audio .play').click(function(){
                                var url = $(this).attr('url');   
                                $('body').append('<div id="preview"><div class="opaco"></div><div class="contPreview"></div></div>');         
                                var winW = 630, winH = 460;
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
                                $('#preview').css("width",winW+"px");
                                $('#preview').css("height",winH+"px");
                                var wFrame= 280;
                                var iframe= '<div id="player">'+
                                                '<object id="sound1"  height="50" classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95">'+
                                                  '<param name="src" value="'+url+'">'+
                                                  '<param name="controls" value="All">'+
                                                  '<param name="console" value="sound1">'+
                                                  '<param name="autostart" value="true">'+
                                                  '<embed src="'+url+'"'+' type="audio/mp3" console="sound1" height="70" controls="All" autostart="true" name="sound1">'+
                                                '</object>'+
                                                '<div><img class="close" title="Chiudi preview" src="framework/script/images/close.png"/></div>'+
                                                '</div>';
                                $('#preview .contPreview').append(iframe);
                                $('#preview .contPreview').css('width',wFrame+'px');
                                var mLeft= (window.innerWidth-wFrame)/2;
                                var mTop= (winH/2) - 25;
                                $('#preview .contPreview').css('margin-left',mLeft+'px');
                                $('#preview .contPreview').css('margin-top',mTop+'px');
                                var lChiudi = wFrame-50;
                                $('#preview .contPreview .close').css('left',lChiudi+'px');
                                $('#preview .contPreview .close').click(function(){
                                    $('#preview').html('');
                                    $('#preview').remove();
                                });
                            });
                       } 
                       ////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                          
                      //apre chiamata AJAX a SOLR per recuperare i dati delle tuple della relazione 1 a MOLTI 
                      $.ajax({
                          url: solrServer,
                          data: strData,
                          dataType: 'jsonp',
                          success: function (data) {
                                buildOggetto(data);
                         },
                          jsonp: 'json.wrf'
                      });
                      
                }else{ //se non ci sono elementi nella relazione 1 a MOLTI
                    append = function (){
                    if($('.built .div_link .body').get(0)!=null){ 
                        //$('.built .div_link .body').append('<div>Materiale temporanemente non disponibile</div>');
                        $('.buttonLink').css('display','none');
                    }
                    else setTimeout('append()',5); //ci vuole il timeout (ricorsivo) per aspettare che il nodo sia disponibile...
                    }
                    append();
                }
            }
            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            /*ritorno alla parte parametrizzata*/
            else{
                 for(var z=0; z<ch.length; z++){
                    str = str +"\n" + buildNode(ch[z]); //per ogni nodo figlio, apri chiamata ricorsiva a buildNode
                }
            }
        }
        else{ //se non ha nodi figli
            if($(n).attr('content')!=null){ //se ha specificato un field di SOLR come contenuto
                try{
                    var values = eval('data.response.docs[0].'+$(n).attr('content'));
                    if(values.length==1 || $(n).attr('multivalue')==null){ //se è un valore sigolo, o se il template non ammette valori multipli
                        if($(n).attr('show')==null) str = str + " "+eval('data.response.docs[0].'+$(n).attr('content'));
                        else{
                            //quello che segue serve per recuperare i valori da propr di oggetti esterni (ma gia salvati in memoria) usando la notazione ref.field
                            var tmp = $(n).attr('show');
                            var type = tmp.split('.')[0];
                            var label = foreignObjects[type].data[eval('data.response.docs[0].'+$(n).attr('content'))];
                            str = str + " "+label;
                        }
                    }
                    else{//se ammette multivalore (tipo i collaboratori di faculty of informatics....) separali da virgola [in pratica se il ritorno è un array!]
                        if($(n).attr('show')==null) {str = str + " "+ values[0]; str = str + ',';}
                        else{
                            var tmp = $(n).attr('show');
                            var type = tmp.split('.')[0];
                            var label = foreignObjects[type].data[values[0]];
                            str = str + " "+label;
                            str = str + ',';
                        } 
                           
                        for(var b=1; b<values.length; b++){ //questo pezzo serve per chiudere il tag dell'elemento n-1, per aprire il tag n e riportare envenutali attibuti.
                            str = str +"\n"+ "</" + $(n).get(0).tagName + ">";
                            
                            str = str + '<' + $(n).get(0).tagName;
                            if( $(n).attr('id')!=null){ str = str + " id='"+$(n).attr('id')+"'"}
                            if( $(n).attr('class')!=null){ str = str + " class='"+$(n).attr('class')+"'";}
                            if( $(n).attr('val-content')!=null){str = str + " val='"+values[b]+"'";}
                            if( $(n).attr('openlens')!=null){str = str + " openlens='"+$(n).attr('openlens')+"'";}
                            str = str + ">";
                            
                            
                            if($(n).attr('show')==null) {str = str + " "+ values[b]; if(b < (values.length-1)) str = str + ',';}
                            else{
                                var tmp = $(n).attr('show');
                                var type = tmp.split('.')[0];
                                var label = foreignObjects[type].data[values[b]];
                                str = str + " "+label;
                                if(b < (values.length-1)) str = str + ',';
                            }   
                            
                            
                        }    
                    }
                }catch(err){ 
                    //ECCEZIONE SCATENATA QUANDO MANCA UNA PROPRIETA... ora commenta per evitare che di apra durante la demo...
                    //alert($(n).attr('content'));
                }finally{}
            }
            else str = str + $(n).html();
        }
        str = str +"\n"+ "</" + $(n).get(0).tagName + ">"; //chiudi il tag
        }
        return str; //ritorna la stringa che contiene il nodo html costruito con la funz build node.
    }
    
    var html= buildNode(node); //parti con a costr del nodo seguendo il templare ( questo node è il nodo radice)
    var sel = '.lens'+itemtype;
    $(sel).remove(); //elimina lens esistenti
    
    $('#view').append(html); //aggiungilo alla view!, lens costruita e visualizzata

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Vari eventi associati agli elementi costruiti nella porzione
    //parametrizzata della lens
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    /*Riproduzione di video youtube usando un plugin di jQuery (introdotto per Faculty of Informatics)*/
    $('.built .embedYoutube').tubeplayer({
        width: 300,
        height: 200,
        initialVideo: $('.embedYoutube').attr('youtubelink'), 
	preferredQuality: "default"
        });
    
    /*Gli elmenti dichiarati con classe openOnClick se cliccati vanno a settare la visualizzazione del componente dichiarato nell'attributo "dest"*/
    $('.openOnClick').click(function(){
        
        //chiude gli altri box aperti...
        var box = $('.box').get();
        for( var w = 0; w < box.length; w++){
           if(($(box[w]).css('display')=="block")&&(!$(box[w]).hasClass($(this).attr('dest')))){
                $(box[w]).css('display','none');
                var g = ".openOnClick[dest='"+$(box[w]).attr('value')+"']";
                var glabel = g + " .label";
                $(glabel).html($(g).attr('openLabel'));
           }
        }
        
        //aggiorna la label... es: chiudi xxx -> apri xxx
        var sel = '.'+ $(this).attr('dest');
        if( $(sel).css('display')=='none'){
            var t0 = '.openOnClick[dest="'+$(this).attr('dest')+'"] .label';
            $(t0).html($(this).attr('closeLabel'));
            $(sel).css('display','block');
        }
        else{
            var t0 = '.openOnClick[dest="'+$(this).attr('dest')+'"] .label';
            $(t0).html($(this).attr('openLabel'));
            $(sel).css('display','none');
        }
        
    });
	
	
	
	
	
	/*Gli elmenti dichiarati con classe openOnClickLens se cliccati vanno a settare la visualizzazione del componente dichiarato nell'attributo "dest"*/
	/*hardcoded per poco tempo a disposizione*/
    $('.openOnClickLens').click(function(){
        
        //chiude gli altri box aperti...
        var box = $('.box').get();
        for( var w = 0; w < box.length; w++){
           if(($(box[w]).css('display')=="block")&&(!$(box[w]).hasClass($(this).attr('dest')))){
                $(box[w]).css('display','none');
                var g = ".openOnClickLens[dest='"+$(box[w]).attr('value')+"']";
                var glabel = g + " .label";
                $(glabel).html($(g).attr('openLabel'));
           }
        }
        
        //aggiorna la label... es: chiudi xxx -> apri xxx
        var sel = '.'+ $(this).attr('dest');
        if( $(sel).css('display')=='none'){
            var t0 = '.openOnClickLens[dest="'+$(this).attr('dest')+'"] .label';
            $(t0).html($(this).attr('closeLabel'));
            $(sel).css('display','block');
        }
        else{
            var t0 = '.openOnClickLens[dest="'+$(this).attr('dest')+'"] .label';
            $(t0).html($(this).attr('openLabel'));
            $(sel).css('display','none');
			$(".div_descr").css('display','block');
			$(".div_sino").css('display','block');
			
        }
        
    });
	
    /*Eventi per aggiungere/rimuove un elemento dalla wishList*/
    bindWishlistBott();
    
    /*Apertura di link esterni usando fancybox (usato in policulturaportal)*/
    $(document).ready(function() {        
        $(".built .iframe").fancybox({
                'width' : 1000,
                'height' : 630
        });
    }); 
    
    /*Associa evento di chiusura della lens*/    
    sel = '.lens'+itemtype + " .closeLens";
    $(sel).click(function(){ $(this).parent().remove() });
    
    /*Associa evento di apertura di eventuali lens di secondo livello (es: le persone in Faculty of Informatics)*/
    $('[openlens]').unbind();
    $('[openlens]').click(function(){ sendLensRequest($(this).attr('val'), $(this).attr('openlens'));});
    
}

function bindWishlistBott() {
	$('.built .wishListBott').unbind();
	$('.built .wishListBott').click(function(){
        if($(this).hasClass('add')){
            $(this).removeClass('add');
            $(this).addClass('remove');
            $(this).attr('title', "Rimuovi dal carrello");
            $(this).attr('src', "framework/script/images/transparent.gif");
            
            $('.data ul li[val="'+$(this).attr('val')+'"]').append('<span class="wish"> (nel carrello)</span>');
            wishList[$(this).attr('type')].push($(this).attr('val'));
            updateCarrello();
        }
        else if($(this).hasClass('remove')){
            $(this).removeClass('remove');
            $(this).addClass('add');
            $(this).attr('title', "Aggiungi al carrello");
            $(this).attr('src', "framework/script/images/transparent.gif");
            $('.data ul li[val="'+$(this).attr('val')+'"] .wish').remove();
            for(var wl=0; wl<wishList[$(this).attr('type')].length; wl++){
                if(wishList[$(this).attr('type')][wl]==$(this).attr('val')) wishList[$(this).attr('type')].splice(wl,1);
            }
            updateCarrello();
        }
    });
}

function bindTitoloOggettoEsterno() {
	// funzione utilizzata in COMFIT e sovrascritta nel file lens-comfit.js
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// !!ATTENZIONE FUNZIONE NON PARAMETRIZZATA PER LA COSTRUZIONE DEI NODI DELLA RELAZIONE 1 A MOLTI
//  funzione chiamata nella parte superiore del codice. 
//  Definisce la struttura html dei nodi dei link per il portale di L4ALL
//  GLI EVENTI CHE SCATENANO LE VISUALIZZAZIONI DI PREVIEW E RIPRODUZIONI SONO SOPRA
//  DOPO L'AGGIUNTA AL DOM DEL CODICE HTML GENERATO DA QUESTA FUNZIONE
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function buildNodeExt(datiCustom){
    var str = '';
    str = "<ul>"
     
    for(var b=0; b<datiCustom.length; b++){
       var formato = datiCustom[b].formato_sSingle;
       if(formato.toLowerCase()=='doc' || formato.toLowerCase()=='docx' || formato.toLowerCase()=='rtf' || formato.toLowerCase()=='xls' || formato.toLowerCase()=='xlsx' || formato.toLowerCase()=='pdf'){
           str= str + "<li class='doc'>";
           str= str + "<div title='"+datiCustom[b].descrizione_sSingle+"'>"+datiCustom[b].titolo_sSingle+"</div>";
           str= str + "<img class='preview' url='"+datiCustom[b].link_sSingle+"' title='Preview del documento' src='framework/script/images/preview.png' />";
           str= str + "<a class='downlaod' href='http://hoc13.elet.polimi.it/pdf/download.php?file="+datiCustom[b].link_sSingle+"'  title='Download del documento' target='_blank'><img src='framework/script/images/download.png' /></a>";
           str= str + "</li>";
       }
       else if(formato.toLowerCase()=='mp3' || formato.toLowerCase()=='wav' || formato.toLowerCase()=='wav'){
           str= str + "<li class='audio'>";
           str= str + "<div title='"+datiCustom[b].descrizione_sSingle+"'>"+datiCustom[b].titolo_sSingle+"</div>";
           str= str + "<img class='play' title='Riproduci'  url='"+datiCustom[b].link_sSingle+"' src='framework/script/images/play.png' />";
           str= str + "<a class='downlaod' href='http://hoc13.elet.polimi.it/pdf/download.php?file="+datiCustom[b].link_sSingle+"'  title='Download del file audio' target='_blank'><img src='framework/script/images/download.png' /></a>";
           str= str + "</li>";
       }
       else if(formato=='linkn'){
           str= str + "<li class='linkn'>";
           str= str + "<div title='"+datiCustom[b].descrizione_sSingle+"'>"+datiCustom[b].titolo_sSingle+"</div>";
           //str= str + "<a class='apriLink' href='"+datiCustom[b].link_sSingle+"'  title='Apri link' target='_blank'><img src='framework/script/images/play.png' /></a>";
           str= str + "<img class='narrazione' url='"+datiCustom[b].link_sSingle+"' title='Vedi narrazione' src='framework/script/images/play.png' />";
           str= str + "</li>";
       }
       else if(formato=='link'){
           str= str + "<li class='link'>";
           str= str + "<div title='"+datiCustom[b].descrizione_sSingle+"'>"+datiCustom[b].titolo_sSingle+"</div>";
           str= str + "<a class='apriLink' href='"+datiCustom[b].link_sSingle+"'  title='Apri link' target='_blank'><img src='framework/script/images/play.png' /></a>";
           str= str + "</li>";
       }
       else{
           str= str + "<li class='altro'>";
           str= str + "<div title='"+datiCustom[b].descrizione_sSingle+"'>"+datiCustom[b].titolo_sSingle+"</div>";
           str= str + "<a class='downlaod' href='http://hoc13.elet.polimi.it/pdf/download.php?file="+datiCustom[b].link_sSingle+"'  title='Download del documento' target='_blank'><img src='framework/script/images/download.png' /></a>";
           str= str + "</li>";
       }
    }    
              
    str = str + "</ul>";
    return str;   
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

/*FUNZIONE chiamata quando non si trova un immagine
* ToDo: sostituire il link dell'immagine con la stessa sui server di HOC
*/
function ImgError(source){
    //SOSTITUISCILA
    source.src = "http://www.webapp.usi.ch/informaticsresearch/uploads/person/image/nofoto-9.jpg";
    source.onerror = "";
    //CANCELLALA
    //$(source).remove();
    return true;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Funzione che regola la maschera di review della wishList
//////////////////////////////////////////////////////////////////////////////////////////////////////////
reviewWishList = function(){
    var wish = false;
    // D.T. Begin - prende il tipo di documento del contesto attuale
    var defaultType = Application.getContestoAttuale().getItemType();
    if(typeof(wishList[defaultType]) != 'undefined' && wishList[defaultType].length>0) wish=true;
    //for(i in wishList){ if(wishList[i].length>0) wish=true;} //verifica che ci sia qualcosa nella wishlist
    // D.T. End
    
    //try{
        var rwl;
        var contatore= 0;
        var aperta=0;
        //inizializza il contenitore dello strumento di review
        if($('#reviewWishList').get().length>0){ $('#reviewWishList').html(""); rwl=$('#reviewWishList');}
        else {
            rwl = document.createElement('div'); 
            rwl.id= "reviewWishList"; 
            rwl.className= "reviewWishList"; 
            $('body').append(rwl);
        }
        
        $('#reviewWishList').append('<div class="opaco"></div>');
        $('#reviewWishList .opaco').css('width',$('body').css('width'));
        $('#reviewWishList .opaco').css('height',screen.height + "px");
        
        $('#reviewWishList').append('<div class="containerW"></div>');
        
        var cB = '<img class="close" title="Torna all\'esplorazione" src="framework/script/images/close.png"/>'; //immagine per chiusura
        $('#reviewWishList .containerW').append(cB);
        
        var left = parseInt((parseInt($('body').css('width'))-(parseInt($('#reviewWishList .containerW').css('width')))-40)/2);
        $('#reviewWishList .containerW').css('left',left+'px');
        $('#reviewWishList .containerW .close').click(function(){  $('#reviewWishList').remove()});
        
        /*Maschera di review della wishlist SE CI SONO ELEMENTI*/
        
        if(wish){
            $('#reviewWishList .containerW').addClass("wish");
            $('#reviewWishList .containerW').append('<div class="top"><div class="sx"/><div class="dx"/><hr class="vertical"/></div> <div class="bottom"></div>');
            // D.T. Begin - defaultType letto prima dell'if
            // var defaultType = null;
            // D.T. End
            var currentType = null;
			if(enableSave)$('#reviewWishList .containerW .top .sx').append("<img class='saveWish' title='Salva/Ripristina carrello' src='framework/script/images/save.png'/>");
			
            $('#reviewWishList .containerW .top .sx').append("<img class='clearWish' title='Svuota il carrello' src='framework/script/images/clear_filters.png'/>");
            $('#reviewWishList .containerW .top .sx').append("<img class='addAll' title='Aggiungi selezione attuale al carrello' src='framework/script/images/addlist.png'/>");
            $('#reviewWishList .containerW .top .sx').append("<img class='exWish' title='Scarica il PDF del carrello' src='framework/script/images/pdf.png'/>");
			


            $('#reviewWishList .containerW .top .sx').append("<h3>Contenuto del carrello:</h3>");
            
            // D.T. Begin - visualizza solo gli elementi del tipo defaultType
            // Nota: in L4ALL 1.0 venivano visualizzate gli elementi di tutti i tipi 
            // ma essendo solo di tipo 'experience' non si notava la differenza
            
            //for (i in wishList) {
            //     if (defaultType == null) defaultType = i;    
            //lista degli elementi della wishlist
            var ul="<div class='first'>" + "<ul>";
            for(var c=0; c<wishList[defaultType].length; c++){ul= ul + "<li val='"+wishList[defaultType][c]+"' type='"+defaultType+"'  n='"+c+"'><span>"+wishList[defaultType][c]+"</span></li>"; contatore++;}
            ul = ul + "</ul>"+ "</div>";
            $('#reviewWishList .containerW .top .sx').append(ul);
        	//}
            
            // D.T. End 
            
            $('#reviewWishList .containerW .top .sx li').click(function(){ //Associa a ogni elemento della lista l'evento per aprire la lens dell'elemento
                updateLens(parseInt($(this).attr('n')), $(this).attr('type'));
            });
            
            
            /*Sezione della maschera (in alto a destra) che contiene la scheda di dettaglio degli elementi della wishlist*/
             $('#reviewWishList .containerW .top .dx').append('<img class="aL" src="framework/script/images/left-arrow.png"/>'+'<img class="aR"src="framework/script/images/right-arrow.png"/>');
               var self=this; 
               /////////////////////////////////////////////////////////////////////////////////////////////////////////
               // Funzione che apre la lens dei un elemento (questa lens è comandata da css leggermente diversi)
               //////////////////////////////////////////////////////////////////////////////////////////////////////////
               updateLens = function(id,type){
                   startloader();
                    currentType = type;
                    aperta=id; 
                    $('#reviewWishList .containerW .top .sx li.selected').removeClass("selected");
                    $('#reviewWishList .containerW .top .dx .lens.built').remove();
                    sendLensRequest(wishList[type][id], type);
                    $('#reviewWishList .containerW .top .sx li[n="'+id+'"]').addClass('selected');
                    checkPendingRequestLens = function() {
                        if ($.active > 0) { setTimeout("checkPendingRequestLens()",20);} else {
                            $('#reviewWishList .containerW .top .dx').append($('.lens.built'));
                            $('#reviewWishList .containerW .top .dx .built .wishListBott').click(function(){
                                $('#reviewWishList .containerW .top .sx li[val="'+$(this).attr('val')+'"]').remove();
                                if(wishList[currentType].length>0) updateLens(0,currentType);
                                else $('#reviewWishList .containerW .close').trigger('click');
                            }); 
                             $(document).ready(function(){ stoploader(); })
                        }
                    }
                    checkPendingRequestLens();
                }
                
                updateLens(0, defaultType); //apri lens del primo elemento
                
                //eventi freccine di navigazione 
                $('#reviewWishList .containerW .top .dx .aL').click(function(){ if(aperta==0) updateLens(contatore-1 , currentType); else updateLens(aperta-1, currentType);});
                $('#reviewWishList .containerW .top .dx .aR').click(function(){if(aperta==contatore-1) updateLens(0, currentType);else updateLens(aperta+1 , currentType);});
            	
            
        }
        /*Maschera della wishlist SE NON CI SONO ELEMENTI (wishlist vuota)*/
        else {
             $('#reviewWishList .containerW').append('<div></div>');
             $('#reviewWishList .containerW').addClass("nowish");
             
             if($.cookie('wishSaved')!=null && $.cookie('wishSaved')!=""){
                $('#reviewWishList .containerW.nowish > div').append("<h3 class='h saveWish'>Ripristinare un carrello salvato<img src='framework/script/images/save.png'/> </h3>");
             }
             $('#reviewWishList .containerW.nowish > div').append("<h3 class='h addAll'>Aggiungi la selezione corrente al carrello <img src='framework/script/images/addlist.png'/></h3>");
        
             $('#reviewWishList .containerW.nowish > div').append("<h3 class='h empty'> Il carrello è vuoto. E' possible aggiungere nuovi elementi al carrello cliccando su <img src='framework/script/images/wishNoCheck.png'/> nella scheda di dettaglio</h3>");

        }
        
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Eventi vari della maschera
        //////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        /*Scarica il pdf degli elementi della wishlist: 
        * -chiede il titolo con uan finestra prompt
        * -invia la richiesta alla pagina PHP che genera il pdf
        * !!ToDo: parametrizzare l'indirizzo della pagina PHP!!
        */
        $('#reviewWishList .exWish').click(function(){
           /*url al modulo PHP che genera il PDF
           *refraso: wishlist
           *idEsperienze: id separati da ,
           */
           var titolo = "Elementi estratti dal portale";
           titolo = prompt("Download del PDF del carrello\n\nTitolo del documento:",titolo);
           if (titolo == null || titolo.length == 0) return;
           
           for(ww in wishList){
                var url = PDFservlet+'?titolo='+titolo+'&refraso=wishlist&idEsperienze='+wishList[ww];
                 //alert('la formattazione dei PDF non è ancora completata');
                window.open(url,'Downlaod PDF');
           }
        }); 
        
        /*Scarica il pdf degli elementi della wishlist: 
        * Aggiunge alla wishlist tutti gli elementi della selezioen corrente
        */
         $('#reviewWishList .containerW  .addAll').click(function(){
                var idsOn=[];
                var tipo;
                
                for(ww in wishList) {tipo = ww; break}
                var wishnow = wishList[tipo];
                if(wishnow.length>0){
                    /*Chiede se mantenere gli elementi correnti della lista o se fare il merge*/
                    var x=window.confirm("Mantenere l'attuale contenuto del carrello?");
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
                                   
                $('#reviewWishList .containerW .close').trigger('click');
                $('.exportWishList').trigger('click');
             });
        
        /*Apre la maschera dei salvataggi della wishlist*/
        $('#reviewWishList .containerW  .saveWish').click(function(){
            $('#reviewSaveWish').unbind(); $('#reviewSaveWish').remove(); 
            $('.containerW').append("<div id='reviewSaveWish'><div class='opaco'/><div class='contSave'><div class='topS'/><hr><div class='bottomS'/></div></div>");
            
            $('.containerW .contSave').prepend('<img class="close" title="Torna all\'esplorazione" src="framework/script/images/close.png"/>');       
            $('.containerW .contSave .close').click(function(){ 
                $(this).parent().parent().html('');
                $('#reviewSaveWish').remove();
            });
            
            $('.containerW .contSave .topS').append("<h3 class='h'> Salva il carrello:</h3>"+
            " <div><form id='save'>"+
                "<span>Titolo: </span><input class='label' accept-charset = 'UTF-8' size=42 type='text' name='saveLabel'/>"+
                "<br/>"+
                "<span>Note: </span><textarea class='note' accept-charset = 'UTF-8' NAME='note' cols=40 rows=6></textarea>"+
                "<br/>"+
                 "<button type='button' onclick='saveW()'> <span>Salva</span> </button>"+
            "</form></div> ");
            
            ////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Funzione per il salvataggio della wishlist come cookie
            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            saveW = function() { //funzione per il salvataggio
               var label = $('#save_'+accordionType+' .label').val();
               var note = $('#save_'+accordionType+' .note').val();
               var tipo; for(ww in wishList) {tipo = ww; break}
               var wishnow = wishList[tipo];
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
                   $('.containerW .contSave .close').trigger('click'); //forza la chiusura della maschera
               }
            }
                $('.containerW .contSave .bottomS').append('<div class="des"></div><div class="sin"></div>');
                
                /*Se ci sono dei salvataggi, costruisci la parte inferiore della maschera*/
                if($.cookie('wishSaved')!=null && $.cookie('wishSaved')!=""){
                    
                    /*costruisce la lista dei salvataggi (elenco della key dei cookie)*/
                    var values = $.cookie('wishSaved').split('$£');
                    var ul = "<h3>Carrelli salvati: <img class='claearSavedWish pointer' title='Elimina tutti i salvataggi del carrello' src='framework/script/images/clear_filters.png'/><h3/>"+ '<ul>';
                    for(var l=0; l<values.length; l++){ ul = ul + "<li n='"+l+"' val='"+values[l]+"'>"+values[l]+"</li>"}
                    ul= ul+'</ul>';
                    $('.containerW .contSave .bottomS .sin').append(ul);
                    
                    /*costruisci il dettaglio del salvataggio, data la key del cookie*/
                    costrDett = function(index){
                        key =  $('.containerW .contSave .bottomS .sin li[n="'+index+'"]').attr('val');
                        $('.containerW .contSave .bottomS .sin li.selected').removeClass('selected');
                        $('.containerW .contSave .bottomS .sin li[n="'+index+'"]').addClass('selected');
                        
                        elimina = function(key){
                            $.cookie(key,null,{ expires: 365, path: '/' });
                            var cks = $.cookie('wishSaved').split('$£');
                            var newCks=null;
                            for(var c=0; c<cks.length; c++){
                                if(cks[c]!=key){
                                    if(newCks==null) newCks=cks[c];
                                    else newCks= newCks + "$£" + cks[c];
                                }
                            }
                            $.cookie('wishSaved',newCks,{ expires: 365, path: '/' });
                        }
                        
                        $('.containerW .contSave .bottomS .sin .claearSavedWish').click(function(){
                            var cks = $.cookie('wishSaved').split('$£');
                            for(var c=0; c<cks.length; c++){
                                elimina(cks[c]);
                            }
                            $.cookie('wishSaved',null,{ expires: 365, path: '/' });
                            $('.containerW .contSave .close').trigger('click');
                        });
                        
                        var cookie = $.cookie(key);
                        if(cookie==null) elimina(key);
                        else{
                            var vCookie = cookie.split('$£'); 
                            var label = vCookie[0];
                            var note = vCookie[1];
                            
                            var html = "<div class='dettaglio'><h3>"+label+"<img class='elimina pointer' val='"+key+"' title='Elimina salvataggio' src='framework/script/images/close.png'/></h3>"+
                                "<div class='note'>Note:<p>"+note+"</p></div>"+
                                "<div class='pointer restore' n='"+index+"'>Ripristina</div>"+
                                "<div class='pointer fondi' n='"+index+"'>Aggiungi al carrello esistente</div></div>";
                            $('.containerW .contSave .bottomS .des').html(html);
                            
                            /*evento: ripristina un salvataggio*/
                            $('.containerW .contSave .bottomS .des .restore').click(restoreWishlist);
                            
                            /*evento: aggiunge alla wishlist attuale gli elementi che compongono la wishlist salvata*/
                            $('.containerW .contSave .bottomS .des .fondi').click(function(){
                                var key = $('.containerW .contSave .bottomS .sin li[n="'+$(this).attr('n')+'"]').attr('val');
                                var values = $.cookie(key).split('$£')[2].split(',');
                                var cValues= new Array(); //valori attuali della wishlist
                                for(ww in wishList){ cValues= wishList[ww]; break;}
                                
                                values = values.concat(cValues); //nuovi valori della wishlist
                                values = values.sort();
                                
                                var newValues = new Array();
                                newValues.push(values[0]);
                                for(var c=1; c<values.length; c++){
                                    if(values[c]!=values[c-1]) newValues.push(values[c]);
                                }
                                
                                for(ww in wishList){ wishList[ww]=newValues; break;}
                                
                                $('.containerW .contSave .close').trigger('click');
                                $('.containerW > .close').trigger('click');
                                $('.exportWishList').trigger('click');
                            });
                        }
                        
                        
                        $('.containerW .contSave .bottomS .des .elimina').click(function(){
                            elimina($(this).attr('val'));
                            $('.containerW .contSave .close').trigger('click');
                            $('#reviewWishList .containerW  .saveWish').trigger('click');
                        });
                        
                    }
                    costrDett(0);
                    
                    $('.containerW .contSave .bottomS .sin li').click(function(){
                        costrDett(parseInt($(this).attr('n')));
                    });
                }
            
                
            
        });
    
        
        $('#reviewWishList .clearWish').click(function(){
            for(ww in wishList) wishList[ww]=new Array();
            $('#reviewWishList .containerW .close').trigger('click');
        });  
        
        //}catch(err){ alert();}finally{}
}
