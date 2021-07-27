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
        <ArtPlayerTest v-if="isLive()" class="room-left-video-play" @notSupport="notSupport"
                       @newDanmuSend="newDanmuSend" :platform="platform" :room-id="roomId"
                       :is-live="isLive" :ban-active="banActive" :ban-level="banLevel"
                       :ban-content-list="banContentList" :checked-content-list="checkedContentList"/>
      </div>
      <div v-else class="room-left-video-notLive">直播间未开播</div>
      <div class="room-left-info">
        <div class="room-left-info-head">
          <el-image class="head-pic" :src=roomInfo.ownerHeadPic :preview-src-list="getPreList(roomInfo.ownerHeadPic)"  />
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
          <div v-if="platform != 'cc'" class="room-left-info-right-ban">
            <el-popover
                placement="bottom"
                width="230"
                trigger="manual"
                v-model="popoverVisible"
                @hide="banCancel()">
              <el-form v-loading="loading" label-position="left" :model="form" size="mini">
                <div v-if="isLogin != 'true'" class="room-left-info-right-ban-login-div" >
                  <div class="room-left-info-right-ban-login" @click="dialogVisible = true">登录保存屏蔽信息</div>
                </div>
                <el-form-item label="屏蔽开关">
                  <el-switch v-model="banActiveTemp"></el-switch>
                </el-form-item>
                <el-form-item :label="getPlatform(platform) + levelBanTxt">
                  <el-input-number class="user-level" :disabled="platform=='huya'?true:false" v-model="banLevelTemp" :min="1" :max="99" controls-position="right" label="描述文字"></el-input-number>
                  <div v-if="platform=='huya'" style="font-weight: lighter">(虎牙暂不支持)</div>
                </el-form-item>
                <div class="global-ban">
                  <span>关键词屏蔽</span><span style="font-weight: lighter;font-size: 15px">(支持正则)</span>
                </div>
                <div class="ban-content-div">
                  <el-input id="contentInput" v-model="newContent" placeholder="请输入屏蔽内容" size="small"></el-input>
                  <el-button v-if="!hasNewContent(newContent)" disabled class="ban-content-btn" type="primary" size="small">添加</el-button>
                  <el-button v-if="hasNewContent(newContent)" @click="addBan(newContent)" class="ban-content-btn" type="primary" size="small">添加</el-button>
                </div>
                <div style="margin-bottom: 10px">屏蔽列表(勾选生效)</div>
                <div class="ban-content-list">
                  <el-checkbox-group v-model="checkedContentListTemp">
                    <el-row :gutter="20">
                      <el-col style="position: relative;margin-bottom: 10px;overflow-x: hidden" :span="12" v-for="(content, index) in banContentListComputed" :key="index">
                        <div @mouseover="overCheck($event)" @mouseout="outCheck($event)">
                          <el-checkbox style="overflow: hidden;" :label="content"></el-checkbox>
                          <i class="el-icon-error ban-content-list-icon" @click="deleteContent($event)"></i>
                        </div>

                      </el-col>
                    </el-row>
                  </el-checkbox-group>
                </div>
                <div style="text-align: center">
                  <el-button size="small" @click="banCancel()">取消</el-button>
                  <el-button type="primary" size="small" @click="activeBan()">确定</el-button>
                </div>
              </el-form>
              <div slot="reference" @click="popoverVisible = !popoverVisible"><i class="el-icon-remove-outline"></i></div>
            </el-popover>
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
  </div>
</template>

<script>
import {getRoomInfo} from "@/api/liveList";
import {changeUserInfo, follow, unFollow} from "@/api/UserApi";
import Login from "@/components/Login/Login";
import ArtPlayerTest from "@/components/Test/ArtPlayerTest";

