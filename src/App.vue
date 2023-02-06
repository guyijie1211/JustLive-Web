<template>
  <div id="app">
    <transition>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
export default {
  methods:{
    _isMobile() {
      let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      return flag;
    }
  },
  mounted(){
    this.$route.path
    if (this._isMobile()) {
      if (!this.$route.path.match(/(mobile)/i)) {
        console.log("跳转手机端");
        this.$router.replace('/mobile');
      }
    } else {
      if (this.$route.path.match(/(mobile)/i)) {
        console.log("跳转PC端");
        this.$router.replace('/');
      }
    }
  }
}
</script>

<style>
html,body,#app {
  width: 100%;
  height: 100%;
  background-color: #F3F6F8;
  margin: 0px;
  padding: 0px;
}
</style>