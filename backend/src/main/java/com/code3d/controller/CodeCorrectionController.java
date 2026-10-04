package com.code3d.controller;

import com.code3d.model.CodeCorrectionRequest;
import com.code3d.model.CodeCorrectionResponse;
import com.code3d.service.CodeCorrectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
public class CodeCorrectionController {

    private final CodeCorrectionService codeCorrectionService;

    public CodeCorrectionController(CodeCorrectionService codeCorrectionService) {
        this.codeCorrectionService = codeCorrectionService;
    }

    @PostMapping("/correct-and-visualize")
    public ResponseEntity<CodeCorrectionResponse> correctAndVisualize(@RequestBody CodeCorrectionRequest request) {
        try {
            CodeCorrectionResponse response = codeCorrectionService.correctAndVisualize(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            CodeCorrectionResponse error = new CodeCorrectionResponse();
            error.setCorrect(false);
            error.setOriginalCode(request.getCode());
            error.setExplanation("Diagnosis error: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
}
