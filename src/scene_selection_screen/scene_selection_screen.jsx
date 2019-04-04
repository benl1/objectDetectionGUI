import { displayImageChoiceScreen, displayOutputScreen } from '../entrypoint';
import { displayYesNoDialog, displayImageUploadDialog, displayErrorDialog } from '../control/dialogs';
import React from 'react';
import Webcam from 'react-webcam';


export default class SceneSelectionScreen extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            image: null
        }
    }

    outputScreenClick() {
       //jay said to delete this line

        // make sure that there is at least one target image before continuing
        if (this.props.app.images.length == 0) {
            displayErrorDialog('you must provide at least one target image');
            return;
        }

        // this is temporary -- check to see if the user has provided a scene image
        if (this.props.app.scene_image == '') {
            displayErrorDialog('you must provide a scene image');
            return;
        }

        displayOutputScreen(this.props.app);

    }

    render() {
        return (
            <div>
                <SceneSelectionScreenTitle />
                <SceneSelectionContainer parent={this} app={this.props.app}/>
                <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
                <div className='button' onClick={() => this.outputScreenClick()}>Output</div>
                <div className="sceneImageDiv">
                    {this.state.image}
                </div>
            </div>
        );
    }
}

class SceneImage extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            imageUrl: props.url
        }
    }

    render() {
        return(
            <img className="sceneImage" src={this.props.url}></img>
        )
    }
}
//var g = null;
class WebcamCapture extends React.Component {
    constructor(props) {
        super(props)
        //g = this;
        this.setRef= this.setRef.bind(this)
        this.capture = this.capture.bind(this)
        this.state = {}
    }

    setRef(webcam) {
      console.log(webcam)
      console.log(this)
      this.webcam = webcam;
    }
   
    capture() {
      const imageSrc = this.webcam.getScreenshot();
      var image = <SceneImage url={imageSrc}></SceneImage>
      this.setState({ss: image})
    }
   
    render() {
      const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
      };
   
      return (
        <div>
          <Webcam
            audio={false}
            height={350}
            ref={this.setRef}
            screenshotFormat="image/jpeg"
            width={350}
            videoConstraints={videoConstraints}
          />
          <button onClick={this.capture}>Capture photo</button>
          {this.state.ss}
        </div>
      );
    }
  }

class SceneSelectionContainer extends React.Component {
    constructor(props) {
     super(props)
     this.parent = props.parent

    }

    handleSceneImageUpload() {
        let img_paths = displayImageUploadDialog();
        if (img_paths === undefined) return;

        let scene_img_path = img_paths[0];
        console.log(`set the scene image: ${scene_img_path}`);
        this.props.app.setSceneImage(scene_img_path);
        this.parent.setState({image: <SceneImage url={scene_img_path}></SceneImage>})
        
    }

    handleWebcam() {
         
        <Styled.Webcam audio={false} videoConstraints={{ facingMode: camera }} ref={this.webcam} />
        const img = this.webcam.current.getScreenshot()
        this.props.app.setSceneImage(img)
        this.parent.setState({image: <SceneImage url={scene_img_path}></SceneImage>})
        // displayYesNoDialog('we still need to get webcam interop working.')
    }

    render() {
        return (
            <div>
                <div
                    className='button'
                    onClick={() => this.handleSceneImageUpload()}
                >
                    Upload scene image
                </div>
                <div
                    className='button'
                    onClick={() => this.handleWebcam()}
                >
                    Use your webcam
                </div>
                <WebcamCapture></WebcamCapture>
            </div>
        );
    }
}

function SceneSelectionScreenTitle(props) {
    return <h3>Select scene imagery source</h3>;
}