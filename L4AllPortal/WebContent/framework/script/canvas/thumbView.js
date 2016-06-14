/*Canvas thumbnail: immaginette di preview per ogni elemento e divisione in pagine*/


thumbView = function(containerElmt,expression) {
    this._id_div = containerElmt; //id del div che contiene il canvas
    this._settings = {}; //conterrà i valori delle propietà indicate sotto
    SettingsUtilities._internalCollectSettings(this._id_div, thumbView._settingSpecs, this._settings); //carica i valori delle variabili (vedi script in /utils/)
    this._highLight = this._settings.hexpressions.split(','); //fileds da usare per gli highlight
    this._highLabels = this._settings.hlabel.split(','); //etichette degli highlight (NB: stesso ordine dei fileds)
    this._colors = this._settings.colors.split(','); //colori usati per gli highlight
    
    this._mapsColors = []; //mappature colori
    this._objects = {}; //oggetto che conterrà tutte le info per ogni oggetto
    
    this._htmlHigh ="";
    this._htmlCanvas ="";
    
    //variabili per la divisione in pagine
    this.indexesSort= new Array();
    this.pages=0;
    this.currentpage=1;
    this.maxpage=0;
    
    //stato attuale
    this._currentHighlight = 0;  
};

/*Tutti i parametri di pesonalizzazioni*/
thumbView._settingSpecs = {
    "label": {type: "text", defaultValue: "Thumb View"}, //etichetta che compare nel menu dei canvas
    "legendaColore": { type: "text", defaultValue: "Color code:" }, //Label della legenda dei colori
    "hexpressions": { type: "text", defaultValue: "" }, //fileds da usare per gli highlight
    "hlabel": { type: "text", defaultValue: "" }, //label degli highlight
    "image": { type: "text", defaultValue: null }, //field che contiene l'immagine da usare
    "prefissoImg": { type: "text", defaultValue: 'http://hoc13.elet.polimi.it/policulture/files/images/thumb/small/' }, //prefisso delle immagini
    "row": { type: "int", defaultValue: 5 }, //numero di righe
    "col": { type: "int", defaultValue: 7 }, //numero di colonne
    "sortby": { type: "text", defaultValue: null }, //evnetuale sort by
    "colors": { type: "text", defaultValue: "#A9218E,#008752,#B5121B,#0054A4,#E86D1F,#455560,#002225,#ffffff" }, //colori per gli highlight
    "lenstype": { type: "text", defaultValue: null } //eventuale lens da aprire
    
};

/*Funzione per eventuale sort degi risultati secondo un determinato field*/
thumbView.prototype.sortBy = function(){
    ret="";
    if(this._settings.sortby!=null){
        ret="&sort="+this._settings.sortby + " asc";
    } 
    return ret;
}

/*Restituisce un array con tutti i field che serviranno per costruire la view*/
thumbView.prototype.fieldParams = function(){
  var ret = [];
  ret.push('id');
  ret.push('label');
  
  if(this._settings.image != null) {
       var tmp = this._settings.image.split('.');
       if(tmp.length > 1) ret.push(tmp[1]);
       else ret.push(this._settings.image);
 }
 
 if(this._settings.sortby != null) {
       var tmp = this._settings.sortby.split('.');
       if(tmp.length > 1) ret.push(tmp[1]);
       else ret.push(this._settings.sortby);
 }
  
  for(var y=0; y<this._highLight.length; y++){
     var tmp = this._highLight[y].split('.');
     if(tmp.length > 1) ret.push(tmp[1]);
     else ret.push(this._highLight[y]);
  }
  return ret;
}


