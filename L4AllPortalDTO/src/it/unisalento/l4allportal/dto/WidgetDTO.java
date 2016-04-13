package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

public class WidgetDTO {

	private String id;
	private String name;
	private String color;
	private String font;
	private ArrayList<LocalizedWidgetNameDTO> localizedNames;
	private ArrayList<FacetDTO> facets;
	
	
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getColor() {
		return color;
	}
	public void setColor(String color) {
		this.color = color;
	}
	public String getFont() {
		return font;
	}
	public void setFont(String font) {
		this.font = font;
	}
	public ArrayList<LocalizedWidgetNameDTO> getLocalizedNames() {
		return localizedNames;
	}
	public void setLocalizedNames(ArrayList<LocalizedWidgetNameDTO> localizedNames) {
		this.localizedNames = localizedNames;
	}
	public ArrayList<FacetDTO> getFacets() {
		return facets;
	}
	public void setFacets(ArrayList<FacetDTO> facets) {
		this.facets = facets;
	}
	
	
}
