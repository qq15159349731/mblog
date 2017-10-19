/**
 * Nav Controller
 * Author : smohan
 * Website : https://smohan.net
 * Date: 2017/10/14 
 */

const U = require('../utils/')
const R = require('../utils/result')
const V = require('../utils/validate')
const M = require('../utils/message')
const C = require('../config/')['maxSize']
const Category = require('../models/category')
const Nav = require('../models/nav')
const Page = require('../models/article')

/**
 * 获取全部导航
 * @param {Object} req
 * @param {Object} res
 * @return {Object} 
 */
exports.getList = async(req, res) => {
  const query = {}
  const fields = {}
  const sort = {
    order: -1,
    _id: 1
  }

  const docs = await Nav.find(query, fields, {
    sort
  })
  return res.json(docs ? R.success(docs) : res.json(R.error(500)))
}


/**
 * 新增导航
 * @param {Object} req
 * @param {Object} res
 * @return {Object} 
 */
exports.add = async(req, res) => {
  let result

  result = V.validate(req.body, {
    type: {
      rules: 'require|int|between[0,3]'
    }
  }, ['type'])

  if (!result.passed)
    return res.json(R.error(402, result.msg))

  const count = await Nav.count()

  if (count >= C.navigation)
    return res.json(R.error(403, M.nav.MAXLENGTH))

  const type = Number(result.data.type)
  if (type === 0) {

  } else if (type === 1) {
    result = V.validate(req.body, {
      name: {
        rules: 'require|chsDash|min:2',
      },
      url: {
        rules: 'require|url',
      },
      parent: {
        rules: 'objectId',
      },
      order: {
        rules: 'int',
      },
      newTab: {
        rules: 'boolean',
      },
    }, ['name', 'url', 'parent', 'order', 'newTab'])

    if (!result.passed)
      return res.json(R.error(402, result.msg))
    const post = result.data
    post.type = type

    if (!post.parent)
      delete post.parent

    let nav = new Nav(post)

    await nav.save()
      .then(doc => res.json(R.success({
        id: nav._id
      })))
      .catch(error => res.json(R.error(500, error.message)))
  }
  //从分类新建
  else if (type === 2) {
    result = V.validate(req.body, {
      categories: {
        rules: 'require|array'
      }
    }, ['categories'])

    if (!result.passed)
      return res.json(R.error(402, result.msg))

    const categories = result.data.categories

    let i = 0,
      len = categories.length,
      item
    if (!len)
      return res.json(R.error(402, M.nav.CATEGORY_NEED))

    //遍历所有分类ID  
    for (i = 0; i < len; i++) {
      item = categories[i]
      if (!V.is('objectId', item))
        return res.json(R.error(402, M.nav.CATEGORY_INVALID))

      //查找分类
      let category = await Category.findOne({
        _id: item
      }, {
        _id: 1,
        name: 1,
        alias: 1
      })

      if (!category)
        return res.json(R.error(404, M.category.NOT_FOUND))

      let nav = new Nav({
        name: category.name,
        type: 2,
        url: category.alias || category._id, //URL别名优先
        category: category._id
      })

      await nav.save()

      //如果该分类有子分类，将子分类作为新创建的导航的子导航
      let childs = await Category.find({
        parent: category._id
      }, {
        _id: 1,
        name: 1,
        alias: 1
      })

      if (childs && childs.length) {
        for (let j = 0, l = childs.length; j < l; j++) {
          let child = childs[j]
          let childNav = new Nav({
            name: child.name,
            type: 2,
            url: child.alias || child._id,
            parent: nav._id,
            category: child._id
          })
          await childNav.save()
        }
      }
    }

    return res.json(R.success())

  } else if (type === 3) {
    result = V.validate(req.body, {
      pages: {
        rules: 'require|array'
      }
    }, ['pages'])

    if (!result.passed)
      return res.json(R.error(402, result.msg))

    const pages = result.data.pages

    let i = 0,
      len = pages.length,
      item
    if (!len)
      return res.json(R.error(402, M.nav.PAGE_NEED))

    //遍历所有页面ID  
    for (i = 0; i < len; i++) {
      item = pages[i]
      if (!V.is('objectId', item))
        return res.json(R.error(402, M.nav.PAGE_INVALID))

      //查找分类
      let page = await Page.findOne({
        _id: item
      }, {
        _id: 1,
        title: 1,
        alias: 1
      })

      if (!page)
        return res.json(R.error(404, M.page.NOT_FOUND))

      let nav = new Nav({
        name: page.title,
        type: 3,
        url: page.alias || page._id, //URL别名优先
        page: page._id
      })

      await nav.save()

    }

    return res.json(R.success())
  }

}


