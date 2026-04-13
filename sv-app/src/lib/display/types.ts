export interface DisplayLegendRowSample {
	color: string;
	label: string;
	fillPercent: number;
	count: number;
}

export interface DisplaySampleData {
	header: {
		title: string;
		subtitle: string;
		emotionBadge: string;
		cameraToggleOff: string;
		cameraToggleOn: string;
		handBadge: string;
	};
	legend: {
		title: string;
		rows: DisplayLegendRowSample[];
	};
	hints: {
		interaction: string;
		waiting: string;
	};
	sessionControls: {
		buttonLabel: string;
	};
	footer: {
		participantsLabel: string;
		participantCount: number;
		scanToJoinLabel: string;
		qrHintLines: string[];
	};
	sessionPanel: {
		closeLabel: string;
		title: string;
		newSessionPlaceholder: string;
		newSessionButtonLabel: string;
		ipPlaceholder: string;
		generateQrButtonLabel: string;
		qrHint: string;
		historyTitle: string;
		emptyHistory: string;
	};
}
