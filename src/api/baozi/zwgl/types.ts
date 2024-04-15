/**
 * 用户查询对象类型
 */
export interface UserQuery extends PageQuery {
  ID?: string;
  building_id?: number | string;
  campus_id?: number | string;
  classroom_id?: number | string;
  seat_number?: string;
  seat_reserve?: string;
  seat_status_id?: string;
  statue?: string;
  classroom_name?: string;
  building_name?: string;
}
/**
 * 校区下拉
 */
export interface CampusType {
  /**
   * 值
   */
  value: string | number;
  /**
   * 文本
   */
  campus_name: string;
}

/**
 * 楼栋下拉
 */
export interface BuildingType {
  /**
   * 值
   */
  value: string | number;
  /**
   * 文本
   */
  name: string;
}
/**
 * 侧边树状下拉
 */
export interface Tree {
  label: string;
  children?: Tree[];
  value?: string;
}

/**
 * 修改，新增表单数据
 */
export interface SeatForm {
  //座位id
  id?: number;
  // 楼栋id
  building_id?: number;
  building_name?: string;
  //校区id
  campus_id?: number | string;
  campus_name?: string;
  //教室id
  classroom_id?: string;
  classroom_name?: string;
  //座位号
  seat_number?: string;
  //预约状态
  seat_reserve?: number | string;
  // 座位状态
  seat_status?: number | string;
}
/**
 * 座位分页对象
 */
export interface SeatPageVO {
  //座位id
  id?: number;
  // 楼栋id
  building_id?: number;
  building_name?: string;
  //校区id
  campus_id?: number | string;
  campus_name?: string;
  //教室id
  classroom_id?: string;
  classroom_name?: string;
  //座位号
  seat_number?: string;
  //预约状态
  seat_reserve?: number | string;
  // 座位状态
  seat_status?: number | string;
}
