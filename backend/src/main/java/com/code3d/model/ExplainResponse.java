package com.code3d.model;

public class ExplainResponse {
    private String explanation;
    private String hint;
    private String keyTakeaway;

    public ExplainResponse() {}

    public ExplainResponse(String explanation, String hint, String keyTakeaway) {
        this.explanation = explanation;
        this.hint = hint;
        this.keyTakeaway = keyTakeaway;
    }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }

    public String getKeyTakeaway() { return keyTakeaway; }
    public void setKeyTakeaway(String keyTakeaway) { this.keyTakeaway = keyTakeaway; }
}
