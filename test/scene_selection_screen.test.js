// image_choice_screen.test.js
import React from 'react';
import { shallow, mount } from 'enzyme';
import { SceneSelectionScreen, SceneSelectionContainer, PictureTaker } from '../src/scene_selection_screen/scene_selection_screen';
import renderer from 'react-test-renderer';
import App from '../src/control/app';

describe('Image Choice screen', () => {

    it('test that scene selection renders correctly', ()=>{
        const component = renderer.create(
            <SceneSelectionScreen app={new App()} />,
            document.getElementById('root')
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })

    it('test that scene selection container renders correctly', ()=>{
        const component = renderer.create(
            <SceneSelectionContainer app={new App()} />
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })

    // it('test that PictureTaker renders correctly', ()=>{
    //     const component = renderer.create(
    //         <PictureTaker app={new App()} />
    //     );
    //     let tree = component.toJSON();
    //     expect(tree).toMatchSnapshot();
    // })

    it('test that scene selection container renders PictureTaker when the state is changed', ()=>{        
        let component = shallow( <SceneSelectionContainer app={new App()} />);
        expect(component.find(PictureTaker)).toHaveLength(0);        
        component.instance().setState({showPictureTaker: true});
        component.instance().forceUpdate();
        component = component.update();
        expect(component.find(PictureTaker)).toHaveLength(1);
    })

});