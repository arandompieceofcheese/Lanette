import { ICommandDefinition } from "./command-parser";
import fetch from 'node-fetch';

const commands: Dict<ICommandDefinition> = {
	eval: {
		command(target, room, user) {
			if (!user.isDeveloper()) return;
			try {
				// tslint:disable-next-line no-eval
				const result = eval(target);
				this.say(result);
			} catch (e) {
				this.say(e.message);
			}
		},
		aliases: ['js'],
	},

	reload: {
		command(target, room, user) {
			if (!user.isDeveloper()) return;
			try{
				delete require.cache[require.resolve('./commands')];
				global.Commands = Object.assign(Object.create(null), CommandParser.loadCommands(require('./commands')));
				this.say("Reloaded (" + Date.now() + ")");
			}catch(e){
				this.say(e.message);
			}
		}
	},

	say: {
		command(target, room, user) {
			this.say(target);
		},
		helpText: "Echos back the argument"
	},

	help: {
		command(target, room, user){
			let text = [];
			for(let command in Commands) if(Commands[command].helpText) text.push(Config.commandCharacter + command + ': ' + Commands[command].helpText);
			room.say('!htmlbox ' + text.join('<br />'));
		},
		helpText: 'Displays this message'
	},

	message: {
		command(target, room, user){
			if (!user.isDeveloper()) return;
			let r: string = target.slice(0, target.indexOf(',')).trim();
			let c: string = target.slice(target.indexOf(',') + 1).replace(/^\s+/, '');
			Client.send(r + '|' + c);
		}
	},

	test: {
		command(target, room, user){
			if (!user.isDeveloper()) return;
		}
	}
};

export = commands;
