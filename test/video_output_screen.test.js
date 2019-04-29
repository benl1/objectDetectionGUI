// image_choice_screen.test.js
import React from 'react';
import { shallow, mount } from 'enzyme';
import VideoOutputScreen from '../src/output_screen/video_output_screen';
import { VideoOutputContainer } from '../src/output_screen/video_output_screen';
import renderer from 'react-test-renderer';
import App from '../src/control/app';

describe('Video output screen', () => {

    it('test that VideoOutputScreen renders correctly', ()=>{
        let component = shallow( <VideoOutputScreen app={new App()}/> );
        expect(component).toMatchSnapshot();
    })

});