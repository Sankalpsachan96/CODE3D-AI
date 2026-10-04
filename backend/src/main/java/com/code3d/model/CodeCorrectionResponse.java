package com.code3d.model;

import java.util.ArrayList;
import java.util.List;

public class CodeCorrectionResponse {
    private boolean correct;
    private String originalCode;
    private String correctedCode;
    private String language;
    private List<String> errorsFound = new ArrayList<>();
    private String explanation;
    private ExecuteResponse executionTrace;

    public CodeCorrectionResponse() {}

    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }

    public String getOriginalCode() { return originalCode; }
    public void setOriginalCode(String originalCode) { this.originalCode = originalCode; }

    public String getCorrectedCode() { return correctedCode; }
    public void setCorrectedCode(String correctedCode) { this.correctedCode = correctedCode; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public List<String> getErrorsFound() { return errorsFound; }
    public void setErrorsFound(List<String> errorsFound) { this.errorsFound = errorsFound; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public ExecuteResponse getExecutionTrace() { return executionTrace; }
    public void setExecutionTrace(ExecuteResponse executionTrace) { this.executionTrace = executionTrace; }
}
