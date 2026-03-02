package com.volunteer.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class RequestInterpretation {
    private String serviceType;
    private String urgencyLevel;
    private List<String> requiredSkills;
    private String location;
    private String confidence;
    private String originalDescription;
    
    public RequestInterpretation(String serviceType, String urgencyLevel, 
                               List<String> requiredSkills, String location, 
                               String confidence, String originalDescription) {
        this.serviceType = serviceType;
        this.urgencyLevel = urgencyLevel;
        this.requiredSkills = requiredSkills;
        this.location = location;
        this.confidence = confidence;
        this.originalDescription = originalDescription;
    }
}
