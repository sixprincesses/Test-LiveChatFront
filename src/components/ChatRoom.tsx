import React, { useState } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client, Frame, Message, over } from "stompjs";

interface inputs {
  id?: string;
  name?: string;
  newChannel?: string;
  message?: string;
}

interface user {
  id?: number;
  name?: string;
  message?: string;
  loggedin: boolean;
  connected: boolean;
}

interface channel {
  id: string;
  name: string;
  reference?: string;
  accessType?: string;
  channelType?: string;
  updatedTime?: string;
}

interface chat {
  content: string;
  channel: channel;
  memberId: number;
  nickname: string;
  messageType: string;
  createdTime: string;
}

interface payload1 {
  headers: object;
  body: channel[];
  statusCode: string;
  statusCodeValue: number;
}

interface payload2 {
  headers: object;
  body: chat[];
  statusCode: string;
  statusCodeValue: number;
}

let stompClient: Client | null = null;
const ChatRoom = () => {
  // 상수
  const [inputs, setInputs] = useState<inputs>({ id: "", name: "" });
  const [user, setUser] = useState<user>({
    loggedin: false,
    connected: false,
  });
  const [channels, setChannels] = useState<channel[]>([]);
  const [tab, setTab] = useState<channel | null>();
  const [chats, setChats] = useState<chat[]>([]);

  // 모니터링
  // useEffect(() => {
  //   console.log(inputs, user, channels, chats, tab);
  // }, [inputs, user, channels, chats, tab]);

  // 이벤트 핸들러
  const handleInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };
  const handleUserName = () => {
    setUser({
      ...user,
      id: parseInt(typeof inputs.id === "string" ? inputs.id : ""),
      name: inputs?.name,
    });
  };

  // 소켓 로직
  // 메세지 송신 로직
  const sendMessage = () => {
    if (stompClient) {
      const chatMessage = {
        senderId: user?.id,
        channelId: tab?.id,
        message: inputs?.message,
        createdTime: new Date(),
        status: "MESSAGE_TXT",
      };
      stompClient.send("/server/messageTxt", {}, JSON.stringify(chatMessage));
      console.log("send", chatMessage, "to", "/server/messageTxt");
    }
  };
  // 채널 생성, 구독 로직
  const subscribeNewChannel = () => {
    if (stompClient) {
      const chatMessage = {
        senderId: user.id,
        receiverId: inputs.newChannel,
      };
      stompClient.send(
        "/server/channel/create/simple",
        {},
        JSON.stringify(chatMessage)
      );
    }
  };
  // 채널 선택 로직
  const onMessageReceived = (payload: Message) => {
    const payloadData: payload2 = JSON.parse(payload.body);
    setChats(payloadData.body);
  };
  const handleTab = (channel: channel) => {
    setTab(tab?.id === channel.id ? null : channel);
  };
  const selectChannel = (e: React.MouseEvent<HTMLElement>) => {
    const { channel } = JSON.parse(e.target.dataset.channel);
    if (tab?.reference) {
      stompClient?.unsubscribe("/server/channel/" + tab?.reference);
    }
    stompClient?.subscribe(
      "/server/channel/" + channel.reference,
      onMessageReceived
    );
    // 채팅 송신 채널 구독/구취 로직
    handleTab(channel);
  };
  // 채널 받아오는 서버를 구독
  const onChannelReceived = (payload: Message) => {
    const payloadData: payload1 = JSON.parse(payload.body);
    setChannels(payloadData.body);
  };
  const onConnected = () => {
    setUser({ ...user, connected: true });
    stompClient?.subscribe(
      "/server/channel/notification/" + user.id,
      onChannelReceived
    );
  };
  const onError = (err: Frame | string) => {
    console.log(err);
    setUser({
      ...user,
      connected: false,
    });
  };
  const connect = () => {
    const Sock = new SockJS("http://70.12.114.70:8080/websocketserver");
    // const Sock = new SockJS("http://localhost:8080/websocketserver");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };
  const login = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    connect();
  };

  return (
    <div className="container">
      <form className="login input-box" onSubmit={login}>
        <input
          id="user-name"
          name="name"
          placeholder="이름을 입력하세요."
          onChange={handleInputs}
          value={inputs?.name}
          disabled={user.loggedin}
        />
        <input
          id="user-id"
          name="id"
          placeholder="ID를 입력하세요."
          onChange={handleInputs}
          value={inputs?.id}
          disabled={user.loggedin}
        />
        <button type="button" onClick={handleUserName} disabled={user.loggedin}>
          저장
        </button>
        <button disabled={!user.loggedin && user.connected}>로그인</button>
      </form>
      {user.name ? (
        user.connected ? (
          <div className="channel-list">
            <div className="new-channel">
              <input
                id="new-channel"
                name="newChannel"
                placeholder="채널 ID를 입력하세요."
                onChange={handleInputs}
                value={inputs?.newChannel}
              />
              <button type="button" onClick={subscribeNewChannel}>
                저장
              </button>
            </div>
            <ul>
              {channels?.map((channel, index) => (
                <li
                  onClick={selectChannel}
                  data-channel={JSON.stringify(channel)}
                  className={`channel ${
                    tab?.name === channel.name && "active"
                  }`}
                  key={index}
                >
                  {channel.name}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="unselected">로딩중...</div>
        )
      ) : (
        <div className="unselected">로그인 해주세요.</div>
      )}
      {tab ? (
        <div className="chat-content">
          <ul className="chat-messages">
            {chats.map((chat, index) => (
              <li
                className={`message ${chat.memberId === user.id && "self"}`}
                key={index}
              >
                {chat.memberId !== user.id && (
                  <div className="avatar">{chat.nickname}</div>
                )}
                <div className="message-data">{chat.content}</div>
                {chat.memberId === user.id && (
                  <div className="avatar self">{chat.nickname}</div>
                )}
              </li>
            ))}
          </ul>
          <div className="send-message input-box">
            <input
              type="text"
              className="input-message"
              placeholder="메세지를 입력하세요."
              name="message"
              value={inputs?.message}
              onChange={handleInputs}
            />
            <button type="button" className="send-button" onClick={sendMessage}>
              보내기
            </button>
          </div>
        </div>
      ) : (
        <div className="unselected">채팅방을 선택해 주세요.</div>
      )}
    </div>
  );
};

export default ChatRoom;
