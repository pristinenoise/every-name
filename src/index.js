import Generator from './Generator'

export { Generator } // eslint-disable-line import/prefer-default-export

export default function randomFunction() {
	const values = [3, 5];
	return values.map(a => a*a);
}
