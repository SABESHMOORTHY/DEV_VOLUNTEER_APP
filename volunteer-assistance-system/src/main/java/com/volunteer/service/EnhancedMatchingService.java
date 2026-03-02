package com.volunteer.service;

import com.volunteer.dto.EnhancedVolunteerMatch;
import com.volunteer.model.AssistanceRequest;
import com.volunteer.model.Volunteer;
import com.volunteer.repository.VolunteerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnhancedMatchingService {

    private final VolunteerRepository volunteerRepository;
    private final AcceptancePredictionService acceptancePredictionService;

    // AI Matching weights (configurable for adaptive learning)
    private double availabilityWeight = 0.25;
    private double locationWeight = 0.20;
    private double skillWeight = 0.30;
    private double performanceWeight = 0.15;
    private double acceptanceWeight = 0.10;

    public EnhancedMatchingService(VolunteerRepository volunteerRepository, 
                                 AcceptancePredictionService acceptancePredictionService) {
        this.volunteerRepository = volunteerRepository;
        this.acceptancePredictionService = acceptancePredictionService;
    }

    /**
     * Calculate enhanced AI match score using weighted multi-factor evaluation
     * match_score = (availability_weight * availability_score) +
     *              (location_weight * proximity_score) +
     *              (skill_weight * skill_match_score) +
     *              (performance_weight * reliability_score) +
     *              (acceptance_weight * predicted_acceptance_probability)
     */
    public EnhancedVolunteerMatch calculateEnhancedMatch(AssistanceRequest request, Volunteer volunteer) {
        if (!volunteer.isActive()) {
            return createZeroMatch(volunteer, "Volunteer is inactive");
        }

        // Calculate individual factor scores
        double availabilityScore = calculateAvailabilityScore(request, volunteer);
        double proximityScore = calculateProximityScore(request, volunteer);
        double skillMatchScore = calculateSkillMatchScore(request, volunteer);
        double reliabilityScore = calculateReliabilityScore(volunteer);
        double acceptanceProbability = acceptancePredictionService.predictAcceptanceProbability(volunteer, request);

        // Calculate weighted total score
        double matchScore = (availabilityWeight * availabilityScore) +
                           (locationWeight * proximityScore) +
                           (skillWeight * skillMatchScore) +
                           (performanceWeight * reliabilityScore) +
                           (acceptanceWeight * acceptanceProbability);

        // Generate score explanation
        String explanation = generateScoreExplanation(
            availabilityScore, proximityScore, skillMatchScore, 
            reliabilityScore, acceptanceProbability
        );

        return new EnhancedVolunteerMatch(
            volunteer, matchScore, availabilityScore, proximityScore,
            skillMatchScore, reliabilityScore, acceptanceProbability, explanation
        );
    }

    /**
     * Get top ranked volunteers for an assistance request
     */
    public List<EnhancedVolunteerMatch> getTopRankedVolunteers(AssistanceRequest request, int limit) {
        List<Volunteer> allActiveVolunteers = volunteerRepository.findByActiveTrue();

        return allActiveVolunteers.stream()
                .map(volunteer -> calculateEnhancedMatch(request, volunteer))
                .filter(match -> match.getMatchScore() > 0.0)
                .sorted((m1, m2) -> Double.compare(m2.getMatchScore(), m1.getMatchScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private double calculateAvailabilityScore(AssistanceRequest request, Volunteer volunteer) {
        if (volunteer.getAvailableDays() == null || volunteer.getAvailableDays().isEmpty()) {
            return 0.0;
        }
        
        // Enhanced availability logic considering urgency
        if (request.getUrgencyLevel() != null) {
            switch (request.getUrgencyLevel()) {
                case HIGH:
                    // For urgent requests, check if volunteer is available today/weekend
                    return volunteer.getAvailableDays().size() >= 3 ? 1.0 : 0.5;
                case MEDIUM:
                    // For medium urgency, moderate availability requirement
                    return volunteer.getAvailableDays().size() >= 2 ? 1.0 : 0.6;
                case LOW:
                    // For low urgency, any availability is acceptable
                    return 0.8;
            }
        }
        
        return volunteer.getAvailableDays().size() >= 2 ? 1.0 : 0.7;
    }

    private double calculateProximityScore(AssistanceRequest request, Volunteer volunteer) {
        if (request.getLocation() == null || volunteer.getLocation() == null) {
            return 0.3; // Default penalty for missing location data
        }

        String requestLocation = request.getLocation().toLowerCase().trim();
        String volunteerLocation = volunteer.getLocation().toLowerCase().trim();

        // Exact match
        if (requestLocation.equals(volunteerLocation)) {
            return 1.0;
        }

        // Partial match (same city/area)
        if (requestLocation.contains(volunteerLocation) || 
            volunteerLocation.contains(requestLocation)) {
            return 0.8;
        }

        // Same state/region (simplified)
        String[] requestParts = requestLocation.split(",");
        String[] volunteerParts = volunteerLocation.split(",");
        
        if (requestParts.length >= 2 && volunteerParts.length >= 2) {
            String requestState = requestParts[requestParts.length - 1].trim();
            String volunteerState = volunteerParts[volunteerParts.length - 1].trim();
            
            if (requestState.equals(volunteerState)) {
                return 0.6;
            }
        }

        return 0.2; // Low score for distant locations
    }

    private double calculateSkillMatchScore(AssistanceRequest request, Volunteer volunteer) {
        if (request.getServiceType() == null || 
            volunteer.getServiceType() == null || 
            volunteer.getServiceType().isEmpty()) {
            return 0.0;
        }

        String requestedService = request.getServiceType().toLowerCase().trim();
        
        // Exact service type match
        for (String service : volunteer.getServiceType()) {
            if (service.toLowerCase().trim().equals(requestedService)) {
                return 1.0;
            }
        }

        // Partial match or related services
        for (String service : volunteer.getServiceType()) {
            String serviceLower = service.toLowerCase();
            if (serviceLower.contains(requestedService) || 
                requestedService.contains(serviceLower)) {
                return 0.7;
            }
        }

        return 0.0;
    }

    private double calculateReliabilityScore(Volunteer volunteer) {
        // Normalize rating to 0-1 scale
        double ratingScore = Math.min(volunteer.getRating() / 5.0, 1.0);
        
        // Boost for volunteers with higher ratings
        if (volunteer.getRating() >= 4.5) {
            return Math.min(ratingScore * 1.1, 1.0);
        }
        
        return ratingScore;
    }

    private String generateScoreExplanation(double availabilityScore, double proximityScore,
                                         double skillMatchScore, double reliabilityScore,
                                         double acceptanceProbability) {
        StringBuilder explanation = new StringBuilder();
        
        explanation.append("Match breakdown: ");
        
        if (availabilityScore >= 0.8) {
            explanation.append("✓ Excellent availability; ");
        } else if (availabilityScore >= 0.5) {
            explanation.append("◐ Moderate availability; ");
        } else {
            explanation.append("✗ Limited availability; ");
        }
        
        if (proximityScore >= 0.8) {
            explanation.append("✓ Very close location; ");
        } else if (proximityScore >= 0.5) {
            explanation.append("◐ Reasonable distance; ");
        } else {
            explanation.append("✗ Distant location; ");
        }
        
        if (skillMatchScore >= 0.8) {
            explanation.append("✓ Perfect skill match; ");
        } else if (skillMatchScore >= 0.5) {
            explanation.append("◐ Partial skill match; ");
        } else {
            explanation.append("✗ Poor skill match; ");
        }
        
        if (reliabilityScore >= 0.8) {
            explanation.append("✓ High reliability; ");
        } else if (reliabilityScore >= 0.5) {
            explanation.append("◐ Good reliability; ");
        } else {
            explanation.append("✗ Low reliability; ");
        }
        
        if (acceptanceProbability >= 0.8) {
            explanation.append("✓ High acceptance likelihood");
        } else if (acceptanceProbability >= 0.5) {
            explanation.append("◐ Moderate acceptance likelihood");
        } else {
            explanation.append("✗ Low acceptance likelihood");
        }
        
        return explanation.toString();
    }

    private EnhancedVolunteerMatch createZeroMatch(Volunteer volunteer, String reason) {
        return new EnhancedVolunteerMatch(
            volunteer, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, reason
        );
    }

    // Adaptive learning methods
    public void updateWeights(double availabilityWeight, double locationWeight, 
                            double skillWeight, double performanceWeight, 
                            double acceptanceWeight) {
        this.availabilityWeight = availabilityWeight;
        this.locationWeight = locationWeight;
        this.skillWeight = skillWeight;
        this.performanceWeight = performanceWeight;
        this.acceptanceWeight = acceptanceWeight;
    }
}
