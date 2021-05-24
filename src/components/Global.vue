<script>
const textEncoder = new TextEncoder('utf-8');
const textDecoder = new TextDecoder('utf-8');
const pako = require('pako')

//bilibili弹幕编码
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

//斗鱼弹幕编码
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

export default {
  encode,
  decode,
  douyuEncode,
  douyuDecode,
}
</script>