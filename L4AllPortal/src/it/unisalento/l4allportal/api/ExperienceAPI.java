package it.unisalento.l4allportal.api;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;

import it.unisalento.l4allportal.dto.AttachmentDTO;
import it.unisalento.l4allportal.dto.AttachmentsDTO;
import it.unisalento.l4allportal.dto.ColumnDTO;
import it.unisalento.l4allportal.dto.FacetDTO;
import it.unisalento.l4allportal.dto.FacetIDValuePair;
import it.unisalento.l4allportal.dto.FacetValueDTO;
import it.unisalento.l4allportal.dto.LayoutDTO;
import it.unisalento.l4allportal.dto.SchemaDTO;
import it.unisalento.l4allportal.dto.WidgetDTO;
import it.unisalento.l4allportal.util.Util;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

@Path("/experiences")
public class ExperienceAPI {

	@POST
	@Path("/")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public String postExperiences(SchemaDTO schema) {
		
		String responseDescription = "SUCCESS";
		int responseCode = 0;
		int attCount = 100;
		HashMap<String, JsonObject> expMap = new HashMap<String, JsonObject>();
		ArrayList<JsonObject> attMap = new ArrayList<JsonObject>();
		
		try{
			Iterator<ColumnDTO> iCols = schema.getLayout().getColumns().iterator();
			while(iCols.hasNext()) {
				ColumnDTO col = iCols.next();
				Iterator<WidgetDTO> wdgts = col.getWidgets().iterator();
				while(wdgts.hasNext()) {
					WidgetDTO w = wdgts.next();
					Iterator<FacetDTO> fcts = w.getFacets().iterator();
					while(fcts.hasNext()) {
						FacetDTO f = fcts.next();
						f.getFacetValueIDs();
						Iterator<FacetValueDTO> values = f.getFacetvalues().iterator();
						while(values.hasNext()) {
							FacetValueDTO fv = values.next();
							if(expMap.get(fv.getExperienceID()) == null) {
								JsonObject jso = new JsonObject();
								jso.addProperty("id", fv.getExperienceID().replace("#", "_"));
								jso.addProperty("label", fv.getExperienceID().replace("#", "_"));
								jso.addProperty("cat", "experience");
								jso.addProperty("labelIndex_s", fv.getExperienceID());
								jso.add("link_s", new JsonArray());
								expMap.put(fv.getExperienceID(), jso);
							}
							JsonObject jso=expMap.get(fv.getExperienceID());
							//if(fv.getValues() == null) continue;
							Iterator<FacetIDValuePair> v = fv.getValues().iterator();
							ArrayList<String> closeAnsw = new ArrayList<String>();
							while(v.hasNext()) {
								FacetIDValuePair pair = v.next();
								if(pair.getFacetValueID().startsWith("?")) {
									String nrm = Util.getInstance().normalizePropertyName(pair.getFacetValueID().substring(1), true);
									jso.addProperty(nrm, pair.getFacetValue());
								}
								else if("x".equalsIgnoreCase(pair.getFacetValue()))
									closeAnsw.add(pair.getFacetValueID());
							}
							if(closeAnsw.size()>0) {
								JsonArray jsaProp=new JsonArray();
								Iterator<String> iterator = closeAnsw.iterator();
								while(iterator.hasNext()) jsaProp.add(new JsonPrimitive(iterator.next()));
								jso.add(Util.getInstance().normalizePropertyName(f.getId(), true), jsaProp);
							}
						}
					}
				}
			}
			Iterator<AttachmentsDTO> attachs = schema.getAttachments().iterator();
			while(attachs.hasNext()) {
				AttachmentsDTO atts = attachs.next();
				JsonObject jsoAtt = new JsonObject();
				String attID = "l"+attCount++;
				jsoAtt.addProperty("id", attID);
				jsoAtt.addProperty("cat", "link");
				if(expMap.get(atts.getExperienceName()) != null)
					expMap.get(atts.getExperienceName()).getAsJsonArray("link_s").add(new JsonPrimitive(attID));
				else {
					System.out.println("Experience "+atts.getExperienceName()+" non trovata");
					continue;
				}
				jsoAtt.addProperty("city_sSingle", atts.getCity());
				jsoAtt.addProperty("province_sSingle", atts.getProvince());
				jsoAtt.addProperty("school_sSingle", atts.getSchool());
				jsoAtt.addProperty("schoolLevel_sSingle", atts.getSchoolLevel());
				expMap.get(atts.getExperienceName()).addProperty("abstract_s", atts.getShortResume());
				jsoAtt.addProperty("zindex_i", 501);
				Iterator<AttachmentDTO> attItr = atts.getAttachments().iterator();
				while(attItr.hasNext()) {
					AttachmentDTO att = attItr.next();
					jsoAtt.addProperty(Util.getInstance().normalizePropertyName(att.getName(), false)+"_sSingle", att.getValue());
					jsoAtt.addProperty("formato_sSingle", Util.getInstance().getAttachmentFormat(att.getType()));
				}
				attMap.add(jsoAtt);
			}
		} catch(NullPointerException npe) {
			responseCode = -1;
			responseDescription = npe.getMessage();
			npe.printStackTrace();
		} catch(Exception e) {
			responseCode = -2;
			responseDescription = e.getMessage();
			e.printStackTrace();
		}
		
		JsonArray jsArr = new JsonArray();
		Iterator<Entry<String, JsonObject>> entrySet = expMap.entrySet().iterator();
		while(entrySet.hasNext())
			jsArr.add(entrySet.next().getValue());
		Iterator<JsonObject> atts = attMap.iterator();
		while(atts.hasNext())
			jsArr.add(atts.next());
//		Response response = new Response();
//		Data data = new Data();
//		data.setExperiences(jsArr);
//		response.setCode(responseCode);
//		response.setDescription(responseDescription);
//		response.setData(data);
		return jsArr.toString();
	}
}
