package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;

public class FacetValueIDDTO {

	@XmlElement
	private String ID;
	@XmlElement
	private ArrayList<LocalizedFacetValueDTO> localizedValues;
	
	public String getID() {
		return ID;
	}
	public void setID(String iD) {
		ID = iD;
	}
	public ArrayList<LocalizedFacetValueDTO> getLocalizedValues() {
		return localizedValues;
	}
	public void setLocalizedValues(ArrayList<LocalizedFacetValueDTO> localizedValues) {
		this.localizedValues = localizedValues;
	}
	
	
}
