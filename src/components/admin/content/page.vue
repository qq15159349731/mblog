<template>
  <div class="mb-viewport mo-container-fluid">
    <mo-breadcrumb :links="breadcrumb"></mo-breadcrumb>
    <div class="mb-panel">
      <div class="mb-panel-head mo-row">
        <div class="mo-cell">
          <div class="mo-inputs">
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
                <th width="50%">标题</th>
                <th width="20%">别名</th>
                <th width="15%">
                  <mo-sort v-model="params.sort" name="create" :type="params.sortType" @change="sortChange">创建时间</mo-sort>
                </th>
                <th width="15%" align="right">编辑 | 删除</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in list" :key="item._id">
                <td>
                  <router-link :to="`/content/page/${item._id}`">{{item.title}}</router-link>
                </td>
                <td>{{item.alias}}</td>
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
      <div class="mb-panel-foot mo-text-right" v-if="count">
        <mo-paging :pageIndex="params.page" :pageSize="params.limit" :total="count" :showPageSizes="true" @change="pageChange"></mo-paging>
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
      },
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
  },
  mounted() {
    this.init()
  }
}
</script>
