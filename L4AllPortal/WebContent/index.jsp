<%@page import="it.unisalento.l4allportal.util.Util"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="java.io.File,
				com.google.gson.*,
				it.unisalento.l4allportal.dto.*,
				java.io.*,
				com.google.gson.stream.JsonReader,
				java.net.*,
				java.lang.*,
				java.util.*,
				java.util.Map.Entry" %>
<% 
	final int ITALIANO = 0;
	final int INGLESE = 1;
	
	int lingua = ITALIANO;
	String lang = request.getParameter("lang");
	if(lang==null) lang="it";
	else {
		if("it".equals(lang)) lingua = ITALIANO;
		else if("en".equals(lang)) {
			lingua = INGLESE;
		}
	}
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta http-equiv="x-ua-compatible" content="IE=9" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> 
    <meta name="google" value="notranslate"/>
    <META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE"/> 
    <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE"/>
	
	<!-- META tags di indicizzazione -->
	<META NAME="keywords" CONTENT="l4all, learning4all, learningforall, learningforall portal, learning4all portal, l4all portal, l4allportal.polimi.it">
	<META NAME="description" CONTENT="Portal with all the experiences of the Learning For All project">
    
    <!--Librerie varie di Google (grafici, mappe, jquery.min) -->
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyAZ4JBxqo876alKkqxW5OM10f5lQRKI5kc&sensor=false&language=it"> </script>

    <script type="text/javascript">
    	var customScript = [];
    </script>
    <!--Script che carica il framework -->
    <script src="framework/script/mainApi.js" charset="utf-8"></script>
    
    <!-- NOTA: Tutti gli alri script vengono caricatit da mainApi.js -->  
	
	<script type="text/javascript"><!--
    function ReplaceContentInContainer(id,content) {
    var container = document.getElementById(id);
    container.innerHTML = content;
    }
	//--></script>
    
	
    <title>L4ALL Portal</title>
    <link rel="stylesheet" type="text/css" href="style/l4all.css"/>
    <link rel="stylesheet" type="text/css" href="style/layout.css"/>
    
    <link rel="stylesheet" type="text/css" href="theme/css/ux_interface.css"/>
    

