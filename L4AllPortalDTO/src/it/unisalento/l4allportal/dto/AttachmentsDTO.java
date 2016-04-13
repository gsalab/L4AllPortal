package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;

public class AttachmentsDTO {

	@XmlElement
	private String experienceName;
	@XmlElement
	private String school;
	@XmlElement
	private String city;
	@XmlElement
	private String province;
	@XmlElement
	private String experienceTitle;
	@XmlElement
	private String schoolLevel;
	@XmlElement
	private String shortResume;
	@XmlElement
	private ArrayList<AttachmentDTO> attachments;
	
	public String getExperienceName() {
		return experienceName;
	}
	public void setExperienceName(String experienceName) {
		this.experienceName = experienceName;
	}
	public String getSchool() {
		return school;
	}
	public void setSchool(String school) {
		this.school = school;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getProvince() {
		return province;
	}
	public void setProvince(String province) {
		this.province = province;
	}
	public String getExperienceTitle() {
		return experienceTitle;
	}
	public void setExperienceTitle(String experienceTitle) {
		this.experienceTitle = experienceTitle;
	}
	public String getSchoolLevel() {
		return schoolLevel;
	}
	public void setSchoolLevel(String schoolLevel) {
		this.schoolLevel = schoolLevel;
	}
	public ArrayList<AttachmentDTO> getAttachments() {
		return attachments;
	}
	public void setAttachments(ArrayList<AttachmentDTO> attachments) {
		this.attachments = attachments;
	}
	public String getShortResume() {
		return shortResume;
	}

	public void setShortResume(String shortResume) {
		this.shortResume = shortResume;
	}
	
	
	
	
	
}
