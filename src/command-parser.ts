import { Room } from "./rooms";
import { User } from "./users";

export interface ICommandDefinition<T = undefined> {
	command: (this: T extends undefined ? Command : T, target: string, room: Room | User, user: User, alias: string) => void;
	aliases?: string[];
	chatOnly?: boolean;
	pmGameCommand?: boolean;
	pmOnly?: boolean;
	helpText?: string;
}

export type CommandsDict<T = undefined> = Dict<Pick<ICommandDefinition<T>, Exclude<keyof ICommandDefinition<T>, "aliases">>>;

export class Command {
	originalCommand: string;
	pm: boolean;
	room: Room | User;
	target: string;
	user: User;

	constructor(originalCommand: string, target: string, room: Room | User, user: User) {
		this.originalCommand = originalCommand;
		this.target = target;
		this.room = room;
		this.user = user;

		this.pm = room === user;
	}

	say(message: string) {
		this.room.say(message);
	}

	run(newCommand?: string, newTarget?: string) {
		let command = this.originalCommand;
		if (newCommand) {
			command = Tools.toId(newCommand);
			if (!(command in Commands)) throw new Error(this.originalCommand + " ran non-existent command '" + newCommand + '"');
		}
		if (this.pm) {
			if (Commands[command].chatOnly) return;
		} else {
			if (Commands[command].pmOnly) return;
		}
		const target = newTarget || this.target;
		try{ 
			Commands[command].command.call(this, target, this.room, this.user, command);
		}catch(e){
			if(Users.users.arpocheese) Users.users.arpocheese.say(e);
		}
	}
}

export class CommandParser {
	loadCommands<T = undefined>(commands: Dict<ICommandDefinition<T>>): CommandsDict<T> {
		const dict: CommandsDict<T> = {};
		for (const i in commands) {
			const command = commands[i];
			if (command.chatOnly && command.pmOnly) throw new Error(i + " cannot be both a chat-only and a pm-only command");
			if (command.aliases) {
				const aliases = command.aliases.slice();
				delete command.aliases;
				for (let i = 0; i < aliases.length; i++) {
					dict[Tools.toId(aliases[i])] = command;
				}
			}
			dict[Tools.toId(i)] = command;
		}

		return dict;
	}

	parse(room: Room | User, user: User, message: string) {
		if (message.charAt(0) !== Config.commandCharacter) return;
		message = message.substr(1);
		let command: string;
		let target: string;
		const spaceIndex = message.indexOf(' ');
		if (spaceIndex === -1) {
			command = message;
			target = '';
		} else {
			command = message.substr(0, spaceIndex);
			target = message.substr(spaceIndex + 1).trim();
		}
		command = Tools.toId(command);
		if (!(command in Commands)) return;

		(new Command(command, target, room, user)).run();
	}
}
