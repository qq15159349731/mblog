<template>
  <div class="mb-viewport mo-container-fluid">
    <mo-breadcrumb :links="breadcrumb"></mo-breadcrumb>
    <div class="mb-panel">
      <div class="mb-panel-head mo-row">
        <h3 class="mo-cell">
          <div class="mo-inputs">
            <select class="mo-input mo-inputs__cell" v-model="params.draft" @change="search" style="width: auto">
              <option value="0">全部文章</option>
              <option value="1">已发布</option>
              <option value="2">草稿</option>
            </select>
            <select class="mo-input mo-inputs__cell" v-model="params.category" @change="search" style="width: auto">
              <option value="0">全部分类</option>
              <option value="1">未分类</option>
              <option :value="cat._id" v-for="cat in categoryList" :key="cat._id">
                <template v-if="cat.isChild">----</template>
                {{cat.name}}
              </option>
            </select>
            <input type="text" placeholder="请输入关键字" class="mo-inputs__cell mo-input input-search" v-model="params.keyword">
            <button class="mo-inputs__cell mo-btn" @click="search">
              <i class="mo-icon-search"></i>
            </button>
          </div>
        </h3>
        <div class="mo-cell mo-text-right">
          <router-link to="/content/article/new/" class="mo-btn mo-btn-positive">新增文章</router-link>
        </div>
      </div>
      <div class="mb-panel-body">
        <div class="mo-table-responsive">
          <table class="mo-table mo-table-striped" width="100%">
            <thead>
              <tr>
                <th width="30">
                  <label class="mo-checkbox">
                    <input type="checkbox" name="checkAll" v-model="isCheckAll" @change="checkAll" :disabled="list && list.length === 0" />
                    <span class="icon"></span>
                  </label>
                </th>
                <th width="25%">标题</th>
                <th width="10%">分类</th>
                <th width="10%">创建者</th>
                <th width="8%">
                  <mo-sort v-model="params.sort" name="views" :type="params.sortType" @change="sortChange">浏览</mo-sort>
                </th>
                <th width="8%">
                  <mo-sort v-model="params.sort" name="draft" :type="params.sortType" @change="sortChange">状态</mo-sort>
                </th>
                <th width="12%">
                  <mo-sort v-model="params.sort" name="create" :type="params.sortType" @change="sortChange">创建时间</mo-sort>
                </th>
                <th width="12%">
                  <mo-sort v-model="params.sort" name="update" :type="params.sortType" @change="sortChange">最后修改</mo-sort>
                </th>
                <th width="15%" align="right">编辑 | 删除</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in list" :key="item._id">
                <td>
                  <label class="mo-checkbox">
                    <input type="checkbox" name="id" :value="item._id" v-model="selectIds" @change="toggleCheckAll" />
                    <span class="icon"></span>
                  </label>
                </td>
                <td>
                  <div class="td-description mo-text-overflow" v-text="item.title"></div>
                </td>
                <td>
                  <template v-if="item.category">{{item.category.name}}</template>
                  <span class="mo-text-negative" v-else>未分类</span>
                </td>
                <td>{{item.user.nick}}</td>
                <td>{{item.count.views}}</td>
                <td>
                  <span class="mo-text-negative" v-if="item.draft">草稿</span>
                  <span class="mo-text-positive" v-else>已发布</span>
                </td>
                <td>{{item.createTime | formatDate('yy-MM-dd hh:mm')}}</td>
                <td>{{item.updateTime | formatDate('yy-MM-dd hh:mm')}}</td>
                <td align="right">
                  <div class="mo-btns">
                    <router-link :to="`/content/article/${item._id}`" class="mo-btn mo-btn-small">
                      <i class="mo-icon-edit"></i>
                    </router-link>
                    <button class="mo-btn mo-btn-small" @click="remove(item)">
                      <i class="mo-icon-delete"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="mb-panel-foot">
        <div class="mo-row">
          <div class="mo-cell">
            <div class="mo-inputs" style="width:auto">
              <select class="mo-input mo-inputs__cell" v-model="batchType1" :disabled="selectIds.length === 0 || batchType2 != 0">
                <option value="0">选中项</option>
                <option value="1">发布</option>
                <option value="2">移入回收站</option>
                <!-- <option value="3">删除</option> -->
              </select>

              <select class="mo-input mo-inputs__cell" v-model="batchType2" :disabled="selectIds.length === 0 || batchType1 != 0">
                <option value="0">移动到分类</option>
                <option :value="cat._id" v-for="cat in categoryList" :key="cat._id">
                  <template v-if="cat.isChild">----</template>
                  {{cat.name}}
                </option>
                <option value="1">未分类</option>
              </select>

              <button class="mo-btn mo-inputs__cell" :disabled="selectIds.length === 0 || (batchType1 == 0 && batchType2 == 0)" @click="bacth">操作</button>
            </div>
          </div>
          <div class="mo-cell mo-text-right" v-if="count">
            <mo-paging :pageIndex="params.page" :pageSize="params.limit" :total="count" :showPageSizes="true" @change="pageChange"></mo-paging>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import MoBreadcrumb from '@/components/ui/breadcrumb'
