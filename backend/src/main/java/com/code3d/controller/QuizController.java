package com.code3d.controller;

import com.code3d.model.QuizQuestion;
import com.code3d.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/quiz")
    public ResponseEntity<List<QuizQuestion>> getQuiz(@RequestParam(required = false, defaultValue = "array-loop") String conceptId) {
        List<QuizQuestion> questions = quizService.generateQuiz(conceptId);
        return ResponseEntity.ok(questions);
    }
}