</head>
<body>
	<!-- VERSIONE: 3.1.1 - 18/02/2013 -->
	
    <!--Configurazione iniziale del framework -->
    <div role="collection" itemTypes="experience" loadAttrTitle="true" enablePDF="true" pdfServlet="http://hoc13.elet.polimi.it/pdf/l4all.php" 
    enableWishList="true"  enableSave="true" facetLimit="1000" enableOffline="true"  enableLogin="false"></div>
    <div role="solr_url" value="http://193.204.76.235:8080/edoc_solr/select/"></div> <!-- indirizzo del Server hoc5.elet.polimi.it -->
    <!-- <div role="rest_url" value="http://localhost:8080/l4allapp"></div>--> <!-- indirizzo dei servizi REST -->
    <!-- <div role="application_url" value="http://localhost:8080/l4all"></div>--> <!-- indirizzo dei servizi REST -->
    <div role="rest_url" value="http://193.204.76.235:8080/l4allapp"></div> <!-- indirizzo dei servizi REST -->
    <div role="application_url" value="http://localhost:8080/L4AllPortal"></div> <!-- indirizzo dell'applicazione -->
    <div role="enableRefraso" itemType="experience" string="Selezione attuale:" all="Tutte le esperienze"></div>  
 
    <!--Inizio design del layout a pannelli -->
    <div class="outer-center">
        <!------------------------------------------------------------  --> 
    	<!--CONTENITORE CENTRALE  convas primario, secondario e toolbar -->
        <!------------------------------------------------------------  --> 
        <div class="middle-center">
        
        	<!-- CANVAS HEADER toolbar -->
        	<!--<div class="ui-layout-north"> 
					possibilita di inserire qua l'header, da valutare nel montaggio grafica finale
            </div>-->
             
            <!--CANVAS PRIMARIO -->
            <div class="inner-center">
            	<!-- Header -->   
                <div id="banner">  
                  <a href="http://www.edocwork.it/"><img src="img/LogoEdoc_Vettoriale_Testo.png" style="height:50px;"></a>
                  <!--<div id="taxonomy-switcher"></div> -->  
                  <div class="float" style="float:right;">
                    <!--<img  onclick="window.location.href=window.location.href" class="clearAll" title="Torna alla stato iniziale" src="theme/images/clear_filters.png">-->
                   
                    <img  onclick="window.location.href=window.location.href" title="Ricarica la pagina" src="theme/images/refresh.png"/>
                  </div>
                </div>
                
                <!-- Contenitore della Canvas di visualizzazione -->    
                <div id="view">
                         
                         <div id="mosaicview"
                             role="canvas"
                             label="Mosaico"
                             viewClass="MosaicView"
                             hexpressions="LSco_s, ASco_s, Mreg_s" 
                             hlabel="Livello scolastico, Anno scolastico, Macro area geografica"
                             idNarr="id" 
                             row="20"
                             col="20"
                             title="label"
                             shape="livelloscolastico_s"
                             legendaShape="Livello scolastico:"
                             sortby="annoscolastico_i"
                             lenstype="experience"> 
                        </div>
                         
                         <div id="mapPalliniView"
                             role="canvas"
                             label="Mappa"
                             viewClass="MapView"
                             mapCenterLat="42.90816"
                             mapCenterLng="12.912597"
                             mapZoom="6"
                             proxy="region_s,area_s"
                             proxyLabel="Regione,Provincia"
                             proxyZoom="6,8"
                             proxyLookUp="area"
                             lat= "lat_s"
                             lng= "lng_s"
                             hexpressions="none,annoscolastico_s,livelloscolastico_s,format_s" 
                             hlabel="Nessun Highlight,Anno scolastico,Livello Scolastico,Format"                 
                             overlay="palle"
                             lenstype="experience"
                             > 
                        </div>
                        
                       <div id="mapCakeView"
                             role="canvas"
                             label="Mappa-Torte"
                             viewClass="MapView"
                             mapCenterLat="42.90816"
                             mapCenterLng="12.912597"
                             mapZoom="6"
                             proxy="region_s,area_s"
                             proxyLabel="Regione,Provincia"
                             proxyZoom="6,8"
                             proxyLookUp="area"
                             lat= "lat_s"
                             lng= "lng_s"
                             hexpressions="annoscolastico_s,livelloscolastico_s,format_s" 
                             hlabel="Anno scolastico, Livello Scolastico,Format"
                             overlay="pie"
                             lenstype="experience"
                             > 
                        </div>
                </div>   
                <!-- fine view--> 
            </div>
            
            <!--CANVAS SECONDARIO -->
            <!-- <div class="inner-east">CONVAS SECONDARIO</div> --> 
    
        </div> 
        <!--<div class="middle-east">CANVAS SECONDARIO</div> -->
    </div>
    
    <!------------------------------------  --> 
    <!--CONTENITORE DESTRA  accordion e tab -->
    <!------------------------------------  --> 
    <!--WIDGET--> 
    <div class="outer-east">
      <!--Accordion INIZIO-->
      <div id="accordion">
        <h3>ESPERIENZE</h3>
        <div itemType="experience">
          <!-- Tabs INIZIO-->
          <div id="tabs-experience" class="tabs">
            <ul>
              <li><a href="#tabs-1_experience">PARAMETRI</a></li>
              <li><a href="#tabs-2_experience">SALVA</a></li>
              <li><a href="#tabs-3_experience">GESTISCI</a></li>
              <li><a href="#tabs-4_experience">CARRELLO</a></li>
              <!--<li><a href="#tabs-5">DATASET</a></li>-->
            </ul>
            <div id="tabs-1_experience">
            
                <!-- Menu di esplorazione--> 
        <div id="menu_facet">
        
        	<div id="facet-toolbar_experience"  class="tab-toolbar"><img  class="clearAll" title="Elimina tutte le selezioni dei parametri" src="theme/images/clear-widget.png"  style="border-left:0.5px dotted #757575;"/></div>
        	
            <div id="facet_top">
                <div id="facet_description" class="wc" role="facet"  
                        facetClass="Cloud" 
                        widgetClass = "wc"
                        defaultNum="40" 
                        minNum="4" 
                        maxNum="12" 
                        defaultSortMode="alphabetic"
                        changeConj="true" 
                        expression="wordcloud_s" 
                        facetLabel="Wordcloud"
                        conj="one"
                        changeRendering="true"
                        defaultRendering="relative"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
           
      <%
      

			//File json = new File("JsonEdoc9Febbraio2016.txt");
      	  String json = Util.getInstance().readUrl("http://193.204.76.235:8080/EDOCPortal/"
                          + "JsonEdoc9Febbraio2016.txt");
	      Gson gson = new Gson();
	      //JsonReader reader = new JsonReader(json);
	      SchemaDTO schema = gson.fromJson(json, SchemaDTO.class);
	      ArrayList<ColumnDTO> cols = schema.getLayout().getColumns();
	      HashMap<String, ColumnDTO> divIDs = new HashMap<String, ColumnDTO>();
	      divIDs.put("facet_right", cols.get(2));
	      divIDs.put("facet_center", cols.get(1));
	      divIDs.put("facet_left", cols.get(0));

	      Iterator<Entry<String, ColumnDTO>> divs = divIDs.entrySet().iterator();
	      while(divs.hasNext()) {
	       	  Entry<String, ColumnDTO> entry = divs.next();
	       	  String id = entry.getKey();
	       	  ColumnDTO col = entry.getValue();
		      %>
		      <div id="<%=id %>">
			      	<% 
			      	
			      	Iterator<WidgetDTO> wdgts = col.getWidgets().iterator();
			      	while(wdgts.hasNext()) {
			      		WidgetDTO w=wdgts.next();
			      		Iterator<FacetDTO> fcts = w.getFacets().iterator();
			      		while(fcts.hasNext()) {
			      			FacetDTO f = fcts.next();
			      			ArrayList<String> fids = new ArrayList<String>();
			      			ArrayList<String> fids_lbl = new ArrayList<String>();
			      			ArrayList<Boolean> qmark=new ArrayList<Boolean>();
			      			if(f.getFacetValueIDs().get(0).getID().startsWith("?")) {
			      				Iterator<FacetValueIDDTO> pairs = f.getFacetValueIDs().iterator();
			      				while(pairs.hasNext()) {
			      					FacetValueIDDTO next = pairs.next();
			      					fids.add(next.getID().substring(1));
		      						//fids_lbl.add(next.getID().substring(1));
			      					fids_lbl.add(f.getLocalizedNames().get(lingua).getValue());
			      					qmark.add(true);
			      				}
			      			}
			      			
			      			else {
			      				fids.add(f.getId());
			      				fids_lbl.add(f.getLocalizedNames().get(lingua).getValue().replace("\"","'"));
		      					qmark.add(false);
// 			      				if(f.getLocalizedNames().get(1).getValue()!=null && !"".equals(f.getLocalizedNames().get(1).getValue()))
// 			      					fids_lbl.add(f.getLocalizedNames().get(1).getValue());
// 			      				else
// 			      					fids_lbl.add(f.getName());
			      			}
			      			Iterator<String> ff=fids.iterator();
			      			Iterator<String> ff_lbl=fids_lbl.iterator();
			      			Iterator<Boolean> qmark_i=qmark.iterator();
			      			while(ff.hasNext()) {
			      				String fid=Util.getInstance().normalizePropertyName(ff.next(), false);
			      				String lbl=ff_lbl.next();
			      				Boolean question=qmark_i.next();
				      			%>
				      			<div id="facet_<%=fid  %>"  class="tech" role="facet"  
			                        facetClass="Cloud"  
			                        widgetClass = "tech"
			                        changeConj="true" 
			                        defaultNum="7" 
			                        minNum="4" 
			                        maxNum="12" 
			                        collapsed="true"
			                        expression="<%=fid+(question?"":"_"+lang)+"_s" %>" 
			                        conj="one"
			                        facetLabel="<%=lbl %>"
			                        changeRendering="true"
			                        defaultRendering="absolute"
			                        refraso="true"
			                        itemType="experience">
			                    </div> 
				      			<%
				      			}
			      		}
		      		}
			    	%>
			  </div>
		<%}%>
	      		
	      

