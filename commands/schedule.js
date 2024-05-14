const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextInputBuilder, TextInputStyle, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const scheduleDB = require('../models/schedule.js');
const raidMemberDB = require('../models/raidmember.js');
const moment = require("moment");
require('moment/locale/ko');


module.exports = {
  data: new SlashCommandBuilder()
    .setName("스케쥴")
    .setDescription("스케쥴 관리 명령어")
    .addSubcommand((subcommand) => 
      subcommand.setName("생성")
      .setDescription("스케쥴을 생성합니다.")
      .addStringOption(option =>
        option.setName('date')
          .setDescription('input date yyyy-mm-dd hh:mm')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('raid')
          .setDescription('레이드 종류')
          .setRequired(true)
          .addChoices(
            {name: '발탄', value: '발탄'},{name: '비아키스', value: '비아키스'},{name: '쿠크세이튼', value: '쿠크세이튼'},{name: '아브렐슈드', value: '아브렐슈드'},{name: '카양겔', value: '카양겔'},{name: '상아탑', value: '상아탑'},{name: '일리아칸', value: '일리아칸'},{name: '카멘', value: '카멘'},{name: '에키드나', value: '에키드나'},{name: '베히모스', value: '베히모스'}
          ))
      .addStringOption(option =>
        option.setName('mode')
          .setDescription('노말/하드/헬')
          .setRequired(true)
          .addChoices(
            {name: '노말', value: '노말'},{name: '하드', value: '하드'},{name: '헬', value: '헬'}
          ))
      .addStringOption(option =>
        option.setName('exp')
          .setDescription('숙련도')
          .setRequired(true)
          .addChoices(
            {name: '트라이', value: '트라이'},{name: '클경', value: '클경'},{name: '반숙', value: '반숙'},{name: '숙련', value: '숙련'}
          ))
      
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
    .addSubcommand((subcommand) => 
      subcommand.setName("조회")
      .setDescription("스케쥴을 조회합니다.")
    )
    .addSubcommand((subcommand) => 
    subcommand.setName("참가")
    .setDescription("레이드에 참여 신청 합니다.")
    )
    .addSubcommand((subcommand) => 
      subcommand.setName("신청조회")
      .setDescription("생성된 레이드의 참가자 신청내역을 조회합니다.")
    )
    .addSubcommand((subcommand) => 
      subcommand.setName("삭제")
      .setDescription("생성한 레이드를 삭제 합니다.")
    )
    ,
  run: async ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();
    if(subcommand === "생성"){      
      const date = interaction.options.getString('date') ?? '';      
      const raid = interaction.options.getString('raid') ?? '';
      const mode = interaction.options.getString('mode') ?? '';
      const exp = interaction.options.getString('exp') ?? '';

      try {
        var momentDate = moment(date, 'YYYY-MM-DD HH:mm', true);
        console.log(momentDate.isValid());
        console.log(`No interactions were collected. ${date}, ${raid}, ${mode}, ${exp}`);
        console.log(interaction.user);
        await interaction.deferReply();
        if(momentDate.isValid()){          
          const newSchedule = new scheduleDB({
            creater: interaction.user.id,
            creater_name: interaction.member.nickname ?? interaction.user.globalName,
            type: exp,
            start_date: date,
            raid_object: raid,
            raid_mode: mode
          });
          await newSchedule.save();
  
          // {ephemeral: true}

          await interaction.editReply({content: `${interaction.member.nickname ?? interaction.user.globalName}님이 레이드 스케쥴을 생성 하였습니다\n${momentDate.format('YYYY년MM월DD일 HH시mm분(dddd)')}/${raid}/${mode}/${exp}`, components: []}); 
        }else{
          interaction.editReply({content: `날짜 입력 오류`, components: [], ephemeral: true}); 
        }
        
      }
      catch (exception) {
        console.log(exception);
        interaction.editReply({content: `날짜 입력 오류`, components: [], ephemeral: true}); 
      }
      

      // console.log(interaction.member);
      // console.log(interaction.options);

      // var isValidateDate = validateDate(date, responseType="boolean", dateFormat="yyyy-mm-dd hh:mm");
      // console.log(isValidateDate);

      
    }else if(subcommand === "조회"){
      await interaction.deferReply({ephemeral: true});
      console.log(moment().format('YYYY-MM-DD HH:mm'));

      var schedules = await scheduleDB.find({
        start_date : {
          $gt : moment().format('YYYY-MM-DD HH:mm')
        }
      });

      

      if(schedules.length === 0){
        interaction.editReply({content: `레이드 스케쥴이 없습니다.`, components: [], ephemeral: true}); 
      }else{
        const embed = new EmbedBuilder().setTitle(`레이드 스케쥴 조회`);

        for(var schedule of schedules){  
          var startdate = moment(schedule.start_date, 'YYYY-MM-DD HH:mm', true);
          embed.addFields(
            {
              name: `${schedule.creater_name}님이 생성한 레이드`,
              value: `${schedule.raid_object}(${schedule.raid_mode}) ${schedule.type}\n날짜: ${startdate.format('YYYY년MM월DD일 HH시mm분(dddd)')}`,            
            },            
            // {
            //   name: "================================================================",
            //   value: ``,              
            // },
            {
              name: "\u200B",
              value: '\u200B',
            }
          );
        }
  
        interaction.editReply({content: `레이드 스케쥴 조회를 완료 하였습니다.`, embeds: [embed], components: [], ephemeral: true}); 
      }

      
    }else if(subcommand === "참가"){
      await interaction.deferReply({ephemeral: true});

      var schedules = await scheduleDB.find({
        start_date : {
          $gt : moment().format('YYYY-MM-DD HH:mm')
        }
      });

      if(schedules.length === 0){
        interaction.editReply({content: `레이드 스케쥴이 없습니다.`, components: [], ephemeral: true}); 
      }else{
        const selectorType = new StringSelectMenuBuilder()
        .setCustomId('raidId')
        .setPlaceholder('참가 신청할 레이드를 선택해 주세요');

        var schedules = await scheduleDB.find({
          start_date : {
            $gt : moment().format('YYYY-MM-DD HH:mm')
          }
        });

        for(var schedule of schedules){  
          var startdate = moment(schedule.start_date, 'YYYY-MM-DD HH:mm', true);
          selectorType.addOptions(
            new StringSelectMenuOptionBuilder()
            .setLabel(`${schedule.raid_object}(${schedule.raid_mode}) ${schedule.type}\n날짜: ${startdate.format('YYYY년MM월DD일 HH시mm분(dddd)')}`)
            .setDescription(`${schedule.creater_name}님이 생성한 레이드`)
            .setValue(`${schedule._id}`)
          );        
        }

        const row = new ActionRowBuilder().addComponents(selectorType);
        const response = await interaction.editReply({content: "레이드 스케쥴", components: [row], ephemeral: true}); 

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

        collector.on('collect', async i => {
          const selection = i.values[0];

          const newRaidMember = new raidMemberDB({
            raid_id: selection,
            member_id: interaction.user.id,
            member_name: interaction.member.nickname ?? interaction.user.globalName
          });
          await newRaidMember.save();

          var raid = await scheduleDB.findOne({
            _id : selection
          });

          console.log(raid);

          var ownerUser;

          await i.guild.members.fetch().then(members =>{              
              ownerUser = members.find(user => user.id === raid.creater);
              console.log(ownerUser);
            }
          )
          
          await i.update({content: `${raid.creater_name} 님이 생성한 레이드에 참가 신청 하였습니다.`, components: [], ephemeral: true});
          await i.followUp({content: `${ownerUser} ${i.user}님이 레이드 참가 신청 하였습니다.`});
          
        });
        
      }			
    }
    else if(subcommand === "신청조회"){
      await interaction.deferReply({ephemeral: true});

      var schedules = await scheduleDB.find({
        start_date : {
          $gt : moment().format('YYYY-MM-DD HH:mm')
        }
      });

      if(schedules.length === 0){
        interaction.editReply({content: `레이드 스케쥴이 없습니다.`, components: [], ephemeral: true}); 
      }else{
        const selectorType = new StringSelectMenuBuilder()
        .setCustomId('raidId')
        .setPlaceholder('신청자를 조회할 레이드를 선택해 주세요');

        var schedules = await scheduleDB.find({
          start_date : {
            $gt : moment().format('YYYY-MM-DD HH:mm')
          }
        });

        for(var schedule of schedules){  
          var startdate = moment(schedule.start_date, 'YYYY-MM-DD HH:mm', true);
          selectorType.addOptions(
            new StringSelectMenuOptionBuilder()
            .setLabel(`${schedule.raid_object}(${schedule.raid_mode}) ${schedule.type}\n날짜: ${startdate.format('YYYY년MM월DD일 HH시mm분(dddd)')}`)
            .setDescription(`${schedule.creater_name}님이 생성한 레이드`)
            .setValue(`${schedule._id}`)
          );        
        }

        const row = new ActionRowBuilder().addComponents(selectorType);
        const response = await interaction.editReply({content: "레이드 스케쥴", components: [row], ephemeral: true}); 

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

        collector.on('collect', async i => {
          const selection = i.values[0];

          var raidmembers = await raidMemberDB.find({
            raid_id : selection
          });

          console.log(raidmembers);

          const embed = new EmbedBuilder().setTitle(`레이드 신청자 조회`);
          
          var applyer = '';
          for(var member of raidmembers){  
            applyer += member.member_name + ' ';
          }

          embed.addFields(
            {
              name: `신청자 리스트`,
              value: `${applyer}`,
            }
          );          
          await i.update({content: `${schedule.creater_name} 님이 생성한 레이드 신청자 목록 입니다.`, embeds: [embed], components: [], ephemeral: true});          
        });
        
      }
    }
    else if(subcommand === "삭제"){
      await interaction.deferReply({ephemeral: true});

      var schedules = await scheduleDB.find({
        start_date : {
          $gt : moment().format('YYYY-MM-DD HH:mm')
        },
        creater : interaction.user.id
      });

      if(schedules.length === 0){
        interaction.editReply({content: `레이드 스케쥴이 없습니다.`, components: [], ephemeral: true}); 
      }else{
        const selectorType = new StringSelectMenuBuilder()
        .setCustomId('raidId')
        .setPlaceholder('삭제할 레이드를 선택해 주세요');

        for(var schedule of schedules){  
          var startdate = moment(schedule.start_date, 'YYYY-MM-DD HH:mm', true);
          selectorType.addOptions(
            new StringSelectMenuOptionBuilder()
            .setLabel(`${schedule.raid_object}(${schedule.raid_mode}) ${schedule.type}\n날짜: ${startdate.format('YYYY년MM월DD일 HH시mm분(dddd)')}`)
            .setDescription(`${schedule.creater_name}님이 생성한 레이드`)
            .setValue(`${schedule._id}`)
          );        
        }

        const row = new ActionRowBuilder().addComponents(selectorType);
        const response = await interaction.editReply({content: "레이드 스케쥴", components: [row], ephemeral: true}); 

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

        collector.on('collect', async i => {
          const selection = i.values[0];

          await scheduleDB.deleteOne({
              _id : selection
            }
          );
          await i.update({content: `${schedule.creater_name} 님이 생성한 레이드를 삭제하였습니다.`, components: [], ephemeral: true});          
        });
        
      }
    }
  },
};


