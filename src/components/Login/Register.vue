<template>
  <el-dialog :visible.sync="dialogVisible" :modal="false" width="500px" v-loading="loadingVisible" @open="handleDialogOpen()">
    <div slot="title" class="dialog-header"><h3>注册用户</h3></div>
    <el-form :model="userModel" :rules="formRules" class="el-dialog-form"
      ref="userForm" label-width="120px" label-position="right" size="small">
      <el-form-item label="用户名" prop="name">
        <el-col :span="16"><el-input ref="username" :maxlength="16" v-model="userModel.name"></el-input></el-col>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-col :span="16"><el-input ref="nickname" :maxlength="16" v-model="userModel.nickname" autofocus></el-input></el-col>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-col :span="16"><el-input type="password" :maxlength="16" v-model="userModel.password" auto-complete="off"></el-input></el-col>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPassword">
        <el-col :span="16"><el-input type="password" :maxlength="16" v-model="userModel.checkPassword" auto-complete="off"></el-input></el-col>
      </el-form-item>
      <el-form-item label="邮箱" prop="mail">
        <el-col :span="16"><el-input ref="mail" v-model="userModel.mail" autofocus></el-input></el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="doRegister()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import md5 from 'js-md5';
import {registerUser} from "@/api/UserApi";
import {outputError} from "@/utils/exception";

export default {
  name: "register-user",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.userModel.checkPassword !== '') {
          this.$refs.userForm.validateField('checkPassword')
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
    return {
      loadingVisible: false,
      dialogVisible: false,
      userModel: {
        name: '',
        nickname: '',
        password: '',
        mail:'',
        checkPassword: '',
      },
      formRules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 3, max: 32, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        mail: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ]
      }      
    }
  },
  methods: {
    handleDialogOpen() {
      this.$nextTick(() => {
        this.$refs['username'].focus()
      })
    },
    doRegister() {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          this.loadingVisible = true
          registerUser(this.userModel.name, this.userModel.nickname, md5(this.userModel.password), this.userModel.mail)
          .then(response => {
            if(response.data.code === 200){
              this.loadingVisible = false
              this.dialogVisible = false
              this.$emit('onRegisterSuccessed',
                  this.userModel.name,
                  this.userModel.password,
              )
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
  },
  mounted: function() {
    this.$nextTick(() => {
      // eslint-disable-next-line no-unused-vars
      this.$on('openDialog', function(action) {
        this.dialogVisible = true
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

