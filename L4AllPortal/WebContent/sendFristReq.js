function sendFirstRequest(){
	Application.updateQueryParams();
    var strData = query_params.join('&');
    
    /* DT Begin */
    $.log("[sendFirstRequest()] strData = " + strData);
    /* DT End */
    
    //la predizione consiste nel costruire la query di SOLR in modo tale che nel calcolo
    //dei facet vengano presi in considerazione anche gli elementi che nn soddisfano il vincolo
    //sul field specifico: IMPORTANTE PER STIMAREI VALORI POTENZIALI NEL CASO DI OR
    var queryPrediction = [];
    for(var p=0; p< facets.length; p++){
        var tmp = facets[p].getPrediction();
        if(tmp!=null) queryPrediction.push(tmp);
    }
    var strPrediction = queryPrediction.join('&');
    
    var canvas_query_params = [];
    canvas_query_params = canvas_query_params.concat(canvas[currentCanvasIndex].fieldParams()); //RECUPERA DAL CANVAS ATTUALE I FIELD DI SOLR CHE SERVONO PER LA SUA COSTRUZIONE
    
    if(queryPrediction.length>0){ strData = strData + '&' + strPrediction };
    if(canvas_query_params.length>0){strData = strData + "&fl="+canvas_query_params.join(',')}
    if(canvas[currentCanvasIndex].sortBy()!=null){
        strData = strData + canvas[currentCanvasIndex].sortBy();
    }
    /*INVIA LA CHIAMATA AJAX*/
    $.ajax({
      url: solrServer,
      data: strData,
      dataType: 'jsonp',
      success: buildPage,
      jsonp: 'json.wrf'
    });
}