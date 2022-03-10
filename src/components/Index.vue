<template>
  <el-container style="height: 100%; width: 100%">
    <el-header class="home-header" style="height: 50px">
      <div class="home-head-search-bar">
        <div class="logo" @click="toMain()">JustLive</div>
        <div v-if="showSearch">
          <el-input
              class="head-search"
              placeholder="搜索主播(斗鱼用房间号)"
              v-model="searchInput"
              @keydown.enter.native="submitKw()">
          </el-input>
          <el-button class="search-btn" icon="el-icon-search" circle @click="submitKw()" size="small"></el-button>
        </div>
        <div class="top-follow">
          <el-dropdown trigger="click" placement="bottom-end" @visible-change = "refreshRoomList()">
            <div>关注列表</div>
            <el-dropdown-menu class="top-follow-menu" slot="dropdown">
              <el-dropdown-item v-if="showFollowLoading" v-loading="topFollowLoading" style="height: 80px;"></el-dropdown-item>
              <el-dropdown-item @click.native="selectArea(areaInfo)" v-for="(owner, index) in roomListOn" :key="index">
                <el-card @click.native="toRoom(owner.platForm, owner.roomId)" class="search-result-card" shadow="hover">
                  <div class="search-result-card-head">
                    <img class="search-head-pic" :src=owner.ownerHeadPic />
                  </div>
                  <div class="search-result-card-right">
                    <div class="result-name">
                      {{ owner.ownerName }}
                    </div>
                    <div>
                      <div :class="isLive(owner.isLive) ? 'info-isLive' : 'info-notLive'">{{ isLive(owner.isLive) ? "直播中" : "未开播" }}</div>
                    </div>
                  </div>
                </el-card>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="user-info">
          <div v-if="isLogin == 'true'" class="user-info-in">
            <el-dropdown @command="handleCommand" >
              <div class="el-dropdown-link">
                {{ userInfo.nickName }}<i class="el-icon-arrow-down el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown" >
                <el-dropdown-item command="changeInfo">信息修改</el-dropdown-item>
                <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                <el-dropdown-item command="logOut" divided>注销</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div v-else class="to-login" @click="clickLogin">
            登录
          </div>
        </div>
      </div>
    </el-header>
    <keep-alive include="Home">
      <router-view @exitSearch="exitSearch" @inSearch="inSearch" @loginSuccess="loginSuccess" @changeBan="changeBan" :isLogin="isLogin" :userInfo="userInfo"></router-view>
    </keep-alive>
    <el-dialog
        title="登录"
        :visible.sync="dialogVisibleIndex"
        width="450px"
        height="200px"
        :destroy-on-close="true"
        @close="handleLogin('cancel', null)">
      <Login @loginResult="handleLogin"></Login>
    </el-dialog>
    <el-dialog title="修改信息"
               width="400px"
               :visible.sync="dialogFormVisible"
               :destroy-on-close="true"
               @closed="closeForm()">
      <el-form :model="form" label-width="80px"  size="small">
        <el-form-item label="用户名">
          <el-input :disabled="true" v-model="userInfo.userName" readonly></el-input>
        </el-form-item>
        <el-form-item label="昵称" >
          <el-input v-model="form.nickName" style="width: 100px"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogFormVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="submit()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改密码"
               width="440px"
               :visible.sync="dialogPasswordVisible"
               :destroy-on-close="true">
      <el-form ref="userPasswordForm" :model="formPassword" :rules="formPasswordRules" label-width="90px"  size="small">
        <el-form-item label="用户名" prop="name">
          <el-input :disabled="true" v-model="userInfo.userName" readonly></el-input>
        </el-form-item>
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="formPassword.oldPassword" style="width: 100px"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="formPassword.newPassword" style="width: 100px"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="checkNewPassword">
          <el-input v-model="formPassword.checkNewPassword" style="width: 100px"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogPasswordVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="submitPassword()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
        title="更新日志"
        :visible.sync="updateInfo"
        width="40%"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        center>
      <div class="update-info-timeline">
        <el-timeline>
          <el-timeline-item timestamp="2021/10/30" placement="top" color='#0bbd87'>
            <el-card>
              <p>+顶栏增加关注列表查看</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/08/30" placement="top" >
            <el-card>
              <p>+记忆登录状态</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/08/29" placement="top">
            <el-card>
              <p>+增加弹幕显示区域</p>
              <p>+增加弹幕密度（建议只在弹幕过多时使用）</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/28" placement="top">
            <el-card>
              <p>-更换弹幕插件, 优化弹幕体验（弹幕样式设置并入弹幕屏蔽设置中）</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/27" placement="top">
            <el-card>
              <p>+增加企鹅电竞直播源</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/20" placement="top">
            <el-card>
              <p>-修复房间列表布局问题</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/09" placement="top">
            <el-card>
              <p>+测试功能：电视节目直播</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/07" placement="top">
            <el-card>
              <p>+增加直播页面弹幕列表、房间列表和分区列表的动画效果</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/29" placement="top">
            <el-card>
              <p>-修复斗鱼房间人数达到“亿”后导致无法获取房间信息的问题</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/28" placement="top">
            <el-card>
              <p>+增加弹幕屏蔽功能（支持用户等级和弹幕内容屏蔽）</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/27" placement="top">
            <el-card>
              <p>-修复虎牙接口更新导致的问题</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/04" placement="top">
            <el-card>
              <p>+增加虎牙弹幕获取支持</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="updateInfoConfirm()">了 解</el-button>
  </span>
    </el-dialog>
  </el-container>
