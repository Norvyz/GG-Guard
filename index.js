// 📦 Importaciones necesarias
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config(); // Cargar variables de entorno

// 🛡️ Módulo de respaldo automático
const { makeBackup } = require('./utils/backup');

// 🤖 Crear cliente de Discord con intents necesarios
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🧠 Colección de comandos
client.commands = new Collection();

// 📂 Cargar todos los comandos desde la carpeta /commands
const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// 🎉 Cuando el bot esté listo
client.once('ready', () => {
  console.log(`✅ ${client.user.tag} está en línea y listo para proteger GG Zone.`);

  // ▶️ Hacer respaldo inicial
  makeBackup();

  // ⏰ Programar respaldo automático cada hora (60min)
  setInterval(makeBackup, 1000 * 60 * 60);
});

// ⚡ Manejo de comandos slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ Hubo un error al ejecutar este comando.',
      ephemeral: true
    });
  }
});

// 🔐 Iniciar sesión con el token de entorno
client.login(process.env.TOKEN);
