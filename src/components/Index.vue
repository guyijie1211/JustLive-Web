<template>
  <el-container style="height: 100%; width: 100%">
    <el-header class="home-header" style="height: 50px">
      <div class="home-head-search-bar">
        <div class="logo" @click="toMain()">Live</div>
        <div v-if="showSearch">
          <el-input
              class="head-search"
              placeholder="搜索主播"
              v-model="searchInput">
          </el-input>
          <el-button class="search-btn" icon="el-icon-search" circle @click="submitKw()" size="small"></el-button>
        </div>
        <div class="user-info">
          <div v-if="isLogin == 'true'" class="user-info-in">
            <el-dropdown @command="handleCommand">
              <div class="el-dropdown-link">
                {{ userInfo.nickName }}<i class="el-icon-arrow-down el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
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
          <el-timeline-item timestamp="2021/07/28" placement="top" color='#0bbd87'>
            <el-card>
              <p>更换弹幕插件, 优化弹幕体验(弹幕样式设置并入弹幕屏蔽设置中，弹幕样式设置保存在本地浏览器缓存中)</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/27" placement="top">
            <el-card>
              <p>增加企鹅电竞直播源</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/20" placement="top">
            <el-card>
              <p>修复房间列表布局问题</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/09" placement="top">
            <el-card>
              <p>测试功能：电视节目直播</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/07/07" placement="top">
            <el-card>
              <p>增加直播页面弹幕列表、房间列表和分区列表的动画效果</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/29" placement="top">
            <el-card>
              <p>修复斗鱼房间人数达到“亿”后导致无法获取房间信息的问题</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/28" placement="top">
            <el-card>
              <p>增加弹幕屏蔽功能（支持用户等级和弹幕内容屏蔽）</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/27" placement="top">
            <el-card>
              <p>修复虎牙接口更新导致的问题</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/08" placement="top">
            <el-card>
              <p>网站升级Https协议</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2021/06/04" placement="top">
            <el-card>
              <p>增加虎牙弹幕获取支持</p>
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
import {changePassword, changeUserInfo} from "@/api/UserApi";

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
      mixLiveUpdate: "20210728",
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
    updateInfoConfirm(){
      localStorage.setItem("mixLiveUpdate", this.mixLiveUpdate);
      this.updateInfo = !this.updateInfo;
    },
    toMain(){
      this.$router.push('/index/home/recommend')
    },
    submitKw(){
      if(this.searchInput.trim()!=''){
        let searchInput = this.searchInput
        this.showSearch = false
        this.searchInput = ''
        this.$router.push({ name: 'search', query:{ keyWord : searchInput } })
      }
    },
    logOutConfirm() {
      this.$confirm('是否要退出登录?', '注销', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        sessionStorage.removeItem("isLogin");
        sessionStorage.removeItem("userInfo");
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
      sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      sessionStorage.setItem('isLogin', this.isLogin)
      _this.$emit("loginSuccess",userInfo)
    },
    changeBan(userInfo){
      let _this = this
      this.userInfo = userInfo
      sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo))
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
                sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo))
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
                  sessionStorage.removeItem("isLogin");
                  sessionStorage.removeItem("userInfo");
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
    if (sessionStorage.getItem('userInfo')) {
      this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    }
    if (sessionStorage.getItem('isLogin')) {
      this.isLogin = sessionStorage.getItem('isLogin')
    }
    if (!sessionStorage.getItem('localBanInfo')) {
      let banObj = {
        isActived: "0",
        allContent: "",
        selectedContent: "",
        douyuLevel: "1",
        bilibiliLevel: "1",
        huyaLevel: "1",
        ccLevel: "1",
      }
      sessionStorage.setItem('localBanInfo', JSON.stringify(banObj));
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
.update-info-timeline::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #8e8e8e;
}
</style>
