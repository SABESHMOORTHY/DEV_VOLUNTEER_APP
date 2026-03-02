package com.volunteer.service;

import com.volunteer.model.AssistanceRequest;
import com.volunteer.model.UrgencyLevel;
import com.volunteer.model.Volunteer;
import com.volunteer.repository.AssistanceRequestRepository;
import com.volunteer.repository.VolunteerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {

    private final VolunteerRepository volunteerRepository;
    private final AssistanceRequestRepository requestRepository;

    public DataInitializationService(VolunteerRepository volunteerRepository, 
                                   AssistanceRequestRepository requestRepository) {
        this.volunteerRepository = volunteerRepository;
        this.requestRepository = requestRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (volunteerRepository.count() == 0) {
            initializeSampleData();
        }
    }

    public void initializeSampleData() {
        // Create sample volunteers
        List<Volunteer> volunteers = createSampleVolunteers();
        volunteerRepository.saveAll(volunteers);

        // Create sample assistance requests
        List<AssistanceRequest> requests = createSampleRequests();
        requestRepository.saveAll(requests);

        System.out.println("Sample data initialized successfully!");
        System.out.println("Created " + volunteers.size() + " volunteers");
        System.out.println("Created " + requests.size() + " assistance requests");
    }

    private List<Volunteer> createSampleVolunteers() {
        return Arrays.asList(
            // Volunteer 1: High reliability, medical skills
            createVolunteer("Dr. Sarah Johnson", "sarah.johnson@email.com", "555-0101",
                "New York", Arrays.asList("Monday", "Wednesday", "Friday", "Saturday"),
                Arrays.asList("Medical Assistance", "Transportation", "Companionship"), 4.8),

            // Volunteer 2: Food delivery specialist
            createVolunteer("Michael Chen", "michael.chen@email.com", "555-0102",
                "New York", Arrays.asList("Tuesday", "Thursday", "Saturday", "Sunday"),
                Arrays.asList("Food Delivery", "Shopping Assistance", "Transportation"), 4.6),

            // Volunteer 3: Multi-skilled helper
            createVolunteer("Emily Rodriguez", "emily.rodriguez@email.com", "555-0103",
                "Brooklyn", Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"),
                Arrays.asList("Food Delivery", "Pet Care", "Home Repair", "Cleaning Services"), 4.5),

            // Volunteer 4: Elder care specialist
            createVolunteer("James Wilson", "james.wilson@email.com", "555-0104",
                "Manhattan", Arrays.asList("Weekend", "Evening"),
                Arrays.asList("Companionship", "Medical Assistance", "Childcare"), 4.9),

            // Volunteer 5: Technical support expert
            createVolunteer("Lisa Anderson", "lisa.anderson@email.com", "555-0105",
                "Queens", Arrays.asList("Monday", "Wednesday", "Friday"),
                Arrays.asList("Technical Support", "Home Repair", "Transportation"), 4.3),

            // Volunteer 6: Pet care specialist
            createVolunteer("David Martinez", "david.martinez@email.com", "555-0106",
                "Bronx", Arrays.asList("Tuesday", "Thursday", "Saturday"),
                Arrays.asList("Pet Care", "Transportation", "Shopping Assistance"), 4.7),

            // Volunteer 7: Childcare expert
            createVolunteer("Jennifer Taylor", "jennifer.taylor@email.com", "555-0107",
                "New York", Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"),
                Arrays.asList("Childcare", "Companionship", "Educational Support"), 4.8),

            // Volunteer 8: Handyman services
            createVolunteer("Robert Brown", "robert.brown@email.com", "555-0108",
                "Brooklyn", Arrays.asList("Saturday", "Sunday"),
                Arrays.asList("Home Repair", "Cleaning Services", "Heavy Lifting"), 4.4),

            // Volunteer 9: Transportation specialist
            createVolunteer("Maria Garcia", "maria.garcia@email.com", "555-0109",
                "Queens", Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"),
                Arrays.asList("Transportation", "Shopping Assistance", "Food Delivery"), 4.6),

            // Volunteer 10: Multi-purpose volunteer
            createVolunteer("Thomas Lee", "thomas.lee@email.com", "555-0110",
                "Manhattan", Arrays.asList("Flexible", "Weekend"),
                Arrays.asList("Food Delivery", "Companionship", "Pet Care", "Technical Support"), 4.2)
        );
    }

    private Volunteer createVolunteer(String name, String email, String phone, String location,
                                    List<String> availableDays, List<String> serviceTypes, double rating) {
        Volunteer volunteer = new Volunteer();
        volunteer.setName(name);
        volunteer.setEmail(email);
        volunteer.setPhone(phone);
        volunteer.setLocation(location);
        volunteer.setAvailableDays(availableDays);
        volunteer.setServiceType(serviceTypes);
        volunteer.setRating(rating);
        volunteer.setActive(true);
        return volunteer;
    }

    private List<AssistanceRequest> createSampleRequests() {
        return Arrays.asList(
            // Request 1: Urgent medical assistance
            createRequest("Alice Smith", "555-0201", "Manhattan", "Medical Assistance",
                "Elderly person needs medication pickup from pharmacy urgently", UrgencyLevel.HIGH),

            // Request 2: Food delivery
            createRequest("Bob Johnson", "555-0202", "Brooklyn", "Food Delivery",
                "Need grocery delivery for family with COVID-19 quarantine", UrgencyLevel.MEDIUM),

            // Request 3: Pet care
            createRequest("Carol Williams", "555-0203", "Queens", "Pet Care",
                "Need someone to walk dog twice daily while recovering from surgery", UrgencyLevel.MEDIUM),

            // Request 4: Technical support
            createRequest("Daniel Davis", "555-0204", "Bronx", "Technical Support",
                "Senior citizen needs help setting up video call for family reunion", UrgencyLevel.LOW),

            // Request 5: Home repair
            createRequest("Eva Martinez", "555-0205", "Manhattan", "Home Repair",
                "Need help fixing leaky faucet in kitchen", UrgencyLevel.MEDIUM)
        );
    }

    private AssistanceRequest createRequest(String requesterName, String requesterContact, String location,
                                         String serviceType, String description, UrgencyLevel urgencyLevel) {
        AssistanceRequest request = new AssistanceRequest();
        request.setRequesterName(requesterName);
        request.setRequesterContact(requesterContact);
        request.setLocation(location);
        request.setServiceType(serviceType);
        request.setDescription(description);
        request.setUrgencyLevel(urgencyLevel);
        request.setStatus(com.volunteer.model.RequestStatus.PENDING);
        return request;
    }

    public void resetDemoData() {
        // Clear existing data
        requestRepository.deleteAll();
        volunteerRepository.deleteAll();
        
        // Reinitialize
        initializeSampleData();
    }
}
