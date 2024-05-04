const { Schema, model } = require("mongoose");

const raidMemberSchema = new Schema({
  raid_id: { //생성자
    type: String,
    required: true,    
  },
  member_id: { //생성자
    type: String,
    required: true,    
  },
  member_name: { //트라이/클경/반숙/숙련
    type: String,
    required: true,
  }
//   subChar: [], //부캐 목록
//   guildContents: [], //길드컨텐츠 참여내역
//   warned: { //연속 길드컨텐츠 미참여 횟수
    // type: Number,
    // default: 0,
//   },
});

module.exports = model("raidMemberDB", raidMemberSchema);
