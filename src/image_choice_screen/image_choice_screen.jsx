import React from 'react';
import { displayYesNoDialog, displayImageUploadDialog, displayErrorDialog } from '../control/dialogs';
import { displaySceneSelectionScreen } from '../entrypoint';

export default class ImageChoiceScreen extends React.Component {
    handleSceneSelectionClick() {
        // only allow the user to advance to the next screen if they have selected target image(s)
        if (this.props.app.getImages().length > 0) {
            displaySceneSelectionScreen(this.props.app);
        } else {
            displayErrorDialog('select at least one target image first');
        }
    }

    render() {
        return (
            <div>
                <ImageChoiceScreenTitle />
                <ImageContainer app={this.props.app} />
                <div className='button' onClick={() => this.handleSceneSelectionClick()}>Scene Selection</div>
            </div>
        );
    }
}

class ImageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
            showCroppingArea: false,
            last_img_path: '',
        }

        let imgs = this.props.app.getImages();
        if (imgs.length === 0) return;

        imgs = imgs.map((src, idx) => <RImage src={src} key={idx}/>);
        // use this.state.images instead of setState because the component isn't mounted yet
        this.state.images = imgs;
    }

    uploadImage() {
        const file_upload = displayImageUploadDialog();
        if (file_upload === undefined) return;

        this.setState({showCroppingArea: true, last_img_path: file_upload[0]});
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
                <div className='imageContainer'>{this.state.images}</div>
                {this.state.showCroppingArea ? <CroppingArea death={this} img_path={this.state.last_img_path}></CroppingArea> : null}
            </div>
        );
    }
}

class CroppingArea extends React.Component {
    constructor(props) {
        super(props);
        this.canvas_ref = React.createRef();
        this.state = {
            one_crop_click: false
        };
    }

    componentDidMount() {
        const canvas = this.canvas_ref.current;
        let img = new Image();

        img.onload = () => {
            const half_width = img.width / 2;
            const half_height = img.height / 2;
            canvas.width = half_width;
            canvas.height = half_height;
            const gfx = canvas.getContext('2d');
            gfx.drawImage(img, 0, 0, half_width * 2, half_height * 2, 0, 0, half_width, half_height);
        };
        img.src = this.props.img_path;
    }

    handleAreaSelection(event) {
        const canvas = this.canvas_ref.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';

        let state = this.state;

        if (!this.state.one_crop_click) {
            const rect = event.target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            state.one_click_point = {x:x,y:y};
            state.one_crop_click = true;
            this.setState(state);

            ctx.fillRect(x, y, 5, 5);
        } else {
            let firstX = this.state.one_click_point.x, firstY =  this.state.one_click_point.y;
            const rect = event.target.getBoundingClientRect();
            const secondX = event.clientX - rect.left;
            const secondY = event.clientY - rect.top;

            ctx.beginPath();
            ctx.moveTo(firstX, firstY);
            ctx.lineTo(secondX, firstY);
            ctx.lineTo(secondX, secondY);
            ctx.lineTo(firstX, secondY);
            ctx.lineTo(firstX, firstY);
            ctx.stroke()

            state.one_crop_click = false;
            this.setState(state)
        }
    }

    handleWholeImage() {
        const junk_parent = this.props.death;
        // notify the app that we've added a new image - it will give us a key
        const key = junk_parent.props.app.addImage(this.props.img_path);
        const imgs = junk_parent.state.images;

        imgs.push(<RImage key={key} src={this.props.img_path} />);
        junk_parent.setState({ images: imgs, showCroppingArea: false });
    }

    handleCropCapture() {

    }

    render() {
        return (
            <div>
                <h3>Click and drag to crop image:</h3>
                <canvas ref={this.canvas_ref} onClick={(event) => this.handleAreaSelection(event)}></canvas>
                <div className='button' onClick={() => this.handleWholeImage()}>Take whole image</div>
                <div className='button' onClick={() => this.handleCropCapture()}>Take cropped image</div>
            </div>
        );
    }
}

function RImage(props) {
    return (
        <div className='imageWrapper'>
            <img className='image' src={props.src} />
        </div>
    );
}

function UploadImageButton(props) {
    return <div className='button' onClick={() => props.click()}>
        Upload an image
    </div>;
}

function ClearAllImagesButton(props) {
    return <div className='button' onClick={() => props.click()}>
        Clear all images
    </div>;
}

function ImageChoiceScreenTitle(props) {
    return <h3>Select search objects</h3>;
}