import MoPaging from '@/components/ui/paging'
import MoSort from '@/components/ui/sort'
import { getCateMap } from '@/assets/utils/'
export default {
  name: 'mb-user-list',
  components: {
    MoBreadcrumb,
    MoPaging,
    MoSort
  },
  data() {
    return {
      breadcrumb: [
        {
          url: '/content/',
          name: '内容'
        }, {
          url: '/content/article/',
          name: '文章'
        },
        {
          name: '列表'
        }
      ],
      list: null,
      count: 0,
      params: {
        keyword: null,
        category: 0,
        page: 1,
        limit: 20,
        sort: '',
        sortType: '',
        draft: 0,
      },
      categoryList: [],
      selectIds: [],
      isCheckAll: false,
      batchType1: 0,
      batchType2: 0,
    }
  },
  methods: {
    checkAll() {
      this.selectIds = []
      if (this.isCheckAll) {
        for (let i = 0, len = this.list.length; i < len; i++) {
          this.selectIds.push(this.list[i]._id)
        }
      }
    },
    toggleCheckAll() {
      this.isCheckAll = !!(this.selectIds.length === this.list.length)
    },
    getCategoryList() {
      this.$http.get('/api/category/list')
        .then(({ body }) => {
          if (body.code === 200) {
            const map = getCateMap(body.data)
            this.categoryList = map.list
          }
        })
    },
    getList() {
      this.selectIds = []
      this.isCheckAll = false
      this.batchType1 = this.batchType2 = 0

      this.$http.get('/api/article/list', { params: this.params })
        .then(({ body }) => {
          if (body.code === 200) {
            this.list = body.data.list
            this.count = body.data.count
          }
        })
        .catch(e => this.$layer.toast(e.statusText))
    },
    init() {
      this.params.keyword = ''
      this.params.page = 1
      this.getList()
    },
    search() {
      this.params.page = 1
      this.getList()
    },
    pageChange(page, limit) {
      this.params.page = page
      this.params.limit = limit
      this.getList()
    },
    sortChange(name, type) {
      this.params.sort = name
      this.params.sortType = type
      this.getList()
    },
    removeHandler(id) {
      this.$http.delete(`/api/article/${id}`)
        .then(({ body }) => {
          if (body.code === 200) {
            this.getList()
          } else {
            this.$layer.toast(body.message)
          }
        })
        .catch(e => this.$layer.toast(e.statusText))
    },
    remove(item) {
      this.$layer.confirm(`您确定删除文章 <b class="mo-text-negative">${item.title}</b> 吗？`, (layer) => {
        this.removeHandler(item._id)
        layer.close()
      })
    },

    bacthAction(method, data) {
      this.$http.put('/api/article/batch', data)
        .then(({ body }) => {
          if (body.code === 200) {
            this.getList()
          } else {
            this.$layer.toast(body.message)
          }
        })
        .catch(e => this.$layer.toast(e.statusText))
    },

    bacth() {
      const data = Object.create(null)
      let method = 'put', message = ''

      if (this.batchType1 != 0) {
        switch (Number(this.batchType1)) {
          case 1:
            data.action = 1
            message = '您确定要<strong class="mo-text-negative"> 发布 </strong>选中的文章吗？'
            break
          case 2:
            data.action = 2
            message = '您确定将选中的文章<strong class="mo-text-negative"> 移入回收站 </strong>吗？'
            break
          // case 3:
          //   data.action = 3
          //   method = 'delete'
          //   message = '您确定要删除选中的文章吗？<br/><strong class="mo-text-negative">该操作不可逆！</strong>'
          //   break
        }
      } else if (this.batchType2 != 0) {
        data.action = 0
        data.category = this.batchType2
      }
      data.ids = this.selectIds

      if (!data.ids.length) {
        return
      }

      if (data.action !== 0) {
        this.$layer.confirm(message, (layer) => {
          this.bacthAction(method, data)
          layer.close()
        })
      } else {
        this.bacthAction(method, data)
      }
    }
  },
  mounted() {
    this.getCategoryList()
    this.init()
  }
}
</script>
