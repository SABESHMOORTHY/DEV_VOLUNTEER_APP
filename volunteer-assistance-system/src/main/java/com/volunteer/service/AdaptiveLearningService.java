package com.volunteer.service;

import com.volunteer.model.Volunteer;
import com.volunteer.repository.VolunteerRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdaptiveLearningService {

    private final VolunteerRepository volunteerRepository;
    private final AcceptancePredictionService acceptancePredictionService;
    private final EnhancedMatchingService enhancedMatchingService;

    // Track learning metrics
    private Map<Long, VolunteerLearningMetrics> learningMetrics = new HashMap<>();
    
    // Current AI weights (start with default values)
    private double availabilityWeight = 0.25;
    private double locationWeight = 0.20;
    private double skillWeight = 0.30;
    private double performanceWeight = 0.15;
    private double acceptanceWeight = 0.10;

    public AdaptiveLearningService(VolunteerRepository volunteerRepository,
                                 AcceptancePredictionService acceptancePredictionService,
                                 EnhancedMatchingService enhancedMatchingService) {
        this.volunteerRepository = volunteerRepository;
        this.acceptancePredictionService = acceptancePredictionService;
        this.enhancedMatchingService = enhancedMatchingService;
    }

    /**
     * Update volunteer reliability score after each task
     */
    public void updateVolunteerReliability(Long volunteerId, boolean taskCompleted, 
                                         double taskPerformanceRating) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId).orElse(null);
        if (volunteer == null) return;

        VolunteerLearningMetrics metrics = learningMetrics.computeIfAbsent(
            volunteerId, k -> new VolunteerLearningMetrics()
        );

        // Update learning metrics
        metrics.addTaskOutcome(taskCompleted, taskPerformanceRating);

        // Calculate new reliability score
        double currentRating = volunteer.getRating();
        double newRating = calculateUpdatedReliabilityScore(
            currentRating, taskCompleted, taskPerformanceRating, metrics
        );

        // Update volunteer rating with smoothing factor
        double smoothingFactor = 0.1; // Gradual updates
        volunteer.setRating((currentRating * (1 - smoothingFactor)) + (newRating * smoothingFactor));
        
        volunteerRepository.save(volunteer);
    }

    /**
     * Adjust matching weights based on success outcomes
     */
    public void adjustMatchingWeights(boolean assignmentSuccessful, 
                                   double predictedAcceptanceProbability,
                                   double actualMatchScore) {
        if (!assignmentSuccessful) {
            // Analyze why assignment failed and adjust weights
            analyzeFailedAssignment(predictedAcceptanceProbability, actualMatchScore);
        } else {
            // Reinforce successful weight configuration
            reinforceSuccessfulWeights();
        }

        // Update the matching service with new weights
        enhancedMatchingService.updateWeights(
            availabilityWeight, locationWeight, skillWeight, 
            performanceWeight, acceptanceWeight
        );
    }

    /**
     * Improve recommendation accuracy over time
     */
    public void improveRecommendationAccuracy() {
        // Analyze overall system performance
        double overallSuccessRate = calculateOverallSuccessRate();
        
        if (overallSuccessRate < 0.7) { // If success rate is below 70%
            // Increase weight of most predictive factors
            optimizeWeightsForBetterPredictions();
        }
    }

    private double calculateUpdatedReliabilityScore(double currentRating, boolean taskCompleted, 
                                                   double taskPerformanceRating, 
                                                   VolunteerLearningMetrics metrics) {
        double completionBonus = taskCompleted ? 0.2 : -0.3;
        double performanceBonus = (taskPerformanceRating - 3.0) * 0.1; // Assuming 1-5 scale
        
        // Consider consistency
        double consistencyBonus = calculateConsistencyBonus(metrics);
        
        double newRating = currentRating + completionBonus + performanceBonus + consistencyBonus;
        
        // Ensure rating stays within bounds
        return Math.max(1.0, Math.min(5.0, newRating));
    }

    private double calculateConsistencyBonus(VolunteerLearningMetrics metrics) {
        if (metrics.getTotalTasks() < 3) return 0.0; // Not enough data
        
        double successRate = (double) metrics.getCompletedTasks() / metrics.getTotalTasks();
        double avgPerformance = metrics.getAveragePerformanceRating();
        
        // Reward consistency in both completion and performance
        if (successRate >= 0.8 && avgPerformance >= 3.5) {
            return 0.1;
        } else if (successRate >= 0.6 && avgPerformance >= 3.0) {
            return 0.05;
        }
        
        return 0.0;
    }

    private void analyzeFailedAssignment(double predictedAcceptanceProbability, double actualMatchScore) {
        // If acceptance prediction was wrong, reduce acceptance weight
        if (predictedAcceptanceProbability > 0.7) {
            acceptanceWeight = Math.max(0.05, acceptanceWeight - 0.02);
            // Redistribute weight to other factors
            skillWeight += 0.01;
            availabilityWeight += 0.01;
        }
        
        // If overall match score was high but assignment failed, adjust other weights
        if (actualMatchScore > 0.8) {
            // Maybe location or availability was overvalued
            locationWeight = Math.max(0.10, locationWeight - 0.01);
            availabilityWeight = Math.max(0.15, availabilityWeight - 0.01);
            // Increase performance and skill weights
            performanceWeight += 0.01;
            skillWeight += 0.01;
        }
    }

    private void reinforceSuccessfulWeights() {
        // Slightly increase weights that led to success
        acceptanceWeight = Math.min(0.15, acceptanceWeight + 0.001);
        skillWeight = Math.min(0.35, skillWeight + 0.001);
    }

    private void optimizeWeightsForBetterPredictions() {
        // Analyze which factors have been most predictive
        Map<String, Double> factorPredictiveness = analyzeFactorPredictiveness();
        
        // Adjust weights based on predictiveness
        double totalPredictiveness = factorPredictiveness.values().stream()
            .mapToDouble(Double::doubleValue).sum();
        
        if (totalPredictiveness > 0) {
            availabilityWeight = factorPredictiveness.get("availability") / totalPredictiveness;
            locationWeight = factorPredictiveness.get("location") / totalPredictiveness;
            skillWeight = factorPredictiveness.get("skill") / totalPredictiveness;
            performanceWeight = factorPredictiveness.get("performance") / totalPredictiveness;
            acceptanceWeight = factorPredictiveness.get("acceptance") / totalPredictiveness;
        }
    }

    private Map<String, Double> analyzeFactorPredictiveness() {
        Map<String, Double> predictiveness = new HashMap<>();
        
        // Simplified analysis - in production, this would use more sophisticated ML
        predictiveness.put("availability", 0.25);
        predictiveness.put("location", 0.20);
        predictiveness.put("skill", 0.30);
        predictiveness.put("performance", 0.15);
        predictiveness.put("acceptance", 0.10);
        
        return predictiveness;
    }

    private double calculateOverallSuccessRate() {
        int totalAssignments = learningMetrics.values().stream()
            .mapToInt(VolunteerLearningMetrics::getTotalTasks).sum();
        
        if (totalAssignments == 0) return 0.5; // Default
        
        int successfulAssignments = learningMetrics.values().stream()
            .mapToInt(VolunteerLearningMetrics::getCompletedTasks).sum();
        
        return (double) successfulAssignments / totalAssignments;
    }

    /**
     * Get learning analytics for monitoring
     */
    public Map<String, Object> getLearningAnalytics() {
        return Map.of(
            "totalVolunteersTracked", learningMetrics.size(),
            "overallSuccessRate", calculateOverallSuccessRate(),
            "currentWeights", Map.of(
                "availability", availabilityWeight,
                "location", locationWeight,
                "skill", skillWeight,
                "performance", performanceWeight,
                "acceptance", acceptanceWeight
            ),
            "averageReliabilityImprovement", calculateAverageReliabilityImprovement()
        );
    }

    private double calculateAverageReliabilityImprovement() {
        // Calculate average improvement in volunteer ratings
        return learningMetrics.values().stream()
            .filter(metrics -> metrics.getTotalTasks() >= 2)
            .mapToDouble(metrics -> {
                // Simplified calculation
                return metrics.getAveragePerformanceRating() > 3.5 ? 0.1 : 0.05;
            })
            .average()
            .orElse(0.0);
    }

    /**
     * Inner class to track learning metrics for each volunteer
     */
    private static class VolunteerLearningMetrics {
        private int totalTasks = 0;
        private int completedTasks = 0;
        private double totalPerformanceRating = 0.0;
        private long firstTaskTimestamp = System.currentTimeMillis();

        public void addTaskOutcome(boolean completed, double performanceRating) {
            totalTasks++;
            if (completed) {
                completedTasks++;
            }
            totalPerformanceRating += performanceRating;
        }

        public int getTotalTasks() { return totalTasks; }
        public int getCompletedTasks() { return completedTasks; }
        public double getAveragePerformanceRating() { 
            return totalTasks > 0 ? totalPerformanceRating / totalTasks : 0.0; 
        }
        public long getFirstTaskTimestamp() { return firstTaskTimestamp; }
    }
}
