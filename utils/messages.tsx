import { defineExtensionMessaging } from '@webext-core/messaging';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ProtocolMap {
  // Placeholder - 扩展消息协议
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
