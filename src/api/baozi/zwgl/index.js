import request from "@/utils/request";

/**
 * 查询全部座位,url: "/seat",
 * 搜索查询座位, url: "/seat/condition",
 */
export function allSeatApi(data) {
  return request({
    url: "/seat/condition",
    method: "get",
    params: {
      page_no: data.page_no,
      page_size: data.page_size,
      seat_status_id: data.seat_status_id,
      seat_number: data.seat_number,
      reserve_id: data.seat_reserve,
      classroom_name: data.classroom_name,
      building_name: data.building_name,
      campus_id: data.campus_id,
      building_id: data.building_id,
      classroom_id: data.classroom_id,
    },
  });
}

/**
 * 查询校区列表
 */
export function allSampusApi() {
  return request({
    url: "/seat/list_campus",
    method: "get",
  });
}

/**
 * 查询楼栋,校区id
 */
export function allBuildingApi(id) {
  return request({
    url: "/seat/list_building",
    method: "get",
    params: {
      id,
    },
  });
}

/**
 * 查询座位，id
 */
export function SeatIdApi(id) {
  return request({
    url: "/seat/query-id",
    method: "get",
    params: {
      id,
    },
  });
}

/**
 * 查询教室，楼栋id
 */
export function allClassroomApi(id) {
  return request({
    url: "/seat/list_classroom",
    method: "get",
    params: {
      id,
    },
  });
}

/**
 *  删除座位
 */
export function batchDelApi(data) {
  return request({
    url: "/seat/batch-del",
    method: "post",
    data: {
      id: data,
    },
  });
}

/**
 *  新增座位
 */
export function AddApi(data) {
  return request({
    url: "/seat/add",
    method: "post",
    data: {
      building_id: `${data.building_id}`,
      campus_id: `${data.campus_id}`,
      classroom_id: `${data.classroom_id}`,
      seat_number: data.seat_number,
      seat_status: `${data.seat_status}`,
      seat_reserve: "0",
    },
  });
}
/**
 *  修改座位
 */
export function SeatupdateApi(id, data) {
  return request({
    url: "/seat/update",
    method: "post",
    data: {
      id: `${id}`,
      building_id: `${data.building_id}`,
      campus_id: `${data.campus_id}`,
      classroom_id: `${data.classroom_id}`,
      seat_number: data.seat_number,
      seat_status: `${data.seat_status}`,
      seat_reserve: `${data.seat_reserve}`,
    },
  });
}

/**
 * 批量导入文件模板
 */
export function ExelApi() {
  return request({
    url: "/seat/exel",
    method: "get",
  });
}
/**
 * 批量导入文件
 */
export function addBatchApi(data) {
  return request({
    url: "/seat/batch-add",
    method: "post",
    data: {
      file: data,
    },
  });
}
