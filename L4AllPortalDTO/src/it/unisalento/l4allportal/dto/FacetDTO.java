package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;

public class FacetDTO {

	@XmlElement
	private String id;
	@XmlElement
	private boolean isFreeText;
	
	//parte di define
	@XmlElement
	private String name;
	@XmlElement
	private boolean visualizationAbs;
	@XmlElement
	private boolean visualizationHist;
	@XmlElement
	private boolean visualizationPercent;
	@XmlElement
	private boolean visualizationWC;
	@XmlElement
	private boolean visualizationList;
	@XmlElement
	private ArrayList<LocalizedFacetNameDTO> localizedNames;
	@XmlElement
	private ArrayList<FacetValueIDDTO> facetValueIDs;
	
	//parte dei valori
	@XmlElement
	private ArrayList<FacetValueDTO> facetvalues;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public boolean isFreeText() {
		return isFreeText;
	}

	public void setFreeText(boolean isFreeText) {
		this.isFreeText = isFreeText;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean isVisualizationAbs() {
		return visualizationAbs;
	}

	public void setVisualizationAbs(boolean visualizationAbs) {
		this.visualizationAbs = visualizationAbs;
	}

	public boolean isVisualizationHist() {
		return visualizationHist;
	}

	public void setVisualizationHist(boolean visualizationHist) {
		this.visualizationHist = visualizationHist;
	}

	public boolean isVisualizationPercent() {
		return visualizationPercent;
	}

	public void setVisualizationPercent(boolean visualizationPercent) {
		this.visualizationPercent = visualizationPercent;
	}

	public boolean isVisualizationWC() {
		return visualizationWC;
	}

	public void setVisualizationWC(boolean visualizationWC) {
		this.visualizationWC = visualizationWC;
	}

	public boolean isVisualizationList() {
		return visualizationList;
	}

	public void setVisualizationList(boolean visualizationList) {
		this.visualizationList = visualizationList;
	}

	public ArrayList<LocalizedFacetNameDTO> getLocalizedNames() {
		return localizedNames;
	}

	public void setLocalizedNames(ArrayList<LocalizedFacetNameDTO> localizedNames) {
		this.localizedNames = localizedNames;
	}

	public ArrayList<FacetValueIDDTO> getFacetValueIDs() {
		return facetValueIDs;
	}

	public void setFacetValueIDs(ArrayList<FacetValueIDDTO> facetValueIDs) {
		this.facetValueIDs = facetValueIDs;
	}

	public ArrayList<FacetValueDTO> getFacetvalues() {
		return facetvalues;
	}

	public void setFacetvalues(ArrayList<FacetValueDTO> facetvalues) {
		this.facetvalues = facetvalues;
	}
	
	
}
