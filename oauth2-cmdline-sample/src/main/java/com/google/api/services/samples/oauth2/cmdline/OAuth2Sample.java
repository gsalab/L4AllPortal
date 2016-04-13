/*
 * Copyright (c) 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package com.google.api.services.samples.oauth2.cmdline;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.store.DataStoreFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.oauth2.Oauth2;
import com.google.api.services.oauth2.model.Tokeninfo;
import com.google.api.services.oauth2.model.Userinfoplus;
import com.google.gdata.client.spreadsheet.SpreadsheetService;
import com.google.gdata.data.spreadsheet.ListEntry;
import com.google.gdata.data.spreadsheet.ListFeed;
import com.google.gdata.data.spreadsheet.SpreadsheetEntry;
import com.google.gdata.data.spreadsheet.SpreadsheetFeed;
import com.google.gdata.data.spreadsheet.WorksheetEntry;
import com.google.gdata.data.spreadsheet.WorksheetFeed;
import com.google.gson.Gson;

import it.unisalento.l4allportal.dto.AttachmentDTO;
import it.unisalento.l4allportal.dto.AttachmentsDTO;
import it.unisalento.l4allportal.dto.ColumnDTO;
import it.unisalento.l4allportal.dto.FacetDTO;
import it.unisalento.l4allportal.dto.FacetIDValuePair;
import it.unisalento.l4allportal.dto.FacetValueDTO;
import it.unisalento.l4allportal.dto.FacetValueIDDTO;
import it.unisalento.l4allportal.dto.LayoutDTO;
import it.unisalento.l4allportal.dto.LocalizedFacetNameDTO;
import it.unisalento.l4allportal.dto.LocalizedFacetValueDTO;
import it.unisalento.l4allportal.dto.LocalizedWidgetNameDTO;
import it.unisalento.l4allportal.dto.SchemaDTO;
import it.unisalento.l4allportal.dto.WidgetDTO;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

/**
 * Command-line sample for the Google OAuth2 API described at <a
 * href="http://code.google.com/apis/accounts/docs/OAuth2Login.html">Using OAuth 2.0 for Login
 * (Experimental)</a>.
 *
 * @author Yaniv Inbar
 */
public class OAuth2Sample {
   
  /**
   * Be sure to specify the name of your application. If the application name is {@code null} or
   * blank, the application will log a warning. Suggested format is "MyCompany-ProductName/1.0".
   */
  private static final String APPLICATION_NAME = "";

  /** Directory to store user credentials. */
  /*private static final java.io.File DATA_STORE_DIR =
      new java.io.File(System.getProperty("user.home"), ".store/oauth2_sample");*/
  private static final java.io.File DATA_STORE_DIR =
      new java.io.File(System.getProperty("user.home"), "");
  
  /**
   * Global instance of the {@link DataStoreFactory}. The best practice is to make it a single
   * globally shared instance across your application.
   */
  private static FileDataStoreFactory dataStoreFactory;

  /** Global instance of the HTTP transport. */
  private static HttpTransport httpTransport;

  /** Global instance of the JSON factory. */
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

  /** OAuth 2.0 scopes. */
  private static final List<String> SCOPES = Arrays.asList(
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://docs.google.com/feeds", 
      "https://spreadsheets.google.com/feeds",
      "https://www.googleapis.com/auth/drive.appfolder");

  private static Oauth2 oauth2;
  private static GoogleClientSecrets clientSecrets;

  /** Authorizes the installed application to access user's protected data. */
  private static Credential authorize() throws Exception {
    // load client secrets
    clientSecrets = GoogleClientSecrets.load(JSON_FACTORY,
        new InputStreamReader(OAuth2Sample.class.getResourceAsStream("/client_secrets.json")));
    if (clientSecrets.getDetails().getClientId().startsWith("Enter")
        || clientSecrets.getDetails().getClientSecret().startsWith("Enter ")) {
      System.out.println("Enter Client ID and Secret from https://code.google.com/apis/console/ "
          + "into oauth2-cmdline-sample/src/main/resources/client_secrets.json");
      System.exit(1);
    }
    // set up authorization code flow
    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
        httpTransport, JSON_FACTORY, clientSecrets, SCOPES).setDataStoreFactory(
        dataStoreFactory).build();
    
