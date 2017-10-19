<template>
  <ul class="pages-list">
    <template v-if="list.length">
      <li class="pages-item mo-text-overflow" v-for="item in list" :key="item._id">
        <label class="mo-checkbox">
          <input type="checkbox" :value="item._id" v-model="model">
          <span class="icon"></span>
          <span v-text="item.title"></span>
        </label>
      </li>
    </template>
    <li v-else>暂无页面，
      <router-link to="/content/cate/">添加页面</router-link>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'mb-page-list',
  props: {
    value: Array
  },
  data() {
    return {
      model: this.value,
      list: []
    }
  },
  mounted() {
    this.$http.get('/api/page/list', { params: { limit: 100 } })
      .then(({ body }) => {
        if (body.code === 200) {
          this.list = body.data.list
        }
      })
  },
  watch: {
    model(val) {
      this.$emit('input', val)
    }
  }
}
</script>


<style lang="scss">
.pages-list {
  margin: 0;
  padding: 0;
  list-style: none;
  padding: 1rem;
  .pages-item {
    margin: .5rem 0;
    max-width: 400px;
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
