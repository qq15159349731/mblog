<template>
  <div class="mb-viewport mo-container-fluid">
    <mo-breadcrumb :links="breadcrumb"></mo-breadcrumb>
    <div class="mb-panel">
      <div class="mb-panel-head mo-row">
        <div class="mo-cell">
          <div class="mo-inputs">
            <select class="mo-input mo-inputs__cell" v-model="params.draft" @change="search" style="width: auto">
              <option value="0">全部页面</option>
              <option value="1">已发布</option>
              <option value="2">草稿</option>
            </select>
            <input type="text" placeholder="请输入关键字" class="mo-inputs__cell mo-input input-search" v-model="params.keyword">
            <button class="mo-inputs__cell mo-btn" @click="search">
              <i class="mo-icon-search"></i>
            </button>
          </div>
        </div>
        <div class="mo-cell mo-text-right">
          <router-link to="/content/page/new/" class="mo-btn mo-btn-positive">新增页面</router-link>
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
                <th width="40%">标题</th>
                <th width="15%">别名</th>
                <th width="15%">
                  <mo-sort v-model="params.sort" name="draft" :type="params.sortType" @change="sortChange">状态</mo-sort>
                </th>
                <th width="15%">
                  <mo-sort v-model="params.sort" name="create" :type="params.sortType" @change="sortChange">创建时间</mo-sort>
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
                  <router-link :to="`/content/page/${item._id}`">{{item.title}}</router-link>
                </td>
                <td>{{item.alias}}</td>
                <td>
                  <span class="mo-text-negative" v-if="item.draft">草稿</span>
                  <span class="mo-text-positive" v-else>已发布</span>
                </td>
                <td>{{item.createTime | formatDate('yy-MM-dd hh:mm')}}</td>
                <td align="right">
                  <div class="mo-btns">
                    <router-link :to="`/content/page/${item._id}`" class="mo-btn mo-btn-small">
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
      <div class="mb-panel-foot" v-if="count">
        <div class="mo-row">
          <div class="mo-cell">
            <div class="mo-inputs" style="width:auto">
              <select class="mo-input mo-inputs__cell" v-model="batchType" :disabled="selectIds.length === 0">
                <option value="0">选中项</option>
                <option value="1">发布</option>
                <option value="2">移入回收站</option>
                <option value="3">删除</option>
              </select>
              <button class="mo-btn mo-inputs__cell" :disabled="selectIds.length === 0 || batchType == 0" @click="bacth">操作</button>
            </div>
          </div>
          <div class="mo-cell mo-text-right">
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
  name: 'mb-page-list',
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
          url: '/content/page/',
          name: '页面'
        },
        {
          name: '列表'
        }
      ],
      list: null,
      count: 0,
      params: {
        keyword: null,
        page: 1,
        limit: 20,
        sort: '',
        sortType: '',
        draft: 0
      },
      selectIds: [],
      isCheckAll: false,
      batchType: 0,
    }
  },
  methods: {
    getList() {
      this.selectIds = []
      this.isCheckAll = false
      this.batchType1 = this.batchType2 = 0

      this.$http.get('/api/page/list', { params: this.params })
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
      this.$http.delete(`/api/page/${id}`)
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
      this.$layer.confirm(`您确定删除页面 <b class="mo-text-negative">${item.title}</b> 吗？`, (layer) => {
        this.removeHandler(item._id)
        layer.close()
      })
    },
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

    bacthAction(data) {
      this.$http.put('/api/page/batch', data)
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
      let message = ''

      if (this.batchType != 0) {
        switch (Number(this.batchType)) {
          case 1:
            data.action = 1
            message = '您确定要<strong class="mo-text-negative"> 发布 </strong>选中的页面吗？'
            break
          case 2:
            data.action = 2
            message = '您确定将选中的页面<strong class="mo-text-negative"> 移入回收站 </strong>吗？'
            break
        }
      }

      data.ids = this.selectIds

      if (!data.ids.length) {
        return
      }

      this.$layer.confirm(message, (layer) => {
        this.bacthAction(data)
        layer.close()
      })
    }
  },
  mounted() {
    this.init()
  }
}
</script>
