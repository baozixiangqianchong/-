//楼栋js
import request from "@/utils/request";

//查询楼栋信息
export function selectFloorInfo(
  page_no,
  page_size,
  build_name,
  lock_start_time,
  lock_end_time,
  build_status
) {
  return request({
    url: `/buildAdmin/condition/queryBuild`,
    method: "POST",
    data: {
      page_no,
      page_size,
      build_name,
      lock_start_time,
      lock_end_time,
      build_status,
    },
  });
}

//单独增加楼栋
export function onceAddFloor(
  head_img,
  name,
  campus_name,
  building_status,
  longitude,
  latitude,
  lock_start_time,
  lock_end_time
) {
  console.log(
    "增加参数",
    "@",
    head_img,
    "@",
    name,
    "@",
    campus_name,
    "@",
    building_status,
    "@",
    longitude,
    "@",
    latitude,
    "@",
    lock_start_time,
    "@",
    lock_end_time
  );
  return request({
    url: `/buildAdmin/one/addBuild`,
    method: "POST",
    data: {
      head_img,
      name,
      campus_name,
      building_status,
      longitude,
      latitude,
      lock_start_time,
      lock_end_time,
    },
  });
}

//根据id查询楼栋//注意！！！为path参数，后续出错可来参考
export function getFloorToId(build_id) {
  return request({
    url: `/buildAdmin/queryBuild/${build_id}`, //可能会错
    method: "GET",
  });
}

//根据id修改楼栋信息
export function updFloorToId(
  name,
  lock_start_time,
  lock_end_time,
  campus_id,
  building_status,
  build_id,
  head_img,
  longitude,
  latitude
) {
  console.log();
  return request({
    url: `/buildAdmin/update/build`,
    method: "POST",
    data: {
      name,
      lock_start_time,
      lock_end_time,
      campus_id,
      building_status,
      build_id,
      head_img,
      longitude,
      latitude,
    },
  });
}

//管理员删除楼栋
export function delFloorAdm(build_ids) {
  return request({
    url: `/buildAdmin/delete/builds`,
    method: "POST",
    data: {
      build_ids,
    },
  });
}

//得到所有校区信息
export function getAllSchoolInfo() {
  return request({
    url: `/buildAdmin/get/allCampus`,
    method: "GET",
  });
}

//根据校区名字得到校区id
export function getIdToName(campus_name) {
  return request({
    url: `/buildAdmin/get/campusId?campus_name=${campus_name}`,
    method: "GET",
  });
}

//Excel表导入楼栋信息
export function setInfoToExcel(build) {
  return request({
    url: `/buildAdmin/excel/BuildInformation`,
    method: "POST",
    data: {
      build,
    },
  });
}

//获取Excel模板文件
export function getExcel() {
  return request({
    url: `/buildAdmin/get/excel`,
    method: "POST",
  });
}
