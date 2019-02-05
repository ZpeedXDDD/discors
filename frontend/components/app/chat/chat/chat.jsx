
import React from 'react';
import MessageForm from '../message_form';
import Message from '../message';

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
    this.bottom = React.createRef();
  }

  componentDidMount() {
    const channelId = this.props.match.params.channelId;
    this.subscribe(channelId);
    this.bottom.current.scrollIntoView();

    if (channelId && !this.props.channel.serverId) {
      const notification = document.getElementById(`dm-notification-${channelId}`);
      if (notification) {
        notification.className = 'dm-notification';
        setTimeout(() => this.props.removeDmNotification(channelId), 200);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const channelId = this.props.match.params.channelId;

    if (channelId && prevProps.channelId !== channelId) {
      this.setState({ messages: [] });
      this.subscription.unsubscribe();
      this.subscribe(channelId);

      if (channelId && !this.props.channel.serverId) {
        const notification = document.getElementById(`dm-notification-${channelId}`);
        if (notification) {
          notification.className = 'dm-notification';
          setTimeout(() => this.props.removeDmNotification(channelId), 200);
        }
      }
    }
    this.bottom.current.scrollIntoView();

  }

  subscribe(channelId) {
    this.subscription = App.cable.subscriptions.subscriptions.find((subscription) => (
      subscription.identifier === `{"channel":"ChatChannel","channelId":"${channelId}"}`
    ));

    if (this.subscription) {
      this.subscription.load({ channelId });
    } else {
      this.subscription = App.cable.subscriptions.create(
        { channel: "ChatChannel", channelId },
        {
          received: data => {
            switch (data.type) {
              case "message":
                this.setState({
                  messages: this.state.messages.concat(data.message)
                });
                break;
              case "messages":
                this.setState({ messages: data.messages });
                break;
            }
          },
          speak: function (data) { return this.perform("speak", data); },
          load: function (data) { return this.perform("load", data); }
        }
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  parseMessage() {
    
  }

  parseMessages() {
    const messageArr = [];
    let messageStr;
    let authorId;
    let time;

    for (let i = 0; i < this.state.messages.length; i++) {
      const message = this.state.messages[i];

      if (i === 0) {
        messageStr = message.body;
        authorId = message.author_id;
        time = message.created_at;
      } else if (i === this.state.messages.length - 1) {
        if (message.author_id === authorId) {
          messageStr = messageStr + '\n' + message.body;
          messageArr.push(
            <Message key={i}
              message={messageStr}
              user={this.props.users[authorId] || {}}
              time={time}
            />
          )
        } else {
          messageArr.push(
            <Message key={i}
              message={messageStr}
              user={this.props.users[authorId] || {}}
              time={time}
            />
          )

          messageArr.push(
            <Message key={i + 1}
              message={message.body}
              user={this.props.users[message.author_id] || {}}
              time={message.created_at}
            />
          )
        }
      } else if (message.author_id === authorId) {
        messageStr = messageStr + '\n' + message.body;
      } else {
        messageArr.push(
          <Message key={i}
            message={messageStr}
            user={this.props.users[authorId] || {}}
            time={time}
          />
        )

        authorId = message.author_id;
        messageStr = message.body;
        time = message.created_at;
      }
    }
    return messageArr
  }

  render() {
    const messageList = this.state.messages.map((message, idx) => {
      return (
        <Message key={idx}
          message={message}
          user={this.props.users[message.author_id] || {}}
        />
      );
    });

    let emptyMessage = null;
    if (this.props.channel.name === "general") {
      emptyMessage = (
        <div className="welcome-message">
          <h2>{`welcome to the server, ${this.props.currentUser.username}!`}</h2>
          <div>
            <div className="server-welcome-item">
              <div className="exclamation-icon"></div>
              <p><strong>Discors</strong> is a clone of the awesome Discord app! This site is purely for educational purposes.</p>
            </div>
            <div className="server-welcome-item">
              <div className="comp-icon"></div>
              <p><strong>Learn about Discors</strong> by exploring the site or visiting the github repo <a href="https://github.com/jeffdeliso">here!</a></p>
            </div>
            <div className="server-welcome-item">
              <div className="phone-icon"></div>
              <p><strong>Reach me</strong> via <a href="https://www.linkedin.com/in/jdeliso/">LinkedIn</a> or send me an email at <a href="mailto: jad346@cornell.edu">jad346@cornell.edu</a>!</p>
            </div>
          </div>
          <div className="empty-chat">
          </div>
        </div>
      )
    } else {
      if (this.props.channel.name && this.props.match.params.serverId) {
        emptyMessage = <div className="empty-chat"><h4>Welcome to the beginning of the <strong>{`#${this.props.channel.name}`}</strong> channel.</h4></div>;
      } else if (this.props.channel.name) {
        const nameArr = this.props.channel.name.split('-');
        let userId;
        if (nameArr[0] == this.props.currentUser.id) {
          userId = nameArr[1];
        } else {
          userId = nameArr[0];
        }
        emptyMessage = emptyMessage = <div className="empty-chat"><h4>This is the beginning of your direct message history with <strong>{this.props.users[userId] ? `@${this.props.users[userId].username}` : ''}</strong></h4></div>;
      }
    }

    return (
      <div className="chat-main">
        <div className="message-wrapper">
          <div className="message-scroll-wrapper">
            <div className="message-list">
              {emptyMessage}
              {this.parseMessages()}
              <div ref={this.bottom} />
            </div>
          </div>
        </div>
        <MessageForm
          user={this.props.currentUser}
          channel={this.props.channel}
          channelId={this.props.channelId}
          users={this.props.users}
          subscription={this.subscription}
        />
      </div >
    )
  }
}

export default Chat;