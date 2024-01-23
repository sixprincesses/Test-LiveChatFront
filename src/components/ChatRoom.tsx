import React, { useState } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client, Frame, Message, over } from "stompjs";

interface inputs {
  id?: string;
  name?: string;
  newChannel?: number;
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
  id: number;
  name: string;
  reference?: string;
  accessType?: string;
  channelType?: string;
}

interface tab {
  id?: number | null;
  name?: string | null;
}

interface chat {
  id?: string;
  senderId?: string;
  receiverId?: string;
  channelId?: string;
  content?: string;
  reference?: string;
  messageType?: string;
  createdTime?: string;
}

interface payload1 {
  channels: channel[];
  status: string;
}

interface payload2 {
  chats?: chat[];
  chat?: chat;
  status: string;
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
  const [tab, setTab] = useState<tab | null>();
  const [chats, setChats] = useState<chat[]>([]);

  // 모니터링
  // useEffect(() => {
  //   console.log(inputs, user, channels, chats, tab);
  // }, [inputs, user, channels, chats, tab]);

  // 이벤트 핸들러
  const handleInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let value;
    if (name === "name" || name === "message") {
      value = e.target.value;
    } else {
      value = parseInt(e.target.value);
    }
    setInputs({
      ...inputs,
      [name]: value,
    });
  };
  const handleUserName = () => {
    setUser({
      ...user,
      id: inputs?.id,
      name: inputs?.name,
    });
  };
  const handleChannel = (e: React.MouseEvent<HTMLElement>) => {
    const { id, name } = e.target.dataset;
    console.log(id, name);
    stompClient?.unsubscribe("/user/" + tab?.id + "/channel");
    stompClient?.unsubscribe("/server/chat/" + tab?.id);
    stompClient?.subscribe("/user/" + id + "/channel", onMessageReceived);
    stompClient?.subscribe("/server/chat/" + id, onMessageReceived);
    setTab({ id, name });
  };

  // 소켓 로직
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
  const subscribeNewChannel = () => {
    if (stompClient) {
      const chatMessage = {
        senderId: user?.id,
        receiverId: inputs?.newChannel,
        status: "CHANNEL_IN",
      };
      stompClient.send("/server/update", {}, JSON.stringify(chatMessage));
    }
  };
  const onMessageReceived = (payload: Message) => {
    const payloadData: payload2 = JSON.parse(payload.body);
    console.log(payloadData);
    switch (payloadData.status) {
      case "CHANNEL_IN":
        if (payloadData.chats) {
          setChats(payloadData.chats);
        }
        break;
      case "MESSAGE_TXT":
        if (payloadData.chat) {
          setChats((prev) =>
            payloadData.chat ? [...prev, payloadData.chat] : [...prev]
          );
        }
        break;
    }
  };

  const onChannelReceived = (payload: Message) => {
    const payloadData: payload1 = JSON.parse(payload.body);
    setChannels(payloadData.channels);
  };
  const onConnected = () => {
    setUser({ ...user, connected: true });
    stompClient?.subscribe("/server/channel/" + user.id, onChannelReceived);
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
                  onClick={handleChannel}
                  data-id={channel.id}
                  data-name={channel.name}
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
                className={`message ${chat.senderId === user.id && "self"}`}
                key={index}
              >
                {chat.senderId !== user.id && (
                  <div className="avatar">{chat.senderId}</div>
                )}
                <div className="message-data">{chat.content}</div>
                {chat.senderId === user.id && (
                  <div className="avatar self">{chat.senderId}</div>
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
