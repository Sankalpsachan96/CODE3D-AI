package com.code3d.controller;

import com.code3d.model.ExecuteRequest;
import com.code3d.model.ExecuteResponse;
import com.code3d.service.DsaExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ExecutionController {

    private final DsaExecutionService executionService;

    public ExecutionController(DsaExecutionService executionService) {
        this.executionService = executionService;
    }

    @PostMapping("/execute")
    public ResponseEntity<ExecuteResponse> execute(@RequestBody ExecuteRequest request) {
        try {
            ExecuteResponse response = executionService.execute(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(ExecuteResponse.error("Execution failed: " + e.getMessage()));
        }
    }
}
