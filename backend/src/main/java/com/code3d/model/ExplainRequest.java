package com.code3d.model;

public class ExplainRequest {
    private String code;
    private Integer lineNumber;
    private Integer stepNumber;
    private String queryType; // EXPLAIN_CODE, EXPLAIN_LINE, WHY, HINT, PREDICT_NEXT
    private String level;     // Beginner, Intermediate, DSA

    public ExplainRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public String getQueryType() { return queryType; }
    public void setQueryType(String queryType) { this.queryType = queryType; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
