package it.unisalento.l4allportal.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.text.Normalizer;
import java.util.HashMap;

public class Util {

	private static Util instance;
	private static HashMap<String, String> attachmentTypes = new HashMap<String, String>(); 
	
	public Util() {
		attachmentTypes.put("Number", "");
		attachmentTypes.put("String", "");
		attachmentTypes.put("Etext", "");
		attachmentTypes.put("Rtext_E", "link");
		attachmentTypes.put("Rtext_R", "link");
		attachmentTypes.put("Media", "link");
	}
	
	public static synchronized Util getInstance() {
		if(instance == null) instance = new Util();
		return instance;
	}
	
    public String readUrl(String urlString) throws Exception {
	    BufferedReader reader = null;
	    try {
	        URL url = new URL(urlString);
	        reader = new BufferedReader(new InputStreamReader(url.openStream()));
	        StringBuffer buffer = new StringBuffer();
	        int read;
	        char[] chars = new char[1024];
	        while ((read = reader.read(chars)) != -1)
	            buffer.append(chars, 0, read); 

	        return buffer.toString();
	    } finally {
	        if (reader != null)
	            reader.close();
	    }
	}

	public String normalizePropertyName(String prop, boolean _s) {
		return Normalizer.normalize(prop.trim().replace(" ", "_").replace("'", "_")+(_s?"_s":""), Normalizer.Form.NFD);
	}
	
	public String getAttachmentFormat(String type) {
		return attachmentTypes.get(type);
	}
}
