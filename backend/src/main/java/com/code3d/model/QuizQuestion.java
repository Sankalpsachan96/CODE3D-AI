package com.code3d.model;

import java.util.List;

public class QuizQuestion {
    private String id;
    private String question;
    private List<String> options;
    private Integer correctIndex;
    private String explanation;

    public QuizQuestion() {}

    public QuizQuestion(String id, String question, List<String> options, Integer correctIndex, String explanation) {
        this.id = id;
        this.question = question;
        this.options = options;
        this.correctIndex = correctIndex;
        this.explanation = explanation;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public Integer getCorrectIndex() { return correctIndex; }
    public void setCorrectIndex(Integer correctIndex) { this.correctIndex = correctIndex; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
