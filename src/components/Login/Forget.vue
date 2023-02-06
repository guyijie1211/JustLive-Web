<template>
  <el-dialog :visible.sync="forgetVisible" :modal="false" v-loading="loadingVisible" @open="handleDialogOpen()">
    <div slot="title" class="dialog-header"><h3>忘记密码</h3></div>
    <el-form :model="userModel" :rules="formRules" class="el-dialog-form"
             ref="forgetForm" label-width="120px" label-position="right" size="small">
      <el-form-item label="绑定的邮箱" prop="mail">
        <el-col :span="16"><el-input ref="mail" v-model="userModel.mail" autofocus></el-input></el-col>
        <el-button style="margin-left: 10px" size="small" type="primary" @click="sendCode()" :disabled="sendDisable" plain>{{ codeTxt }}</el-button>
      </el-form-item>
      <el-form-item label="验证码" prop="mailCode">
        <el-col :span="10"><el-input ref="mailCode" v-model="userModel.mailCode" autofocus></el-input></el-col>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-col :span="16"><el-input type="password" :maxlength="16" v-model="userModel.password" auto-complete="off"></el-input></el-col>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPassword">
        <el-col :span="16"><el-input type="password" :maxlength="16" v-model="userModel.checkPassword" auto-complete="off"></el-input></el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="forgetVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="changePassword()">更改密码</el-button>
    </span>
  </el-dialog>
</template>

<script>
import md5 from 'js-md5';
import {registerUser,sendMail,changePasswordByMail} from "@/api/UserApi";
import {outputError} from "@/utils/exception";

export default {
  name: "forget-password",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.userModel.checkPassword !== '') {
          this.$refs.forgetForm.validateField('checkPassword')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.userModel.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    var validateCode = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入验证码'))
      } else {
        if (this.userModel.mailCode.toLowerCase() !== this.mailCode.toLowerCase()) {
          callback(new Error('验证码错误'))
        }
        callback()
      }
    }
    return {
      loadingVisible: false,
      forgetVisible: false,
      mailCode: '',
      mailSent: false,
      codeTxt: '发送验证码',
      times: 10,
      sendDisable: false,
      mailAddress: '',
      userModel: {
        password: '',
        checkPassword: '',
        mail:'',
        mailCode:'',
      },
      formRules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ],
        mailCode: [
          { required: true, message: '输入验证码', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['mail'].focus()
      })
    },
    sendCode() {
      var reg=/[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
      if (this.userModel.mail == '') {
        this.$message({
          showClose: true,
          message: "邮箱不能为空",
          type: 'warning'
        })
        return;
      }
      if (!reg.test(this.userModel.mail)) {
        this.$message({
          showClose: true,
          message: "邮箱格式错误",
          type: 'warning'
        })
        return;
      }
      this.loadingVisible = true
      this.sendDisable = true
      this.codeTxt = this.times + '秒后重试';
      this.timer = setInterval(()=>{
        this.times--
        this.codeTxt = this.times + '秒后重试';
        if(this.times===0){
          clearInterval(this.timer)
          this.sendDisable = false
          this.codeTxt = '发送验证码';
          this.times = 10;
        }
      },1000)
      this.mailCode = this.getCode(5);
      this.mailAddress = this.userModel.mail;
      sendMail(this.userModel.mail, this.mailCode, 'forget')
          .then(response => {
            if(response.data.code === 200){
              this.loadingVisible = false
              this.mailSent = true;
              this.$message({
                showClose: true,
                message: response.data.message,
                type: 'success'
              })
            }
            if(response.data.code === 400){
              this.loadingVisible = false
              this.mailSent = false;
              this.$message({
                showClose: true,
                message: response.data.message,
                type: 'warning'
              })
            }

          })
          .catch(error => {
            this.loadingVisible = false
            outputError(this, error)
          })
    },
    changePassword() {
      if (!this.mailSent) {
        this.$message({
          showClose: true,
          message: "请先获取验证码",
          type: 'warning'
        })
        return
      }
      this.$refs['forgetForm'].validate((valid) => {
        if (valid) {
          this.loadingVisible = true
          changePasswordByMail(this.mailAddress, md5(this.userModel.password))
              .then(response => {
                if(response.data.code === 200){
                  this.loadingVisible = false
                  this.forgetVisible = false
                  this.$message({
                    showClose: true,
                    message: response.data.message,
                    type: 'success'
                  })
                }
                if(response.data.code === 400){
                  this.loadingVisible = false
                  this.$message({
                    showClose: true,
                    message: response.data.message,
                    type: 'warning'
                  })
                }
              })
              .catch(error => {
                this.loadingVisible = false
                outputError(this, error)
              })
        } else {
          return false
        }
      })
    },
    getCode(n) {
      let all = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let b = "";
      for (let i = 0; i < n; i++) {
        let index = Math.floor(Math.random() * 32);
        b += all.charAt(index);
      }
      return b;
    },
  },
  mounted: function() {
    this.$nextTick(() => {
      // eslint-disable-next-line no-unused-vars
      this.$on('openDialogForget', function(action) {
        this.forgetVisible = true
      })
    })
  }
}
</script>

<style scoped>
.vc-input {
  float: left;
  width: 190px;
}
.vc {
  width: 70px;
  height: 30px;
  line-height: 30px;
  float: right;
  border: solid 1px #CECECE;
  background-color: #F0F0F0;
  text-align: center;
  color: #007ACC;
}
.vc:hover {
  cursor: pointer;
}
</style>

