const { PermissionsBitField } = require("discord.js");

module.exports = (interaction, commandObj, handler, client) => {
    console.log(interaction.member.permissions);
  if (commandObj.managerOnly) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      interaction.reply({
        content: "이 명령어를 사용할 권한이 없어요.",
        ephemeral: true,
      });
      return true;
    }
  }
};
