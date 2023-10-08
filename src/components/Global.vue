<script>
var platformList = []

const textEncoder = new TextEncoder('utf-8');
const textDecoder = new TextDecoder('utf-8');
const pako = require('pako')
const events = require('events');
const md5 = require('md5');

const HUYALIB = require('../assets/js/lib')
const HUYA = HUYALIB.HUYA
const Taf = HUYALIB.Taf
const TafMx = HUYALIB.TafMx

//bilibili弹幕编码(大端)
const readInt = function(buffer,start,len){
  let result = 0
  for(let i=len - 1;i >= 0;i--){
    result += Math.pow(256,len - i - 1) * buffer[start + i]
  }
  return result
}
const writeInt = function(buffer,start,len,value){
  let i=0
  while(i<len){
    buffer[start + i] = value/Math.pow(256,len - i - 1)
    i++
  }
}
const encode = function(str,op){
  let data = textEncoder.encode(str);
  let packetLen = 16 + data.byteLength;
  let header = [0,0,0,0,0,16,0,1,0,0,0,op,0,0,0,1]
  writeInt(header,0,4,packetLen)
  return (new Uint8Array(header.concat(...data))).buffer
}
const decode = function(blob){
  return new Promise(function(resolve, reject) {
    let reader = new FileReader();
    reader.onload = function (e){
      let buffer = new Uint8Array(e.target.result)
      let result = {}
      result.packetLen = readInt(buffer,0,4)
      result.headerLen = readInt(buffer,4,2)
      result.ver = readInt(buffer,6,2)
      result.op = readInt(buffer,8,4)
      result.seq = readInt(buffer,12,4)
      if(result.op === 5){
        result.body = []
        let offset = 0;
        while(offset < buffer.length){
          let packetLen = readInt(buffer,offset + 0,4)
          let headerLen = 16// readInt(buffer,offset + 4,4)
          let data = buffer.slice(offset + headerLen, offset + packetLen);

          /**
           * 仅有两处更改
           * 1. 引入pako做message解压处理，具体代码链接如下
           *    https://github.com/nodeca/pako/blob/master/dist/pako.js
           * 2. message文本中截断掉不需要的部分，避免JSON.parse时出现问题
           */
          let body = textDecoder.decode(pako.inflate(data));
          if (body) {
            // 同一条 message 中可能存在多条信息，用正则筛出来
            // eslint-disable-next-line no-control-regex
            const group = body.split(/[\x00-\x1f]+/);
            group.forEach(item => {
              try {
                result.body.push(JSON.parse(item));
              }
              catch(e) {
                // 忽略非 JSON 字符串，通常情况下为分隔符
              }
            });
          }

          offset += packetLen;
        }
      }else if(result.op === 3){
        result.body = {
          count: readInt(buffer,16,4)
        };
      }
      resolve(result)
    }
    reader.readAsArrayBuffer(blob);
  });
}

//斗鱼弹幕编码(小端)
const douyuReadInt = function(buffer,start,len){
  let result = 0
  for(let i=0;i < len;i++){
    result += Math.pow(256,len - i - 1) * buffer[start - i]
  }
  return result
}
const douyuWriteInt = function(buffer,start,len,value){
  let i=0
  while(i<len){
    buffer[start - i] = value/Math.pow(256,len - i - 1)
    i++
  }
}
const douyuEncode = function (str) {
  let data = textEncoder.encode(str);
  let packetLen = 9 + data.byteLength;
  let header = [0,0,0,0,0,0,0,0,177,2,0,0]
  douyuWriteInt(header,3,4,packetLen)
  douyuWriteInt(header,7,4,packetLen)
  data = textEncoder.encode(str+"\0");
  return (new Uint8Array(header.concat(...data))).buffer
}
const douyuDecode = function(blob){
  return new Promise(function(resolve, reject) {
    let reader = new FileReader();
    reader.onload = function (e){
      let buffer = new Uint8Array(e.target.result)
      let result = {}
      let packetLen = douyuReadInt(buffer,3,4)
      let op = douyuReadInt(buffer,9,2)
      if(op === 690){
        let data = buffer.slice(12, packetLen+2);
        let body = textDecoder.decode(data);
        body = body.replaceAll("@=", "\":\"").replaceAll("/", "\",\"")
        body = body.replaceAll("@A", "@").replaceAll("@S", "/")
        let json = eval('('+"{\"" + body + "\"}"+')');
        result.type = json.type
        result.body = json
      }
      resolve(result)
    }
    reader.readAsArrayBuffer(blob);
  });
}