/*Funzione he costurisce il Canvas
ATTENZIONE: per questo canvas non è stato implementato il salvataggio dello stato: se dovesse servire, prendere spunto dal canvas mosaico

*/
thumbView.prototype.buildCanvas = function(data){
    
    /*REINIZIALIZZAZIONE delle variabili*/
    this._mapsColors = [];
    this._objects = {};
    this._currentHighlight = 0;    
    this._htmlHigh ="";
    this._htmlCanvas ="";
    this.indexesSort= new Array();
    this.pages=0;
    this.currentpage=1;
    this.maxpage=0;
    this.indexesSort= new Array(); 
    
    
   /*COSTRUISCE MENU HIGHLIGHT*/
   var self= this;
   var wcanvas = $('#view').css('width');
   wcanvas = wcanvas.substring(0,wcanvas.length-2);
   var wthumb = (wcanvas - (20* (this._settings.col-1)))/this._settings.col;
   var hthumb = wthumb*0.75;
   
   if(this._highLabels.length > 0){
      ul = '<span class="label">Highlight by: </span><span class="currentSelection"><span>'+this._highLabels[0]+'</span><img class="arrow" src="framework/script/images/arrowdown.png"></span><ul>';
      for(var c=0; c< this._highLabels.length; c++){ ul += '<li val="'+c+'">'+this._highLabels[c]+'</li>'; }
      ul += '</ul>';
      this._htmlHigh = ul;
   }  
  
  //prepara la var per la mappatura dei colori
  var contColor= [] 
  for(var a=0; a<this._highLight.length; a++){
    this._mapsColors[a] = {}
    contColor.push(0);
  } 
  
  //predisponi objects: mappa tutti i valori di highlight e l'immagine 
  for(var d=0; d<data.length; d++){
      var obj = {}
      obj['image'] = eval('data[d].'+eval('this._settings.image'));
      
      if(this._settings.sortby!=null) obj['sort'] = eval('data[d].'+eval('this._settings.sortby'));
      
      for(var a=0; a<this._highLight.length; a++){
          var tmp0 = this._highLight[a].split('.');
          var v = '';
          //statagemma per utilizzare come highlight il field di una proprietà 1:1 (un oggetto esterno, cerca il valore nella sezione dei widget)
          if(tmp0.length > 1) {
              v = tmp0[1];
              var exp = "[expression='"+tmp0[0]+"']";
              var sel = exp + " [title='"+eval('data[d].'+ eval('v'))+"']";
              var v1 = $(sel).parent().parent().attr('label');
              if(this._mapsColors[a][ v1 ] == null){
                  this._mapsColors[a][ v1 ] = this._colors[contColor[a]];
                  if(contColor[a]!=(this._colors.length-1)){contColor[a]++;}
              }
              obj[v] = this._mapsColors[a][ v1];
          }
          else { //preferibile cmq avere il dataset completamente dernormalizzato, ed entrare qui
              v = this._highLight[a];
              if(this._mapsColors[a][ eval('data[d].'+ eval('v'))] == null){
                  this._mapsColors[a][ eval('data[d].'+eval('v'))] = this._colors[contColor[a]];
                  if(contColor[a]!=(this._colors.length-1)){contColor[a]++;}
              }
              obj[v] = this._mapsColors[a][ eval('data[d].'+eval('v'))];
          }                      
      }
      this._objects[eval('data[d].id')] = obj;  //salva in memoria l'ogg con tutte le sue propr
  }
  
  
/*  //Costruisci legenda dei colori
  var legC = '<div class="legendaColore"> <span>'+this._settings.legendaColore+'</span>';
  for(i in this._mapsColors[this._currentHighlight]){ legC = legC + '<span style="color:'+this._mapsColors[this._currentHighlight][i]+'">'+ i +'</span>'; } 
  legC = legC + '</div>';
   if($('#refraso').length) $('#refraso').before(legC);
   else $('#view').append(legC);
*/
   
          
  //costruisci la visualizzazione in Pagine:
  //-ALL'INIZIO DI OGNI CATEGORIA DEL VALORE "SORT" METTE UNA DOPPIA CELLA (SEPARATOR) CON IL VALORE DELLA PROP. RIPETE QUESTA DOPPIA CELLA ANCHE ALL'INIZIO DI OGNI PAGINA SUCCESSIVA
  //-OGNI PAGINA è UNA TABELLA DI Row x Column (parametri personalizzabili)
  //-In una cellaElemento mette l'immagine dell'oggetto e il bordo sarà del colore dell'highlight
  var self=this;
  var x=0; 
  var y=0; 
  var separator_count=1;
        
    function newpage(val,bool){ //nuova pagina della visualizzazione
        self.pages++;
        var pageDiv = document.createElement("div");
        pageDiv.id = "page"+self.pages;
        pageDiv.className = "page";
        viewDiv.appendChild(pageDiv);
        var tab = document.createElement("table");
        pageDiv.appendChild(tab);
        
        var str= "#page"+self.pages+" table";
        $(str).append('<tr></tr>');
        var str0= str+" tr:last-child";
        var html='<td class="sep" colspan="2"><div><div>'+val+'</div><img class="right" src="framework/script/images/right.png"/>';
        if(bool){ html+='<img class="left" src="framework/script/images/left.png"/>';}
        html+='</div></td>';
        $(str0).append(html);
        x=3; y=1;
    }
        
    function newseparator(val){ //NUOVO SEPARATORE - CHIAMATO QUANDO CAMBIA IL VALORE "SORT"
        function appendseparator(){ //FUNZ PER APPENDERE SEPARATORE ALL'HTML
            var selettore= '#page'+self.pages+' table' + ' tr:last-child';
            var html='<td class="sep" colspan="2"><div><div>'+val+'</div><img class="right" src="framework/script/images/right.png"/></div></td>';
            $(selettore).append(html);
            x=x+2; if(x>self._settings.col){x=1; y++}
        }
        var str0='#page'+self.pages+" table"; //SELETTORE PER LA TABELLA DELLA PAGINA
        if(x==1){ $(str0).append('<tr></tr>');} //AGGIUNGI NUOVA RIGA }
        if(x==self._settings.col){ //SE è NELL'ULTIMA COLONNA VAI A CAPO DIRETTO
            if(y<self._settings.row){ //SE NON è NELL'ULTIMA RIGA
                $(str0).append('<tr></tr>'); //AGGIUNGI NUOVA RIGA
                x=1; //RIPORTALO IN PRIMA POSIZIONE E INCR NUMERO DI RIGA
                y++; 
                appendseparator()
            }
            else{ //SE è ULTIMA RIGA CREA NUOVA PAGINA, PASSANDO IL VALORE DEL SEPARATORE INIZIALE
               newpage(val,false);
            }
        }
        else if(x==self._settings.col-1){ //se occuperebbe le ultime due celle della riga
           if(y<self._settings.row){appendseparator()}
           else{ //se è ultima riga lascia spazio vuoto e crea nuova pagina
               newpage(val,false);
            }
        }
        else if(x==self._settings.col){
            $(str0).append('<tr></tr>');
            appendseparator()
        } 
        else{
            appendseparator()
        }
        
    }
        
   var lastSortValue = ""; 
   var viewDiv = document.createElement("div");
   viewDiv.id = "thumbContainer";
   
   
   if($('#refraso').length) $('#refraso').before(viewDiv);
   else $('#view').append(viewDiv);       
   
   for(var d=0; d<data.length; d++){
       if(x==0 && y==0){ ////////////////////////////creazione della prima pagina!
            if(this._objects[data[d].id].sort != lastSortValue){
                lastSortValue = this._objects[data[d].id].sort;
                if(this.pages>0) newpage(lastSortValue,true);
                else newpage(lastSortValue,false);
            }
            else newpage(lastSortValue,true);
        }
       else if(this._objects[data[d].id].sort != lastSortValue){
           lastSortValue = this._objects[data[d].id].sort;
           newseparator(lastSortValue);
       }
       
       var str= '#page'+this.pages+ ' table'; 
       
       if(x==1){ $(str).append('<tr></tr>');} 
       
       str= str + " tr:last-child";        
       color = eval('this._objects[data[d].id].'+this._highLight[this._currentHighlight]); 
       image = "img/tmp_pic.png";    
       if(this._objects[data[d].id].image != null) image =  this._settings.prefissoImg + this._objects[data[d].id].image;
       //COSTRUISCE LA CELLA
       var html='<td class="item on" idObj="'+data[d].id+'" x="'+x+'" y="'+y+'" style="border-color:'+color+';"><img src="'+image+'" width="'+wthumb+'px" height="'+hthumb+'px"/></td>';
       $(str).append(html);
       x++; 

       if(x>this._settings.col){x=1; y++} 
       if(y>this._settings.row){x=0;y=0;}
    }
    
    $('table .item').css('min-width',wthumb+'px');
    $('table .item').css('height',hthumb+'px');
    
    //costruzione del passaggio tra le pagine
    var htmlpages = "<div class='index'>"+
            "<div>Pages: </div> <div class='num'><img style='float:left; margin-right:5px;' src='framework/script/images/left-arrow.png' class='prev'/>";
                    
    for(var q=0; q<this.pages; q++){
        htmlpages = htmlpages + "<div class='pageNum  on goP"+(q+1)+"' num='"+(q+1)+"'><div class='pageHisto'></div><div class='val'>"+(q+1)+"</div></div>";
        this.maxpage=q+1;
    }  
    
    var self = this;
                                
    htmlpages = htmlpages +" <img src='framework/script/images/right-arrow.png' class='next' '/> </div><div style='position: relative; margin-top: -10px; z-index:0'>&nbsp</div></div>";
     
    if($('#refraso').length) $('#refraso').before(htmlpages);
    else $('#view').append(htmlpages);
     
     $('#view .index .num .prev').click(function(){
        self.moveToPage(parseInt(self.currentpage)-1);
    });
    $('#view .index .num .next').click(function(){
        self.moveToPage(parseInt(self.currentpage)+1);
    });
    
    
    $('.pageNum').unbind(); 
    $('.pageNum on').removeClass('on'); 
       
   for(var w=0; w<this.pages; w++){
       var str = '#page'+(w+1)+" .on";
       var on = $(str).get();
       if(on.length>0){
            var str1='.goP'+(w+1);
            $(str1).css("font-weight","bold");     ////////////CSS PER HIGH LIGHT DI PAGINE CHE CONTENGONO ANCORA NARRAZZAZIONI
            $(str1).addClass('on');
            $(str1).click(function() {self.moveToPage($(this).attr('num'))}); //linkabili solo le pagine non vuote
            
            var str2 = str1 + ' .pageHisto';
            $(str2).css('display','block');
            
            var height = (20*on.length)/(this._settings.col*this._settings.row);
            if(height<1) {height=1;}
            var margintop = 20 - height;
            $(str2).css('height',height+'px');
            $(str2).css('width','10px');
            $(str2).css('background-color','white');
            $(str2).css('margin-left','4px');
            $(str2).css('margin-top',margintop+'px');
            
            var str3= str1 + " .val";
            if($(str1).attr('num')<10){ $(str3).css('margin-left','5px')}
       }
       else{
           var str1='.goP'+(w+1);
           $(str1).css("font-weight","normal");
            var str2 = str1 + ' .pageHisto';
            $(str2).css('display','block');
            $(str2).css('height','0px');
            $(str2).css('margin-top','20px');
            $(str2).css('background-color',$('#view').css('background-color'));
            $(str2).css('width','10px');
            $(str2).css('margin-left','4px');
       }
    }
    var strn = '.goP'+this.currentpage;
    $(strn).addClass('current');
    self.moveToPage(self.currentpage);
	
	
	 //Costruisci legenda dei colori
   var legC = '<div class="legendaColore"> <span>'+this._settings.legendaColore+'</span>';
   for(i in this._mapsColors[this._currentHighlight]){ legC = legC + '<span style="color:'+this._mapsColors[this._currentHighlight][i]+'">'+ i +'</span>'; } 
   legC = legC + '</div>';
   //if($('#refraso').length) $('#refraso').before(legC);
   //else
   $('#view').before(legC);
    
}

