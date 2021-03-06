import React, { Component } from 'react';
import PropTypes from 'proptypes';
import classnames from 'classnames';
import _ from 'lodash';

class CallWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Video: true,
      Audio: true,
      ShareScreen: false
    };

    this.btns = [
      { type: 'Video', icon: 'fa-video-camera' },
      { type: 'ShareScreen', icon: 'fa-desktop' },
      { type: 'Audio', icon: 'fa-microphone' }
    ];
  }

  componentDidMount() {
    this.setMediaStream();
  }

  componentWillReceiveProps(nextProps) {
    // Initialize when the call started
    if (!this.props.config && nextProps.config) {
      const { config, mediaDevice } = nextProps;
      _.forEach(config, (conf, type) =>
        mediaDevice.toggle(_.capitalize(type), conf));

      this.setState({
        Video: config.video,
        Audio: config.audio
      });
    }
  }

  componentDidUpdate() {
    this.setMediaStream();
  }

  setMediaStream() {
    const { peerSrc, peerScreenSrc, localSrc } = this.props;
    if (this.peerVideo && peerSrc) this.peerVideo.srcObject = peerSrc;
    if (this.peerScreenVideo && peerScreenSrc) this.peerScreenVideo.srcObject = peerScreenSrc;
    if (this.localVideo && localSrc) this.localVideo.srcObject = localSrc;
  }

  /**
   * Turn on/off a media device
   * @param {String} deviceType - Type of the device eg: Video, Audio
   */
  toggleMediaDevice(deviceType) {
    this.props.mediaDevice.toggle(deviceType, !this.state[deviceType]);
    if(deviceType === 'ShareScreen'){
      this.setState({
        [deviceType]: !this.state[deviceType],
        "Video": (!this.state.ShareScreen) ? false : this.state.Video
      });
    }else{
      this.setState({
        [deviceType]: !this.state[deviceType]
      });
    }
  }

  renderControlButtons() {
    const getClass = (icon, type) => classnames(`btn-action fa ${icon}`, {
      disable: !this.state[type]
    });

    return this.btns.map(btn => (
      <button
        key={`btn${btn.type}`}
        className={getClass(btn.icon, btn.type)}
        onClick={() => this.toggleMediaDevice(btn.type)}
        disabled={btn.type === 'Video' && this.state.ShareScreen}
      />
    ));
  }
  render() {
    const { status } = this.props;
    return (
      <div className={classnames('call-window', status)}>
        <video id="peerScreenVideo" ref={el => this.peerScreenVideo = el} autoPlay />
        <video id="peerVideo" ref={el => this.peerVideo = el} autoPlay />
        <video id="localVideo" ref={el => this.localVideo = el} autoPlay muted />
        <div className="video-control">
          {this.renderControlButtons()}
          <button
            className="btn-action hangup fa fa-phone"
            onClick={() => this.props.endCall(true)}
          />
        </div>
      </div>
    );
  }
}

CallWindow.propTypes = {
  status: PropTypes.string.isRequired,
  localSrc: PropTypes.object, // eslint-disable-line
  peerSrc: PropTypes.object, // eslint-disable-line
  config: PropTypes.object, // eslint-disable-line
  mediaDevice: PropTypes.object, // eslint-disable-line
  endCall: PropTypes.func.isRequired
};

export default CallWindow;
