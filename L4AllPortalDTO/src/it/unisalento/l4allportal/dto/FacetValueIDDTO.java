package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

public class FacetValueIDDTO {

	private String ID;
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
