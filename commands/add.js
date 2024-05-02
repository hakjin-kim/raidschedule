const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
      .setName("add")
      .setDescription("두 수를 더한 결과를 출력합니다.")
      .addIntegerOption((option) => //option의 type이 integer(정수)
        option
          .setName("target-number-1") //option의 이름
          .setDescription("첫 번째 숫자") //option의 설명
          .setRequired(true) //필수로 입력되어야 하는지 여부
      )
      .addIntegerOption((option) =>
        option
          .setName("target-number-2")
          .setDescription("두 번째 숫자")
          .setRequired(true)
      ),
    run: ({ interaction }) => {
      const num1 = interaction.options.get("target-number-1").value; //각각의 option의 값(value)를 불러온다
      const num2 = interaction.options.get("target-number-2").value;
      interaction.reply(`${num1 + num2}`);
    },
  };
  