<%
 /*
 
 
                <div id="facet_right">
                    
                    
                    <div id="facet_techHardware"  class="tech" role="facet"  
                        facetClass="Cloud"  
                         widgetClass = "tech"
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        maxNum="12" 
                        collapsed="true"
                        expression="techH_s" 
                        conj="one"
                        facetLabel="Tecnologie Hardware"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div> 
                    <div id="facet_techSoftware"  class="tech" role="facet"  
                        facetClass="Cloud"  
                        widgetClass = "tech"
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        maxNum="12" 
                        collapsed="true"
                        expression="techS_s" 
                        conj="one"
                        facetLabel="Tecnologie Software"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div> 
                    <!-- 
                    <div id="facet_techScopo"  class="tech" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        widgetClass = "tech" 
                        minNum="4" 
                        maxNum="12" 
                        collapsed="true"
                        expression="scopotech_s" 
                        conj="one"
                        facetLabel="Scopo tecnologia"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div> 
                     -->
                    
                    <div id="facet_inclproblemi" class="incl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "incl"
                        maxNum="12" 
                        expression="problemi_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Problemi"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_inclstrategie" class="incl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "incl"
                        maxNum="12" 
                        expression="strategie_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Strategie"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    <!-- 
                    <div id="facet_incltiposol" class="incl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        widgetClass = "incl"
                        minNum="4" 
                        maxNum="12" 
                        expression="tiposoluzione_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Tipo di soluzione"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                     -->
                     
                    <div id="facet_organizzazione" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "impl"
                        maxNum="12" 
                        expression="contestourbano_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Organizzazione"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_risorseumane" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4"
                         widgetClass = "impl" 
                        maxNum="12" 
                        expression="risorseumane_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Risorse Umane"
						facetDescription="Chi è direttamente coinvolto nell&rsquo;esperienza"
						facetDescriptionWhy="Per capire lo sforzo necessario"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
						
                    </div>
                    
                    <div id="facet_aspettichiave" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                         widgetClass = "impl"
                        defaultNum="7" 
                        minNum="4" 
                        maxNum="12" 
                        expression="aspettichiave_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Aspetti chiave"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_attivita" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                         widgetClass = "impl"
                        maxNum="12" 
                        expression="attivita_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Attività"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_progettualita" class="impl" role="facet"
                         widgetClass = "impl"
                        facetClass="Cloud" 
                        expression="progettualita_s"  
                        histo="true" separator="true" 
                        collapsible="true"
                        scroll="false" 
                        collapsed="true"
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Design"
                        cat="progettualita" 
                        changeRendering="true"
                        defaultRendering="absolute"
                        changeConj="true" 
                        conj="or"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
                    
                    <!-- sostituito da gerarchico
                    <div id="facet_progettualita" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                         widgetClass = "impl"
                        maxNum="12" 
                        expression="progettualita_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Progettualità"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    -->
                    
                    
                    
                    <div id="facet_ruoli" role="facet"  
                        facetClass="Cloud"  
                        defaultNum="7" 
                        minNum="4" 
                        
                        maxNum="12" 
                        expression="ruoli_s" 
                        changeConj="True" 
                        conj="or"
                        collapsed="true"
                        facetLabel="Ruoli"
                        changeRendering="True"
                        defaultRendering="absolute"
                        enableSort="false"
                        defaultSortMode="alphabetic"
                        histo="True"
                        showNumber="True"
                        refraso="true"
                        itemType="experience">
                    </div>
                    <!-- momentaneamente nascosto per incoerenza dei dati!
                    <div id="facet_POF" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "impl" 
                        maxNum="12" 
                        expression="pof_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Inclusione nel POF"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    --> 
                    
                    
                     <div id="facet_IndiceAnalitico_experience" role="facet"  
                        facetClass="Cloud"  
                        defaultNum="7" 
                        minNum="4" 
                        
                        maxNum="12" 
                        expression="labelIndex_s" 
                        changeConj="false" 
                        conj="or"
                        collapsed="true"
                        facetLabel="Indice delle esperienze"
                        changeRendering="false"
                        defaultRendering="absolute"
                        enableSort="false"
                        defaultSortMode="alphabetic"
                        histo="false"
                        showNumber="false"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                </div>
                
                <div id="facet_center">
                	
                    <div id="facet_benCogn" class="ben" role="facet"
                         widgetClass = "ben"
                        facetClass="Cloud" 
                        expression="benCogn_s"  
                        histo="true" separator="true" 
                        collapsible="true"
                        scroll="false" 
                        collapsed="true"
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Benefici Cognitivi"
                        cat="beneficio" 
                        changeRendering="true"
                        defaultRendering="absolute"
                        changeConj="true" 
                        enableSelectAll="true"
                        conj="or"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
					
					<div id="facet_benMot" class="ben" role="facet"
                         widgetClass = "ben"
                        facetClass="Cloud" 
                        expression="benMot_s"  
                        histo="true" separator="true" 
                        collapsible="true"
                        scroll="false" 
                        collapsed="true"
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Benefici Motivazione"
                        cat="beneficio" 
                        changeRendering="true"
                        defaultRendering="absolute"
                        changeConj="true" 
                        enableSelectAll="true"
                        conj="or"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
					
					<div id="facet_benRel" class="ben" role="facet"
                         widgetClass = "ben"
                        facetClass="Cloud" 
                        expression="benRel_s"  
                        histo="true" separator="true" 
                        collapsible="true"
                        scroll="false" 
                        collapsed="true"
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Benefici Relazionali"
                        cat="beneficio" 
                        changeRendering="true"
                        defaultRendering="absolute"
                        changeConj="true" 
                        enableSelectAll="true"
                        conj="or"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
                    
					<div id="facet_benCom" class="ben" role="facet"
                         widgetClass = "ben"
                        facetClass="Cloud" 
                        expression="benCom_s"  
                        histo="true" separator="true" 
                        collapsible="true"
                        scroll="false" 
                        collapsed="true"
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Benefici Comunicativi"
                        cat="beneficio" 
                        changeRendering="true"
                        defaultRendering="absolute"
                        changeConj="true" 
                        enableSelectAll="true"
                        conj="or"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
					
					<div id="facet_benTech" class="ben" role="facet"
                         widgetClass = "ben"
                        facetClass="Cloud" 
                        expression="benTech_s"  
                        histo="true" separator="true" 
                        collapsible="true"
                        scroll="false" 
                        collapsed="true"
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Benefici Tecnologici"
                        cat="beneficio" 
                        changeRendering="true"
                        defaultRendering="absolute"
                        changeConj="true" 
                        enableSelectAll="true"
                        conj="or"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
                    
         
                     <div id="facet_ambiente_s" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "impl" 
                        maxNum="12" 
                        expression="ambiente_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Ambiente"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_tempi" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        widgetClass = "impl" 
                        minNum="4" 
                        maxNum="12" 
                        expression="tempi_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Quando"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <!--Sostituito da gerarchico sopra
                    <div id="facet_implIniziativa" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        widgetClass = "impl" 
                        minNum="4" 
                        maxNum="12" 
                        expression="iniziativa_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Iniziativa"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    -->	
                    <div id="facet_coinvolgimento" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "impl" 
                        maxNum="12" 
                        expression="coinvolgimento_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Coinvolgimento"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>

                    <div id="facet_curriculum" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "impl" 
                        maxNum="12" 
                        expression="curriculum_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Curriculum"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_valutazione" class="impl" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "impl" 
                        maxNum="12" 
                        expression="valutazione_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Programma"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                </div>
                
                <div id="facet_left">
                    
                    
                    <div id="facet_livellocolastico"  class="ogg" role="facet"  
                         widgetClass = "ogg"
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        maxNum="12" 
                        collapsed="true"
                        expression="livelloscolastico_s" 
                        conj="one"
                        facetLabel="Livello scolastico"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div> 
                    
                    
                    <div id="facet_disciplina" class="ogg" role="facet"
                         widgetClass = "ogg"
                        facetClass="Hierarchical" 
                        expression="disciplina_s"  
                        histo="true" 
                        separator="true" 
                        collapsible="true"
                        scroll="false" 
                        collapsed="true"
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Disciplina"
                        cat="disciplina" 
                        changeRendering="true"
                        defaultRendering="absolute"
                        changeConj="true" 
                        conj="and"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_contDisciplina2" class="ogg" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "ogg"
                        maxNum="12" 
                        expression="approccioDisciplinare_s" 
                        conj="and"
                        collapsed="true"
                        facetLabel="Mono / Multi disciplinarità"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    
                    <div id="facet_annoscolastico"  class="ogg" role="facet"  
                        facetClass="Cloud"  
                         widgetClass = "ogg"
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        maxNum="12" 
                        collapsed="true"
                        expression="annoscolastico_s" 
                        conj="one"
                        facetLabel="Anno scolastico"
                        changeRendering="true"
                        defaultRendering="absolute"
                        refraso="true"
                        itemType="experience">
                    </div> 
                    
                
                    <!-- <div id="facet_format" class="ogg" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        widgetClass = "ogg"
                        minNum="4" 
                        maxNum="12" 
                        expression="format_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Format o Iniziativa"
                        changeRendering="true"
                        defaultRendering="absolute"
                        enableSelectAll = "true"
                        refraso="true"
                        itemType="experience">
                    </div> --> 
                    
                    
                    <div id="facet_format" class="ogg" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                         widgetClass = "ogg"
                        minNum="4" 
                        maxNum="12" 
                        expression="format_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Format"
                        changeRendering="true"
                        defaultRendering="absolute"
                        enableSelectAll = "true"
                        refraso="true"
                        itemType="experience">
                    </div> 
					
					 <div id="facet_implIniziativa" class="ogg" role="facet"
                         widgetClass = "ogg"
                        facetClass="Cloud" 
                        expression="iniziativa_s"  
                        histo="true" separator="true" 
                        collapsible="true"
                        scroll="false" 
                        collapsed="true"
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Iniziativa"
                        cat="iniziativa" 
                        changeRendering="true"
                        defaultRendering="absolute"
                        changeConj="true" 
                        conj="or"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_area" class="ogg" role="facet"
                        facetClass="Hierarchical" 
                        expression="areaHier_s"  
                        changeConj="true" 
                        conj="one"
                        histo="true" separator="true" 
                        collapsible="true"
                         widgetClass = "ogg"
                        scroll="false" 
                        refraso="true" 
                        collapsed="true"
                        facetLabel="Area geografica"
						
                        cat="area" 
                        
                        enableSort="false"
                        defaultSortMode="fixed"
                        fixedOrd="nord,centro,sud,isole"
                        
                        changeRendering="true"
                        defaultRendering="absolute"
                        uniformGrouping=".inside_s"
                        itemType="experience">
                    </div>
                    
                     <div id="facet_contUrbano" class="cont" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "cont"
                        maxNum="12" 
                        expression="organizzazione_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Contesto urbano"
                        changeRendering="true"
                        defaultRendering="absolute"
                        
                        enableSort="false"
                        defaultSortMode="fixed"
                        fixedOrd="basso,medio,alto"
                        
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_contSE" class="cont" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "cont"
                        maxNum="12" 
                        expression="contestosocioeconomico_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Contesto socio-economico"
                        changeRendering="true"
                        defaultRendering="absolute"
                        
                        enableSort="false"
                        defaultSortMode="fixed"
                        fixedOrd="basso,medio,alto"
                        
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_contLClasse" class="cont" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "cont"
                        maxNum="12" 
                        expression="livelloclasse_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Livello classe"
                        changeRendering="true"
                        defaultRendering="absolute"
                        
                        enableSort="false"
                        defaultSortMode="fixed"
                        fixedOrd="basso,medio,altro"
                        
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    <div id="facet_contLAllievi" class="cont" role="facet"  
                        facetClass="Cloud"  
                        changeConj="true" 
                        defaultNum="7" 
                        minNum="4" 
                        widgetClass = "cont"
                        maxNum="12" 
                        expression="livelloallievi_s" 
                        conj="one"
                        collapsed="true"
                        facetLabel="Livello allievi"
                        changeRendering="true"
                        defaultRendering="absolute"
                        
                        enableSort="false"
                        defaultSortMode="fixed"
                        fixedOrd="molto disomogeneo,disomogeneo,molto omogeneo"
                        
                        refraso="true"
                        itemType="experience">
                    </div>
                    
                    
                    
           </div>
 
 */
