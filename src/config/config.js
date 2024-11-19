const config = Object.freeze({
  baseUrl: "http://192.168.12.41:9000/",
  apiName: {
    loginAsCustomer: "login/as/customer",
    loginAsStaff: "login",
    getAllState: "statelist",
    getAllCity: "citylist",

    // DASHBOARD API ENDPOINTS
    roomListByHotelId: "get/room/list",

    getAllHotels: "public/hotels/list",
  },
});

export default config;

// http://192.168.12.41:9000/public/hotels/list
