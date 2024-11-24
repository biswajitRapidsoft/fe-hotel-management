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
    getAllGovtIds: "api/get/all/govt/ids",
    getAllPaymentMethods: "api/get/all/payment/methods",
    saveCustomerCheckIn: "api/customer/checkin",

    getAllHotels: "public/hotels/list",
  },
});

export default config;

// http://192.168.12.41:9000/public/hotels/list
