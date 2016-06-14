
thumbView = function(containerElmt,expression) {
    //variabili
};

thumbView._settingSpecs = {
    //CONTIENE I PARAMETRI PASSATI DAL DOM
};

thumbView.prototype.sortBy = function(){
    //FUNZIONE PER EVENTUALE SORTING NELLA VISUALIZZAZIONE
    //eventualmente ritorna stringa vuota
}

thumbView.prototype.fieldParams = function(){
  //PROPRIETà CHE DEVONO ESSERE CARICATI DA SOLR PER OGNI OGGETTO
}

thumbView.prototype.buildCanvas = function(data){       
  //COSTRUISCI LO SCHELETRO COMPLETO DEL CANVAS  
}


thumbView.prototype.displayCanvas = function(data){
  //VISUALIZZALO
}


thumbView.prototype.releaseCanvas = function(){
  //CANCELLA IL CANVAS PER PASSAGGIO AL PROSSIMO
}

thumbView.prototype.updateCanvas = function(data){
  //FUNZIONE DI UPDATE (SE POSSIBILE COME ACCENSIONE E SPEGNIMENTO)
}


thumbView.prototype.changeColorCode = function(index){
  //cambio dell'highlight (solo uso interno alla classe)
}
