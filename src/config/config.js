const config = Object.freeze({
  baseUrl: "http://192.168.12.41:9000/",
  // baseUrl: "http://192.168.12.43:8080/be-hms/",
  // baseUrl: "http://192.168.30.44:9000/",

  apiName: {
    loginAsCustomer: "login/as/customer",
    loginAsStaff: "login",
    changePassword: "forget/password",
    getAllState: "statelist",
    getAllCity: "citylist",
    getAllRoomTypesByCompany: "api/get/room/type/by/company",
    fileUpload: "api/upload",
    addHotel: "api/add/hotel",
    getHotelListByCompany: "api/get/all/hotels",
    getAllExtraItems: "api/get/all/extra/items",
    addRoomType: "api/save/master/room/type",
    addExtraItem: "api/add/new/item",
    getAllUsersByCompany: "api/get/all/users",
    getAllRoles: "api/get/all/role/type",
    saveUser: "user/registration",
    getMasterDataList: "api/get/master/data/list",
    getAllFood: "public/get/all/food",
    // DASHBOARD API ENDPOINTS
    getAllRoomListByHotelId: "api/get/room/list",
    getAllGovtIds: "api/get/all/govt/ids",
    getAllPaymentMethods: "api/get/all/payment/methods",
    saveCustomerCheckIn: "api/customer/checkin",
    getTodayCheckoutRoomsByHotelId: "api/get/today/checkout/rooms",
    requestRoomCheckout: "public/room/checkout/request",
    finalRoomCheckOut: "api/customer/checkout",
    roomCleanRequest: "public/room/clean/request",
    roomtypeByHotelId: "api/roomtype/by/hotelId",

    //FRONTDESK BOOKING HISTORY
    roomBookingHistoryByHotelId: "api/booking/history",
    getAllBookingStatusType: "api/get/all/booking/status/type",
    conFirmBooking: "api/confirm/booking",
    getRoomsByRoomType: "api/get/room/by/roomtype",
    bookingByFrontDeskStaff: "api/booking/by/frontdesk/staff",

    // GUEST DASHBOARD API ENDPOINTS
    getAllHotels: "public/hotels/list",
    reserveHotelRoom: "book/new/room",
    getAllBookingDetails: "public/booking/data",
    cancelHotelRoom: "public/cancel/booking",
    getUserDetailsForBooking: "public/customer/details",

    // HOUSE-KEEPER DASHBOARD API ENDPOINTS
    getServiceableRoomData: "api/get/service/requested/rooms",
    approveHouseKeepingService: "api/approve/service/request",
  },
});

export default config;
