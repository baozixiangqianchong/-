//预约js
import request from "@/utils/request";

//获取列表数据
export function dataList(page, page_size) {
  return request({
    url: `/reservation?page=${page}&page_size=${page_size}`,
    method: "GET",
    // params:{page,page_size}
  });
}

//关键词查询
export function selKeywords(
  page,
  page_size,
  building,
  student_number,
  seat,
  reserve_status,
  classroom,
  name,
  appointment_time_start,
  appointment_time_end
) {
  return request({
    url: `/reservation/condition`,
    method: "GET",
    params: {
      page,
      page_size,
      building,
      student_number,
      seat,
      reserve_status,
      classroom,
      name,
      appointment_time_start,
      appointment_time_end,
    },
  });
}

//取消预约
export function canSub(id) {
  return request({
    url: `/reservation/cancel`,
    method: "POST",
    data: {
      id,
    },
  });
}
