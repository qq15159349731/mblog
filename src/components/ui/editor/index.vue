<template>
  <div class="mb-editor">
  </div>
</template>

<script>
export default {
  name: 'mb-editor',
  props: {
    value: String,
  },
  data() {
    return {
      content: this.value,
      editor: null,
      reset: false
    }
  },
  mounted() {
    this.editor = new wangEditor(this.$el)
    this.editor.customConfig.onchange = html => {
      this.contents = html
      this.$emit('input', this.contents)
    }

    //这地方应该是WE的一个bug,既然设置了customUploadImg的自定义方法，为啥要在源码中拦截
    //源码中必须得设置uploadImgServer或者base64后才可以使用自定义方法
    this.editor.customConfig.uploadImgServer = '/'
    // this.editor.customConfig.customUploadImg = function(files, insert) {
    //   debugger
    //   // files 是 input 中选中的文件列表
    //   // insert 是获取图片 url 后，插入到编辑器的方法

    //   // 上传代码返回结果之后，将图片插入到编辑器中
    //   //insert(imgUrl)
    //   console.log(files)
    // }
    this.editor.customConfig.customUploadImg = (files, insert) => {
      debugger
    }



    this.editor.create()
  },
  beforeDestroy() { },
  watch: {
    value(val) {
      this.content = val
      //设置个开关，只初始化一次
      if (!this.reset) {
        this.editor.txt.html(val)
        this.reset = true
      }
    }
  }

}
</script>