const byteToMsg = function (buf) {
  // If the buffer is backed by a Uint8Array, a faster version will work
  if (buf instanceof Uint8Array) {
    // If the buffer isn't a subarray, return the underlying ArrayBuffer
    if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
      return buf.buffer
    } else if (typeof buf.buffer.slice === 'function') {
      // Otherwise we need to get a proper copy
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    }
  }

  if (Buffer.isBuffer(buf)) {
    // This is the slow version that will work with any Buffer
    // implementation (even in old browsers)
    var arrayCopy = new Uint8Array(buf.length)
    var len = buf.length
    for (var i = 0; i < len; i++) {
      arrayCopy[i] = buf[i]
    }
    return arrayCopy.buffer
  } else {
    throw new Error('Argument must be a Buffer')
  }
}

//企鹅电竞弹幕编码(大端)
const eGameReadInt = function(buffer,start,len){
  let result = 0
  for(let i=len - 1;i >= 0;i--){
    result += Math.pow(256,len - i - 1) * buffer[start + i]
  }
  return result
}
const eGameWriteInt = function(buffer,start,len,value){
  let i=0
  while(i<len){
    buffer[start + i] = value/Math.pow(256,len - i - 1)
    i++
  }
}
const eGameHeart = function () {
  let header = [0,0,0,18,0,18,0,1,0,7,0,0,0,1,0,0,0,0];
  return (new Uint8Array(header)).buffer
}
const eGameEncode = function (str) {
  let data = textEncoder.encode(str);
  let num = data.byteLength
  let header = [0,0,getNum(num + 23,1),getNum(num + 23,2),0,18,0,1,0,1,0,0,0,0,0,0,0,0,7,0,0,getNum(num,1),getNum(num,2)]
  return (new Uint8Array(header.concat(...data))).buffer
}
const eGameDecode = function(blob){
  return new Promise(function(resolve, reject) {
    let reader = new FileReader();
    reader.onload = function (e){
      let buffer = new Uint8Array(e.target.result)
      let result = {}
      result.startPosition = 18
      result.endPosition = eGameReadInt(buffer,0,4)
      result.seq = eGameReadInt(buffer,10,4)
      result.op = eGameReadInt(buffer,8,2)
      result.body = []
      let i = eGameReadInt(buffer,result.startPosition,4)
      let n = buffer.slice(result.startPosition, result.endPosition);
      if (n.length >= (4 + i)) {
        let o = n.slice(4, 4+i)
        let a = S(o,0)
        let y = ye(a)
        result.body.push(y)
      }
      resolve(result)
    }
    reader.readAsArrayBuffer(blob);
  });
}

const getNum = function (num, index) {
  let numTwo = num.toString(2);
  let zeros = "";
  for (let i = 0; i < 16-numTwo.length; i++) {
    zeros = zeros + "0";
  }
  numTwo = zeros + numTwo;
  let num2 = parseInt(numTwo.substr((index-1) * 8, 8));
  return parseInt(num2,2);
}
const ye = function (e) {
  return T({
    'resultObj': e,
    'template': ie,
    'afterChange': 1,
  })
}

