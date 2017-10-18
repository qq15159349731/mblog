<template>
  <div class="mb-viewport mo-container-fluid">
    <mo-breadcrumb :links="breadcrumb"></mo-breadcrumb>
    <div class="mb-panel">
      <div class="mb-panel-head mo-row">
        <h3 class="mo-cell mo-text-overflow">
          <template v-if="!id">添加新页面</template>
          <template v-else>编辑页面（{{fd.title}}）</template>
        </h3>
        <div class="mo-cell mo-text-right">
          <router-link class="mo-btn mo-btn-link" to="/content/page/" exact>返回</router-link>
          <mo-submit v-model="committing" :click="save"></mo-submit>
        </div>
      </div>
      <div class="mb-panel-body">
        <div class="mb-form-group">
          <div class="mb-form-group_item">
            <input type="text" class="mo-input mo-input-large" maxlength="100" v-model="fd.title" placeholder="输入页面标题" />
          </div>

          <div class="mb-form-group_item">
            <div class="mo-row">
              <div class="mo-cell">
                <div class="mo-inputs">
                  <label class="mo-inputs__cell mo-btn readonly">别名</label>
                  <input type="text" class="mo-inputs__cell mo-input" placeholder="别名用于自定义页面链接" v-model="fd.alias">
                </div>
              </div>
              <div class="mo-cell">
                <div class="mo-inputs">
                  <label class="mo-inputs__cell mo-btn readonly">密码</label>
                  <input type="text" class="mo-inputs__cell mo-input" placeholder="页面将使用密码访问" v-model="fd.password">
                </div>
              </div>
            </div>
          </div>

          <div class="mb-form-group_item">
            <mb-editor v-model="fd.contents"></mb-editor>
          </div>

          <div class="mb-form-group_item mo-text-right">
            <label class="mo-switch mo-switch-positive">
              <input type="checkbox" name="useCache" v-model="fd.allowReward" />
              <span class="icon"></span>
              <span>开启打赏</span>
            </label>
            <label class="mo-switch mo-switch-positive">
              <input type="checkbox" name="useCache" v-model="fd.allowComment" />
              <span class="icon"></span>
              <span>启用评论</span>
            </label>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
import MoSubmit from '@/components/ui/submit'
import MoBreadcrumb from '@/components/ui/breadcrumb'
import fields from '../field/article'
import { isObjectId, extend } from '@/assets/utils/'
import MbEditor from '@/components/ui/editor'
export default {
  name: 'mb-page-form',
  components: {
    MoSubmit,
    MoBreadcrumb,
    MbEditor
  },
  data() {
    let id = this.$route.params.id
    id = isObjectId(id) ? id : null
    return {
      breadcrumb: [
        {
          url: '/content/',
          name: '内容'
        },
        {
          url: '/content/page/',
          name: '页面'
        }
      ],
      committing: false,
      fd: extend({}, fields.field),
      id
    }
  },
  methods: {
    save() {
      let method = 'post', url = '/api/page'
      if (this.id) {
        method = 'put'
        url += '/' + this.id
      }
      const self = this
      this.$http[method](url, this.fd)
        .then(({ body }) => {
          if (body.code === 200) {
            this.$layer.toast('保存成功', 3000, {
              cancel() {
                self.$router.push('/content/page/')
              }
            })
          } else {
            this.$layer.toast(body.message)
            this.committing = false
          }
        })
        .catch(e => {
          this.$layer.toast(e.statusText)
          this.committing = false
        })
    },
    getArticleInfo() {
      const self = this
      this.$http.get(`/api/page/info/${this.id}`)
        .then(({ body }) => {
          if (body.code === 200) {
            for (let key in this.fd) {
              if (body.data[key]) {
                this.fd[key] = body.data[key]
              }
            }
          } else {
            this.$layer.toast(body.message, 2000, {
              cancel() {
                self.$router.push('/content/page/')
              }
            })
          }
        })
    },
  },
  mounted() {
    if (this.id) {
      this.getArticleInfo()
    }

    this.breadcrumb.push({
      name: this.id ? `编辑页面` : '添加页面'
    })
  },
  beforeDestroy() { }
}
</script>