/*seconda parte di costr della view*/
thumbView.prototype.displayCanvas = function(data){
    var self=this;
/*DISPLAY DELL MENU DEGLI HIGHLIGHT*/
    if(this._highLabels.length > 1){
          $('#view .viewTop .highlight').html(this._htmlHigh);
          $('#view .viewTop .highlight .currentSelection').click(function(){ //apri chiudi menu
              var ul = '#view .viewTop .highlight .currentSelection + ul';
              if($(ul).css('display')=='none') $(ul).css('display','block')
              else $(ul).css('display','none')
          });
      
          $('#view .viewTop .highlight li').click(function(){ //apri chiudi menu
             var ul = '#view .viewTop .highlight .currentSelection + ul';
             $(ul).css('display','none');
             self.changeColorCode($(this).attr('val'));
          });
      }

	 /* D.T. 10/01/2013 BEGIN */
	 var itemType = Application.getContestoSecondario().getItemType();
	 
	 /* END */
     //visualizza solo prima pagina
     $('.page').css('display','none');
     var pageOn = '#view #page'+this.currentpage;
     $(pageOn).css('display','block');
     $('#view table .item.on').click(function(){ sendLensRequest($(this).attr('idobj'), itemType)}); 
 
}

/*funzione per il release dei canvas
ATTENZIONE: manca da implementare lo stato del canvas*/
thumbView.prototype.releaseCanvas = function(){
    $('#view .viewTop .highlight .currentSelection').unbind();
    $('#view .viewTop .highlight li').unbind();
    $('#view .viewTop .highlight').html('');
    $('#view .legendaColore').remove();
    $('#view .index').remove();
    $('#view .legendaColore').remove();
    $('#view #thumbContainer').remove();
}

