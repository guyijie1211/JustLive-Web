<template>
  <div id="container" class="room-main-container">
    <el-dialog
        title="登录账号"
        :visible.sync="dialogVisible"
        width="450px"
        height="200px"
        :destroy-on-close="true">
      <Login @loginResult="handleLogin"></Login>
    </el-dialog>
    <div id="roomLeft" class="room-left">
      <div v-if="isLive()" id="video" class="room-left-video">
        <ArtPlayerMobile ref="childPlayer" v-if="isLive()" class="room-left-video-play" @notSupport="notSupport"
                       @newDanmuSend="newDanmuSend" :platform="platform" :room-id="roomId"
                       :is-live="isLive" :danmu-style="danmuStyle" :danmu-speed="danmuSpeed" :danmu-area="danmuArea"
                         :danmu-num="danmuNum"/>
      </div>
      <div v-else class="room-left-video-notLive">直播间未开播</div>
      <div class="room-left-info">
        <div class="room-left-info-head">
          <el-image class="head-pic" :src=roomInfo.ownerHeadPic :preview-src-list="getPreList(roomInfo.ownerHeadPic)"  />
        </div>
        <div id="roomInfo" class="room-left-info-after-head">
          <div class="room-left-info-after-head-name">
            <div :class="isLive() ? 'info-isLive' : 'info-notLive'" style="font-size: small">{{ isLive() ? "直播中" : "未开播" }}</div>{{ roomInfo.roomName }}
          </div>
          <div class="room-left-info-after-head-owner">
            {{ getPlatform(platform) }} · {{ roomInfo.ownerName }}
          </div>
        </div>
      </div>
    </div>
    <div id="room-right" class="room-right">
      <div class="room-right-body">
        <div class="room-right-body-danmu-box" v-if="danmuSupport">
          <transition-group name="danmu">
            <div class="room-right-show-danmu" v-for="(danmu, index) in danmuList" :key="index">
              <span class="danmu-name">{{ danmu.fromName }}:</span>
              <span class="danmu-msg">{{ danmu.msg }}</span>
            </div>
          </transition-group>
        </div>
        <div class="not-support" v-else>
          暂不支持{{getPlatform(platform)}}的弹幕
        </div>
      </div>
      <div v-if="!isBottom" @click="toBottom()" class="to-bottom">
        返回底部
      </div>
    </div>
    <div class="room-left-info-right-follow">
      <el-button class="room-follow" @click="followRoom()" :type="followed ? 'info' : 'primary'" size="small" round>
        <i :class="followed ? 'el-icon-star-on' : 'el-icon-star-off'" style="font-size: 20px;"></i>
        <span class="follow-btn" v-text="followed ? '已关注' : '关注'"></span>
      </el-button>
    </div>
  </div>
</template>

<script>
import {getRoomInfo} from "@/api/liveList";
import {changeUserInfo, follow, unFollow} from "@/api/UserApi";
import Login from "@/components/Login/Login";
import ArtPlayerTest from "@/components/Test/ArtPlayerTest";
import ArtPlayerMobile from "./ArtPlayerMobile";
import Global from "@/components/Global";

