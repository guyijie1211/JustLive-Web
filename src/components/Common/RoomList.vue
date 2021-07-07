<template>
  <el-row class="recommend-room-row" :gutter="20">
    <transition-group name="card">
      <el-col class="recommend-room-col" :span="6" v-for="(room, index) in roomList" :key="index">
        <el-card @click.native="toRoom(room.platForm, room.roomId)" shadow="hover" class="recommend-room-card">
          <div class="recommend-room-pic">
            <div class="pic-bottom">
              <div class="pic-bottom-area">
                {{ room.categoryName }}
              </div>
              <div class="pic-bottom-number">
                <i class="el-icon-user"></i>{{ handleOnline(room.online) }}
              </div>
            </div>
            <el-image v-if="room.isLive == 1"
                      class="recommend-room-pic-img"
                      :src="room.roomPic"
                      :fit="fit">
<!--              <div slot="placeholder" class="image-placeholder-slot">-->
<!--                <i class="el-icon-loading image-placeholder"></i>-->
<!--              </div>-->
            </el-image>
            <div v-if="room.isLive == 0" class="recommend-room-pic-notLive">未开播</div>
          </div>
          <div class="recommend-room-under-pic">
            <div class="recommend-room-info-head">
              <el-image :src=room.ownerHeadPic fit="fill" style="border-radius: 8px;"/>
            </div>
            <div class="recommend-room-info">
              <span class="recommend-room-info-owner">{{ getPlatform(room.platForm) }}·{{ room.ownerName }}</span>
              <span class="recommend-room-info-roomName">{{ room.roomName }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </transition-group>
      <div class="roomList-load" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)">
    </div>
  </el-row>
</template>

<script>
export default {
  name: "RoomList",
  props: ['roomList'],
  data() {
    return {
      loading: false,
      fit: "cover",
    }
  },
  methods: {
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
    },
    getLoad(){
      this.loading = true
    },
    loadFinish(){
      this.loading = false
    },
    handleOnline(online){
      let num = online.toString().trim()
      if (num.length > 4){
        let numCut = num.substring(0, num.length-4)
        let afterPoint = num.substring(num.length-4,num.length-3)
        return numCut+'.'+afterPoint+'万'
      }else {
        return num+'人'
      }
    },
  },
}
</script>

<style scoped>
.recommend-room-row{
  padding-left: 2%;
  overflow: hidden;
  padding-bottom: 40px;
}
.recommend-room-col{
  margin-top: 25px;
  height: 170px;
}
.recommend-room-col:hover{
  height: 170px;
}
.recommend-room-card{
  position: relative;
  margin-left: 10px;
  height: 170px;
  width: 250px;
  transition: all 0.2s;
}
.recommend-room-card:hover{
  cursor: pointer;
  transform: scale(1.15); /* 放大1.1倍 */
}
.recommend-room-pic{
  width: 100%;
  height: 122px;
  position:relative;
  z-index: 1;
  box-shadow: inset 0px -10px 0px -10px #000000;
  overflow: hidden;
}
.recommend-room-pic-img{
  height: 100%;
  width: 100%;
  /*object-fit: cover;*/
  /*transition: all 0.6s;*/
}
.recommend-room-info-head{
  margin-left: 10px;
  margin-top: 9px;
  float: left;
  width: 30px;
  height: 30px;
}
.recommend-room-info{
  position: absolute;
  overflow: hidden;
  top: 5px;
  left: 50px;
  right: 10px;
  bottom: 5px;
}
.recommend-room-info-owner{
  width: 100%;
  height: 50%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  float: left;
  font-weight: bold;
  font-size: 14px;
}
.recommend-room-info-roomName{
  float: left;
  font-weight: normal;
  width: 100%;
  height: 50%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
}
.el-card /deep/ .el-card__body{
  padding: 0px;
  height: 100%;
}
.recommend-room-pic-notLive{
  height: 100%;
  width: 100%;
  /*flex 布局*/
  display: flex;
  /*实现垂直居中*/
  align-items: center;
  /*实现水平居中*/
  justify-content: center;
  text-align: justify;
  font-weight: bold;
  font-size: 20px;
  color: #939495;
  background-color: black;
}
.recommend-room-under-pic{
  position: relative;
  width: 100%;
  height: 48px;
}
.roomList-load{
  position: absolute;
  width: 100%;
  bottom: 0px;
  left: 0px;
  height: 80px;
}
.pic-bottom{
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 20px;
  z-index: 100;
  /*background: rgba(0, 0, 0, 0.5);*/
  box-shadow:inset 0px -10px 20px 1px #474747;
}
.pic-bottom-number{
  color: white;
  font-weight: normal;
  font-size: small;
  float: right;
  margin-right: 10px;
}
.pic-bottom-area{
  color: white;
  font-weight: bold;
  font-size: small;
  float: left;
  margin-left: 10px;
}
.card-enter{
  margin-top: 100px;
}
.card-enter-active{
  transition: all 0.7s;
}
.image-placeholder-slot{
  width: 100%;
  height: 100%;
  position: absolute;
  /*background-color: rgba(0, 0, 0, 0.2);*/
}
.image-placeholder{
  position: absolute;
  top: 50%;
  left: 50%;
}
</style>
