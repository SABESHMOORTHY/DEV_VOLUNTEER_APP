-- VolunAI Seed Data: 10 Volunteers + 5 Service Requests

-- Volunteers
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('Aisha Patel', 'aisha.patel@email.com', '5551001001', 'New York', 4.8, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('Marcus Chen', 'marcus.chen@email.com', '5551001002', 'New York', 4.5, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('Sofia Rodriguez', 'sofia.rodriguez@email.com', '5551001003', 'Los Angeles', 4.9, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('James Okafor', 'james.okafor@email.com', '5551001004', 'Chicago', 4.2, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('Emily Watson', 'emily.watson@email.com', '5551001005', 'Chicago', 4.6, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('Raj Sharma', 'raj.sharma@email.com', '5551001006', 'San Francisco', 4.7, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('Olivia Kim', 'olivia.kim@email.com', '5551001007', 'Los Angeles', 3.9, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('David Nguyen', 'david.nguyen@email.com', '5551001008', 'New York', 4.3, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('Hannah Brooks', 'hannah.brooks@email.com', '5551001009', 'San Francisco', 4.1, true);
INSERT INTO volunteers (name, email, phone, location, rating, active) VALUES
('Carlos Mendez', 'carlos.mendez@email.com', '5551001010', 'Chicago', 4.4, true);

-- Volunteer Available Days
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (1, 'Monday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (1, 'Wednesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (1, 'Friday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (2, 'Tuesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (2, 'Thursday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (2, 'Saturday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (3, 'Monday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (3, 'Tuesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (3, 'Wednesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (3, 'Thursday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (3, 'Friday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (4, 'Saturday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (4, 'Sunday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (5, 'Monday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (5, 'Wednesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (5, 'Friday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (5, 'Saturday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (6, 'Tuesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (6, 'Thursday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (7, 'Monday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (7, 'Friday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (8, 'Wednesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (8, 'Thursday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (8, 'Friday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (9, 'Monday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (9, 'Tuesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (9, 'Saturday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (10, 'Wednesday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (10, 'Thursday');
INSERT INTO volunteer_available_days (volunteer_id, available_day) VALUES (10, 'Sunday');

-- Volunteer Service Types
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (1, 'Food Delivery');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (1, 'Medical Assistance');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (2, 'Home Repair');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (2, 'Transportation');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (3, 'Medical Assistance');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (3, 'Elder Care');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (3, 'Food Delivery');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (4, 'Home Repair');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (4, 'Cleaning');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (5, 'Transportation');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (5, 'Elder Care');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (6, 'Food Delivery');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (6, 'Medical Assistance');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (6, 'Transportation');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (7, 'Cleaning');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (7, 'Home Repair');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (8, 'Elder Care');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (8, 'Food Delivery');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (9, 'Transportation');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (9, 'Medical Assistance');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (10, 'Cleaning');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (10, 'Elder Care');
INSERT INTO volunteer_service_types (volunteer_id, service_type) VALUES (10, 'Home Repair');

-- Service Requests
INSERT INTO assistance_requests (requester_name, requester_contact, location, service_type, description, urgency_level, status) VALUES
('Maria Johnson', '5559001001', 'New York', 'Food Delivery', 'Elderly resident needs weekly grocery delivery. Lives alone on 5th floor, limited mobility.', 'HIGH', 'PENDING');

INSERT INTO assistance_requests (requester_name, requester_contact, location, service_type, description, urgency_level, status) VALUES
('Robert Lee', '5559001002', 'Chicago', 'Home Repair', 'Leaking roof needs urgent repair before winter storm. Senior citizen household.', 'HIGH', 'PENDING');

INSERT INTO assistance_requests (requester_name, requester_contact, location, service_type, description, urgency_level, status) VALUES
('Susan Park', '5559001003', 'Los Angeles', 'Medical Assistance', 'Patient needs transportation to weekly dialysis appointments on Wednesdays.', 'MEDIUM', 'PENDING');

INSERT INTO assistance_requests (requester_name, requester_contact, location, service_type, description, urgency_level, status) VALUES
('Thomas Brown', '5559001004', 'San Francisco', 'Transportation', 'Disabled veteran needs rides to VA hospital for physical therapy sessions.', 'MEDIUM', 'PENDING');

INSERT INTO assistance_requests (requester_name, requester_contact, location, service_type, description, urgency_level, status) VALUES
('Linda Davis', '5559001005', 'Chicago', 'Elder Care', 'Companionship and light housekeeping for elderly widow. Twice weekly visits needed.', 'LOW', 'PENDING');
