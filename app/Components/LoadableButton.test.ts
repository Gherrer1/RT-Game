import LoadableButton from './LoadableButton';
import { render, cleanup, waitForElement, fireEvent } from 'react-testing-library';

describe('<LoadableButton />', () => {
	afterEach(cleanup);

	it('should show text props if loading is false', () => {
		throw new Error('unimplemented');
	});
	it('should show loadingText prop if loading is true', () => {
		throw new Error('unimplemented');
	});
	it('should show "Loading" by default if loading is true but no loadingText prop passed', () => {
		throw new Error('unimplemented');
	});
	it('should cycle between these suffixes: . -> .. -> ... -> .', () => {
		throw new Error('unimplemented');
	});
});
