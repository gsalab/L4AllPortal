package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;

public class LayoutDTO {

	@XmlElement
	private String portalName;
	@XmlElement
	private ArrayList<ColumnDTO> columns;
	
	public String getPortalName() {
		return portalName;
	}
	public void setPortalName(String portalName) {
		this.portalName = portalName;
	}
	public ArrayList<ColumnDTO> getColumns() {
		return columns;
	}
	public void setColumns(ArrayList<ColumnDTO> columns) {
		this.columns = columns;
	}
	
	
}
