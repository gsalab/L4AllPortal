package it.unisalento.l4allportal.api;

import java.util.List;

import javax.xml.bind.annotation.XmlElement;

import com.google.gson.JsonArray;

public class Data {

	@XmlElement
	private JsonArray experiences;

	public JsonArray getExperiences() {
		return experiences;
	}

	public void setExperiences(JsonArray experiences) {
		this.experiences = experiences;
	}
	
}
