import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Chat from './chat';
import { createDmChannel } from '../../../actions/channel_actions';


const mapStateToProps = (state, ownProps) => {
  const channelId = ownProps.match.params.channelId;
  return {
    currentUser: state.entities.users[state.session.id],
    channelId,
    users: state.entities.users,
    channel: state.entities.channels[channelId],
  };
};

const mapDispatchToProps = dispatch => {
  return {
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Chat));
