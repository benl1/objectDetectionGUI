import React from 'react';
import { displayYesNoDialog, displayImageUploadDialog, displayErrorDialog, displayImageStoreUploadDialog } from '../control/dialogs';
import { displaySceneSelectionScreen } from '../entrypoint';
import { readFile } from '../control/fileops';

export default class ImageChoiceScreen extends React.Component {
    handleSceneSelectionClick() {
        // only allow the user to advance to the next screen if they have selected target image(s)
        if (this.props.app.getImages().length > 0) {
            displaySceneSelectionScreen(this.props.app);
        } else {
            displayErrorDialog('Select at least one target image before loading the scene selection screen');
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
            show_cropping_area: false,
            show_image_store_area: false,
            last_img_path: '',
        }

        let imgs = this.props.app.getImages();
        if (imgs.length === 0) return;

        imgs = imgs.map((src, idx) => <RImage src={src} key={idx} remove_func={() => this.clearImage(imgsrc)} />);
        this.state.images = imgs; // use this.state.images instead of setState because the component isn't mounted yet
    }

    uploadImage() {
        const file_upload = displayImageUploadDialog();
        if (file_upload === undefined) return;

        this.setState({
            show_image_store_area: false,
            show_cropping_area: true,
            last_img_path: file_upload[0],
        });
    }

    loadImageStore() {
        const file_upload = displayImageStoreUploadDialog();
        if (file_upload === undefined) return;

        this.setState({
            show_image_store_area: true,
            show_cropping_area: false,
            last_img_path: file_upload[0] // last_img_path holds the image store location here.
        });
    }

    addImage(img_src) {
        const imgs = this.state.images;
        const key = this.props.app.addImage(img_src);
        imgs.push(<RImage src={img_src} key={key} remove_func={() => this.clearImage(img_src)}></RImage>);
        this.setState({ images: imgs });
    }

    clearImage(img_src) {
        const state = this.state;
        state.images = state.images.filter(obj => obj.props.src !== img_src);
        this.setState(state);
        this.props.app.removeImage(img_src);
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
                <ImageStoreButton click={() => this.loadImageStore()} />
                <div className='imageContainer'>{this.state.images}</div>
                {this.state.show_cropping_area ? <CroppingArea parent={this}></CroppingArea> : null}
                {this.state.show_image_store_area ? <ImageStoreArea parent={this}></ImageStoreArea> : null}
            </div>
        );
    }
}

class ImageStoreArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = { images: [] };
    }

    // when the component loads, read the JSON file and try getting the images from it.
    componentDidMount() {
        const raw_data = readFile(this.props.parent.state.last_img_path);
        const json_data = JSON.parse(raw_data);
        const imgs = json_data.imgs;
        const img_state = [];
        let idx = 0;
        // iterate through the images stored in the object and add them to the image store area.
        imgs.forEach(img => {
            img_state.push(<LibraryImage key={idx} src={img.data} click={() => this.onImageClick(img.data)}></LibraryImage>);
            idx++;
        });
        // update the state of this object now that we've found the images that we want to show in it.
        this.setState({ images: img_state });
    }

    /* when we click on an image object in the image store area,
     * we change the parent's state to trigger the cropping area to be shown
     * using the data url representation of the image which was clicked on. 
     */
    onImageClick(img_data) {
        this.props.parent.setState({
            last_img_path: img_data,
            show_image_store_area: false,
            show_cropping_area: true,
        });
    }

    render() {
        return (
            <div>
                <h3>Contents of the uploaded image store:</h3>
                <div className='imageContainer'>{this.state.images}</div>
            </div>
        );
    }
}

class CroppingArea extends React.Component {
    constructor(props) {
        super(props);
        this.canvas_ref = React.createRef();
        this.state = {
            one_crop_click: false,
            src_image: undefined,
        };
    }

    setImage() {
        const img = new Image();
        img.onload = () => this.redrawImage();
        img.src = this.props.parent.state.last_img_path;

        const statePlus = this.state;
        statePlus.src_image = img;
        this.state = statePlus;
    }

    redrawImage() {
        const canvas = this.canvas_ref.current;
        const ctx = canvas.getContext('2d');
        const img = this.state.src_image;

        /* REDRAW:
         * We are drawing the image at half size in hopes that large images will be scaled
         * down to a more appropriate size. This could use improvement if we have
         * time for it.
         */
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
            const firstX = this.state.one_click_point.x;
            const firstY = this.state.one_click_point.y;
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
        this.addNewImageToParent(this.props.parent.state.last_img_path);
    }

    handleCropCapture() {
        const state = this.state;
        const canvas = this.canvas_ref.current;

        //first remove red lines
        this.redrawImage();

        if (!state.one_click_point || !state.two_click_point) {
            displayErrorDialog("You need to choose two points before cropping.")
        } else {
            const first_point = state.one_click_point;
            const second_point = state.two_click_point;
            const width = Math.abs(first_point.x - second_point.x);
            const height = Math.abs(first_point.y - second_point.y);
            const tmp_canvas = document.createElement("canvas");
            tmp_canvas.width = width;
            tmp_canvas.height = height;

            const ctx = tmp_canvas.getContext('2d');
            ctx.drawImage(canvas,
                Math.min(first_point.x, second_point.x),
                Math.min(first_point.y, second_point.y),
                width,
                height,
                0,
                0,
                width,
                height
            );

            this.addNewImageToParent(tmp_canvas.toDataURL());
        }
    }

    /**
     * Let the parent add a new image to its image container, then change its state so that the
     * cropping area is disabled.
     */
    addNewImageToParent(img_path) {
        this.props.parent.addImage(img_path);
        this.props.parent.setState({ show_cropping_area: false });
    }

    render() {
        return (
            <div>
                <h3>Click two points to crop image or take whole image</h3>
                <canvas ref={this.canvas_ref} onClick={(event) => this.handleAreaSelection(event)}></canvas>
                <div className='button' onClick={() => this.handleWholeImage()}>Take whole image</div>
                <div className='button' onClick={() => this.handleCropCapture()}>Take cropped image</div>
            </div>
        );
    }
}

function LibraryImage(props) {
    return (
        <div className='imageWrapper' onClick={props.click}>
            <img className='image' src={props.src}></img>
        </div>
    );
}

function RImage(props) {
    return (
        <div className='imageWrapper'>
            <img className='image' src={props.src} />
            <div className='button imageDelete' onClick={() => props.remove_func()}></div>
        </div>
    );
}

function ImageStoreButton(props) {
    return <div className='button' onClick={() => props.click()}>
        Upload an image store
    </div>;
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
