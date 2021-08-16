"use strict";

class Api {
  BASE_API_URL = "http://jservice.io/api/";

  static async get(endpoint, parameters) {
    // let response = await axios.get(`${this.BASE_API_URL}/${endpoint}`, { params: parameters });
    let response = await axios.get(`${BASE_API_URL}/${endpoint}`, { params: parameters });
    return response.data;
  }
}