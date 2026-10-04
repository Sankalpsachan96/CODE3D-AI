package com.code3d.model;

public class DsaConcept {
    private String id;
    private String name;
    private String category;
    private String description;
    private String difficulty;
    private String timeComplexity;
    private String spaceComplexity;
    private String code;

    public DsaConcept() {}

    public DsaConcept(String id, String name, String category, String description,
                      String difficulty, String timeComplexity, String spaceComplexity, String code) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.difficulty = difficulty;
        this.timeComplexity = timeComplexity;
        this.spaceComplexity = spaceComplexity;
        this.code = code;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }

    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
