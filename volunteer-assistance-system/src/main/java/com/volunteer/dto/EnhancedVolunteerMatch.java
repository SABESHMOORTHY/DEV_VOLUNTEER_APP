package com.volunteer.dto;

import com.volunteer.model.Volunteer;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EnhancedVolunteerMatch {
    private Volunteer volunteer;
    private double matchScore;
    private double availabilityScore;
    private double proximityScore;
    private double skillMatchScore;
    private double reliabilityScore;
    private double acceptanceProbability;
    private String scoreExplanation;
    
    public EnhancedVolunteerMatch(Volunteer volunteer, double matchScore, 
                                double availabilityScore, double proximityScore,
                                double skillMatchScore, double reliabilityScore,
                                double acceptanceProbability, String scoreExplanation) {
        this.volunteer = volunteer;
        this.matchScore = matchScore;
        this.availabilityScore = availabilityScore;
        this.proximityScore = proximityScore;
        this.skillMatchScore = skillMatchScore;
        this.reliabilityScore = reliabilityScore;
        this.acceptanceProbability = acceptanceProbability;
        this.scoreExplanation = scoreExplanation;
    }
}
