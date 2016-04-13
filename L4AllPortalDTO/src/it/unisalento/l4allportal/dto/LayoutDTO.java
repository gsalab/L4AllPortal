package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

public class LayoutDTO {

	private String portalName;
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
