// test-setup.js
// imports adapter which allows for compatibility with react 16
// import jest-canvas-mock to allow for canvas support in tests
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-canvas-mock';

configure({ adapter: new Adapter() });