export default {
  name: "Room",
  components: {Login, ArtPlayerMobile},
  props: ['userInfo', 'isLogin'],
  data() {
    return {
      levelBanTxt: "等级屏蔽",
      platform: null,
      roomId: null,
      followed: false,
      roomInfo: {},
      textarea: null,
      danmuList: [],
      danmuSupport: true,
      isBottom: true, //弹幕列表是否在底部（判断是否在浏览历史记录）
      dialogVisible: false,
      popoverVisible: false,
      loading: false,
      banActive: false,
      banLevel: 1,
      banContentList: [],
      checkedContentList: [],
      banActiveTemp: false,
      banLevelTemp: 1,
      banContentListTemp: [],
      checkedContentListTemp: [],
      newContent:"",
      danmuStyle: {
        fontSize: 50,
        color: "#ffffff",
        textShadow: true,
        opacity: 100,
        fontWeight: 50,
      },
      danmuSpeed: 20,
      danmuNum: 100,
      danmuArea: 100,
      form: {
        content: "",
      }
    }
  },
  methods: {
    init(){
      this.platform = this.$route.query.platform
      this.roomId = this.$route.query.roomId
      if (localStorage.getItem("danmuStyle")) {
        this.danmuStyle = JSON.parse(localStorage.getItem("danmuStyle"))
      }
      if (localStorage.getItem("danmuSpeed")) {
        this.danmuSpeed = Number(localStorage.getItem("danmuSpeed"))
      }
      if (localStorage.getItem("danmuArea")) {
        this.danmuArea = Number(localStorage.getItem("danmuArea"))
      }
      getRoomInfo(this.userInfo.uid, this.platform, this.roomId)
        .then(response => {
          if (response.data.code == 200){
              this.roomInfo = response.data.data
              this.roomId = response.data.data.roomId
              let flag = (response.data.data.isFollowed == 1)
              this.followed = flag
              document.title = this.roomInfo.ownerName;
          }
        })
    },
    getPreList(pic){
      return [pic]
    },
    overCheck(e){
      let target = e.currentTarget;
      let icon = target.lastElementChild;
      icon.style.display="block";
    },
    outCheck(e){
      let target = e.currentTarget;
      let icon = target.lastElementChild;
      icon.style.display="none";
    },
    deleteContent(e) {
      let target = e.currentTarget;
      let checkBox = target.previousElementSibling;
      let delContent = checkBox.lastElementChild.innerText;
      let list = this.banContentListTemp
      for (var i = 0; i < list.length; i++) {
        if (list[i] == delContent){
          this.banContentListTemp.splice(i, 1);
          break;
        }
      }
      let list2 = this.checkedContentListTemp
      for (var j = 0; j < list2.length; j++) {
        if (list2[j] == delContent){
          this.checkedContentListTemp.splice(j, 1);
          break;
        }
      }
    },
    addBan(value){
      if (this.banContentList.indexOf(value) > -1){
        this.$notify({
          title: '提醒',
          message: '关键词重复数',
          type: 'warning',
          position: "bottom-right",
          duration: "1500",
          showClose: false
        });
      } else if(value.indexOf(";") > -1) {
        this.$notify({
          title: '提醒',
          message: '屏蔽词不能包含“;”',
          type: 'warning',
          position: "bottom-right",
          duration: "1500",
          showClose: false
        });
      } else {
        this.banContentListTemp.push(value);
        this.newContent = "";
      }
    },
    hasNewContent(value){
      if(value==""||value==undefined||value==null){
        return false;
      }
      return true;
    },
    getUrl(){
      if (this.platform == 'bilibili'){
        return 'https://live.bilibili.com/' + this.roomId
      }
      if (this.platform == 'douyu'){
        return 'https://www.douyu.com/' + this.roomId
      }
      if (this.platform == 'huya'){
        return 'https://m.huya.com/' + this.roomId
      }
      if (this.platform == 'cc'){
        return 'https://cc.163.com/' + this.roomId
      }
    },
    getPlatform(platForm){
      return Global.getPlatform(platForm)
    },
    isLive(){
      let state = this.roomInfo.isLive
      if (state == "0"){
        return false
      }else {
        return true
      }
    },
    notSupport(){
      this.danmuSupport = false
    },
    newDanmuSend(newDanmu){
      let _this = this
      if (_this.danmuList.length >= 200){
        this.danmuList.splice(0,100)
      }
      this.danmuList.push(newDanmu)
      _this.$nextTick(() => {
        if(this.isBottom){
          var container = document.getElementsByClassName("room-right-body")[0];
          container.scrollTop  = container.scrollHeight;
        }
      });
    },
    toBottom(){
      let _this = this
      _this.$nextTick(() => {
        var container = document.getElementsByClassName("room-right-body")[0];
        container.scrollTop  = container.scrollHeight;
      });
      this.isBottom = true
    },
    listenerFunction(e) {
      document.addEventListener('scroll', this.handleScroll, true);
    },
    handleScroll () {
      let target = document.getElementsByClassName("room-right-body")[0]
      if((target.scrollHeight-target.clientHeight)-target.scrollTop > 10){
          this.isBottom = false
      }else{
        this.isBottom = true
      }
    },
    handleLogin(result, userInfo){
      let _this = this
      if(result == "success"){
        _this.$emit("loginSuccess",userInfo)
        this.dialogVisible = false
      }
      if(this.isLogin == 'false' && result == "cancel"){
        this.dialogVisible = false
      }
    },
    followRoom(){
      if (this.isLogin == 'false'){
        this.dialogVisible = true
      }else{
        if(!this.followed){
          follow(this.roomInfo.platForm, this.roomId, this.userInfo.uid)
              .then(response => {
                let data = response.data
                if(data.code == 200) {
                  this.$message({
                    message: '关注成功',
                    type: 'success'
                  });
                }
                this.followed = true
              })
        }else {
          unFollow(this.roomInfo.platForm, this.roomId, this.userInfo.uid)
              .then(response => {
                let data = response.data
                if(data.code == 200) {
                  this.$message({
                    message: '已取消关注',
                    type: 'info'
                  });
                }
                this.followed = false
              })
        }
      }
    },
    saveFont() {
      localStorage.setItem('danmuStyle', JSON.stringify(this.danmuStyle))
      localStorage.setItem('danmuSpeed', this.danmuSpeed)
      localStorage.setItem('danmuArea', this.danmuArea)
    },
    speedWord(value) {
      switch (value) {
        case 0:
          return "极慢"
        case 20:
          return "慢"
        case 40:
          return "适中"
        case 60:
          return "快"
        case 80:
          return "很快"
        case 100:
          return "极快"
      }
    },
    weightWord(value) {
      switch (value) {
        case 0:
          return "针细"
        case 50:
          return "适中"
        case 100:
          return "超粗"
      }
    },
    areaWord(value) {
      switch (value) {
        case 0:
          return "建议直接关闭弹幕"
        case 25:
          return "1/4屏"
        case 50:
          return "半屏"
        case 75:
          return "3/4屏"
        case 100:
          return "全屏"
      }
    },
    numWord(value) {
      switch (value) {
        case 0:
          return "很少"
        case 25:
          return "较少"
        case 50:
          return "中等"
        case 75:
          return "大量"
        case 100:
          return "无限"
      }
    }
  },
  created() {
    this.listenerFunction();
  },
  mounted() {
    this.init()
    let width = document.body.clientWidth
    let video = document.getElementById("video")
    video.style.height = (width*9/16) + 'px'
    let roomInfo = document.getElementById("roomInfo")
    roomInfo.style.width = (width-65) + 'px'
    let roomRight = document.getElementById("room-right")
    console.log(document.getElementById("container").style.height)
    roomRight.style.height = document.getElementById("container").offsetHeight - document.getElementById("roomLeft").offsetHeight + 'px'
  },
  computed: {
    banContentListComputed: function() {
      return this.banContentListTemp.filter((item) => {
        return item.trim()!=null && item.trim()!=''
      })
    },
  },
  watch:{
    'isLogin': function (val){
      this.popoverVisible = false
      getRoomInfo(this.userInfo.uid, this.platform, this.roomId)
          .then(response => {
            if (response.data.code == 200){
              this.roomInfo = response.data.data
              this.roomId = response.data.data.roomId
              let flag = (response.data.data.isFollowed == 1)
              this.followed = flag
            }
          })
    },
    '$route' (to, from) { //监听路由是否变化
      if(to.query.roomId != from.query.roomId){
        this.$router.go(0);
      }
    }
  },
  beforeDestroy(){
    document.removeEventListener("scroll", this.handleScroll, true);
    console.log('销毁room')
  },
}
</script>
<style>
.el-slider__runway{
  position: absolute;
  top: 0px;
  width: 200px;
  margin: 8px 0;
}
</style>

