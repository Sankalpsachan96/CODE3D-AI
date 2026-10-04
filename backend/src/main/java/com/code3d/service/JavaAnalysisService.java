package com.code3d.service;

import com.code3d.model.AnalyzeResponse;
import com.code3d.parser.UniversalCodeAnalyzer;
import org.springframework.stereotype.Service;

@Service
public class JavaAnalysisService {

    private final UniversalCodeAnalyzer analyzer;

    public JavaAnalysisService(UniversalCodeAnalyzer analyzer) {
        this.analyzer = analyzer;
    }

    public AnalyzeResponse analyzeCode(String code) {
        return analyzeCode(code, "java");
    }

    public AnalyzeResponse analyzeCode(String code, String language) {
        if (code == null || code.trim().isEmpty()) {
            AnalyzeResponse empty = new AnalyzeResponse();
            empty.setTimeComplexity("O(1)");
            empty.setSpaceComplexity("O(1)");
            empty.setExplanation("Empty source code provided.");
            return empty;
        }
        return analyzer.analyze(code, language);
    }
}
