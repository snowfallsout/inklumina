import type { MobileDimensionRow } from './mobile.types';

export const placeholders = ['M', 'B', 'T', 'I'] as const;

export const dimensions = [
	{
		dimension: 0,
		options: [
			{ value: 'E', label: 'Extrovert' },
			{ value: 'I', label: 'Introvert' }
		]
	},
	{
		dimension: 1,
		options: [
			{ value: 'N', label: 'Intuitive' },
			{ value: 'S', label: 'Sensing' }
		]
	},
	{
		dimension: 2,
		options: [
			{ value: 'T', label: 'Thinking' },
			{ value: 'F', label: 'Feeling' }
		]
	},
	{
		dimension: 3,
		options: [
			{ value: 'J', label: 'Judging' },
			{ value: 'P', label: 'Perceiving' }
		]
	}
] satisfies MobileDimensionRow[];
