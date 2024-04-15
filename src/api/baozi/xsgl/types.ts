/**
 * 用户查询对象类型
 */
export interface UserQuery extends PageQuery {
  college?: number | string; //学院
  major?: number | string; //专业
  grade?: number | string; //年级
  class?: number | string; //班级
  name?: number | string; //学生姓名
  student_number?: number; //学号
  student_status?: number | string; //状态
  violation_lock_time_start?: number | string; //违规锁定开始时间
  violation_lock_time_end?: number | string; //违规锁定结束时间
}

/**
 * 用户分页对象
 */
export interface UserPageVO {
  /**
   * 用户头像地址
   */
  head?: string;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 学院
   */
  college?: string;
  /**
   * 学号
   */
  student_number?: string;
  /**
   * 专业
   */
  major?: string;
  /**
   * 用户ID
   */
  ID?: number;
  /**
   *班级
   */
  class?: string;
  /**
   * 用户昵称
   */
  name?: string;
  /**
   * 用户状态(1:启用;0:禁用)
   */
  student_status?: number;
}
