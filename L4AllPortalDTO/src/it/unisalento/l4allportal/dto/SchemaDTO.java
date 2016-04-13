package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;


@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class SchemaDTO {
	
	@XmlElement(required=true) 
	private LayoutDTO layout;
	
	@XmlElement(required=true) 
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