let makeScheduleType = async (interaction) => {  
  const selectorType = new StringSelectMenuBuilder()
			.setCustomId('starter')
			.setPlaceholder('숙련도를 선택해 주세요')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('트라이')
					.setDescription('지옥의 시작')
					.setValue('트라이'),
				new StringSelectMenuOptionBuilder()
					.setLabel('클경')
					.setDescription('아직도 지옥일거야')
					.setValue('클경'),
				new StringSelectMenuOptionBuilder()
					.setLabel('반숙')
					.setDescription('애매하쥬?')
					.setValue('반숙'),
        new StringSelectMenuOptionBuilder()
					.setLabel('숙련')
					.setDescription('과연?')
					.setValue('숙련'),
			);


  // const confirm = new ButtonBuilder()
  // .setCustomId('confirm')
  // .setLabel('확인')
  // .setStyle(ButtonStyle.Danger);

  // const cancel = new ButtonBuilder()
  //   .setCustomId('cancel')
  //   .setLabel('취소')
  //   .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder()
    .addComponents(selectorType);

  // const buttonRow = new ActionRowBuilder()
  // .addComponents(confirm, cancel);

  const response = await interaction.reply({content: "레이드 스케쥴 생성 준비", components: [row], ephemeral: true}); 

  console.log("================================================");

  var selectedType = '';
  var selectedDate = '';
  var selectedYear = '';
  var selectedMonth = '';
  var selectedDay = '';
  var selectedRaid = '';
  var owner = '';
    
  // const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000  });

  const collectorFilter = i => {
    console.log('collectorfilter');
      interaction.editReply({content: 'test', components: [], ephemeral: true});
      const selectorRaid = new StringSelectMenuBuilder()
        .setCustomId('raid')
        .setPlaceholder('레이드 종류를 선택해 주세요')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('발탄')
            .setDescription('발탄')
            .setValue('voltan'),
          new StringSelectMenuOptionBuilder()
            .setLabel('비아키스')
            .setDescription('비아키스')
            .setValue('vyakiss'),
          new StringSelectMenuOptionBuilder()
            .setLabel('쿠크세이튼')
            .setDescription('쿠크세이튼')
            .setValue('coucosaiten'),
          new StringSelectMenuOptionBuilder()
            .setLabel('아브렐슈드')
            .setDescription('아브렐슈드')
            .setValue('abrelshoud'),
        );
    const raidRow = new ActionRowBuilder()
      .addComponents(selectorRaid);
  
    i.reply({content: "레이드 스케쥴 생성 준비", components: [raidRow], ephemeral: true}); 
    
    
    return i.user.id === interaction.user.id;
  };
  
  response.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.StringSelect, time: 60_000 })
	.then(i => {
    console.log('test');
      // j.editReply(`You selected ${j.values[0]}!`);
    }
  )
	.catch(err => 
    console.log(`No interactions were collected. ${err}`)
  );


  // collector.on('collect', async i => {
  //   selectedType = i.values[0];
  //   owner = i.user;
  //   console.log(i.customId);
  //   console.log(selectedType);

  //   if(i.customId === 'starter'){
  //     await interaction.editReply({content: `${selectedType} selected`, components: [], ephemeral: true})
  //     const selectorRaid = new StringSelectMenuBuilder()
  //       .setCustomId('raid')
  //       .setPlaceholder('레이드 종류를 선택해 주세요')
  //       .addOptions(
  //         new StringSelectMenuOptionBuilder()
  //           .setLabel('발탄')
  //           .setDescription('발탄')
  //           .setValue('voltan'),
  //         new StringSelectMenuOptionBuilder()
  //           .setLabel('비아키스')
  //           .setDescription('비아키스')
  //           .setValue('vyakiss'),
  //         new StringSelectMenuOptionBuilder()
  //           .setLabel('쿠크세이튼')
  //           .setDescription('쿠크세이튼')
  //           .setValue('coucosaiten'),
  //         new StringSelectMenuOptionBuilder()
  //           .setLabel('아브렐슈드')
  //           .setDescription('아브렐슈드')
  //           .setValue('abrelshoud'),
  //       );
  //   const raidRow = new ActionRowBuilder()
  //     .addComponents(selectorRaid);
  
  //   // const buttonRow = new ActionRowBuilder()
  //   // .addComponents(confirm, cancel);
  
  //     await i.reply({content: "레이드 스케쥴 생성 준비", components: [raidRow], ephemeral: true}); 
  //     // await makeScheduleRaid(i);      
  //   }else if(i.customId === 'raid'){
  //     await i.reply({content: `레이드 생성 요청 완료`, components: [], ephemeral: true})
  //   }
  // });
    
  // const collectorFilter = i => i.user.id === interaction.user.id;
  // try {
  //   const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
  
  //   // if (confirmation.customId === 'confirm') {
  //   //   await confirmation.update({ content: 'Action confirmed', components: [] });
  //   // } else if (confirmation.customId === 'cancel') {
  //   //   await confirmation.update({ content: 'Action cancelled', components: [] });
  //   // }

  //   // const wantedTanks = interaction.fields.getSelectMenuValue('wanted_tanks');
  // } catch (e) {
  //   await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
  // }
  
  let makeScheduleRaid = async (interaction2) => {  
    
  
    // console.log("================================================");
  
    var selectedType = '';
    // var selectedDate = '';
    // var selectedYear = '';
    // var selectedMonth = '';
    // var selectedDay = '';
    // var selectedRaid = '';
    // var owner = '';
      
    const collector2 = await response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000  });
  
    collector2.on('collect', async i => {
      selectedType = i.values[0];
      owner = i.user;
      console.log('123123');
      console.log(selectedType);
      
      if(i.customId === 'raid'){
        await interaction2.editReply({content: '레이드 생성 요청 완료', components: [], ephemeral: true});
      }
      // selectorType.setValue(selectedType);
    });
  }
      
    // const collectorFilter = i => i.user.id === interaction.user.id;
    // try {
    //   const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
    
    //   if (confirmation.customId === 'confirm') {
    //     await confirmation.update({ content: 'Action confirmed', components: [] });
    //   } else if (confirmation.customId === 'cancel') {
    //     await confirmation.update({ content: 'Action cancelled', components: [] });
    //   }
  
    //   // const wantedTanks = interaction.fields.getSelectMenuValue('wanted_tanks');
    // } catch (e) {
    //   await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
    // }

};