/**
 * 编辑导航
 * @param {Object} req
 * @param {Object} res
 * @return {Object} 
 */
exports.update = async(req, res) => {
  const id = req.params.id
  if (!V.is('objectId', id))
    return res.json(R.error(402, V.msgs.objectId))

  result = V.validate(req.body, {
    type: {
      rules: 'require|int|between[0,3]'
    },
    name: {
      rules: 'require|chsDash|min:2',
    },
    parent: {
      rules: 'objectId',
    },
    order: {
      rules: 'int',
    },
    newTab: {
      rules: 'boolean',
    },
  }, ['name', 'url', 'parent', 'order', 'newTab'])

  if (!result.passed)
    return res.json(R.error(402, result.msg))


  const post = result.data

  const type = Number(post.type)

  if (type !== 1) {
    delete post.url
    delete post.parent
  } else {
    if (!post.url)
      return res.json(R.error(402, M.nav.URL_INVALID))
  }

  await Nav.update({
      _id: id
    }, {
      $set: post
    })
    .then(doc => res.json(R.success()))
    .catch(error => res.json(R.error(500, error.message)))
}


/**
 * 删除导航
 * @param  {Object} req  
 * @param  {Object} res  
 * @return {Object}  
 */
exports.remove = async(req, res) => {
  const id = req.params.id
  if (!V.is('objectId', id))
    return res.json(R.error(402, V.msgs.objectId))

  const nav = await Nav.findOne({
    _id: id
  })

  if (!nav)
    return res.json(R.error(404, M.nav.NOT_FOUND))

  //系统导航不允许删除  
  if (Number(nav.type) === 0)
    return res.json(R.error(404, M.nav.FORBIDDEN_DELETED))

  //设置子导航为父导航
  await Nav.update({
    parent: id
  }, {
    $set: {
      parent: null
    }
  }, {
    multi: true
  })

  //删除该导航
  await Nav.findOneAndRemove({
      _id: id
    })
    .then(doc => res.json(doc ? R.success() : R.error(404, M.nav.NOT_FOUND)))
    .catch(error => res.json(R.error(500, error.message)))
}


/**
 * 更新导航的显示隐藏状态
 * @param  {Object} req  
 * @param  {Object} res  
 * @return {Object}  
 */
exports.updateDisplay = async(req, res) => {
  const id = req.params.id
  if (!V.is('objectId', id))
    return res.json(R.error(402, V.msgs.objectId))
  const result = V.validate(req.body, {
    display: {
      rules: 'require|boolean',
    },
  }, ['display'])

  if (!result.passed)
    return res.json(R.error(402, result.msg))

  await Nav.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        display: result.data.display
      }
    })
    .then(doc => res.json(doc ? R.success() : R.error(404, M.nav.NOT_FOUND)))
    .catch(error => res.json(R.error(500, error.message)))
}


/**
 * 更新导航的排序
 * @param  {Object} req  
 * @param  {Object} res  
 * @return {Object}  
 */
exports.updateOrder = async(req, res) => {
  const id = req.params.id
  if (!V.is('objectId', id))
    return res.json(R.error(402, V.msgs.objectId))
  const result = V.validate(req.body, {
    order: {
      rules: 'require|int|between[1,9999]',
    },
  }, ['order'])

  if (!result.passed)
    return res.json(R.error(402, result.msg))

  await Nav.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        order: Number(result.data.order)
      }
    })
    .then(doc => res.json(doc ? R.success() : R.error(404, M.nav.NOT_FOUND)))
    .catch(error => res.json(R.error(500, error.message)))
}
