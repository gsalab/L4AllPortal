package it.unisalento.l4allportal.dto;

import javax.xml.bind.annotation.XmlElement;

public class FacetIDValuePair {

	@XmlElement
	private String facetValueID;
	@XmlElement
	private String facetValue;
	
	public String getFacetValueID() {
		return facetValueID;
	}
	public void setFacetValueID(String facetValueID) {
		this.facetValueID = facetValueID;
	}
	public String getFacetValue() {
		return facetValue;
	}
	public void setFacetValue(String facetValue) {
		this.facetValue = facetValue;
	}
	
	
	
	
}
