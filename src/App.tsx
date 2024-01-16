import { Client } from "@stomp/stompjs";
import React, { useState } from "react";

interface body {
  nickname: string;
  msg: string;
}

interface chatRoom {
  name: string;
  url: string;
}

function App() {
  const [id, setId] = useState("ktg");
  const [pw, setPw] = useState("1234");
  const [nickname, setNickname] = useState("ktg");

  const [chatRooms, setChatRooms] = useState<chatRoom[]>([
    { name: "기본 채팅방", url: "/sub/chat/enter" },
  ]);

  const [sub, setSub] = useState("");
  const [msg, setMsg] = useState("Hi");
  const [logs, setLogs] = useState<body[]>([{ nickname: "ktg", msg: "hi" }]);

  const client = new Client({
    brokerURL: "ws://70.12.114.70:8080/websocketserver",
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  // 이벤트 핸들러
  const handleId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setId(value);
  };
  const handlePw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPw(value);
  };
  const handleLogin = () => {
    setNickname(id);
    client.activate();
  };

  const handleMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMsg(value);
  };

  const handlePublish = () => {
    if (client.connected) {
      const body = { nickname: nickname, msg: msg };
      const strBody = JSON.stringify(body);
      client.publish({ destination: "/sub/chat/enter", body: strBody });
    } else {
      console.error("STOMP connection is not active. Cannot publish.");
    }
  };
  const handleSubscribe = (e) => {
    const url = e.target.dataset.url;
    if (sub !== "") {
      alert("채널을 먼저 나가주세요.");
      return;
    }
    if (client.connected) {
      client.subscribe(url, (e) => {
        const parseBody: body = JSON.parse(e.body);
        setLogs([...logs, parseBody]);
        setSub(url);
      });
    } else {
      console.error("연결된 서버가 없습니다.");
    }
  };
  const handleUnsubscribe = (e) => {
    const url = e.target.dataset.url;
    if (sub === "") {
      alert("구독한 채널이 없습니다.");
      return;
    }
    if (client.connected) {
      client.unsubscribe(url);
      setLogs([]);
      setSub("");
    } else {
      console.error("연결된 서버가 없습니다.");
    }
  };

  // styles
  const wrapper = { display: "flex" };
  const login = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "end",
    margin: "0 20px",
  };

  const chatUl = {
    flex: 1,
    width: "300px",
    height: "600px",
    padding: "20px",
    margin: "0 20px",
    border: "1px solid black",
    display: "flex",
    flexDirection: "column",
  };
  const chatLi = {
    borderTop: "1px solid black",
    padding: "10px 0",
    display: "flex",
    justifyContent: "space-between",
  };

  const chatroom = {
    flex: 1,
    width: "300px",
    height: "600px",
    padding: "20px",
    margin: "0 20px",
    border: "1px solid black",
    display: "flex",
    flexDirection: "column",
  };
  const chatheader = { borderBottom: "1px solid black", display: "flex" };
  const chatbody = { flex: 1, display: "flex", flexDirection: "column" };
  const chat = { display: "flex" };
  const mychat = { display: "flex", flexDirection: "row-reverse" };
  const chatinput = { borderTop: "1px solid black", display: "flex" };

  return (
    <div style={wrapper}>
      <div style={login}>
        <p>
          ID: <input value={id} onChange={handleId} />
        </p>
        <p>
          PW: <input value={pw} onChange={handlePw} />
        </p>
        <button onClick={handleLogin}>login</button>
      </div>
      <div style={chatUl}>
        <h2>Chat room list</h2>
        {chatRooms.map((chatRoom, idx) => {
          return (
            <div
              key={idx}
              style={chatLi}
              data-url={chatRoom.url}
              onClick={handleSubscribe}
            >
              {chatRoom.name}
              <button onClick={handleUnsubscribe}>x</button>
            </div>
          );
        })}
      </div>
      <div style={chatroom}>
        <div style={chatheader}>
          <span>Nickname: {nickname}</span>
        </div>
        <div style={chatbody}>
          {logs.map((chatlog, idx) => {
            if (chatlog.nickname === nickname) {
              return (
                <p key={idx} style={mychat}>
                  <span>{chatlog.nickname}</span>
                  <span>&nbsp;-&nbsp;</span>
                  <span>{chatlog.msg}</span>
                </p>
              );
            } else {
              return (
                <p key={idx} style={chat}>
                  <span>{chatlog.nickname}</span>
                  <span> : </span>
                  <span>{chatlog.msg}</span>
                </p>
              );
            }
          })}
        </div>
        <div style={chatinput}>
          <input style={{ flex: 1 }} onChange={handleMsg} value={msg} />
          <button onClick={handlePublish}>send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
