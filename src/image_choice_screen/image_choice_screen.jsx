import React from 'react';
import { displayYesNoDialog, displayImageUploadDialog, displayErrorDialog } from '../control/dialogs';
import { displaySceneSelectionScreen } from '../entrypoint';
import { PictureTaker } from '../scene_selection_screen/scene_selection_screen';

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
            <div className='flexColumn'>
                <h3>Select search objects</h3>
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
            showPictureArea: false,
            last_img_path: '',
        }

        let imgs = this.props.app.getImages();
        if (imgs.length === 0) return;
        let self = this
        imgs = imgs.map((src, idx) => <RImage src={src} removeFunc={(imgsrc) => self.clearImage(imgsrc)} key={idx} />);
        // use this.state.images instead of setState because the component isn't mounted yet
        this.state.images = imgs;
    }

    uploadImage() {
        const file_upload = displayImageUploadDialog();
        if (file_upload === undefined) return;
        this.setState({ showCroppingArea: true, showPictureArea: false, last_img_path: file_upload[0] });
    }

    takePicture() {
        this.setState({ showPictureArea: true, showCroppingArea: false });
    }

    handlePictureCapture(img_data, track_settings) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = track_settings.width;
        canvas.height = track_settings.height;
        context.drawImage(img_data, 0, 0);
        this.setState({ showPictureArea: false, showCroppingArea: true, last_img_path: canvas.toDataURL() })
    }

    clearAllImages() {
        const user_choice = displayYesNoDialog('Are you sure you want to remove all images?');

        if (user_choice === 0) {
            this.props.app.removeAllImages(); // dump all images from the app
            this.setState({ images: [] });
        }
    }

    clearImage(imgSrc) {
        let state = this.state;
        state.images = state.images.filter((obj) => obj.props.src !== imgSrc);

        this.setState(state);
        this.props.app.removeImage(imgSrc);
    }

    render() {
        return (
            <div className='flexColumn'>
                <div className='button' onClick={() => this.uploadImage()}>Upload an image</div>
                <div className='button' onClick={() => this.takePicture()}>Take picture</div>
                {this.state.showPictureArea ? <PictureTaker handleCapture={this.handlePictureCapture.bind(this)}></PictureTaker> : null}
                <div className='button' onClick={() => this.clearAllImages()}>Clear all images</div>
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

    setImage() {
        const canvas = this.canvas_ref.current;
        let img = new Image();

        img.onload = () => {
            this.redrawImage();
        };
        img.src = this.props.img_path;

        let statePlus = this.state;
        statePlus.srcImage = img;
        this.state = statePlus;
    }

    redrawImage() {
        const canvas = this.canvas_ref.current;
        const ctx = canvas.getContext('2d');

        let state = this.state;
        let img = this.state.srcImage;

        //redraw
        const half_width = img.width / 2;
        const half_height = img.height / 2;
        canvas.width = half_width;
        canvas.height = half_height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, half_width * 2, half_height * 2, 0, 0, half_width, half_height);
    }

    componentDidMount() {
        this.setImage();
    }

    componentDidUpdate() {
        this.setImage();
    }

    handleAreaSelection(event) {
        const canvas = this.canvas_ref.current;
        const ctx = canvas.getContext('2d');
        let state = this.state;

        this.redrawImage();

        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';


        if (!this.state.one_crop_click) {
            const rect = event.target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            state.one_click_point = { x: x, y: y };
            state.one_crop_click = true;
            this.state = state;

            ctx.fillRect(x, y, 5, 5);
        } else {
            let firstX = this.state.one_click_point.x, firstY = this.state.one_click_point.y;
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
            state.two_click_point = { x: secondX, y: secondY };
            this.state = state;
        }
    }

    handleWholeImage() {
        const junk_parent = this.props.death;
        // notify the app that we've added a new image - it will give us a key
        const key = junk_parent.props.app.addImage(this.props.img_path);
        const imgs = junk_parent.state.images;

        imgs.push(this.createRImage(this.props.img_path, key));
        junk_parent.setState({ images: imgs, showCroppingArea: false });
    }

    handleCropCapture() {
        let state = this.state;
        let canvas = this.canvas_ref.current;

        //first remove red lines
        this.redrawImage();

        if (!state.one_click_point || !state.two_click_point) {
            displayErrorDialog("You need to choose two points before cropping.")
        } else {
            let fp = state.one_click_point, sp = state.two_click_point;
            let width = Math.abs(fp.x - sp.x), height = Math.abs(fp.y - sp.y);

            let cv = document.createElement("canvas");
            cv.width = width; cv.height = height;

            let ctx = cv.getContext('2d');

            ctx.drawImage(canvas, Math.min(fp.x, sp.x), Math.min(fp.y, sp.y), width, height,
                0, 0, width, height);

            let dataPath = cv.toDataURL();

            const junk_parent = this.props.death;
            // notify the app that we've added a new image - it will give us a key
            const key = junk_parent.props.app.addImage(dataPath);
            const imgs = junk_parent.state.images;

            imgs.push(this.createRImage(dataPath, key));
            junk_parent.setState({ images: imgs, showCroppingArea: false });
        }
    }

    createRImage(src, key) {
        return <RImage key={key} src={src} removeFunc={(imgsrc) => this.props.death.clearImage(imgsrc)} />
    }

    render() {
        return (
            <div className='flexColumn'>
                <h3>Click twice to crop image:</h3>
                <canvas className='croppingCanvas' ref={this.canvas_ref} onClick={(event) => this.handleAreaSelection(event)}></canvas>
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
            <img className='imageDelete' src="assets/deleteImageSymbol.jpg" onClick={(e) => props.removeFunc(props.src)} />
        </div>
    );
}
