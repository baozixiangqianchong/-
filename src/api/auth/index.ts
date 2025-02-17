import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { CaptchaResult, LoginData, LoginResult } from "./types";

/**
 * 登录API
 *
 * @param data {LoginData}
 * @returns
 */
export function loginApi(data: LoginData): AxiosPromise<LoginResult> {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("password", data.password);
  // formData.append("verifyCodeKey", data.verifyCodeKey || "");
  // formData.append("verifyCode", data.verifyCode || "");
  return request({
    // url: "/api/v1/auth/login",
    url: "/login",
    method: "post",
    data: formData,
    headers: {
      // "Content-Type": "multipart/form-data",
      "Content-Type": "application/json",
    },
  });
}

/**
 * 注销API
 */
export function logoutApi() {
  // return request({
  //   url: "/api/v1/auth/logout",
  //   method: "delete",
  // });
  return Promise.resolve({
    code: 2000,
    data: {},
    msg: "退出成功",
  });
}

/**
 * 获取验证码
 */
export function getCaptchaApi(): AxiosPromise<CaptchaResult> {
  return request({
    url: "/api/v1/auth/captcha",
    method: "get",
  });
}