    /*GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
        httpTransport, JSON_FACTORY, clientSecrets,  Arrays.asList(DriveScopes.DRIVE, Oauth2Scopes.USERINFO_EMAIL, Oauth2Scopes.USERINFO_PROFILE)).setDataStoreFactory(
        dataStoreFactory).build();*/
    // authorize
    return new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver()).authorize("user");
  }

  public static void main(String[] args) {
    try {
      httpTransport = GoogleNetHttpTransport.newTrustedTransport();
      dataStoreFactory = new FileDataStoreFactory(DATA_STORE_DIR);
      // authorization
      Credential credential = authorize();  
      // credential.refreshToken();
      // set up global Oauth2 instance
      oauth2 = new Oauth2.Builder(httpTransport, JSON_FACTORY, credential).setApplicationName(
          APPLICATION_NAME).build();
      // run commands
      tokenInfo(credential.getAccessToken());
      userInfo();
      
   // create the service and pass it the credentials you created earlier
      SpreadsheetService service = new SpreadsheetService("EP2");
      service.setProtocolVersion(SpreadsheetService.Versions.V3);
      service.setOAuth2Credentials(credential);
    
      URL SPREADSHEET_FEED_URL =
          new URL("https://spreadsheets.google.com/feeds/spreadsheets/private/full");
     // Make a request to the API and get all spreadsheets.
     SpreadsheetFeed feed = service.getFeed(SPREADSHEET_FEED_URL, SpreadsheetFeed.class);
     List<SpreadsheetEntry> spreadsheets = feed.getEntries();
     // Iterate through all of the spreadsheets returned
     
     for (SpreadsheetEntry spreadsheet : spreadsheets) {
     // Print the title of this spreadsheet to the screen
     System.out.println(spreadsheet.getTitle().getPlainText());
      }
     
      //***START GESTIONE FILE ESPERIENZE***//
      // Choose a spreadsheet more intelligently based on your app's needs.
      SpreadsheetEntry spreadsheet = spreadsheets.get(2);
      System.out.println(" ");
      System.out.println(spreadsheet.getTitle().getPlainText());
      System.out.println(" ");
      System.out.println("Worksheet");
      
      // Make a request to the API to fetch information about all worksheets in the spreadsheet.
      List<WorksheetEntry> worksheets = spreadsheet.getWorksheets();
      
      // Iterate through each worksheet in the spreadsheet.
      for (WorksheetEntry worksheet : worksheets) {
        // Get the worksheet's title, row count, and column count.
        String title = worksheet.getTitle().getPlainText();
        int rowCount = worksheet.getRowCount();
        int colCount = worksheet.getColCount();
        // Print the fetched information to the screen for this worksheet.
        System.out.println("\t" + title + "- rows:" + rowCount + " cols: " + colCount);
      }      
      System.out.println(" ");
      System.out.println("Feed");
      // Get the first worksheet of the first spreadsheet.
      // Choose a worksheet more intelligently based on your app's needs.
      WorksheetFeed worksheetFeed = service.getFeed(
      spreadsheet.getWorksheetFeedUrl(), WorksheetFeed.class);
      List<WorksheetEntry> worksheetsf = worksheetFeed.getEntries();
 
      final int ID_FOGLIO_WIDGET = 2;
      final int[] FOGLIO_WIDGET_COLONNE_IDWIDGETS = new int[] {0, 2, 4};
      final int RIGA_TAGS_FOGLI_DEFINE = 2;
      final int RIGA_START_FACET = 4;
      
      //Costruisco la mappa dei fogli del file
      HashMap<String, WorksheetEntry> mappa=new HashMap<String, WorksheetEntry>();
      for(WorksheetEntry entry:worksheetsf)
      mappa.put(entry.getTitle().getPlainText(), entry);
      
      //prendo il foglio WIDGET che contiene le colonne
      WorksheetEntry widget = worksheetsf.get(ID_FOGLIO_WIDGET);
      //all'interno di questo foglio, prendo le colonne che contengono gli id dei widget
      ArrayList<ColumnDTO> columns = new ArrayList<ColumnDTO>();
      SchemaDTO schemadto=new SchemaDTO();
      LayoutDTO layoutdto=new LayoutDTO();
      
      for(int i:FOGLIO_WIDGET_COLONNE_IDWIDGETS) {
        ColumnDTO columndto=new ColumnDTO();
        URL listFeedUrl = widget.getListFeedUrl();
        ListFeed listFeed = service.getFeed(listFeedUrl, ListFeed.class);
        List<ListEntry> le=listFeed.getEntries();
        Object[] tags=le.get(2).getCustomElements().getTags().toArray();

        ArrayList<WidgetDTO> widgets = new ArrayList<WidgetDTO>();
        for(int k=2; k<le.size();k++) {
          String w=le.get(k).getCustomElements().getValue(tags[i].toString());
          String n=le.get(k).getCustomElements().getValue(tags[i+1].toString());
          if(w!=null) {
            System.out.println("Creo widget con id "+w+ " e nome "+n);
            WidgetDTO widgetdto=new WidgetDTO();
            widgetdto.setId(w);
            widgetdto.setName(n);       
            //widgetdto.setColor(color);
            //widgetdto.setFont(font);         
            widgets.add(widgetdto);
     
            //Per capire il layout del facet prendo il foglio DEFINE corrispondente al CODICE WIDGET 
            String nomeFoglio="DEFINE "+w;
            WorksheetEntry define=mappa.get(nomeFoglio);
            System.out.println("Nome foglio Define widget:"+nomeFoglio);
           
            URL listFeedUrl2 = define.getListFeedUrl();
            ListFeed listFeed2 = service.getFeed(listFeedUrl2, ListFeed.class);
            List<ListEntry> le2=listFeed2.getEntries();

            Object[] tags2=le2.get(RIGA_TAGS_FOGLI_DEFINE).getCustomElements().getTags().toArray();
            
            //prendo dati LOCALIZZAZIONE WIDGET
            final int RIGA_START_LOCAL = 2;
            ArrayList<LocalizedWidgetNameDTO> localizedNames = new ArrayList<LocalizedWidgetNameDTO>();          
            for(int lw=8;lw<tags2.length;lw++) {         
            LocalizedWidgetNameDTO loc=new LocalizedWidgetNameDTO();
            String lang =le2.get(RIGA_START_LOCAL).getCustomElements().getValue(tags2[lw].toString()); 
            String value=le2.get(RIGA_START_LOCAL+1).getCustomElements().getValue(tags2[lw].toString());
            System.out.println("loc widget:"+lang+" "+value);
            if(lang!=null) {           
              loc.setLang(lang);
              loc.setValue(value);
              localizedNames.add(loc);
            }          
            }
            widgetdto.setLocalizedNames(localizedNames);
           
            //FACET   
            try{
            ArrayList<FacetDTO> facets= new ArrayList<FacetDTO>();
            for(int z=0;z<le2.size()-RIGA_START_FACET;z++) {
              String id=le2.get(RIGA_START_FACET+z).getCustomElements().getValue(tags2[0].toString());
              String facet=le2.get(RIGA_START_FACET+z).getCustomElements().getValue(tags2[1].toString());
              if(id==null) continue;      
              FacetDTO facetdto=new FacetDTO();
              facetdto.setId(id);
              facetdto.setName(facet);
              //prendo dati VISUALIZZAZIONE FACET
              boolean abs="x".equalsIgnoreCase(le2.get(RIGA_START_FACET+z).getCustomElements().getValue(tags2[3].toString()));
              boolean hist="x".equalsIgnoreCase(le2.get(RIGA_START_FACET+z).getCustomElements().getValue(tags2[4].toString()));
              boolean percent="x".equalsIgnoreCase(le2.get(RIGA_START_FACET+z).getCustomElements().getValue(tags2[5].toString()));
              boolean WC="x".equalsIgnoreCase(le2.get(RIGA_START_FACET+z).getCustomElements().getValue(tags2[6].toString()));
              boolean list="x".equalsIgnoreCase(le2.get(RIGA_START_FACET+z).getCustomElements().getValue(tags2[7].toString()));
              facetdto.setVisualizationAbs(abs);
              facetdto.setVisualizationHist(hist);
              facetdto.setVisualizationList(list);
              facetdto.setVisualizationPercent(percent);
              facetdto.setVisualizationWC(WC);
              facets.add(facetdto);
              System.out.println("Creo facet con ID "+id+" - name "+facet+" - dati visualizzazione: abs="+abs+", hist="+hist+", %="+percent+", WC="+WC+", list="+list);
              //prendo dati LOCALIZZAZIONE FACET
              ArrayList<LocalizedFacetNameDTO> localizedNamesfacet = new ArrayList<LocalizedFacetNameDTO>();
              for(int lf=8;lf<tags2.length;lf++) {         
                LocalizedFacetNameDTO loc=new LocalizedFacetNameDTO();
                String lang =le2.get(RIGA_START_LOCAL).getCustomElements().getValue(tags2[lf].toString()); 
                String value=le2.get(RIGA_START_FACET+z).getCustomElements().getValue(tags2[lf].toString());
                System.out.println("loc facet:"+lang+" "+value);
                if(lang!=null) {           
                  loc.setLang(lang);
                  loc.setValue(value);
                  localizedNamesfacet.add(loc);
                }          
              }
             facetdto.setLocalizedNames(localizedNamesfacet);
             //prendo VALUEID FACET
             ArrayList<FacetValueIDDTO> facetValueIDs =new  ArrayList<FacetValueIDDTO>();
             for(int t=RIGA_START_FACET+z+1;t<le2.size();t++) {
               FacetValueIDDTO facetvalueiddto = new FacetValueIDDTO();         
               if(le2.get(t).getCustomElements().getValue(tags2[0].toString())!=null) break;
               String valueId = le2.get(t).getCustomElements().getValue(tags2[2].toString());          
               System.out.println("Creo valueId per facet valueid= "+valueId);
               ArrayList<LocalizedFacetValueDTO> localizedValues = new ArrayList<LocalizedFacetValueDTO>();
               if(!valueId.startsWith("?")) {
               //prendo dati LOCALIZZAZIONE VALUEID FACET
                for(int lv=8;lv<tags2.length;lv++) {         
                   LocalizedFacetValueDTO loc=new LocalizedFacetValueDTO();
                   String lang =le2.get(RIGA_START_LOCAL).getCustomElements().getValue(tags2[lv].toString()); 
                   String value=le2.get(t).getCustomElements().getValue(tags2[lv].toString());
                   System.out.println("loc valueId:"+lang+" "+value);
                   if(lang!=null) {           
                     loc.setLang(lang);
                     loc.setValue(value);
                     localizedValues.add(loc);                            
                   }          
                   }               
               }          
               facetvalueiddto.setID(valueId);
               facetvalueiddto.setLocalizedValues(localizedValues);
               facetValueIDs.add(facetvalueiddto);
             }
              facetdto.setFacetValueIDs(facetValueIDs);
              
            //Per avvalorare i dati del facet prendo il foglio W corrispondente al CODICE WIDGET
            String nomeFoglioDati= w +" "+n;
            WorksheetEntry dati=mappa.get(nomeFoglioDati);
            System.out.println("Nome foglio dati widget:"+nomeFoglioDati);
             
            URL listFeedUrldati = dati.getListFeedUrl();
            ListFeed listFeeddati = service.getFeed(listFeedUrldati, ListFeed.class);
            List<ListEntry> ledati=listFeeddati.getEntries();

            final int RIGA_TAGS_FOGLI_DATI = 1;
            final int RIGA_START_DATI =1;
            Object[] tagsdati=ledati.get(RIGA_TAGS_FOGLI_DATI).getCustomElements().getTags().toArray();
           
            try{
               ArrayList<FacetValueDTO> facetvalues = new ArrayList<FacetValueDTO>();
               //prendo ID ESPERIENZA
               for(int lfv=3; lfv<tagsdati.length; lfv++){
                 FacetValueDTO facetvalue = new FacetValueDTO(); 
                 String ExpId=ledati.get(RIGA_START_DATI).getCustomElements().getValue(tagsdati[lfv].toString());
                 if(ExpId!=null) {           
                   facetvalue.setExperienceID(ExpId);   
                } 
                //prendo VALUEID e VALUE del FACET per ogni ESPERIENZA
                 ArrayList<FacetIDValuePair> values = new ArrayList<FacetIDValuePair>(); 
                 for(int y=RIGA_START_DATI+z+1;y<ledati.size()-RIGA_START_DATI;y++) {
                   FacetIDValuePair value = new FacetIDValuePair();  
                   if(ledati.get(y+1).getCustomElements().getValue(tagsdati[0].toString())!=null) break;
                   String fvalueid =ledati.get(RIGA_START_DATI+y).getCustomElements().getValue(tagsdati[2].toString());
                   String fvalue =ledati.get(RIGA_START_DATI+y).getCustomElements().getValue(tagsdati[lfv].toString());
                   if(fvalueid==null) continue;
                   value.setFacetValueID(fvalueid);
                   value.setFacetValue(fvalue);
                   values.add(value);
                   System.out.println("ExpId= "+ExpId+" - "+fvalueid+"= "+fvalue);    
                 } 
                 facetvalue.setValues(values);
                 facetvalues.add(facetvalue);    
               }
               facetdto.setFacetvalues(facetvalues);
             }
             catch(IndexOutOfBoundsException e) {
               e.printStackTrace();
               }        
            }//chiudo for FACET     
            widgetdto.setFacets(facets);
            }//chiudo try FACET
             catch(IndexOutOfBoundsException e) {
              e.printStackTrace();
              }
          }
        }
        columndto.setWidgets(widgets); 
        columns.add(columndto);
     }
      //***FINE GESTIONE FILE ESPERIENZE***//
     
      //***START GESTIONE FILE ALLEGATI***//
      SpreadsheetEntry spreadsheet1 = spreadsheets.get(0);
      System.out.println(" ");
      System.out.println(spreadsheet1.getTitle().getPlainText());
      System.out.println(" ");
      System.out.println("Worksheet");
      // Make a request to the API to fetch information about all worksheets in the spreadsheet.
      List<WorksheetEntry> worksheets1 = spreadsheet1.getWorksheets();
      // Iterate through each worksheet in the spreadsheet.
      for (WorksheetEntry worksheet : worksheets1) {
        // Get the worksheet's title, row count, and column count.
        String title = worksheet.getTitle().getPlainText();
        int rowCount = worksheet.getRowCount();
        int colCount = worksheet.getColCount();
        // Print the fetched information to the screen for this worksheet.
        System.out.println("\t" + title + "- rows:" + rowCount + " cols: " + colCount);
      }      
      System.out.println(" ");
      System.out.println("Feed");
      // Get the first worksheet of the first spreadsheet.
      // Choose a worksheet more intelligently based on your app's needs.
      WorksheetFeed worksheetFeed1 = service.getFeed(
      spreadsheet1.getWorksheetFeedUrl(), WorksheetFeed.class);
      List<WorksheetEntry> worksheetsf1 = worksheetFeed1.getEntries();

      final int ID_FOGLIO_LEGENDA = 0;
      final int ID_FOGLIO_ALLEGATI = 1;
      
      HashMap<String, WorksheetEntry> mappaallegati=new HashMap<String, WorksheetEntry>();
      for(WorksheetEntry entry:worksheetsf1) 
      mappaallegati.put(entry.getTitle().getPlainText(), entry);
      
      //prendo il foglio che contiene gli allegati
      WorksheetEntry allegati = worksheetsf1.get(ID_FOGLIO_ALLEGATI);
      WorksheetEntry datiallegati=mappaallegati.get(allegati.getTitle().getPlainText());
      System.out.println("Nome foglio:"+allegati.getTitle().getPlainText());
      URL listFeedUrlallegati = datiallegati.getListFeedUrl();
      ListFeed listFeedallegati = service.getFeed(listFeedUrlallegati, ListFeed.class);
      List<ListEntry> leallegati=listFeedallegati.getEntries();

      final int RIGA_TAGS_FOGLI_ALLEGATI = 1;
      final int RIGA_START_ALLEGATI =1;
      Object[] tagsallegati=leallegati.get(RIGA_TAGS_FOGLI_ALLEGATI).getCustomElements().getTags().toArray();
      ArrayList<AttachmentsDTO> Listallegatidto = new ArrayList<AttachmentsDTO>();
      try{
         //prendo id esperienza
         for(int lav=2; lav<tagsallegati.length; lav++){
           AttachmentsDTO allegatidto =new AttachmentsDTO();
           String ExpId=leallegati.get(RIGA_START_ALLEGATI).getCustomElements().getValue(tagsallegati[lav].toString());
           if(ExpId!=null) {           
             allegatidto.setExperienceName(ExpId);
             String school =leallegati.get(2).getCustomElements().getValue(tagsallegati[lav].toString());
             allegatidto.setSchool(school);
             String city =leallegati.get(3).getCustomElements().getValue(tagsallegati[lav].toString());
             allegatidto.setCity(city);
             String province =leallegati.get(4).getCustomElements().getValue(tagsallegati[lav].toString());
             allegatidto.setProvince(province);
             String experienceTitle =leallegati.get(5).getCustomElements().getValue(tagsallegati[lav].toString());
             allegatidto.setExperienceTitle(experienceTitle);
             String schoolLevel =leallegati.get(6).getCustomElements().getValue(tagsallegati[lav].toString());
             allegatidto.setSchoolLevel(schoolLevel);
             String shortResume = leallegati.get(7).getCustomElements().getValue(tagsallegati[lav].toString());
             allegatidto.setShortResume(shortResume);
             
             System.out.println("ExpId= "+ExpId+" scuola= "+school+", città= "+city+", province= "+province+", titolo esperienza= "+experienceTitle+", livello scolastico= "+schoolLevel);
          } 
          //prendo value id e value per ogni esperienza
           ArrayList<AttachmentDTO> Listallegatodto = new ArrayList<AttachmentDTO>(); 
           for(int y=RIGA_START_ALLEGATI+7;y<leallegati.size()-RIGA_START_ALLEGATI;y++) {
             AttachmentDTO allegatodto = new AttachmentDTO();  
             //if(leallegati.get(y+1).getCustomElements().getValue(tagsallegati[0].toString())!=null) break;
             String atype = leallegati.get(RIGA_START_ALLEGATI+y).getCustomElements().getValue(tagsallegati[0].toString());
             String avalueid =leallegati.get(RIGA_START_ALLEGATI+y).getCustomElements().getValue(tagsallegati[1].toString());
             String avalue =leallegati.get(RIGA_START_ALLEGATI+y).getCustomElements().getValue(tagsallegati[lav].toString());
             if(avalueid==null) continue;
             allegatodto.setType(atype);
             allegatodto.setName(avalueid);
             allegatodto.setValue(avalue);
             Listallegatodto.add(allegatodto);
             System.out.println("ExpId= "+ExpId+" - type= "+atype+" - "+avalueid+"= "+avalue);    
           }//chiudo for  
           allegatidto.setAttachments(Listallegatodto);
           Listallegatidto.add(allegatidto);
         }
       }//chiudo try 
       catch(IndexOutOfBoundsException e) {
         e.printStackTrace();
       }     
      //***FINE GESTIONE FILE ALLEGATI***//
      
      layoutdto.setColumns(columns);
      schemadto.setLayout(layoutdto);
      schemadto.setAttachments(Listallegatidto);
      Gson gson=new Gson();
      System.out.println(gson.toJson(schemadto)); 
      // success!
      return;
    } catch (IOException e) {
      System.err.println(e.getMessage());
    } catch (Throwable t) {
      t.printStackTrace();
    }
    System.exit(1);
  }

  private static void tokenInfo(String accessToken) throws IOException {
    header("Validating a token");
    Tokeninfo tokeninfo = oauth2.tokeninfo().setAccessToken(accessToken).execute();
    System.out.println(tokeninfo.toPrettyString());
    if (!tokeninfo.getAudience().equals(clientSecrets.getDetails().getClientId())) {
      System.err.println("ERROR: audience does not match our client ID!");
    }
  }

  private static void userInfo() throws IOException {
    header("Obtaining User Profile Information");
    Userinfoplus userinfo = oauth2.userinfo().get().execute();
    System.out.println(userinfo.toPrettyString());
  }

  static void header(String name) {
    System.out.println();
    System.out.println("================== " + name + " ==================");
    System.out.println();
  }
}
