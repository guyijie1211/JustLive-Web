<template>
  <el-row id="recommend-room-row" :gutter="20" class="recommend-room-row">
      <el-col class="recommend-room-col" :xs="20" :sm="10" :md="8" :lg="6" :xl="6" v-for="(room, index) in roomList" :key="index">
        <el-card @click.native="toRoom(room.platForm, room.roomId)" shadow="hover" class="recommend-room-card">
          <div class="new-tab" @click.stop="newToRoom(room.platForm, room.roomId)">
            <el-tooltip content="点击在新标签页中打开" placement="right-start"><i class="el-icon-position"></i></el-tooltip>
          </div>
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
      colNum: 6,
    }
  },
  methods: {
    //新标签页打开
    newToRoom(platform, roomId){
      let route = this.$router.resolve({ name: 'liveRoom', query:{ platform : platform, roomId : roomId } });
      window.open(route.href, '_blank')
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
  mounted() {
    // window.onresize = function(){
    //   let _this = this;
    //   let width = document.getElementById("recommend-room-row").offsetWidth;
    //   // console.log(width);
    //   _this.colNum = width/250;
    //   console.log(this.colNum);
    // };
  },
}
</script>

<style scoped>
.recommend-room-row{
  /*padding-left: 2%;*/
  overflow: hidden;
  padding-bottom: 40px;
  /*float: left;*/
}
.recommend-room-col{
  margin-top: 25px;
  /*margin-left: 30px;*/
  height: 170px;
  /*float: left;*/
}
.recommend-room-col:hover{
  height: 170px;
}
.new-tab{
  font-size: 25px;
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 10;
  color: red;
  cursor: pointer;
  display: none;
}
.recommend-room-card:hover .new-tab{
  display: inline;
}
.recommend-room-card{
  margin:0 auto;
  position: relative;
  /*margin-left: 10px;*/
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
</style>
