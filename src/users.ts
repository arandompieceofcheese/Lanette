import { Room } from "./rooms";

export class User {
	/** Map<Room, rank> */
	rooms = new Map<Room, string>();

	id: string;
	name: string;

	constructor(name: string, id: string) {
		this.name = name;
		this.id = id;
	}

	hasRank(room: Room, targetRank: string): boolean {
		if (!this.rooms.has(room) || !(targetRank in Client.serverGroups)) return false;
		return Client.serverGroups[this.rooms.get(room)!].ranking >= Client.serverGroups[targetRank].ranking;
	}
}

export class Users {
	users = {} as Dict<User>;

	self: User;

	constructor() {
		this.self = this.add(Config.username);
	}

	add(name: string): User {
		const id = Tools.toId(name);
		if (!(id in this.users)) this.users[id] = new User(name, id);
		return this.users[id];
	}
}