</template>

<script>
import md5 from 'js-md5';
import Login from "@/components/Login/Login";
import {changePassword, changeUserInfo, userApi} from "@/api/UserApi";

import {outputError} from "@/utils/exception";
import {getRoomsOn} from "@/api/liveList";

export default {
  name: 'Index',
  components: {
    Login
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.formPassword.checkPassword !== '') {
          this.$refs.userPasswordForm.validateField('checkPassword')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.formPassword.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      topFollowLoading: true,
      showFollowLoading:false,
      roomListOn: [],
      mixLiveUpdate: "2021103001",
      player: null,
      isActive: false,
      searchInput: '',
      showSearch: true,
      isLogin: 'false',
      userInfo:{},
      dialogVisibleIndex: false,
      dialogFormVisible: false,
      dialogPasswordVisible: false,
      form:{},
      formPassword:{},
      loading: false,
      updateInfo: false,
      formPasswordRules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        checkNewPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ],
      },
    }
  },
  methods: {
    isLive(isLive){
      if (isLive == "0"){
        return false
      }else {
        return true
      }
    },
    toRoom(platform, roomId){
      this.$router.push({ name: 'liveRoom', query:{ platform : platform, roomId : roomId } });
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
    doLogin(userName, password) {
      let _this = this
      userApi(userName, password)
          .then(response => {
            if(response.data.code === 200){
              let info = response.data.data
              info.password = password
              this.loginSuccess(info)
            }
            if(response.data.code === 400){
              localStorage.removeItem("isLogin");
              localStorage.removeItem("userInfo");
              this.isLogin = 'false'
              this.userInfo = {}
              if (window.document.location.pathname == '/index/home/follows'){
                this.$router.push('/index/home/recommend')
              }
              this.$message({
                type: 'warning',
                message: '登录信息已更改，请重新登录',
                center: true,
              });
            }

          })
          .catch(error => {
            this.loadingVisible = false
            if(error.response && error.response.status === 401) {
              this.$message({
                showClose: true,
                message: '登录失败，请检查用户名或口令是否正确！',
                type: 'error'
              })
              return
            }
            outputError(this, error)
          })
    },
    updateInfoConfirm(){
      localStorage.setItem("mixLiveUpdate", this.mixLiveUpdate);
      this.updateInfo = !this.updateInfo;
    },
    toMain(){
      this.$router.push('/index/home/recommend')
    },
    submitKw(){
      console.log("enter")
      if(this.searchInput.trim()!=''){
        let searchInput = this.searchInput
        this.showSearch = false
        this.searchInput = ''
        this.$router.push({ name: 'search', query:{ keyWord : searchInput } })
      }
    },
    refreshRoomList(){
      this.roomListOn = []
      this.initRoomList(this.userInfo.uid)
    },
    initRoomList(uid){
      this.showFollowLoading = true
      getRoomsOn(uid)
          .then(response => {
            if (response.data.code == 200){
              let roomListTemp = response.data.data
              console.log(uid)
              let roomInfo
              for (let i = 0; i < roomListTemp.length; i++){
                roomInfo = roomListTemp[i]
                if (roomInfo.isLive == 1){
                  this.roomListOn.push(roomInfo)
                  console.log(roomInfo)
                }
              }
              this.roomList = this.roomListOn
            }
            this.showFollowLoading = false
            this.loading = false
          })
    },
    logOutConfirm() {
      this.$confirm('是否要退出登录?', '注销', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("userInfo");
        this.isLogin = 'false'
        this.userInfo = {}
        if (window.document.location.pathname == '/index/home/follows'){
          this.$router.push('/index/home/recommend')
        }
        this.$message({
          type: 'warning',
          message: '已退出',
          center: true,
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消退出',
          center: true,
        });
      });
    },
    clickLogin(){
      this.dialogVisibleIndex = true
    },
    closeForm(){
      this.dialogFormVisible = false
      this.form.nickName = this.userInfo.nickName
    },
    loginSuccess(userInfo){
      let _this = this
      this.userInfo = userInfo
      this.isLogin = 'true'
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      localStorage.setItem('isLogin', this.isLogin)
      _this.$emit("loginSuccess",userInfo)
    },
    changeBan(userInfo){
      let _this = this
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },
    handleLogin(result, userInfo){
      if(result == "success"){
        this.loginSuccess(userInfo)
        this.dialogVisibleIndex = false
      }
      if(result == "cancel"){
        this.dialogVisibleIndex = false
      }
    },
    submit(){
      if(this.form.nickName.trim() == ''){
        this.$message({
          message: '群聊名不能为空字符',
          type: 'warning'
        });
        this.form.nickName = this.userInfo.nickName
      }else if(this.form.nickName.trim() == this.userInfo.nickName){
        this.$message({
          message: '换个新的吧',
          type: 'warning'
        });
        this.form.nickName = this.userInfo.nickName
      }else{
        let userInfo = {
          userName: this.userInfo.userName,
          nickName: this.form.nickName,
        }
        changeUserInfo(userInfo)
            .then(response => {
              let data = response.data
              if(data.code == 200){
                this.userInfo = data.data
                localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
                this.$notify({
                  title: '成功',
                  message: "信息修改成功",
                  duration: 2000,
                  type: 'success',
                  offset: 50,
                });
              }
              this.dialogFormVisible = false
            })
      }
    },
    exitSearch(){
      this.showSearch = true
    },
    inSearch(){
      this.showSearch = false
    },
    submitPassword(){
      this.$refs['userPasswordForm'].validate((valid) => {
        if (valid) {
          console.log(this.userInfo.userName)
          changePassword(this.userInfo.userName, md5(this.formPassword.oldPassword), md5(this.formPassword.newPassword))
              .then(response => {
                let data = response.data
                if(data.code == 200){
                  this.$notify({
                    title: '密码修改成功，请重新登录',
                    duration: 2000,
                    type: 'success',
                    offset: 50,
                  });
                  this.dialogPasswordVisible = false
                  localStorage.removeItem("isLogin");
                  localStorage.removeItem("userInfo");
                  this.isLogin = 'false'
                  this.userInfo = {}
                  this.$router.push('/index/home/recommend')
                }
                if(data.code == 400){
                  this.$notify({
                    title: '旧密码错误',
                    duration: 2000,
                    type: 'warning',
                    offset: 50,
                  });
                }
              })
        }
        else {
          return false
        }
      })

    },
    handleCommand(command) {
      if(command == 'logOut'){
        this.logOutConfirm()
      }
      if(command == 'changeInfo'){
        this.dialogFormVisible = true
      }
      if(command == 'changePassword'){
        this.dialogPasswordVisible = true
      }
    },
  },
  created() {
    if (localStorage.getItem("mixLiveUpdate") != this.mixLiveUpdate) {
      this.updateInfo = true;
    }
    if (localStorage.getItem('userInfo')) {
      this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
      this.doLogin(this.userInfo.userName, this.userInfo.password)
    }
    if (localStorage.getItem('isLogin')) {
      this.isLogin = localStorage.getItem('isLogin')
    }
    if (!localStorage.getItem('localBanInfo')) {
      let banObj = {
        isActived: "0",
        allContent: "",
        selectedContent: "",
        douyuLevel: "1",
        bilibiliLevel: "1",
        huyaLevel: "1",
        ccLevel: "1",
      }
      localStorage.setItem('localBanInfo', JSON.stringify(banObj));
    }
  }
}
</script>

