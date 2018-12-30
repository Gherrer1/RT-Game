import { isValidRatingGuess } from './validators';

describe('isValidRatingGuess', () => {
	it('should return true if guess is empty string', () => {
		const result = isValidRatingGuess('');
		expect(result).toBe(true);
	});
	it('should return false if guess is > 100', () => {
		const result = isValidRatingGuess('101');
		expect(result).toBe(false);
	});
	it('should return true if guess is a bunch of 0s', () => {
		const result = isValidRatingGuess('000000');
		expect(result).toBe(true);
	});
	it('should return false if guess has a letter in the beginning, middle, or end', () => {
		let result = isValidRatingGuess('a60');
		expect(result).toBe(false);

		result = isValidRatingGuess('6a0');
		expect(result).toBe(false);

		result = isValidRatingGuess('60a');
		expect(result).toBe(false);
	});
});
