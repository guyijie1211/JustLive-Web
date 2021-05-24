<template>
  <div class="follows-container">
    <el-dialog
        title="登录获取关注列表"
        :visible.sync="dialogVisible"
        width="450px"
        height="200px"
        :destroy-on-close="true"
        @close="handleLogin('cancel', null)">
      <Login @loginResult="handleLogin"></Login>
    </el-dialog>
    <div class="big-word">我的关注</div>
    <ul class="follows-ul">
      <li class="follows-li" @click="selectOn">直播中</li>
      <li class="follows-li" @click="selectOff">未开播</li>
      <div class="under-li"></div>
    </ul>
    <div v-loading="loading" element-loading-background="rgba(243, 246, 248, 0.8)" class="follows-body">
      <RoomList class="follows-room-list" :room-list="roomList"/>
    </div>
  </div>
</template>

<script>
import RoomList from "@/components/Common/RoomList";
import {getRoomsOn} from "@/api/liveList";
import Login from "@/components/Login/Login";

export default {
  name: "Follows",
  components: {RoomList, Login},
  props: ['isLogin', 'userInfo'],
  data() {
    return {
      roomListOn: [],
      roomListOff: [],
      roomList: [],
      dialogVisible: !(this.isLogin == 'true'),
      loading: false,
    }
  },
  methods:{
    init(){
      let li = document.getElementsByClassName("follows-li")[0]
      li.style.color = '#007ACC'
    },
    initRoomList(uid){
      this.loading = true
      getRoomsOn(uid)
        .then(response => {
          if (response.data.code == 200){
            let roomListTemp = response.data.data
            let roomInfo
            for (let i = 0; i < roomListTemp.length; i++){
              roomInfo = roomListTemp[i]
              if (roomInfo.isLive == 1){
                this.roomListOn.push(roomInfo)
              }else if (roomInfo.isLive == 0){
                this.roomListOff.push(roomInfo)
              }
            }
            this.roomList = this.roomListOn
          }
          this.loading = false
        })
    },
    selectOn(){
      let underLi = document.getElementsByClassName("under-li")[0]
      underLi.style.transform = 'translateX(0px)'
      let li = document.getElementsByClassName("follows-li")[0]
      li.style.color = '#007ACC'
      let li2 = document.getElementsByClassName("follows-li")[1]
      li2.style.color = 'rgba(16,16,16,0.95)'
      this.roomList = this.roomListOn
    },
    selectOff(){
      let underLi = document.getElementsByClassName("under-li")[0]
      underLi.style.transform = 'translateX(58px)'
      let li = document.getElementsByClassName("follows-li")[1]
      li.style.color = '#007ACC'
      let li2 = document.getElementsByClassName("follows-li")[0]
      li2.style.color = 'rgba(16,16,16,0.95)'
      this.roomList = this.roomListOff
    },
    handleLogin(result, userInfo){
      let _this = this
      if(result == "success"){
        _this.$emit("loginSuccess",userInfo)
      }
      if(this.isLogin == 'false' && result == "cancel"){
        this.dialogVisible = false
        _this.$router.push('/index/home/recommend')
      }
    },
  },
  mounted() {
    this.$emit("activated", 1)
    this.init()

  },
  activated() {
    this.$emit("activated", 1)
    this.dialogVisible = !(this.isLogin == 'true')
    if ( this.roomListOn.length == 0 && this.roomListOff.length == 0 ){
      this.initRoomList(this.userInfo.uid)
    }
  },
  watch: {
    'isLogin': function (val){
      this.dialogVisible = !(this.isLogin == 'true')
      if(val == 'true'){
        if ( this.roomListOn.length == 0 && this.roomListOff.length == 0 ){
          this.initRoomList(this.userInfo.uid)
        }
      }
      if (val == 'false'){
        this.roomListOn = []
        this.roomListOff = []
        this.roomList = []
      }
    },
  },
}
</script>

<style scoped>
.follows-container{
  position: relative;
  height: 100%;
  width: 100%;
}
.big-word{
  cursor: default;
  font-size: 40px;
  font-weight: bold;
}
.follows-ul{
  position: relative;
  list-style: none;
  padding-left: 10px;
  height: 25px;
}
.follows-li{
  font-weight: bold;
  cursor: pointer;
  position: relative;
  margin-right: 10px;
  text-align: center;
  width: auto;
  display: inline;
  float:left;
  height: 100%;
}
.follows-li:hover{
  color: #007ACC;
}
.under-li{
  position: absolute;
  bottom: 0px;
  height: 4px;
  width: 48px;
  background: #007ACC;
  transition: all 0.3s;
  transform: translateX(0px);
}
.follows-body{
  position: absolute;
  bottom: 0;
  left: 0;
  top: 100px;
  width: 100%;
}
</style>
