package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;

public class FacetValueDTO {

	@XmlElement
	private String experienceID;
	@XmlElement
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