/*FUnzione di update*/
thumbView.prototype.updateCanvas = function(data){
      var self= this;
      $('#view .item').removeClass('on');
      $('#view .item').unbind();
      $('#view .item').css('border-color', $('#view').css('background-color'));
        
      for(var d=0; d<data.length; d++){
        var sel = '#view .item[idobj="'+data[d].id+'"]';
        $(sel).addClass('on');
        /* ATTENZIONE: patch per caricare le thumbnails in comfit */
        $(sel).css('border-color', eval('this._objects[data[d].id].'+this._highLight[this._currentHighlight]));
        $(sel).click(function(){ sendLensRequest($(this).attr('idobj'), Application.getContestoAttuale().getItemType());});
      }
      
      $('.pageNum').unbind(); 
       
       for(var w=0; w<this.pages; w++){
           var str = '#page'+(w+1)+" .on";
           var on = $(str).get();
           if(on.length>0){
                var str1='.goP'+(w+1);
                $(str1).css("font-weight","bold");     ////////////CSS PER HIGH LIGHT DI PAGINE CHE CONTENGONO ANCORA NARRAZZAZIONI
                $(str1).addClass('on');
                //$(str1).css("background-color","#70DB93");
                $(str1).click(function() {self.moveToPage($(this).attr('num'))}); //linkabili solo le pagine non vuote
                
                var str2 = str1 + ' .pageHisto';
                $(str2).css('display','block');
                
                var height = (20*on.length)/(this._settings.col*this._settings.row);
                if(height<1) {height=1;}
                var margintop = 20 - height;
                $(str2).css('height',height+'px');
                $(str2).css('width','10px');
                $(str2).css('background-color','white');
                $(str2).css('margin-left','4px');
                $(str2).css('margin-top',margintop+'px');
                
                var str3= str1 + " .val";
                if($(str1).attr('num')<10){ $(str3).css('margin-left','5px')}
           }
           else{
               var str1='.goP'+(w+1);
               $(str1).removeClass('on');
               $(str1).css("font-weight","normal");
                var str2 = str1 + ' .pageHisto';
                $(str2).css('display','block');
                $(str2).css('height','0px');
                $(str2).css('width','10px');
                $(str2).css('margin-left','4px');
                 $(str2).css('margin-top','20px');
            }
        }
        var strn = '.goP'+this.currentpage;
        $(strn).addClass('current');
        self.moveToPage(self.currentpage);
  
}

