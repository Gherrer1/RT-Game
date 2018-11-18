export function isValidRatingGuess(guess) {
	return (guess === '' || (/^[0-9]+$/.test(guess) && Number(guess) <= 100));
}

export function customArrayValidator(propValue, key, componentName, location, propFullName) {
	if (!isValidRatingGuess(propValue[key])) {
		return new Error(`Invalid prop '${propFullName}' supplied to '${componentName}'. Validation failed.`);
	}
}
