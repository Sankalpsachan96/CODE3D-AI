package com.code3d.model;

import java.util.List;

public class AnalyzeResponse {
    private String timeComplexity;
    private String spaceComplexity;
    private Integer loopCount;
    private List<String> detectedStructures;
    private String astSummary;
    private String explanation;

    public AnalyzeResponse() {}

    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }

    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }

    public Integer getLoopCount() { return loopCount; }
    public void setLoopCount(Integer loopCount) { this.loopCount = loopCount; }

    public List<String> getDetectedStructures() { return detectedStructures; }
    public void setDetectedStructures(List<String> detectedStructures) { this.detectedStructures = detectedStructures; }

    public String getAstSummary() { return astSummary; }
    public void setAstSummary(String astSummary) { this.astSummary = astSummary; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
