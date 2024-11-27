export interface Room {
  roomId: number;
  roomName: string;
}

export interface LastMessage {
  author: string;
  content: string;
  timestamp: string;
}

export interface RoomWithLastMessage {
  roomId: number;
  roomName: string;
  lastMessage?: LastMessage;
}
