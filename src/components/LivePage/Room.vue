<template>
  <div class="room-main-container">
    <el-dialog
        title="登录账号"
        :visible.sync="dialogVisible"
        width="450px"
        height="200px"
        :destroy-on-close="true">
      <Login @loginResult="handleLogin"></Login>
    </el-dialog>
    <div class="room-left">
      <div v-if="isLive()" class="room-left-video">
        <ArtPlayerTest v-if="isLive()" class="room-left-video-play" @notSupport="notSupport" @newDanmuSend="newDanmuSend" :platform="platform" :room-id="roomId" :is-live="isLive"></ArtPlayerTest>
      </div>
      <div v-else class="room-left-video-notLive">直播间未开播</div>
      <div class="room-left-info">
        <div class="room-left-info-head">
          <img class="head-pic" :src=roomInfo.ownerHeadPic />
        </div>
        <div class="room-left-info-after-head">
          <div class="room-left-info-after-head-name">
            <div :class="isLive() ? 'info-isLive' : 'info-notLive'">{{ isLive() ? "直播中" : "未开播" }}</div>{{ roomInfo.roomName }}
          </div>
          <div class="room-left-info-after-head-owner">
            {{ getPlatform(platform) }} · {{ roomInfo.ownerName }}
          </div>
        </div>
        <div class="room-left-info-right">
          <div class="room-left-info-right-link">
            <el-tooltip class="item" effect="dark" content="跳转到直播间" placement="top">
              <a :href="getUrl()" target="_blank"><i class="el-icon-link"></i></a>
            </el-tooltip>
          </div>
          <div class="room-left-info-right-follow">
            <el-button @click="followRoom()" :type="followed ? 'info' : 'primary'" size="mini">
              <i :class="followed ? 'el-icon-star-on' : 'el-icon-star-off'" style="font-size: 20px;"></i>
              <span class="follow-btn" v-text="followed ? '已关注' : '关注'"></span>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="room-right">
      <div class="room-right-top">
        直播聊天
      </div>
      <div class="room-right-body">
        <div v-if="danmuSupport">
          <div class="room-right-show-danmu" v-for="(danmu, index) in danmuList" :key="index">
            <span class="danmu-name">{{ danmu.fromName }}:</span>
            <span class="danmu-msg">{{ danmu.msg }}</span>
          </div>
        </div>
        <div class="not-support" v-else>
          暂不支持{{getPlatform(platform)}}的弹幕
        </div>
      </div>
      <div v-if="!isBottom" @click="toBottom()" class="to-bottom">
        返回底部
      </div>
    </div>
  </div>
</template>

<script>
import {getRoomInfo} from "@/api/liveList";
import ArtPlayerTest from "@/components/Test/ArtPlayerTest";
import {follow, unFollow} from "@/api/UserApi";
import Login from "@/components/Login/Login";

export default {
  name: "Room",
  components: {Login, ArtPlayerTest},
  props: ['userInfo', 'isLogin'],
  data() {
    return {
      platform: null,
      roomId: null,
      followed: false,
      roomInfo: {},
      textarea: null,
      danmuList: [],
      danmuSupport: true,
      isBottom: true, //弹幕列表是否在底部（判断是否在浏览历史记录）
      dialogVisible: false,
    }
  },
  methods: {
    init(){
      this.platform = this.$route.query.platform
      this.roomId = this.$route.query.roomId
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
      if (platForm == 'bilibili'){
        return '哔哩哔哩'
      }
      if (platForm == 'douyu'){
        return '斗鱼'
      }
      if (platForm == 'huya'){
        return '虎牙'
      }
      if (platForm == 'cc'){
        return '网易CC'
      }
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
  },
  created() {
    this.listenerFunction();
  },
  mounted() {
    this.init()
  },
  watch:{
    'isLogin': function (val){
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
  },
  beforeDestroy(){
    document.removeEventListener("scroll", this.handleScroll, true);
    console.log('销毁room')
  },
}
</script>

<style scoped>
.room-main-container{
  height: 100%;
  width: 100%;
}
.room-left{
  position: relative;
  width: 78%;
  height: 100%;
}
.room-left-video{
  position: absolute;
  width: 100%;
  /* height: 84%; */
  background-color: black;
  top: 0px;
  left: 0px;
  bottom: 80px;
}
.room-left-video-notLive{
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 80px;
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
  height: 80px;
  position: absolute;
  bottom: 0px;
  left: 0px;
}
.room-right{
  /*background-color: #e0e0e0;*/
  width: 22%;
  height: 100%;
  position: fixed;
  top: 50px;
  right: 0px;
  /*box-shadow: #2b2b2b 0px 0px 10px 1px inset;*/
  border-left:1px solid #c8c8c9;
}
.room-left-video-play{
  width: 100%;
  height: 100%;
}
.room-left-info-head{
  float: left;
  margin-top: 9px;
  margin-left: 8px;
  width: 60px;
  height: 60px;
  box-shadow: #2b2b2b 0px 0px 5px 1px;
  border-radius: 10px;
}
.room-left-info-after-head{
  float: left;
  margin-left: 10px;
  margin-top: 8px;
}
.room-left-info-after-head-name{
  font-weight: bold;
  font-size: 20px;
}
.room-left-info-after-head-owner{
  margin-top: 10px;
  font-weight: bold;
  font-size: 15px;
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
  margin-top: 8px;
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
.room-left-info-right-follow{
  float: right;
  margin-right: 25px;
  transition: all 0.1s;
}
.room-left-info-right-follow:hover{
  transform: scale(1.08);
}
.follow-btn{
  margin-left: 5px;
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
  border-bottom:1px solid #c8c8c9;
}
.room-right-body{
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  /* height: 70%; */
  position: absolute;
  top: 40px;
  bottom: 0px;
}
.room-right-body::-webkit-scrollbar {
  width: 8px;
  /*height: 4px;*/
}
.room-right-body::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #8e8e8e;
}
.el-input /deep/ .el-input__inner{
  border-radius: 20px;
  background-color: #eaeaea;
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
  font-weight: bold;
}
.danmu-msg{
  margin-left: 5px;
  font-weight: normal;
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
a:link { text-decoration: none;color: #4e4c4c}
a:active { text-decoration:blink}
a:hover { text-decoration:underline;color: #4e4c4c}
a:visited { text-decoration: none;color: #4e4c4c}
</style>
