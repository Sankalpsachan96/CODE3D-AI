package com.code3d.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "execution_history")
public class ExecutionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String programTitle;
    private String conceptId;
    private Integer totalSteps;
    private String status;
    private LocalDateTime executedAt;

    public ExecutionRecord() {
        this.executedAt = LocalDateTime.now();
    }

    public ExecutionRecord(String programTitle, String conceptId, Integer totalSteps, String status) {
        this.programTitle = programTitle;
        this.conceptId = conceptId;
        this.totalSteps = totalSteps;
        this.status = status;
        this.executedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProgramTitle() { return programTitle; }
    public void setProgramTitle(String programTitle) { this.programTitle = programTitle; }

    public String getConceptId() { return conceptId; }
    public void setConceptId(String conceptId) { this.conceptId = conceptId; }

    public Integer getTotalSteps() { return totalSteps; }
    public void setTotalSteps(Integer totalSteps) { this.totalSteps = totalSteps; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}
