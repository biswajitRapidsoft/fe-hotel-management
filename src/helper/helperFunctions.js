import {
  AVAILABLE,
  BEING_SERVICED,
  NOT_AVAILABLE,
  OCCUPIED,
  RESERVED,
} from "./constants";

export function checkRoomStatusType(roomData) {
  if (roomData) {
    if (Boolean(roomData?.isAvailable) && !Boolean(roomData?.isBooked)) {
      return AVAILABLE;
    } else if (Boolean(roomData?.isAvailable) && Boolean(roomData?.isBooked)) {
      return RESERVED;
    } else if (!Boolean(roomData?.isAvailable) && Boolean(roomData?.isBooked)) {
      return OCCUPIED;
    } else if (
      !Boolean(roomData?.isActive) &&
      !Boolean(roomData?.isAvailable)
    ) {
      return NOT_AVAILABLE;
    } else if (
      Boolean(roomData?.isActive) &&
      Boolean(roomData?.isServiceGoingOn)
    ) {
      return BEING_SERVICED;
    } else {
      console.log("no status match found!");
      return null;
    }
  } else {
    return null;
  }
}
