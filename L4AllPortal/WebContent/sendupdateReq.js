function sendUpdateRequest(){
    if(online){
    	// D.T. Begin
    	Application.updateQueryParams();
    	// D.T. End
    	startloader();
        var strData = query_params.join('&');
        var queryPrediction = [];
        for(var p=0; p< facets.length; p++){
            var tmp = facets[p].getPrediction();
            if(tmp!=null) queryPrediction.push(tmp);
        }
        var strPrediction = queryPrediction.join('&');
        /* DT Begin */
	    $.log("[sendUpdateRequest()] strPrediction = " + strPrediction);
	    /* DT End */
        var canvas_query_params = canvas[currentCanvasIndex].fieldParams(); 
        if(queryPrediction.length>0){ strData = strData + '&' + strPrediction };
        if(canvas_query_params.length>0){strData = strData + "&fl="+canvas_query_params.join(',')}
        
        /*Novita rispetto alla chiamata precedente: qui ci sono i parametri che definiscono i vincoli della query*/
        var fqParams = getFQParams();
        if(fqParams.length>0){ strData = strData + "&" + fqParams.join('&');}
        if(canvas[currentCanvasIndex].sortBy()!=null){
            strData = strData + canvas[currentCanvasIndex].sortBy();
        }
        $.ajax({
          url: solrServer,
          data: strData,
          dataType: 'jsonp',
          success: updatePage,
          jsonp: 'json.wrf'
        });
    }
}