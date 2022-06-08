<template>
  <div class="login-page-container">
    <div class="login-container">
      <el-form :model="loginForm" :rules="rules" ref="loginForm" autoComplete="on" label-position="left">
        <div class="login-content">
          <el-form-item prop="username">
            <el-input placeholder="用户名/邮箱" prefix-icon="el-icon-user" v-model="loginForm.username" autoComplete="on" autofocus="autofocus" @focus="clearValidate"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="密码" prefix-icon="el-icon-lock" v-model="loginForm.password" @keyup.enter.native="doLogin"></el-input>
          </el-form-item>
          <el-button class="cancel-button" type="info"  @click.native.prevent="cancelLogin">取消</el-button>
          <el-button class="login-button" type="primary" :loading="loadingVisible" @click.native.prevent="doLogin">登录</el-button>
        </div>
        <div class="login-footer">
          <a class="register-class" href="#" @click="openRegisterDialog()">立即注册</a>
          <a class="forget-class" href="#" @click="openForgetDialog()">忘记密码</a>
        </div>
      </el-form>
    </div>
    <Register  ref="registerUser" @onRegisterSuccessed="onRegisterSuccessed"></Register>
    <Forget  ref="forgetPassword"></Forget>
  </div>
</template>

<script>
import {outputError} from "@/utils/exception";
import Register from "@/components/Login/Register";
import Forget from "@/components/Login/Forget";
import {userApi} from "@/api/UserApi";
import md5 from 'js-md5';

export default {
  name:"Login",
  data() {
    return {
      loadingVisible: false,
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入口令', trigger: 'blur' }]
      }
    }
  },
  methods: {
    clearValidate() {
      this.$refs['loginForm'].clearValidate()
    },
    openRegisterDialog() {
      this.$refs.registerUser.$emit('openDialog')
    },
    openForgetDialog() {
      this.$refs.forgetPassword.$emit('openDialogForget')
    },
    onRegisterSuccessed(username, password) {
      this.loginForm.username = username
      this.loginForm.password = password
      this.doLogin()
    },
    doLogin() {
      let _this = this
      this.loadingVisible = true
      this.$refs['loginForm'].validate(valid => {
        if (valid) {
          userApi(this.loginForm.username, md5(this.loginForm.password))
              .then(response => {
                if(response.data.code === 200){
                  let info = response.data.data
                  info.password = md5(this.loginForm.password)
                  this.loginForm.username = ''
                  this.loginForm.password = ''
                  _this.$emit("loginResult", "success", response.data.data)
                }
                if(response.data.code === 400){
                  this.$message({
                    showClose: true,
                    message: response.data.message,
                    type: 'error'
                  })
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
        }
      })
      this.loadingVisible = false
    },
    cancelLogin(){
      let _this = this
      _this.$emit("loginResult", "cancel", null)
    },
  },
  components: {
    Register,
    Forget
  }
}
</script>

<style rel="stylesheet/scss"  scoped>
.login-page-container {
  padding: 0px 0px 0px 0px;
}
.login-container {
  width: 390px;
  margin: 0px auto;
  padding: 0px;
  background-color: #fff;
}
.login-content {
  position: relative;
  padding: 20px 40px 20px;
  -webkit-transition: padding-top 0.4s;
  transition: padding-top 0.4s;
}
.login-username {
  width: 20px;
  height: 20px;
  margin: 0px -10px;
}
.login-password {
  width: 20px;
  height: 20px;
  margin: 0px -10px;
}
.login-button {

  margin-left: 90px;
  width: 100px;
}
.cancel-button{
  margin-left: 10px;
  width: 100px;
}
.login-footer {
  font-size: 13px;
  padding: 0px 40px 10px;
  text-align: left;
}
a{
  text-decoration: none;
  color: #3a8ee6;
}
a:hover{
  color: #724ea8;
}
.register-class{
  margin-top: 10px;
  margin-left: 10px;
}
.forget-class{
  margin-top: 10px;
  margin-left: 30px;
}
</style>