<style>
.el-dialog{
  min-width: 300px;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home-header{
  width: 100%;
  box-shadow: 0px 5px 5px -5px #4e4c4c;
}
.head-search{
  width: 250px;
  margin-left: 40%;
  margin-top: 9px;
}
.home-head-search-bar{
  position: relative;
  width: 100%;
  height: 100%;
}
.el-input /deep/.el-input__inner{
  height: 30px;
  width: 300px;
  border-radius:20px;
}
.logo{
  position: absolute;
  cursor: pointer;
  top: 5px;
  left: 10px;
  font-weight: bold;
  font-size: 30px;
}
.user-info{
  position: absolute;
  top: 12px;
  right: 20px;
}
.search-head-pic{
  width: 100%;
  height: 100%;
  border-radius: 10px;
}
.result-follows{
  position: absolute;
  top: 50px;
  width: 200px;
  font-weight: normal;
  font-size: 13px;
}
.result-name{
  text-overflow: ellipsis;
  line-height: 30px;
  height: 30px;
  overflow: hidden;
  white-space: nowrap;
  width: 130px;
}
.top-follow{
  font-size: 20px;
  position: absolute;
  top: 9px;
  right: 250px;
  transition: all 0.1s;
}
.top-follow:hover {
  cursor: pointer;
  transform: scale(1.2);
}
.to-login{
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.1s;
}
.to-login:hover{
  transform: scale(1.2);
}
.el-dropdown-link{
  cursor: pointer;
  max-width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.2s;
}
.el-dropdown-link:hover{
  transform: scale(1.2);
}
.input-style{
  width: 200px;
}
.el-input /deep/ .el-input__inner{
  width: 250px;
}
.search-result-card{
  height: 60px;
  width: 100%;
  position: relative;
  transition: all 0.2s;
  margin-bottom: 10px;
}
.search-result-card:hover{
  cursor: pointer;
  transform: scale(1.1);
}
.search-result-card-right{
  position: absolute;
  top: 0px;
  left: 60px;
}
.search-result-card-head{
  position: absolute;
  top: 5px;
  left: 5px;
  height: 50px;
  width: 50px;
}
.search-btn{
  margin-left: 10px;
}
.update-info-timeline{
  width: 90%;
  height: 400px;
  overflow: auto;
  padding: 10px;
}
.update-info-timeline::-webkit-scrollbar {
  width: 5px;
  /*height: 4px;*/
}
.top-follow-menu{
  overflow: auto;
  max-height: 600px;
  width: 250px;
}
.top-follow-menu::-webkit-scrollbar {
  width: 8px;
  /*height: 4px;*/
}
.top-follow-menu::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #8e8e8e;
}
.update-info-timeline::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #8e8e8e;
}
.info-isLive{
  margin-right: 5px;
  float: left;
  height: 18px;
  line-height: 18px;
  width: 45px;
  background-color: #c10f0f;
  border-radius: 2px;
  font-size: 2px;
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
  border-radius: 2px;
  font-size: 5px;
  font-weight: 600;
  text-align: center;
  color: #F3F6F8;
}
</style>
