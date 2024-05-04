const { Schema, model } = require("mongoose");

const raidSchema = new Schema({
  creater: { //생성자
    type: String,
    required: true,    
  },
  creater_name: {
    type: String,
    required: true,    
  },
  type: { //트라이/클경/반숙/숙련
    type: String,
    required: true,
  },
  start_date: { //시작날짜
    type: String,
    required: true,
  },
  raid_object: { // 레이드 종류
    type: String,
    require: true
  },
  raid_mode: { // 레이드 노말/하드/헬
    type: String,
    require: true
  }
//   subChar: [], //부캐 목록
//   guildContents: [], //길드컨텐츠 참여내역
//   warned: { //연속 길드컨텐츠 미참여 횟수
    // type: Number,
    // default: 0,
//   },
});

module.exports = model("raidDB", raidSchema);
