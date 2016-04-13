package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;

public class ColumnDTO {

	@XmlElement
	private ArrayList<WidgetDTO> widgets;

	public ArrayList<WidgetDTO> getWidgets() {
		return widgets;
	}

	public void setWidgets(ArrayList<WidgetDTO> widgets) {
		this.widgets = widgets;
	}
	
	
}
