package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

public class SchemaDTO {

	private LayoutDTO layout;
	private ArrayList<AttachmentsDTO> attachments;
	
	
	public LayoutDTO getLayout() {
		return layout;
	}
	public void setLayout(LayoutDTO layout) {
		this.layout = layout;
	}
	public ArrayList<AttachmentsDTO> getAttachments() {
		return attachments;
	}
	public void setAttachments(ArrayList<AttachmentsDTO> attachments) {
		this.attachments = attachments;
	}
	
	
}
