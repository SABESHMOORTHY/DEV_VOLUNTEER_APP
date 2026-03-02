package com.volunteer.service;

import com.volunteer.dto.RequestInterpretation;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class RequestUnderstandingService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RequestUnderstandingService.class);

    private static final Map<String, String> SERVICE_KEYWORDS = Map.ofEntries(
        Map.entry("food|grocery|meal|hungry|delivery", "Food Delivery"),
        Map.entry("medical|medicine|hospital|doctor|pharmacy|prescription", "Medical Assistance"),
        Map.entry("transport|ride|drive|pickup|drop|airport", "Transportation"),
        Map.entry("companion|visit|talk|lonely|elderly|senior", "Companionship"),
        Map.entry("shopping|errand|store|buy|purchase", "Shopping Assistance"),
        Map.entry("repair|fix|maintenance|handyman|house", "Home Repair"),
        Map.entry("clean|cleaning|household|chores", "Cleaning Services"),
        Map.entry("child|babysit|kids|tutor|homework", "Childcare"),
        Map.entry("pet|dog|cat|animal|vet|walk", "Pet Care"),
        Map.entry("technology|computer|phone|internet|tech", "Technical Support")
    );

    private static final Map<String, String> URGENCY_KEYWORDS = Map.ofEntries(
        Map.entry("urgent|emergency|immediate|asap|critical|right now", "HIGH"),
        Map.entry("soon|today|quickly|prompt|this week", "MEDIUM"),
        Map.entry("sometime|when possible|no rush|flexible", "LOW")
    );

    private static final Map<String, List<String>> SKILL_KEYWORDS = Map.ofEntries(
        Map.entry("medical|medicine|doctor|nurse|healthcare", Arrays.asList("Medical Knowledge", "First Aid")),
        Map.entry("drive|car|vehicle|transport", Arrays.asList("Driving", "Valid License")),
        Map.entry("heavy|lift|carry|move|strength", Arrays.asList("Physical Strength", "Heavy Lifting")),
        Map.entry("computer|tech|software|internet", Arrays.asList("Technical Skills", "Computer Literacy")),
        Map.entry("child|kid|babysit|tutor", Arrays.asList("Childcare", "Teaching")),
        Map.entry("pet|animal|dog|cat", Arrays.asList("Animal Care", "Pet Handling")),
        Map.entry("elderly|senior|care|compassion", Arrays.asList("Elder Care", "Patience", "Compassion")),
        Map.entry("language|speak|translate", Arrays.asList("Communication", "Language Skills"))
    );

    /**
     * Parse and interpret user request description using NLP techniques
     */
    public RequestInterpretation interpretRequest(String description) {
        log.info("Interpreting request: {}", description);
        
        String normalizedDesc = description.toLowerCase().trim();
        
        // Extract service type
        String serviceType = extractServiceType(normalizedDesc);
        
        // Extract urgency level
        String urgencyLevel = extractUrgencyLevel(normalizedDesc);
        
        // Extract required skills
        List<String> requiredSkills = extractRequiredSkills(normalizedDesc);
        
        // Extract location (if mentioned)
        String location = extractLocation(normalizedDesc);
        
        // Calculate confidence based on keyword matches
        String confidence = calculateConfidence(serviceType, urgencyLevel, requiredSkills, location);
        
        RequestInterpretation interpretation = new RequestInterpretation(
            serviceType, urgencyLevel, requiredSkills, location, confidence, description
        );
        
        log.info("Request interpreted: serviceType={}, urgency={}, skills={}, confidence={}",
                serviceType, urgencyLevel, requiredSkills, confidence);
        
        return interpretation;
    }

    private String extractServiceType(String description) {
        for (Map.Entry<String, String> entry : SERVICE_KEYWORDS.entrySet()) {
            Pattern pattern = Pattern.compile(entry.getKey(), Pattern.CASE_INSENSITIVE);
            if (pattern.matcher(description).find()) {
                return entry.getValue();
            }
        }
        return "General Assistance"; // Default fallback
    }

    private String extractUrgencyLevel(String description) {
        for (Map.Entry<String, String> entry : URGENCY_KEYWORDS.entrySet()) {
            Pattern pattern = Pattern.compile(entry.getKey(), Pattern.CASE_INSENSITIVE);
            if (pattern.matcher(description).find()) {
                return entry.getValue();
            }
        }
        return "MEDIUM"; // Default fallback
    }

    private List<String> extractRequiredSkills(String description) {
        Set<String> skills = new HashSet<>();
        
        for (Map.Entry<String, List<String>> entry : SKILL_KEYWORDS.entrySet()) {
            Pattern pattern = Pattern.compile(entry.getKey(), Pattern.CASE_INSENSITIVE);
            if (pattern.matcher(description).find()) {
                skills.addAll(entry.getValue());
            }
        }
        
        return new ArrayList<>(skills);
    }

    private String extractLocation(String description) {
        // Simple location extraction - look for common location indicators
        Pattern locationPattern = Pattern.compile(
            "\\b(in|at|near|around)\\s+([A-Za-z\\s]+?)(?:\\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl|square|sq))\\b",
            Pattern.CASE_INSENSITIVE
        );
        
        java.util.regex.Matcher matcher = locationPattern.matcher(description);
        if (matcher.find()) {
            return matcher.group(2).trim();
        }
        
        // Look for city names (simplified - common US cities)
        String[] cities = {"New York", "Los Angeles", "Chicago", "Houston", "Phoenix", 
                          "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"};
        
        for (String city : cities) {
            if (description.toLowerCase().contains(city.toLowerCase())) {
                return city;
            }
        }
        
        return null; // Location not found in description
    }

    private String calculateConfidence(String serviceType, String urgencyLevel, 
                                     List<String> requiredSkills, String location) {
        int matches = 0;
        int total = 4;
        
        if (!"General Assistance".equals(serviceType)) matches++;
        if (!"MEDIUM".equals(urgencyLevel)) matches++;
        if (!requiredSkills.isEmpty()) matches++;
        if (location != null) matches++;
        
        double confidenceRatio = (double) matches / total;
        
        if (confidenceRatio >= 0.75) return "HIGH";
        if (confidenceRatio >= 0.5) return "MEDIUM";
        return "LOW";
    }
}