/*Funzione per il cambio del colore*/
thumbView.prototype.changeColorCode = function(index){
  if(this._currentHighlight != index){
        this._currentHighlight = index;
        var nodes = $('#view table .item').get();
        for(var t=0; t<nodes.length-1; t++){
            if($(nodes[t]).hasClass('on')){
                var id= $(nodes[t]).attr('idobj');
                var tmp = this._highLight[index].split('.');
                var C = '';
                if(tmp.length>1)  C = this._objects[id][tmp[1]]//C = eval('(this._objects[id]).'+tmp[1]);           
                //else C = eval('(this._objects[id]).'+this._highLight[index]);
                else C = this._objects[id][this._highLight[index]];
                $(nodes[t]).css('border-color',C);
            }
        }
        $('#view .highlight .currentSelection > span').html(this._highLabels[index]);
        var legC = '<span>'+this._settings.legendaColore+'</span>';
        for(i in this._mapsColors[this._currentHighlight]){
            legC = legC + '<span style="color:'+this._mapsColors[this._currentHighlight][i]+'">'+ i +'</span>'; 
        } 
        $('#view .legendaColore').html(legC);
  }
}

/*Funzione per passare ad altre pagine*/
thumbView.prototype.moveToPage = function(n){
	
   if(n>this.currentpage){cresce=true}
   if(n<1) {n= this.maxpage; cresce=false;}
   if(n>this.maxpage) {n=1; cresce=true}
   
   var sele= '.pageNum.goP'+n; 
   
   if($(sele).hasClass('on')){
        this.currentpage=n;
        if(this.currentpage==1){$('#view .index .num .prev').css('display','none');}
        else {$('#view .index .num .prev').css('display','block');}
        if(this.currentpage==this.maxpage){$('#view .index .num .next').css('display','none');}
        else {$('#view .index .num .next').css('display','inline');}
       $('div.page').css('display','none');
       $('div.page').removeClass('current');
       $('.pageNum.current').removeClass('current');
       $(sele).addClass('current');
       var selettore= '#page'+n;
       $(selettore).addClass('current');
       $(selettore).css('display','block');
    }
   else{
       if(cresce)this.moveToPage(parseInt(n)+1);
       else this.moveToPage(parseInt(n)-1);
    }
}
