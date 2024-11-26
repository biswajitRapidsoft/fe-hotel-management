const config = Object.freeze({
  baseUrl: "http://192.168.12.41:9000/",
  // baseUrl: "http://192.168.12.43:8080/be-hms/",
  apiName: {
    loginAsCustomer: "login/as/customer",
    loginAsStaff: "login",
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
    // DASHBOARD API ENDPOINTS
    getAllRoomListByHotelId: "api/get/room/list",
    getAllGovtIds: "api/get/all/govt/ids",
    getAllPaymentMethods: "api/get/all/payment/methods",
    saveCustomerCheckIn: "api/customer/checkin",
    getTodayCheckoutRoomsByHotelId: "api/get/today/checkout/rooms",
    requestRoomCheckout: "api/room/checkout/request",

    // GUEST DASHBOARD API ENDPOINTS
    getAllHotels: "public/hotels/list",
    reserveHotelRoom: "book/new/room",
    getAllBookingDetails: "public/booking/data",
    cancelHotelRoom: "public/cancel/booking",

    // HOUSE-KEEPER DASHBOARD API ENDPOINTS
    getServiceableRoomData: "api/get/service/requested/rooms",
    approveHouseKeepingService: "api/approve/service/request",
  },
});

export default config;
