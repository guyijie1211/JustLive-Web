<template>
    <el-container class="home-under-header">
      <el-aside class="home-aside" style="width: 130px; ">

        <router-link class="home-aside-item" to="/index/home/recommend">
          <div class="home-aside-item-icon"><i class="iconfont icon-home"></i></div>
          <div class="home-aside-item-words">推荐</div>
        </router-link>

        <router-link class="home-aside-item" to="/index/home/follows">
          <div class="home-aside-item-icon"><i class="iconfont icon-favorite"></i></div>
          <div class="home-aside-item-words">关注</div>
        </router-link>

        <router-link class="home-aside-item" to="/index/home/platforms">
          <div class="home-aside-item-icon"><i class="iconfont icon-modular"></i></div>
          <div class="home-aside-item-words">平台</div>
        </router-link>
        <router-link class="home-aside-item" to="/index/home/areas">
          <div class="home-aside-item-icon"><i class="iconfont icon-fenlei"></i></div>
          <div class="home-aside-item-words">分区</div>
        </router-link>
        <router-link class="home-aside-item" to="/index/home/tv">
          <div class="home-aside-item-icon"><i class="iconfont icon-dianshi2"></i></div>
          <div class="home-aside-item-words">电视</div>
        </router-link>
        <div class="head-download-app" @click="toGithub()">
          <el-dropdown >
            <div >
              安卓APP下载
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item><el-image
                  :src="appUrl"
                  :fit="fit"></el-image>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="home-aside-bottom" @click="toGithub()">
          <div class="home-aside-bottom-words">问题反馈</div>
<!--          <div class="home-aside-bottom-icon"><i class="el-icon-chat-line-square"></i></div>-->
        </div>
        <div class="beside-aside"></div>
      </el-aside>
      <el-main id="home-main" class="home-main">
        <keep-alive exclude="PlatformRooms,AreaAll">
          <router-view ref="mychild" @loginSuccess="loginSuccess" @startLoad="startLoad" @loadFinish="loadFinish" @activated="activated" :isLogin="isLogin" :userInfo="userInfo"></router-view>
        </keep-alive>
      </el-main>
      <el-backtop target=".home-main"></el-backtop>
    </el-container>
</template>


<script>

import {getApp} from "@/api/liveList";

export default {
  name: 'Home',
  components: {

  },
  props: ['userInfo','isLogin'],
  data() {
    return {
      appUrl:"",
      player: null,
      isActive: false,
      searchInput: '',
      transformFlag: 'translateY(0px)',
      gettingList: false,
    }
  },
  methods: {
    toGithub(){
      window.open("https://github.com/guyijie1211/MixLive-vue/issues/new", "_blank");
    },
    load(){
      this.$refs.mychild.loadRoomList();
    },
    getAppUrl() {
      getApp()
          .then(response => {
            if(response.data.code === 200){
              let info = response.data.data
              this.appUrl = info.apkMD5
            }
          })
    },
    loginSuccess(userInfo){
      let _this = this
      _this.$emit("loginSuccess",userInfo)
    },
    clickRecommend(){
      let beside = document.getElementsByClassName("beside-aside")[0]
      beside.style.transform = 'translateY(0px)'
    },
    clickFollows(){
      let beside = document.getElementsByClassName("beside-aside")[0]
      beside.style.transform = 'translateY(45px)'
    },
    clickPlatform(){
      let beside = document.getElementsByClassName("beside-aside")[0]
      beside.style.transform = 'translateY(90px)'
    },
    clickKinds(){
      let beside = document.getElementsByClassName("beside-aside")[0]
      beside.style.transform = 'translateY(135px)'
    },
    clickTv(){
      let beside = document.getElementsByClassName("beside-aside")[0]
      beside.style.transform = 'translateY(180px)'
    },
    activated(target){
      if (target == 0){
        this.clickRecommend()
      }
      if (target == 1){
        this.clickFollows()
      }
      if (target == 2){
        this.clickPlatform()
      }
      if (target == 3){
        this.clickKinds()
      }
      if (target == 4){
        this.clickTv()
      }
    },
    loadFinish() {
      this.gettingList = false;
    },
    listenerFunction(e) {

    },
    startLoad() {
      this.gettingList = true
    },
    handleScroll () {
      let target = document.getElementById("home-main")
      if(!this.gettingList && (target.scrollHeight-target.clientHeight)-target.scrollTop < 5){
        this.load()
      }
    },
    toTop(){

    },
  },
  activated() {
    console.log("activated")
    document.addEventListener('scroll', this.handleScroll, true);
  },
  created() {
    this.getAppUrl()
  },
  deactivated() {
    console.log("deactivated")
    document.removeEventListener('scroll', this.handleScroll, true);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home-under-header{
  height: 80%;
  width: 100%;
}
.home-aside{
  padding-top: 10px;
  height: 100%;
  box-shadow: 5px 0px 5px -5px #4e4c4c;
  overflow: hidden;
  position: relative;
}
.home-aside-item{
  padding-top: 10px;
  padding-bottom: 5px;
  float: left;
  width: 100%;
  height: 30px;
  transition: all 0.1s;
}
.home-aside-item:hover{
  cursor: pointer;
  transform: scale(1.3); /* 放大1.2倍 */
  font-weight: bolder;
  /*background-color: #d7d7d7;*/
  /*color: #0086b3;*/
}
.home-aside-item-icon{
  margin-left: 20%;
  float: left;
}
.home-aside-item-words{
  font-weight: lighter;
  margin-left: 20px;
  float: left;
}
.home-aside-bottom{
  width: 100%;
  position:absolute;
  bottom:0;
  padding-bottom: 30px;
  transition: all 0.1s;
  text-align: center;
}
.home-aside-bottom:hover{
  cursor: pointer;
  transform: scale(1.2);
}
.home-aside-bottom-icon{
  margin-left: 10px;
  font-size: 15px;
}
.home-aside-bottom-words{
  font-size: 16px;
  font-weight: lighter;
  /*margin-left: 20px;*/
  /*float: left;*/
}
/deep/ .el-input__inner{
  height: 40px;
  border-radius: 20px;    /*输入框圆角值*/
}
a {
  color: #303133;
  text-decoration: #303133;
}
.home-main{
  overflow-x: hidden;
  overflow-y: auto;
}
.home-main::-webkit-scrollbar {
  width: 8px;
  /*height: 4px;*/
}
.home-main::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #8e8e8e;
}
.head-download-app{
  width: 100%;
  position:absolute;
  bottom: 100px;
  text-align: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: lighter;
  transition: all 0.1s;
}
.head-download-app:hover{
  transform: scale(1.2);
}
.beside-aside{
  position: absolute;
  top: 15px;
  right: 0;
  height: 35px;
  width: 4px;
  background: #4e4c4c;
  transition: all 0.3s;
  transform: translateY(0px);
}
.to-top{
  cursor: pointer;
  background-color: #4e4c4c;
}
</style>
