package com.code3d.model;

public class ExecuteRequest {
    private String code;
    private String conceptId;
    private String language; // java, c, cpp, python
    private String input;

    public ExecuteRequest() {
        this.language = "java";
    }

    public ExecuteRequest(String code, String conceptId, String language) {
        this.code = code;
        this.conceptId = conceptId;
        this.language = language != null ? language.toLowerCase() : "java";
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getConceptId() { return conceptId; }
    public void setConceptId(String conceptId) { this.conceptId = conceptId; }

    public String getLanguage() { return language != null ? language.toLowerCase() : "java"; }
    public void setLanguage(String language) { this.language = language; }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }
}
