import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import io from 'socket.io-client';
import PropTypes from 'prop-types';


const NotificationsClient = (props) => {
  const { keycloak } = props;

  const [connectionState, setConnectionState] = useState('NEW');
  const [messages, setMessages] = useState([]);

  const connectToNotificationsService = () => {
    setConnectionState('CONNECTING');

    if (keycloak.authenticated) {
      // eslint-disable-next-line new-cap
      const sock = new io('/');

      sock.on('connect', () => {
        setConnectionState('CONNECTED, AUTHENTICATING');
        sock.emit('action', {
          type: 'socketio/AUTHENTICATE',
          token: keycloak.idToken,
        });
      });

      sock.on('disconnect', () => {
        setConnectionState('DISCONNECTED');
      });

      sock.on('error', (error) => {
        setConnectionState('ERROR');
        console.log(error);
      });

      sock.on('action', (action) => {
        switch (action.type) {
          case 'socketio/AUTHENTICATE_SUCCESS':
            setConnectionState('CONNECTED AND AUTHENTICATED');
            break;
          case 'message':
            setMessages(messages.concat([action.data]));
            break;
          default:
            console.log(action);
        }
      });
    }
  };

  useEffect(() => {
    connectToNotificationsService();
  }, [keycloak.authenticated]);

  return (
    <div>
      I&apos;m a websocket notifications client
      <br />
      My connection to the server is:
      {connectionState}
      <br />
      {messages.length > 0 && (
      <div>
        <p>Server says</p>
        <ul>
          {messages.map((m) => (<li key={m}>{m}</li>))}
        </ul>
      </div>
      )}
    </div>
  );
};

NotificationsClient.propTypes = {
  keycloak: PropTypes.shape({
    authenticated: PropTypes.bool,
    idToken: PropTypes.string,
  }).isRequired,
};

export default hot(NotificationsClient);
