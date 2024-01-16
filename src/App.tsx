import { Client } from "@stomp/stompjs";
import React, { useState } from "react";

const client = new Client({
  brokerURL: "ws://70.12.114.70:8080/websocketserver",
  debug: function (str) {
    console.log(str);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

function App() {
  const [msg, setMsg] = useState("");
  const [to, setTo] = useState("");

  const handleMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMsg(value);
  };
  const handleTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTo(value);
  };
  const handlePublish = () => {
    if (client.connected) {
      client.publish({ destination: to, body: msg });
    } else {
      console.error("STOMP connection is not active. Cannot publish.");
    }
  };
  const handleSubscribe = () => {
    client.subscribe("/sub/chat/enter", () => {});
  };

  return (
    <>
      <button onClick={() => client.activate()}>activate</button>
      <button onClick={() => client.deactivate()}>deactivate</button>
      <button onClick={handleSubscribe}>subscribe</button>
      <button onClick={handlePublish}>publish</button>
      <p>
        To: <input onChange={handleTo} value={to} />
      </p>
      <p>
        Msg: <input onChange={handleMsg} value={msg} />
      </p>
    </>
  );
}

export default App;
