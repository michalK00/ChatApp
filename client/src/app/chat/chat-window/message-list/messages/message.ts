export type ChatMessageType =
  | "CHAT"
  | "CONNECT"
  | "DISCONNECT"
  | "CHANGE_NICKNAME"
  | "TYPING"
  | "CALL"
  | "CALL_REQUEST"
  | "NEW_ROOM_INVITATION"
  | "NEW_MESSAGE_IN_ROOM";

export interface ChatMessage {
  type: ChatMessageType;
  from: string;
  message: string;
  timestamp: Date;
  roomId: number;
}
export interface ChatMessageDTO {
  type: string;
  from: string;
  message: string;
  timestamp: string;
  roomId: string;
}

export interface CallRequest {
  from: string;
  message: string;
  expired: boolean;
}

export function mapChatMessageDTOToCallRequest(chatMessageDTO: ChatMessageDTO): CallRequest {
  return {
    from: chatMessageDTO.from,
    message: chatMessageDTO.message,
    expired: false,
  };
}

export function mapChatMessageToDTO(chatMessage: ChatMessage): ChatMessageDTO {
  return {
    type: chatMessage.type,
    from: chatMessage.from,
    message: chatMessage.message,
    timestamp: chatMessage.timestamp.toISOString(),
    roomId: chatMessage.roomId.toString(),
  };
}

export function mapChatMessageFromDTO(chatMessageDTO: ChatMessageDTO): ChatMessage {
  return {
    type: chatMessageDTO.type as ChatMessageType,
    from: chatMessageDTO.from,
    message: chatMessageDTO.message,
    timestamp: new Date(chatMessageDTO.timestamp),
    roomId: parseInt(chatMessageDTO.roomId, 10),
  };
}
