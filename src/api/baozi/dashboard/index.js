import request from "@/utils/request";

/**
 * 获取全部数据
 */
export function allInformationApi() {
  return request({
    url: "/data/top/reserveInformation",
    method: "get",
  });
}

/**
 * 饼图预约情况
 */
export function pieOrderApi(data) {
  return request({
    url: "/data/college/reserveInformation",
    method: "get",
    params: {
      time_type: data,
    },
  });
}

/**
 * 获取最受欢迎的七个教室
 */
export function barOrderApi() {
  return request({
    url: "/data/classroom/reserveInformation",
    method: "get",
  });
}
/**
 * 按天查询预约
 */
export function daySeekApi(start_day, end_day) {
  return request({
    url: "/data/min/reserveCountDay",
    method: "get",
    params: {
      start_day,
      end_day,
    },
  });
}
/**
 * 按月份查询预约
 */
export function monthSeekApi(start_month, end_month) {
  return request({
    url: "/data/min/reserveCountMonth",
    method: "get",
    params: {
      start_month,
      end_month,
    },
  });
}
