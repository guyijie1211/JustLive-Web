<template>
  <div id="app">
    <transition>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
    <div class="to-bottom" @click="toBeiAn()">
      <a href="https://beian.miit.gov.cn/" target="_blank" style="text-decoration: none;">沪ICP备20013368号-1</a>
    </div>
  </div>
</template>

<script>
import {getAllSupportPlatforms} from "./api/liveList";
import Global from "@/components/Global";

export default {
  methods:{
    _isMobile() {
      let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      return flag;
    },
    toBeiAn(){
    },
  },
  mounted(){
    this.$route.path
    if (this._isMobile()) {
      if (!this.$route.path.match(/(mobile)/i)) {
        console.log("跳转手机端");
        this.$router.replace('/mobile' + this.$route.path);
      }
    } else {
      if (this.$route.path.match(/(mobile)/i)) {
        console.log("跳转手机端");
        this.$router.replace(this.$route.path.replace(/\/mobile/, ""));
      }
    }
  },
  beforeMount() {
    getAllSupportPlatforms()
        .then(response => {
          if (response.data.code === 200){
            Global.setPlatformList(response.data.data.platformList)
          }
        })
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
.to-bottom{
  z-index: 999;
  position: absolute;
  bottom: 0px;
  //background-color: #F3F6F8;
  font-weight: normal;
  font-size: small;
  color: #727272;
  right: 10px;
  height: 30px;
  border-radius: 10px;
  //width: 100px;
  /*flex 布局*/
  display: flex;
  /*实现垂直居中*/
  align-items: center;
  /*实现水平居中*/
  justify-content: center;
  text-align: justify;
}
.to-bottom:hover{
  cursor: pointer;
}
a {
  color: inherit; /*继承父元素颜色*/
  text-decoration: none; /*去除下划线*/
}
a:hover {
  text-decoration: underline; /*鼠标悬停时出现下划线*/
}
</style>