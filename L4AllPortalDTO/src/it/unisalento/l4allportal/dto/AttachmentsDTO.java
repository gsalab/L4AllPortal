package it.unisalento.l4allportal.dto;

import java.util.ArrayList;

public class AttachmentsDTO {

	private String experienceName;
	private String school;
	private String city;
	private String province;
	private String experienceTitle;
	private String schoolLevel;
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
	
	
	
	
	
}
