const config = Object.freeze({
  // baseUrl: "http://192.168.12.37:9000/",
  // baseUrl: "http://192.168.30.44:8070/be-hms/",
  // baseUrl: "http://crimarrstaging.nyggs.com/backend/",
  // baseUrl: "http://192.168.30.44:9000/",
  baseUrl: "http://192.168.12.43:8080/be-hms/",
  apiName: {
    loginAsCustomer: "login/as/customer",
    loginAsStaff: "login",
    changePassword: "forget/password",
    getAllState: "statelist",
    getAllCity: "citylist",
    getAllRoomTypesByCompany: "api/get/room/type/by/company",
    fileUpload: "api/upload",
    addHotel: "api/add/hotel",
    updateHotel: "api/update/hotel",
    changeRoomStatus: "api/room/status/change/by/roomId",
    getHotelListByCompany: "api/get/all/hotels",
    getAllExtraItems: "api/get/all/extra/items",
    addRoomType: "api/save/master/room/type",
    addExtraItem: "api/add/new/item",
    getAllUsersByCompany: "api/get/all/users",
    getAllRoles: "api/get/all/role/type",
    saveUser: "user/registration",
    getMasterDataList: "api/get/master/data/list",
    getAllFood: "public/get/all/food",
    orderFood: "public/order/food",
    getDineType: "public/get/all/dinning/type",
    getCustomerOrdeHistory: "public/get/individual/customer/food/history",
    updateFoodOrderStatus: "public/change/food/order/status",
    getFoodOrderListAdmin: "api/get/today/order/history",
    getAllFoodOrderStatus: "public/get/all/dinning/status/type",
    rateFood: "public/rate/your/food",
    addHall: "api/add/new/hall",
    getAllHalls: "api/get/all/halls",
    addBanquet: "api/create/new/banquet",
    getAllBanquet: "api/get/all/banquets/by/hotel",
    createPromocode: "api/create/new/promocode",
    getAllPromoCode: "public/get/all/resturant/promocode",
    getAllPromocodeTypes: "api/get/all/promocode/type",

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
    getPendingBookingRequestCounts:
      "api/get/pending/state/booking/request/count",

    //FRONTDESK BOOKING HISTORY
    roomBookingHistoryByHotelId: "api/booking/history",
    getAllBookingStatusType: "api/get/all/booking/status/type",
    conFirmBooking: "api/confirm/booking",
    getRoomsByRoomType: "api/get/room/by/roomtype",
    bookingByFrontDeskStaff: "api/booking/by/frontdesk/staff",
    getRoomBookingChart: "api/get/room/booking/chart/data",
    approveBookingCancelRequest: "api/approve/booking/cancel/request",

    // HALL BOOKING DASHBOARD
    getAllHallBookings: "api/get/all/hall/bookings/data",
    getAllHallStatus: "api/get/all/hall/status",
    getAllHallsByHotelIdForHallBooking: "api/get/all/halls",
    getHallBookingChart: "api/get/hall/chart/data",
    getIndividualHallBookingDataById: "api/get/individual/hall/booking/data",
    bookHallFromFrontdesk: "api/book/hall",
    getAllBanquetsByHotelId: "api/get/all/banquets/by/hotel",
    changeHallBookingStatus: "api/change/hall/booking/status",

    // GUEST DASHBOARD API ENDPOINTS
    getAllHotels: "public/hotels/list",
    reserveHotelRoom: "book/new/room",
    getAllBookingDetails: "public/booking/data",
    cancelHotelRoom: "public/cancel/booking",
    getUserDetailsForBooking: "public/customer/details",
    getAllRestaurantPromocodeByHotelId: "public/get/all/resturant/promocode",

    // HOUSE-KEEPER DASHBOARD API ENDPOINTS
    getServiceableRoomData: "api/get/service/requested/rooms",
    approveHouseKeepingService: "api/approve/service/request",
    getAllLaundryHistory: "public/get/all/laundry/services/history",
    laundryRequest: "public/request/for/laundry/service",
    getAllLaundryStatus: "api/get/all/laundry/status",
    changeLaundryStatus: "api/change/laundry/service/status",
    addRatingForLaundry: "public/rate/laundry/service",
    getAllRoomServiceHistory: "api/get/all/room/service/request/list",
    getAllHouseKeepingStaff: "api/get/all/housekeeping/staff/list",
    assignHouseKeepingRequest: "api/assign/housekeeping/staff",

    // PARKING DASHBOARD DATA
    getAllParkingData: "api/get/all/parking/list",
    parkVehicle: "api/park/vehicle",
    releaseVehicle: "api/release/vehicle",
  },
});

export default config;