%>
 
      </div>
      </div>

            
            </div>
            <div id="tabs-2_experience">
            
            METTER QUI I SALVATAGGI
            
            </div>
            <div id="tabs-3_experience">
            
            METTERE QUI APERTURE
            
            </div>
            <div id="tabs-4_experience">
            
            METTERE QUI IL CARRELLO
            
            </div>
          </div>
          <!-- Tabs FINE -->
        </div>
        
      </div> 
      <!--Accordion FINE-->   
    </div>
     
    </div> 
    <!------------------------------------  --> 
    <!--CONTENITORE BOTTOM  footer          -->
    <!------------------------------------  --> 
    <!--<div class="ui-layout-south">EVENTUALE FOOTER</div> -->


    <!------------------------------------  --> 
    <!--CODICE FINESTRE DETTAGLIO           -->
    <!------------------------------------  -->    
    <!--Lens: modello delle finestre di dettaglio -->
   <div id="lensExperience" class="lens" role="lens"  enableCheckList="true" itemtype="experience">
        <div class="container" val-content="id">
           
           	<div>
				<div class="lens_title_color" if-exist="scuola_s"><span class="scuola" content="scuola_s"></span><span> - </span><span class="area" content="areaLabel_s"></div>
                <div class="title" content="label"></div>
                <div if-exist="format_s"><span class="format" content="format_s"></span></div>
                <div if-exist="livelloscolastico_s"><span class="livello" content="livelloscolastico_s"></span></div>
                <div if-exist="annoscolastico_s"><span class="anno" content="annoscolastico_s"></span></div>
               
                <div class="more">
                    <div class='bott'>
                        <!-- <div if-exist="abstract_s">
						<div class="buttonDescr openOnClick" openOnClick="true" type="read" dest="div_descr" openLabel=" Leggi abstract" closeLabel=" Chiudi abstract"></div>
						</div> -->
                        <div><div class="buttonLink openOnClickLens" openOnClick="true" type="read" dest="div_link" openLabel=" Link al materiale" closeLabel=" Nascondi link"></div></div>
                    </div>
                </div>
            </div>
            
            <div class="boxes">
                <div class="short" content="short_s"></div>
				<div class="div_sino box" value="div_sino" hide="false">Sinossi</div>
                <div class="div_descr box" value="div_descr" content="abstract_s" hide="false"></div>
                <div class="div_link box" value="div_link" hide="true">
                    <div>Link al materiale:</div>
                    <div class="body link_s" externalObj="true" idField="link_s" fieldFKey="esperieza_sSingle" fieldFLKey="link_sSingle,titolo_sSingle,descrizione_sSingle,formato_sSingle" externalCat="link" externalKey="id" sortby="zindex_i%20asc">
                        <div></div><!-- IL COD HTML QUI DENTRO è HARDCODED-->
                    </div>
                </div>
                
                <div if-exist="scuola_s"><span class="scuola"></span><span></span><span class="area"></div>
            </div>
        </div>
   </div>
   
</body>    
</html>