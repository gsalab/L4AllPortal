package it.unisalento.l4allportal.dto;

import javax.xml.bind.annotation.XmlElement;

public class LocalizedFacetValueDTO {

	@XmlElement
	private String lang;
	@XmlElement
	private String value;
	
	public String getLang() {
		return lang;
	}
	public void setLang(String lang) {
		this.lang = lang;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	
	
}
