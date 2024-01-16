import { Client } from "@stomp/stompjs";
import React, { useState } from "react";

function App() {
  const [server, setServer] = useState("");
  const [msg, setMsg] = useState("");
  const [to, setTo] = useState("");

  const client = new Client({
    debug: function (str) {
      console.log(str);
    },
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
    if (client.connected) {
      client.subscribe(to, () => {});
    } else {
      console.error("STOMP connection is not active. Cannot subscribe.");
    }
  };

  const divStyle = {
    display: "grid",
    alignItems: "center",
    justifyContent: "center",
    gridTemplateColumns: "1fr 2fr 2fr",
    margin: "50px",
    gap: "30px",
  };

  return (
    <div>
      <div style={divStyle}>
        <h3>Set Server</h3>
        <input
          onChange={handleServer}
          value={server}
          style={{ width: "100%" }}
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
          To: <input onChange={handleTo} value={to} style={{ width: "90%" }} />
        </p>
        <button onClick={handleSubscribe}>subscribe</button>
      </div>
      <hr />
      <div style={divStyle}>
        <h3>Publish</h3>
        <p>
          Msg:{" "}
          <input onChange={handleMsg} value={msg} style={{ width: "85%" }} />
        </p>
        <button onClick={handlePublish}>publish</button>
      </div>
      <hr />
    </div>
  );
}

export default App;
