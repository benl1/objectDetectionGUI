import React from 'react';
import { displayYesNoDialog, displayImageUploadDialog } from '../control/dialogs';
import { displaySceneSelectionScreen } from '../entrypoint';

export default class ImageChoiceScreen extends React.Component {
    render() {
        return (
            <div>
                <ImageChoiceScreenTitle />
                <ImageContainer app={this.props.app} />
                <div className='button' onClick={() => displaySceneSelectionScreen(this.props.app)}>Scene Selection</div>
            </div>
        );
    }
}

class ImageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
        }

        let imgs = this.props.app.getImages();
        if (imgs.length === 0) return;

        imgs = imgs.map((src, idx) => <Image src={src} key={idx}/>);
        // use this.state.images instead of setState because the component isn't mounted yet
        this.state.images = imgs;
    }

    uploadImage() {
        const file_upload = displayImageUploadDialog();
        if (file_upload === undefined) return;

        const key = this.props.app.addImage(file_upload[0]); // notify the app that we've added a new image - it will give us a key
        const imgs = this.state.images;
        imgs.push(<Image key={key} src={file_upload[0]} />);
        this.setState({ images: imgs });
    }

    clearAllImages() {
        const user_choice = displayYesNoDialog('Are you sure you want to remove all images?');

        if (user_choice === 0) {
            this.props.app.removeAllImages(); // dump all images from the app
            this.setState({ images: [] });
        }
    }

    render() {
        return (
            <div>
                <UploadImageButton click={() => this.uploadImage()} />
                <ClearAllImagesButton click={() => this.clearAllImages()} />
                <div className='imageContainer'>
                    {this.state.images}
                </div>
            </div>
        );
    }
}

function Image(props) {
    return (
        <div className='imageWrapper'>
            <img className='image' src={props.src} />
        </div>
    );
}

function UploadImageButton(props) {
    return <div className='button'
        onClick={() => props.click()}
    >
        Upload an image
    </div>;
}

function ClearAllImagesButton(props) {
    return <div className='button'
        onClick={() => props.click()}
    >
        Clear all images
    </div>;
}

function ImageChoiceScreenTitle(props) {
    return <h3>Select search objects</h3>;
}