const T = function (e){
  let i = e.resultObj[0];
  let n = e.template;
  let r = e.afterChange;
  let a = {}
  for(let s in n){
    for (let t=0; t<i.length; t++) {
      if (i[t]["tag"] == n[s]) {
        let q = i[t]
        let p = q["value"];
        let c = q.ext
        if (r) {
          a[s] = afterChange(e.resultObj[1], s, c, p, a)
        } else {
          a[s] = p
        }
        break;
      }
    }
  }
  return a;
}
const afterChange = function (e,t,i,n,o) {
  if(t == "bin_data") {
    let v = []
    let ve = {}
    for (let m=0; m<n.length; m++) {
      let a = S(e,n[m].ext)
      let b = o.msg_type;
      if (b == 1) {
        ve = T({
          'resultObj': a,
          'template': ne
        })
      } else if (b == 2) {
        ve = T({
          'resultObj': a,
          'template': oe
        })
      }
      v.push(ve)
    }
    return v
  } else {
    return n
  }
}
const ne = {
  'uid': 0,
  'msgid': 1,
  'nick': 2,
  'content': 3,
  'tm': 4,
  'type': 5,
  'scenes_flag': 6,
  'ext': 7,
  'send_scenes': 8
}
const oe = {
  'event_id': 0,
  'event_name': 1,
  'info': 2,
  'params': 3,
  'bin_data': 4
}
const ie = {
  'event_id': 0,
  'msg_type': 1,
  'bin_data': 2,
  'params': 3,
  'start_tm': 4,
  'data_list': 6,
  'end_tm': 5,
  'message_seq': 7,
}
const S = function (e,t) {
  let i = [];
  let n = e.length;
  while(t < n) {
    let o = m(e,t)
    let dict = {
      'value': o.value,
      'lastPosition': o.position,
      'ext': o.ext,
      'tag': o.tag
    }
    i.push(dict)
    t = o.position
  }
  return [i,e]
}
const m = function (e,t) {
  let value = '';
  let position = '';
  let ext = '';
  let i = e
  let a = eGameReadInt(i,t,1)
  let tag = (240 & a) >> 4
  let type = 15 & a
  let s_position = t + 1
  let result
  switch (type) {
    case 0: result = f0(i,s_position)
        value = result[0]
        position = result[1]
      break;
    case 1: result = f1(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 2: result = f2(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 3: result = f3(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 4: result = f4(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 5: result = f5(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 6: result = f6(i,s_position)
      value = result[0]
      position = result[1]
      ext = result[2]
      break;
    case 7: result = f7(i,s_position)
      value = result[0]
      position = result[1]
      ext = result[2]
      break;
    case 8: result = f8(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 9: result = f9(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 10: result = f10(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 11: result = f11(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 12: result = f12(i,s_position)
      value = result[0]
      position = result[1]
      break;
    case 13: result = f13(i,s_position)
      value = result[0]
      position = result[1]
      break;
  }
  i = ''
  return {
    'i': i,
    'tag': tag,
    'type': type,
    'value': value,
    'position': position,
    'ext': ext
  }
}
const f0 = function (e,t){
  let o = 1
  let n
  try {
    n = eGameReadInt(e,t,1)
  } catch (err) {
    n = ''
  }
  return [n, t + o]
}
const f1 = function (e,t){
  let o = 2
  let n
  try {
    n = eGameReadInt(e,t,2)
  } catch (err) {
    n = ''
  }
  return [n, t + o]
}
const f2 = function (e,t){
  let o = 4
  let n
  try {
    n = eGameReadInt(e,t,4)
  } catch (err) {
    n = ''
  }
  return [n, t + o]
}
const f3 = function (e,t){
  e = eGameReadInt(e,t,8)
  let position = t + 8
  return [e, position]
}
const f4 = function (e,t){
  let o = 4
  let n
  try {
    n = eGameReadInt(e,t,4)
  } catch (err) {
    n = ''
  }
  return  [n, t + o]
}
const f5 = function (e,t){
  let o = 8
  let n
  try {
    n = eGameReadInt(e,t,8)
  } catch (err) {
    n = ''
  }
  return [n, t + o]
}
const f6 = function (e,t){
  let n = eGameReadInt(e,t,1)
  let r = t + 1
  let s = r + n
  let value = textDecoder.decode(e.slice(r,s));
  return [value, s, r]
}
const f7 = function (e,t){
  let n = eGameReadInt(e,t,4)
  let r = t + 4
  let s = r + n
  let value = textDecoder.decode(e.slice(r,s));
  return [value, s, r]
}
const f8 = function (e,t){
  let i = {}
  let b = m(e,t)
  let o = b.value
  let r = b.position
  while(o > 0) {
    let a = m(e,r)
    let s = m(e,a.position)
    if (a.tag === 0 && s.tag === 1) {
      i[a.value] = s.value
    }
    r = s.position
    o = o - 1
  }
  return [i, r]
}
const f9 = function (e,t){
  let i = m(e,t)
  let n = i.value
  let o = i.position
  let r = []
  while(n > 0) {
    let a = m(e,o)
    r.push(JSON.parse(JSON.stringify(a)))
    o = a.position
    n = n - 1
  }
  return [r, o]
}
const f10 = function (e,t){
  let i = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let n = m(e,t)
    let t = n.position
    if (n.type === 11) {
      return [i, t]
    }
    i.push(JSON.parse(JSON.stringify(n.value)))
  }
}
const f11 = function (e,t){
  return ['', t]
}
const f12 = function (e,t){
  return [0, t]
}
const f13 = function (e,t){
  let i = m(e,t)
  return [e.slice(t+i.position,i.value), t+i.position+i.value]
}


//虎牙弹幕相关
const huyaSendPingReq = function () {
  let currTime = Date.now();
  let i = new HUYA.VideoGatewayProxy2VGPingReq();
  i.lLocalTime = .001 * currTime >> 0;
  return _send_wup('videogateway', 'videoGatewayProxy2VGPing', i);
}
const _bind_ws_info = function(yyuid) {
  let ws_user_info = new HUYA.WSUserInfo;
  ws_user_info.lUid = yyuid
  ws_user_info.bAnonymous = 0 == yyuid
  // ws_user_info.sGuid = this._main_user_id.sGuid
  ws_user_info.sToken = ""
  // ws_user_info.lTid = this._info.topsid
  // ws_user_info.lSid = this._info.subsid
  ws_user_info.lGroupId = yyuid
  ws_user_info.lGroupType = 3
  let jce_stream = new Taf.JceOutputStream()
  ws_user_info.writeTo(jce_stream)
  let ws_command = new HUYA.WebSocketCommand()
  ws_command.iCmdType = HUYA.EWebSocketCommandType.EWSCmd_RegisterReq
  ws_command.vData = jce_stream.getBinBuffer()
  jce_stream = new Taf.JceOutputStream()
  ws_command.writeTo(jce_stream)
  return jce_stream.getBuffer()
}

const _send_wup = function(action, callback, req) {
  try {
    let wup = new Taf.Wup()
    wup.setServant(action)
    wup.setFunc(callback)
    wup.writeStruct("tReq", req)
    let command = new HUYA.WebSocketCommand()
    command.iCmdType = HUYA.EWebSocketCommandType.EWSCmd_WupReq
    command.vData = wup.encode()
    let stream = new Taf.JceOutputStream()
    command.writeTo(stream)
    return  stream.getBuffer()
  } catch (err) {
    console.log("_send_wup异常" + err)
  }
}
const _on_mes = function(data) {
  try {
    let stream = new Taf.JceInputStream(data);
    let command = new HUYA.WebSocketCommand();
    command.readFrom(stream);
    switch (command.iCmdType) {
      case HUYA.EWebSocketCommandType.EWSCmdS2C_MsgPushReq:
        stream = new Taf.JceInputStream(command.vData.buffer);
        var msg = new HUYA.WSPushMessage();
        msg.readFrom(stream);
        stream = new Taf.JceInputStream(msg.sMsg.buffer);
        if (TafMx.UriMapping[msg.iUri]) {
          let map = new (TafMx.UriMapping[msg.iUri])();
          map.readFrom(stream);
          const msg_obj = {
            type: 'chat',
            time: new Date().getTime(),
            name: map.tUserInfo.sNickName,
            id: md5(JSON.stringify(map)),
            content: map.sContent
          }
          return msg_obj
        }
        break;
      default:
        break
    }
  } catch (e) {
    console.log("接收信息出错", e);
  }
}

const setPlatformList = function(platformList){
  this.platformList = platformList
}

const getPlatform = function(platForm){
  let name = "";
  this.platformList.forEach(platformInfo => {
    if (platformInfo.code === platForm) {
      name = platformInfo.name
      return
    }
  })
  return name
}

const getPlatformList = function(){
  return this.platformList
}


export default {
  encode,
  decode,
  douyuEncode,
  douyuDecode,
  byteToMsg,
  huyaSendPingReq,
  _on_mes,
  _bind_ws_info,
  eGameEncode,
  eGameDecode,
  eGameHeart,
  getPlatform,
  setPlatformList,
  getPlatformList,
  platformList
}
</script>