package com.code3d.controller;

import com.code3d.model.AnalyzeResponse;
import com.code3d.model.ExecuteRequest;
import com.code3d.service.JavaAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AnalysisController {

    private final JavaAnalysisService analysisService;

    public AnalysisController(JavaAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(@RequestBody ExecuteRequest request) {
        AnalyzeResponse response = analysisService.analyzeCode(request.getCode(), request.getLanguage());
        return ResponseEntity.ok(response);
    }
}
