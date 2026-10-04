package com.code3d.model;

import java.util.List;
import java.util.Map;

public class ExecutionStep {
    private Integer stepNumber;
    private Integer lineNumber;
    private String eventType;
    private Map<String, Object> variables;
    private String changedVariable;
    private Object previousValue;
    private Object currentValue;
    private ConditionInfo condition;
    private List<String> output;
    private DataStructureState dataStructureState;
    private String explanation;
    private String aiHint;

    public ExecutionStep() {}

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Map<String, Object> getVariables() { return variables; }
    public void setVariables(Map<String, Object> variables) { this.variables = variables; }

    public String getChangedVariable() { return changedVariable; }
    public void setChangedVariable(String changedVariable) { this.changedVariable = changedVariable; }

    public Object getPreviousValue() { return previousValue; }
    public void setPreviousValue(Object previousValue) { this.previousValue = previousValue; }

    public Object getCurrentValue() { return currentValue; }
    public void setCurrentValue(Object currentValue) { this.currentValue = currentValue; }

    public ConditionInfo getCondition() { return condition; }
    public void setCondition(ConditionInfo condition) { this.condition = condition; }

    public List<String> getOutput() { return output; }
    public void setOutput(List<String> output) { this.output = output; }

    public DataStructureState getDataStructureState() { return dataStructureState; }
    public void setDataStructureState(DataStructureState dataStructureState) { this.dataStructureState = dataStructureState; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getAiHint() { return aiHint; }
    public void setAiHint(String aiHint) { this.aiHint = aiHint; }
}
