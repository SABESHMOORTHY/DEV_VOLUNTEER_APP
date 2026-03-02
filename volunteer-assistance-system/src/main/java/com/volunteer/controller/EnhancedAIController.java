package com.volunteer.controller;

import com.volunteer.dto.EnhancedVolunteerMatch;
import com.volunteer.model.AssistanceRequest;
import com.volunteer.service.EnhancedMatchingService;
import com.volunteer.service.AdaptiveLearningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/enhanced")
@RequiredArgsConstructor
@Tag(name = "Enhanced AI Services", description = "Advanced AI-powered volunteer matching and learning")
public class EnhancedAIController {

    private final EnhancedMatchingService enhancedMatchingService;
    private final AdaptiveLearningService adaptiveLearningService;

    @Operation(summary = "Get enhanced volunteer matches", description = "Get AI-ranked volunteers with detailed scoring breakdown")
    @ApiResponse(responseCode = "200", description = "Enhanced matches retrieved successfully")
    @GetMapping("/match_volunteers/{requestId}")
    public ResponseEntity<List<EnhancedVolunteerMatch>> getEnhancedVolunteerMatches(@PathVariable Long requestId) {
        // In a real implementation, you would fetch the request from database
        // For now, we'll create a sample request
        AssistanceRequest sampleRequest = createSampleRequest(requestId);
        
        List<EnhancedVolunteerMatch> matches = enhancedMatchingService.getTopRankedVolunteers(sampleRequest, 5);
        return ResponseEntity.ok(matches);
    }

    @Operation(summary = "Update volunteer performance", description = "Update volunteer reliability after task completion")
    @ApiResponse(responseCode = "200", description = "Performance updated successfully")
    @PostMapping("/update_performance/{volunteerId}")
    public ResponseEntity<String> updateVolunteerPerformance(
            @PathVariable Long volunteerId,
            @RequestBody Map<String, Object> performanceData) {
        
        boolean taskCompleted = (Boolean) performanceData.getOrDefault("taskCompleted", false);
        double performanceRating = ((Number) performanceData.getOrDefault("performanceRating", 3.0)).doubleValue();
        
        adaptiveLearningService.updateVolunteerReliability(volunteerId, taskCompleted, performanceRating);
        
        return ResponseEntity.ok("Volunteer performance updated successfully");
    }

    @Operation(summary = "Adjust matching weights", description = "Update AI matching weights based on assignment outcomes")
    @ApiResponse(responseCode = "200", description = "Weights adjusted successfully")
    @PostMapping("/adjust_weights")
    public ResponseEntity<String> adjustMatchingWeights(@RequestBody Map<String, Object> outcomeData) {
        
        boolean assignmentSuccessful = (Boolean) outcomeData.getOrDefault("assignmentSuccessful", false);
        double predictedAcceptanceProbability = ((Number) outcomeData.getOrDefault("predictedAcceptanceProbability", 0.5)).doubleValue();
        double actualMatchScore = ((Number) outcomeData.getOrDefault("actualMatchScore", 0.5)).doubleValue();
        
        adaptiveLearningService.adjustMatchingWeights(assignmentSuccessful, predictedAcceptanceProbability, actualMatchScore);
        
        return ResponseEntity.ok("Matching weights adjusted successfully");
    }

    @Operation(summary = "Get learning analytics", description = "Retrieve AI learning and performance analytics")
    @ApiResponse(responseCode = "200", description = "Analytics retrieved successfully")
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getLearningAnalytics() {
        Map<String, Object> analytics = adaptiveLearningService.getLearningAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @Operation(summary = "Improve recommendations", description = "Trigger AI model improvement based on collected data")
    @ApiResponse(responseCode = "200", description = "Model improvement initiated")
    @PostMapping("/improve_recommendations")
    public ResponseEntity<String> improveRecommendations() {
        adaptiveLearningService.improveRecommendationAccuracy();
        return ResponseEntity.ok("Recommendation accuracy improvement initiated");
    }

    private AssistanceRequest createSampleRequest(Long requestId) {
        AssistanceRequest request = new AssistanceRequest();
        request.setId(requestId);
        request.setRequesterName("Sample Requester");
        request.setRequesterContact("555-0123");
        request.setLocation("New York");
        request.setServiceType("Food Delivery");
        request.setDescription("Need food delivery for elderly person");
        request.setUrgencyLevel(com.volunteer.model.UrgencyLevel.MEDIUM);
        request.setStatus(com.volunteer.model.RequestStatus.PENDING);
        return request;
    }
}
