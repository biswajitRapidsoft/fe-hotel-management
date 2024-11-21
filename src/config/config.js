const config = Object.freeze({
  baseUrl: "http://192.168.12.41:9000/",
  apiName: {
    loginAsCustomer: "login/as/customer",
    loginAsStaff: "login",
    getAllState: "statelist",
    getAllCity: "citylist",
    getAllRoomTypesByCompany: "api/get/room/type/by/company",
    fileUpload: "api/upload",
    addHotel: "api/add/hotel",
    // DASHBOARD API ENDPOINTS
    getAllRoomListByHotelId: "api/get/room/list",

    // GUEST DASHBOARD API ENDPOINTS
    getAllHotels: "public/hotels/list",
    reserveHotelRoom: "book/new/room",
    getAllBookingDetails: "public/booking/data",
    cancelHotelRoom: "public/cancel/booking",
  },
});

export default config;

// http://192.168.12.41:9000/public/hotels/list
