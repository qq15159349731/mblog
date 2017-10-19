/**
 * Message
 * Author : smohan
 * Website : https://smohan.net
 * Date: 2017/10/19 
 */

const C = require('../config/')


const MESSAGES = {
  zh: {
    system: {
      UNKNOWN_ACTION: '未知的操作类型',
      SYSTEM_KEYWORD: '系统关键词不能作为别名'
    },
    article: {
      NOT_FOUND: '文章不存在',
      ALIAS_EXISTS: '别名已经被其他文章或页面使用',
      INVALID_LIST: '无效的文章列表',
    },
    category: {
      MAXLENGTH: `最多可添加 ${C.maxSize.category} 个分类`,
      NOT_FOUND: '分类不存在',
      NAME_EXISTS: '分类名称已经存在',
      ALIAS_EXISTS: '分类别名已经存在',
      PARENT_NOT_FOUND: '父分类不存在',
    },
    nav: {
      NOT_FOUND: '导航不存在',
      MAXLENGTH: `最多可添加 ${C.maxSize.navigation} 个导航`,
      CATEGORY_NEED: '请至少选择一个分类',
      CATEGORY_INVALID: '无效的分类ID',
      PAGE_NEED: '请至少选择一个页面',
      PAGE_INVALID: '无效的页面ID',
      URL_INVALID: '无效的URL',
      FORBIDDEN_DELETED: '系统导航禁止删除',
    },
    page: {
      NOT_FOUND: '页面不存在',
      ALIAS_EXISTS: '别名已经被其他页面或文章使用',
      INVALID_LIST: '无效的页面列表',
    },
    setting: {
      NOT_FOUND: '要更新的字段不存在',
    },
    tag: {
      NOT_FOUND: '标签不存在',
      NAME_EXISTS: '标签名称已经存在',
    },
    user: {
      NOT_FOUND: '用户不存在',
      EMAIL_EXISTS: '邮箱已经存在',
      FORBIDDEN_ADD: '不允许添加系统管理员',
      FORBIDDEN_DELETED: '不允许删除系统管理员',
      FORBIDDEN_DISABLED: '不允许禁用系统管理员',
      ORIGINAL_PASSWORD_ERROR: '原密码错误',
      PASSWORD_ERROR: '登录密码错误',
    }
  }
}


module.exports = MESSAGES[C.general.lang || 'zh']
