/**
 * Page Controller
 * Author : smohan
 * Website : https://smohan.net
 * Date: 2017/10/18 
 */

const U = require('../utils/')
const R = require('../utils/result')
const V = require('../utils/validate')
const Auth = require('../utils/auth')
const Category = require('../models/category')
const Page = require('../models/article')

/**
 * 获取全部页面
 * @param {Object} req
 * @param {Object} res
 * @return {Object} 
 */
exports.getList = async(req, res) => {
  const search = U.query(req.query, ['create'])
  const query = {
    type: 'page'
  }
  const fields = {
    _id: 1,
    title: 1,
    alias: 1,
    user: 1,
    createTime: 1,
    password: 1
  }
  const sort = {}
  if (search.sort) {
    switch (search.sort) {
      case 'create':
        sort.createTime = search.sortType
        break
    }
  }
  sort._id = -1
  if (search.keyword) {
    if (V.is('objectId', search.keyword)) {
      query._id = search.keyword
    } else {
      query.$or = U.like(['title'], search.keyword)
    }
  }

  const count = await Page.count(query)
  const docs = await Page.find(query, fields, {
      sort,
      skip: search.skip,
      limit: search.limit
    })
    .populate([{
      path: 'user',
      select: {
        nick: 1,
        id: 1,
      }
    }])

  return res.json(docs ? R.success({
    list: docs,
    count
  }) : res.json(R.error(500)))
}

/**
 * 根据ID获取页面
 * @param {Object} req
 * @param {Object} res
 * @return {Object} 
 */
exports.findById = async(req, res) => {
  const id = req.params.id
  if (!V.is('objectId', id))
    return res.json(R.error(402, V.msgs.objectId))

  await Page.findOne({
      _id: id
    }, {
      _id: 1,
      title: 1,
      alias: 1,
      contents: 1,
      password: 1,
      allowComment: 1,
      allowReward: 1
    })
    .then(doc => res.json(doc ? R.success(doc) : R.error(404, 'page not found')))
    .catch(error => res.json(R.error(500, error.message)))
}

/**
 * 验证字段
 * @param {Object} body
 * @return {Object} 
 */
const checkBody = body => {
  return V.validate(body, {
    title: {
      rules: 'require|chsDash|min:2',
    },
    alias: {
      rules: 'alphaDash|min:2',
    },
    contents: {
      rules: 'require',
    },
    allowComment: {
      rules: 'boolean',
    },
    allowReward: {
      rules: 'boolean',
    },
    password: {
      rules: 'max:20',
    }

  }, ['title', 'alias', 'contents', 'allowComment', 'allowReward', 'password'])
}



/**
 * 新增页面
 * @param {Object} req
 * @param {Object} res
 * @return {Object} 
 */
exports.add = async(req, res) => {

  const result = checkBody(req.body)

  if (!result.passed)
    return res.json(R.error(402, result.msg))

  const post = result.data

  post.type = 'page'

  //如果设置了别名，需要检查别名是否有效
  if (post.alias) {
    const aliasDoc = await Page.findOne({
      alias: post.alias
    }, {
      _id: 1
    })
    if (aliasDoc)
      return res.json(R.error(401, 'the page alias has exist'))
  }


  const userInfo = await Auth.getLoginUserInfo(req)
  post.user = userInfo.id

  const page = new Page(post)

  await page.save()
    .then(async doc => res.json(R.success({
      id: page._id
    })))
    .catch(error => res.json(R.error(500, error.message)))
}


/**
 * 编辑页面
 * @param {Object} req
 * @param {Object} res
 * @return {Object} 
 */
exports.update = async(req, res) => {
  const id = req.params.id
  if (!V.is('objectId', id))
    return res.json(R.error(402, V.msgs.objectId))
  const result = checkBody(req.body)

  if (!result.passed)
    return res.json(R.error(402, result.msg))

  const post = result.data

  //如果设置了别名，需要检查别名是否有效
  if (post.alias) {
    const aliasDoc = await Page.findOne({
      alias: post.alias,
      _id: {
        $ne: id
      }
    }, {
      _id: 1
    })
    if (aliasDoc)
      return res.json(R.error(401, 'the page alias has exist'))
  }

  post.updateTime = Date.now()

  await Page.findOneAndUpdate({
      _id: id
    }, {
      $set: post
    }, {
      new: true
    })
    .then(async doc => res.json(doc ? R.success(doc) : R.error(404, 'The page not found')))
    .catch(error => res.json(R.error(500, error.message)))
}


/**
 * 删除页面
 * @param  {Object} req  
 * @param  {Object} res  
 * @return {Object}  
 */
exports.remove = async(req, res) => {
  const id = req.params.id
  if (!V.is('objectId', id))
    return res.json(R.error(402, V.msgs.objectId))

  await Page.findOneAndRemove({
      _id: id
    })
    .then(doc => res.json(doc ? R.success() : R.error(404, 'The page not found')))
    .catch(error => res.json(R.error(500, error.message)))
}
