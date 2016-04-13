package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

public class FacetValueDTO {

	private String experienceID;
	private ArrayList<FacetIDValuePair> values; //per generalita
	
	public String getExperienceID() {
		return experienceID;
	}
	public void setExperienceID(String experienceID) {
		this.experienceID = experienceID;
	}
	public ArrayList<FacetIDValuePair> getValues() {
		return values;
	}
	public void setValues(ArrayList<FacetIDValuePair> values) {
		this.values = values;
	}
	
	
}
