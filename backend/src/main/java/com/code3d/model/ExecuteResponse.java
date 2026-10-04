package com.code3d.model;

import java.util.List;

public class ExecuteResponse {
    private String status; // SUCCESS, ERROR
    private Integer totalSteps;
    private List<ExecutionStep> steps;
    private String error;

    public ExecuteResponse() {}

    public ExecuteResponse(String status, Integer totalSteps, List<ExecutionStep> steps) {
        this.status = status;
        this.totalSteps = totalSteps;
        this.steps = steps;
    }

    public static ExecuteResponse error(String message) {
        ExecuteResponse response = new ExecuteResponse();
        response.setStatus("ERROR");
        response.setError(message);
        return response;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getTotalSteps() { return totalSteps; }
    public void setTotalSteps(Integer totalSteps) { this.totalSteps = totalSteps; }

    public List<ExecutionStep> getSteps() { return steps; }
    public void setSteps(List<ExecutionStep> steps) { this.steps = steps; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return error; }
    public void setMessage(String message) { this.error = message; }
}
