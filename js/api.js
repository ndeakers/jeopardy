"use strict";
const BASE_API_URL = "https://jservice.io/api";
class Api {
  static async get(endpoint, parameters) {
    let response = await axios.get(`${BASE_API_URL}/${endpoint}`, { params: parameters });
    return response.data;
  }
}