export default {
  name: "Room",
  components: {Login, ArtPlayerTest},
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
      form: {
        content: "",
      }
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
      this.initBan()
    },
    getPreList(pic){
      return [pic]
    },
    initBan(){
      console.log("initBan")
      let banInfo
      if (this.isLogin == "true") {
        banInfo = this.userInfo;
      } else {
        banInfo = JSON.parse(sessionStorage.getItem('localBanInfo'));
      }
      let banContentList = banInfo.allContent.trim().split(";");
      if (banContentList[0].trim() == "") {
        banContentList.splice(0, 1);
      }
      this.banContentList = banContentList;
      let checkedContentList = banInfo.selectedContent.trim().split(";");
      if (checkedContentList[0].trim() == "") {
        checkedContentList.splice(0, 1);
      }
      this.checkedContentList = checkedContentList;
      this.banActive = banInfo.isActived == "1" ? true : false;
      if (this.platform == "douyu") {
        this.banLevel = Number(banInfo.douyuLevel);
      } else if (this.platform == "bilibili") {
        this.banLevel = Number(banInfo.bilibiliLevel);
      } else if (this.platform == "huya") {
        this.banLevel = Number(banInfo.huyaLevel);
      } else if (this.platform == "cc") {
        this.banLevel = Number(banInfo.ccLevel);
      } else if (this.platform == "egame") {
        this.banLevel = Number(banInfo.egameLevel);
      }
      this.banActiveTemp = this.banActive;
      this.banLevelTemp = this.banLevel;
      this.banContentListTemp = this.banContentList;
      this.checkedContentListTemp = this.checkedContentList;
    },
    banCancel(){
      this.popoverVisible = false
      this.banActiveTemp = this.banActive;
      this.banLevelTemp = this.banLevel;
      this.banContentListTemp = this.banContentList;
      this.checkedContentListTemp = this.checkedContentList;
    },
    activeBan(){
      let _this = this;
      if (this.isLogin == 'true') {
        this.loading = true;
      }
      this.banActive = this.banActiveTemp;
      this.banLevel = this.banLevelTemp;
      this.banContentList = this.banContentListTemp;
      this.checkedContentList = this.checkedContentListTemp;
      let banContent = '';
      for(let i=0;i<this.banContentList.length;i++) {
        let ban = this.banContentList[i];
        if (banContent != ''){
          banContent = banContent + ";" + ban;
        }else {
          banContent = ban;
        }
      }
      let checkedContent = '';
      for(let i=0;i<this.checkedContentList.length;i++) {
        let ban = this.checkedContentList[i];
        if (checkedContent != ''){
          checkedContent = checkedContent + ";" + ban;
        }else {
          checkedContent = ban;
        }
      }
      let banObj = this.userInfo;
      banObj.allContent = banContent;
      banObj.isActived = this.banActive ? "1" : "0";
      banObj.selectedContent = checkedContent;

      if (this.platform == "douyu") {
        banObj.douyuLevel = this.banLevel.toString();
      } else if (this.platform == "bilibili") {
        banObj.bilibiliLevel = this.banLevel;
      } else if (this.platform == "huya") {
        banObj.huyaLevel = this.banLevel;
      } else if (this.platform == "cc") {
        banObj.ccLevel = this.banLevel;
      } else if (this.platform == "egame") {
        banObj.egameLevel = this.banLevel;
      }

      if (this.isLogin == 'true') {
        _this.$emit("changeBan", banObj);
        changeUserInfo(this.userInfo)
            .then(response => {
              this.loading = false;
              this.popoverVisible = false
              let data = response.data
              if(data.code == 200){
                sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo))
                this.$notify({
                  title: '成功',
                  message: "屏蔽修改生效",
                  duration: 2000,
                  type: 'success',
                  offset: 50,
                });
              }
            })
      } else {
        sessionStorage.setItem('localBanInfo', JSON.stringify(banObj));
        this.$notify({
          title: '成功',
          message: "屏蔽修改生效",
          duration: 2000,
          type: 'success',
          offset: 50,
        });
        this.popoverVisible = false
      }
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
      if (this.platform == 'egame'){
        return 'https://egame.qq.com/' + this.roomId
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
      if (platForm == 'egame'){
        return '企鹅电竞'
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
      this.initBan()
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
  height: 92%;
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
  font-size: 20px;
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
.danmu-enter{
  padding-left: 50px;
}
.danmu-enter-active{
  transition: all 0.5s;
}
</style>
