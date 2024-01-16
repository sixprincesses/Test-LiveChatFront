import { Client } from "@stomp/stompjs";
import React, { useState } from "react";

interface body {
  nickname: string;
  msg: string;
}

function App() {
  const [server, setServer] = useState("70.12.114.70:8080/websocketserver");
  const [subTo, setSubTo] = useState("/sub/chat/enter");
  const [pubTo, setPubTo] = useState("/sub/chat/enter");

  const [msg, setMsg] = useState("Hi");
  const [nickname, setNickname] = useState("ktg");

  const [logs, setLogs] = useState<body[]>([{ nickname: "ktg", msg: "hi" }]);

  const client = new Client({
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  // 이벤트 핸들러
  const handleServer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setServer(value);
  };
  const handleMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMsg(value);
  };
  const handleSubTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSubTo(value);
  };
  const handlePubTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPubTo(value);
  };
  const handleNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNickname(value);
  };
  const handlePublish = () => {
    if (client.connected) {
      const body = { nickname: nickname, msg: msg };
      const strBody = JSON.stringify(body);
      client.publish({ destination: pubTo, body: strBody });
    } else {
      console.error("STOMP connection is not active. Cannot publish.");
    }
  };
  const handleSubscribe = () => {
    if (client.connected) {
      client.subscribe(subTo, (e) => {
        const parseBody: body = JSON.parse(e.body);
        setLogs([...logs, parseBody]);
      });
    } else {
      console.error("STOMP connection is not active. Cannot subscribe.");
    }
  };

  // styles
  const wrapper = {
    display: "flex",
  };
  const divStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    gap: "30px",
  };
  const setting = {};
  const chatroom = {
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
  const chatinput = {
    borderTop: "1px solid black",
    display: "flex",
  };

  return (
    <div style={wrapper}>
      <div style={setting}>
        <div style={divStyle}>
          <h3>Set Server</h3>
          <input
            onChange={handleServer}
            value={server}
            style={{ width: "250px" }}
          />
          <button onClick={() => (client.brokerURL = `ws://${server}`)}>
            Set
          </button>
        </div>
        <hr />
        <div style={divStyle}>
          <h3>Active/Deactive Button</h3>
          <button onClick={() => client.activate()}>activate</button>
          <button onClick={() => client.deactivate()}>deactivate</button>
        </div>
        <hr />
        <div style={divStyle}>
          <h3>Subscribe</h3>
          <p>
            To: <input onChange={handleSubTo} value={subTo} />
          </p>
          <button onClick={handleSubscribe}>subscribe</button>
        </div>
        <hr />
        <div style={divStyle}>
          <h3>Publish</h3>
          <div>
            <p>
              To: <input onChange={handlePubTo} value={pubTo} />
            </p>
          </div>
        </div>
        <hr />
      </div>
      <div style={chatroom}>
        <div style={chatheader}>
          <span>Nickname:</span>
          <input
            style={{ flex: 1 }}
            onChange={handleNickname}
            value={nickname}
          />
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
