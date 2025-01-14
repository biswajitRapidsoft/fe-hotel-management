// SPA BOOKING STATUSES
export const BOOKED_SPA = "BOOKED";
export const CONFIRMED_SPA = "CONFIRMED";
export const CANCELLED_SPA = "CANCELLED";
export const ACTIVE_SPA = "ACTIVE";
export const DONE_SPA = "DONE";
export const CANCELLATION_REQUESTED_SPA = "CANCELLATION_REQUESTED";

// SPA SLOT TYPE
export const DAY = "Day";
export const NIGHT = "Night";

// BAR ORDER STATUS
export const CANCELLED_BAR = "CANCELLED";
export const DELIVERED_BAR = "DELIVERED";
export const PROCESSING_BAR = "PROCESSING";
export const PLACED_BAR = "PLACED";

//FOOD ORDER STATUSES
export const ORDER_PLACED = "Order_Placed";
export const FOOD_PREPARING = "Food_Preparing";
export const DELIVERED = "Delivered";
export const CANCELLED = "Cancelled";
export const REJECTED = "Rejected";

// ROLES
export const SUPER_ADMIN = "SUPER_ADMIN";
export const ADMIN = "Admin";
export const CUSTOMER = "Customer";
export const FRONTDESK = "Front_Desk_Staff";
export const HOUSEKEEPER = "Housekeeping_Staff";
export const KITCHENSTAFF = "Kitchen_Staff";
export const GUARD = "Guard";
export const BARSTAFF = "Bar_Staff";
export const MANAGER = "Manager";
//ROOM STATUSES
export const AVAILABLE = { id: 1, key: "Available" };
export const RESERVED = { id: 2, key: "Reserved" };
export const OCCUPIED = { id: 3, key: "Occupied" };
export const NOT_AVAILABLE = { id: 4, key: "Not Available" };
export const BEING_SERVICED = { id: 5, key: "Being Serviced" };

// GOVT IDS
export const AADHAAR_CARD = {
  id: 1,
  key: "Aadhaar_Card",
  name: "Aadhaar Card",
};
export const PAN_CARD = { id: 2, key: "PAN_Card", name: "PAN Card" };
export const DRIVING_LICENSE = {
  id: 3,
  key: "Driving_License",
  name: "Driving License",
};
export const PASSPORT = { id: 4, key: "Passport", name: "Passport" };
export const VOTER_ID_CARD = {
  id: 5,
  key: "Voter_ID_Card",
  name: "Voter ID Card",
};
export const GOVERNMENT_EMPLOYEE_ID_CARD = {
  id: 6,
  key: "Government_Employee_ID_Card",
  name: "Govt Employee ID",
};
export const STUDENT_ID_CARD = {
  id: 7,
  key: "Student_ID_Card",
  name: "Student ID Card",
};
