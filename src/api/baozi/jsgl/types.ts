/**
 * 教室查询对象类型
 */
export interface classRoomQuery extends PageQuery {
  campus_id?: string; //校区id
  building_id?: string; //楼栋ID
  build_name?: string; //楼栋名称
  location?: string; //教室名称
  classroom_status?: number | string; //状态
  classroom_property?: string; //教室属性
  lock_start_time?: string; //锁定开始时间
  lock_end_time?: string; //锁定结束时间
}
/**
 * 教室查询对象类型
 */
export interface classRoomPageVO {
  id?: string; //ID
  building_id?: string;// 楼栋id
  build_name?: string; //楼栋名称
  location?: string; //教室名称
  classroom_status?: string; //状态
  classroom_property?: string; //教室属性
  lock_start_time?: string; //锁定开始时间
  lock_end_time?: string; //锁定结束时间
  is_large_classroom?: number | string; //是否是合教
  seating?: number | string; //座位数
}
/**
 * 教室表单
 */
export interface classRoomForm {
  id?: string;
  is_large_classroom?: number | string; //是否是合教
  seating?: number | string; //座位数
  build_name?: string; //楼栋名称
  location?: string; //教室名称
  classroom_status?: number | string; //状态
  classroom_property?: string; //教室属性
  lock_start_time?: string; //锁定开始时间
  lock_end_time?: string; //锁定结束时间
}
/**
 * 侧边树状下拉
 */
export interface Tree {
  label: string;
  children?: Tree[];
  value?: string;
}