<style scoped>
.room-main-container{
  height: 100%;
  width: 100%;
}
.room-left{
  position: relative;
  width: 100%;
}
.room-left-video{
  width: 100%;
  /* height: 84%; */
  background-color: black;
}
.room-left-video-notLive{
  width: 100%;
  /*flex 布局*/
  display: flex;
  /*实现垂直居中*/
  align-items: center;
  /*实现水平居中*/
  justify-content: center;
  text-align: justify;
  font-weight: bolder;
  font-size: 25px;
  color: #939495;
  background-color: black;
}
.room-left-info{
  width: 100%;
  height: 70px;
  box-shadow: 0px 5px 5px -5px #4e4c4c;
}
.room-right{
  /*background-color: #e0e0e0;*/
  width: 100%;
  height: 100%;
  /*box-shadow: #2b2b2b 0px 0px 10px 1px inset;*/
  border-left:1px solid #c8c8c9;
}
.room-left-video-play{
  width: 100%;
  height: 100%;
}
.room-left-info-head{
  float: left;
  margin-top: 11px;
  margin-left: 8px;
  width: 45px;
  height: 45px;
  box-shadow: #2b2b2b 0px 0px 5px 1px;
  border-radius: 10px;
}
.room-left-info-after-head{
  float: left;
  width: 80%;
  margin-left: 10px;
  margin-top: 7px;
}
.room-left-info-after-head-name{
  font-weight: bold;
  font-size: 17px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.room-left-info-after-head-owner{
  margin-top: 8px;
  font-weight: normal;
  font-size: 15px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.info-isLive{
  margin-top: 6px;
  margin-right: 5px;
  float: left;
  height: 18px;
  width: 45px;
  background-color: #c10f0f;
  border-radius: 10px;
  font-size: 5px;
  font-weight: 600;
  text-align: center;
  color: #F3F6F8;
}
.info-notLive{
  margin-top: 6px;
  margin-right: 5px;
  float: left;
  height: 18px;
  width: 45px;
  background-color: #979797;
  border-radius: 10px;
  font-size: 5px;
  font-weight: 600;
  text-align: center;
  color: #F3F6F8;
}
.head-pic{
  border-radius: 10px;
  height: 100%;
  width: 100%;
}
.el-dropdown-link {
  cursor: pointer;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.room-left-info-right{
  float: right;
  margin-right: 10px;
  font-size: 35px;
}
.room-left-info-right-setting{
  float: right;
  margin-right: 40px;
}
.room-left-info-right-link{
  margin-top: 5px;
  float: right;
  margin-right: 25px;
  transition: all 0.2s;
}
.room-left-info-right-link:hover{
  cursor: pointer;
  transform: scale(1.2);
}
.room-left-info-right-ban{
  margin-top: 5px;
  float: right;
  margin-right: 25px;
  transition: all 0.2s;
}
.room-left-info-right-ban:hover{
  cursor: pointer;
  transform: scale(1.15);
}
.follow-btn{
  font-size: 15px;
}
.room-right-top{
  width: 100%;
  height: 40px;
  /*flex 布局*/
  display: flex;
  /*实现垂直居中*/
  align-items: center;
  /*实现水平居中*/
  justify-content: center;
  text-align: justify;
  font-weight: bold;
  font-size: 20px;
  border-bottom:1px solid #c8c8c9;
}
.room-right-body{
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  height: 100%;
}
.room-right-body::-webkit-scrollbar {
  width: 4px;
  /*height: 4px;*/
}
.room-right-body::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #8e8e8e;
}
.danmu{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.room-right-show-danmu{
  margin-top: 10px;
  margin-left: 10px;
  font-size: 15px;
  width: 94%;
}
.danmu-name{
  float: left;
  font-weight: bold;
}
.danmu-msg{
  margin-left: 5px;
  font-weight: normal;
  /*display:block; */
  white-space:pre-wrap;
  word-wrap:break-word;
  overflow:hidden ;
}
.to-bottom{
  position: absolute;
  bottom: 80px;
  background-color: rgba(54, 51, 51, 0.7);
  font-weight: bold;
  color: #ffffff;
  left: 37%;
  height: 30px;
  border-radius: 20px;
  width: 100px;
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
  background-color: #4e4c4c;
}
.not-support{
  margin-top: 20px;
  font-weight: normal;
  text-align: center;
}
.el-input-number {
  width: 80px;
}
.global-ban{
  font-weight: normal;
  font-size: 20px;
  color: #409EFF;
  margin-bottom: 10px;
}
.el-input {
  width: 150px;
}
.ban-content-btn{
  margin-left: 10px;
}
.ban-content-div{
  display: flex;
  /*实现垂直居中*/
  align-items: center;
  /*实现水平居中*/
  justify-content: center;
  text-align: justify;
  margin-bottom: 10px;
}
.ban-content-list{
  min-height: 20px;
  max-height: 200px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.ban-content-list::-webkit-scrollbar {
  width: 8px;
  /*height: 4px;*/
}
.ban-content-list::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #8e8e8e;
}
.room-left-info-right-ban-login-div {
  font-size: 15px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  width: 100%;
}
.room-left-info-right-ban-login {
  color: #007ACC;
  transition: all 0.1s;
}
.room-left-info-right-ban-login:hover {
  transform: scale(1.1);
  cursor: pointer;
}
.ban-content-list-icon{
  display: none;
  font-size: 15px;
  position: absolute;
  right: 10px;
  top: 3px;
  color: #fc5e5e;
}
.ban-content-list-icon:hover{
  cursor: pointer;
  color: red;
}
a:link { text-decoration: none;color: #4e4c4c}
a:active { text-decoration:blink}
a:hover { text-decoration:underline;color: #4e4c4c}
a:visited { text-decoration: none;color: #4e4c4c}
.danmu-style-title{
  width: 100%;
  color: #3a8ee6;
  font-size: 20px;
}
.danmu-cap{
  margin-left: 22%;
  width: 180px;
}
.danmu-cap-div{
  margin-top: 10px;
  margin-bottom: 20px;
  position: relative;
  width: 100%;
}
.danmu-cap-value{
  position: absolute;
  top: 0px;
  right: 10px;
}
.room-follow {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
