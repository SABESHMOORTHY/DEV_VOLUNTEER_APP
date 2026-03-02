package com.volunteer.service;

import com.volunteer.model.AssistanceRequest;
import com.volunteer.model.Volunteer;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
public class AcceptancePredictionService {

    // Store volunteer performance history for prediction
    private Map<Long, VolunteerPerformanceHistory> performanceHistory = new HashMap<>();

    /**
     * Predict likelihood that a volunteer will accept a task using:
     * - past acceptance rate
     * - response time history
     * workload level
     */
    public double predictAcceptanceProbability(Volunteer volunteer, AssistanceRequest request) {
        VolunteerPerformanceHistory history = performanceHistory.computeIfAbsent(
            volunteer.getId(), k -> new VolunteerPerformanceHistory()
        );

        // Calculate base acceptance probability from historical data
        double historicalAcceptanceRate = calculateHistoricalAcceptanceRate(history);
        
        // Adjust based on response time patterns
        double responseTimeFactor = calculateResponseTimeFactor(history);
        
        // Adjust based on current workload
        double workloadFactor = calculateWorkloadFactor(volunteer, request);
        
        // Adjust based on request urgency
        double urgencyFactor = calculateUrgencyFactor(request);
        
        // Adjust based on skill match confidence
        double skillMatchFactor = calculateSkillMatchFactor(volunteer, request);
        
        // Combine factors with weights
        double acceptanceProbability = (historicalAcceptanceRate * 0.4) +
                                    (responseTimeFactor * 0.2) +
                                    (workloadFactor * 0.2) +
                                    (urgencyFactor * 0.1) +
                                    (skillMatchFactor * 0.1);
        
        // Ensure probability is between 0 and 1
        return Math.max(0.0, Math.min(1.0, acceptanceProbability));
    }

    /**
     * Update volunteer performance history after task completion
     */
    public void updateVolunteerPerformance(Long volunteerId, boolean accepted, 
                                         long responseTimeMinutes, String requestType) {
        VolunteerPerformanceHistory history = performanceHistory.computeIfAbsent(
            volunteerId, k -> new VolunteerPerformanceHistory()
        );
        
        history.addTaskOutcome(accepted, responseTimeMinutes, requestType);
    }

    private double calculateHistoricalAcceptanceRate(VolunteerPerformanceHistory history) {
        if (history.getTotalTasks() == 0) {
            return 0.7; // Default for new volunteers
        }
        
        double acceptanceRate = (double) history.getAcceptedTasks() / history.getTotalTasks();
        
        // Apply confidence factor based on sample size
        double confidenceFactor = Math.min(1.0, history.getTotalTasks() / 10.0);
        
        return (acceptanceRate * confidenceFactor) + (0.7 * (1 - confidenceFactor));
    }

    private double calculateResponseTimeFactor(VolunteerPerformanceHistory history) {
        if (history.getAverageResponseTime() == 0) {
            return 0.8; // Default for new volunteers
        }
        
        // Faster response times indicate higher likelihood of acceptance
        double avgResponseTime = history.getAverageResponseTime();
        
        if (avgResponseTime <= 30) { // Within 30 minutes
            return 1.0;
        } else if (avgResponseTime <= 60) { // Within 1 hour
            return 0.8;
        } else if (avgResponseTime <= 180) { // Within 3 hours
            return 0.6;
        } else {
            return 0.4;
        }
    }

    private double calculateWorkloadFactor(Volunteer volunteer, AssistanceRequest request) {
        // Simplified workload calculation based on availability
        if (volunteer.getAvailableDays() == null || volunteer.getAvailableDays().isEmpty()) {
            return 0.3;
        }
        
        int availableDays = volunteer.getAvailableDays().size();
        
        // More available days = lower workload = higher acceptance probability
        if (availableDays >= 5) {
            return 0.9;
        } else if (availableDays >= 3) {
            return 0.7;
        } else if (availableDays >= 1) {
            return 0.5;
        } else {
            return 0.3;
        }
    }

    private double calculateUrgencyFactor(AssistanceRequest request) {
        if (request.getUrgencyLevel() == null) {
            return 0.7; // Default
        }
        
        switch (request.getUrgencyLevel()) {
            case HIGH:
                return 0.6; // Urgent requests might have lower acceptance (commitment concerns)
            case MEDIUM:
                return 0.8;
            case LOW:
                return 0.9;
            default:
                return 0.7;
        }
    }

    private double calculateSkillMatchFactor(Volunteer volunteer, AssistanceRequest request) {
        if (request.getServiceType() == null || 
            volunteer.getServiceType() == null || 
            volunteer.getServiceType().isEmpty()) {
            return 0.5;
        }

        String requestedService = request.getServiceType().toLowerCase().trim();
        
        // Perfect skill match increases acceptance probability
        for (String service : volunteer.getServiceType()) {
            if (service.toLowerCase().trim().equals(requestedService)) {
                return 1.0;
            }
        }
        
        // Partial match
        for (String service : volunteer.getServiceType()) {
            String serviceLower = service.toLowerCase();
            if (serviceLower.contains(requestedService) || 
                requestedService.contains(serviceLower)) {
                return 0.8;
            }
        }
        
        return 0.4; // Poor skill match
    }

    /**
     * Inner class to track volunteer performance history
     */
    private static class VolunteerPerformanceHistory {
        private int totalTasks = 0;
        private int acceptedTasks = 0;
        private long totalResponseTime = 0; // in minutes
        private Map<String, Integer> taskTypeCounts = new HashMap<>();
        private LocalDateTime lastTaskTime = null;

        public void addTaskOutcome(boolean accepted, long responseTimeMinutes, String requestType) {
            totalTasks++;
            if (accepted) {
                acceptedTasks++;
            }
            totalResponseTime += responseTimeMinutes;
            
            taskTypeCounts.merge(requestType, 1, Integer::sum);
            lastTaskTime = LocalDateTime.now();
        }

        public int getTotalTasks() { return totalTasks; }
        public int getAcceptedTasks() { return acceptedTasks; }
        public double getAverageResponseTime() { 
            return totalTasks > 0 ? (double) totalResponseTime / totalTasks : 0; 
        }
        
        public int getTaskTypeCount(String requestType) {
            return taskTypeCounts.getOrDefault(requestType, 0);
        }
        
        public LocalDateTime getLastTaskTime() { return lastTaskTime; }
    }

    /**
     * Get volunteer performance statistics
     */
    public Map<String, Object> getVolunteerStats(Long volunteerId) {
        VolunteerPerformanceHistory history = performanceHistory.get(volunteerId);
        if (history == null) {
            return Map.of(
                "totalTasks", 0,
                "acceptedTasks", 0,
                "acceptanceRate", 0.0,
                "averageResponseTime", 0.0,
                "lastTaskTime", null
            );
        }
        
        return Map.of(
            "totalTasks", history.getTotalTasks(),
            "acceptedTasks", history.getAcceptedTasks(),
            "acceptanceRate", history.getTotalTasks() > 0 ? 
                (double) history.getAcceptedTasks() / history.getTotalTasks() : 0.0,
            "averageResponseTime", history.getAverageResponseTime(),
            "lastTaskTime", history.getLastTaskTime()
        );
    }
}
