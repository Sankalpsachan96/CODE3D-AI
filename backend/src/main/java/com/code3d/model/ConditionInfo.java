package com.code3d.model;

public class ConditionInfo {
    private String expression;
    private String evaluation;
    private Boolean result;
    private String branch;

    public ConditionInfo() {}

    public ConditionInfo(String expression, String evaluation, Boolean result, String branch) {
        this.expression = expression;
        this.evaluation = evaluation;
        this.result = result;
        this.branch = branch;
    }

    public String getExpression() { return expression; }
    public void setExpression(String expression) { this.expression = expression; }

    public String getEvaluation() { return evaluation; }
    public void setEvaluation(String evaluation) { this.evaluation = evaluation; }

    public Boolean getResult() { return result; }
    public void setResult(Boolean result) { this.result = result; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
}
