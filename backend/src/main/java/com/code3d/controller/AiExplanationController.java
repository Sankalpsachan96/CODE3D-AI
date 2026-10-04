package com.code3d.controller;

import com.code3d.model.ExplainRequest;
import com.code3d.model.ExplainResponse;
import com.code3d.service.AiExplanationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AiExplanationController {

    private final AiExplanationService explanationService;

    public AiExplanationController(AiExplanationService explanationService) {
        this.explanationService = explanationService;
    }

    @PostMapping("/explain")
    public ResponseEntity<ExplainResponse> explain(@RequestBody ExplainRequest request) {
        ExplainResponse response = explanationService.explain(request);
        return ResponseEntity.ok(response);
    }
}
