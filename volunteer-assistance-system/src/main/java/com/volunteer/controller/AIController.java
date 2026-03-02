package com.volunteer.controller;

import com.volunteer.dto.RequestInterpretation;
import com.volunteer.service.RequestUnderstandingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Services", description = "AI-powered request interpretation and analysis")
public class AIController {

    private final RequestUnderstandingService requestUnderstandingService;

    @Operation(summary = "Interpret service request", description = "Use NLP to extract structured data from request description")
    @ApiResponse(responseCode = "200", description = "Request successfully interpreted")
    @PostMapping("/interpret_request")
    public ResponseEntity<RequestInterpretation> interpretRequest(@RequestBody Map<String, String> request) {
        String description = request.get("description");
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be empty");
        }
        
        RequestInterpretation interpretation = requestUnderstandingService.interpretRequest(description);
        return ResponseEntity.ok(interpretation);
    }
}
