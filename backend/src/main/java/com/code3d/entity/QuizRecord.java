package com.code3d.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_results")
public class QuizRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String conceptId;
    private Integer score;
    private Integer totalQuestions;
    private Integer accuracy;
    private LocalDateTime completedAt;

    public QuizRecord() {
        this.completedAt = LocalDateTime.now();
    }

    public QuizRecord(String conceptId, Integer score, Integer totalQuestions) {
        this.conceptId = conceptId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.accuracy = totalQuestions > 0 ? (int) Math.round(((double) score / totalQuestions) * 100) : 0;
        this.completedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConceptId() { return conceptId; }
    public void setConceptId(String conceptId) { this.conceptId = conceptId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getAccuracy() { return accuracy; }
    public void setAccuracy(Integer accuracy) { this.accuracy = accuracy; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
