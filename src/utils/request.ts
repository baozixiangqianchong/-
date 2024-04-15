import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { useUserStoreHook } from "@/store/modules/user";

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStoreHook();
    if (userStore.token) {
      config.headers.Authorization = userStore.token;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message } = response.data;
    // token即将过期，更换新token。
    if (response.headers.hasOwnProperty("new-seat-token")) {
      localStorage.setItem(
        "accessToken",
        "Bearer" + " " + response.headers["new-seat-token"]
      );
    }
    // if (code === "00000") {
    if (code === 2000) {
      return response.data;
    }

    // 响应数据为二进制流处理(Excel导出)
    if (response.data instanceof ArrayBuffer) {
      return response;
    }
    ElMessage.error(message || "系统出错");
    console.log("sjdfksdjf");
    return Promise.reject(new Error(message || "Error"));
  },
  (error: any) => {
    // token即将过期，更换新token。
    if (error.response.headers.hasOwnProperty("new-seat-token")) {
      localStorage.setItem(
        "accessToken",
        "Bearer" + " " + error.response.headers["new-seat-token"]
      );
    }
    if (error.response.data) {
      const { code, message } = error.response.data;
      // token 过期,重新登录
      if (code === "A0230") {
        ElMessageBox.confirm("当前页面已失效，请重新登录", "提示", {
          confirmButtonText: "确定",
          type: "warning",
        }).then(() => {
          const userStore = useUserStoreHook();
          userStore.resetToken().then(() => {
            location.reload();
          });
        });
      } else {
        ElMessage.error(message || "系统出错");
      }
    }
    if (error.response.status === 403) {
      ElMessage.error("没有权限！");
    }
    return Promise.reject(error.message);
  }
);

// 导出 axios 实例
export default service;
