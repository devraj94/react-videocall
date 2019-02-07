import _ from 'lodash';
import Emitter from './Emitter';

/**
 * Manage all media devices
 */
class MediaDevice extends Emitter {
  /**
   * Start media devices and send stream
   */
  start() {
    const constraints = {
      video: {
        facingMode: 'user',
        height: { min: 360, ideal: 720, max: 1080 }
      },
      audio: true
    };
      this.screenVideoIds = [];

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoSharing = true;
        this.screenSharing = false;
        this.emit('stream', this.stream);
      })
      .catch(err => console.log(err));


    return this;
  }
  /**
   * Turn on/off a device
   * @param {String} type - Type of the device
   * @param {Boolean} [on] - State of the device
   */
  toggle(type, on) {
    if(type === 'Video' && this.stream){
      if(on && !this.videoSharing){
        if(this.screenStream){
          this.emit('streamReplace', this.stream, this.screenStream);
        }else{
          this.emit('stream', this.stream);
        }
        this.videoSharing = true;
      }else if(!on && this.videoSharing){
        this.videoSharing = false;
      }
      this.stream[`getVideoTracks`]().forEach((track) => {
        _.set(track, 'enabled', this.videoSharing);
      });
    }else if(type === 'ShareScreen'){
      this.startScreenSharing(() => {
        if(on && !this.screenSharing){
          if(this.stream){
            this.emit('streamReplace', this.screenStream, this.stream);
          }else{
            this.emit('stream', this.screenStream);
          }
          this.screenSharing = true;
          this.videoSharing = false;
        }else if(!on && this.screenSharing){
          this.screenSharing = false;
        }
        this.screenStream[`getVideoTracks`]().forEach((track) => {
          _.set(track, 'enabled', this.screenSharing);
        });
      })
    }else{
      const len = arguments.length;
      if (!this.videoSharing && this.stream) {
        this.stream[`get${type}Tracks`]().forEach((track) => {
          const state = len === 2 ? on : !track.enabled;
          _.set(track, 'enabled', state);
        });
      }else if (this.screenSharing && this.screenStream) {
        this.screenStream[`get${type}Tracks`]().forEach((track) => {
          const state = len === 2 ? on : !track.enabled;
          _.set(track, 'enabled', state);
        });
      }
    }
    return this;
  }

  /**
   * Stop all media track of devices
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    return this;
  }

  //Getting Shreen Share Stream
  startScreenSharing(cb){
    if(!this.screenStream){
      if(navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia) {
          if(navigator.mediaDevices.getDisplayMedia) {
              navigator.mediaDevices.getDisplayMedia({video: true}).then(stream => {
                this.screenStream = stream;
                if(this.stream){
                  this.stream[`getAudioTracks`]().forEach((track) => {
                    this.screenStream.addTrack(track);
                  });
                }
                cb();
              }, this.getDisplayMediaError).catch(this.getDisplayMediaError);
          } 
          else if(navigator.getDisplayMedia) {
              navigator.getDisplayMedia({video: true}).then(stream => {
                  this.screenStream = stream;
                  if(this.stream){
                    this.stream[`getAudioTracks`]().forEach((track) => {
                      this.screenStream.addTrack(track);
                    });
                  }
                  cb();
              }, this.getDisplayMediaError).catch(this.getDisplayMediaError);
          }
      }else{
        alert("Not latest browser");
        cb();
      }
    }else{
      cb();
    }
  }

  getDisplayMediaError(error) {
    alert(error.toString());
  }
}

export default MediaDevice;
